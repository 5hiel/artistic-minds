#!/usr/bin/env node

/**
 * Quick App Store review status checker
 * Usage: node quick-check.js [ISSUER_ID] [KEY_ID] [APP_ID] [PATH_TO_P8_FILE]
 */

const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');

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

async function quickCheck(issuerId, keyId, appId, keyPath) {
  console.log('🔍 Checking App Store review status...\n');

  if (!issuerId || !keyId || !appId || !keyPath) {
    console.log('Usage: node quick-check.js [ISSUER_ID] [KEY_ID] [APP_ID] [PATH_TO_P8_FILE]');
    console.log('\nExample:');
    console.log('node quick-check.js c40803b3-bacc-458b-8485-60029ade2485 7VNJ8VMUU2 123456789 ./AuthKey_7VNJ8VMUU2.p8');
    console.log('\nOr set environment variables and run: node quick-check.js');
    console.log('- APP_STORE_CONNECT_ISSUER_ID');
    console.log('- APP_STORE_CONNECT_KEY_ID');
    console.log('- APP_STORE_APP_ID');
    console.log('- APP_STORE_CONNECT_PRIVATE_KEY_PATH');
    return;
  }

  try {
    // Read private key
    let privateKey;
    if (fs.existsSync(keyPath)) {
      privateKey = fs.readFileSync(keyPath, 'utf8');
    } else {
      throw new Error(`Private key file not found: ${keyPath}`);
    }

    // Generate JWT token
    const token = jwt.sign({}, privateKey, {
      issuer: issuerId,
      keyid: keyId,
      audience: 'appstoreconnect-v1',
      algorithm: 'ES256',
      expiresIn: '20m'
    });

    // API request - get more versions to find the highest version number
    const options = {
      hostname: 'api.appstoreconnect.apple.com',
      path: `/v1/apps/${appId}/appStoreVersions?limit=20`,
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

            // Optional debug logging (enable when needed)
            if (process.env.DEBUG_APP_STORE_API) {
              console.log('🔍 DEBUG: Raw API response data:');
              console.log(JSON.stringify(response.data.map(v => ({
                version: v.attributes.versionString,
                state: v.attributes.appStoreState,
                created: v.attributes.createdDate
              })), null, 2));
              console.log('🔍 DEBUG: Total versions found:', response.data.length);
              console.log('');
            }

            console.log('📱 App Store Versions:\n');

            if (response.data && response.data.length > 0) {
              // Sort versions by version number (semantic versioning)
              const sortedVersions = response.data.sort((a, b) => {
                const versionA = a.attributes.versionString.split('.').map(Number);
                const versionB = b.attributes.versionString.split('.').map(Number);

                for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
                  const numA = versionA[i] || 0;
                  const numB = versionB[i] || 0;
                  if (numA !== numB) {
                    return numB - numA; // Descending order (highest first)
                  }
                }
                return 0;
              });

              sortedVersions.forEach((version, index) => {
                const status = version.attributes.appStoreState;
                const statusIcon = STATUS_MEANINGS[status] || `❓ ${status}`;
                const isLatest = index === 0 ? ' (Latest)' : '';

                console.log(`📦 Version ${version.attributes.versionString}${isLatest}`);
                console.log(`   Status: ${statusIcon}`);
                console.log(`   Created: ${new Date(version.attributes.createdDate).toLocaleString()}`);
                console.log('');
              });

              const latestVersion = sortedVersions[0];
              console.log(`🎯 Current status: ${STATUS_MEANINGS[latestVersion.attributes.appStoreState] || latestVersion.attributes.appStoreState}`);
              console.log(`📋 Latest version found: ${latestVersion.attributes.versionString}`);
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
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Get parameters from command line or environment variables
const [,, issuerId, keyId, appId, keyPath] = process.argv;

const ISSUER_ID = issuerId || process.env.APP_STORE_CONNECT_ISSUER_ID;
const KEY_ID = keyId || process.env.APP_STORE_CONNECT_KEY_ID;
const APP_ID = appId || process.env.APP_STORE_APP_ID;
const KEY_PATH = keyPath || process.env.APP_STORE_CONNECT_PRIVATE_KEY_PATH;

quickCheck(ISSUER_ID, KEY_ID, APP_ID, KEY_PATH).catch(console.error);