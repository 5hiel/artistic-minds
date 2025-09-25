# System Architecture Overview

## Project Overview

**Gifted Minds** is a React Native Expo puzzle game featuring **12 distinct puzzle types** with 35+ subtypes covering cognitive reasoning, pattern recognition, mathematical relationships, and spatial transformations. The app includes sophisticated scoring with power surge mechanics, modular architecture with custom hooks, and automated CI/CD workflows.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
├─────────────────────────────────────────────────────────┤
│ Expo Router App    │ React Components │ Design System    │
│ - Tab Navigation   │ - Game UI        │ - Level Themes   │
│ - Screen Management│ - Puzzle Display │ - Responsive     │
└─────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
├─────────────────────────────────────────────────────────┤
│ Custom Hooks       │ Game State       │ Puzzle Engine    │
│ - useGameState     │ - Scoring        │ - 9 Puzzle Types │
│ - usePowerSurge    │ - Level System   │ - Infinite Gen   │
│ - useAdaptive      │ - Power Mechanics│ - Difficulty     │
└─────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                   Adaptive AI Layer                      │
├─────────────────────────────────────────────────────────┤
│ Intelligent Engine │ Learning System  │ User Profiling   │
│ - Puzzle Selection │ - Adaptation     │ - Behavioral     │
│ - Difficulty Adj   │ - Continuous     │ - Performance    │
│ - Engagement Opt   │ - Prediction     │ - Preferences    │
└─────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                          │
├─────────────────────────────────────────────────────────┤
│ Storage Adapters   │ Caching          │ Analytics        │
│ - iOS/Android      │ - Puzzle DNA     │ - Performance    │
│ - Universal API    │ - User Profiles  │ - Usage Metrics  │
│ - Behavioral Data  │ - Learning State │ - Error Tracking │
└─────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. **Puzzle System** ([Details](puzzle-system.md))
- **12 puzzle types** with dynamic generation
- **Infinite puzzle engine** with variety control
- **Difficulty adaptation** based on user performance
- **DNA analysis** for puzzle characterization

### 2. **Adaptive Engine** ([Details](adaptive-engine.md))
- **Intelligent puzzle selection** using ML models
- **Continuous learning** from user interactions
- **Behavioral pattern recognition** and adaptation
- **Performance prediction** and engagement optimization

### 3. **Game Mechanics**
- **Power Surge System**: 60-second evaluation windows with arithmetic progression scoring
- **Level System**: Dynamic visual themes (Seeker → Learner → Thinker → Creator → Visionary)
- **Scoring Algorithm**: Time-based, accuracy-weighted with streak bonuses
- **Progress Tracking**: Session-based and long-term learning analytics

### 4. **UI/UX System**
- **Level-based theming** with automatic progression
- **Power surge visual effects** with circular theme switching
- **Responsive design** optimized for mobile-first experience
- **Accessibility compliance** with 44pt touch targets

## Platform Support

### Target Platforms
- **iOS**: Native app with App Store deployment
- **Android**: Native Android app with Google Play
- **Web**: Progressive Web App for broader accessibility

### Technical Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router for type-safe routing
- **State Management**: Custom hooks with Context API
- **Storage**: Platform-specific adaptive storage
- **Testing**: Jest + React Testing Library (200+ tests, 70%+ coverage)
- **Build System**: EAS Build for production deployment

## Data Flow

### User Interaction Flow
```
User Action → Hook Logic → State Update → Component Re-render
     ↓              ↑           ↓              ↑
Adaptive Engine ← Analytics → Storage → Performance Tracking
```

### Puzzle Generation Flow
```
Request → User Profile → Adaptive Context → Candidate Generation
   ↑                                              ↓
Analytics ← Selection Reason ← Optimal Choice ← DNA Analysis
```

## Performance Characteristics

### Optimization Strategies
- **Lazy loading** of puzzle generators
- **Memoized computations** for expensive calculations
- **Efficient storage** with compression and caching
- **Minimal re-renders** through optimized state management

### Scalability Considerations
- **Modular architecture** for easy feature addition
- **Platform abstraction** for cross-platform compatibility
- **Async operations** for smooth user experience
- **Memory management** for long gaming sessions

## Security & Privacy

### Data Protection
- **Local-first storage** minimizes data exposure
- **Anonymous analytics** with no personally identifiable information
- **Secure communication** for App Store interactions
- **Privacy compliance** with minimal data collection

### Code Quality
- **TypeScript strict mode** for type safety
- **ESLint + Prettier** for code consistency
- **Comprehensive testing** for reliability
- **Automated CI/CD** for quality assurance

## Development Workflow

### Quality Gates
- **Pre-commit hooks** for code quality
- **Automated testing** on every push
- **Type checking** for runtime safety
- **Performance monitoring** for optimization

### Deployment Pipeline
- **Feature branches** with PR reviews
- **Automated building** with EAS
- **App store deployment** with smart automation
- **Rollback capabilities** for quick recovery

## Next Steps

- [Puzzle System Details](puzzle-system.md)
- [Adaptive Engine Details](adaptive-engine.md)
- [Component Architecture](components.md)
- [Development Workflows](../03-development/workflows.md)