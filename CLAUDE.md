# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Artistic Minds** is an innovative Tetris Art Generator that transforms classic puzzle gameplay into creative expression - featuring adaptive AI-powered shape selection, **infinite abstract art generation** with organic curves, geometric patterns, and artistic brushstrokes. Players create unique artworks through Tetris-style gameplay, then share their masterpieces with the world through an integrated social platform.

### Product Context
- **Market Position**: First Tetris-style game that generates shareable abstract art through gameplay
- **User Base**: Creative minds of all ages (8-65+) seeking artistic expression through gaming
- **Business Value**: Gaming + Art creation platform with B2C markets, NFT potential, print-on-demand integration
- **Technical Excellence**: Built on proven Gifted Minds foundation with 200+ tests, 70%+ coverage, TypeScript strict

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

## Art Generation System

### Core Gameplay
- **Tetris-Style Mechanics**: Classic falling pieces with artistic twist
- **Infinite Shape Variety**: Organic curves, geometric patterns, brushstrokes
- **Art Creation**: Each game generates unique abstract artwork
- **Social Sharing**: High-res export, gallery system, community features

### Shape Libraries
**Organic Forms**: Sine waves, spirals, leaf shapes, natural elements
**Geometric Abstractions**: Sacred geometry, architectural elements, crystal formations
**Artistic Brushstrokes**: Watercolor blobs, calligraphy, paint textures
**Cultural Patterns**: Art movements, cultural aesthetics, themed collections

## Architecture

### Project Structure
```
app/                    # Expo Router navigation
├── (tabs)/            # Tab-based UI
├── components/        # Art generation components (ShapeRenderer, ArtCanvas, etc.)
hooks/                 # Custom React hooks (useArtGeneration, useShapeLibrary)
lib/                   # Core art generation logic (artistic-shape-generator)
constants/             # Configuration (artConfig.ts, shapeLibrary.ts)
styles/                # Art-focused styling (artStyles.ts)
scripts/workflows/     # Automation & CI/CD
.github/workflows/     # GitHub Actions
```

### Core Systems

**Shape Generation Engine**: Infinite procedural shape creation with artistic coherence
**Adaptive Art AI**: Learns user aesthetic preferences and adapts shape selection
**Canvas System**: Real-time art composition and visual harmony algorithms
**Export Engine**: High-resolution artwork generation for sharing and printing

## Technical Details

### Platform Support
- **iOS**: Native app with App Store deployment
- **Android**: Native Android app
- **Web**: Progressive Web App
- **Bundle ID**: `com.shiel.artisticminds`

### Configuration & Imports
```typescript
// Path mapping for imports
import { generateArtisticShape } from '@/lib/artistic-shape-generator';
import { useArtGeneration } from '@/hooks/useArtGeneration';
import { ART_CONFIG } from '@/constants/artConfig';
```

### Art System
**Shape Categories**: Organic, Geometric, Artistic, Cultural
**Style Adaptation**: AI learns and adapts to user aesthetic preferences
**Composition Rules**: Golden ratio, visual balance, color harmony
**Export Formats**: High-res PNG, vector SVG, print-ready formats

## Development Workflows

📋 **Complete workflow documentation available in [`docs/DEVELOPMENT_WORKFLOWS.md`](./docs/DEVELOPMENT_WORKFLOWS.md)**

### Quick Reference
- **CI/CD**: Automated testing, building, and deployment
- **Quality Gates**: `npm run lint && npm run typecheck && npm test` required before commits
- **Art Testing**: Automated visual regression testing for art generation
- **Code Reviews**: Automated PR analysis and inline comments

**Key Workflows**: CI validation, art generation testing, daily releases, quality enforcement
**Documentation**: All workflow procedures → [`docs/03-development/workflows.md`](./docs/03-development/workflows.md)

## Complete Documentation

📚 **Full documentation available in [`docs/`](./docs/)** with organized structure for all audiences:

### Product & Business Documentation
- **[Product Overview](./docs/00-product/)**: Vision, features, user journey, business case
- **[Art Generation System](./docs/00-product/art-system.md)**: Shape libraries, artistic algorithms
- **[User Experience](./docs/00-product/user-journey.md)**: Creative workflow and social features
- **[Business Case](./docs/00-product/business-case.md)**: Market analysis, monetization, growth

### Technical Documentation
- **[Getting Started](./docs/01-getting-started/)**: Installation, setup, quick reference
- **[Architecture](./docs/02-architecture/)**: Art generation system, adaptive AI engine
- **[Development](./docs/03-development/)**: Workflows, testing, hooks, art system
- **[Deployment](./docs/04-deployment/)**: Build process, App Store, releases
- **[Operations](./docs/07-operations/)**: Autonomous delivery, monitoring, release management

### Analysis & Guides
- **[Guides](./docs/05-guides/)**: Contributing, troubleshooting, migrations
- **[Analysis](./docs/06-analysis/)**: Art generation reports, user engagement analysis

**Quick Access**: [`docs/README.md`](./docs/README.md) for complete documentation index
**Main Entry Point**: [`README.md`](./README.md) now serves all audiences with role-based navigation