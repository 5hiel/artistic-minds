# App Store Connect API Setup Guide

To check your app review status programmatically, you need to set up App Store Connect API access.

## Step 1: Create API Key in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access** → **Integrations** → **App Store Connect API**
3. Click **Generate API Key**
4. Give it a name (e.g., "Review Status Checker")
5. Set role to **Developer** (minimum required)
6. Click **Generate**
7. **Download the .p8 file immediately** (you can only download it once!)
8. Note down the **Key ID** and **Issuer ID**

## Step 2: Find Your App ID

1. In App Store Connect, go to **My Apps**
2. Click on your "Gifted Minds" app
3. Go to **App Information**
4. Copy the **Apple ID** (numeric value like 123456789)

## Step 3: Run the Status Checker

### Option A: Interactive Setup (Easiest)
```bash
node check-review-status.js
```
The script will prompt you for:
- Issuer ID
- Key ID  
- App ID
- Path to your .p8 file

### Option B: Environment Variables
```bash
export APP_STORE_CONNECT_ISSUER_ID="your-issuer-id"
export APP_STORE_CONNECT_KEY_ID="your-key-id"  
export APP_STORE_APP_ID="your-app-id"
export APP_STORE_CONNECT_PRIVATE_KEY="$(cat path/to/your/key.p8)"

node check-review-status.js
```

## What You'll See

The script will show:
- ✅ **READY_FOR_SALE** - Live on App Store
- ⏰ **WAITING_FOR_REVIEW** - In review queue
- ⏳ **IN_REVIEW** - Currently being reviewed
- ✅ **PENDING_APPLE_RELEASE** - Approved, waiting for release
- ❌ **REJECTED** - Rejected by Apple
- 📝 **PREPARE_FOR_SUBMISSION** - Draft, not submitted yet

## Security Notes

- Keep your .p8 file secure and never commit it to git
- The API key has access to your app data
- Consider using environment variables in production
- Rotate keys periodically for security

## Troubleshooting

- **403 Forbidden**: Check your API key permissions
- **404 Not Found**: Verify your App ID is correct
- **Invalid JWT**: Check your Key ID and Issuer ID
- **File not found**: Verify the path to your .p8 file

## Need Help?

- [App Store Connect API Documentation](https://developer.apple.com/documentation/appstoreconnectapi)
- [Creating API Keys Guide](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)