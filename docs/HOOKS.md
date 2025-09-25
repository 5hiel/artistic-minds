# Custom Hooks Documentation

This document describes the custom React hooks used in the Gifted Minds puzzle game application.

## Overview

The game logic has been refactored into modular, reusable hooks that separate concerns and improve maintainability:

- **`useGameState`**: Manages all game state (scores, puzzles, feedback)
- **`usePowerSurge`**: Handles timer mechanics and power surge calculations
- **`useGameLogic`**: Combines state and power surge logic with game mechanics

## useGameState

**File**: `hooks/useGameState.ts`

Manages the core game state including current puzzle, scores, feedback, and UI state.

### Interface

```typescript
interface GameState {
  score: number;
  highScore: number;
  currentPuzzle: AnyPuzzle;
  selectedOption: number | null;
  feedback: string;
  showFlash: boolean;
  showExplanation: boolean;
}

interface GameActions {
  setScore: (score: number) => void;
  setHighScore: (highScore: number) => void;
  setCurrentPuzzle: (puzzle: AnyPuzzle) => void;
  setSelectedOption: (option: number | null) => void;
  setFeedback: (feedback: string) => void;
  setShowFlash: (show: boolean) => void;
  setShowExplanation: (show: boolean) => void;
  resetGame: () => void;
  nextPuzzle: () => void;
}
```

### Usage

```typescript
import { useGameState } from '@/hooks/useGameState';

function GameComponent() {
  const { state, actions } = useGameState();
  
  // Access state
  console.log(state.score, state.currentPuzzle);
  
  // Update state
  actions.setScore(100);
  actions.nextPuzzle();
  
  return <div>Game UI</div>;
}
```

### Key Methods

- **`resetGame()`**: Resets score, generates new puzzle, clears all feedback
- **`nextPuzzle()`**: Generates new puzzle, clears selection and feedback
- **State setters**: Individual setters for each piece of state

---

## usePowerSurge

**File**: `hooks/usePowerSurge.ts`

Manages the redesigned power surge system with arithmetic progression scoring and visual effects.

### Interface

```typescript
interface PowerSurgeState {
  seconds: number;
  correctAnswersInWindow: number;
  currentPowerLevel: number;
  isInPowerSurge: boolean;
}

interface PowerSurgeActions {
  resetWindow: () => void;
  recordCorrectAnswer: () => number; // Returns points earned
  recordWrongAnswer: () => void;
}
```

### Usage

```typescript
import { usePowerSurge } from '@/hooks/usePowerSurge';

function PowerSurgeComponent() {
  const { state, actions, addTime } = usePowerSurge(60);
  
  // Access timer and power surge state
  console.log(state.seconds, state.currentPowerLevel, state.isInPowerSurge);
  
  // Record correct answer and get points
  const handleCorrectAnswer = () => {
    const pointsEarned = actions.recordCorrectAnswer();
    console.log(`Earned ${pointsEarned} points!`);
  };
  
  // Reset on wrong answer
  const handleWrongAnswer = () => {
    actions.recordWrongAnswer();
  };
  
  return (
    <div>
      Timer: {state.seconds} | Answers: {state.correctAnswersInWindow} | 
      {state.isInPowerSurge ? `🔥 +${state.currentPowerLevel}` : `⚡ ${state.correctAnswersInWindow}`}
    </div>
  );
}
```

### Power Surge Mechanics (Redesigned)

- **60-second evaluation windows** with visual countdown
- **Arithmetic progression**: First 5 answers = +1 each, then +2, +3, +4, +5, etc.
- **Power surge activation**: Begins after 5th correct answer in window
- **Reset conditions**: Wrong answer resets progression, timer end resets window
- **Visual effects**: Background animations during power surge mode
- **UI feedback**: Dynamic icon and display changes (⚡→🔥)

### Key Methods

- **`recordCorrectAnswer()`**: Records correct answer, returns points earned for that answer
- **`recordWrongAnswer()`**: Resets progression counter within current window
- **`resetWindow()`**: Resets window for new evaluation period
- **`addTime(seconds)`**: Adds time to current countdown (for power-ups)

---

## useGameLogic

**File**: `hooks/useGameLogic.ts`

Combines game state and power surge logic to provide complete game mechanics.

### Interface

```typescript
interface GameLogicHook {
  powerSurgeState: PowerSurgeState;
  handleOptionSelect: (index: number) => void;
  levelIndex: number;
}
```

### Usage

```typescript
import { useGameState } from '@/hooks/useGameState';
import { useGameLogic } from '@/hooks/useGameLogic';

function CompleteGameComponent() {
  const { state, actions } = useGameState();
  const { 
    powerSurgeState, 
    handleOptionSelect, 
    levelIndex 
  } = useGameLogic(state, actions);
  
  return (
    <div>
      <div>Level: {levelIndex}</div>
      <div>Power Surge: {powerSurgeState.powerSurge}</div>
      <div>Timer: {powerSurgeState.seconds}</div>
      <button onClick={() => handleOptionSelect(0)}>
        Option A
      </button>
    </div>
  );
}
```

### Key Features

- **Complete Game Logic**: Handles correct/incorrect answers, scoring, feedback
- **Level Calculation**: Determines current level based on high score
- **Power Surge Integration**: Automatically handles timer cycles and multiplier updates
- **Auto-advance**: Moves to next puzzle after correct answers

### Level Thresholds

| Level Index | Name | Threshold | Background |
|-------------|------|-----------|------------|
| 0 | Seeker | 0-9 | Dark |
| 1 | Learner | 10-99 | Sky Blue |
| 2 | Thinker | 100-999 | Yellow |
| 3 | Creator | 1000-9999 | Pink |
| 4 | Visionary | 10000+ | Green |

---

## Best Practices

### Hook Composition

```typescript
// ✅ Good: Compose hooks for complete functionality
function GameScreen() {
  const { state, actions } = useGameState();
  const gameLogic = useGameLogic(state, actions);
  
  return <GameUI {...gameLogic} />;
}

// ❌ Avoid: Using hooks in isolation without composition
function BadGameScreen() {
  const { state } = useGameState(); // Missing actions
  const { state: powerSurgeState } = usePowerSurge(); // Missing integration
  
  // Manual logic that should be in useGameLogic
  const handleSelect = (index) => { /* ... */ };
}
```

### State Updates

```typescript
// ✅ Good: Use provided actions
actions.setScore(newScore);
actions.nextPuzzle();

// ❌ Avoid: Direct state mutations
state.score = newScore; // Won't trigger re-renders
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameState } from '@/hooks/useGameState';

test('useGameState manages score correctly', () => {
  const { result } = renderHook(() => useGameState());
  
  act(() => {
    result.current.actions.setScore(100);
  });
  
  expect(result.current.state.score).toBe(100);
});
```

---

## Migration Guide

If you're updating existing components to use these hooks:

### Before (Monolithic Component)

```typescript
function GameComponent() {
  const [score, setScore] = useState(0);
  const [powerSurge, setPowerSurge] = useState(1);
  const [seconds, setSeconds] = useState(30);
  // ... hundreds of lines of logic
}
```

### After (Hook-based)

```typescript
function GameComponent() {
  const { state, actions } = useGameState();
  const gameLogic = useGameLogic(state, actions);
  
  // Clean, focused UI logic
  return <GameUI {...gameLogic} />;
}
```

This separation makes components easier to test, maintain, and reason about.