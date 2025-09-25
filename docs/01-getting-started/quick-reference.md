# Quick Reference

## Essential Commands

### Development
```bash
npm start                    # Start Expo development server
npm run quality-check        # Complete CI validation (lint + typecheck + tests)
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

## Project Structure

```
app/                    # Expo Router navigation
├── (tabs)/            # Tab-based UI screens
├── components/        # Reusable UI components
hooks/                 # Custom React hooks (useGameState, usePowerSurge)
lib/                   # Core game logic
├── puzzles/           # 9 puzzle type generators
├── adaptiveEngine/    # AI learning system
constants/             # Configuration (gameConfig.ts)
styles/                # Centralized styling (gameStyles.ts)
scripts/workflows/     # Automation & CI/CD
.github/workflows/     # GitHub Actions
```

## Essential Imports

```typescript
// Core game logic
import { generateInfinitePuzzle } from '@/lib/infinite-puzzle-generator';
import { useGameState } from '@/hooks/useGameState';
import { GAME_CONFIG } from '@/constants/gameConfig';

// Design system
import { buttonStyles, cardStyles, layoutStyles, colors, spacing } from '@/design';
```

## Puzzle Types (12 Total)

1. **Pattern** - Visual pattern recognition in 3x3 grids
2. **Serial Reasoning** - Matrix logic puzzles
3. **Number Series** - Mathematical sequence completion
4. **Algebraic** - Mathematical reasoning
5. **Sequential Figures** - Visual sequence progression
6. **Number Grid** - Numerical pattern matrices
7. **Number Analogies** - Mathematical relationships
8. **Transformation** - Shape transformation rules (currently disabled)
9. **Analogy** - Logical relationship patterns
10. **Figure Classification** - Visual pattern grouping
11. **Paper Folding** - 3D spatial reasoning
12. **Following Directions** - Sequential instruction processing
13. **Picture Series** - Visual progression sequences

## Persona Testing

```bash
# Single persona test (most common)
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# Available personas
ira (8y)    # Child learner
omi (5y)    # Young learner
mumu (25y)  # Adult learner
ma (60y)    # Senior learner
```

## Level System

| Level | Name | Theme | Description |
|-------|------|-------|-------------|
| 0 | Seeker | Dark | Professional, starting level |
| 1 | Learner | Blue | Trustworthy, learning phase |
| 2 | Thinker | Yellow | Energetic, analytical |
| 3 | Creator | Pink | Creative, advanced |
| 4 | Visionary | Green | Mastery level |

**Power Surge**: Circular progression (4→0→1→2→3→4)

## Design System Quick Access

### Common Styles
```typescript
buttonStyles.primary(levelIndex, 'default')      # Main buttons
buttonStyles.option(levelIndex, 'correct')       # A/B/C/D options
cardStyles.status(levelIndex)                     # Top bar cards
layoutStyles.screen(levelIndex)                  # Screen backgrounds
```

### Design Tokens
```typescript
spacing.md      # 16px (most common)
spacing.lg      # 24px (most common)
colors.text.primary              # Standard text
colors.components.background     # Uniform backgrounds
typography.fontSize.md           # 16px standard
typography.fontWeight.medium     # '500' most common
```

## Troubleshooting

### Common Issues
- **Metro bundler**: `npx expo start --clear`
- **Node modules**: `rm -rf node_modules && npm install`
- **iOS build**: Clean Xcode cache and rebuild
- **Type errors**: Run `npm run typecheck`

### Getting Help
- Check [troubleshooting guide](../05-guides/troubleshooting.md)
- Review [installation guide](installation.md)
- Consult [development setup](development-setup.md)

## Documentation Index

- **Getting Started**: [Installation](installation.md) | [Development Setup](development-setup.md)
- **Architecture**: [Overview](../02-architecture/overview.md) | [Puzzle System](../02-architecture/puzzle-system.md)
- **Development**: [Workflows](../03-development/workflows.md) | [Testing](../03-development/testing.md)
- **Deployment**: [Build Process](../04-deployment/build-process.md) | [App Store](../04-deployment/app-store.md)
- **Guides**: [Contributing](../05-guides/contributing.md) | [Design System](../03-development/design-system.md)