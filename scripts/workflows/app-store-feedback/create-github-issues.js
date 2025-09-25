#!/usr/bin/env node

/**
 * GitHub Issues Creator for App Store Reviews
 * Creates GitHub issues from App Store review data with smart deduplication and labeling
 *
 * Usage:
 *   node create-github-issues.js reviews.json --dry-run
 *   node create-github-issues.js --stdin --template=bug-report
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  GITHUB_API_URL: 'api.github.com',
  MAX_TITLE_LENGTH: 80,
  MAX_BODY_LENGTH: 65536,
  REQUEST_DELAY: 100, // GitHub API rate limiting
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,

  // Issue templates
  TEMPLATES: {
    'default': 'standard',
    'bug-report': 'bug',
    'feature-request': 'feature',
    'critical': 'urgent'
  }
};

// Extended label system matching our comprehensive design
const LABEL_SYSTEM = {
  // Ensure these labels exist in the repository
  REQUIRED_LABELS: [
    // Rating-based
    'rating-1-star', 'rating-2-star', 'rating-3-star', 'rating-4-star', 'rating-5-star',
    'critical-feedback',

    // Content-based
    'bug-report', 'feature-request', 'ui-ux-feedback', 'performance-issue',
    'difficulty-feedback', 'accessibility',

    // Game-specific
    'puzzle-generation', 'power-surge-system', 'adaptive-learning',
    'level-progression', 'scoring-system',

    // Technical
    'ios-specific', 'android-specific', 'web-version', 'crashes',

    // Process
    'auto-generated', 'user-feedback', 'needs-developer-response',
    'quick-win', 'investigate',

    // Regional
    'international',

    // Sentiment
    'sentiment-positive', 'sentiment-negative'
  ],

  // Label colors (GitHub format)
  COLORS: {
    'rating-1-star': 'd73a4a',
    'rating-2-star': 'e99695',
    'rating-3-star': 'fbca04',
    'rating-4-star': '0e8a16',
    'rating-5-star': '0e8a16',
    'critical-feedback': 'd73a4a',
    'bug-report': 'd73a4a',
    'feature-request': '0075ca',
    'ui-ux-feedback': '7057ff',
    'performance-issue': 'f9d0c4',
    'difficulty-feedback': 'c2e0c6',
    'accessibility': 'f9c513',
    'puzzle-generation': 'bfd4f2',
    'power-surge-system': 'bfd4f2',
    'adaptive-learning': 'bfd4f2',
    'level-progression': 'bfd4f2',
    'scoring-system': 'bfd4f2',
    'auto-generated': '6f42c1',
    'user-feedback': '0075ca',
    'needs-developer-response': 'fbca04',
    'quick-win': '0e8a16',
    'investigate': 'e99695',
    'ios-specific': 'bfd4f2',
    'android-specific': '28a745',
    'web-version': 'ffc107',
    'crashes': 'd73a4a',
    'international': 'c5def5',
    'sentiment-positive': '0e8a16',
    'sentiment-negative': 'd73a4a'
  }
};

class GitHubIssuesCreator {
  constructor(options = {}) {
    this.owner = options.owner || this.extractRepoInfo().owner;
    this.repo = options.repo || this.extractRepoInfo().repo;
    this.token = options.token || process.env.GITHUB_TOKEN || process.env.CLAUDE_CODE_OAUTH_TOKEN;

    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.template = options.template || 'default';

    this.validateConfig();
    this.requestCount = 0;
    this.startTime = Date.now();
  }

  validateConfig() {
    if (!this.owner || !this.repo) {
      console.error('❌ Could not determine GitHub repository. Ensure you\'re in a git repository with GitHub remote.');
      process.exit(1);
    }

    if (!this.token && !this.dryRun) {
      console.error('❌ GitHub token required. Set GITHUB_TOKEN or CLAUDE_CODE_OAUTH_TOKEN environment variable.');
      process.exit(1);
    }

    if (this.dryRun && !this.token) {
      console.log('⚠️ Running in dry-run mode without GitHub token');
    }

    console.log(`📁 Repository: ${this.owner}/${this.repo}`);
  }

  extractRepoInfo() {
    try {
      // Try to extract from git remote
      const { execSync } = require('child_process');
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();

      const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch (error) {
      // Fallback or manual specification required
    }

    return { owner: null, repo: null };
  }

  async makeGitHubRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: CONFIG.GITHUB_API_URL,
        path: path,
        method: method,
        headers: {
          'Authorization': `token ${this.token}`,
          'User-Agent': 'App-Store-Feedback-Bot/1.0',
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};

            if (res.statusCode >= 400) {
              reject(new Error(`GitHub API Error ${res.statusCode}: ${parsed.message || 'Unknown error'}`));
              return;
            }

            resolve({
              data: parsed,
              status: res.statusCode,
              headers: res.headers
            });
          } catch (error) {
            reject(new Error(`Failed to parse GitHub API response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('GitHub API request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });

    this.requestCount++;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryRequest(requestFn, attempts = CONFIG.RETRY_ATTEMPTS) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === attempts - 1) throw error;

        console.warn(`⚠️ Request failed (attempt ${i + 1}/${attempts}): ${error.message}`);
        await this.sleep(CONFIG.RETRY_DELAY * (i + 1));
      }
    }
  }

  async ensureLabelsExist() {
    console.log('🏷️ Ensuring required labels exist...');

    if (this.dryRun) {
      console.log('  [DRY RUN] Skipping label creation - would create these labels:');
      LABEL_SYSTEM.REQUIRED_LABELS.forEach(label => {
        console.log(`    - ${label} (${LABEL_SYSTEM.COLORS[label] || '0075ca'})`);
      });
      return;
    }

    try {
      // Get existing labels
      const response = await this.makeGitHubRequest('GET', `/repos/${this.owner}/${this.repo}/labels`);
      const existingLabels = new Set(response.data.map(label => label.name));

      // Create missing labels
      const missingLabels = LABEL_SYSTEM.REQUIRED_LABELS.filter(label =>
        !existingLabels.has(label)
      );

      if (missingLabels.length === 0) {
        console.log('  ✅ All labels already exist');
        return;
      }

      console.log(`  📝 Creating ${missingLabels.length} missing labels...`);

      for (const labelName of missingLabels) {
        try {
          await this.retryRequest(() =>
            this.makeGitHubRequest('POST', `/repos/${this.owner}/${this.repo}/labels`, {
              name: labelName,
              color: LABEL_SYSTEM.COLORS[labelName] || '0075ca',
              description: this.generateLabelDescription(labelName)
            })
          );

          console.log(`    ✅ Created label: ${labelName}`);
          await this.sleep(CONFIG.REQUEST_DELAY);

        } catch (error) {
          console.warn(`    ⚠️ Failed to create label ${labelName}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('❌ Failed to ensure labels exist:', error.message);
      throw error;
    }
  }

  generateLabelDescription(labelName) {
    const descriptions = {
      'rating-1-star': 'App Store review with 1 star rating',
      'rating-2-star': 'App Store review with 2 star rating',
      'rating-3-star': 'App Store review with 3 star rating',
      'rating-4-star': 'App Store review with 4 star rating',
      'rating-5-star': 'App Store review with 5 star rating',
      'critical-feedback': 'Critical user feedback requiring immediate attention',
      'bug-report': 'Bug reports from user feedback',
      'feature-request': 'Feature requests from user feedback',
      'ui-ux-feedback': 'User interface and experience feedback',
      'performance-issue': 'Performance and optimization issues',
      'difficulty-feedback': 'Game difficulty and progression feedback',
      'accessibility': 'Accessibility-related feedback',
      'puzzle-generation': 'Feedback about puzzle generation system',
      'power-surge-system': 'Feedback about power surge scoring mechanics',
      'adaptive-learning': 'Feedback about adaptive difficulty system',
      'level-progression': 'Feedback about level progression system',
      'scoring-system': 'Feedback about scoring mechanics',
      'auto-generated': 'Automatically generated from App Store reviews',
      'user-feedback': 'General user feedback from App Store',
      'needs-developer-response': 'Requires developer response on App Store',
      'quick-win': 'Quick fixes that could improve user satisfaction',
      'investigate': 'Requires further investigation',
      'ios-specific': 'iOS platform-specific issues',
      'android-specific': 'Android platform-specific issues',
      'web-version': 'Web version-specific issues',
      'crashes': 'App crashes and stability issues',
      'international': 'International/non-English feedback',
      'sentiment-positive': 'Positive user sentiment',
      'sentiment-negative': 'Negative user sentiment'
    };

    return descriptions[labelName] || `App Store feedback: ${labelName}`;
  }

  sanitizeTitle(title) {
    // Remove/replace problematic characters
    let sanitized = title
      .replace(/[^\w\s\-\.,:!?\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Truncate if too long
    if (sanitized.length > CONFIG.MAX_TITLE_LENGTH) {
      sanitized = sanitized.substring(0, CONFIG.MAX_TITLE_LENGTH - 3) + '...';
    }

    return sanitized;
  }

  sanitizeBody(body) {
    // GitHub has a 65536 character limit for issue bodies
    if (body.length > CONFIG.MAX_BODY_LENGTH) {
      return body.substring(0, CONFIG.MAX_BODY_LENGTH - 100) + '\n\n... (content truncated)';
    }
    return body;
  }

  enhanceIssueBody(review) {
    // Add additional analysis and enhancement to the issue body
    let body = review.body;

    // Add sentiment analysis
    const sentiment = this.analyzeSentiment(review);
    if (sentiment !== 'neutral') {
      body += `\n\n### Sentiment Analysis\n**Detected Sentiment:** ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}`;
    }

    // Add suggested actions for critical reviews
    if (review.labels.includes('critical-feedback')) {
      body += `\n\n### Suggested Actions\n`;
      body += `- [ ] Investigate reported issue\n`;
      body += `- [ ] Consider responding to review on App Store Connect\n`;
      body += `- [ ] Monitor for similar feedback patterns\n`;

      if (review.labels.includes('bug-report')) {
        body += `- [ ] Reproduce bug in testing environment\n`;
        body += `- [ ] Create fix and test thoroughly\n`;
      }
    }

    // Add related labels explanation
    if (review.labels.length > 3) {
      body += `\n\n### Auto-Generated Labels\n`;
      body += `This issue was automatically categorized with the following labels based on content analysis:\n`;
      const nonStandardLabels = review.labels.filter(label =>
        !['auto-generated', 'user-feedback'].includes(label)
      );
      body += nonStandardLabels.map(label => `- \`${label}\``).join('\n');
    }

    return body;
  }

  analyzeSentiment(review) {
    const content = `${review.title} ${review.body}`.toLowerCase();

    const positiveWords = ['great', 'awesome', 'love', 'fantastic', 'excellent', 'amazing', 'perfect', 'wonderful', 'brilliant', 'best'];
    const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'broken', 'useless', 'waste', 'frustrating', 'annoying'];

    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }

  async checkExistingIssue(review) {
    // Skip duplicate checking in dry-run mode
    if (this.dryRun) {
      return null;
    }

    // Check if an issue already exists for this review
    try {
      const searchQuery = `repo:${this.owner}/${this.repo} in:body "${review.id}" type:issue`;
      const response = await this.makeGitHubRequest('GET', `/search/issues?q=${encodeURIComponent(searchQuery)}`);

      if (response.data.total_count > 0) {
        return response.data.items[0];
      }
    } catch (error) {
      console.warn(`⚠️ Could not check for existing issue: ${error.message}`);
    }

    return null;
  }

  async createIssue(review) {
    try {
      // Check for existing issue
      const existingIssue = await this.checkExistingIssue(review);
      if (existingIssue) {
        console.log(`  ⏭️ Issue already exists: #${existingIssue.number} for review ${review.id}`);
        return existingIssue;
      }

      // Enhance the issue
      const enhancedReview = {
        ...review,
        title: this.sanitizeTitle(review.title),
        body: this.sanitizeBody(this.enhanceIssueBody(review))
      };

      // Add sentiment labels
      const sentiment = this.analyzeSentiment(review);
      if (sentiment !== 'neutral') {
        enhancedReview.labels.push(`sentiment-${sentiment}`);
      }

      if (this.dryRun) {
        console.log(`  [DRY RUN] Would create issue:`);
        console.log(`    Title: ${enhancedReview.title}`);
        console.log(`    Labels: ${enhancedReview.labels.join(', ')}`);
        console.log(`    Body length: ${enhancedReview.body.length} characters`);
        return { number: 'DRY-RUN', html_url: 'dry-run-url' };
      }

      const issueData = {
        title: enhancedReview.title,
        body: enhancedReview.body,
        labels: enhancedReview.labels
      };

      const response = await this.retryRequest(() =>
        this.makeGitHubRequest('POST', `/repos/${this.owner}/${this.repo}/issues`, issueData)
      );

      console.log(`  ✅ Created issue #${response.data.number}: ${enhancedReview.title}`);

      // Rate limiting
      await this.sleep(CONFIG.REQUEST_DELAY);

      return response.data;

    } catch (error) {
      console.error(`  ❌ Failed to create issue for review ${review.id}: ${error.message}`);
      throw error;
    }
  }

  async createIssuesFromReviews(reviews) {
    console.log(`🎫 Creating GitHub issues from ${reviews.length} reviews...`);

    const results = {
      created: 0,
      skipped: 0,
      errors: 0,
      issues: []
    };

    for (const [index, review] of reviews.entries()) {
      try {
        console.log(`\n📝 Processing review ${index + 1}/${reviews.length}: ${review.id}`);

        const issue = await this.createIssue(review);
        results.issues.push({
          review_id: review.id,
          issue_number: issue.number,
          issue_url: issue.html_url,
          title: review.title,
          labels: review.labels
        });

        results.created++;

      } catch (error) {
        console.error(`❌ Error processing review ${review.id}:`, error.message);
        results.errors++;
      }
    }

    return results;
  }

  async run(reviewsFile, options = {}) {
    try {
      console.log('🚀 Starting GitHub issues creation...');
      console.log(`Repository: ${this.owner}/${this.repo}`);
      console.log(`Dry run: ${this.dryRun ? 'Yes' : 'No'}`);
      console.log('');

      // Load reviews
      let reviews;
      if (reviewsFile === '--stdin') {
        const stdin = process.stdin;
        let data = '';
        for await (const chunk of stdin) {
          data += chunk;
        }
        reviews = JSON.parse(data);
      } else {
        if (!fs.existsSync(reviewsFile)) {
          throw new Error(`Reviews file not found: ${reviewsFile}`);
        }
        reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
      }

      if (!Array.isArray(reviews) || reviews.length === 0) {
        console.log('📭 No reviews to process.');
        return;
      }

      console.log(`📊 Loaded ${reviews.length} reviews`);

      // Ensure labels exist
      await this.ensureLabelsExist();

      // Create issues
      const results = await this.createIssuesFromReviews(reviews);

      // Summary
      console.log('\n📈 Summary:');
      console.log(`  Issues created: ${results.created}`);
      console.log(`  Issues skipped: ${results.skipped}`);
      console.log(`  Errors: ${results.errors}`);
      console.log(`  Total requests: ${this.requestCount}`);
      console.log(`  Duration: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);

      if (results.created > 0) {
        console.log('\n🔗 Created Issues:');
        results.issues
          .filter(issue => issue.issue_number !== 'DRY-RUN')
          .forEach(issue => {
            console.log(`  #${issue.issue_number}: ${issue.title}`);
            console.log(`    ${issue.issue_url}`);
          });
      }

      return results;

    } catch (error) {
      console.error('❌ Failed to create GitHub issues:', error.message);
      process.exit(1);
    }
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
GitHub Issues Creator for App Store Reviews

Usage: node create-github-issues.js <reviews-file> [options]
       node create-github-issues.js --stdin [options]

Arguments:
  reviews-file          JSON file with reviews from fetch-reviews.js
  --stdin              Read reviews from stdin

Options:
  --dry-run            Don't actually create issues
  --verbose            Show detailed processing info
  --template=TYPE      Issue template type (default, bug-report, feature-request, critical)
  --help               Show this help

Environment Variables:
  GITHUB_TOKEN                 GitHub personal access token
  CLAUDE_CODE_OAUTH_TOKEN      Claude Code OAuth token (alternative)

Examples:
  node create-github-issues.js reviews.json
  node create-github-issues.js reviews.json --dry-run
  cat reviews.json | node create-github-issues.js --stdin --verbose
`);
    process.exit(0);
  }

  const options = {};
  let reviewsFile = args[0];

  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');

      switch(key) {
        case 'dry-run':
          options.dryRun = true;
          break;

        case 'verbose':
          options.verbose = true;
          break;

        case 'template':
          options.template = value || 'default';
          break;

        case 'stdin':
          reviewsFile = '--stdin';
          break;

        default:
          console.warn(`Unknown option: --${key}`);
      }
    }
  });

  // Run creator
  const creator = new GitHubIssuesCreator(options);
  creator.run(reviewsFile, options);
}

module.exports = GitHubIssuesCreator;