# Adaptive Engine Documentation

## Table of Contents
1. [Architecture & Data Flow](#architecture--data-flow)
2. [Decision Tree & User State Classification](#decision-tree--user-state-classification)
3. [Learning Algorithms & Behavioral Tracking](#learning-algorithms--behavioral-tracking)
4. [Data Elements & Configuration](#data-elements--configuration)
5. [Component Interaction Diagrams](#component-interaction-diagrams)
6. [Implementation Examples](#implementation-examples)

---

## Architecture & Data Flow

The Adaptive Engine is a sophisticated learning system that continuously adapts puzzle selection based on user behavior, performance patterns, and cognitive abilities. It operates through five core components that work together to create an intelligent tutoring system.

### Core Components

#### 1. IntelligentPuzzleEngine (`intelligentPuzzleEngine.ts`)
**Primary Role:** Central coordination and puzzle selection orchestration
- **Key Methods:** `generateAdaptivePuzzle()`, `recordPuzzleCompletion()`, `selectOptimalPuzzle()`
- **Decision Factors:** Behavioral patterns, puzzle DNA, user state classification, pool distribution strategies
- **Integration:** Coordinates with all other adaptive engine components

#### 2. BehavioralSignatureStorage (`behavioralSignatureStorage.ts`)
**Primary Role:** Persistent user learning data and cognitive profiling
- **Key Methods:** `getUserProfile()`, `syncBehavioralMetricsToProfile()`, `storeInteractionSession()`
- **Data Management:** User profiles, cognitive assessments, session history, puzzle-type performance tracking
- **Storage Strategy:** Compressed, efficient storage with 7-day log rotation

#### 3. PuzzleDNAAnalyzer (`puzzleDNAAnalyzer.ts`)
**Primary Role:** Automatic puzzle characterization and complexity analysis
- **Key Methods:** `analyzePuzzle()`, `findSimilarPuzzles()`, `recommendPuzzles()`
- **Analysis Dimensions:** Visual complexity, logical complexity, cognitive load, skill targets
- **Caching Strategy:** Semantic type-based caching for efficiency

#### 4. UserStateClassifier (`userStateClassifier.ts`)
**Primary Role:** Real-time user state assessment and adaptation triggers
- **Key Methods:** `classifyUserState()`, `detectModifiers()`
- **Classification States:** new_user, struggling, stable, progressing, excelling, expert_demanding
- **Dynamic Modifiers:** confidence_crisis, disengaged, power_dependent, fatigued

#### 5. PoolDistributionStrategies (`poolDistributionStrategies.ts`)
**Primary Role:** Strategic candidate pool distribution for optimal learning outcomes
- **Key Methods:** `getPoolStrategy()`, `applyStrengthBasedAdjustments()`
- **Distribution Categories:** Confidence builders, skill development, progressive challenge, engagement recovery, exploratory new
- **Adaptation Logic:** Pre-Level 15 strength-based distribution, Omi-like user detection

#### 6. InteractionCapture (`interactionCapture.ts`)
**Primary Role:** Micro-behavior tracking and pattern recognition
- **Key Methods:** `startPuzzleSession()`, `completePuzzleSession()`, `getBehavioralSignature()`
- **Tracking Data:** Response times, confidence scores, engagement metrics, power-up usage patterns
- **Pattern Analysis:** Learning velocity, skill momentum, hesitation tendencies

### Data Flow Architecture

```
User Interaction
       ↓
InteractionCapture → BehavioralPattern
       ↓
UserStateClassifier → UserStateAnalysis
       ↓
PoolDistributionStrategies → PoolStrategy
       ↓
IntelligentPuzzleEngine → CandidateGeneration
       ↓
PuzzleDNAAnalyzer → PuzzleCharacterization
       ↓
Multi-Criteria Selection → PuzzleRecommendation
       ↓
BehavioralSignatureStorage → Learning Updates
```

---

## Decision Tree & User State Classification

### User State Classification Logic

The system classifies users into 8 distinct states with associated decision logic:

#### Primary Classification Criteria

1. **new_user** (totalPuzzlesSolved < 10)
   ```typescript
   if (dataPoints.isNewUser) {
     return { state: 'new_user', confidence: 0.95 };
   }
   ```

2. **severely_struggling** (recentSuccessRate < 0.3)
   ```typescript
   if (dataPoints.recentSuccessRate < 0.3) {
     if (dataPoints.consecutiveFailures >= 3) {
       confidence = 0.9; // High confidence in severe struggle
     }
     return { state: 'severely_struggling', confidence };
   }
   ```

3. **struggling** (recentSuccessRate < 0.5 OR skillMomentum < -0.2)
   ```typescript
   if (dataPoints.recentSuccessRate < 0.5 || dataPoints.skillMomentum < -0.2) {
     return { state: 'struggling', reasoning, confidence };
   }
   ```

4. **falling_back** (skillMomentum < -0.1 AND sessionPerformanceDecline > 0.1)
   ```typescript
   if (dataPoints.skillMomentum < -0.1 && dataPoints.sessionPerformanceDecline > 0.1) {
     return { state: 'falling_back', confidence: 0.85 };
   }
   ```

5. **expert_demanding** (recentSuccessRate > 0.9 AND skillMomentum > 0.15 AND engagementLevel < 0.6)
   ```typescript
   if (dataPoints.recentSuccessRate > 0.9 &&
       dataPoints.skillMomentum > 0.15 &&
       dataPoints.engagementLevel < 0.6 &&
       !dataPoints.isNewUser) {
     return { state: 'expert_demanding', confidence: 0.95 };
   }
   ```

6. **excelling** (recentSuccessRate > 0.8 AND skillMomentum > 0.1)
7. **progressing** (recentSuccessRate > 0.6)
8. **stable** (default fallback state)

#### Pool Distribution Decision Tree

Based on user state classification, the system determines puzzle candidate pool distribution:

```
UserState → PoolStrategy Mapping:

new_user:
├── confidenceBuilders: 7/10 (70%)
├── skillDevelopment: 2/10 (20%)
├── progressiveChallenge: 1/10 (10%)
└── engagementRecovery: 0/10 (0%)

severely_struggling:
├── confidenceBuilders: 6/10 (60%)
├── skillDevelopment: 2/10 (20%)
├── engagementRecovery: 2/10 (20%)
└── progressiveChallenge: 0/10 (0%)

expert_demanding:
├── progressiveChallenge: 7/10 (70%)
├── exploratoryNew: 2/10 (20%)
├── skillDevelopment: 1/10 (10%)
└── confidenceBuilders: 0/10 (0%)
```

#### Pre-Level 15 Strength-Based Adjustments

Special logic for users below Level 15 (viral sharing trigger):

```typescript
// Strength-based modification for pre-Level 15 users
if (currentLevel < 15 && userProfile) {
  // Boost confidence builders significantly
  adjustedDistribution.confidenceBuilders = Math.min(8, base + 3);

  // Reduce progressive challenge
  adjustedDistribution.progressiveChallenge = Math.max(0, base - 2);

  // Omi-like user special handling
  if (isOmiLikeUser(userProfile)) {
    // User excels at patterns but struggles with math
    adjustedDistribution.confidenceBuilders = Math.min(9, base + 2);
    adjustedDistribution.skillDevelopment = Math.max(1, base - 1);
  }
}
```

---

## Learning Algorithms & Behavioral Tracking

### Behavioral Signature Calculation

The system tracks and calculates multiple behavioral dimensions:

#### 1. Learning Velocity Calculation
**Formula:** `(recentAvg - olderAvg) * dataConfidence`

```typescript
private calculateLearningVelocity(patterns: BehavioralPattern[]): number {
  if (patterns.length < 3) {
    // Handle limited data with confidence weighting
    const trend = patterns[1].accuracyTrend - patterns[0].accuracyTrend;
    const confidenceWeight = 0.6; // Medium confidence
    return trend * confidenceWeight;
  }

  const recentSize = Math.min(5, Math.ceil(patterns.length / 2));
  const recentAccuracy = patterns.slice(-recentSize).map(p => p.accuracyTrend);
  const olderAccuracy = patterns.slice(0, patterns.length - recentSize).map(p => p.accuracyTrend);

  const recentAvg = this.average(recentAccuracy);
  const olderAvg = this.average(olderAccuracy);
  const dataConfidence = Math.min(1, patterns.length / 5);

  return (recentAvg - olderAvg) * dataConfidence;
}
```

#### 2. Skill Momentum Calculation
**Formula:** Weighted progression with engagement bonus

```typescript
private calculateSkillMomentum(patterns: BehavioralPattern[]): number {
  const momentum = patterns.reduce((acc, pattern, index) => {
    const weight = (index + 1) / patterns.length; // Recent patterns weighted more
    const engagementBonus = (pattern.engagementLevel - 0.5) * 0.1;
    return acc + ((pattern.accuracyTrend + engagementBonus) * weight);
  }, 0);

  const dataConfidence = Math.min(1, patterns.length / 8);
  return momentum * dataConfidence;
}
```

#### 3. Cognitive Profile Assessment

##### Processing Speed Assessment
**Method:** Compare actual solve times vs estimated complexity
**Formula:** `efficiency = estimatedTime / actualTime` (capped at 2x)

```typescript
private assessProcessingSpeedFromSessions(sessions: SessionMetric[]): {score: number, confidence: number} {
  let totalSpeedScore = 0;

  for (const session of sessions) {
    const puzzlesPerMinute = session.puzzlesSolved / session.duration;
    const normalizedSpeed = Math.min(1, Math.max(0, (puzzlesPerMinute - 0.5) / 2.5));
    const qualityWeight = (session.accuracy + session.engagementScore) / 2;
    const weightedSpeed = normalizedSpeed * (0.5 + 0.5 * qualityWeight);

    totalSpeedScore += weightedSpeed;
  }

  const score = totalSpeedScore / sessions.length;
  const confidence = Math.min(1, sessions.length / 10);
  return { score, confidence };
}
```

##### Working Memory Assessment
**Method:** Performance on high-difficulty puzzles
**Criteria:** avgDifficulty >= 0.6 indicates memory-intensive

```typescript
private assessWorkingMemoryFromSessions(sessions: SessionMetric[]): {score: number, confidence: number} {
  const memoryIntensiveSessions = sessions.filter(s => s.avgDifficulty >= 0.6);

  const memoryScore = memoryIntensiveSessions.reduce((sum, session) => {
    const memoryPerformance = session.accuracy * (1 + session.avgDifficulty);
    const engagementBonus = session.engagementScore * 0.2;
    return sum + Math.min(1, memoryPerformance + engagementBonus);
  }, 0);

  return {
    score: memoryScore / memoryIntensiveSessions.length,
    confidence: Math.min(1, memoryIntensiveSessions.length / 5)
  };
}
```

### Puzzle DNA Analysis Algorithms

#### Visual Complexity Metrics
```typescript
interface VisualComplexity {
  elementCount: number;         // Total visual elements in puzzle
  colorVariety: number;         // Number of distinct colors/symbols
  spatialDensity: number;       // Elements per unit area
  layoutType: 'grid' | 'sequence' | 'matrix' | 'text' | 'mixed';
  symmetryScore: number;        // 0-1, higher = more symmetrical
  visualNoiseLevel: number;     // 0-1, higher = more distractors
}
```

#### Logical Complexity Assessment
```typescript
interface LogicalComplexity {
  ruleDepth: number;                    // Logical rules involved (1-5)
  patternSophistication: number;        // 0-1, complexity of pattern
  abstractionLevel: number;             // 0-1, concrete vs abstract concepts
  multiStepReasoning: boolean;          // Requires multiple steps
  memoryRequirement: 'low' | 'medium' | 'high';  // Working memory needs
  relationshipTypes: RelationshipType[];         // Types of relationships
}
```

#### Difficulty Level Formula
**Comprehensive difficulty calculation:**

```typescript
private estimateDifficultyLevel(puzzle: BasePuzzle): number {
  let difficulty = 0.3; // Base difficulty

  // Visual complexity factors
  difficulty += (visualComplexity.elementCount / 30) * 0.2;
  difficulty += (visualComplexity.colorVariety / 15) * 0.15;
  difficulty += visualComplexity.visualNoiseLevel * 0.1;

  // Logical complexity factors
  difficulty += (logicalComplexity.ruleDepth / 5) * 0.25;
  difficulty += logicalComplexity.patternSophistication * 0.2;
  difficulty += logicalComplexity.abstractionLevel * 0.15;

  // Cognitive load factors
  difficulty += (cognitiveLoad.estimatedSolveTime / 60000) * 0.1;
  difficulty += cognitiveLoad.errorProneness * 0.1;

  // Bonuses
  if (logicalComplexity.multiStepReasoning) difficulty += 0.1;
  if (logicalComplexity.memoryRequirement === 'high') difficulty += 0.15;

  return Math.max(0, Math.min(1, difficulty));
}
```

### Omi-Like User Detection Algorithm

Special pattern recognition for users who excel at visual patterns but struggle with mathematical reasoning:

```typescript
isOmiLikeUser(profile: UserProfile): boolean {
  const patternStats = profile.puzzleTypeStats?.['pattern'];
  const mathTypes = ['number-series', 'number-analogy', 'algebraic-reasoning', 'serial-reasoning'];

  if (!patternStats || patternStats.totalAttempts < 5) return false;
  if (patternStats.accuracy < 0.75) return false; // Need high pattern accuracy (>75%)

  // Check if user struggles with math-heavy puzzle types
  let mathStruggles = 0;
  let mathTypesAttempted = 0;

  mathTypes.forEach(mathType => {
    const mathStats = profile.puzzleTypeStats?.[mathType];
    if (mathStats && mathStats.totalAttempts >= 3) {
      mathTypesAttempted++;
      if (mathStats.accuracy < 0.4) mathStruggles++;
    }
  });

  // Omi-like: Good at patterns (>75%) AND struggles with math (>50% of attempted math types)
  return mathTypesAttempted >= 2 && mathStruggles >= mathTypesAttempted * 0.5;
}
```

---

## Data Elements & Configuration

### User Profile Data Structure

```typescript
interface UserProfile {
  userId: string;
  createdAt: number;
  lastActive: number;

  // Core performance metrics
  totalSessions: number;
  totalPuzzlesSolved: number;
  overallAccuracy: number;         // 0-1, running average
  currentSkillLevel: number;       // 0-1, overall skill estimation

  // Learning progression metrics
  highScore: number;
  growthTarget: number;            // Internal target for progression
  skillMomentum: number;           // -1 to 1, improvement trajectory
  learningVelocity: number;        // Rate of skill acquisition

  // Behavioral characteristics
  cognitiveProfile: CognitiveProfile;
  preferredDifficulty: number;     // 0-1, sweet spot for engagement
  engagementPatterns: EngagementPattern;

  // Puzzle-type-specific performance (Enhanced for Omi-type identification)
  puzzleTypeStats: Record<string, PuzzleTypePerformance>;

  // Monetization tracking
  isPaying: boolean;
  purchaseHistory: PurchaseEvent[];
  powerUpInventory: number;
  lastPowerUpRefresh: number;
}
```

### Cognitive Profile Assessment

```typescript
interface CognitiveProfile {
  skillLevels: Map<SkillTarget, number>;    // 0-1 for each cognitive skill

  // Cognitive capacity indicators
  processingSpeed: number;          // 0-1, information processing rate
  workingMemoryCapacity: number;    // 0-1, estimated capacity
  attentionControl: number;         // 0-1, focus maintenance ability
  errorRecovery: number;            // 0-1, learning from mistakes ability

  // Performance optimization factors
  optimalSessionLength: number;     // Minutes for best performance
  peakPerformanceTime: number;      // Hour of day (0-23) most engaged
  fatigueResistance: number;        // 0-1, performance degradation resistance
}
```

### Puzzle DNA Structure

```typescript
interface PuzzleDNA {
  puzzleId: string;                 // Semantic type identifier for caching
  puzzleType: string;               // Classification (e.g., 'Number Series')
  difficultyLevel: number;          // 0-1, estimated difficulty

  // Multi-dimensional complexity analysis
  visualComplexity: VisualComplexity;
  logicalComplexity: LogicalComplexity;
  cognitiveLoad: CognitiveLoad;

  // Discovered characteristics from user interactions
  discoveredDifficulty: number;     // 0-1, learned from user performance
  engagementPotential: number;      // 0-1, learned from user engagement
  skillTargets: SkillTarget[];      // Cognitive skills this puzzle develops

  // Generation metadata
  generatedAt: number;
  generatorSignature: string;       // Puzzle structure pattern identifier
}
```

### Configuration Thresholds

#### New User Settings
```typescript
newUserSettings: {
  enabled: true,
  puzzleCountThreshold: 5,          // Consider "new" if <= 5 puzzles solved
  skillLevelThreshold: 0.4,         // Force easy if skill level < 0.4
  accuracyThreshold: 0.8,           // Force easy if accuracy < 0.8
  maxDifficulty: 0.4,               // Maximum difficulty (0-0.4 range)
  engagementPriority: 0.7           // Weight engagement vs difficulty
}
```

#### Struggling User Detection
```typescript
strugglingUserSettings: {
  enabled: true,
  puzzleCountThreshold: 10,         // Apply if <= 10 puzzles and struggling
  accuracyThreshold: 0.5,           // Consider struggling if accuracy < 0.5
  maxDifficulty: 0.6                // Allow medium difficulty
}
```

#### State Classification Thresholds
```typescript
// User state classification constants
SEVERE_STRUGGLE_THRESHOLD: 0.3,     // recentSuccessRate < 0.3
STRUGGLING_THRESHOLD: 0.5,          // recentSuccessRate < 0.5
NEGATIVE_MOMENTUM_THRESHOLD: -0.2,   // skillMomentum < -0.2
EXPERT_SUCCESS_THRESHOLD: 0.9,      // recentSuccessRate > 0.9
EXPERT_MOMENTUM_THRESHOLD: 0.15,    // skillMomentum > 0.15
EXPERT_BOREDOM_THRESHOLD: 0.6,      // engagementLevel < 0.6
CONSECUTIVE_FAILURES_CRISIS: 3,     // consecutiveFailures >= 3
```

### Session Tracking Configuration

```typescript
// Session history management
SESSION_HISTORY_LIMIT: 100,         // Keep last 100 sessions
BEHAVIORAL_BUFFER_LIMIT: 50,        // Keep last 50 behavioral patterns
PUZZLE_DNA_CACHE_LIMIT: 100,        // Cache 100 puzzle analyses
INTERACTION_EVENTS_BUFFER: 1000,    // Keep 1000 recent interaction events

// Timing thresholds for interaction analysis
HESITATION_THRESHOLD_MS: 2000,      // 2 seconds = hesitant behavior
FAST_DECISION_THRESHOLD_MS: 1000,   // 1 second = quick decision
OPTIMAL_ENGAGEMENT_RANGE: [5000, 30000], // 5-30 seconds optimal solve time
```

---

## Component Interaction Diagrams

### Puzzle Selection Flow

```
┌─────────────────────┐
│ User Requests       │
│ Next Puzzle         │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ IntelligentPuzzle   │
│ Engine              │
│ .generateAdaptive   │
│ Puzzle()           │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│ BehavioralSignature │────▶│ UserStateClassifier │
│ Storage             │     │ .classifyUserState()│
│ .getUserProfile()   │     └─────────────────────┘
└─────────────────────┘              │
           │                         ▼
           │              ┌─────────────────────┐
           │              │ PoolDistribution    │
           │              │ Strategies          │
           │              │ .getPoolStrategy()  │
           │              └─────────────────────┘
           │                         │
           ▼                         ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Generate 10         │────▶│ PuzzleDNAAnalyzer   │
│ Candidate Puzzles   │     │ .analyzePuzzle()    │
└─────────────────────┘     └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Multi-Criteria      │
│ Puzzle Selection    │
│ Algorithm           │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Selected Puzzle     │
│ with DNA & Reason   │
└─────────────────────┘
```

### Learning Update Flow

```
┌─────────────────────┐
│ User Completes      │
│ Puzzle              │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ InteractionCapture  │
│ .completeAndGet     │
│ Session()           │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│ BehavioralSignature │────▶│ Update Cognitive    │
│ Storage             │     │ Profile based on    │
│ .storeInteraction   │     │ Session Performance │
│ Session()           │     └─────────────────────┘
└─────────────────────┘              │
           │                         ▼
           ▼              ┌─────────────────────┐
┌─────────────────────┐  │ Calculate Learning  │
│ Update User Profile │  │ Velocity & Skill    │
│ Metrics:            │◀─│ Momentum            │
│ • totalPuzzlesSolved │  └─────────────────────┘
│ • overallAccuracy   │
│ • lastActive        │
│ • puzzleTypeStats   │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Sync Behavioral     │
│ Metrics to Profile  │
│ (continuous learning)│
└─────────────────────┘
```

### Adaptive Feedback Loop

```
┌─────────────────────┐
│ Prediction Models   │
│ • Success Rate      │
│ • Engagement Level  │
│ • Difficulty Match  │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Make Prediction     │
│ Before Puzzle       │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ User Solves Puzzle  │
│ (Actual Results)    │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Calculate Prediction│
│ Accuracy            │
│ actual vs predicted │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Update Prediction   │
│ Models with         │
│ Weighted Learning   │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Improved Predictions│
│ for Next Puzzle     │
└─────────────────────┘
```

---

## Implementation Examples

### Example 1: New User First Puzzle Selection

```typescript
// Scenario: Brand new user, never played before
const userProfile = {
  userId: "user_1735728000_abc123",
  totalPuzzlesSolved: 0,
  overallAccuracy: 0,
  currentSkillLevel: 0.3,     // Default beginner level
  preferredDifficulty: 0.5,   // Default medium preference
  puzzleTypeStats: {}         // Empty - no play history
};

// User State Classification
const dataPoints = {
  recentSuccessRate: 0,       // No recent puzzles
  isNewUser: true,            // totalPuzzlesSolved < 10
  consecutiveFailures: 0,
  skillMomentum: 0,
  engagementLevel: 0.7        // Default optimistic engagement
};

// Classification Result
const stateAnalysis = {
  baseState: 'new_user',
  modifiers: [],              // No modifiers for brand new user
  confidence: 0.95,           // High confidence in new user classification
  reasoning: ["New user with only less than 10 puzzles completed"]
};

// Pool Strategy
const poolStrategy = {
  distribution: {
    confidenceBuilders: 7,    // 70% - Focus on building confidence
    skillDevelopment: 2,      // 20% - Basic skill introduction
    progressiveChallenge: 1,  // 10% - Minimal challenge
    engagementRecovery: 0,    // 0% - Not needed for new users
    exploratoryNew: 0         // 0% - Avoid overwhelming with variety
  },
  description: 'Foundation building with heavy confidence focus',
  expectedOutcome: 'Build basic confidence and establish positive learning patterns'
};

// Candidate Generation (focuses on easy, engaging puzzles)
const candidates = [
  // Easy pattern puzzles (high confidence builders)
  { puzzleType: 'Pattern', difficultyLevel: 0.2, engagementPotential: 0.8 },
  { puzzleType: 'Pattern', difficultyLevel: 0.3, engagementPotential: 0.9 },
  // Simple analogies (skill development)
  { puzzleType: 'Analogy', difficultyLevel: 0.25, engagementPotential: 0.7 },
  // Basic number series (minimal challenge)
  { puzzleType: 'Number Series', difficultyLevel: 0.35, engagementPotential: 0.6 }
];
```

### Example 2: Omi-Like User Detection and Adaptation

```typescript
// Scenario: User who excels at visual patterns but struggles with math
const userProfile = {
  userId: "user_1735728000_omi456",
  totalPuzzlesSolved: 25,
  overallAccuracy: 0.65,
  currentSkillLevel: 0.6,
  puzzleTypeStats: {
    'pattern': {
      puzzleType: 'pattern',
      totalAttempts: 10,
      correctAttempts: 9,        // 90% accuracy - very strong
      accuracy: 0.9,
      averageResponseTime: 3500, // Fast responses
      preferenceScore: 0.85      // High preference
    },
    'number-series': {
      puzzleType: 'number-series',
      totalAttempts: 8,
      correctAttempts: 2,        // 25% accuracy - struggling
      accuracy: 0.25,
      averageResponseTime: 12000, // Slow responses
      preferenceScore: 0.15      // Low preference
    },
    'algebraic-reasoning': {
      puzzleType: 'algebraic-reasoning',
      totalAttempts: 5,
      correctAttempts: 1,        // 20% accuracy - struggling
      accuracy: 0.2,
      averageResponseTime: 15000,
      preferenceScore: 0.1
    }
  }
};

// Omi-Like Detection Algorithm
const isOmiLike = behavioralSignatureStorage.isOmiLikeUser(userProfile);
// Result: true (90% pattern accuracy, struggles with 2/2 math types)

// Adaptive Pool Distribution (Pre-Level 15)
const currentLevel = 8; // Math.floor(userProfile.highScore / 30) + 1
const strengthAdjustments = {
  // Boost confidence builders for pattern-heavy distribution
  confidenceBuilders: 8,      // Increased from base 4 to 8
  skillDevelopment: 1,        // Reduced from base 3 to 1
  progressiveChallenge: 1,    // Reduced to minimal
  engagementRecovery: 0,
  exploratoryNew: 0
};

// Strategic Puzzle Selection
const adaptedCandidates = [
  // 80% patterns (user's strength area)
  { puzzleType: 'Pattern', subtype: 'mirror', difficulty: 0.4 },
  { puzzleType: 'Pattern', subtype: 'row-shift', difficulty: 0.45 },
  { puzzleType: 'Pattern', subtype: 'opposite', difficulty: 0.5 },
  { puzzleType: 'Sequential Figures', difficulty: 0.35 }, // Visual-spatial strength
  { puzzleType: 'Transformation', difficulty: 0.4 },       // Visual processing
  { puzzleType: 'Pattern', subtype: 'column-shift', difficulty: 0.3 },
  { puzzleType: 'Following Directions', difficulty: 0.25 }, // Non-math cognitive
  { puzzleType: 'Paper Folding', difficulty: 0.35 },       // Spatial reasoning
  // 20% gentle math introduction (skill development)
  { puzzleType: 'Number Analogy', difficulty: 0.2 },       // Easiest math type
  { puzzleType: 'Number Series', subtype: 'arithmetic', difficulty: 0.25 }
];
```

### Example 3: Expert User Demanding Challenge

```typescript
// Scenario: Advanced user with high performance but low engagement
const userProfile = {
  userId: "user_1735728000_exp789",
  totalPuzzlesSolved: 150,
  overallAccuracy: 0.92,      // Excellent performance
  currentSkillLevel: 0.85,    // High skill level
  skillMomentum: 0.18,        // Strong positive momentum
  learningVelocity: 0.12,     // Still learning rapidly
  engagementPatterns: {
    avgTimeToFirstSelection: 2500,    // Very fast decisions
    hesitationTendency: 0.1,          // Low hesitation
    powerUpDependency: 0.05,          // Rarely uses power-ups
    flowStateIndicators: {
      avgFlowDuration: 2,             // Short flow states
      optimalChallengeLevel: 0.85     // Needs high challenge
    }
  }
};

// Recent Performance Analysis
const recentPerformance = {
  last5PuzzleSuccess: [true, true, true, true, true], // 100% success rate
  avgRecentSolveTime: 8000,           // Fast solving
  avgRecentConfidence: 0.95,          // High confidence
  recentSkillMomentum: 0.18,          // Strong momentum
  strugglingWithSkills: []            // No struggling areas
};

// Session Context
const sessionContext = {
  sessionId: "session_expert_001",
  puzzlesSolved: 8,
  currentAccuracy: 1.0,               // Perfect session so far
  engagementLevel: 0.45,              // LOW engagement - key indicator
  isInFlowState: false,               // Not in flow - needs more challenge
  estimatedTimeRemaining: 15
};

// User State Classification
const classification = {
  baseState: 'expert_demanding',
  modifiers: ['disengaged'],          // Low engagement triggers modifier
  confidence: 0.95,
  reasoning: [
    "Expert user indicators: 100% success rate, high momentum 0.180, low engagement 0.450 suggests boredom with current difficulty"
  ],
  dataPoints: {
    recentSuccessRate: 1.0,
    skillMomentum: 0.18,
    engagementLevel: 0.45,            // Below 0.6 threshold
    isNewUser: false,
    consecutiveFailures: 0,
    powerUpDependency: 0.05
  }
};

// Expert Pool Strategy
const expertStrategy = {
  distribution: {
    confidenceBuilders: 0,            // 0% - Expert doesn't need confidence
    skillDevelopment: 1,              // 10% - Minimal skill gaps
    progressiveChallenge: 7,          // 70% - Maximum challenge focus
    engagementRecovery: 0,            // 0% - Address through difficulty
    exploratoryNew: 2                 // 20% - Novel puzzle types
  },
  description: 'Maximum challenge focus with variety for expert users who demand difficulty',
  expectedOutcome: 'Maintain engagement through consistent high-difficulty challenges and prevent churn'
};

// High-Difficulty Candidate Generation
const expertCandidates = [
  // Progressive Challenge (70%)
  { puzzleType: 'Serial Reasoning', difficulty: 0.9, complexity: 'high' },
  { puzzleType: 'Algebraic Reasoning', subtype: 'advanced', difficulty: 0.85 },
  { puzzleType: 'Number Grid', subtype: 'magic_square', difficulty: 0.9 },
  { puzzleType: 'Transformation', multiProperty: true, difficulty: 0.88 },
  { puzzleType: 'Sequential Figures', subtype: 'complex_rotation', difficulty: 0.92 },
  { puzzleType: 'Pattern', subtype: 'advanced_grid', difficulty: 0.87 },
  { puzzleType: 'Number Series', subtype: 'mixed_operations', difficulty: 0.85 },
  // Exploratory New (20%)
  { puzzleType: 'Paper Folding', complexity: 'expert', difficulty: 0.8 },
  { puzzleType: 'Following Directions', steps: 5, difficulty: 0.75 },
  // Skill Development (10%)
  { puzzleType: 'Number Analogies', subtype: 'inverse', difficulty: 0.8 }
];

// Selection Criteria for Expert Users
const selectionCriteria = {
  minimumDifficulty: 0.75,            // No puzzles below 0.75 difficulty
  varietyWeight: 0.3,                 // High weight on puzzle variety
  challengeProgression: 0.5,          // Escalating difficulty within session
  engagementPriority: 0.4,            // High engagement requirement
  predictedSuccessRange: [0.6, 0.8]   // 60-80% success rate target
};
```

This comprehensive documentation demonstrates how the Adaptive Engine components work together to create a sophisticated, continuously learning tutoring system that adapts to individual user needs, cognitive abilities, and learning patterns.