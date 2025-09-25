# Daily Test Coverage Analysis

Automated system for analyzing test coverage and creating GitHub issues for files that need improved testing.

## Overview

This system provides comprehensive automation for monitoring and improving test coverage:

- **Daily Analysis**: Automated coverage analysis with configurable thresholds
- **Smart Issue Creation**: Creates GitHub issues for files below coverage thresholds
- **Intelligent Prioritization**: Prioritizes files by coverage level and importance
- **Comprehensive Reporting**: Detailed reports with metrics and recommendations
- **Rate Limiting**: Prevents issue spam with configurable limits

## Quick Start

### 1. Manual Execution

```bash
cd scripts/workflows/test-coverage

# Basic analysis with issue creation
node analyze-coverage.js

# Dry run to preview what would be created
node analyze-coverage.js --dry-run --verbose

# Custom thresholds
node analyze-coverage.js --min-coverage=80 --max-issues=3
```

### 2. GitHub Actions (Recommended)

The system automatically runs daily at 7 AM PST via GitHub Actions:

**Manual Trigger:**
1. Go to Actions → "Test Coverage › Daily Analysis & Issue Creation"
2. Click "Run workflow"
3. Configure parameters:
   - Minimum coverage: 70%
   - Maximum issues: 5
   - Dry run: false
   - Verbose: true

**Scheduled Execution:**
- Runs automatically daily at 7 AM PST
- Analyzes all lib folder files
- Creates issues for files below thresholds
- Generates comprehensive reports

## Configuration

### Environment Variables

Copy and customize the configuration:
```bash
cp coverage-config.env my-coverage-config.env
# Edit my-coverage-config.env with your preferences
source my-coverage-config.env
```

**Key Settings:**
```bash
MIN_LINE_COVERAGE=70          # Minimum line coverage threshold
MIN_FUNCTION_COVERAGE=60      # Minimum function coverage threshold
MIN_BRANCH_COVERAGE=50        # Minimum branch coverage threshold
MAX_ISSUES_PER_RUN=5         # Maximum issues created per run
CREATE_GITHUB_ISSUES=true    # Enable issue creation
VERBOSE_MODE=false           # Enable detailed logging
```

### Priority Levels

Files are automatically prioritized based on coverage:

- **🔴 CRITICAL** (0-10%): Immediate attention required
- **🟠 HIGH** (11-30%): Should be addressed soon
- **🟡 MEDIUM** (31-60%): Moderate improvement needed
- **🟢 LOW** (61-80%): Minor improvements

## Usage Examples

### Command Line Usage

```bash
# Standard analysis
node analyze-coverage.js

# Analysis only (no issue creation)
node analyze-coverage.js --no-issues

# Strict thresholds
node analyze-coverage.js --min-coverage=80 --max-issues=2

# Development mode (verbose, dry-run)
node analyze-coverage.js --dry-run --verbose

# Custom configuration
MIN_LINE_COVERAGE=60 node analyze-coverage.js
```

### GitHub CLI Triggering

```bash
# Manual trigger
gh workflow run daily-test-coverage-analysis.yml

# With parameters
gh workflow run daily-test-coverage-analysis.yml \
  -f min_coverage=75 \
  -f max_issues=3 \
  -f dry_run=false

# Repository dispatch trigger
gh api repos/{owner}/{repo}/dispatches \
  --method POST \
  --field event_type='daily-coverage-analysis' \
  --field client_payload='{"min_coverage":"80","max_issues":"2"}'
```

## Features

### Smart Analysis

**File Categorization:**
- Puzzle files: Complex game logic requiring thorough testing
- Adaptive Engine: Critical learning algorithms needing high coverage
- Services: External integrations with platform-specific testing
- Storage: Data persistence requiring integrity validation

**Intelligent Recommendations:**
- File-type specific test suggestions
- Edge case identification
- Integration testing recommendations
- Performance test suggestions

### Issue Management

**Automated Issue Creation:**
- Rich issue templates with coverage metrics
- Specific test case recommendations
- Priority-based labeling
- Duplicate detection and prevention

**Issue Content:**
```markdown
## Test Coverage Issue
**File:** lib/example.ts
**Current Coverage:** 45/100 lines (45%), 8/15 functions (53%)
**Priority:** 🟡 MEDIUM

### Recommended Test Cases
- [ ] Test core functionality and public API methods
- [ ] Add edge case testing for error conditions
- [ ] Test integration with dependent components

### Success Criteria
- Achieve minimum 70% line coverage
- Include comprehensive edge case testing
```

### Reporting

**Comprehensive Reports** (`coverage-analysis-report.json`):
```json
{
  "summary": {
    "totalFiles": 43,
    "filesNeedingImprovement": 12,
    "averageCoverage": "67.8",
    "priorityCounts": {
      "CRITICAL": 2,
      "HIGH": 4,
      "MEDIUM": 6
    }
  },
  "issues": {
    "created": 5,
    "existing": 8,
    "maxPerRun": 5
  },
  "files": { /* detailed file-by-file coverage */ }
}
```

## Integration with Existing Workflows

### Follows Your Project Patterns

**GitHub Token**: Uses existing `CLAUDE_CODE_OAUTH_TOKEN`
**Scheduling**: Runs after App Store feedback sync (7 AM PST)
**Logging**: Consistent with your automation logging patterns
**Artifacts**: Reports and logs saved for 30 days
**Error Handling**: Comprehensive failure detection and reporting

### CI/CD Integration

**Quality Gates**: Fails workflow if average coverage drops below 50%
**Artifacts**: Saves reports, logs, and coverage data
**Notifications**: Integration points for Slack/Discord alerts
**Security**: Uses existing repository permissions and tokens

## Monitoring and Maintenance

### View Results

**GitHub Actions**: Check workflow runs in Actions tab
**Artifacts**: Download reports and logs from workflow runs
**Issues**: Monitor created issues with `test-coverage` label
**Summary**: View detailed summaries in workflow step summaries

### Maintenance Tasks

**Weekly**: Review created issues and progress on coverage improvements
**Monthly**: Adjust thresholds based on project evolution
**Quarterly**: Analyze trends and update file categorization rules

### Troubleshooting

**Common Issues:**

1. **Tests failing**: Check test environment and dependencies
2. **Coverage file missing**: Ensure npm test generates coverage/lcov.info
3. **Rate limiting**: Reduce MAX_ISSUES_PER_RUN or increase delays
4. **Permission errors**: Verify GITHUB_TOKEN has issues:write permission

**Debug Mode:**
```bash
# Enable detailed logging
node analyze-coverage.js --verbose --dry-run

# Check configuration
source coverage-config.env && node analyze-coverage.js --help
```

## Advanced Configuration

### Custom File Analysis

Modify the `categorizeFile()` function in `analyze-coverage.js` to customize:
- File type detection
- Priority calculation
- Recommendation generation

### Notification Integration

Set environment variables for notifications:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
NOTIFICATION_EMAIL=dev-team@example.com
```

### Custom Thresholds by File Type

```javascript
// In analyze-coverage.js, customize thresholds:
const FILE_TYPE_THRESHOLDS = {
  'puzzle': { line: 60, function: 50, branch: 40 },
  'adaptive-engine': { line: 80, function: 75, branch: 60 },
  'services': { line: 70, function: 60, branch: 50 },
  'storage': { line: 85, function: 80, branch: 70 }
};
```

## Script Architecture

### Core Components

1. **CoverageAnalyzer**: Main analysis class
   - Parses LCOV coverage data
   - Identifies files needing improvement
   - Generates issue content and recommendations

2. **GitHub Integration**: Issue management
   - Creates well-formatted issues
   - Checks for existing issues to prevent duplicates
   - Applies appropriate labels and priorities

3. **Reporting System**: Comprehensive analytics
   - File-by-file coverage analysis
   - Priority distribution
   - Performance metrics and trends

4. **Configuration System**: Flexible settings
   - Environment variable support
   - Command-line argument parsing
   - File-type specific configurations

### Data Flow

```
npm test (coverage) → LCOV parsing → File analysis → Issue generation → GitHub API → Report generation
```

## Security Considerations

**Token Management**: Uses existing GitHub tokens securely
**Rate Limiting**: Respects GitHub API limits to prevent account issues
**Permission Scope**: Requires only issues:write for issue creation
**Data Handling**: No sensitive data stored in reports or logs

## Performance

**Execution Time**: Typically 2-5 minutes depending on project size
**Memory Usage**: Optimized for large codebases
**API Efficiency**: Batched requests with appropriate delays
**Storage**: Minimal local storage footprint

The daily test coverage analysis system is now ready to help maintain and improve your code quality automatically! 🧪📊