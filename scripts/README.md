# 🚀 Autonomous Product Delivery Scripts

This directory contains all automation scripts organized by pipeline stage for clear, maintainable autonomous product delivery.

## 📋 Pipeline Overview

```
Quality Gate → Version Prep → Build → Submit → Monitor
     ↓             ↓          ↓        ↓        ↓
  ✅ Pass      🔢 Increment  🔨 iOS   📱 Store 📊 Track
```

## 🗂️ Directory Structure

```
scripts/
├── quality/           # Quality assurance & validation
├── delivery/          # Release & deployment pipeline
├── monitoring/        # Post-release tracking
├── automation/        # AI & workflow automation
├── utilities/         # Development & maintenance tools
└── workflows/         # Legacy structure (being phased out)
```

## 🎯 Quick Commands

### 🔧 Development Workflow
```bash
npm run dev                    # Start development server
npm run quality:full           # Complete quality gate check
npm run delivery:check-status  # Check if ready for release
```

### 🚀 Release Pipeline
```bash
npm run delivery:build         # Build production iOS binary
npm run delivery:release       # Generate comprehensive release notes
npm run monitor:feedback       # Sync App Store reviews
```

### 🛠️ Utilities
```bash
npm run utils:version          # Smart version management
npm run utils:logs             # View automation logs
npm run utils:reset            # Reset project to clean state
```

## 📁 Script Categories

### ✅ Quality Assurance (`scripts/quality/`)

**Purpose**: Ensure code quality and detect issues before release

| Script | Command | Description |
|--------|---------|-------------|
| `check-coverage.js` | `npm run quality:coverage` | Analyze test coverage metrics |
| `analyze-bugs.js` | `npm run quality:bugs` | Detect and categorize potential bugs |

### 🚀 Delivery Pipeline (`scripts/delivery/`)

**Purpose**: Autonomous App Store release management

| Script | Command | Description |
|--------|---------|-------------|
| `check-app-store-status.js` | `npm run delivery:check-status` | Verify App Store readiness for new releases |
| `create-version.js` | Direct use in workflows | Create new App Store Connect version entries |
| `generate-release-notes.js` | `npm run delivery:release` | Generate comprehensive, professional release notes |

### 📊 Monitoring (`scripts/monitoring/`)

**Purpose**: Post-release tracking and feedback integration

| Script | Command | Description |
|--------|---------|-------------|
| `sync-app-store-feedback.js` | `npm run monitor:feedback` | Sync App Store reviews to GitHub issues |

### 🤖 Automation (`scripts/automation/`)

**Purpose**: AI-powered workflow enhancement

| Script | Usage | Description |
|--------|-------|-------------|
| `enhance-issues.js` | Triggered by GitHub workflows | Enhance GitHub issues with implementation guidance |

### 🛠️ Utilities (`scripts/utilities/`)

**Purpose**: Development and maintenance tools

| Script | Command | Description |
|--------|---------|-------------|
| `version-manager.js` | `npm run utils:version` | Smart version increment with App Store sync |
| `project-reset.js` | `npm run utils:reset` | Reset project to clean development state |
| `manage-logs.sh` | `npm run utils:logs` | View and manage automation logs |

## 🔄 Autonomous Delivery Flow

### 1. **Quality Gate** ✅
```bash
# Triggered on every push/PR
npm run quality:lint
npm run quality:typecheck
npm run test:ci
```

### 2. **Release Preparation** 🔢
```bash
# Smart version management
npm run utils:version
npm run delivery:check-status
```

### 3. **Build & Deploy** 🚀
```bash
# Production build pipeline
npm run delivery:build
# Automated via GitHub Actions
```

### 4. **Post-Release Monitoring** 📊
```bash
# Feedback integration
npm run monitor:feedback
```

## 📚 GitHub Workflows Integration

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `quality-gate.yml` | Push to main | Run quality checks |
| `delivery-on-pr-merge.yml` | PR merge | Autonomous App Store release |
| `ai-feature-builder.yml` | Issue with @claude + fix-it label | AI-powered feature implementation |
| `feedback-sync.yml` | Scheduled | Sync App Store reviews |

## 🎯 Best Practices

### ✅ Before Each Release
1. Run `npm run quality:full`
2. Check `npm run delivery:check-status`
3. Ensure all tests pass
4. Verify no blocking App Store reviews

### 🚀 Release Process
1. Merge PR to main (triggers autonomous release)
2. Monitor build progress in GitHub Actions
3. Track App Store submission status
4. Review generated release notes

### 📊 Post-Release
1. Monitor `npm run monitor:feedback`
2. Check release metrics
3. Address user feedback promptly

## 🔧 Development Tips

- **Use organized npm scripts**: `dev:*`, `quality:*`, `delivery:*`, `monitor:*`, `utils:*`
- **Check logs**: `npm run utils:logs follow` for real-time monitoring
- **Version conflicts**: `npm run utils:version` handles App Store sync automatically
- **Emergency reset**: `npm run utils:reset` if project state becomes inconsistent

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build failures | Check `npm run quality:full` first |
| Version conflicts | Use `npm run utils:version` for smart increment |
| App Store blocks | Check `npm run delivery:check-status` |
| Missing logs | Run `npm run utils:logs view` |

## 📖 Legacy Structure (Deprecated)

The `scripts/workflows/` directory contains the original organization and is being phased out in favor of the new pipeline-stage structure. For now, both structures coexist to maintain backward compatibility.

## Environment Variables

For frequent use, set these environment variables:
```bash
export APP_STORE_CONNECT_ISSUER_ID="c40803b3-bacc-458b-8485-60029ade2485"
export APP_STORE_CONNECT_KEY_ID="7VNJ8VMUU2"
export APP_STORE_APP_ID="6751567047"
export APP_STORE_CONNECT_PRIVATE_KEY_PATH="./AuthKey_7VNJ8VMUU2.p8"
```

## Requirements

- Node.js with npm/npx
- EAS CLI (`npm install -g @expo/eas-cli`)
- App Store Connect API credentials
- Git repository with commit history

---

**🤖 This autonomous delivery system ensures consistent, high-quality releases with minimal manual intervention.**