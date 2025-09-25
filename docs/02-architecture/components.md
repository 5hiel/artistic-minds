# Component Architecture

## Overview

The Gifted Minds UI is built with a modular component architecture focused on reusability, maintainability, and level-based theming. Components are organized into focused layers with clear responsibilities.

## Component Hierarchy

```
App (Expo Router)
├── Layout Components
│   ├── GameTopBar        # Power surge, level, timer
│   ├── ScoreDisplay      # Current/high score display
│   └── Screen Layouts    # Level-themed screen containers
├── Game Components
│   ├── PuzzleDisplay     # Puzzle content rendering
│   ├── PuzzleOptions     # A/B/C/D answer options
│   ├── PuzzleExplanation # Solution explanations
│   └── PowerButtons      # Power-up interactions
├── Feedback Components
│   ├── FlashOverlay      # Success/error feedback
│   ├── ScoreAnimation    # Score change animations
│   └── LevelTransition   # Level-up effects
└── Shared Components
    ├── Themed Buttons    # Level-aware button styles
    ├── Themed Cards      # Level-aware containers
    └── Responsive Text   # Adaptive typography
```

## Layout Components

### GameTopBar
**File**: `app/(tabs)/components/GameTopBar.tsx`

Three-column status bar with power surge, level, and timer display.

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
- Responsive flex layout
- Integrated with existing PowerSurge and Level components
- Auto-updating countdown timer
- Level-based theming

### ScoreDisplay
**File**: `app/(tabs)/components/ScoreDisplay.tsx`

Current and high score display with level-themed styling.

```typescript
interface ScoreDisplayProps {
  score: number;
  highScore: number;
  levelIndex: number;
}

// Features:
// - Animated score changes
// - High score highlighting
// - Responsive card layout
```

## Game Components

### PuzzleDisplay
Renders puzzle content based on puzzle type:

```typescript
interface PuzzleDisplayProps {
  puzzle: BasePuzzle;
  levelIndex: number;
  onInteraction?: (interaction: PuzzleInteraction) => void;
}

// Supports all 9 puzzle types:
// - Pattern grids (3x3 visual patterns)
// - Number series (mathematical sequences)
// - Analogies (A:B as C:? relationships)
// - Matrix puzzles (serial reasoning)
// - And 5 more types...
```

### PuzzleOptions
**File**: `app/(tabs)/components/PuzzleOptions.tsx`

A/B/C/D answer choice interface with state management.

```typescript
interface PuzzleOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
  selectedIndex?: number;
  correctIndex?: number;
  showResults?: boolean;
  levelIndex: number;
}

// Features:
// - Option selection with visual feedback
// - Correct/incorrect result display
// - Level-themed button styling
// - Accessibility compliance (44pt touch targets)
```

### PuzzleExplanation
**File**: `app/(tabs)/components/PuzzleExplanation.tsx`

Solution explanation display with animated reveal.

```typescript
interface PuzzleExplanationProps {
  explanation: string;
  isVisible: boolean;
  levelIndex: number;
}

// Features:
// - Smooth fade-in animation
// - Level-themed card styling
// - Readable typography
// - Dismissible overlay
```

## Theming System

### Level-Based Theming
All components support dynamic theming based on user level:

```typescript
// Level progression
const LEVELS = [
  { name: 'Seeker', color: '#1A202C' },     // Level 0: Dark
  { name: 'Learner', color: '#1E90FF' },    // Level 1: Blue
  { name: 'Thinker', color: '#FFD700' },    // Level 2: Yellow
  { name: 'Creator', color: '#FF69B4' },    // Level 3: Pink
  { name: 'Visionary', color: '#32CD32' }   // Level 4: Green
];

// Power surge circular theming
const effectiveThemeLevel = isInPowerSurge && currentPowerLevel > 1
  ? (levelIndex + 1) % LEVELS.length
  : levelIndex;
```

### Design System Integration
Components use centralized design tokens:

```typescript
import { buttonStyles, cardStyles, layoutStyles, colors, spacing } from '@/design';

// Component styling
const styles = {
  container: layoutStyles.screen(levelIndex),
  button: buttonStyles.primary(levelIndex, 'default'),
  card: cardStyles.status(levelIndex),
  text: { color: colors.text.primary }
};
```

## State Management

### Custom Hooks Integration
Components integrate with game logic through custom hooks:

```typescript
// Primary game state hook
const {
  gameState,
  gameActions,
  powerSurgeState,
  effectiveThemeLevel
} = useGameLogic();

// Adaptive puzzle hook
const {
  currentPuzzle,
  recordCompletion,
  isLoading
} = useAdaptiveGameLogic();

// Power surge mechanics
const {
  powerSurge,
  seconds,
  isActive,
  activatePowerSurge
} = usePowerSurge();
```

### Props Drilling Prevention
Context-based state distribution minimizes prop drilling:

```typescript
// Game state context
const GameStateContext = createContext<GameState>();

// Component access
const { score, level, isInPowerSurge } = useContext(GameStateContext);
```

## Performance Optimizations

### Memoization
Critical components use React.memo and useMemo:

```typescript
// Expensive component memoization
const PuzzleDisplay = React.memo<PuzzleDisplayProps>(({ puzzle, levelIndex }) => {
  const styles = useMemo(() =>
    layoutStyles.puzzle(levelIndex),
    [levelIndex]
  );

  return <View style={styles}>{renderPuzzle(puzzle)}</View>;
});

// Prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) =>
  prevProps.levelIndex === nextProps.levelIndex &&
  prevProps.puzzle.semanticId === nextProps.puzzle.semanticId;

export default React.memo(PuzzleDisplay, areEqual);
```

### Lazy Loading
Non-critical components load on-demand:

```typescript
// Dynamic imports for puzzle-specific components
const PatternGrid = lazy(() => import('./puzzles/PatternGrid'));
const NumberSeries = lazy(() => import('./puzzles/NumberSeries'));

// Fallback during loading
<Suspense fallback={<LoadingSpinner />}>
  <PatternGrid puzzle={puzzle} />
</Suspense>
```

## Accessibility

### Touch Targets
All interactive elements meet accessibility standards:

```typescript
// Minimum touch target sizes
const accessibility = {
  minTouchTarget: 44,           // iOS minimum
  minAndroidTouchTarget: 48,    // Android minimum
  minTouchTargetSpacing: 8      // Minimum gap
};

// Applied in button styles
minHeight: accessibility.minTouchTarget,
minWidth: accessibility.minTouchTarget,
```

### Screen Reader Support
Components include proper accessibility labels:

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel={`Option ${index + 1}: ${option}`}
  accessibilityHint="Select this answer choice"
  accessibilityState={{ selected: isSelected }}
>
  <Text>{option}</Text>
</Pressable>
```

## Testing Strategy

### Component Testing
Each component includes comprehensive tests:

```typescript
// Example: PuzzleOptions.test.tsx
describe('PuzzleOptions', () => {
  it('renders all options correctly', () => {
    const options = ['A', 'B', 'C', 'D'];
    render(<PuzzleOptions options={options} onSelect={jest.fn()} />);

    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('calls onSelect with correct index', () => {
    const onSelect = jest.fn();
    render(<PuzzleOptions options={['A', 'B']} onSelect={onSelect} />);

    fireEvent.press(screen.getByText('B'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('applies correct theme based on level', () => {
    const { rerender } = render(
      <PuzzleOptions options={['A']} levelIndex={0} onSelect={jest.fn()} />
    );

    // Test level 0 theme
    expect(screen.getByTestId('option-0')).toHaveStyle({
      backgroundColor: expect.stringContaining('#1A202C')
    });

    // Test level 1 theme
    rerender(<PuzzleOptions options={['A']} levelIndex={1} onSelect={jest.fn()} />);
    expect(screen.getByTestId('option-0')).toHaveStyle({
      backgroundColor: expect.stringContaining('#1E90FF')
    });
  });
});
```

### Integration Testing
Tests component interaction with hooks and state:

```typescript
// Example: Game flow integration test
describe('Game Flow Integration', () => {
  it('completes full puzzle interaction cycle', async () => {
    const { user } = renderWithProviders(<GameScreen />);

    // Wait for puzzle to load
    await waitFor(() => {
      expect(screen.getByText(/What completes/)).toBeInTheDocument();
    });

    // Select an answer
    await user.press(screen.getByText('A'));

    // Verify score update
    expect(screen.getByText(/Score:/)).toHaveTextContent('Score: 100');

    // Verify next puzzle loads
    await waitFor(() => {
      expect(screen.getByText(/What completes/)).toBeInTheDocument();
    });
  });
});
```

## Development Guidelines

### Component Creation Checklist
When creating new components:

1. **Props Interface**: Define clear TypeScript interface
2. **Level Theming**: Support `levelIndex` prop for theming
3. **Accessibility**: Include proper ARIA labels and roles
4. **Testing**: Write comprehensive unit tests
5. **Documentation**: Update this architecture doc
6. **Performance**: Consider memoization for expensive renders
7. **Error Boundaries**: Handle error states gracefully

### Naming Conventions
- **Components**: PascalCase (e.g., `PuzzleDisplay`)
- **Props**: camelCase interfaces ending in `Props`
- **Files**: Match component name exactly
- **Directories**: Group by feature/responsibility

### Code Organization
```
app/(tabs)/components/
├── layout/           # Layout components (GameTopBar, ScoreDisplay)
├── game/            # Game-specific components (PuzzleOptions, etc.)
├── feedback/        # User feedback components (FlashOverlay, etc.)
├── shared/          # Reusable components
└── __tests__/       # Component tests
```

## Future Enhancements

### Planned Features
- **Animation System**: Smooth transitions between states
- **Gesture Support**: Swipe and drag interactions
- **Voice Control**: Accessibility voice commands
- **Progressive Enhancement**: Feature detection and graceful degradation

### Performance Improvements
- **Virtual Scrolling**: For long lists
- **Image Optimization**: Lazy loading and caching
- **Bundle Splitting**: Component-level code splitting
- **Memory Management**: Cleanup unused resources

## Related Documentation

- [Design System Reference](../03-development/design-system.md)
- [Hooks Documentation](../03-development/hooks-api.md)
- [Testing Guide](../03-development/testing.md)
- [Performance Guide](../05-guides/troubleshooting.md)