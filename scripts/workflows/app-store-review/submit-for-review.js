#!/usr/bin/env node

/**
 * Submit app version for App Store review using App Store Connect API
 * Usage: node submit-for-review.js [VERSION_ID]
 */

const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');

async function submitForReview(issuerId, keyId, privateKey, versionId) {
  console.log('📱 Submitting app for App Store review...\n');

  try {
    // Generate JWT token with proper App Store Connect format
    const payload = {
      iss: issuerId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (20 * 60), // 20 minutes
      aud: 'appstoreconnect-v1'
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        kid: keyId,
        typ: 'JWT'
      }
    });

    // Create app store review submission
    const submissionData = {
      data: {
        type: 'appStoreReviewSubmissions',
        relationships: {
          appStoreVersion: {
            data: {
              type: 'appStoreVersions',
              id: versionId
            }
          }
        }
      }
    };

    // First, let's check what endpoints are available by getting the version details
    console.log('🔍 Checking version status before submission...');

    const checkOptions = {
      hostname: 'api.appstoreconnect.apple.com',
      path: `/v1/appStoreVersions/${versionId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    // Check version first
    const versionInfo = await new Promise((resolve, reject) => {
      const checkReq = https.request(checkOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('📦 Version Info:', response.data?.attributes);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      });
      checkReq.on('error', reject);
      checkReq.end();
    });

    if (versionInfo.data?.attributes?.appStoreState !== 'PREPARE_FOR_SUBMISSION') {
      throw new Error(`Version is not ready for submission. Current state: ${versionInfo.data?.attributes?.appStoreState}`);
    }

    // Try the correct submission endpoint
    const options = {
      hostname: 'api.appstoreconnect.apple.com',
      path: '/v1/appStoreReviewSubmissions',
      method: 'POST',
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
            console.log(`🔍 HTTP Status: ${res.statusCode}`);
            console.log(`🔍 Response Headers:`, res.headers);
            console.log(`🔍 Raw Response:`, data);

            const response = JSON.parse(data);

            if (response.errors) {
              console.error('❌ API Errors:', JSON.stringify(response.errors, null, 2));
              reject(new Error(response.errors[0].detail));
              return;
            }

            if (response.data) {
              console.log('✅ Successfully submitted for review!');
              console.log(`📦 Submission ID: ${response.data.id}`);
              console.log(`🎯 Status: ${response.data.attributes?.state || 'SUBMITTED'}`);
              resolve(response.data);
            } else {
              console.log('⚠️ Unexpected response format');
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

      req.write(JSON.stringify(submissionData));
      req.end();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function getAppVersions(issuerId, keyId, privateKey, appId) {
  // Get app versions that can be submitted
  const payload = {
    iss: issuerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (20 * 60), // 20 minutes
    aud: 'appstoreconnect-v1'
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: {
      kid: keyId,
      typ: 'JWT'
    }
  });

  const options = {
    hostname: 'api.appstoreconnect.apple.com',
    path: `/v1/apps/${appId}/appStoreVersions?filter[appStoreState]=PREPARE_FOR_SUBMISSION`,
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
          resolve(response.data || []);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main execution
async function main() {
  const [,, versionId] = process.argv;
  
  // Load credentials
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID || 'c40803b3-bacc-458b-8485-60029ade2485';
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID || '7VNJ8VMUU2';
  const appId = process.env.APP_STORE_APP_ID || '6751567047';
  
  let privateKey;
  const keyPath = './AuthKey_7VNJ8VMUU2.p8';
  if (fs.existsSync(keyPath)) {
    privateKey = fs.readFileSync(keyPath, 'utf8');
  } else {
    console.error('❌ Private key file not found:', keyPath);
    process.exit(1);
  }

  try {
    if (!versionId) {
      console.log('🔍 Finding available app versions to submit...\n');
      const versions = await getAppVersions(issuerId, keyId, privateKey, appId);
      
      if (versions.length === 0) {
        console.log('❌ No versions ready for submission found.');
        console.log('💡 Make sure your app version is in "Prepare for Submission" state.');
        return;
      }

      console.log('📦 Available versions for submission:');
      versions.forEach(version => {
        console.log(`- Version ${version.attributes.versionString} (ID: ${version.id})`);
      });
      console.log('\n💡 Usage: node submit-for-review.js [VERSION_ID]');
      return;
    }

    await submitForReview(issuerId, keyId, privateKey, versionId);
    
  } catch (error) {
    console.error('❌ Submission failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { submitForReview, getAppVersions };