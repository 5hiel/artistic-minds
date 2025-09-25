# Build & Deploy Workflow

Tools for managing EAS builds and deployment status.

## Scripts

### 🏗️ `check-status.sh` - **EAS Build Status Checker**
- **Purpose**: Check EAS build status and submission information
- **Usage**: `./scripts/workflows/build-deploy/check-status.sh`
- **Output**: Recent builds, links to logs and artifacts
- **Features**: Build history, status tracking, artifact URLs
- **Requirements**: EAS CLI access, logged in to Expo account

## Quick Commands

```bash
# Check recent builds and their status
./scripts/workflows/build-deploy/check-status.sh

# Alternative: Direct EAS commands
npx eas build:list --limit=5
npx eas submit:list --limit=5
```

## Related Commands

```bash
# Start new builds
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# Submit existing build
npx eas submit --platform ios --latest
npx eas submit --platform android --latest

# Check build logs
npx eas build:view [BUILD_ID]
```

## Requirements

- EAS CLI (`npm install -g @expo/eas-cli`)
- Authenticated Expo account (`npx eas login`)
- Configured `eas.json` in project root