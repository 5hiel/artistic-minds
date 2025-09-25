#!/bin/bash

# Clean up test artifacts and temporary files
# Run this script to clean up after testing

echo "🧹 Cleaning up test artifacts..."

# Remove Playwright test files
rm -f test-game-automation.js
rm -f usability-test.js

# Remove screenshot files
rm -f screenshot-*.png
rm -f test-*.png

# Remove test results
rm -f usability-results.json
rm -f test-report.md

# Remove any remaining pid files
rm -f web-server.pid

echo "✅ Cleanup complete!"

# Optionally show what remains
echo ""
echo "📁 Current directory contents:"
ls -la | grep -E "(test|screenshot|usability)" || echo "No test artifacts remaining"