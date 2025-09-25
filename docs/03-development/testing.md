# Testing Guide

## Testing Overview

Gifted Minds maintains **200+ tests with 70%+ coverage** using Jest and React Testing Library. The testing strategy includes unit tests, integration tests, persona validation, and end-to-end testing.

## Test Categories

### 1. **Unit Tests**
Test individual functions and components in isolation.

**Location**: `__tests__/`
**Coverage**: Individual functions, utilities, and pure components

```typescript
// Example: Puzzle generator unit test
describe('PatternPuzzleGenerator', () => {
  it('generates valid pattern puzzle', () => {
    const generator = new PatternPuzzleGenerator();
    const puzzle = generator.getRandom();

    expect(puzzle.question).toBeDefined();
    expect(puzzle.options).toHaveLength(4);
    expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
    expect(puzzle.correctAnswerIndex).toBeLessThan(4);
  });
});
```

### 2. **Integration Tests**
Test component interactions with hooks and state management.

```typescript
// Example: Hook integration test
describe('useGameLogic integration', () => {
  it('updates score when puzzle completed correctly', () => {
    const { result } = renderHook(() => useGameLogic());

    act(() => {
      result.current.gameActions.completePuzzle(true, 5000);
    });

    expect(result.current.gameState.score).toBeGreaterThan(0);
  });
});
```

### 3. **Persona Tests**
Validate adaptive engine behavior across different user types.

**Location**: `__tests__/personas/`
**Purpose**: Ensure adaptive algorithms work correctly for different age groups and skill levels

```bash
# Run persona tests
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
```

**Available Personas**:
- `ira` (8y): Child learner with developing cognitive abilities
- `omi` (5y): Young learner requiring simpler content
- `mumu` (25y): Adult learner with full cognitive capacity
- `ma` (60y): Senior learner with experience and patience

### 4. **End-to-End Tests**
Test complete user workflows from start to finish.

```typescript
// Example: Complete game flow test
describe('Game Flow E2E', () => {
  it('completes full puzzle solving cycle', async () => {
    render(<GameScreen />);

    // Wait for puzzle to load
    await waitFor(() => {
      expect(screen.getByText(/What completes/)).toBeInTheDocument();
    });

    // Select correct answer
    const correctOption = screen.getByTestId('option-correct');
    fireEvent.press(correctOption);

    // Verify score update
    expect(screen.getByText(/Score:/)).toHaveTextContent(/\d+/);

    // Verify next puzzle loads
    await waitFor(() => {
      expect(screen.getByText(/What completes/)).toBeInTheDocument();
    });
  });
});
```

## Test Commands

### Basic Testing
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
npm run test:ci             # CI-optimized test run
```

### Persona Testing
```bash
# Quick single persona test
PRESET=quick PERSONA=ira npm run test:personas

# Full persona simulation
PERSONA=omi TOTAL_CHUNKS=5 PUZZLES_PER_CHUNK=10 npm run test:personas

# Cross-persona comparison
npm run test:personas:all
```

### Specialized Testing
```bash
npm run test:lib            # Test core library functions
npm run test:hooks          # Test custom React hooks
npm run test:components     # Test UI components
npm run test:adaptive       # Test adaptive engine
```

## Testing Patterns

### Component Testing
```typescript
// Standard component test structure
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GameProviders } from '../utils/testProviders';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  const renderWithProviders = (props = {}) => {
    return render(
      <GameProviders>
        <MyComponent {...props} />
      </GameProviders>
    );
  };

  it('renders correctly', () => {
    renderWithProviders();
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const onPress = jest.fn();
    renderWithProviders({ onPress });

    fireEvent.press(screen.getByText('Button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Hook Testing
```typescript
// Custom hook testing pattern
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameState } from '../hooks/useGameState';

describe('useGameState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.level).toBe(0);
  });

  it('updates state on actions', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.gameActions.updateScore(100);
    });

    expect(result.current.gameState.score).toBe(100);
  });
});
```

### Async Testing
```typescript
// Testing async operations
describe('Adaptive Engine', () => {
  it('generates puzzle recommendations', async () => {
    const engine = new IntelligentPuzzleEngine();

    const recommendation = await engine.generateAdaptivePuzzle();

    expect(recommendation.puzzle).toBeDefined();
    expect(recommendation.predictedSuccess).toBeGreaterThan(0);
    expect(recommendation.predictedEngagement).toBeGreaterThan(0);
  });
});
```

## Mocking Strategies

### Component Mocks
```typescript
// Mock expensive components
jest.mock('../components/PuzzleDisplay', () => {
  return function MockPuzzleDisplay() {
    return <div data-testid="puzzle-display">Mock Puzzle</div>;
  };
});
```

### Hook Mocks
```typescript
// Mock custom hooks
jest.mock('../hooks/useAdaptiveGameLogic', () => ({
  useAdaptiveGameLogic: () => ({
    currentPuzzle: mockPuzzle,
    recordCompletion: jest.fn(),
    isLoading: false
  })
}));
```

### API Mocks
```typescript
// Mock external services
jest.mock('../lib/adaptiveEngine', () => ({
  intelligentPuzzleEngine: {
    generateAdaptivePuzzle: jest.fn().mockResolvedValue(mockRecommendation),
    recordPuzzleCompletion: jest.fn()
  }
}));
```

## Test Data Management

### Mock Data Structure
```typescript
// Centralized test data
export const mockPuzzle: BasePuzzle = {
  question: 'What completes the pattern?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: 0,
  explanation: 'The pattern follows a logical sequence.',
  puzzleType: 'pattern',
  puzzleSubtype: 'row-shift',
  difficultyLevel: 'easy'
};

export const mockUserProfile = {
  userId: 'test-user',
  totalSessions: 10,
  totalPuzzlesSolved: 50,
  overallAccuracy: 0.8,
  currentSkillLevel: 0.6
};
```

### Test Fixtures
```typescript
// Reusable test fixtures
export const createMockGameState = (overrides = {}) => ({
  score: 0,
  level: 0,
  streak: 0,
  isInPowerSurge: false,
  ...overrides
});

export const createMockPuzzleRecommendation = (overrides = {}) => ({
  puzzle: mockPuzzle,
  dna: mockPuzzleDNA,
  predictedSuccess: 0.7,
  predictedEngagement: 0.8,
  strategicValue: 0.6,
  ...overrides
});
```

## Persona Testing Framework

### Persona Configuration
```typescript
interface PersonaConfig {
  name: string;
  age: number;
  skillLevel: number;
  preferredDifficulty: number;
  attentionSpan: number;
  learningVelocity: number;
}

const PERSONAS: Record<string, PersonaConfig> = {
  ira: {
    name: 'Ira',
    age: 8,
    skillLevel: 0.4,
    preferredDifficulty: 0.3,
    attentionSpan: 0.6,
    learningVelocity: 0.7
  },
  omi: {
    name: 'Omi',
    age: 5,
    skillLevel: 0.2,
    preferredDifficulty: 0.1,
    attentionSpan: 0.4,
    learningVelocity: 0.5
  }
  // ... more personas
};
```

### Simulation Testing
```typescript
// Persona simulation test
describe('Persona Simulation', () => {
  it('adapts correctly for child learner', async () => {
    const persona = PERSONAS.ira;
    const engine = new IntelligentPuzzleEngine();

    // Simulate multiple puzzle sessions
    for (let i = 0; i < 10; i++) {
      const recommendation = await engine.generateAdaptivePuzzle();

      // Simulate persona response
      const success = simulatePersonaResponse(persona, recommendation);

      await engine.recordPuzzleCompletion(
        recommendation,
        success,
        simulateSolveTime(persona),
        simulateConfidence(persona),
        simulateEngagement(persona),
        false
      );
    }

    // Verify adaptation occurred
    const finalRecommendation = await engine.generateAdaptivePuzzle();
    expect(finalRecommendation.dna.discoveredDifficulty).toBeLessThan(0.5);
  });
});
```

## Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 70% minimum
- **Core Logic**: 90% minimum
- **Components**: 80% minimum
- **Hooks**: 85% minimum
- **Adaptive Engine**: 95% minimum

### Coverage Commands
```bash
npm run test:coverage              # Generate coverage report
npm run test:coverage:html         # HTML coverage report
npm run test:coverage:lcov         # LCOV format for CI
```

### Coverage Exclusions
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ]
};
```

## Continuous Integration

### CI Test Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm run test:related"
    ]
  }
}
```

## Performance Testing

### Load Testing
```typescript
describe('Performance Tests', () => {
  it('generates puzzles within performance threshold', async () => {
    const startTime = Date.now();

    await Promise.all(
      Array(100).fill(0).map(() =>
        infinitePuzzleGenerator.generatePuzzle()
      )
    );

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // < 1 second for 100 puzzles
  });
});
```

### Memory Testing
```typescript
describe('Memory Tests', () => {
  it('maintains stable memory usage', () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Simulate extensive usage
    for (let i = 0; i < 1000; i++) {
      const puzzle = infinitePuzzleGenerator.generatePuzzle();
      // Force garbage collection opportunity
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB
  });
});
```

## Troubleshooting Tests

### Common Test Issues

**Tests timing out**:
```bash
# Increase timeout for slow tests
npm test -- --testTimeout=10000
```

**Mock issues**:
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

**State leakage**:
```typescript
// Reset modules between tests
beforeEach(() => {
  jest.resetModules();
});
```

**Async issues**:
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Expected')).toBeInTheDocument();
});
```

### Debugging Tests
```bash
# Run specific test file
npm test GameLogic.test.ts

# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose

# Watch mode for development
npm test -- --watch
```

## Related Documentation

- [Development Workflows](workflows.md)
- [Component Architecture](../02-architecture/components.md)
- [Hooks Documentation](hooks-api.md)
- [Troubleshooting Guide](../05-guides/troubleshooting.md)