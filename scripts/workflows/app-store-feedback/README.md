# App Store Feedback to GitHub Issues

Automatically fetch App Store reviews and create corresponding GitHub issues with intelligent categorization and deduplication.

## Overview

This system provides comprehensive automation for monitoring and managing App Store feedback:

- **Fetch Reviews**: Pull customer reviews from App Store Connect API
- **Smart Categorization**: Automatically label issues based on content and rating
- **Deduplication**: Prevent duplicate issues using content hashing
- **GitHub Integration**: Create well-formatted issues with metadata
- **Multi-Trigger Support**: Manual, scheduled, and CLI execution

## Quick Start

### 1. Setup Credentials

Copy and configure the environment file:
```bash
cp feedback-config.env feedback-config.local.env
# Edit feedback-config.local.env with your actual credentials
source feedback-config.local.env
```

Required credentials:
- **App Store Connect API**: Issuer ID, Key ID, App ID, Private Key (.p8 file)
- **GitHub Token**: Use existing `CLAUDE_CODE_OAUTH_TOKEN` or create personal access token

### 2. Test with Dry Run

```bash
# Fetch last 7 days of reviews (dry run)
node fetch-reviews.js --days=7 --dry-run --verbose

# Test issue creation
node fetch-reviews.js --days=7 --output=test-reviews.json
node create-github-issues.js test-reviews.json --dry-run --verbose
```

### 3. Run Full Sync

```bash
# Fetch and process all recent reviews
node fetch-reviews.js --days=7 --output=reviews.json
node create-github-issues.js reviews.json
```

## Usage Examples

### Command Line Usage

**Fetch Reviews:**
```bash
# Last 7 days of all reviews
node fetch-reviews.js --days=7 --output=reviews.json

# Only critical reviews (1-2 stars) from last 30 days
node fetch-reviews.js --days=30 --min-rating=1 --max-rating=2 --output=critical.json

# Reviews since specific date
node fetch-reviews.js --since=2025-01-01 --output=january.json

# Dry run with verbose output
node fetch-reviews.js --days=3 --dry-run --verbose
```

**Create Issues:**
```bash
# Create issues from reviews file
node create-github-issues.js reviews.json

# Dry run to preview what would be created
node create-github-issues.js reviews.json --dry-run

# Read from stdin (pipe from fetch script)
node fetch-reviews.js --days=1 | node create-github-issues.js --stdin
```

### GitHub Workflow Usage

**Manual Execution:**
1. Go to Actions tab in GitHub
2. Select "App Store › Feedback to GitHub Issues"
3. Click "Run workflow"
4. Configure parameters:
   - Days back: 7
   - Rating range: 1-5
   - Critical only: false
   - Dry run: false

**Scheduled Execution:**
- Runs daily at 6 AM PST (after daily release automation)
- Processes last 7 days of reviews
- Creates issues for all ratings

**CLI Trigger:**
```bash
# Using GitHub CLI
gh workflow run app-store-feedback-sync.yml \
  -f days_back=7 \
  -f min_rating=1 \
  -f max_rating=5 \
  -f dry_run=false

# Using repository dispatch
gh api repos/{owner}/{repo}/dispatches \
  --method POST \
  --field event_type='app-store-feedback-sync' \
  --field client_payload='{"days_back":"7","critical_only":"true"}'
```

## Configuration

### Environment Variables

Set these in `feedback-config.env` or as environment variables:

```bash
# App Store Connect API (required)
APP_STORE_CONNECT_ISSUER_ID=your-issuer-id
APP_STORE_CONNECT_KEY_ID=your-key-id
APP_STORE_APP_ID=your-app-id
APP_STORE_CONNECT_PRIVATE_KEY_PATH=./AuthKey_XXXXXXXXXX.p8

# GitHub API (required)
GITHUB_TOKEN=$CLAUDE_CODE_OAUTH_TOKEN

# Processing options (optional)
FEEDBACK_DAYS_BACK=7
FEEDBACK_MIN_RATING=1
FEEDBACK_MAX_RATING=5
FEEDBACK_CRITICAL_ONLY=false
```

### Label System

Reviews are automatically categorized with these labels:

**Rating-Based:**
- `rating-1-star` through `rating-5-star`
- `critical-feedback` (1-2 stars)

**Content-Based:**
- `bug-report`: crashes, freezing, technical issues
- `feature-request`: new features, improvements
- `ui-ux-feedback`: interface and usability
- `performance-issue`: slow loading, lag, battery
- `difficulty-feedback`: too easy/hard
- `accessibility`: accessibility concerns

**Game-Specific (for puzzle apps):**
- `puzzle-generation`: puzzle variety and generation
- `power-surge-system`: timer and scoring mechanics
- `adaptive-learning`: difficulty adjustment
- `level-progression`: level unlocking and progression
- `scoring-system`: points and high scores

**Technical:**
- `ios-specific`, `android-specific`, `web-version`
- `crashes`: stability issues
- `version-X.X.X`: version-specific feedback

**Process:**
- `auto-generated`: created by this system
- `user-feedback`: general user feedback
- `needs-developer-response`: should respond on App Store
- `quick-win`: easy fixes for user satisfaction
- `investigate`: needs further research

## Architecture

### Components

1. **fetch-reviews.js**: App Store Connect API integration
   - JWT authentication using your existing credentials
   - Pagination support for large review sets
   - Smart deduplication using review IDs and content hashing
   - Rate limiting compliance (180 requests/minute)

2. **create-github-issues.js**: GitHub issues creation
   - Automatic label creation and management
   - Rich issue templates with metadata
   - Content enhancement with sentiment analysis
   - Duplicate detection and prevention

3. **feedback-config.env**: Configuration template
   - Environment variable definitions
   - Processing options and thresholds
   - Rate limiting and notification settings

4. **GitHub Workflow**: Automated execution
   - Multi-trigger support (manual, scheduled, CLI)
   - Configurable parameters
   - Comprehensive logging and artifacts
   - Integration with existing CI/CD patterns

### Data Flow

```
App Store Connect API → fetch-reviews.js → reviews.json → create-github-issues.js → GitHub Issues
```

### Deduplication Strategy

**Primary Key**: Review ID from App Store Connect
**Content Hashing**: MD5 hash of title + body (case-insensitive)
**Storage**: `deduplication-store.json` tracks processed reviews
**Lookback**: 30 days (configurable) for duplicate detection

### Rate Limiting

**App Store Connect API**: 180 requests/minute (Apple's limit)
**GitHub API**: 60 requests/minute (personal token) or 5000 (app token)
**Implementation**: Automatic delays between requests

## Issue Templates

### Standard Issue Format

```markdown
## App Store Review

**Rating:** ⭐⭐⭐⭐⭐ (5/5)
**Date:** 2025-01-15
**Version:** 1.2.3
**Territory:** US

### Review Title
Great puzzle game!

### Review Content
Love the adaptive difficulty and power surge system. More puzzle types would be awesome!

---

**Review ID:** `abc123`
**Storefront:** US

### Sentiment Analysis
**Detected Sentiment:** Positive

### Auto-Generated Labels
This issue was automatically categorized with the following labels:
- `rating-5-star`
- `feature-request`
- `power-surge-system`
- `sentiment-positive`
```

### Critical Review Enhancements

For 1-2 star reviews, issues include:

```markdown
### Suggested Actions
- [ ] Investigate reported issue
- [ ] Consider responding to review on App Store Connect
- [ ] Monitor for similar feedback patterns
- [ ] Reproduce bug in testing environment
- [ ] Create fix and test thoroughly
```

## Integration with Existing Workflows

### Follows Your Project Patterns

**Authentication**: Uses your existing App Store Connect API credentials
**GitHub Token**: Leverages `CLAUDE_CODE_OAUTH_TOKEN`
**Scheduling**: Runs after daily release automation (6 AM PST)
**Logging**: Consistent with your automation logging patterns
**Error Handling**: Comprehensive retry logic and failure notifications

### CI/CD Integration

**Artifacts**: Reviews and logs saved for 30 days
**Notifications**: Integration points for Slack/email alerts
**Failure Handling**: Critical failure detection for scheduled runs
**Security**: Automatic cleanup of sensitive credentials

## Monitoring and Maintenance

### View Results

**GitHub Actions**: Check workflow runs in Actions tab
**Artifacts**: Download reviews and processing logs
**Issues**: Monitor created issues with `auto-generated` label
**Summary**: View run summaries in workflow step summaries

### Maintenance Tasks

**Weekly**: Review created issues and categorization accuracy
**Monthly**: Clean up resolved issues and update label system
**Quarterly**: Analyze feedback trends and update categorization rules

### Troubleshooting

**Common Issues:**

1. **No reviews found**: Check date range and App Store Connect credentials
2. **Rate limiting**: Reduce concurrent requests or increase delays
3. **Duplicate issues**: Verify deduplication store integrity
4. **Missing labels**: Run workflow once to create all required labels
5. **API errors**: Check credential expiration and permissions

**Debug Mode:**
```bash
# Enable verbose logging
node fetch-reviews.js --days=1 --verbose --dry-run

# Check API connection
node fetch-reviews.js --help  # Shows configuration validation
```

## Advanced Configuration

### Custom Label Categories

Edit `fetch-reviews.js` to modify `LABEL_CATEGORIES` object:

```javascript
CONTENT_KEYWORDS: {
  'custom-feature': ['specific', 'keywords', 'here'],
  'bug-type-crash': ['crash', 'freeze', 'stuck'],
  // Add your custom categorization rules
}
```

### Notification Integration

Set environment variables for notifications:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
NOTIFICATION_EMAIL=dev-team@example.com
```

### Processing Filters

**Territory Filtering**: Process reviews from specific regions
**Version Filtering**: Focus on specific app versions
**Content Filtering**: Skip reviews matching certain patterns

## Security Considerations

**Credential Storage**: Private keys stored in GitHub Secrets
**Token Permissions**: Minimal required permissions (issues: write)
**Data Handling**: Automatic cleanup of sensitive files
**Rate Limiting**: Respects API limits to prevent account issues

## Support

**Documentation**: This README and inline code comments
**Examples**: Complete usage examples in each script
**Error Messages**: Comprehensive error reporting with suggestions
**Logging**: Detailed execution logs for debugging

For issues or questions, check the project's main documentation or create an issue with the `investigate` label.