#!/usr/bin/env node

/**
 * Daily Test Coverage Analysis and GitHub Issue Creation
 * Analyzes test coverage for lib folder and creates GitHub issues for files needing improvement
 *
 * Usage:
 *   node analyze-coverage.js --dry-run --verbose
 *   node analyze-coverage.js --min-coverage=60 --create-issues
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { LABEL_SETS } = require('../issue-triage/label-system');

// Configuration
const CONFIG = {
  // Coverage thresholds
  MIN_LINE_COVERAGE: 70,
  MIN_FUNCTION_COVERAGE: 60,
  MIN_BRANCH_COVERAGE: 50,

  // Issue creation settings
  MAX_ISSUES_PER_RUN: 5, // Prevent spam - max 5 issues per run
  MAX_OPEN_ISSUES: 5, // Never have more than 5 open coverage issues in GitHub
  ISSUE_LABELS: LABEL_SETS.TEST_COVERAGE, // Simple: testing + normal

  // File patterns
  LIB_FOLDER: 'lib',
  TEST_FOLDER: '__tests__',
  COVERAGE_FILE: 'coverage/lcov.info',

  // Output
  REPORT_FILE: 'coverage-analysis-report.json',
  LOG_FILE: 'logs/coverage-analysis.log'
};

// Priority levels and thresholds
const PRIORITY_LEVELS = {
  CRITICAL: { threshold: 10, color: '🔴', label: 'critical-coverage' },
  HIGH: { threshold: 30, color: '🟠', label: 'high-priority' },
  MEDIUM: { threshold: 60, color: '🟡', label: 'medium-priority' },
  LOW: { threshold: 80, color: '🟢', label: 'low-priority' }
};

class CoverageAnalyzer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.minCoverage = options.minCoverage || CONFIG.MIN_LINE_COVERAGE;
    this.createIssues = options.createIssues !== false; // Default true
    this.maxIssues = options.maxIssues || CONFIG.MAX_ISSUES_PER_RUN;

    this.githubToken = process.env.GITHUB_TOKEN || process.env.CLAUDE_CODE_OAUTH_TOKEN;
    this.repo = this.getRepoInfo();

    this.startTime = Date.now();
    this.logEntries = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.logEntries.push(logEntry);

    if (this.verbose || level === 'error') {
      const emoji = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' }[level] || 'ℹ️';
      console.log(`${emoji} ${message}`);
    }
  }

  getRepoInfo() {
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch (error) {
      this.log(`Failed to get repo info: ${error.message}`, 'error');
    }
    return null;
  }

  async runTestsAndGenerateCoverage() {
    this.log('Running tests and generating coverage report...');

    try {
      // Run tests with coverage
      execSync('npm run test:ci -- --coverage', {
        stdio: this.verbose ? 'inherit' : 'pipe',
        timeout: 300000 // 5 minutes
      });

      if (!fs.existsSync(CONFIG.COVERAGE_FILE)) {
        throw new Error(`Coverage file not found: ${CONFIG.COVERAGE_FILE}`);
      }

      this.log('Coverage report generated successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to generate coverage: ${error.message}`, 'error');
      return false;
    }
  }

  parseCoverageData() {
    this.log('Parsing coverage data...');

    const coverageContent = fs.readFileSync(CONFIG.COVERAGE_FILE, 'utf8');
    const records = coverageContent.split('end_of_record');
    const libFiles = {};

    for (const record of records) {
      const sfMatch = record.match(/SF:(.+)/);
      if (!sfMatch) continue;

      const filepath = sfMatch[1];
      if (!filepath.startsWith(`${CONFIG.LIB_FOLDER}/`) || filepath.includes('/index.ts')) {
        continue; // Skip non-lib files and index files
      }

      // Extract coverage metrics
      const lf = this.extractMetric(record, 'LF') || 0; // Lines Found
      const lh = this.extractMetric(record, 'LH') || 0; // Lines Hit
      const fnf = this.extractMetric(record, 'FNF') || 0; // Functions Found
      const fnh = this.extractMetric(record, 'FNH') || 0; // Functions Hit
      const brf = this.extractMetric(record, 'BRF') || 0; // Branches Found
      const brh = this.extractMetric(record, 'BRH') || 0; // Branches Hit

      const lineCoverage = lf > 0 ? (lh / lf * 100) : 100;
      const funcCoverage = fnf > 0 ? (fnh / fnf * 100) : 100;
      const branchCoverage = brf > 0 ? (brh / brf * 100) : 100;

      libFiles[filepath] = {
        lines: { found: lf, hit: lh, percentage: lineCoverage },
        functions: { found: fnf, hit: fnh, percentage: funcCoverage },
        branches: { found: brf, hit: brh, percentage: branchCoverage },
        priority: this.calculatePriority(lineCoverage),
        needsImprovement: lineCoverage < this.minCoverage || funcCoverage < CONFIG.MIN_FUNCTION_COVERAGE
      };
    }

    this.log(`Parsed coverage for ${Object.keys(libFiles).length} lib files`);
    return libFiles;
  }

  extractMetric(record, metric) {
    const match = record.match(new RegExp(`${metric}:(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  }

  calculatePriority(coverage) {
    if (coverage <= PRIORITY_LEVELS.CRITICAL.threshold) return 'CRITICAL';
    if (coverage <= PRIORITY_LEVELS.HIGH.threshold) return 'HIGH';
    if (coverage <= PRIORITY_LEVELS.MEDIUM.threshold) return 'MEDIUM';
    return 'LOW';
  }

  async checkExistingIssues() {
    if (!this.githubToken || !this.repo) return [];

    try {
      const searchQuery = `repo:${this.repo.owner}/${this.repo.repo} is:issue label:test-coverage state:open`;
      const response = await this.makeGitHubRequest('GET', `/search/issues?q=${encodeURIComponent(searchQuery)}`);

      const existingIssues = response.data.items.map(issue => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url
      }));

      this.log(`Found ${existingIssues.length} existing test coverage issues`);
      return existingIssues;
    } catch (error) {
      this.log(`Failed to check existing issues: ${error.message}`, 'warn');
      return [];
    }
  }

  generateIssueRecommendations(filepath, coverage) {
    const fileType = this.categorizeFile(filepath);
    const baseRecommendations = [
      `Test core functionality and public API methods`,
      `Add edge case testing for error conditions`,
      `Test integration with dependent components`,
      `Improve branch coverage for conditional logic`,
      `Add performance tests for critical paths`
    ];

    const typeSpecificRecommendations = {
      'puzzle': [
        'Test puzzle generation with various difficulty levels',
        'Test puzzle validation and answer verification',
        'Test visual consistency and rendering logic',
        'Test random seed reproducibility'
      ],
      'adaptive-engine': [
        'Test learning algorithms and adaptation logic',
        'Test user behavior analysis and pattern recognition',
        'Test data persistence and state management',
        'Mock external dependencies for isolated testing'
      ],
      'services': [
        'Test API integration and external service calls',
        'Test error handling for network failures',
        'Test platform-specific behavior',
        'Mock external APIs and services'
      ],
      'storage': [
        'Test data persistence across app sessions',
        'Test data migration and schema changes',
        'Test storage limits and cleanup mechanisms',
        'Test data integrity and validation'
      ]
    };

    return [
      ...baseRecommendations.slice(0, 3),
      ...(typeSpecificRecommendations[fileType] || []).slice(0, 2)
    ];
  }

  categorizeFile(filepath) {
    // Return labels from our consolidated AREA category
    if (filepath.includes('/components/')) return 'component';
    if (filepath.includes('/hooks/')) return 'hook';
    if (filepath.includes('/services/')) return 'service';
    if (filepath.includes('/lib/')) return 'lib';
    if (filepath.includes('/config') || filepath.includes('Config')) return 'config';
    return 'lib'; // Default for library files
  }

  generateIssueContent(filepath, coverage) {
    const priority = PRIORITY_LEVELS[coverage.priority];
    const recommendations = this.generateIssueRecommendations(filepath, coverage);
    const testFilePath = this.suggestTestFilePath(filepath);

    const title = `${priority.color} Improve test coverage for ${filepath} (${coverage.lines.percentage.toFixed(1)}% coverage)`;

    const body = `## Test Coverage Issue

**File:** \`${filepath}\`
**Current Coverage:** ${coverage.lines.hit}/${coverage.lines.found} lines (${coverage.lines.percentage.toFixed(1)}%), ${coverage.functions.hit}/${coverage.functions.found} functions (${coverage.functions.percentage.toFixed(1)}%), ${coverage.branches.hit}/${coverage.branches.found} branches (${coverage.branches.percentage.toFixed(1)}%)
**Priority:** ${priority.color} ${coverage.priority}

### Problem
This file has ${coverage.lines.percentage.toFixed(1)}% line coverage, which is below the ${this.minCoverage}% threshold. ${this.getImpactDescription(filepath, coverage)}

### Recommended Test Cases
${recommendations.map(rec => `- [ ] ${rec}`).join('\n')}

### Test File Location
\`${testFilePath}\`

### Success Criteria
- Achieve minimum ${this.minCoverage}% line coverage
- Achieve minimum ${CONFIG.MIN_FUNCTION_COVERAGE}% function coverage
- Achieve minimum ${CONFIG.MIN_BRANCH_COVERAGE}% branch coverage
- Include comprehensive edge case testing
- Add integration tests where applicable

### Generated Insights
- **File Type:** ${this.categorizeFile(filepath)}
- **Complexity:** ${coverage.lines.found} lines, ${coverage.functions.found} functions, ${coverage.branches.found} branches
- **Test Gap:** ${coverage.lines.found - coverage.lines.hit} untested lines
- **Analysis Date:** ${new Date().toLocaleDateString()}

> This issue was automatically generated by the daily test coverage analysis. The recommendations are based on file content analysis and coverage patterns.`;

    // Simple labeling: testing + normal (no file categories to avoid confusion)
    const labels = [...CONFIG.ISSUE_LABELS];

    return { title, body, labels };
  }

  getImpactDescription(filepath, coverage) {
    const fileType = this.categorizeFile(filepath);
    const impactMessages = {
      'component': 'This affects UI components and user interface reliability.',
      'hook': 'This affects React hooks and state management logic.',
      'service': 'This affects external integrations and platform-specific functionality.',
      'lib': 'This affects core game logic and puzzle generation systems.',
      'config': 'This affects application configuration and setup.'
    };

    return impactMessages[fileType] || 'This affects application reliability and maintainability.';
  }

  suggestTestFilePath(filepath) {
    // Convert lib path to test path
    const relativePath = filepath.replace(`${CONFIG.LIB_FOLDER}/`, '');
    const testPath = path.join(CONFIG.TEST_FOLDER, 'lib', relativePath.replace('.ts', '.test.ts'));
    return testPath;
  }

  async makeGitHubRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: path,
        method: method,
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Coverage-Analysis-Bot/1.0'
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
            resolve({ data: parsed, status: res.statusCode });
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
  }

  async createGitHubIssue(issueData) {
    if (this.dryRun) {
      this.log(`[DRY RUN] Would create issue: ${issueData.title}`);
      return { number: 'DRY-RUN', html_url: 'dry-run-url' };
    }

    const response = await this.makeGitHubRequest('POST', `/repos/${this.repo.owner}/${this.repo.repo}/issues`, issueData);
    return response.data;
  }

  generateReport(coverageData, createdIssues, existingIssues) {
    const totalFiles = Object.keys(coverageData).length;
    const filesNeedingImprovement = Object.values(coverageData).filter(c => c.needsImprovement).length;

    const priorityCounts = Object.values(coverageData).reduce((acc, coverage) => {
      acc[coverage.priority] = (acc[coverage.priority] || 0) + 1;
      return acc;
    }, {});

    const averageCoverage = totalFiles > 0
      ? Object.values(coverageData).reduce((sum, c) => sum + c.lines.percentage, 0) / totalFiles
      : 0;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles,
        filesNeedingImprovement,
        averageCoverage: averageCoverage.toFixed(1),
        priorityCounts
      },
      thresholds: {
        minLineCoverage: this.minCoverage,
        minFunctionCoverage: CONFIG.MIN_FUNCTION_COVERAGE,
        minBranchCoverage: CONFIG.MIN_BRANCH_COVERAGE
      },
      issues: {
        created: createdIssues.length,
        existing: existingIssues.length,
        maxPerRun: this.maxIssues
      },
      files: coverageData,
      createdIssues,
      executionTime: Date.now() - this.startTime,
      logEntries: this.logEntries
    };

    return report;
  }

  async saveReport(report) {
    const reportPath = CONFIG.REPORT_FILE;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Report saved to ${reportPath}`, 'success');

    // Also save logs if configured
    if (CONFIG.LOG_FILE) {
      const logDir = path.dirname(CONFIG.LOG_FILE);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logContent = report.logEntries
        .map(entry => `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`)
        .join('\n');

      fs.writeFileSync(CONFIG.LOG_FILE, logContent);
    }
  }

  async run() {
    this.log('🚀 Starting daily test coverage analysis...');

    try {
      // Step 1: Generate coverage
      const coverageGenerated = await this.runTestsAndGenerateCoverage();
      if (!coverageGenerated) {
        throw new Error('Failed to generate coverage report');
      }

      // Step 2: Parse coverage data
      const coverageData = this.parseCoverageData();

      // Step 3: Check existing issues
      const existingIssues = await this.checkExistingIssues();

      // Check current open issue count and determine how many new issues we can create
      const currentOpenIssues = existingIssues.length;
      const maxNewIssues = Math.max(0, CONFIG.MAX_OPEN_ISSUES - currentOpenIssues);

      if (maxNewIssues === 0) {
        this.log(`⚠️ Skipping issue creation: ${currentOpenIssues} coverage issues already open (max: ${CONFIG.MAX_OPEN_ISSUES})`, 'warn');
        this.log('Close some existing coverage issues before creating new ones.', 'info');
      } else {
        this.log(`📊 Can create up to ${maxNewIssues} new issues (${currentOpenIssues}/${CONFIG.MAX_OPEN_ISSUES} slots used)`);
      }

      // Step 4: Identify files needing improvement
      const filesNeedingImprovement = Object.entries(coverageData)
        .filter(([_, coverage]) => coverage.needsImprovement)
        .sort(([_, a], [__, b]) => a.lines.percentage - b.lines.percentage) // Worst coverage first
        .slice(0, this.maxIssues); // Limit issues per run

      this.log(`Found ${filesNeedingImprovement.length} files needing coverage improvement`);

      // Step 5: Create GitHub issues
      const createdIssues = [];
      if (this.createIssues && this.githubToken && this.repo && maxNewIssues > 0) {
        // Filter out files that already have open issues (duplicate prevention)
        const existingFilePaths = existingIssues.map(issue =>
          issue.title.match(/Improve test coverage for (.+?) \(/)?.[1]
        ).filter(Boolean);

        const filesToCreateIssuesFor = filesNeedingImprovement
          .filter(([filepath]) => !existingFilePaths.includes(filepath))
          .slice(0, maxNewIssues); // Respect the limit

        this.log(`Creating issues for ${filesToCreateIssuesFor.length} files (${existingFilePaths.length} files already have open issues)`);

        for (const [filepath, coverage] of filesToCreateIssuesFor) {
          try {
            const issueContent = this.generateIssueContent(filepath, coverage);
            const issue = await this.createGitHubIssue(issueContent);

            createdIssues.push({
              filepath,
              number: issue.number,
              url: issue.html_url,
              title: issueContent.title
            });

            this.log(`Created issue #${issue.number} for ${filepath}`, 'success');

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            this.log(`Failed to create issue for ${filepath}: ${error.message}`, 'error');
          }
        }
      } else if (maxNewIssues === 0) {
        this.log('No new issues created - maximum limit reached', 'info');
      }

      // Step 6: Generate and save report
      const report = this.generateReport(coverageData, createdIssues, existingIssues);
      await this.saveReport(report);

      // Step 7: Summary
      this.log('📊 Analysis Summary:');
      this.log(`  Total files analyzed: ${report.summary.totalFiles}`);
      this.log(`  Files needing improvement: ${report.summary.filesNeedingImprovement}`);
      this.log(`  Average coverage: ${report.summary.averageCoverage}%`);
      this.log(`  Issues created: ${createdIssues.length}`);
      this.log(`  Execution time: ${(report.executionTime / 1000).toFixed(1)}s`);

      return report;

    } catch (error) {
      this.log(`Analysis failed: ${error.message}`, 'error');
      throw error;
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
        case 'dry-run':
          options.dryRun = true;
          break;
        case 'verbose':
          options.verbose = true;
          break;
        case 'min-coverage':
          options.minCoverage = parseInt(value) || CONFIG.MIN_LINE_COVERAGE;
          break;
        case 'max-issues':
          options.maxIssues = parseInt(value) || CONFIG.MAX_ISSUES_PER_RUN;
          break;
        case 'no-issues':
          options.createIssues = false;
          break;
        default:
          console.warn(`Unknown option: --${key}`);
      }
    }
  });

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Daily Test Coverage Analysis

Usage: node analyze-coverage.js [options]

Options:
  --dry-run             Don't create actual GitHub issues
  --verbose             Show detailed logging
  --min-coverage=N      Minimum line coverage threshold (default: ${CONFIG.MIN_LINE_COVERAGE})
  --max-issues=N        Maximum issues to create per run (default: ${CONFIG.MAX_ISSUES_PER_RUN})
  --no-issues          Don't create GitHub issues, only analyze
  --help               Show this help

Environment Variables:
  GITHUB_TOKEN                 GitHub personal access token
  CLAUDE_CODE_OAUTH_TOKEN      Claude Code OAuth token (alternative)

Examples:
  node analyze-coverage.js --dry-run --verbose
  node analyze-coverage.js --min-coverage=60 --max-issues=3
  node analyze-coverage.js --no-issues  # Analysis only
`);
    process.exit(0);
  }

  // Run analyzer
  const analyzer = new CoverageAnalyzer(options);
  analyzer.run().catch(error => {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = CoverageAnalyzer;