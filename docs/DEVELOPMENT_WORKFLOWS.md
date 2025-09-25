# Development Workflows

This document contains detailed workflow information for the Gifted Minds project.

## GitHub Actions Workflows

### CI/CD Pipeline
- **CI**: Linting, TypeScript checks, tests on every push
- **Claude Issue Fixing**: Add `@claude` mention + `fix-it` label to auto-implement features
- **PR Reviews**: Automatic comprehensive code reviews with inline comments
- **Daily Releases**: Smart automation (only builds when no App Store reviews pending + git changes)
- **Issue Enhancement**: Add `needs-enhancement` label for developer guidance

### Workflow Commands
```bash
# Setup daily automation
./scripts/workflows/daily-release/manage-launch-agent.sh load

# Monitor logs
./scripts/workflows/daily-release/manage-logs.sh follow

# Manual testing
node scripts/workflows/daily-release/auto-daily-release.js --dry-run
```

### Code Quality Requirements
**MANDATORY before commits**: `npm run lint && npm run typecheck && npm test`
- TypeScript strict mode compliance
- Zero ESLint warnings
- 200+ tests must pass (70%+ coverage)
- Components should be small, focused, reusable

## Daily Release Automation

The project includes sophisticated automation for daily releases:

1. **App Store Status Check**: Ensures no pending reviews before building
2. **Git Change Detection**: Only builds when there are actual changes
3. **Automated Building**: Uses Expo EAS for production builds
4. **Store Submission**: Automatic submission to App Store when ready
5. **Log Management**: Comprehensive logging and monitoring

## Development Best Practices

### Code Structure
- Follow existing patterns and conventions
- Use TypeScript strictly
- Implement comprehensive tests for new features
- Maintain modular, reusable components

### Testing Strategy
- Unit tests for core logic
- Integration tests for hooks and components
- Persona testing for adaptive engine validation
- End-to-end testing for critical user flows

### Performance Monitoring
- Track bundle size and loading times
- Monitor memory usage in adaptive engine
- Validate puzzle generation performance
- Ensure smooth animations and transitions