# GitHub Bug Analysis & AI Testing Recommendations

This system analyzes GitHub issues to identify bug patterns and automatically creates testing improvement recommendations using AI-powered analysis.

## 🎯 Purpose

- **Pattern Detection**: Identifies recurring bug patterns in your GitHub repository
- **AI Analysis**: Uses OpenAI API to analyze bugs and suggest testing improvements
- **Automated Testing Recommendations**: Creates GitHub issues with specific testing suggestions
- **Smart Categorization**: Categorizes bugs by component, severity, and impact
- **Integration**: Works seamlessly with existing App Store feedback and coverage analysis workflows

## 🚀 Features

### Core Analysis
- Analyzes GitHub issues labeled as bugs over configurable time periods
- Identifies patterns across bug categories and components
- Provides AI-powered root cause analysis and prevention strategies
- Creates actionable testing improvement recommendations

### AI-Powered Recommendations
- Uses OpenAI GPT models for intelligent analysis
- Generates specific test cases and coverage improvements
- Provides confidence scores for recommendations
- Suggests testing strategies based on bug patterns

### Smart Issue Management
- Automatically creates GitHub issues for testing improvements
- Uses consistent labeling system from App Store feedback workflow
- Prevents duplicate recommendations with content hashing
- Rate-limited API requests for compliance

### Integration Features
- Works with existing test coverage analysis
- Connects to App Store feedback patterns
- Integrates with daily automation workflows
- Supports both manual and scheduled execution

## 📋 Requirements

### Required Dependencies
```bash
npm install @octokit/rest openai
```

### Environment Variables
```bash
# Required
GITHUB_TOKEN=your_github_token_here
CLAUDE_CODE_OAUTH_TOKEN=your_token_here

# Optional (for AI analysis)
OPENAI_API_KEY=your_openai_key_here
```

### System Requirements
- Node.js 18+
- Git repository with GitHub remote
- GitHub repository with Issues enabled

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd scripts/workflows/bug-analysis
npm install @octokit/rest openai
```

### 2. Configure Environment
```bash
# Copy configuration template
cp bug-config.env.example bug-config.env

# Edit configuration
nano bug-config.env
```

### 3. Test the System
```bash
# Dry run to test configuration
node analyze-bugs.js --dry-run --verbose

# Run analysis for last 7 days
node analyze-bugs.js --days=7 --include-closed --verbose
```

## 🎮 Usage

### Command Line Interface

#### Basic Analysis
```bash
# Analyze last 30 days of bugs
node analyze-bugs.js

# Analyze specific time period
node analyze-bugs.js --days=14

# Include closed issues
node analyze-bugs.js --include-closed

# Dry run (no issue creation)
node analyze-bugs.js --dry-run
```

#### Advanced Options
```bash
# Disable AI analysis
node analyze-bugs.js --no-ai

# Don't create recommendation issues
node analyze-bugs.js --no-recommendations

# Verbose output
node analyze-bugs.js --verbose

# Custom configuration
source custom-config.env && node analyze-bugs.js
```

### GitHub Workflow Integration

#### Manual Trigger
```bash
# Trigger via GitHub CLI
gh workflow run daily-bug-analysis.yml

# Trigger with parameters
gh workflow run daily-bug-analysis.yml \
  -f days_back=14 \
  -f include_closed=true \
  -f enable_ai=true
```

#### Repository Dispatch
```bash
# Trigger via API
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{"event_type":"daily-bug-analysis","client_payload":{"days_back":"30","enable_ai":"true"}}'
```

## 📊 Analysis Reports

### Report Structure
The system generates comprehensive reports in `bug-analysis-report.json`:

```json
{
  "summary": {
    "totalIssues": 15,
    "analyzedPeriod": "30 days",
    "aiAnalysisEnabled": true,
    "patternsDetected": 3
  },
  "distribution": {
    "categories": {
      "puzzle-generation": 5,
      "power-surge-system": 3,
      "ui-ux-feedback": 7
    },
    "severity": {
      "critical-feedback": 2,
      "high-priority": 5,
      "medium-priority": 8
    }
  },
  "patterns": [
    {
      "category": "puzzle-generation",
      "frequency": 5,
      "commonKeywords": ["array bounds", "undefined", "generation"],
      "aiAnalysis": "Pattern suggests issues with array bounds checking in puzzle generation logic",
      "confidence": 0.85
    }
  ],
  "recommendations": {
    "total": 8,
    "categories": {
      "unit-tests": 3,
      "integration-tests": 2,
      "edge-case-testing": 3
    }
  },
  "createdRecommendations": [
    {
      "title": "🧪 Testing: Improve coverage for puzzle-generation - Array bounds validation",
      "number": 67,
      "url": "https://github.com/owner/repo/issues/67"
    }
  ]
}
```

### Testing Recommendations
Generated recommendations are saved in `testing-recommendations.json` and include:
- Specific test cases to implement
- Coverage improvement suggestions
- Edge case scenarios to validate
- Integration testing strategies

## 🔧 Configuration

### Basic Configuration (`bug-config.env`)
```bash
# Analysis scope
DAYS_BACK=30
INCLUDE_CLOSED_ISSUES=true
MAX_RECOMMENDATIONS_PER_RUN=5

# AI settings
ENABLE_AI_ANALYSIS=true
AI_MODEL=gpt-3.5-turbo
MIN_CONFIDENCE_SCORE=0.7

# GitHub integration
CREATE_GITHUB_ISSUES=true
DRY_RUN=false
```

### Advanced Configuration
- **Pattern Detection**: Customize thresholds for pattern identification
- **Label System**: Align with existing App Store feedback labels
- **AI Prompts**: Customize analysis prompts for specific domains
- **Notification**: Integrate with Slack, Discord, or email alerts

### Label System Integration
Uses consistent labels from App Store feedback system:
- **Bug Labels**: `bug-report`, `crashes`, `bug`, `defect`, `issue`, `error`, `problem`
- **Severity**: `critical-feedback`, `high-priority`, `medium-priority`, `low-priority`
- **Components**: `puzzle-generation`, `power-surge-system`, `adaptive-learning`, etc.

## 🤖 GitHub Workflow

### Daily Automated Analysis
The workflow runs daily at 1 AM PST and provides:
- Scheduled execution with smart parameter detection
- Manual trigger with customizable options
- Automatic triggering on new bug issues
- Comprehensive reporting and artifact uploads

### Workflow Features
- **Multi-trigger Support**: Schedule, manual, CLI, and issue-based triggers
- **Parameter Customization**: Configurable analysis period, AI settings, dry-run mode
- **Artifact Management**: Uploads reports, logs, and recommendations
- **Status Monitoring**: Tracks analysis success and failure patterns

### Integration Triggers
```yaml
# Automatic trigger on bug issues
on:
  issues:
    types: [opened, labeled]

# CLI trigger via repository_dispatch
gh api repos/owner/repo/dispatches \
  -f event_type=daily-bug-analysis \
  -f client_payload='{"days_back":"14"}'
```

## 📈 Performance & Monitoring

### Rate Limiting
- GitHub API: 5000 requests/hour (authenticated)
- OpenAI API: Configurable delays between requests
- Smart batching for large repositories

### Logging
- Comprehensive logging to `logs/bug-analysis.log`
- 7-day log rotation for disk space management
- Structured logging with timestamps and categories

### Monitoring
- Analysis success/failure tracking
- Pattern detection accuracy metrics
- AI recommendation confidence scores
- GitHub issue creation success rates

## 🧪 Testing & Validation

### Local Testing
```bash
# Test with dry run
node analyze-bugs.js --dry-run --verbose

# Test AI integration
OPENAI_API_KEY=test node analyze-bugs.js --days=7 --dry-run

# Validate configuration
node -e "require('./analyze-bugs.js').validateConfig()"
```

### Integration Testing
```bash
# Test GitHub workflow locally
act workflow_dispatch -e .github/workflows/daily-bug-analysis.yml

# Test with real data (limited scope)
node analyze-bugs.js --days=3 --max-recommendations=1
```

## 🔗 Related Systems

### App Store Feedback Integration
- Uses same label system for consistency
- Correlates App Store feedback with GitHub bugs
- Provides unified issue tracking across feedback sources

### Test Coverage Analysis
- Integrates with daily coverage analysis workflow
- Correlates low coverage areas with bug patterns
- Provides comprehensive testing recommendations

### Daily Automation
- Part of automated workflow ecosystem
- Coordinates with release automation and monitoring
- Provides insights for release quality assessment

## 📚 Examples

### Example Analysis Output
```
🔍 Starting GitHub bug analysis...
📊 Found 12 bug issues in the last 30 days
🧠 AI analysis enabled - analyzing patterns...
🎯 Detected 3 significant patterns:
   • puzzle-generation: 5 issues (array bounds, validation)
   • power-surge-system: 3 issues (timer reset, state management)
   • ui-ux-feedback: 4 issues (touch targets, accessibility)

🧪 Generated 6 testing recommendations:
   ✅ Unit tests for puzzle generation edge cases
   ✅ Integration tests for power surge timer lifecycle
   ✅ Accessibility testing for UI components
   ✅ Edge case validation for array operations
   ✅ State management testing for power surge
   ✅ Touch target validation testing

📝 Created 3 GitHub issues for high-priority improvements
✅ Analysis completed successfully
```

### Example Recommendation Issue
```markdown
# 🧪 Testing: Improve coverage for puzzle-generation - Array bounds validation

## 🐛 Pattern Analysis
AI analysis detected 5 similar issues related to array bounds checking in puzzle generation:
- Issue #45: Array index out of bounds in pattern generation
- Issue #52: Undefined array access in serial reasoning puzzles
- Issue #58: Invalid hiddenIndex causing crashes

## 🎯 Root Cause
Missing bounds validation when accessing puzzle arrays, particularly in:
- `generatePatternPuzzle()` functions
- `hiddenIndex` calculations
- Dynamic array operations

## 🧪 Recommended Test Cases

### Unit Tests
1. **Bounds checking for all array operations**
   ```typescript
   describe('Puzzle Generation Bounds', () => {
     it('should validate hiddenIndex is within array bounds', () => {
       // Test cases for edge conditions
     });
   });
   ```

2. **Edge cases for empty or invalid arrays**
3. **Validation for negative indices**

### Integration Tests
1. **End-to-end puzzle generation validation**
2. **Cross-puzzle type bounds checking**

## 📊 Success Metrics
- Zero array bounds exceptions in puzzle generation
- 100% bounds validation coverage
- Edge case testing for all array operations

## 🏷️ Labels
`test-coverage`, `auto-generated`, `puzzle-generation`, `high-priority`, `needs-attention`

---
*Generated by AI-powered bug analysis - Confidence: 89%*
```

## 🆘 Troubleshooting

### Common Issues

#### No AI Analysis
**Problem**: AI analysis disabled or failing
**Solution**:
- Check `OPENAI_API_KEY` environment variable
- Verify API quota and permissions
- Use `--no-ai` flag to disable AI analysis

#### GitHub API Rate Limits
**Problem**: Too many API requests
**Solution**:
- Reduce `DAYS_BACK` parameter
- Increase `GITHUB_API_DELAY` setting
- Use authenticated token for higher limits

#### No Bugs Found
**Problem**: Analysis finds no issues
**Solution**:
- Verify bug labels in configuration
- Check date range with `--days` parameter
- Include closed issues with `--include-closed`

#### Duplicate Recommendations
**Problem**: Same recommendations created multiple times
**Solution**:
- System includes built-in deduplication
- Check existing issues before manual runs
- Use `--dry-run` to preview recommendations

### Debug Commands
```bash
# Debug mode with full logging
DEBUG=* node analyze-bugs.js --verbose

# Test GitHub connection
node -e "console.log(process.env.GITHUB_TOKEN ? 'Token found' : 'No token')"

# Test AI connection
node -e "console.log(process.env.OPENAI_API_KEY ? 'AI key found' : 'No AI key')"

# Validate repository
git remote -v
```

## 📅 Maintenance

### Regular Tasks
1. **Weekly**: Review generated recommendations and implementation progress
2. **Monthly**: Analyze pattern detection accuracy and adjust thresholds
3. **Quarterly**: Update AI prompts based on new bug categories

### Configuration Updates
- Update bug labels as new categories emerge
- Adjust AI confidence thresholds based on accuracy
- Tune pattern detection parameters for repository size

### Integration Maintenance
- Keep dependencies updated (`@octokit/rest`, `openai`)
- Monitor API usage and rate limits
- Update GitHub workflow triggers as needed

---

*This system is part of the comprehensive automation suite for the Gifted Minds project, providing AI-powered insights to improve code quality and prevent recurring bugs.*