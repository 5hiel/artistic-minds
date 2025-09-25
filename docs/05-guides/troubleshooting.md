# Troubleshooting Guide

## Common Development Issues

### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Clean install
rm -rf node_modules package-lock.json && npm install
```

### iOS Build Problems
```bash
# Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reset iOS simulator
npx expo run:ios --device

# Check Xcode version compatibility
xcode-select --print-path
```

### Android Build Issues
```bash
# Clean gradle cache
cd android && ./gradlew clean

# Reset Android emulator
npx expo run:android --device

# Check Android SDK
echo $ANDROID_HOME
```

### TypeScript Errors
```bash
# Type checking
npm run typecheck

# Restart TypeScript server (VS Code)
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Check tsconfig.json configuration
```

## Testing Issues

### Test Failures
```bash
# Run specific test
npm test GameLogic.test.ts

# Update snapshots
npm test -- --updateSnapshot

# Clear Jest cache
npm test -- --clearCache
```

### Persona Testing Problems
```bash
# Debug persona test
PRESET=quick PERSONA=ira npm run test:personas -- --verbose

# Check persona configuration
cat __tests__/personas/personas.config.js

# Reset persona data
rm -rf .jest-cache-personas/
```

## Performance Issues

### Slow App Performance
- Check bundle size: `npx expo export && ls -la dist/`
- Profile with React DevTools
- Monitor memory usage
- Optimize images and assets

### Memory Leaks
- Use Flipper for memory profiling
- Check for component unmounting
- Verify event listener cleanup
- Monitor adaptive engine storage

## Build and Deployment

### EAS Build Failures
```bash
# Check build logs
eas build:list

# Clear EAS cache
eas build --clear-cache

# Verify eas.json configuration
```

### App Store Issues
```bash
# Check review status
node scripts/workflows/app-store-review/quick-check.js

# Verify API credentials
echo $APP_STORE_CONNECT_KEY_ID
```

## Adaptive Engine Issues

### Puzzle Selection Problems
- Check user profile data
- Verify difficulty constraints
- Review recent performance data
- Monitor prediction accuracy

### Storage Issues
```bash
# Check storage status
node -e "console.log(require('./lib/adaptiveEngine/adaptiveStorageAdapter').getStorageInfo())"

# Reset adaptive data
node -e "require('./lib/adaptiveEngine').resetAdaptiveLearningSystem()"
```

## Getting Help

### Internal Resources
- Check [documentation index](../README.md)
- Review [GitHub issues](https://github.com/your-repo/issues)
- Consult team knowledge base

### External Resources
- [Expo documentation](https://docs.expo.dev/)
- [React Native troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [TypeScript handbook](https://www.typescriptlang.org/docs/)

### Emergency Contacts
- Technical issues: Create GitHub issue with `urgent` label
- Security concerns: Contact team lead immediately
- Production problems: Follow incident response procedures