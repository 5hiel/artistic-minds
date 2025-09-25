# Hooks API Reference

## Overview

Gifted Minds uses custom React hooks to manage game state, adaptive logic, and UI interactions. All hooks follow React best practices and provide TypeScript interfaces.

## Core Game Hooks

### useGameState
**File**: `hooks/useGameState.ts`
**Purpose**: Primary game state management

```typescript
interface GameState {
  score: number;
  highScore: number;
  level: number;
  streak: number;
  totalPuzzlesSolved: number;
  isInPowerSurge: boolean;
}

interface GameActions {
  updateScore: (points: number) => void;
  completePuzzle: (success: boolean, solveTime: number) => void;
  resetGame: () => void;
  levelUp: () => void;
}

const { gameState, gameActions } = useGameState();
```

### useGameLogic
**File**: `hooks/useGameLogic.ts`
**Purpose**: Orchestrates game flow and mechanics

```typescript
interface GameLogicReturn {
  gameState: GameState;
  gameActions: GameActions;
  powerSurgeState: PowerSurgeState;
  levelIndex: number;
  effectiveThemeLevel: number;
  isGameReady: boolean;
}

const gameLogic = useGameLogic();
```

### usePowerSurge
**File**: `hooks/usePowerSurge.ts`
**Purpose**: Manages power surge mechanics

```typescript
interface PowerSurgeState {
  powerSurge: number;
  seconds: number;
  isActive: boolean;
  currentPowerLevel: number;
}

interface PowerSurgeActions {
  activatePowerSurge: () => void;
  consumePower: () => void;
  resetPowerSurge: () => void;
}

const { powerSurgeState, powerSurgeActions } = usePowerSurge();
```

## Adaptive Engine Hooks

### useAdaptiveGameLogic
**File**: `hooks/useAdaptiveGameLogic.ts`
**Purpose**: Integrates adaptive AI with game logic

```typescript
interface AdaptiveGameLogicReturn {
  currentPuzzle: BasePuzzle | null;
  isLoading: boolean;
  recordCompletion: (success: boolean, solveTime: number, confidence: number) => Promise<void>;
  getNextPuzzle: () => Promise<void>;
  adaptiveContext: AdaptiveContext;
}

const adaptive = useAdaptiveGameLogic();
```

## UI Interaction Hooks

### useRatingPrompt
**File**: `hooks/useRatingPrompt.ts`
**Purpose**: Manages app store rating prompts

```typescript
interface RatingPromptReturn {
  shouldShowPrompt: boolean;
  showRatingPrompt: () => void;
  dismissPrompt: () => void;
  recordPositiveAction: () => void;
}
```

## Hook Usage Patterns

### State Management Pattern
```typescript
// Primary pattern: useGameLogic orchestrates everything
const MyComponent = () => {
  const {
    gameState,
    gameActions,
    powerSurgeState,
    effectiveThemeLevel
  } = useGameLogic();

  return (
    <View style={styles(effectiveThemeLevel)}>
      <ScoreDisplay score={gameState.score} />
      <PowerSurgeIndicator {...powerSurgeState} />
    </View>
  );
};
```

### Adaptive Integration Pattern
```typescript
// Adaptive puzzle management
const PuzzleScreen = () => {
  const gameLogic = useGameLogic();
  const { currentPuzzle, recordCompletion, isLoading } = useAdaptiveGameLogic();

  const handleAnswer = async (selectedIndex: number) => {
    const correct = selectedIndex === currentPuzzle.correctAnswerIndex;
    const solveTime = Date.now() - puzzleStartTime;

    // Update game state
    gameLogic.gameActions.completePuzzle(correct, solveTime);

    // Record for adaptive learning
    await recordCompletion(correct, solveTime, userConfidence);
  };

  if (isLoading) return <LoadingSpinner />;
  return <PuzzleDisplay puzzle={currentPuzzle} onAnswer={handleAnswer} />;
};
```

## Testing Hooks

### Hook Testing Pattern
```typescript
import { renderHook, act } from '@testing-library/react-hooks';

describe('useGameState', () => {
  it('updates score correctly', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.gameActions.updateScore(100);
    });

    expect(result.current.gameState.score).toBe(100);
  });
});
```

### Provider Testing
```typescript
// Test with providers
const wrapper = ({ children }) => (
  <GameProvider>
    <AdaptiveProvider>
      {children}
    </AdaptiveProvider>
  </GameProvider>
);

const { result } = renderHook(() => useAdaptiveGameLogic(), { wrapper });
```

## Performance Considerations

### Optimization Strategies
- **Memoization**: Use `useMemo` and `useCallback` for expensive computations
- **State batching**: Batch related state updates
- **Selective subscriptions**: Only subscribe to needed state slices
- **Lazy initialization**: Initialize expensive state lazily

### Example Optimizations
```typescript
const useOptimizedGameLogic = () => {
  // Memoize expensive calculations
  const levelTheme = useMemo(() =>
    calculateLevelTheme(gameState.level, powerSurgeState.isActive),
    [gameState.level, powerSurgeState.isActive]
  );

  // Batch state updates
  const completePuzzle = useCallback((success: boolean, solveTime: number) => {
    setBatch(prev => ({
      ...prev,
      score: prev.score + calculateScore(success, solveTime),
      streak: success ? prev.streak + 1 : 0,
      totalPuzzlesSolved: prev.totalPuzzlesSolved + 1
    }));
  }, []);

  return { levelTheme, completePuzzle };
};
```

## Related Documentation

- [Component Architecture](../02-architecture/components.md)
- [Testing Guide](testing.md)
- [Design System](design-system.md)