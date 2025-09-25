#!/bin/bash

# Setup Daily Release Cron Job
# Runs the auto-daily-release script every day at midnight

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
CRON_SCRIPT="$SCRIPT_DIR/auto-daily-release.js"
LOG_FILE="$PROJECT_DIR/logs/daily-release.log"

echo "🕛 Setting up daily release cron job..."
echo "Script location: $CRON_SCRIPT"
echo "Log location: $LOG_FILE"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Cron job command (runs at midnight daily)
CRON_COMMAND="0 0 * * * cd $PROJECT_DIR && /usr/bin/env node $CRON_SCRIPT >> $LOG_FILE 2>&1"

# Add to cron (check if already exists first)
if crontab -l 2>/dev/null | grep -q "auto-daily-release.js"; then
    echo "⚠️  Cron job already exists. Remove it first with:"
    echo "   crontab -e"
    echo "   # Delete the line containing 'auto-daily-release.js'"
    exit 1
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
    echo "✅ Daily release cron job added successfully!"
    echo ""
    echo "📅 Schedule: Every day at midnight (00:00)"
    echo "📝 Command: $CRON_COMMAND"
    echo ""
    echo "🔍 View current cron jobs:"
    echo "   crontab -l"
    echo ""
    echo "📊 Monitor logs:"
    echo "   tail -f $LOG_FILE"
    echo ""
    echo "🧪 Test the script manually:"
    echo "   node $CRON_SCRIPT --dry-run"
fi