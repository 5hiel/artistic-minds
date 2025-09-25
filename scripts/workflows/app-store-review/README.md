# App Store Review Workflow

Tools for checking and managing App Store Connect review status programmatically.

## Scripts

### 📱 `quick-check.js` - **Fast Review Status Checker**
- **Purpose**: Quick programmatic check of App Store Connect review status
- **Usage**: `node scripts/workflows/app-store-review/quick-check.js [ISSUER_ID] [KEY_ID] [APP_ID] [KEY_PATH]`
- **Output**: Current review status with emoji indicators
- **Best for**: Scripts, automation, quick status checks
- **Requirements**: App Store Connect API credentials

### 🔍 `check-review-status.js` - **Interactive Review Checker**
- **Purpose**: Step-by-step interactive review status checker
- **Usage**: `node scripts/workflows/app-store-review/check-review-status.js`
- **Features**: Prompts for credentials, detailed explanations
- **Best for**: First-time setup, manual checks, troubleshooting

### 📤 `submit-for-review.js` - **Manual Submission Tool**
- **Purpose**: Submit specific app version for App Store review via API
- **Usage**: `node scripts/workflows/app-store-review/submit-for-review.js [VERSION_ID]`
- **Features**: List available versions, programmatic submission
- **Best for**: Manual review submissions outside automation

### 📖 `APP_STORE_API_SETUP.md` - **Complete Setup Guide**
- **Purpose**: Step-by-step guide for App Store Connect API setup
- **Covers**: API key creation, finding App ID, security best practices
- **Essential**: Read this before using any review status scripts

## Quick Commands

```bash
# Fast status check (if env vars are set)
node scripts/workflows/app-store-review/quick-check.js

# Interactive status check
node scripts/workflows/app-store-review/check-review-status.js

# Quick check with parameters
node scripts/workflows/app-store-review/quick-check.js c40803b3-bacc-458b-8485-60029ade2485 7VNJ8VMUU2 6751567047 ./AuthKey_7VNJ8VMUU2.p8
```

## Environment Variables

Set these for easier usage:
```bash
export APP_STORE_CONNECT_ISSUER_ID="your-issuer-id"
export APP_STORE_CONNECT_KEY_ID="your-key-id"
export APP_STORE_APP_ID="your-app-id"
export APP_STORE_CONNECT_PRIVATE_KEY_PATH="./AuthKey_XXX.p8"
```

## Status Meanings

- 🎉 **READY_FOR_SALE**: Live on App Store
- ⏰ **WAITING_FOR_REVIEW**: Waiting for Apple review
- ⏳ **IN_REVIEW**: Currently being reviewed by Apple
- ✅ **PENDING_APPLE_RELEASE**: Approved - Pending release
- ✅ **PENDING_DEVELOPER_RELEASE**: Approved - Ready for manual release
- ❌ **REJECTED**: Rejected by Apple