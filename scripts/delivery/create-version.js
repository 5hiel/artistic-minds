#!/usr/bin/env node

/**
 * App Store Metadata Automation
 * Updates promotional text, release notes, and distribution settings
 */

const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration from environment or .env file
const CONFIG = {
    ISSUER_ID: process.env.APP_STORE_CONNECT_ISSUER_ID || 'c40803b3-bacc-458b-8485-60029ade2485',
    KEY_ID: process.env.APP_STORE_CONNECT_KEY_ID || '7VNJ8VMUU2',
    APP_ID: process.env.APP_STORE_APP_ID || '6751567047',
    PRIVATE_KEY_PATH: process.env.APP_STORE_CONNECT_PRIVATE_KEY_PATH || './AuthKey_7VNJ8VMUU2.p8',
};

/**
 * Generate JWT token for App Store Connect API
 */
function generateJWT() {
    if (!fs.existsSync(CONFIG.PRIVATE_KEY_PATH)) {
        throw new Error(`Private key not found: ${CONFIG.PRIVATE_KEY_PATH}`);
    }

    const privateKey = fs.readFileSync(CONFIG.PRIVATE_KEY_PATH, 'utf8');

    // Use the same JWT generation method as quick-check.js (which works)
    return jwt.sign({}, privateKey, {
        issuer: CONFIG.ISSUER_ID,
        keyid: CONFIG.KEY_ID,
        audience: 'appstoreconnect-v1',
        algorithm: 'ES256',
        expiresIn: '20m'
    });
}

/**
 * Make API request to App Store Connect
 */
function makeAPIRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const token = generateJWT();
        
        const options = {
            hostname: 'api.appstoreconnect.apple.com',
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

/**
 * Generate release notes from git commits
 */
function generateReleaseNotes(since = 'v1.0.1') {
    try {
        const gitLog = execSync(`git log ${since}..HEAD --oneline --no-merges`, { encoding: 'utf8' });
        const commits = gitLog.trim().split('\n').filter(line => line.trim());
        
        if (commits.length === 0) return "Bug fixes and performance improvements";
        
        const releaseNotes = [];
        
        commits.forEach(commit => {
            const message = commit.substring(8); // Remove commit hash
            
            if (message.includes('feat:') || message.includes('Add')) {
                releaseNotes.push(`• ${message.replace(/^(feat:|Add\s*)/i, '').trim()}`);
            } else if (message.includes('fix:') || message.includes('Fix')) {
                releaseNotes.push(`• ${message.replace(/^(fix:|Fix\s*)/i, 'Fixed: ').trim()}`);
            } else if (message.includes('update:') || message.includes('Update')) {
                releaseNotes.push(`• ${message.replace(/^(update:|Update\s*)/i, 'Updated: ').trim()}`);
            } else if (!message.includes('Merge') && !message.includes('bump')) {
                releaseNotes.push(`• ${message.trim()}`);
            }
        });
        
        return releaseNotes.slice(0, 8).join('\n'); // Limit to 8 items
    } catch (error) {
        console.error('Error generating release notes:', error.message);
        return "Latest updates and improvements";
    }
}

/**
 * Get current app store version
 */
async function getCurrentVersion() {
    try {
        const response = await makeAPIRequest(`/v1/apps/${CONFIG.APP_ID}/appStoreVersions?filter[appStoreState]=READY_FOR_SALE&limit=1`);
        
        if (response.data && response.data.length > 0) {
            return {
                id: response.data[0].id,
                versionString: response.data[0].attributes.versionString,
                appStoreState: response.data[0].attributes.appStoreState
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting current version:', error);
        return null;
    }
}

/**
 * Create new version for submission
 */
async function createNewVersion(versionString) {
    try {
        const data = {
            data: {
                type: "appStoreVersions",
                attributes: {
                    platform: "IOS",
                    versionString: versionString,
                    releaseType: "AFTER_APPROVAL" // Auto-release after review
                },
                relationships: {
                    app: {
                        data: {
                            type: "apps",
                            id: CONFIG.APP_ID
                        }
                    }
                }
            }
        };
        
        console.log('📝 Creating new version for App Store submission:');
        console.log(`Version: ${versionString}, Platform: IOS, Release: AFTER_APPROVAL`);
        
        const response = await makeAPIRequest('/v1/appStoreVersions', 'POST', data);
        
        if (response.data) {
            return {
                id: response.data.id,
                versionString: response.data.attributes.versionString
            };
        }
        
        throw new Error(JSON.stringify(response.errors || response));
    } catch (error) {
        console.error('Error creating new version:', error);
        throw error;
    }
}

/**
 * Submit version for review
 */
async function submitForReview(versionId) {
    try {
        const data = {
            data: {
                type: "appStoreVersionSubmissions",
                relationships: {
                    appStoreVersion: {
                        data: {
                            type: "appStoreVersions",
                            id: versionId
                        }
                    }
                }
            }
        };
        
        const response = await makeAPIRequest('/v1/appStoreVersionSubmissions', 'POST', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting for review:', error);
        throw error;
    }
}

/**
 * Main automation function
 */
async function automateAppStoreSubmission(newVersionString) {
    console.log('🍎 Starting App Store metadata automation...');
    
    try {
        // Get current version info
        const currentVersion = await getCurrentVersion();
        if (currentVersion) {
            console.log(`📱 Current live version: ${currentVersion.versionString}`);
        }
        
        // Create new version with auto-generated metadata
        console.log(`📝 Creating version ${newVersionString}...`);
        const newVersion = await createNewVersion(newVersionString);
        
        console.log('✅ Version created successfully!');
        console.log(`📋 Version ID: ${newVersion.id}`);
        console.log(`📱 Version: ${newVersion.versionString}`);
        console.log('🚀 Set to auto-release after approval');
        
        return newVersion;
        
    } catch (error) {
        console.error('❌ App Store automation failed:', error);
        throw error;
    }
}

// Export functions for use in other scripts
module.exports = {
    generateReleaseNotes,
    getCurrentVersion,
    createNewVersion,
    submitForReview,
    automateAppStoreSubmission
};

// If run directly, execute automation
if (require.main === module) {
    const newVersion = process.argv[2] || '1.0.2';
    automateAppStoreSubmission(newVersion)
        .then(() => console.log('🎉 App Store metadata automation completed!'))
        .catch(error => {
            console.error('💥 Automation failed:', error.message);
            process.exit(1);
        });
}