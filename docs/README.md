# Documentation Index

## 📖 Welcome to Gifted Minds Documentation

This is the comprehensive documentation for the Gifted Minds puzzle game project. Documentation is organized by category for easy navigation.

## 🚀 Quick Start

**New to the project?** Start here:

1. **[Installation Guide](01-getting-started/installation.md)** - Set up your development environment
2. **[Development Setup](01-getting-started/development-setup.md)** - Configure your IDE and workflow
3. **[Quick Reference](01-getting-started/quick-reference.md)** - Essential commands and information

## 📚 Documentation Structure

### 00. Product Overview
- **[Project Objectives](00-product/objectives.md)** - Vision, goals, success metrics, and strategic planning
- **[Features Guide](00-product/features.md)** - Complete user-facing feature descriptions with benefits
- **[User Journey](00-product/user-journey.md)** - Persona-based user experiences across age groups
- **[Business Case](00-product/business-case.md)** - Market analysis, competitive advantages, and ROI

### 01. Getting Started
- **[Installation](01-getting-started/installation.md)** - Prerequisites, setup, and platform configuration
- **[Development Setup](01-getting-started/development-setup.md)** - IDE, workflow, and debugging setup
- **[Quick Reference](01-getting-started/quick-reference.md)** - Commands, imports, and troubleshooting

### 02. Architecture
- **[System Overview](02-architecture/overview.md)** - High-level architecture and design principles
- **[Puzzle System](02-architecture/puzzle-system.md)** - 9 puzzle types, generation, and candidate selection
- **[Adaptive Engine](02-architecture/adaptive-engine.md)** - AI-powered puzzle selection and learning
- **[Components](02-architecture/components.md)** - UI component architecture and theming

### 03. Development
- **[Workflows](03-development/workflows.md)** - CI/CD, quality gates, and release process
- **[Testing](03-development/testing.md)** - Testing strategy, persona validation, and coverage
- **[Hooks API](03-development/hooks-api.md)** - Custom React hooks and state management
- **[Design System](03-development/design-system.md)** - Level-based theming and component styles

### 04. Deployment
- **[Build Process](04-deployment/build-process.md)** - EAS builds, optimization, and platform setup
- **[App Store](04-deployment/app-store.md)** - Automated deployment and review management
- **[Continuous Release](04-deployment/continuous-release.md)** - Daily automation and smart releases

### 05. Guides
- **[Contributing](05-guides/contributing.md)** - How to contribute to the project
- **[Troubleshooting](05-guides/troubleshooting.md)** - Common issues and solutions
- **[Migration Notes](05-guides/migration-notes.md)** - Version migration guides

### 06. Analysis
- **[Performance Reports](06-analysis/performance-reports.md)** - Consolidated performance analysis
- **[Persona Analysis](06-analysis/persona-analysis.md)** - User behavior and adaptation analysis

### 07. Operations
- **[Autonomous Delivery](07-operations/autonomous-delivery.md)** - AI-powered CI/CD and automation systems
- **[Monitoring & Analytics](07-operations/monitoring.md)** - System health, user analytics, and performance tracking
- **[Release Management](07-operations/release-management.md)** - Smart release logic and deployment strategies

## 🎯 Key Features

### Core Systems
- **9 Puzzle Types**: Pattern, Serial Reasoning, Number Series, Algebraic, Sequential Figures, Number Grid, Number Analogies, Transformation, Analogy
- **Adaptive Engine**: AI-powered puzzle selection based on user performance and learning patterns
- **Level-Based Theming**: Dynamic visual themes that progress with user advancement
- **Power Surge System**: 60-second challenge windows with enhanced scoring

### Development Highlights
- **200+ Tests**: Comprehensive test suite with 70%+ coverage
- **TypeScript Strict Mode**: Full type safety and code quality
- **Automated CI/CD**: Smart releases with App Store integration
- **Cross-Platform**: iOS, Android, and Web support

## 🔗 External Resources

### Project Files (Root Level)
- **[CLAUDE.md](../CLAUDE.md)** - Core guidance for Claude Code assistance
- **[README.md](../README.md)** - Project overview and quick start
- **[PERSONA_TESTING.md](../PERSONA_TESTING.md)** - Adaptive engine persona testing framework

### Platform Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📋 Quick Command Reference

### Development
```bash
npm start                    # Start Expo development server
npm run quality-check        # Complete CI validation
npm test                     # Run all tests
npm run lint                 # Code quality checks
npm run typecheck            # TypeScript validation
```

### Platform Testing
```bash
npm run ios                  # iOS simulator
npm run android              # Android emulator
npm run web                  # Web browser
```

### Persona Testing
```bash
# Single persona test
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
```

## 🛠 Getting Help

### For Development Issues
1. Check [Troubleshooting Guide](05-guides/troubleshooting.md)
2. Search [GitHub Issues](https://github.com/your-repo/issues)
3. Review relevant architecture documentation

### For Claude Code Assistance
- Refer to [CLAUDE.md](../CLAUDE.md) for Claude-specific guidance
- Check [Quick Reference](01-getting-started/quick-reference.md) for commands

### For Testing Issues
- Review [Testing Guide](03-development/testing.md)
- Check [Persona Testing](../PERSONA_TESTING.md) for adaptive engine testing

## 📝 Contributing to Documentation

When updating documentation:
1. **Keep it concise** - Max 400 lines per file
2. **Single responsibility** - One topic per file
3. **Cross-reference** - Link to related docs
4. **Update this index** - Add new files here
5. **Test examples** - Verify code samples work

## 🗺 Documentation Map

```
docs/
├── README.md                         # This index file
├── 00-product/                      # Product overview and strategy
│   ├── objectives.md                # Project vision, goals, and KPIs
│   ├── features.md                  # User-facing features with benefits
│   ├── user-journey.md             # Persona-based user experiences
│   └── business-case.md            # Market analysis and business value
├── 01-getting-started/
│   ├── installation.md             # Setup and prerequisites
│   ├── development-setup.md        # IDE and workflow configuration
│   └── quick-reference.md          # Commands and troubleshooting
├── 02-architecture/
│   ├── overview.md                 # System architecture
│   ├── puzzle-system.md            # Puzzle generation and selection
│   ├── adaptive-engine.md          # AI learning system
│   └── components.md               # UI component architecture
├── 03-development/
│   ├── workflows.md                # CI/CD and release process
│   ├── testing.md                  # Testing strategy and persona validation
│   ├── hooks-api.md               # Custom React hooks
│   └── design-system.md           # Theming and component styles
├── 04-deployment/
│   ├── build-process.md           # EAS builds and optimization
│   ├── app-store.md               # App Store deployment
│   └── continuous-release.md      # Automated releases
├── 05-guides/
│   ├── contributing.md            # Contribution guidelines
│   ├── troubleshooting.md         # Common issues and solutions
│   └── migration-notes.md         # Version migration guides
├── 06-analysis/
│   ├── performance-reports.md     # Performance analysis
│   └── persona-analysis.md        # User behavior analysis
└── 07-operations/                  # Operational systems and automation
    ├── autonomous-delivery.md      # AI-powered CI/CD and automation
    ├── monitoring.md              # Analytics and system health
    └── release-management.md      # Smart release strategies
```

---

**Last Updated**: September 2024
**Maintained By**: Development Team
**Version**: 1.0.4