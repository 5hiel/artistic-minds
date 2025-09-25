#!/usr/bin/env node

/**
 * Issue Triage Script - Daily Issue Labeling
 *
 * Automatically labels open GitHub issues that don't have labels using intelligent categorization.
 * This ensures all issues have proper labels for organization and tracking.
 *
 * Features:
 * - Labels unlabeled issues automatically
 * - Uses intelligent content analysis for labeling
 * - Ensures all required labels exist in repository
 * - Dry run mode for testing
 * - Comprehensive logging and reporting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GIFTED_MINDS_LABELS, getAllLabels, LABEL_SETS, LABELING_RULES } = require('./label-system');

// Configuration
const CONFIG = {
  // GitHub API settings
  GITHUB_API_BASE: 'https://api.github.com',
  REPO_OWNER: process.env.GITHUB_REPOSITORY?.split('/')[0] || '5hiel',
  REPO_NAME: process.env.GITHUB_REPOSITORY?.split('/')[1] || 'gifted-minds',

  // Processing limits
  MAX_ISSUES_PER_RUN: 50,  // Prevent API rate limiting
  MAX_LABELS_PER_ISSUE: 5, // Keep labels manageable

  // Output settings
  REPORT_FILE: 'issue-triage-report.json',
  LOG_FILE: 'logs/issue-triage.log',

  // API settings
  REQUEST_TIMEOUT: 30000,  // 30 seconds
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT_BUFFER: 100   // Keep 100 requests as buffer
};

// Use the simplified labeling rules from the label system
// No need to redefine - they're imported from LABELING_RULES

class IssueTriageManager {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.startTime = Date.now();
    this.logEntries = [];

    // Validate environment
    if (!this.githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.log('🚀 Issue Triage Manager initialized');
    this.log(`Repository: ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}`);
    this.log(`Dry run mode: ${this.dryRun}`);
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.logEntries.push(logEntry);

    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} ${message}`);

    if (this.verbose && level === 'debug') {
      console.log(`  🔍 ${message}`);
    }
  }

  async makeGitHubRequest(method, endpoint, data = null) {
    const url = `${CONFIG.GITHUB_API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gifted-minds-issue-triage'
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }

    for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        this.log(`Request attempt ${attempt} failed: ${error.message}`, 'warn');

        if (attempt === CONFIG.RETRY_ATTEMPTS) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async ensureLabelsExist() {
    this.log('🏷️ Ensuring all required labels exist...');

    if (this.dryRun) {
      this.log('[DRY RUN] Skipping label creation');
      return;
    }

    try {
      // Get existing labels
      const existingLabels = await this.makeGitHubRequest(
        'GET',
        `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels`
      );

      const existingLabelNames = new Set(existingLabels.map(label => label.name));
      const requiredLabels = getAllLabels();

      // Create missing labels
      const missingLabels = requiredLabels.filter(label =>
        !existingLabelNames.has(label.name)
      );

      if (missingLabels.length === 0) {
        this.log('✅ All labels already exist');
        return;
      }

      this.log(`📝 Creating ${missingLabels.length} missing labels...`);

      for (const label of missingLabels) {
        try {
          await this.makeGitHubRequest(
            'POST',
            `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels`,
            {
              name: label.name,
              color: label.color,
              description: label.description
            }
          );

          this.log(`  ✅ Created label: ${label.name}`);
        } catch (error) {
          this.log(`  ⚠️ Failed to create label ${label.name}: ${error.message}`, 'warn');
        }
      }

      this.log(`✅ Label creation complete`);

    } catch (error) {
      this.log(`❌ Failed to ensure labels exist: ${error.message}`, 'error');
      throw error;
    }
  }

  async getUnlabeledIssues() {
    this.log('🔍 Fetching unlabeled open issues...');

    try {
      // Search for open issues with no labels
      const searchQuery = `repo:${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME} is:issue is:open no:label`;
      const response = await this.makeGitHubRequest(
        'GET',
        `/search/issues?q=${encodeURIComponent(searchQuery)}&per_page=${CONFIG.MAX_ISSUES_PER_RUN}`
      );

      const issues = response.items || [];
      this.log(`Found ${issues.length} unlabeled issues`);

      return issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        url: issue.html_url,
        created_at: issue.created_at,
        user: issue.user.login
      }));

    } catch (error) {
      this.log(`❌ Failed to fetch unlabeled issues: ${error.message}`, 'error');
      throw error;
    }
  }

  analyzeIssueContent(issue) {
    const content = `${issue.title} ${issue.body}`.toLowerCase();

    // Check each keyword rule and apply matching labels
    for (const [keyword, labels] of Object.entries(LABELING_RULES.KEYWORDS)) {
      if (content.includes(keyword)) {
        return {
          labels: labels,
          analysis: {
            matchedKeyword: keyword,
            confidence: 'high'
          }
        };
      }
    }

    // Default: no specific labels found, needs manual review
    return {
      labels: [], // Empty - let human decide
      analysis: {
        matchedKeyword: null,
        confidence: 'low'
      }
    };
  }

  async labelIssue(issueNumber, labels) {
    if (this.dryRun) {
      this.log(`[DRY RUN] Would label issue #${issueNumber} with: ${labels.join(', ')}`);
      return true;
    }

    try {
      await this.makeGitHubRequest(
        'POST',
        `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/issues/${issueNumber}/labels`,
        { labels }
      );

      return true;
    } catch (error) {
      this.log(`❌ Failed to label issue #${issueNumber}: ${error.message}`, 'error');
      return false;
    }
  }

  generateReport(processedIssues, labeledCount, skippedCount) {
    const labelDistribution = {};
    processedIssues.forEach(issue => {
      issue.suggestedLabels.forEach(label => {
        labelDistribution[label] = (labelDistribution[label] || 0) + 1;
      });
    });

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssuesFound: processedIssues.length,
        issuesLabeled: labeledCount,
        issuesSkipped: skippedCount,
        executionTime: Date.now() - this.startTime
      },
      labelDistribution,
      processedIssues: processedIssues.map(issue => ({
        number: issue.number,
        title: issue.title,
        url: issue.url,
        suggestedLabels: issue.suggestedLabels,
        labeled: issue.labeled
      })),
      logEntries: this.logEntries
    };
  }

  async saveReport(report) {
    const reportPath = CONFIG.REPORT_FILE;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Report saved to ${reportPath}`);

    // Save logs if configured
    if (CONFIG.LOG_FILE) {
      const logDir = path.dirname(CONFIG.LOG_FILE);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logContent = report.logEntries
        .map(entry => `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`)
        .join('\n');

      fs.writeFileSync(CONFIG.LOG_FILE, logContent);
      this.log(`📝 Logs saved to ${CONFIG.LOG_FILE}`);
    }
  }

  async run() {
    this.log('🚀 Starting daily issue triage...');

    try {
      // Step 1: Ensure all labels exist
      await this.ensureLabelsExist();

      // Step 2: Get unlabeled issues
      const unlabeledIssues = await this.getUnlabeledIssues();

      if (unlabeledIssues.length === 0) {
        this.log('✅ No unlabeled issues found');
        const report = this.generateReport([], 0, 0);
        await this.saveReport(report);
        return report;
      }

      // Step 3: Process each issue
      this.log(`🔄 Processing ${unlabeledIssues.length} unlabeled issues...`);
      const processedIssues = [];
      let labeledCount = 0;
      let skippedCount = 0;

      for (const issue of unlabeledIssues) {
        this.log(`📝 Processing issue #${issue.number}: "${issue.title}"`);

        // Analyze content and suggest labels
        const analysis = this.analyzeIssueContent(issue);

        if (analysis.labels.length === 0) {
          this.log(`  ⚠️ No labels suggested for #${issue.number}`, 'warn');
          skippedCount++;
          continue;
        }

        this.log(`  🏷️ Suggested labels: ${analysis.labels.join(', ')}`);

        // Apply labels
        const labeled = await this.labelIssue(issue.number, analysis.labels);

        if (labeled) {
          this.log(`  ✅ Successfully labeled issue #${issue.number}`);
          labeledCount++;
        } else {
          skippedCount++;
        }

        processedIssues.push({
          ...issue,
          suggestedLabels: analysis.labels,
          labeled,
          analysis: analysis.analysis
        });
      }

      // Step 4: Generate and save report
      const report = this.generateReport(processedIssues, labeledCount, skippedCount);
      await this.saveReport(report);

      // Step 5: Summary
      this.log('📊 Issue Triage Summary:');
      this.log(`  Total unlabeled issues found: ${unlabeledIssues.length}`);
      this.log(`  Issues successfully labeled: ${labeledCount}`);
      this.log(`  Issues skipped: ${skippedCount}`);
      this.log(`  Execution time: ${(Date.now() - this.startTime) / 1000}s`);

      return report;

    } catch (error) {
      this.log(`❌ Fatal error during issue triage: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };

  const manager = new IssueTriageManager(options);

  manager.run()
    .then(report => {
      console.log('✅ Issue triage completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Issue triage failed:', error.message);
      process.exit(1);
    });
}

module.exports = IssueTriageManager;