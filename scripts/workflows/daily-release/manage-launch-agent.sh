#!/bin/bash

# Manage Daily Release LaunchAgent
# Usage: ./manage-launch-agent.sh [load|unload|start|stop|status|logs]

AGENT_NAME="com.giftedminds.daily-release"
PLIST_PATH="$HOME/Library/LaunchAgents/$AGENT_NAME.plist"

case "$1" in
    load)
        echo "🔄 Loading LaunchAgent..."
        launchctl load "$PLIST_PATH"
        echo "✅ LaunchAgent loaded. It will run daily at midnight."
        ;;
    unload)
        echo "🔄 Unloading LaunchAgent..."
        launchctl unload "$PLIST_PATH"
        echo "✅ LaunchAgent unloaded."
        ;;
    start)
        echo "🚀 Starting LaunchAgent manually..."
        launchctl start "$AGENT_NAME"
        echo "✅ LaunchAgent started. Check logs for results."
        ;;
    stop)
        echo "🛑 Stopping LaunchAgent..."
        launchctl stop "$AGENT_NAME"
        echo "✅ LaunchAgent stopped."
        ;;
    status)
        echo "📊 LaunchAgent Status:"
        if launchctl list | grep -q "$AGENT_NAME"; then
            echo "✅ LaunchAgent is loaded and scheduled"
            launchctl list | grep "$AGENT_NAME"
        else
            echo "❌ LaunchAgent is not loaded"
        fi
        echo ""
        echo "📄 Configuration file: $PLIST_PATH"
        if [ -f "$PLIST_PATH" ]; then
            echo "✅ Configuration file exists"
        else
            echo "❌ Configuration file missing"
        fi
        ;;
    logs)
        echo "📋 Recent LaunchAgent activity:"
        tail -10 logs/daily-release.log
        ;;
    test)
        echo "🧪 Testing LaunchAgent (dry run)..."
        launchctl start "$AGENT_NAME"
        echo "⏳ Waiting for test to complete..."
        sleep 5
        echo "📋 Latest log entries:"
        tail -5 logs/daily-release.log
        ;;
    *)
        echo "🍎 Daily Release LaunchAgent Manager"
        echo ""
        echo "Usage: $0 {load|unload|start|stop|status|logs|test}"
        echo ""
        echo "Commands:"
        echo "  load    - Load the LaunchAgent (enable daily automation)"
        echo "  unload  - Unload the LaunchAgent (disable daily automation)" 
        echo "  start   - Start the LaunchAgent manually (test run)"
        echo "  stop    - Stop the LaunchAgent"
        echo "  status  - Show LaunchAgent status"
        echo "  logs    - Show recent log entries"
        echo "  test    - Run a test and show results"
        echo ""
        echo "Current status:"
        if launchctl list | grep -q "$AGENT_NAME"; then
            echo "✅ LaunchAgent is loaded and will run daily at midnight"
        else
            echo "❌ LaunchAgent is not loaded - run '$0 load' to enable"
        fi
        ;;
esac