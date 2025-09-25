#!/usr/bin/env node

/**
 * Automatic Daily Release Script
 * 
 * Checks if any app review is pending at midnight.
 * If no review is pending, initiates a new build and submits it.
 * 
 * Usage:
 * - Run once: node scripts/workflows/daily-release/auto-daily-release.js
 * - Schedule with cron: 0 0 * * * node /path/to/auto-daily-release.js
 */

const { spawn, exec } = require('child_process');
const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Import App Store metadata automation
const { automateAppStoreSubmission, generateReleaseNotes } = require('./app-store-metadata.js');

// Configuration
const CONFIG = {
  issuerId: process.env.APP_STORE_CONNECT_ISSUER_ID || 'c40803b3-bacc-458b-8485-60029ade2485',
  keyId: process.env.APP_STORE_CONNECT_KEY_ID || '7VNJ8VMUU2',
  appId: process.env.APP_STORE_APP_ID || '6751567047',
  keyPath: process.env.APP_STORE_CONNECT_PRIVATE_KEY_PATH || './AuthKey_7VNJ8VMUU2.p8',
  platform: process.env.BUILD_PLATFORM || 'ios',
  buildProfile: process.env.BUILD_PROFILE || 'production',
  logFile: process.env.LOG_FILE || './logs/daily-release.log',
  dryRun: process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true'
};

// Status mapping
const PENDING_STATUSES = [
  'WAITING_FOR_REVIEW',
  'IN_REVIEW', 
  'PENDING_APPLE_RELEASE',
  'PENDING_DEVELOPER_RELEASE'
];

const STATUS_MEANINGS = {
  'READY_FOR_SALE': '🎉 Live on App Store',
  'WAITING_FOR_REVIEW': '⏰ Waiting for review',
  'IN_REVIEW': '⏳ In review with Apple',
  'PENDING_APPLE_RELEASE': '✅ Approved - Pending release',
  'PENDING_DEVELOPER_RELEASE': '✅ Approved - Ready for manual release',
  'PREPARE_FOR_SUBMISSION': '📝 Prepare for submission',
  'REJECTED': '❌ Rejected by Apple',
  'METADATA_REJECTED': '❌ Metadata rejected'
};

function rotateLogFile() {
  try {
    if (!fs.existsSync(CONFIG.logFile)) {
      return; // No log file to rotate
    }

    const stats = fs.statSync(CONFIG.logFile);
    const logAge = Date.now() - stats.mtime.getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (logAge > sevenDaysInMs) {
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const rotatedLogPath = CONFIG.logFile.replace('.log', `-${timestamp}.log`);
      
      // Move old log to rotated filename
      fs.renameSync(CONFIG.logFile, rotatedLogPath);
      
      // Create new log with rotation notice
      const rotationMessage = `[${new Date().toISOString()}] INFO: Log rotated from ${path.basename(rotatedLogPath)}\n`;
      fs.writeFileSync(CONFIG.logFile, rotationMessage);
      
      console.log(`📋 Log rotated: ${path.basename(rotatedLogPath)}`);
    }
  } catch (error) {
    console.error('Failed to rotate log file:', error.message);
  }
}

function log(message, level = 'INFO') {
  const now = new Date();
  const timestamp = now.toISOString();
  const humanTime = now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Los_Angeles', // Force PST/PDT
    timeZoneName: 'short'
  });
  
  // Use human-readable format for startup messages in both console and log file
  const isStartupMessage = level === 'INFO' && message.includes('Daily Release Check Started');
  
  const logMessage = isStartupMessage 
    ? `[${humanTime}] ${level}: ${message}`
    : `[${timestamp}] ${level}: ${message}`;
  
  console.log(logMessage);
  
  // Append to log file (same format as console for startup messages)
  try {
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        log(`Command completed successfully`);
        resolve({ stdout, stderr, code });
      } else {
        log(`Command failed with code ${code}: ${stderr}`, 'ERROR');
        reject(new Error(`Command failed: ${stderr}`));
      }
    });

    process.on('error', (error) => {
      log(`Command error: ${error.message}`, 'ERROR');
      reject(error);
    });
  });
}

async function checkAppReviewStatus() {
  log('🔍 Checking App Store review status...');

  try {
    // Read private key
    const privateKey = fs.readFileSync(CONFIG.keyPath, 'utf8');

    // Generate JWT token
    const token = jwt.sign({}, privateKey, {
      issuer: CONFIG.issuerId,
      keyid: CONFIG.keyId,
      audience: 'appstoreconnect-v1',
      algorithm: 'ES256',
      expiresIn: '20m'
    });

    // API request
    const options = {
      hostname: 'api.appstoreconnect.apple.com',
      path: `/v1/apps/${CONFIG.appId}/appStoreVersions?limit=5`,
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
              throw new Error(response.errors[0].detail);
            }

            if (response.data && response.data.length > 0) {
              const latestVersion = response.data[0];
              const status = latestVersion.attributes.appStoreState;
              const version = latestVersion.attributes.versionString;
              
              log(`📱 Current app status: ${STATUS_MEANINGS[status] || status} (v${version})`);
              
              const isPending = PENDING_STATUSES.includes(status);
              resolve({ isPending, status, version, versions: response.data });
            } else {
              log('No app versions found');
              resolve({ isPending: false, status: null, version: null, versions: [] });
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

  } catch (error) {
    log(`Failed to check review status: ${error.message}`, 'ERROR');
    throw error;
  }
}

async function incrementVersion() {
  log('📝 Incrementing app version...');
  
  try {
    const appJsonPath = './app.json';
    const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
    const appConfig = JSON.parse(appJsonContent);
    
    // Get current version
    const currentVersion = appConfig.expo.version;
    log(`📱 Current version: ${currentVersion}`);
    
    // Parse version (assumes semver format: x.y.z)
    const versionParts = currentVersion.split('.');
    if (versionParts.length !== 3) {
      throw new Error(`Invalid version format: ${currentVersion}. Expected x.y.z format.`);
    }
    
    // Increment patch version (third number)
    const [major, minor, patch] = versionParts;
    const newPatch = parseInt(patch) + 1;
    const newVersion = `${major}.${minor}.${newPatch}`;
    
    // Update version in app config
    appConfig.expo.version = newVersion;
    
    // Write back to file
    const updatedContent = JSON.stringify(appConfig, null, 2) + '\n';
    
    if (CONFIG.dryRun) {
      log(`DRY RUN: Would update version from ${currentVersion} to ${newVersion}`, 'INFO');
      return { oldVersion: currentVersion, newVersion, success: true };
    }
    
    fs.writeFileSync(appJsonPath, updatedContent, 'utf8');
    log(`✅ Version updated: ${currentVersion} → ${newVersion}`);
    
    return { oldVersion: currentVersion, newVersion, success: true };
    
  } catch (error) {
    log(`❌ Version increment failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

async function buildApp() {
  log(`🏗️ Starting EAS build for ${CONFIG.platform}...`);

  if (CONFIG.dryRun) {
    log('DRY RUN: Would run: npx eas build', 'INFO');
    return { buildId: 'dry-run-build-id', success: true };
  }

  try {
    const result = await runCommand('npx', [
      'eas', 'build',
      '--platform', CONFIG.platform,
      '--profile', CONFIG.buildProfile,
      '--non-interactive',
      '--wait'
    ]);

    // Extract build ID from output (this is a simplified extraction)
    const buildIdMatch = result.stdout.match(/Build ID: ([a-f0-9-]+)/i);
    const buildId = buildIdMatch ? buildIdMatch[1] : 'unknown';

    log(`✅ Build completed successfully! Build ID: ${buildId}`);
    return { buildId, success: true };

  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

async function submitApp() {
  log(`📱 Submitting latest ${CONFIG.platform} build...`);

  if (CONFIG.dryRun) {
    log('DRY RUN: Would run: npx eas submit', 'INFO');
    return { success: true };
  }

  try {
    const result = await runCommand('npx', [
      'eas', 'submit',
      '--platform', CONFIG.platform,
      '--latest',
      '--non-interactive',
      '--wait'
    ]);

    log('✅ Submission completed successfully!');
    return { success: true };

  } catch (error) {
    log(`❌ Submission failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

async function sendNotification(message, type = 'info') {
  // You can extend this to send Slack/Discord/email notifications
  log(`📧 NOTIFICATION (${type}): ${message}`);
  
  // Example: Could integrate with webhooks, email services, etc.
  if (process.env.SLACK_WEBHOOK_URL) {
    // Send Slack notification
    log('Would send Slack notification', 'INFO');
  }
}

async function hasGitChangesSinceLastBuild() {
  log('🔍 Checking for git changes since last build...');

  try {
    // Get the latest commit SHA
    const currentCommit = await runCommand('git', ['rev-parse', 'HEAD']);
    const currentSha = currentCommit.stdout.trim();
    
    // Get the commit from the last successful build (stored in a marker file)
    const buildMarkerFile = './logs/.last-build-commit';
    let lastBuildSha = '';
    
    if (fs.existsSync(buildMarkerFile)) {
      lastBuildSha = fs.readFileSync(buildMarkerFile, 'utf8').trim();
      log(`📝 Last build was from commit: ${lastBuildSha.substring(0, 8)}`);
      log(`📝 Current commit: ${currentSha.substring(0, 8)}`);
    } else {
      log('📝 No previous build marker found - treating as first build');
      return true;
    }

    // If commits are the same, no changes
    if (currentSha === lastBuildSha) {
      return false;
    }

    // Check what files changed between commits
    const diffResult = await runCommand('git', ['diff', '--name-only', `${lastBuildSha}...${currentSha}`]);
    const changedFiles = diffResult.stdout.trim().split('\n').filter(f => f);
    
    if (changedFiles.length === 0) {
      return false;
    }

    // Filter out files that don't affect the build (logs, temp files, etc.)
    const ignoredPatterns = [
      /^scripts\/.*\.log$/,
      /^\.env/,
      /^README\.md$/,
      /^\.gitignore$/,
      /^scripts\/.*\.env$/,
      /^app-screenshot\.png$/
    ];

    const significantChanges = changedFiles.filter(file => {
      return !ignoredPatterns.some(pattern => pattern.test(file));
    });

    if (significantChanges.length === 0) {
      log(`📝 Only non-significant files changed: ${changedFiles.join(', ')}`);
      return false;
    }

    log(`📝 Found ${significantChanges.length} significant changes:`);
    significantChanges.forEach(file => log(`   - ${file}`));
    
    return true;

  } catch (error) {
    log(`Warning: Could not check git changes: ${error.message}`, 'WARN');
    log('Proceeding with build to be safe...', 'WARN');
    return true; // Default to building if we can't determine changes
  }
}

function markCurrentCommitAsBuilt() {
  try {
    const currentCommit = runCommand('git', ['rev-parse', 'HEAD']);
    const buildMarkerFile = './logs/.last-build-commit';
    
    currentCommit.then(result => {
      const sha = result.stdout.trim();
      fs.writeFileSync(buildMarkerFile, sha);
      log(`📝 Marked commit ${sha.substring(0, 8)} as built`);
    }).catch(error => {
      log(`Warning: Could not mark commit as built: ${error.message}`, 'WARN');
    });
  } catch (error) {
    log(`Warning: Could not mark commit as built: ${error.message}`, 'WARN');
  }
}

async function main() {
  const startTime = new Date();
  
  // Rotate log file if older than 7 days
  rotateLogFile();
  
  log(`🚀 Daily Release Check Started (${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'})`);
  log(`Platform: ${CONFIG.platform}, Profile: ${CONFIG.buildProfile}`);

  try {
    // Step 1: Check current app review status
    const reviewStatus = await checkAppReviewStatus();

    if (reviewStatus.isPending) {
      log(`⏸️ App review is pending (${reviewStatus.status}). Skipping daily release.`);
      await sendNotification(
        `Daily release skipped - app review pending: ${reviewStatus.status} (v${reviewStatus.version})`,
        'info'
      );
      return;
    }

    log(`✅ No pending reviews found. Checking for code changes...`);

    // Step 2: Check for git changes since last build
    const hasChanges = await hasGitChangesSinceLastBuild();
    
    if (!hasChanges) {
      log(`⏸️ No significant git changes since last build. Skipping daily release.`);
      await sendNotification(
        'Daily release skipped - no code changes detected since last build',
        'info'
      );
      return;
    }

    log(`✅ Git changes detected. Proceeding with daily release...`);

    // Step 3: Check for uncommitted changes (warning only)
    try {
      const gitStatus = await runCommand('git', ['status', '--porcelain']);
      if (gitStatus.stdout.trim()) {
        log('📝 Uncommitted changes detected. Consider committing before release.', 'WARN');
        
        // List the uncommitted files
        const uncommittedFiles = gitStatus.stdout.trim().split('\n');
        log('   Uncommitted files:');
        uncommittedFiles.forEach(file => log(`   - ${file}`));
      }

      const latestCommit = await runCommand('git', ['rev-parse', 'HEAD']);
      log(`📝 Building from commit: ${latestCommit.stdout.trim().substring(0, 8)}`);
    } catch (error) {
      log(`Warning: Could not check git status: ${error.message}`, 'WARN');
    }

    // Step 3: Increment app version
    const versionResult = await incrementVersion();
    
    if (!versionResult.success) {
      throw new Error('Version increment failed');
    }

    // Step 4: Build the app
    const buildResult = await buildApp();

    if (!buildResult.success) {
      throw new Error('Build failed');
    }

    // Step 5: Submit for review
    const submitResult = await submitApp();

    if (!submitResult.success) {
      throw new Error('Submission failed');
    }

    // Step 6: Update App Store metadata with auto-generated content
    if (!CONFIG.dryRun) {
      try {
        log('📝 Updating App Store metadata with auto-generated release notes...');
        
        // Preview the release notes that will be used
        const releaseNotes = generateReleaseNotes();
        log('📋 Generated release notes:');
        log(releaseNotes);
        
        await automateAppStoreSubmission(versionResult.newVersion);
        log('✅ App Store metadata updated successfully!');
        log('🚀 App set to auto-release after Apple approval');
        
      } catch (metadataError) {
        // Don't fail the entire process if metadata update fails
        log(`⚠️ App Store metadata update failed: ${metadataError.message}`, 'WARN');
        log('📱 App was still submitted successfully, but without updated metadata', 'WARN');
      }
    } else {
      log('DRY RUN: Would update App Store metadata with auto-generated content', 'INFO');
      
      // Show what the release notes would look like
      const releaseNotes = generateReleaseNotes();
      log('📋 Would use these release notes:');
      log(releaseNotes);
    }

    // Step 7: Mark current commit as built
    markCurrentCommitAsBuilt();

    // Step 8: Success notification
    const duration = Math.round((new Date() - startTime) / 1000);
    const successMessage = `🎉 Daily release completed successfully in ${duration}s! Version ${versionResult.newVersion} submitted for review with auto-generated metadata and will release automatically after approval.`;
    
    log(successMessage);
    await sendNotification(successMessage, 'success');

  } catch (error) {
    const errorMessage = `❌ Daily release failed: ${error.message}`;
    log(errorMessage, 'ERROR');
    await sendNotification(errorMessage, 'error');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Daily release interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('🛑 Daily release terminated');
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`💥 Unexpected error: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { checkAppReviewStatus, incrementVersion, buildApp, submitApp, main };