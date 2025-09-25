# Development Workflows

## CI/CD Pipeline

### GitHub Actions Overview
- **CI**: Linting, TypeScript checks, tests on every push
- **Claude Issue Fixing**: Add `@claude` mention + `fix-it` label to auto-implement features
- **PR Reviews**: Automatic comprehensive code reviews with inline comments
- **Daily Releases**: Smart automation (only builds when no App Store reviews pending + git changes)
- **Issue Enhancement**: Add `needs-enhancement` label for developer guidance

### Workflow Triggers
```yaml
# Main CI workflow
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

# Daily release workflow
on:
  schedule:
    - cron: '0 10 * * *'  # Daily at 10 AM UTC
  workflow_dispatch:       # Manual trigger
```

## Code Quality Gates

### Pre-commit Requirements
**MANDATORY before every commit**:
```bash
npm run lint && npm run typecheck && npm test
```

### Quality Standards
- **TypeScript strict mode** compliance
- **Zero ESLint warnings** allowed
- **200+ tests must pass** (70%+ coverage required)
- **Components should be small, focused, reusable**

### Automated Checks
1. **Linting**: ESLint with Prettier integration
2. **Type Safety**: TypeScript strict mode validation
3. **Testing**: Jest + React Testing Library
4. **Build Verification**: Successful Expo build
5. **Bundle Analysis**: Size and performance metrics

## Daily Release Automation

### Release Process
1. **App Store Status Check**: Ensures no pending reviews before building
2. **Git Change Detection**: Only builds when there are actual changes
3. **Automated Building**: Uses Expo EAS for production builds
4. **Store Submission**: Automatic submission to App Store when ready
5. **Log Management**: Comprehensive logging and monitoring

### Release Commands
```bash
# Setup daily automation
./scripts/workflows/daily-release/manage-launch-agent.sh load

# Monitor logs
./scripts/workflows/daily-release/manage-logs.sh follow

# Manual testing
node scripts/workflows/daily-release/auto-daily-release.js --dry-run
```

## Git Workflow

### Branch Strategy
```
main           # Production-ready code
├── develop    # Integration branch
├── feature/*  # Feature development
├── hotfix/*   # Emergency fixes
└── release/*  # Release preparation
```

### Commit Convention
```bash
# Format: type(scope): description
feat(puzzle): add new transformation puzzle type
fix(adaptive): resolve difficulty scaling bug
docs(readme): update installation instructions
test(hooks): add useGameState integration tests
```

### Pull Request Process
1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes and test**: `npm run quality-check`
3. **Commit with conventional format**
4. **Push and create PR**: Include description and testing notes
5. **Automated review**: Claude analyzes code and provides feedback
6. **Human review**: Team review for approval
7. **Merge**: Squash merge to main/develop

## Development Environment

### Local Setup Verification
```bash
# Verify all systems working
npm run quality-check

# Platform testing
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

### Hot Reloading
- **Metro bundler**: Automatic JavaScript reload
- **Expo DevTools**: Component inspection and debugging
- **Fast refresh**: Preserves component state during development

## Testing Strategy

### Test Categories
1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Hook and component interactions
3. **Persona Tests**: Adaptive engine behavior validation
4. **E2E Tests**: Critical user flow testing

### Testing Commands
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
npm run test:personas       # Adaptive engine persona testing
```

### Test File Organization
```
__tests__/
├── components/    # Component unit tests
├── hooks/         # Custom hook tests
├── lib/           # Core logic tests
├── personas/      # Adaptive engine tests
└── utils/         # Test utilities and mocks
```

## Performance Monitoring

### Development Metrics
- **Bundle size**: Monitor with `npx expo export`
- **Render performance**: Use React DevTools Profiler
- **Memory usage**: Test on physical devices
- **Load times**: Measure app startup and navigation

### Performance Guidelines
- **Keep bundle size < 50MB** for optimal download times
- **Render cycles < 16ms** for 60fps smooth animations
- **Memory usage < 200MB** for smooth operation
- **Cold start < 3 seconds** on mid-range devices

## Debugging

### Development Tools
- **Flipper**: iOS/Android debugging with network inspection
- **Chrome DevTools**: Web debugging and performance profiling
- **React DevTools**: Component tree inspection and profiler
- **Metro bundler**: JavaScript debugging and error reporting

### Logging Strategy
```typescript
// Development logging
if (__DEV__) {
  console.log('Debug info:', data);
}

// Production error tracking
try {
  // Risky operation
} catch (error) {
  console.error('Production error:', error);
  // Report to analytics service
}
```

### Common Debug Scenarios
- **State issues**: Use React DevTools to inspect component state
- **Navigation problems**: Check Expo Router debug logs
- **Performance bottlenecks**: Use React Profiler
- **Memory leaks**: Monitor memory usage in development tools

## Code Review Process

### Automated Reviews
Claude provides automated code analysis:
- **Code quality assessment**
- **Architectural feedback**
- **Performance suggestions**
- **Security vulnerability detection**

### Human Review Checklist
- [ ] Code follows project conventions
- [ ] Tests cover new functionality
- [ ] Documentation updated if needed
- [ ] Performance impact considered
- [ ] Accessibility requirements met
- [ ] Security implications reviewed

## Issue Management

### Issue Labels
- `bug`: Software defects requiring fixes
- `enhancement`: Feature improvements or additions
- `fix-it`: Auto-assigns to Claude for implementation
- `needs-enhancement`: Adds context for developers
- `persona-testing`: Adaptive engine testing requirements

### Issue Workflow
1. **Triage**: Label and prioritize new issues
2. **Assignment**: Auto-assign or manual assignment
3. **Development**: Feature branch creation and development
4. **Testing**: Comprehensive testing of changes
5. **Review**: Code review and approval process
6. **Deployment**: Merge and release process

## Release Management

### Version Strategy
```json
{
  "version": "1.0.4",
  "build": "ios: 1.0.4.1, android: 1.0.4.1"
}
```

### Release Types
- **Patch** (1.0.X): Bug fixes and minor improvements
- **Minor** (1.X.0): New features and enhancements
- **Major** (X.0.0): Breaking changes and major updates

### Release Checklist
- [ ] All tests passing
- [ ] Quality checks complete
- [ ] App Store review status checked
- [ ] Release notes prepared
- [ ] Rollback plan documented

## Troubleshooting

### Common Development Issues
**Metro bundler cache issues**:
```bash
npx expo start --clear
```

**Node modules conflicts**:
```bash
rm -rf node_modules package-lock.json && npm install
```

**iOS build failures**:
```bash
# Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData
# Rebuild
npm run ios
```

**TypeScript errors**:
```bash
npm run typecheck
# Review and fix type issues
```

### Getting Help
- Check [troubleshooting guide](../05-guides/troubleshooting.md)
- Review [GitHub Issues](https://github.com/your-repo/issues)
- Consult team documentation
- Use Claude Code assistance for specific problems

## Documentation Standards

### Code Documentation
```typescript
/**
 * Generate adaptive puzzle based on user context
 * @param targetDifficulty - Desired difficulty level (0-1)
 * @param recentPatterns - Recently used puzzle patterns
 * @returns Promise resolving to puzzle recommendation
 */
async generateAdaptivePuzzle(
  targetDifficulty: number,
  recentPatterns: string[] = []
): Promise<PuzzleRecommendation>
```

### README Requirements
Each major feature should include:
- Purpose and overview
- Installation/setup instructions
- Usage examples
- API documentation
- Contributing guidelines

## Related Documentation

- [Testing Guide](testing.md)
- [Design System](design-system.md)
- [Hooks API](hooks-api.md)
- [Build Process](../04-deployment/build-process.md)