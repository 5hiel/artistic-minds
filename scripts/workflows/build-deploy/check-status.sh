#!/bin/bash

# Simple script to check app build and submission status using EAS CLI

echo "🔍 Checking app build and submission status..."

# Check recent builds
echo -e "\n🏗️ Recent Builds:"
npx eas build:list --limit 5 --json 2>/dev/null | jq -r '.[] | "Platform: \(.platform) | Status: \(.status) | Version: \(.appVersion // "N/A") | Created: \(.createdAt)"' 2>/dev/null || {
    echo "Fetching builds without jq formatting:"
    npx eas build:list --limit 5 2>/dev/null || echo "Unable to fetch build data"
}

# Note: There's no direct submission status command in EAS CLI
# You need to check App Store Connect or Google Play Console directly

echo -e "\n📱 For App Store submission status:"
echo "• Check App Store Connect: https://appstoreconnect.apple.com"
echo "• Or use App Store Connect API (see check-review-status.js)"

echo -e "\n🤖 For Google Play submission status:"  
echo "• Check Google Play Console: https://play.google.com/console"
echo "• Or use Google Play Developer API"

echo -e "\n💡 Tip: Run 'npx eas build:view [BUILD_ID]' to see details of a specific build"