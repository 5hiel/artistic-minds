#!/usr/bin/env node

/**
 * GitHub Bug Analysis and AI-Powered Testing Recommendations
 * Analyzes GitHub issues labeled as bugs and generates AI-powered testing improvement recommendations
 *
 * Usage:
 *   node analyze-bugs.js --days=7 --dry-run --verbose
 *   node analyze-bugs.js --include-closed --ai-analysis --create-recommendations
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { LABEL_SETS } = require('../issue-triage/label-system');

// Configuration
const CONFIG = {
  // GitHub API settings
  GITHUB_API_URL: 'api.github.com',
  ISSUES_PER_PAGE: 100,
  MAX_PAGES: 10,

  // Bug analysis settings - using consistent labels from App Store feedback system
  BUG_LABELS: ['bug-report', 'crashes', 'bug', 'defect', 'issue', 'error', 'problem'],
  SEVERITY_LABELS: ['critical-feedback', 'high-priority', 'medium-priority', 'low-priority'],
  COMPONENT_LABELS: [
    // Game-specific components
    'puzzle-generation', 'power-surge-system', 'adaptive-learning',
    'level-progression', 'scoring-system',
    // Technical components
    'ui-ux-feedback', 'performance-issue', 'accessibility',
    'ios-specific', 'android-specific', 'web-version'
  ],

  // AI analysis settings
  ENABLE_AI_ANALYSIS: true,
  AI_ANALYSIS_ENDPOINT: 'https://api.openai.com/v1/chat/completions', // Can be changed to other AI services
  AI_MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 1000,

  // Testing recommendation settings - using consistent labels
  CREATE_RECOMMENDATIONS: true,
  MAX_RECOMMENDATIONS_PER_RUN: 10,
  RECOMMENDATION_LABELS: ['auto-generated', 'investigate', 'quick-win'],

  // File patterns for analysis
  RELATED_FILES_PATTERNS: [
    '**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx',
    '**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts'
  ],

  // Output settings
  REPORT_FILE: 'bug-analysis-report.json',
  RECOMMENDATIONS_FILE: 'testing-recommendations.json',
  LOG_FILE: 'logs/bug-analysis.log'
};

// Bug categorization patterns - aligned with App Store feedback labels
const BUG_PATTERNS = {
  CRASHES: {
    keywords: ['crash', 'crashed', 'crashing', 'exception', 'error', 'null pointer', 'undefined', 'segfault'],
    severity: 'critical-feedback',
    category: 'crashes',
    testingFocus: 'error handling and edge cases',
    label: 'crashes'
  },
  PERFORMANCE: {
    keywords: ['slow', 'lag', 'performance', 'memory', 'cpu', 'timeout', 'freeze', 'hang'],
    severity: 'high-priority',
    category: 'performance-issue',
    testingFocus: 'performance and load testing',
    label: 'performance-issue'
  },
  UI_UX: {
    keywords: ['ui', 'ux', 'interface', 'display', 'layout', 'button', 'click', 'visual', 'design'],
    severity: 'medium-priority',
    category: 'ui-ux-feedback',
    testingFocus: 'UI testing and user interaction flows',
    label: 'ui-ux-feedback'
  },
  PUZZLE_GENERATION: {
    keywords: ['puzzle', 'generation', 'random', 'variety', 'difficulty', 'repetitive'],
    severity: 'high-priority',
    category: 'puzzle-generation',
    testingFocus: 'puzzle algorithm and generation testing',
    label: 'puzzle-generation'
  },
  POWER_SURGE: {
    keywords: ['power', 'surge', 'timer', 'countdown', 'scoring', 'points', 'combo'],
    severity: 'medium-priority',
    category: 'power-surge-system',
    testingFocus: 'timer mechanics and scoring validation',
    label: 'power-surge-system'
  },
  ADAPTIVE_LEARNING: {
    keywords: ['adaptive', 'learning', 'difficulty', 'progression', 'ai', 'intelligent'],
    severity: 'high-priority',
    category: 'adaptive-learning',
    testingFocus: 'adaptive algorithm and learning curve testing',
    label: 'adaptive-learning'
  },
  ACCESSIBILITY: {
    keywords: ['accessibility', 'a11y', 'screen reader', 'contrast', 'disability', 'vision'],
    severity: 'high-priority',
    category: 'accessibility',
    testingFocus: 'accessibility compliance and assistive technology testing',
    label: 'accessibility'
  },
  PLATFORM_SPECIFIC: {
    keywords: ['ios', 'android', 'web', 'mobile', 'device', 'platform'],
    severity: 'medium-priority',
    category: 'platform-specific',
    testingFocus: 'platform-specific testing and compatibility',
    label: 'ios-specific' // Will be refined based on content
  }
};

// AI prompts for different types of analysis
const AI_PROMPTS = {
  BUG_ANALYSIS: `Analyze this GitHub issue and provide testing recommendations:

Issue: {title}
Description: {body}
Labels: {labels}

Please provide:
1. Root cause analysis (likely cause of the bug)
2. Testing gaps that might have allowed this bug
3. Specific test cases that would have caught this bug
4. Preventive testing strategies for similar issues
5. Recommended test automation improvements

Format your response as JSON with these keys: rootCause, testingGaps, recommendedTests, preventiveStrategy, automationSuggestions`,

  PATTERN_ANALYSIS: `Analyze these related GitHub issues for patterns and testing improvements:

Issues: {issues}

Identify:
1. Common patterns across these bugs
2. Systemic testing gaps
3. Areas needing better test coverage
4. Recommended testing infrastructure improvements
5. Preventive measures to avoid similar bugs

Format as JSON with keys: patterns, systemicGaps, coverageNeeds, infrastructureImprovements, preventiveMeasures`,

  TEST_STRATEGY: `Based on this bug analysis, create a comprehensive testing strategy:

Bug Categories: {categories}
Affected Components: {components}
Severity Distribution: {severities}

Create:
1. Priority testing areas based on bug patterns
2. Specific test types needed (unit, integration, e2e, performance)
3. Test automation recommendations
4. Monitoring and detection improvements
5. Development workflow improvements

Format as JSON with keys: priorityAreas, testTypes, automation, monitoring, workflow`
};

class GitHubBugAnalyzer {
  constructor(options = {}) {
    this.owner = options.owner || this.extractRepoInfo().owner;
    this.repo = options.repo || this.extractRepoInfo().repo;
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN || process.env.CLAUDE_CODE_OAUTH_TOKEN;
    this.aiApiKey = options.aiApiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.days = options.days || 30;
    this.includeClosed = options.includeClosed || false;
    this.enableAI = options.enableAI !== false && CONFIG.ENABLE_AI_ANALYSIS;
    this.createRecommendations = options.createRecommendations !== false;

    this.startTime = Date.now();
    this.logEntries = [];
    this.requestCount = 0;

    this.validateConfig();
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

  validateConfig() {
    if (!this.owner || !this.repo) {
      this.log('Could not determine GitHub repository. Ensure you\'re in a git repository with GitHub remote.', 'error');
      process.exit(1);
    }

    if (!this.githubToken) {
      this.log('GitHub token required. Set GITHUB_TOKEN or CLAUDE_CODE_OAUTH_TOKEN environment variable.', 'error');
      process.exit(1);
    }

    if (this.enableAI && !this.aiApiKey) {
      this.log('AI API key not found. Set OPENAI_API_KEY or AI_API_KEY. Disabling AI analysis.', 'warn');
      this.enableAI = false;
    }

    this.log(`Repository: ${this.owner}/${this.repo}`);
    this.log(`AI Analysis: ${this.enableAI ? 'Enabled' : 'Disabled'}`);
  }

  extractRepoInfo() {
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch (error) {
      this.log(`Failed to get repo info: ${error.message}`, 'error');
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
          'Authorization': `token ${this.githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Bug-Analysis-Bot/1.0',
          'Accept': 'application/vnd.github.v3+json'
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
              headers: res.headers,
              rateLimit: {
                limit: res.headers['x-ratelimit-limit'],
                remaining: res.headers['x-ratelimit-remaining'],
                reset: res.headers['x-ratelimit-reset']
              }
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

  async makeAIRequest(prompt, maxTokens = CONFIG.MAX_TOKENS) {
    if (!this.enableAI) {
      return { error: 'AI analysis disabled' };
    }

    const requestBody = {
      model: CONFIG.AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3
    };

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.aiApiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 400) {
              reject(new Error(`AI API Error ${res.statusCode}: ${parsed.error?.message || 'Unknown error'}`));
              return;
            }
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse AI API response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }

  async fetchBugIssues() {
    this.log('Fetching GitHub issues labeled as bugs...');

    const since = new Date(Date.now() - this.days * 24 * 60 * 60 * 1000).toISOString();
    const state = this.includeClosed ? 'all' : 'open';

    const bugLabels = CONFIG.BUG_LABELS.join(',');
    const searchQuery = `repo:${this.owner}/${this.repo} is:issue label:bug state:${state} created:>=${since.split('T')[0]}`;

    const allIssues = [];
    let page = 1;

    while (page <= CONFIG.MAX_PAGES) {
      try {
        const response = await this.makeGitHubRequest('GET',
          `/search/issues?q=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${CONFIG.ISSUES_PER_PAGE}`
        );

        const issues = response.data.items || [];
        allIssues.push(...issues);

        this.log(`Fetched ${issues.length} issues from page ${page}`);

        if (issues.length < CONFIG.ISSUES_PER_PAGE) break;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        page++;

      } catch (error) {
        this.log(`Failed to fetch issues page ${page}: ${error.message}`, 'error');
        break;
      }
    }

    this.log(`Total bug issues found: ${allIssues.length}`, 'success');
    return allIssues;
  }

  categorizeIssue(issue) {
    const title = (issue.title || '').toLowerCase();
    const body = (issue.body || '').toLowerCase();
    const content = `${title} ${body}`;
    const labels = issue.labels.map(label => label.name.toLowerCase());

    let category = 'unknown';
    let severity = 'medium';
    let testingFocus = 'general testing';

    // Pattern-based categorization
    for (const [patternName, pattern] of Object.entries(BUG_PATTERNS)) {
      if (pattern.keywords.some(keyword => content.includes(keyword))) {
        category = pattern.category;
        severity = pattern.severity;
        testingFocus = pattern.testingFocus;
        break;
      }
    }

    // Label-based severity override
    for (const severityLabel of CONFIG.SEVERITY_LABELS) {
      if (labels.includes(severityLabel)) {
        severity = severityLabel;
        break;
      }
    }

    return {
      category,
      severity,
      testingFocus,
      labels: labels,
      component: this.extractComponent(labels)
    };
  }

  extractComponent(labels) {
    for (const componentLabel of CONFIG.COMPONENT_LABELS) {
      if (labels.includes(componentLabel)) {
        return componentLabel;
      }
    }
    return 'core';
  }

  async analyzeIssueWithAI(issue) {
    if (!this.enableAI) {
      return null;
    }

    try {
      const prompt = AI_PROMPTS.BUG_ANALYSIS
        .replace('{title}', issue.title || '')
        .replace('{body}', (issue.body || '').substring(0, 2000)) // Limit length
        .replace('{labels}', issue.labels.map(l => l.name).join(', '));

      this.log(`Analyzing issue #${issue.number} with AI...`);

      const response = await this.makeAIRequest(prompt);

      if (response.choices && response.choices[0]) {
        const content = response.choices[0].message.content;
        try {
          return JSON.parse(content);
        } catch (parseError) {
          this.log(`Failed to parse AI response for issue #${issue.number}: ${parseError.message}`, 'warn');
          return { rawResponse: content };
        }
      }

      return null;

    } catch (error) {
      this.log(`AI analysis failed for issue #${issue.number}: ${error.message}`, 'warn');
      return null;
    }
  }

  async analyzePatterns(issues) {
    if (!this.enableAI || issues.length === 0) {
      return null;
    }

    try {
      const issuesSummary = issues.slice(0, 10).map(issue => ({
        title: issue.title,
        labels: issue.labels.map(l => l.name),
        category: issue.analysis?.category
      }));

      const prompt = AI_PROMPTS.PATTERN_ANALYSIS
        .replace('{issues}', JSON.stringify(issuesSummary, null, 2));

      this.log('Analyzing bug patterns with AI...');

      const response = await this.makeAIRequest(prompt, 1500);

      if (response.choices && response.choices[0]) {
        const content = response.choices[0].message.content;
        try {
          return JSON.parse(content);
        } catch (parseError) {
          return { rawResponse: content };
        }
      }

      return null;

    } catch (error) {
      this.log(`Pattern analysis failed: ${error.message}`, 'warn');
      return null;
    }
  }

  generateTestingRecommendations(analysisResults) {
    const recommendations = [];
    const { issues, patterns, summary } = analysisResults;

    // Category-based recommendations
    const categoryGroups = {};
    issues.forEach(issue => {
      const category = issue.analysis?.category || 'unknown';
      if (!categoryGroups[category]) categoryGroups[category] = [];
      categoryGroups[category].push(issue);
    });

    Object.entries(categoryGroups).forEach(([category, categoryIssues]) => {
      if (categoryIssues.length >= 2) { // Only recommend if multiple issues in category
        const recommendation = this.createCategoryRecommendation(category, categoryIssues);
        recommendations.push(recommendation);
      }
    });

    // AI-driven recommendations
    if (patterns && patterns.coverageNeeds) {
      patterns.coverageNeeds.forEach(need => {
        recommendations.push({
          type: 'ai_generated',
          priority: 'high',
          title: `Improve test coverage: ${need}`,
          description: `AI analysis identified testing gap: ${need}`,
          testTypes: ['unit', 'integration'],
          estimatedEffort: 'medium'
        });
      });
    }

    // Severity-based recommendations
    const criticalIssues = issues.filter(issue =>
      issue.analysis?.severity === 'critical' ||
      issue.analysis?.severity === 'high'
    );

    if (criticalIssues.length >= 3) {
      recommendations.push({
        type: 'critical_pattern',
        priority: 'urgent',
        title: 'Implement comprehensive error handling tests',
        description: `Found ${criticalIssues.length} critical/high severity bugs. This suggests gaps in error handling and edge case testing.`,
        testTypes: ['error-handling', 'edge-cases', 'negative-testing'],
        estimatedEffort: 'high',
        relatedIssues: criticalIssues.map(issue => issue.number)
      });
    }

    return recommendations.slice(0, CONFIG.MAX_RECOMMENDATIONS_PER_RUN);
  }

  createCategoryRecommendation(category, issues) {
    const categoryMeta = {
      stability: {
        title: 'Improve crash prevention and error handling testing',
        description: 'Multiple crash-related bugs detected. Focus on error boundary testing and exception handling.',
        testTypes: ['error-handling', 'edge-cases', 'stress-testing'],
        priority: 'high'
      },
      performance: {
        title: 'Implement performance and load testing',
        description: 'Performance issues detected. Add performance benchmarks and load testing.',
        testTypes: ['performance', 'load-testing', 'profiling'],
        priority: 'medium'
      },
      user_interface: {
        title: 'Enhance UI/UX testing coverage',
        description: 'UI-related bugs found. Improve visual testing and user interaction flows.',
        testTypes: ['ui-testing', 'visual-regression', 'accessibility'],
        priority: 'medium'
      },
      data_integrity: {
        title: 'Strengthen data validation and persistence testing',
        description: 'Data-related issues detected. Focus on data integrity and validation testing.',
        testTypes: ['data-validation', 'persistence', 'migration'],
        priority: 'high'
      },
      business_logic: {
        title: 'Improve business logic unit testing',
        description: 'Logic errors found. Increase unit test coverage for core business functions.',
        testTypes: ['unit-testing', 'business-logic', 'calculation-validation'],
        priority: 'medium'
      },
      integration: {
        title: 'Enhance API and integration testing',
        description: 'Integration issues detected. Improve API testing and external service mocking.',
        testTypes: ['integration-testing', 'api-testing', 'mocking'],
        priority: 'medium'
      }
    };

    const meta = categoryMeta[category] || {
      title: `Improve testing for ${category} issues`,
      description: `Multiple ${category} related bugs detected.`,
      testTypes: ['unit-testing', 'integration-testing'],
      priority: 'medium'
    };

    return {
      type: 'category_pattern',
      category,
      priority: meta.priority,
      title: meta.title,
      description: meta.description,
      testTypes: meta.testTypes,
      estimatedEffort: issues.length > 5 ? 'high' : 'medium',
      relatedIssues: issues.map(issue => issue.number),
      issueCount: issues.length
    };
  }

  async createRecommendationIssue(recommendation) {
    if (this.dryRun) {
      this.log(`[DRY RUN] Would create recommendation issue: ${recommendation.title}`);
      return { number: 'DRY-RUN', html_url: 'dry-run-url' };
    }

    const issueBody = this.generateRecommendationIssueBody(recommendation);
    const labels = [...CONFIG.RECOMMENDATION_LABELS];

    // Add priority label using existing label system
    const priorityLabels = {
      'urgent': 'critical-feedback',
      'high': 'high-priority',
      'medium': 'medium-priority',
      'low': 'low-priority'
    };
    if (priorityLabels[recommendation.priority]) {
      labels.push(priorityLabels[recommendation.priority]);
    }

    // Add category label if it matches existing labels
    if (recommendation.category && CONFIG.COMPONENT_LABELS.includes(recommendation.category)) {
      labels.push(recommendation.category);
    }

    const issueData = {
      title: `🧪 ${recommendation.title}`,
      body: issueBody,
      labels: labels
    };

    try {
      const response = await this.makeGitHubRequest('POST', `/repos/${this.owner}/${this.repo}/issues`, issueData);
      return response.data;
    } catch (error) {
      this.log(`Failed to create recommendation issue: ${error.message}`, 'error');
      throw error;
    }
  }

  generateRecommendationIssueBody(recommendation) {
    const priorityEmoji = {
      urgent: '🚨',
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    }[recommendation.priority] || '🟡';

    const effortEmoji = {
      low: '⚡',
      medium: '🔧',
      high: '🏗️'
    }[recommendation.estimatedEffort] || '🔧';

    return `## Testing Improvement Recommendation

**Priority:** ${priorityEmoji} ${recommendation.priority.toUpperCase()}
**Estimated Effort:** ${effortEmoji} ${recommendation.estimatedEffort || 'medium'}
**Type:** ${recommendation.type.replace('_', ' ')}

### Description
${recommendation.description}

### Recommended Test Types
${recommendation.testTypes.map(type => `- [ ] ${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n')}

### Related Issues
${recommendation.relatedIssues ? recommendation.relatedIssues.map(num => `- Issue #${num}`).join('\n') : 'Analysis based on bug patterns'}

### Implementation Suggestions
${this.generateImplementationSuggestions(recommendation)}

### Success Criteria
- [ ] Implement recommended test types
- [ ] Achieve test coverage for identified gaps
- [ ] Verify tests catch similar issues
- [ ] Update testing documentation

**Generated:** ${new Date().toLocaleDateString()}
**Analysis Period:** Last ${this.days} days
${recommendation.issueCount ? `**Issues Analyzed:** ${recommendation.issueCount}` : ''}

> This recommendation was automatically generated based on GitHub issue analysis and AI-powered pattern detection.`;
  }

  generateImplementationSuggestions(recommendation) {
    const suggestions = {
      'error-handling': '- Add try-catch blocks with specific error testing\n- Implement error boundary tests\n- Test with invalid inputs and edge cases',
      'performance': '- Set up performance benchmarks\n- Add load testing with realistic data volumes\n- Monitor memory usage and CPU performance',
      'ui-testing': '- Implement visual regression testing\n- Add user interaction flow tests\n- Test responsive design across devices',
      'data-validation': '- Add schema validation tests\n- Test data persistence across sessions\n- Verify data integrity after operations',
      'integration-testing': '- Mock external API dependencies\n- Test service communication\n- Verify error handling for service failures',
      'unit-testing': '- Increase test coverage for core functions\n- Add edge case testing\n- Test business logic isolation'
    };

    const relevantSuggestions = recommendation.testTypes
      .map(type => suggestions[type] || `- Implement comprehensive ${type.replace('-', ' ')} tests`)
      .join('\n\n');

    return relevantSuggestions || '- Review related issues and implement targeted tests\n- Focus on preventing similar bugs\n- Add comprehensive test coverage';
  }

  generateAnalysisReport(issues, patterns, recommendations) {
    const summary = {
      totalIssues: issues.length,
      analysisDate: new Date().toISOString(),
      daysPeriod: this.days,
      includedClosed: this.includeClosed,
      aiAnalysisEnabled: this.enableAI
    };

    // Category distribution
    const categories = {};
    const severities = {};
    const components = {};

    issues.forEach(issue => {
      const cat = issue.analysis?.category || 'unknown';
      const sev = issue.analysis?.severity || 'medium';
      const comp = issue.analysis?.component || 'core';

      categories[cat] = (categories[cat] || 0) + 1;
      severities[sev] = (severities[sev] || 0) + 1;
      components[comp] = (components[comp] || 0) + 1;
    });

    return {
      summary,
      distribution: {
        categories,
        severities,
        components
      },
      patterns: patterns,
      recommendations: {
        total: recommendations.length,
        items: recommendations
      },
      issues: issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        created_at: issue.created_at,
        analysis: issue.analysis,
        aiAnalysis: issue.aiAnalysis
      })),
      executionTime: Date.now() - this.startTime,
      requestCount: this.requestCount,
      logEntries: this.logEntries
    };
  }

  async run() {
    this.log('🚀 Starting GitHub bug analysis...');

    try {
      // Step 1: Fetch bug issues
      const issues = await this.fetchBugIssues();

      if (issues.length === 0) {
        this.log('No bug issues found in the specified time period.', 'info');

        // Generate a report even with 0 bugs for workflow consistency
        const emptyReport = this.generateAnalysisReport([], null, []);
        emptyReport.createdRecommendations = [];

        // Save empty report
        fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(emptyReport, null, 2));
        this.log(`Analysis report saved to ${CONFIG.REPORT_FILE}`, 'success');

        this.log('📊 Analysis Summary:', 'success');
        this.log(`  Total issues analyzed: 0`);
        this.log(`  Recommendations generated: 0`);
        this.log(`  Recommendation issues created: 0`);
        this.log(`  AI analysis: ${this.enableAI ? 'Enabled' : 'Disabled'}`);
        this.log(`  Execution time: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);

        return emptyReport;
      }

      // Step 2: Categorize and analyze issues
      this.log('Categorizing and analyzing issues...');

      for (const issue of issues) {
        issue.analysis = this.categorizeIssue(issue);

        if (this.enableAI) {
          issue.aiAnalysis = await this.analyzeIssueWithAI(issue);
          // Rate limiting for AI requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Step 3: Pattern analysis
      const patterns = await this.analyzePatterns(issues);

      // Step 4: Generate testing recommendations
      const recommendations = this.generateTestingRecommendations({
        issues,
        patterns,
        summary: { totalIssues: issues.length }
      });

      // Step 5: Create GitHub issues for recommendations
      const createdRecommendations = [];
      if (this.createRecommendations && recommendations.length > 0) {
        this.log(`Creating ${recommendations.length} recommendation issues...`);

        for (const recommendation of recommendations) {
          try {
            const issue = await this.createRecommendationIssue(recommendation);
            createdRecommendations.push({
              recommendation,
              issueNumber: issue.number,
              issueUrl: issue.html_url
            });

            this.log(`Created recommendation issue #${issue.number}: ${recommendation.title}`, 'success');

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            this.log(`Failed to create recommendation: ${error.message}`, 'error');
          }
        }
      }

      // Step 6: Generate report
      const report = this.generateAnalysisReport(issues, patterns, recommendations);
      report.createdRecommendations = createdRecommendations;

      // Save reports
      fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(report, null, 2));
      this.log(`Analysis report saved to ${CONFIG.REPORT_FILE}`, 'success');

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

      // Summary
      this.log('📊 Analysis Summary:', 'success');
      this.log(`  Total issues analyzed: ${issues.length}`);
      this.log(`  Recommendations generated: ${recommendations.length}`);
      this.log(`  Recommendation issues created: ${createdRecommendations.length}`);
      this.log(`  AI analysis: ${this.enableAI ? 'Enabled' : 'Disabled'}`);
      this.log(`  Execution time: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);

      return report;

    } catch (error) {
      this.log(`Bug analysis failed: ${error.message}`, 'error');
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
        case 'days':
          options.days = parseInt(value) || 30;
          break;
        case 'dry-run':
          options.dryRun = true;
          break;
        case 'verbose':
          options.verbose = true;
          break;
        case 'include-closed':
          options.includeClosed = true;
          break;
        case 'no-ai':
          options.enableAI = false;
          break;
        case 'no-recommendations':
          options.createRecommendations = false;
          break;
        default:
          console.warn(`Unknown option: --${key}`);
      }
    }
  });

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GitHub Bug Analysis and AI Testing Recommendations

Usage: node analyze-bugs.js [options]

Options:
  --days=N              Analyze bugs from last N days (default: 30)
  --dry-run            Don't create actual GitHub issues
  --verbose            Show detailed logging
  --include-closed     Include closed issues in analysis
  --no-ai              Disable AI analysis
  --no-recommendations Don't create recommendation issues
  --help               Show this help

Environment Variables:
  GITHUB_TOKEN                 GitHub personal access token
  CLAUDE_CODE_OAUTH_TOKEN      Claude Code OAuth token (alternative)
  OPENAI_API_KEY              OpenAI API key for AI analysis
  AI_API_KEY                  Alternative AI API key

Examples:
  node analyze-bugs.js --days=7 --verbose
  node analyze-bugs.js --include-closed --no-ai
  node analyze-bugs.js --dry-run --days=14
`);
    process.exit(0);
  }

  // Run analyzer
  const analyzer = new GitHubBugAnalyzer(options);
  analyzer.run().catch(error => {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = GitHubBugAnalyzer;