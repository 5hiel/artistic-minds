#!/usr/bin/env node

/**
 * App Store Connect API Review Status Checker
 * 
 * Setup Instructions:
 * 1. Go to App Store Connect → Users and Access → Integrations → App Store Connect API
 * 2. Create an API Key with "Developer" role
 * 3. Download the .p8 file and note the Key ID and Issuer ID
 * 4. Set environment variables or use the interactive setup below
 */

const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const readline = require('readline');

// Status mapping for better readability
const STATUS_MEANINGS = {
  'DEVELOPER_REMOVED_FROM_SALE': '❌ Removed from sale',
  'DEVELOPER_REJECTED': '❌ Developer rejected',
  'IN_REVIEW': '⏳ In review with Apple',
  'INVALID_BINARY': '❌ Invalid binary',
  'METADATA_REJECTED': '❌ Metadata rejected',
  'PENDING_APPLE_RELEASE': '✅ Approved - Pending release',
  'PENDING_DEVELOPER_RELEASE': '✅ Approved - Ready for manual release',
  'PREPARE_FOR_SUBMISSION': '📝 Prepare for submission',
  'PREORDER_READY_FOR_SALE': '🛒 Pre-order ready',
  'PROCESSING_FOR_APP_STORE': '⚙️ Processing for App Store',
  'READY_FOR_SALE': '🎉 Live on App Store',
  'REJECTED': '❌ Rejected by Apple',
  'REMOVED_FROM_SALE': '❌ Removed from sale',
  'WAITING_FOR_REVIEW': '⏰ Waiting for review',
  'REPLACED_WITH_NEW_VERSION': '🔄 Replaced with new version'
};

async function getAPICredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  try {
    console.log('\n📱 App Store Connect API Setup');
    console.log('Need help? Visit: https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api\n');

    const ISSUER_ID = process.env.APP_STORE_CONNECT_ISSUER_ID || await question('Issuer ID (from App Store Connect API): ');
    const KEY_ID = process.env.APP_STORE_CONNECT_KEY_ID || await question('Key ID (from your .p8 file): ');
    const APP_ID = process.env.APP_STORE_APP_ID || await question('App ID (numeric, from App Store Connect): ');
    
    let PRIVATE_KEY = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
    if (!PRIVATE_KEY) {
      const keyPath = await question('Path to .p8 private key file: ');
      if (fs.existsSync(keyPath)) {
        PRIVATE_KEY = fs.readFileSync(keyPath, 'utf8');
      } else {
        throw new Error('Private key file not found');
      }
    }

    rl.close();
    return { ISSUER_ID, KEY_ID, PRIVATE_KEY, APP_ID };
  } catch (error) {
    rl.close();
    throw error;
  }
}

async function checkAppReviewStatus() {
  console.log('🔍 Checking App Store review status...\n');

  try {
    const { ISSUER_ID, KEY_ID, PRIVATE_KEY, APP_ID } = await getAPICredentials();

    // Generate JWT token
    const token = jwt.sign({}, PRIVATE_KEY, {
      issuer: ISSUER_ID,
      keyid: KEY_ID,
      audience: 'appstoreconnect-v1',
      algorithm: 'ES256',
      expiresIn: '20m'
    });

    // Get all app versions (not just pending ones)
    const options = {
      hostname: 'api.appstoreconnect.apple.com',
      path: `/v1/apps/${APP_ID}/appStoreVersions?sort=-createdDate&limit=5`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.errors) {
              console.error('❌ API Error:', response.errors[0].detail);
              reject(new Error(response.errors[0].detail));
              return;
            }

            console.log('📱 App Store Versions (Recent 5):\n');
            
            if (response.data && response.data.length > 0) {
              response.data.forEach((version, index) => {
                const status = version.attributes.appStoreState;
                const statusIcon = STATUS_MEANINGS[status] || `❓ ${status}`;
                const isLatest = index === 0 ? ' (Latest)' : '';
                
                console.log(`📦 Version ${version.attributes.versionString}${isLatest}`);
                console.log(`   Status: ${statusIcon}`);
                console.log(`   Created: ${new Date(version.attributes.createdDate).toLocaleString()}`);
                if (version.attributes.releaseType) {
                  console.log(`   Release: ${version.attributes.releaseType}`);
                }
                console.log('');
              });

              const latestVersion = response.data[0];
              resolve(latestVersion.attributes.appStoreState);
            } else {
              console.log('No app versions found.');
              resolve(null);
            }
          } catch (error) {
            console.error('❌ Failed to parse API response:', error.message);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Network error:', error.message);
        reject(error);
      });

      req.end();
    });

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkAppReviewStatus()
    .then((status) => {
      if (status) {
        console.log(`\n🎯 Current status: ${STATUS_MEANINGS[status] || status}`);
      }
    })
    .catch((error) => {
      console.error('\n💥 Failed to check review status:', error.message);
      process.exit(1);
    });
}

module.exports = { checkAppReviewStatus };