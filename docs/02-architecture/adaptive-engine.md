# Adaptive Engine Architecture

## Overview

The Adaptive Engine is the AI-powered core that intelligently selects puzzles based on user behavioral patterns, learning state, and performance data. It continuously learns and adapts to provide optimal puzzle experiences.

## Core Components

### 1. **Intelligent Puzzle Engine** 🧠
**File**: `lib/adaptiveEngine/intelligentPuzzleEngine.ts`

The central decision-making system that orchestrates puzzle selection:

```typescript
// Main entry point
async generateAdaptivePuzzle(): Promise<PuzzleRecommendation>

// Core process:
// 1. Gather user context
// 2. Generate 10 candidate puzzles
// 3. Analyze each candidate (DNA + predictions)
// 4. Apply safety constraints
// 5. Select optimal puzzle using multi-criteria scoring
```

### 2. **Puzzle DNA Analyzer** 🧬
**File**: `lib/adaptiveEngine/puzzleDNAAnalyzer.ts`

Automatically characterizes puzzle difficulty and engagement potential:

```typescript
interface PuzzleDNA {
  puzzleId: string;
  puzzleType: string;
  discoveredDifficulty: number;    // 0-1 scale
  engagementPotential: number;     // Historical engagement data
  skillTargets: SkillTarget[];     // Cognitive abilities tested
  visualComplexity: VisualComplexity;
  logicalComplexity: LogicalComplexity;
  cognitiveLoad: CognitiveLoad;
}
```

### 3. **Behavioral Signature Storage** 💾
**File**: `lib/adaptiveEngine/behavioralSignatureStorage.ts`

Tracks user patterns and preferences:

```typescript
interface UserProfile {
  userId: string;
  totalSessions: number;
  totalPuzzlesSolved: number;
  overallAccuracy: number;
  currentSkillLevel: number;       // 0-1 scale
  learningVelocity: number;        // Learning speed
  preferredDifficulty: number;     // User's comfort zone
  currentMaxDifficulty: number;    // Adaptive difficulty ceiling
}
```

### 4. **Learning Orchestrator** 🎯
**File**: `lib/adaptiveEngine/learningOrchestrator.ts`

Manages continuous learning and adaptation:

```typescript
interface LearningState {
  adaptationQuality: number;       // How well system adapts
  engagementLevel: number;         // Current user engagement
  learningProgress: number;        // Overall progress rate
  confidenceLevel: number;         // System confidence in predictions
}
```

## Decision Process

### Step 1: Context Gathering
```typescript
interface AdaptiveContext {
  userProfile: UserProfile;           // Long-term user data
  currentSession: SessionContext;     // Current session state
  behavioralSignature: BehavioralPattern; // Recent behavior
  recentPerformance: RecentPerformanceData; // Last 5 puzzles
  strategicObjectives: LearningObjective[]; // Learning goals
}
```

### Step 2: User State Classification
The engine classifies users into categories:
- **New User**: Special handling for first-time players
- **Struggling User**: Extra support and easier puzzles
- **Flow State**: Maintains optimal challenge level
- **Expert User**: Progressive difficulty escalation

### Step 3: Candidate Generation
Generates 10 diverse puzzle candidates using different strategies:

**Generation Strategies**:
- **Confidence Builder** (25%): Easy puzzles in user's strong areas
- **Skill Development** (30%): Targets identified weak areas
- **Progressive Challenge** (25%): Slightly above current level
- **Engagement Recovery** (15%): High engagement when user is disengaged
- **Exploratory** (5%): New/rare puzzle types for variety

### Step 4: Candidate Analysis
Each candidate undergoes comprehensive analysis:

```typescript
interface PuzzleRecommendation {
  puzzle: BasePuzzle;
  dna: PuzzleDNA;
  predictedSuccess: number;        // 0-1 probability of success
  predictedEngagement: number;     // 0-1 engagement score
  strategicValue: number;          // Alignment with learning goals
  selectionReason: SelectionReason; // Why this puzzle was chosen
}
```

### Step 5: Safety Constraints
Applies configurable safety filters:

**New User Protection**:
- Max difficulty from `userProfile.currentMaxDifficulty`
- Engagement-prioritized selection
- Gradual difficulty introduction

**Struggling User Protection**:
- Lower difficulty ceiling
- Confidence-building focus
- Success-rate optimization

### Step 6: Multi-Criteria Selection
Final selection uses weighted scoring:

```typescript
// Scoring factors:
// - Predicted success rate (prevents frustration)
// - Predicted engagement (maintains interest)
// - Strategic value (achieves learning goals)
// - Difficulty appropriateness (optimal challenge)
// - Variety bonus (prevents staleness)
```

## Prediction Models

### Success Prediction Model
Predicts likelihood of user solving puzzle correctly:

**Input Features**:
- User skill level vs puzzle difficulty
- Recent performance trends
- Puzzle type preferences
- Time-of-session factors
- Historical success rates

**Output**: 0-1 probability of correct solution

### Engagement Prediction Model
Predicts how engaging puzzle will be for user:

**Input Features**:
- User's preferred puzzle types
- Session engagement trends
- Puzzle novelty/variety
- Difficulty vs skill match
- Historical engagement data

**Output**: 0-1 engagement score

## Continuous Learning

### Performance Tracking
After each puzzle completion:

```typescript
// Records actual vs predicted performance
recordPuzzleCompletion(
  puzzleRecommendation: PuzzleRecommendation,
  success: boolean,
  solveTime: number,
  confidenceScore: number,
  engagementScore: number,
  powerUpUsed: boolean
)
```

### Model Updates
- **Prediction accuracy tracking**: Measures model performance
- **User profile updates**: Adjusts skill level and preferences
- **Puzzle DNA updates**: Refines difficulty ratings
- **Learning velocity calculation**: Tracks learning progress

### Adaptive Adjustments
- **Difficulty ceiling adjustment**: Gradually increases max difficulty
- **Preference learning**: Identifies favorite puzzle types
- **Engagement optimization**: Adjusts selection for better engagement
- **Flow state detection**: Recognizes and maintains optimal challenge

## Advanced Features

### Dynamic Difficulty Escalation
**File**: `lib/adaptiveEngine/dynamicDifficultyEscalator.ts`

Automatically adjusts difficulty ceiling based on performance:
- Monitors success rates and solve times
- Identifies readiness for increased challenge
- Gradually raises difficulty boundaries
- Prevents both boredom and frustration

### Retention Risk Prediction
**File**: `lib/adaptiveEngine/retentionRiskPredictor.ts`

Predicts and prevents user churn:
- Monitors engagement decline patterns
- Identifies at-risk sessions
- Triggers intervention strategies
- Optimizes for long-term retention

### Pool Distribution Strategies
**File**: `lib/adaptiveEngine/poolDistributionStrategies.ts`

Smart candidate pool management:
- Balances different puzzle types
- Ensures variety without repetition
- Optimizes for learning objectives
- Adapts to user preferences

## Configuration

### Adaptive Engine Config
```typescript
interface AdaptiveEngineConfig {
  newUserSettings: {
    enabled: boolean;
    puzzleCountThreshold: number;
    skillLevelThreshold: number;
    maxDifficulty: number;
    engagementPriority: number;
  };
  strugglingUserSettings: {
    enabled: boolean;
    accuracyThreshold: number;
    maxDifficulty: number;
  };
  metricsLogging: {
    detailedLearningMetrics: boolean;
    predictionAccuracyTracking: boolean;
    adaptiveDecisionLogging: boolean;
  };
}
```

## Performance Characteristics

### Optimization Strategies
- **Candidate generation batching**: Efficient parallel processing
- **Prediction model caching**: Reuse computations when possible
- **Storage compression**: Minimal memory footprint
- **Async operations**: Non-blocking user experience

### Scalability
- **Platform abstraction**: Works across iOS/Android/Web
- **Memory management**: Handles long gaming sessions
- **Storage efficiency**: Compressed behavioral signatures
- **Real-time adaptation**: Sub-second response times

## Data Privacy & Security

### Privacy-First Design
- **Local-first storage**: Minimal cloud dependency
- **Anonymous analytics**: No personally identifiable information
- **Behavioral signatures**: Compressed, non-reversible data
- **User control**: Easy data reset and deletion

### Storage Adaptation
**File**: `lib/adaptiveEngine/adaptiveStorageAdapter.ts`

Universal storage layer:
- **iOS**: Native iOS storage optimization
- **Android**: Android-specific persistence
- **Web**: LocalStorage with fallbacks
- **Unified API**: Platform-agnostic interface

## Testing & Validation

### Persona Testing Framework
Validates adaptive behavior across user types:
- **Age groups**: 5y, 8y, 25y, 60y personas
- **Learning patterns**: Different cognitive profiles
- **Performance simulation**: Realistic user behavior
- **Adaptation verification**: Confirms proper adjustments

### Metrics & Analytics
- **Prediction accuracy**: Success and engagement model performance
- **Adaptation quality**: Measures of system responsiveness
- **Learning effectiveness**: User progress tracking
- **System health**: Performance and error monitoring

## Integration Points

### Game Logic Integration
```typescript
// Primary integration via custom hook
const { adaptivePuzzle, recordCompletion } = useAdaptiveGameLogic();
```

### Storage Integration
```typescript
// Universal storage access
import { universalAdaptiveStorage } from '@/lib/adaptiveEngine';
```

### Analytics Integration
```typescript
// Metrics tracking
import { adaptiveMetricsTracker } from '@/lib/adaptiveEngine';
```

## Future Enhancements

### Planned Features
- **Multi-session learning**: Cross-session pattern recognition
- **Social learning**: Collaborative puzzle solving
- **Advanced personalization**: Deep preference modeling
- **Real-time difficulty**: Mid-puzzle difficulty adjustment

### Research Areas
- **Cognitive load modeling**: Better working memory prediction
- **Emotional state detection**: Mood-aware adaptation
- **Long-term retention**: Spaced repetition integration
- **Transfer learning**: Cross-domain skill application

## Related Documentation

- [Puzzle System Integration](puzzle-system.md)
- [Component Architecture](components.md)
- [Performance Optimization](../05-guides/troubleshooting.md)
- [Testing Strategies](../03-development/testing.md)