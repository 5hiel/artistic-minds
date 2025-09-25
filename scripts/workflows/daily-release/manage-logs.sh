#!/bin/bash

# Log Management Script for Daily Release Automation
# Provides easy commands to view, clean, and manage log files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
LOG_FILE="$PROJECT_DIR/logs/daily-release.log"

case "${1:-help}" in
  "view"|"tail"|"show")
    echo "📋 Viewing latest log entries..."
    if [[ -f "$LOG_FILE" ]]; then
      tail -20 "$LOG_FILE"
    else
      echo "❌ No log file found: $LOG_FILE"
    fi
    ;;
    
  "follow"|"watch"|"live")
    echo "📊 Following log file (Ctrl+C to exit)..."
    if [[ -f "$LOG_FILE" ]]; then
      tail -f "$LOG_FILE"
    else
      echo "❌ No log file found: $LOG_FILE"
      echo "💡 Run a daily release check first: node scripts/workflows/daily-release/auto-daily-release.js --dry-run"
    fi
    ;;
    
  "list"|"ls")
    echo "📋 Available log files:"
    ls -la "$PROJECT_DIR/logs"/*.log 2>/dev/null || echo "No log files found"
    ;;
    
  "clean")
    echo "🧹 Cleaning old log files..."
    find "$PROJECT_DIR/logs" -name "daily-release-*.log" -mtime +30 -delete
    echo "✅ Deleted log files older than 30 days"
    ;;
    
  "archive")
    echo "📦 Archiving current logs..."
    TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
    ARCHIVE_DIR="$PROJECT_DIR/logs/log-archive-$TIMESTAMP"
    mkdir -p "$ARCHIVE_DIR"
    mv "$PROJECT_DIR/logs"/*.log "$ARCHIVE_DIR"/ 2>/dev/null || echo "No log files to archive"
    echo "✅ Logs archived to: $ARCHIVE_DIR"
    ;;
    
  "size")
    echo "📊 Log file sizes:"
    du -sh "$PROJECT_DIR/logs"/*.log 2>/dev/null || echo "No log files found"
    ;;
    
  "stats")
    echo "📈 Log statistics:"
    if [[ -f "$LOG_FILE" ]]; then
      echo "Current log: $(wc -l < "$LOG_FILE") lines"
      echo "Created: $(stat -f "%SB" "$LOG_FILE")"
      echo "Size: $(du -sh "$LOG_FILE" | cut -f1)"
      echo ""
      echo "Recent activity:"
      grep "Daily Release Check Started" "$LOG_FILE" | tail -5
    else
      echo "❌ No current log file found"
    fi
    ;;
    
  "help"|*)
    echo "📋 Daily Release Log Manager"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  view, tail, show    Show last 20 log entries"
    echo "  follow, watch, live Follow log in real-time"
    echo "  list, ls            List all log files"
    echo "  clean               Delete logs older than 30 days"
    echo "  archive             Archive all current logs"
    echo "  size                Show log file sizes"
    echo "  stats               Show log statistics"
    echo "  help                Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 view             # Show recent logs"
    echo "  $0 follow           # Watch logs live"
    echo "  $0 clean            # Clean old logs"
    ;;
esac