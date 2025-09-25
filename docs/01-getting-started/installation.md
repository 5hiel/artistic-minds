# Installation Guide

## Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`

## Platform-Specific Setup

### iOS Development
- **Xcode** 14+ (macOS only)
- **iOS Simulator** (included with Xcode)
- **Apple Developer Account** (for device testing)

### Android Development
- **Android Studio**
- **Android SDK** (API level 33+)
- **Android Emulator** or physical device

### Web Development
- Modern browser (Chrome, Firefox, Safari)
- No additional setup required

## Project Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd gifted-minds
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Configure required variables
EXPO_PUBLIC_APP_VARIANT=development
```

### 3. Verify Installation
```bash
# Run quality check
npm run quality-check

# Start development server
npm start
```

## Platform Testing

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## Troubleshooting

### Common Issues
- **Metro bundler issues**: `npx expo start --clear`
- **Node modules conflicts**: `rm -rf node_modules && npm install`
- **iOS build failures**: Clean Xcode cache and rebuild

### Getting Help
- Check [troubleshooting guide](../05-guides/troubleshooting.md)
- Review [GitHub Issues](https://github.com/your-repo/issues)
- Consult Expo documentation