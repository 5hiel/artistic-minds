# Daily Release Workflow

Automated daily release system that intelligently builds and submits apps to the App Store.

## Scripts

### 🤖 `auto-daily-release.js` - **Main Automation Script**
- **Purpose**: Checks for pending reviews at midnight; builds & submits if conditions are met
- **Logic**: Only builds if (1) no pending reviews AND (2) git changes since last build
- **Usage**: `node scripts/workflows/daily-release/auto-daily-release.js [--dry-run]`
- **Features**: Smart review detection, git change detection, logging, notifications
- **Configuration**: Uses environment variables or `daily-release-config.env`

### ⚙️ `daily-release-config.env` - **Configuration File**
- **Purpose**: Environment variables for daily release automation
- **Usage**: `source scripts/workflows/daily-release/daily-release-config.env`
- **Includes**: API credentials, build settings, notification configs
- **Note**: Copy to `.env` or source before running automation

### 📅 `setup-daily-cron.sh` - **Cron Job Setup**
- **Purpose**: Install daily midnight cron job for automated releases
- **Usage**: `./scripts/workflows/daily-release/setup-daily-cron.sh`
- **Creates**: Cron job running at 00:00 daily
- **Logs**: All activity logged to `logs/daily-release.log`

### 📊 `manage-logs.sh` - **Log Management**
- **Purpose**: View, monitor, and maintain daily release logs
- **Usage**: `./scripts/workflows/daily-release/manage-logs.sh <command>`
- **Commands**: view, follow, list, clean, archive, size, stats
- **Features**: Real-time viewing, statistics, cleanup, archiving
- **Auto-rotation**: Logs rotate every 7 days automatically

## Quick Start

```bash
# Configure (edit credentials first)
source scripts/workflows/daily-release/daily-release-config.env

# Test the automation (safe)
node scripts/workflows/daily-release/auto-daily-release.js --dry-run

# Setup daily automation
./scripts/workflows/daily-release/setup-daily-cron.sh

# Monitor logs
./scripts/workflows/daily-release/manage-logs.sh follow
```

## Requirements

- Node.js with npm/npx
- EAS CLI (`npm install -g @expo/eas-cli`)
- App Store Connect API credentials (see app-store-review workflow)
- Git repository with commit history