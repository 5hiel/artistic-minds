# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gifted Minds** is an intelligent adaptive puzzle platform that grows with you - featuring AI-powered puzzle selection, **9+ distinct puzzle types** with 35+ subtypes covering cognitive reasoning, pattern recognition, mathematical relationships, and spatial transformations. The platform provides personalized learning experiences for ages 4-65+ through sophisticated behavioral learning algorithms, power surge mechanics, and autonomous development workflows.

### Product Context
- **Market Position**: First truly adaptive cognitive training platform with real-time AI learning
- **User Base**: Cross-generational (4-65+ years) with persona validation (Ira 8y, Omi 5y, Mumu 25y, Ma 60y)
- **Business Value**: Educational technology with B2C/B2B markets, institutional licensing potential
- **Technical Excellence**: 200+ tests, 70%+ coverage, TypeScript strict, autonomous AI-powered development

## Quick Start Commands

### Development
```bash
npm start                    # Start Expo development server
npm run quality-check        # Run complete CI validation (lint + typecheck + tests)
npm test                     # Run all tests (200+ tests, 70%+ coverage)
npm run lint                 # ESLint code quality checks
npm run typecheck            # TypeScript type checking
```

### Platform Testing
```bash
npm run ios                  # iOS simulator
npm run android              # Android emulator
npm run web                  # Web browser
```

### Build & Deploy
```bash
npx eas build                # Production binaries
npx eas submit               # Submit to app stores
```

### Quality Assurance (REQUIRED before commits)
```bash
npm run lint && npm run typecheck && npm test
```

## Persona Testing Framework

📋 **Complete persona testing documentation has been moved to [`PERSONA_TESTING.md`](./PERSONA_TESTING.md)**

For all persona testing instructions, troubleshooting, and advanced configurations, refer to the dedicated documentation:

### Quick Reference
```bash
# Single persona test (most common)
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# For complete instructions, cross-persona testing, troubleshooting, and advanced options:
# See PERSONA_TESTING.md
```

**Available Personas**: `ira` (8y), `omi` (5y), `mumu` (25y), `ma` (60y)
**Documentation**: All testing procedures → [`PERSONA_TESTING.md`](./PERSONA_TESTING.md)

## Architecture

### Project Structure
```
app/                    # Expo Router navigation
├── (tabs)/            # Tab-based UI
├── components/        # Game components (GameTopBar, ScoreDisplay, etc.)
hooks/                 # Custom React hooks (useGameState, usePowerSurge)
lib/                   # Core game logic (infinite-puzzle-generator)
constants/             # Configuration (gameConfig.ts)
styles/                # Centralized styling (gameStyles.ts)
scripts/workflows/     # Automation & CI/CD
.github/workflows/     # GitHub Actions
```

### Core Systems

**9 Puzzle Types**: Pattern, Serial Reasoning, Number Series, Algebraic, Sequential Figures, Number Grid, Number Analogies, Transformation, Analogy

**Power Surge System**: 60-second evaluation windows with arithmetic progression scoring

**Level System**: Dynamic visual themes (Seeker → Learner → Thinker → Creator → Visionary)

**Adaptive Engine**: Intelligent puzzle selection based on user performance and learning patterns

## Technical Details

### Platform Support
- **iOS**: Native app with App Store deployment
- **Android**: Native Android app
- **Web**: Progressive Web App
- **Bundle ID**: `com.shiel.giftedminds`

### Configuration & Imports
```typescript
// Path mapping for imports
import { generateInfinitePuzzle } from '@/lib/infinite-puzzle-generator';
import { useGameState } from '@/hooks/useGameState';
import { GAME_CONFIG } from '@/constants/gameConfig';
```

### Design System
**Level-Based Theming**: Seeker (0) → Learner (1) → Thinker (2) → Creator (3) → Visionary (4)
**Power Surge Circular Theming**: Level 4 → Level 0 during surge
**Mobile-First**: Platform-optimized shadows, 44pt touch targets

## Development Workflows

📋 **Complete workflow documentation has been moved to [`docs/DEVELOPMENT_WORKFLOWS.md`](./docs/DEVELOPMENT_WORKFLOWS.md)**

### Quick Reference
- **CI/CD**: Automated testing, building, and deployment
- **Quality Gates**: `npm run lint && npm run typecheck && npm test` required before commits
- **Daily Releases**: Smart automation with App Store integration
- **Code Reviews**: Automated PR analysis and inline comments

**Key Workflows**: CI validation, Claude issue fixing, daily releases, code quality enforcement
**Documentation**: All workflow procedures → [`docs/03-development/workflows.md`](./docs/03-development/workflows.md)

## Complete Documentation

📚 **Full documentation available in [`docs/`](./docs/)** with organized structure for all audiences:

### Product & Business Documentation
- **[Product Overview](./docs/00-product/)**: Vision, features, user journey, business case
- **[Objectives & Strategy](./docs/00-product/objectives.md)**: KPIs, success metrics, growth targets
- **[User Experience](./docs/00-product/user-journey.md)**: Persona-based experiences across age groups
- **[Business Case](./docs/00-product/business-case.md)**: Market analysis, competitive advantages, ROI

### Technical Documentation
- **[Getting Started](./docs/01-getting-started/)**: Installation, setup, quick reference
- **[Architecture](./docs/02-architecture/)**: System design, puzzle system, adaptive engine
- **[Development](./docs/03-development/)**: Workflows, testing, hooks, design system
- **[Deployment](./docs/04-deployment/)**: Build process, App Store, releases
- **[Operations](./docs/07-operations/)**: Autonomous delivery, monitoring, release management

### Analysis & Guides
- **[Guides](./docs/05-guides/)**: Contributing, troubleshooting, migrations
- **[Analysis](./docs/06-analysis/)**: Performance reports, persona analysis

**Quick Access**: [`docs/README.md`](./docs/README.md) for complete documentation index
**Main Entry Point**: [`README.md`](./README.md) now serves all audiences with role-based navigation