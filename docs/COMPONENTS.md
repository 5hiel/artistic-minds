# Component Documentation

This document describes the refactored UI components in the Gifted Minds puzzle game application.

## Overview

The main game screen has been broken down into focused, reusable components:

- **Layout Components**: `GameTopBar`, `ScoreDisplay`
- **Game Components**: `PuzzleOptions`, `PuzzleExplanation`
- **Feedback Components**: `FlashOverlay`
- **Shared Components**: Existing themed components

## Layout Components

### GameTopBar

**File**: `app/(tabs)/components/GameTopBar.tsx`

Displays the top status bar with power surge, level, and countdown timer.

```typescript
interface GameTopBarProps {
  powerSurge: number;
  levelIndex: number;
  seconds: number;
}

// Usage
<GameTopBar
  powerSurge={gameLogic.powerSurgeState.powerSurge}
  levelIndex={gameLogic.levelIndex}
  seconds={gameLogic.powerSurgeState.seconds}
/>
```

**Features**:
- Three-column layout (Power Surge | Level | Timer)
- Responsive design with flex layout
- Integrates with existing `PowerSurge` and `Level` components

### ScoreDisplay

**File**: `app/(tabs)/components/ScoreDisplay.tsx`

Shows current score and high score in styled containers.

```typescript
interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

// Usage
<ScoreDisplay 
  score={gameState.score} 
  highScore={gameState.highScore} 
/>
```

**Features**:
- Side-by-side score containers
- Rounded pill styling with theme colors
- Responsive spacing and typography

## Game Components

### PuzzleOptions

**File**: `app/(tabs)/components/PuzzleOptions.tsx`

Container for all answer option buttons with grid layout.

```typescript
interface PuzzleOptionsProps {
  options: string[];
  selectedOption: number | null;
  correctAnswerIndex: number;
  onSelect: (index: number) => void;
}

// Usage
<PuzzleOptions
  options={puzzle.options}
  selectedOption={gameState.selectedOption}
  correctAnswerIndex={puzzle.correctAnswerIndex}
  onSelect={gameLogic.handleOptionSelect}
/>
```

**Features**:
- Wrapping flex layout for options
- Delegates to existing `OptionButton` components
- Clean separation between container and individual buttons

### PuzzleExplanation

**File**: `app/(tabs)/components/PuzzleExplanation.tsx`

Conditionally displays educational explanations for incorrect answers.

```typescript
interface PuzzleExplanationProps {
  puzzle: AnyPuzzle;
  showExplanation: boolean;
}

// Usage
<PuzzleExplanation
  puzzle={gameState.currentPuzzle}
  showExplanation={gameState.showExplanation}
/>
```

**Features**:
- Conditional rendering based on explanation availability
- Type-safe puzzle checking
- Consistent styling with theme system

## Feedback Components

### FlashOverlay

**File**: `app/(tabs)/components/FlashOverlay.tsx`

Provides visual feedback overlay for correct answers.

```typescript
interface FlashOverlayProps {
  show: boolean;
}

// Usage
<FlashOverlay show={gameState.showFlash} />
```

**Features**:
- Full-screen overlay with green tint
- Absolute positioning with high z-index
- Configurable opacity from theme system
- Automatic hide/show based on game state

### FeedbackMessage (REMOVED)

**Note**: The FeedbackMessage component has been removed from the codebase.
The game now uses visual feedback (flash animations, score updates) instead of text-based "Correct/Incorrect" messages for a cleaner, more immersive experience.

## Shared Components

### Existing Components

These components remain unchanged but are now imported and used by the refactored components:

- **`PowerSurge`**: Shows current score multiplier
- **`Level`**: Displays current achievement level
- **`OptionButton`**: Individual answer option button
- **`PuzzleGrid`**: Visual puzzle grid display

### Usage Patterns

```typescript
// Main game screen composition
function PuzzleGameApp() {
  const { state, actions } = useGameState();
  const gameLogic = useGameLogic(state, actions);

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          {/* Top status bar */}
          <GameTopBar {...gameLogic.powerSurgeState} levelIndex={gameLogic.levelIndex} />
          
          {/* Visual feedback */}
          <FlashOverlay show={state.showFlash} />
          
          <View style={styles.puzzleContainer}>
            {/* Score tracking */}
            <ScoreDisplay score={state.score} highScore={state.highScore} />
            
            {/* Puzzle content */}
            <Text>{state.currentPuzzle.question}</Text>
            {'grid' in state.currentPuzzle && <PuzzleGrid grid={state.currentPuzzle.grid} />}
            
            {/* Answer options */}
            <PuzzleOptions
              options={state.currentPuzzle.options}
              selectedOption={state.selectedOption}
              correctAnswerIndex={state.currentPuzzle.correctAnswerIndex}
              onSelect={gameLogic.handleOptionSelect}
            />
            
            {/* Feedback and explanations */}
            {state.feedback && (
              <FeedbackMessage
                feedback={state.feedback}
                isCorrect={state.selectedOption === state.currentPuzzle.correctAnswerIndex}
              />
            )}
            <PuzzleExplanation puzzle={state.currentPuzzle} showExplanation={state.showExplanation} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Styling Approach

### Theme Integration

All components use the centralized theme system from `constants/gameConfig.ts`:

```typescript
import { THEME } from '../../../constants/gameConfig';

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background.secondary,
    borderRadius: THEME.borderRadius.lg,
  },
  text: {
    fontSize: THEME.fontSize.lg,
    color: THEME.colors.text.primary,
  },
});
```

### Component-Specific Styles

Each component maintains its own focused `StyleSheet`:

```typescript
// ✅ Good: Component-specific styles
const styles = StyleSheet.create({
  topBar: { /* styles specific to GameTopBar */ },
  topBarCol: { /* column styles */ },
  timerText: { /* timer-specific styles */ },
});

// ❌ Avoid: Massive shared stylesheet
const styles = StyleSheet.create({
  // Hundreds of styles for all components mixed together
});
```

## Testing Components

### Component Testing

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PuzzleOptions from '@/app/(tabs)/components/PuzzleOptions';

test('PuzzleOptions renders all options', () => {
  const mockOnSelect = jest.fn();
  const options = ['A', 'B', 'C', 'D'];
  
  const { getByText } = render(
    <PuzzleOptions
      options={options}
      selectedOption={null}
      correctAnswerIndex={0}
      onSelect={mockOnSelect}
    />
  );
  
  options.forEach(option => {
    expect(getByText(option)).toBeTruthy();
  });
});

test('PuzzleOptions calls onSelect when option is pressed', () => {
  const mockOnSelect = jest.fn();
  
  const { getByText } = render(
    <PuzzleOptions
      options={['A', 'B']}
      selectedOption={null}
      correctAnswerIndex={0}
      onSelect={mockOnSelect}
    />
  );
  
  fireEvent.press(getByText('A'));
  expect(mockOnSelect).toHaveBeenCalledWith(0);
});
```

## Migration Benefits

### Before Refactoring

```typescript
// 465 lines of mixed concerns
function App() {
  // State management (50 lines)
  const [score, setScore] = useState(0);
  const [powerSurge, setPowerSurge] = useState(1);
  // ... many more state variables
  
  // Business logic (100+ lines)
  const handleOptionSelect = (index) => {
    // Complex game logic mixed with UI updates
  };
  
  // Timer logic (50 lines)
  useEffect(() => {
    // Power surge calculations
  }, []);
  
  // Massive JSX (200+ lines)
  return (
    <SafeAreaView>
      {/* Inline components mixed with complex logic */}
    </SafeAreaView>
  );
}
```

### After Refactoring

```typescript
// ~100 lines of focused UI composition
function PuzzleGameApp() {
  const { state, actions } = useGameState();
  const gameLogic = useGameLogic(state, actions);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <GameTopBar {...gameLogic.powerSurgeState} levelIndex={gameLogic.levelIndex} />
        <FlashOverlay show={state.showFlash} />
        <PuzzleContainer>
          <ScoreDisplay score={state.score} highScore={state.highScore} />
          <PuzzleContent puzzle={state.currentPuzzle} />
          <PuzzleOptions {...puzzleOptionProps} />
          <FeedbackSection {...feedbackProps} />
        </PuzzleContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Key Benefits

1. **Separation of Concerns**: UI, state, and business logic are cleanly separated
2. **Reusability**: Components can be easily reused or replaced
3. **Testability**: Each component can be tested in isolation
4. **Maintainability**: Changes to one area don't affect others
5. **Readability**: Main component focuses only on composition
6. **Type Safety**: Each component has well-defined interfaces