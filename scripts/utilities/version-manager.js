#!/usr/bin/env node

/**
 * Smart version incrementer that checks App Store before incrementing
 * Usage: node smart-version-increment.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function getAppStoreVersion() {
  try {
    const { quickCheck } = require('../app-store-review/quick-check');
    // This would need to be refactored to export the version detection logic
    // For now, we'll use a simpler approach

    const result = execSync('node scripts/workflows/app-store-review/quick-check.js', {
      encoding: 'utf8',
      env: process.env
    });

    // Parse the output to find the latest version
    const versionMatch = result.match(/📋 Latest version found: (\d+\.\d+\.?\d*)/);
    return versionMatch ? versionMatch[1] : null;
  } catch (error) {
    console.warn('⚠️ Could not fetch App Store version, proceeding with local increment');
    return null;
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function incrementVersion(version) {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || 0) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

async function smartIncrement() {
  console.log('🔍 Smart version increment starting...');

  // Get current local version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentLocalVersion = packageJson.version;
  console.log(`📦 Current local version: ${currentLocalVersion}`);

  // Get App Store version
  const appStoreVersion = await getAppStoreVersion();
  console.log(`🏪 App Store version: ${appStoreVersion || 'unknown'}`);

  let newVersion;

  if (appStoreVersion) {
    // If App Store version is higher or equal, increment from App Store version
    if (compareVersions(appStoreVersion, currentLocalVersion) >= 0) {
      newVersion = incrementVersion(appStoreVersion);
      console.log(`✅ App Store version (${appStoreVersion}) >= local version (${currentLocalVersion})`);
      console.log(`🔄 Incrementing from App Store version: ${appStoreVersion} → ${newVersion}`);
    } else {
      // Local version is higher, just increment it
      newVersion = incrementVersion(currentLocalVersion);
      console.log(`✅ Local version (${currentLocalVersion}) > App Store version (${appStoreVersion})`);
      console.log(`🔄 Incrementing from local version: ${currentLocalVersion} → ${newVersion}`);
    }
  } else {
    // Fallback to local increment
    newVersion = incrementVersion(currentLocalVersion);
    console.log(`⚠️ Could not determine App Store version, incrementing local: ${currentLocalVersion} → ${newVersion}`);
  }

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`📦 Updated package.json to: ${newVersion}`);

  // Update app.json (Expo configuration)
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  appJson.expo.version = newVersion;
  fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2) + '\n');
  console.log(`📱 Updated app.json to: ${newVersion}`);

  console.log(`🎉 Version successfully updated to: ${newVersion} (both package.json and app.json)`);
  return newVersion;
}

// Run if called directly
if (require.main === module) {
  smartIncrement().catch(console.error);
}

module.exports = { smartIncrement };