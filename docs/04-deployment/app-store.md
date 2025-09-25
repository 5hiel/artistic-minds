# App Store Deployment

## Overview

Automated App Store deployment with smart release management, review status monitoring, and seamless integration with EAS build system.

## App Store Connect Setup

### API Configuration
```bash
# Required environment variables
export APP_STORE_CONNECT_ISSUER_ID=c40803b3-bacc-458b-8485-60029ade2485
export APP_STORE_CONNECT_KEY_ID=7VNJ8VMUU2
export APP_STORE_APP_ID=6751567047
export APP_STORE_CONNECT_PRIVATE_KEY_PATH=./AuthKey_7VNJ8VMUU2.p8
```

### App Store Metadata
```javascript
// Managed via scripts/workflows/app-store-review/
const appMetadata = {
  appId: "6751567047",
  bundleId: "com.shiel.giftedminds",
  name: "Gifted Minds",
  version: "1.0.4",
  build: "1.0.4.1"
};
```

## Review Status Monitoring

### Status Check Commands
```bash
# Quick review status check
APP_STORE_CONNECT_ISSUER_ID=c40803b3-bacc-458b-8485-60029ade2485 \
APP_STORE_CONNECT_KEY_ID=7VNJ8VMUU2 \
APP_STORE_APP_ID=6751567047 \
APP_STORE_CONNECT_PRIVATE_KEY_PATH=./AuthKey_7VNJ8VMUU2.p8 \
node scripts/workflows/app-store-review/quick-check.js

# Detailed review information
node scripts/workflows/app-store-review/complete-app-store-submission.js
```

### Smart Release Logic
The system prevents builds when:
- App is currently under review
- Recent rejection requires addressing
- Version conflicts exist
- Review submission is pending

## Automated Submission

### Release Process
1. **Version Increment**: Automatic version bumping
2. **Build Generation**: EAS build for production
3. **Review Status Check**: Verify no pending reviews
4. **Metadata Update**: Release notes and app information
5. **Submission**: Automatic submission to App Store
6. **Monitoring**: Track review progress

### Submission Commands
```bash
# Complete submission workflow
node scripts/workflows/app-store-review/submit-for-review.js

# Submit specific build
node scripts/workflows/app-store-review/submit-for-review.js [BUILD_ID]

# Update release notes only
node scripts/workflows/app-store-review/update-release-notes.js
```

## Release Notes Management

### Automatic Generation
```javascript
// Release notes template
const releaseNotes = {
  "en-US": `
🎯 What's New in Gifted Minds v${version}

✨ Enhanced adaptive learning engine for personalized puzzle experiences
🧩 Improved puzzle generation with better variety and difficulty balancing
🎨 Refined user interface with smoother animations and transitions
🚀 Performance optimizations for faster load times
🐛 Bug fixes and stability improvements

Keep your mind sharp with engaging puzzles that adapt to your learning style!

Generated with Claude Code (https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
  `.trim()
};
```

### Manual Release Notes
```bash
# Custom release notes
echo "Your custom release notes" > release-notes.txt
node scripts/workflows/app-store-review/update-release-notes.js --file release-notes.txt
```

## Version Management

### Semantic Versioning
```json
{
  "version": "1.0.4",
  "buildNumber": "1.0.4.1"
}
```

### Version Increment Strategy
- **Patch** (1.0.X): Bug fixes and minor improvements
- **Minor** (1.X.0): New features and enhancements
- **Major** (X.0.0): Breaking changes and major updates

### Automated Version Bumping
```bash
# Increment version
npm version patch  # 1.0.4 → 1.0.5
npm version minor  # 1.0.4 → 1.1.0
npm version major  # 1.0.4 → 2.0.0

# Create git tag and release
git tag v1.0.5
gh release create v1.0.5
```

## App Store Guidelines Compliance

### Content Guidelines
- **Age Rating**: 4+ (suitable for all ages)
- **Content**: Educational puzzle games
- **Privacy**: Minimal data collection
- **Safety**: Child-safe content

### Technical Requirements
- **Performance**: Smooth 60fps gameplay
- **Compatibility**: iOS 14+ support
- **Accessibility**: VoiceOver and accessibility compliance
- **Localization**: Multiple language support

### Review Preparation Checklist
- [ ] App functions correctly on all supported devices
- [ ] No crashes or major bugs
- [ ] Privacy policy updated
- [ ] App Store metadata accurate
- [ ] Screenshots and descriptions current
- [ ] Age rating appropriate
- [ ] In-app purchases (if any) functional

## Monitoring & Analytics

### Release Tracking
```bash
# Monitor release status
watch -n 300 'node scripts/workflows/app-store-review/quick-check.js'

# Check review progress
node scripts/workflows/app-store-review/review-status.js
```

### Performance Metrics
- **Crash rate**: < 0.1% target
- **App Store rating**: 4.5+ stars target
- **Download/retention**: Track user engagement
- **Review feedback**: Monitor user feedback

## Rollback Procedures

### Emergency Rollback
```bash
# If critical issues discovered post-release
# 1. Remove from sale temporarily
node scripts/workflows/app-store-review/remove-from-sale.js

# 2. Prepare hotfix version
npm version patch
npm run quality-check

# 3. Emergency submission
node scripts/workflows/app-store-review/emergency-submission.js
```

### Phased Rollouts
```bash
# Gradual release to percentage of users
node scripts/workflows/app-store-review/phased-release.js --percentage 10
```

## Google Play Store

### Android Submission
```bash
# Build for Android
npx eas build --platform android

# Submit to Google Play
npx eas submit --platform android
```

### Play Console Configuration
```json
{
  "track": "production",
  "serviceAccountKeyPath": "./google-play-service-account.json",
  "releaseStatus": "completed"
}
```

## Troubleshooting

### Common Issues

**API Authentication Errors**:
- Verify App Store Connect API key
- Check key permissions and expiration
- Ensure correct issuer ID and key ID

**Review Rejections**:
- Address feedback in rejection message
- Update app accordingly
- Resubmit with explanation of changes

**Version Conflicts**:
- Ensure version numbers are incremented
- Check for existing builds with same version
- Update build number if necessary

**Metadata Issues**:
- Verify all required fields completed
- Check screenshot requirements
- Ensure description meets guidelines

## Security Considerations

### API Key Security
- Store keys securely (not in version control)
- Use environment variables
- Rotate keys periodically
- Limit key permissions

### Build Security
- Verify build integrity
- Check for malicious code
- Validate dependencies
- Secure signing certificates

## Related Documentation

- [Build Process](build-process.md)
- [Continuous Release](continuous-release.md)
- [Development Workflows](../03-development/workflows.md)