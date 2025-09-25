#!/usr/bin/env node

/**
 * App Store Reviews Fetcher
 * Fetches customer reviews from App Store Connect API and processes them for GitHub issue creation
 *
 * Usage:
 *   node fetch-reviews.js --days=7 --min-rating=1 --max-rating=5 --dry-run
 *   node fetch-reviews.js --since=2025-01-01 --output=reviews.json
 */

const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  // App Store Connect API
  BASE_URL: 'api.appstoreconnect.apple.com',
  API_VERSION: 'v1',

  // Rate limiting
  REQUESTS_PER_MINUTE: 180, // App Store Connect API limit
  REQUEST_DELAY: 334, // ~180 requests per minute

  // Pagination
  DEFAULT_LIMIT: 200,
  MAX_LIMIT: 200,

  // File paths
  DEDUPLICATION_STORE: path.join(__dirname, 'deduplication-store.json'),
  CONFIG_FILE: path.join(__dirname, 'feedback-config.env')
};

// Label mapping for review categorization
const LABEL_CATEGORIES = {
  RATING: {
    1: ['rating-1-star', 'critical-feedback'],
    2: ['rating-2-star', 'critical-feedback'],
    3: ['rating-3-star'],
    4: ['rating-4-star'],
    5: ['rating-5-star']
  },

  CONTENT_KEYWORDS: {
    'bug-report': ['crash', 'freeze', 'stuck', 'broken', 'error', 'bug', 'glitch', 'not working'],
    'feature-request': ['add', 'wish', 'want', 'would like', 'suggestion', 'improve', 'enhancement'],
    'ui-ux-feedback': ['interface', 'design', 'ugly', 'confusing', 'hard to use', 'layout'],
    'performance-issue': ['slow', 'lag', 'battery', 'drain', 'loading', 'performance'],
    'difficulty-feedback': ['too easy', 'too hard', 'difficult', 'challenging', 'simple'],
    'accessibility': ['blind', 'deaf', 'disability', 'accessibility', 'vision', 'hearing'],
    'puzzle-generation': ['puzzle', 'same puzzle', 'repetitive', 'variety'],
    'power-surge-system': ['timer', 'countdown', 'power surge', 'scoring', 'points'],
    'adaptive-learning': ['difficulty', 'adaptive', 'learning', 'progression'],
    'level-progression': ['level', 'unlock', 'progress', 'advancement'],
    'scoring-system': ['score', 'points', 'high score', 'leaderboard']
  }
};

class AppStoreReviewsFetcher {
  constructor(options = {}) {
    this.issuerId = options.issuerId || process.env.APP_STORE_CONNECT_ISSUER_ID;
    this.keyId = options.keyId || process.env.APP_STORE_CONNECT_KEY_ID;
    this.appId = options.appId || process.env.APP_STORE_APP_ID;
    this.keyPath = options.keyPath || process.env.APP_STORE_CONNECT_PRIVATE_KEY_PATH;

    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;

    // Load existing processed reviews
    this.processedReviews = this.loadProcessedReviews();

    this.validateConfig();
  }

  validateConfig() {
    const required = ['issuerId', 'keyId', 'appId', 'keyPath'];
    const missing = required.filter(key => !this[key]);

    if (missing.length > 0) {
      console.error('❌ Missing required configuration:');
      missing.forEach(key => console.error(`  - ${key.toUpperCase()}`));
      console.error('\nSet environment variables or pass as options');
      process.exit(1);
    }

    if (!fs.existsSync(this.keyPath)) {
      console.error(`❌ Private key file not found: ${this.keyPath}`);
      process.exit(1);
    }
  }

  loadProcessedReviews() {
    try {
      if (fs.existsSync(CONFIG.DEDUPLICATION_STORE)) {
        const data = fs.readFileSync(CONFIG.DEDUPLICATION_STORE, 'utf8');
        const parsed = JSON.parse(data);
        return {
          reviewIds: new Set(parsed.reviewIds || []),
          contentHashes: new Set(parsed.contentHashes || [])
        };
      }
    } catch (error) {
      console.warn('⚠️ Could not load deduplication store:', error.message);
    }
    return { reviewIds: new Set(), contentHashes: new Set() };
  }

  saveProcessedReviews() {
    try {
      const data = {
        reviewIds: Array.from(this.processedReviews.reviewIds),
        contentHashes: Array.from(this.processedReviews.contentHashes),
        lastUpdated: new Date().toISOString()
      };

      if (!this.dryRun) {
        fs.writeFileSync(CONFIG.DEDUPLICATION_STORE, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('❌ Failed to save deduplication store:', error.message);
    }
  }

  generateJWT() {
    const privateKey = fs.readFileSync(this.keyPath, 'utf8');

    return jwt.sign({}, privateKey, {
      issuer: this.issuerId,
      keyid: this.keyId,
      audience: 'appstoreconnect-v1',
      algorithm: 'ES256',
      expiresIn: '20m'
    });
  }

  async makeAPIRequest(path, params = {}) {
    const token = this.generateJWT();
    const queryString = new URLSearchParams(params).toString();
    const fullPath = `/${CONFIG.API_VERSION}${path}${queryString ? `?${queryString}` : ''}`;

    const options = {
      hostname: CONFIG.BASE_URL,
      path: fullPath,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (response.errors) {
              reject(new Error(`API Error: ${response.errors[0].detail}`));
              return;
            }

            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse API response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  categorizeReview(review) {
    const content = `${review.attributes.title || ''} ${review.attributes.body || ''}`.toLowerCase();
    const rating = review.attributes.rating;

    const labels = ['auto-generated', 'user-feedback'];

    // Add rating-based labels
    if (LABEL_CATEGORIES.RATING[rating]) {
      labels.push(...LABEL_CATEGORIES.RATING[rating]);
    }

    // Add content-based labels
    for (const [label, keywords] of Object.entries(LABEL_CATEGORIES.CONTENT_KEYWORDS)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        labels.push(label);
      }
    }

    // Add platform-specific labels (if available in review metadata)
    // App Store Connect API doesn't provide platform info directly

    return [...new Set(labels)]; // Remove duplicates
  }

  generateContentHash(review) {
    const content = `${review.attributes.title || ''} ${review.attributes.body || ''}`;
    return crypto.createHash('md5').update(content.toLowerCase().trim()).digest('hex');
  }

  isDuplicate(review) {
    const reviewId = review.id;
    const contentHash = this.generateContentHash(review);

    if (this.processedReviews.reviewIds.has(reviewId)) {
      return { type: 'exact', reason: 'Same review ID' };
    }

    if (this.processedReviews.contentHashes.has(contentHash)) {
      return { type: 'similar', reason: 'Similar content' };
    }

    return false;
  }

  markAsProcessed(review) {
    this.processedReviews.reviewIds.add(review.id);
    this.processedReviews.contentHashes.add(this.generateContentHash(review));
  }

  formatReviewForIssue(review) {
    const attrs = review.attributes;
    const labels = this.categorizeReview(review);

    return {
      id: review.id,
      title: `App Store Review: ${attrs.rating}★ - ${attrs.title || 'No title'}`,
      body: this.generateIssueBody(review),
      labels: labels,
      metadata: {
        rating: attrs.rating,
        reviewerNickname: attrs.reviewerNickname,
        territory: attrs.territory,
        storefront: attrs.storefront,
        createdDate: attrs.createdDate,
        version: attrs.version
      }
    };
  }

  generateIssueBody(review) {
    const attrs = review.attributes;

    return `## App Store Review

**Rating:** ${'⭐'.repeat(attrs.rating)}${'☆'.repeat(5 - attrs.rating)} (${attrs.rating}/5)
**Date:** ${new Date(attrs.createdDate).toLocaleDateString()}
**Version:** ${attrs.version || 'Not specified'}
**Territory:** ${attrs.territory || 'Unknown'}
${attrs.reviewerNickname ? `**Reviewer:** ${attrs.reviewerNickname}` : ''}

### Review Title
${attrs.title || '_No title provided_'}

### Review Content
${attrs.body || '_No content provided_'}

---

**Review ID:** \`${review.id}\`
**Storefront:** ${attrs.storefront || 'Unknown'}

> This issue was automatically created from App Store feedback. Consider responding to the review through App Store Connect if appropriate.`;
  }

  async fetchAllReviews(filters = {}) {
    console.log('🔍 Fetching App Store reviews...');

    const allReviews = [];
    let nextUrl = null;
    let pageCount = 0;

    const params = {
      'limit': CONFIG.DEFAULT_LIMIT,
      'sort': '-createdDate', // Most recent first
      ...filters
    };

    do {
      try {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}...`);

        let response;
        if (nextUrl) {
          // Extract path and query from next URL
          const url = new URL(nextUrl, `https://${CONFIG.BASE_URL}`);
          response = await this.makeAPIRequest(url.pathname, Object.fromEntries(url.searchParams));
        } else {
          response = await this.makeAPIRequest(`/apps/${this.appId}/customerReviews`, params);
        }

        const reviews = response.data || [];
        console.log(`  Found ${reviews.length} reviews on this page`);

        // Process each review
        for (const review of reviews) {
          const duplicate = this.isDuplicate(review);

          if (duplicate) {
            if (this.verbose) {
              console.log(`  ⏭️ Skipping duplicate review: ${review.id} (${duplicate.reason})`);
            }
            continue;
          }

          const formattedReview = this.formatReviewForIssue(review);
          allReviews.push(formattedReview);

          if (!this.dryRun) {
            this.markAsProcessed(review);
          }

          if (this.verbose) {
            console.log(`  ✅ Processed review: ${review.id} (${formattedReview.labels.join(', ')})`);
          }
        }

        // Check for next page
        nextUrl = response.links?.next || null;

        // Rate limiting
        if (nextUrl) {
          await this.sleep(CONFIG.REQUEST_DELAY);
        }

      } catch (error) {
        console.error(`❌ Error fetching page ${pageCount}:`, error.message);
        break;
      }

    } while (nextUrl && allReviews.length < 1000); // Safety limit

    console.log(`\n📊 Processing complete:`);
    console.log(`  Total reviews found: ${allReviews.length}`);
    console.log(`  Pages processed: ${pageCount}`);

    return allReviews;
  }

  async run(options = {}) {
    try {
      console.log('🚀 Starting App Store reviews fetch...');
      console.log(`App ID: ${this.appId}`);
      console.log(`Dry run: ${this.dryRun ? 'Yes' : 'No'}`);
      console.log('');

      // Build API filters
      const filters = {};

      if (options.minRating) {
        // App Store Connect API doesn't support rating filtering directly
        // We'll filter after fetching
      }

      if (options.since) {
        // Note: App Store Connect API doesn't support date filtering directly
        // We'll need to fetch and filter, or use pagination to stop at older dates
      }

      const reviews = await this.fetchAllReviews(filters);

      // Apply post-fetch filtering
      let filteredReviews = reviews;

      if (options.minRating) {
        filteredReviews = filteredReviews.filter(review =>
          review.metadata.rating >= options.minRating
        );
        console.log(`  Filtered by min rating (${options.minRating}+): ${filteredReviews.length} reviews`);
      }

      if (options.maxRating) {
        filteredReviews = filteredReviews.filter(review =>
          review.metadata.rating <= options.maxRating
        );
        console.log(`  Filtered by max rating (${options.maxRating}-): ${filteredReviews.length} reviews`);
      }

      if (options.since) {
        const sinceDate = new Date(options.since);
        filteredReviews = filteredReviews.filter(review =>
          new Date(review.metadata.createdDate) >= sinceDate
        );
        console.log(`  Filtered by date (since ${options.since}): ${filteredReviews.length} reviews`);
      }

      // Output results
      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.writeFileSync(outputPath, JSON.stringify(filteredReviews, null, 2));
        console.log(`\n💾 Reviews saved to: ${outputPath}`);
      }

      // Save deduplication data
      this.saveProcessedReviews();

      // Summary
      console.log('\n📈 Summary:');
      const ratingDistribution = {};
      const labelDistribution = {};

      filteredReviews.forEach(review => {
        const rating = review.metadata.rating;
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;

        review.labels.forEach(label => {
          labelDistribution[label] = (labelDistribution[label] || 0) + 1;
        });
      });

      console.log('\nRating Distribution:');
      for (let i = 1; i <= 5; i++) {
        const count = ratingDistribution[i] || 0;
        const stars = '⭐'.repeat(i);
        console.log(`  ${stars}: ${count} reviews`);
      }

      console.log('\nTop Labels:');
      const sortedLabels = Object.entries(labelDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      sortedLabels.forEach(([label, count]) => {
        console.log(`  ${label}: ${count}`);
      });

      return filteredReviews;

    } catch (error) {
      console.error('❌ Failed to fetch reviews:', error.message);
      process.exit(1);
    }
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');

      switch(key) {
        case 'days':
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - parseInt(value));
          options.since = daysAgo.toISOString().split('T')[0];
          break;

        case 'since':
          options.since = value;
          break;

        case 'min-rating':
          options.minRating = parseInt(value);
          break;

        case 'max-rating':
          options.maxRating = parseInt(value);
          break;

        case 'output':
          options.output = value;
          break;

        case 'dry-run':
          options.dryRun = true;
          break;

        case 'verbose':
          options.verbose = true;
          break;

        default:
          console.warn(`Unknown option: --${key}`);
      }
    }
  });

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
App Store Reviews Fetcher

Usage: node fetch-reviews.js [options]

Options:
  --days=N              Fetch reviews from last N days
  --since=YYYY-MM-DD    Fetch reviews since specific date
  --min-rating=N        Minimum rating (1-5)
  --max-rating=N        Maximum rating (1-5)
  --output=FILE         Save reviews to JSON file
  --dry-run             Don't save deduplication data
  --verbose             Show detailed processing info
  --help                Show this help

Environment Variables:
  APP_STORE_CONNECT_ISSUER_ID       App Store Connect Issuer ID
  APP_STORE_CONNECT_KEY_ID          App Store Connect Key ID
  APP_STORE_APP_ID                  App Store App ID
  APP_STORE_CONNECT_PRIVATE_KEY_PATH Path to .p8 private key file

Examples:
  node fetch-reviews.js --days=7 --min-rating=3
  node fetch-reviews.js --since=2025-01-01 --output=reviews.json
  node fetch-reviews.js --dry-run --verbose
`);
    process.exit(0);
  }

  // Run fetcher
  const fetcher = new AppStoreReviewsFetcher(options);
  fetcher.run(options);
}

module.exports = AppStoreReviewsFetcher;