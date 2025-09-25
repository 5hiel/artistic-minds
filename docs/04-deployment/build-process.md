# Build Process

## Overview

Gifted Minds uses Expo EAS (Expo Application Services) for building and deploying production apps across iOS, Android, and Web platforms.

## Build Commands

### Development Builds
```bash
# Start development server
npm start

# Platform-specific development
npm run ios                  # iOS simulator
npm run android              # Android emulator
npm run web                  # Web browser
```

### Production Builds
```bash
# Build for all platforms
npx eas build --platform all

# Platform-specific builds
npx eas build --platform ios
npx eas build --platform android
npx eas build --platform web
```

### App Store Submission
```bash
# Submit to App Store
npx eas submit --platform ios

# Submit to Google Play
npx eas submit --platform android
```

## EAS Configuration

### eas.json
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "6751567047",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## Platform-Specific Setup

### iOS Configuration
```json
// app.json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.shiel.giftedminds",
      "buildNumber": "1.0.4.1",
      "supportsTablet": true,
      "config": {
        "usesNonExemptEncryption": false
      }
    }
  }
}
```

### Android Configuration
```json
// app.json
{
  "expo": {
    "android": {
      "package": "com.shiel.giftedminds",
      "versionCode": 104,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A202C"
      }
    }
  }
}
```

### Web Configuration
```json
// app.json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Build Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npx expo export
npx @expo/bundle-analyzer dist

# Check for optimization opportunities
npm run analyze-bundle
```

### Performance Optimization
- **Tree shaking**: Remove unused code
- **Code splitting**: Split bundles by route/feature
- **Asset optimization**: Compress images and fonts
- **Minification**: Minimize JavaScript and CSS

## Environment Management

### Environment Variables
```bash
# Development
EXPO_PUBLIC_APP_VARIANT=development
EXPO_PUBLIC_API_URL=https://dev-api.giftedminds.com

# Production
EXPO_PUBLIC_APP_VARIANT=production
EXPO_PUBLIC_API_URL=https://api.giftedminds.com
```

### Secrets Management
```bash
# Store sensitive data securely
eas secret:create --scope project --name API_KEY --value "your-secret-key"
eas secret:create --scope account --name APPLE_ID --value "your-apple-id"
```

## Quality Gates

### Pre-build Validation
```bash
# Required before building
npm run quality-check

# Individual checks
npm run lint           # Code quality
npm run typecheck      # Type safety
npm test              # Test suite
```

### Build Verification
- **Successful compilation**: No build errors
- **Bundle size**: Within acceptable limits
- **Performance metrics**: Meet requirements
- **Platform compatibility**: iOS/Android/Web support

## Troubleshooting

### Common Build Issues

**Metro bundler cache**:
```bash
npx expo start --clear
```

**EAS build failures**:
```bash
# Clean and retry
eas build --clear-cache --platform ios
```

**Code signing issues (iOS)**:
- Verify Apple Developer account
- Check provisioning profiles
- Ensure bundle ID matches

**Android build failures**:
- Check gradle configuration
- Verify keystore settings
- Review Google Play Console setup

## Related Documentation

- [App Store Process](app-store.md)
- [Continuous Release](continuous-release.md)
- [Development Workflows](../03-development/workflows.md)