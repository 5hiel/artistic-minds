# Puzzle System Architecture

## Overview

The puzzle system is the core of Gifted Minds, featuring 12 distinct puzzle types with sophisticated generation algorithms, adaptive difficulty, and infinite variety.

## Puzzle Types

### 1. **Pattern Puzzles** 📐
- **Type**: Visual pattern recognition
- **Format**: 3x3 grids with missing elements
- **Patterns**: Row-shift, mirror, opposite, column-shift
- **Difficulty**: Easy (suitable for ages 4-8)
- **Generator**: `lib/puzzles/reasoning/pattern.ts`

### 2. **Serial Reasoning** 🧩
- **Type**: Matrix logic puzzles
- **Format**: Sequential pattern matrices
- **Patterns**: Numeric, symbolic, shape transformations
- **Difficulty**: Medium to Hard
- **Generator**: `lib/puzzles/reasoning/serialReasoning.ts`

### 3. **Number Series** 🔢
- **Type**: Mathematical sequence completion
- **Patterns**: Arithmetic, geometric, mixed, powers, primes
- **Examples**: [2,4,6,8,?], [2,4,8,16,?], [1,4,9,16,?]
- **Difficulty**: Easy (arithmetic) to Hard (primes)
- **Generator**: `lib/puzzles/numerical/numberSeries.ts`

### 4. **Algebraic Reasoning** ➕
- **Type**: Mathematical problem solving
- **Format**: Equation completion and balance
- **Concepts**: Basic arithmetic, algebra, relationships
- **Difficulty**: Medium to Hard
- **Generator**: `lib/puzzles/numerical/algebraicReasoning.ts`

### 5. **Sequential Figures** 📊
- **Type**: Visual sequence progression
- **Format**: Shape and pattern sequences
- **Patterns**: Rotation, scaling, transformation
- **Difficulty**: Medium
- **Generator**: `lib/puzzles/visual/sequentialFigures.ts`

### 6. **Number Grid** 📊
- **Type**: Numerical pattern matrices
- **Format**: Grid-based number relationships
- **Patterns**: Row/column arithmetic, geometric progressions
- **Difficulty**: Medium to Hard
- **Generator**: `lib/puzzles/numerical/numberGrid.ts`

### 7. **Number Analogies** 🔗
- **Type**: Mathematical relationship patterns
- **Format**: A:B as C:? numerical relationships
- **Patterns**: Arithmetic operations, proportions, sequences
- **Difficulty**: Medium to Hard
- **Generator**: `lib/puzzles/numerical/numberAnalogies.ts`

### 8. **Transformation** 🔄
- **Type**: Shape transformation rules
- **Format**: Visual rule application
- **Patterns**: Rotation, reflection, scaling, color changes
- **Difficulty**: Hard
- **Generator**: `lib/puzzles/reasoning/transformation.ts`

### 9. **Analogy** 💭
- **Type**: Logical relationship patterns
- **Format**: A:B as C:? word/concept relationships
- **Relationships**: Opposite, category, function, part-whole, cause-effect
- **Difficulty**: Easy to Hard
- **Generator**: `lib/puzzles/reasoning/analogy.ts`

### 10. **Figure Classification** 🔍
- **Type**: Cognitive assessment style classification
- **Format**: Visual pattern classification and grouping
- **Patterns**: Shape properties, visual similarities, categorical grouping
- **Difficulty**: Medium to Hard
- **Generator**: `lib/puzzles/cognitive/figureClassification.ts`

### 11. **Paper Folding** 📄
- **Type**: Spatial visualization and geometric transformations
- **Format**: Mental paper folding and hole punching sequences
- **Concepts**: 3D spatial reasoning, transformation visualization
- **Difficulty**: Hard
- **Generator**: `lib/puzzles/cognitive/paperFolding.ts`

### 12. **Following Directions** 🎯
- **Type**: Sequential instruction processing and working memory
- **Format**: Multi-step direction sequences
- **Concepts**: Working memory, sequential processing, attention
- **Difficulty**: Medium to Hard
- **Generator**: `lib/puzzles/cognitive/followingDirections.ts`

### 13. **Picture Series** 🖼️
- **Type**: OLSAT-style figural series progression
- **Format**: "What comes next" visual reasoning
- **Patterns**: Sequential visual progression, pattern continuation
- **Difficulty**: Medium
- **Generator**: `lib/puzzles/visual/pictureSeries.ts`

**Note**: Transformation puzzles are currently disabled due to rendering issues but remain in the codebase for future implementation.

## Generation Architecture

### Base System
```typescript
// All puzzles inherit from BasePuzzle interface
interface BasePuzzle {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  puzzleType?: string;
  puzzleSubtype?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  semanticId?: string;
}

// All generators extend BasePuzzleGenerator
abstract class BasePuzzleGenerator<T extends BasePuzzle> {
  abstract getRandom(): T;
  getAdaptive?(targetDifficulty: number): T;
  getNext(): T; // Sequential access with rotation
}
```

### Infinite Puzzle Generator
Central orchestrator that:
- **Manages puzzle weights** and type distribution
- **Provides unified API** for puzzle generation
- **Handles type-specific generation** with fallbacks
- **Ensures variety control** to prevent repetition

```typescript
// Core generation methods
infinitePuzzleGenerator.generatePuzzle()                    // Random type
infinitePuzzleGenerator.generateSpecificTypePuzzle(type)     // Specific type
infinitePuzzleGenerator.getAdaptivePuzzle(difficulty)       // Adaptive difficulty
```

## Candidate Generation Strategy

### Two-Phase Approach

#### Phase 1: Correct Answer Generation
Each puzzle type generates the correct answer based on its logical pattern:
- **Pattern**: Complete the visual sequence
- **Number Series**: Follow mathematical progression
- **Analogy**: Maintain relationship consistency

#### Phase 2: Smart Distractor Generation
Type-specific strategies for incorrect options:

**Pattern Puzzles**:
- Random shapes from the same visual pool
- Ensures plausible but incorrect alternatives

**Number Series**:
- **Arithmetic/Geometric**: Off-by-one errors (±1, ±2)
- **Mixed patterns**: Common calculation mistakes (×2, ÷2)
- **Powers**: Nearby squares/cubes
- **Primes**: Nearby non-prime numbers

**Analogy Puzzles**:
- Pre-defined templates with semantically related distractors
- Example: "Fish:Water as Bird:?" → [Air (correct), Tree, Nest, Wing]

### Quality Assurance
- **Uniqueness enforcement**: No duplicate options
- **Cognitive plausibility**: Distractors catch common errors
- **Randomization**: Shuffled positions prevent bias
- **Fallback generation**: Ensures robust operation

## Adaptive Integration

### Puzzle DNA System
Each puzzle gets analyzed for:
- **Visual Complexity**: Grid density, element variety
- **Logical Complexity**: Pattern sophistication, rule count
- **Cognitive Load**: Working memory requirements
- **Skill Targets**: Which cognitive abilities are tested
- **Engagement Potential**: Historical user preference data

### Adaptive Generation
```typescript
// Adaptive methods available on generators
getAdaptive(targetDifficulty: number, recentPatterns?: string[]): Puzzle

// Features:
// - Difficulty-based type selection
// - Variety control to prevent staleness
// - User preference consideration
// - Performance prediction integration
```

### Difficulty Calibration
- **Easy**: Ages 4-8, simple patterns, obvious relationships
- **Medium**: Ages 8-14, moderate complexity, multi-step reasoning
- **Hard**: Ages 14+, advanced concepts, abstract thinking

## Performance Optimizations

### Generation Efficiency
- **Lazy loading**: Generators loaded on-demand
- **Caching**: Common patterns pre-computed
- **Batch generation**: Multiple candidates generated efficiently
- **Memory management**: Cleanup of unused puzzle data

### Variety Algorithms
- **Recent pattern tracking**: Prevents immediate repetition
- **Weighted randomization**: Ensures balanced type distribution
- **Adaptive weights**: Adjusts based on user performance
- **Staleness detection**: Identifies and avoids overused patterns

## Testing Strategy

### Unit Testing
- **Generator reliability**: Each type produces valid puzzles
- **Option quality**: Correct answers and plausible distractors
- **Adaptive behavior**: Difficulty scaling works correctly
- **Edge cases**: Handles unusual inputs gracefully

### Integration Testing
- **Infinite generator**: Orchestration works across all types
- **Adaptive engine**: Proper integration with AI selection
- **Performance**: Generation speed meets requirements
- **Memory usage**: No leaks during long sessions

### Persona Testing
- **Age-appropriate content**: Puzzles match cognitive development
- **Engagement validation**: User testing with different personas
- **Learning progression**: Difficulty increases appropriately
- **Accessibility**: Content works for diverse learners

## Extension Points

### Adding New Puzzle Types
1. Implement `BasePuzzleGenerator<YourPuzzleType>`
2. Add to `infinitePuzzleGenerator` registry
3. Configure weights and adaptive parameters
4. Add comprehensive tests
5. Update documentation

### Customizing Difficulty
- Override `determineDifficulty()` methods
- Implement adaptive scaling algorithms
- Add new complexity metrics
- Integrate with user profiling

### Enhancing Variety
- Implement pattern tracking algorithms
- Add user preference learning
- Create dynamic weight adjustment
- Develop staleness detection metrics

## Related Documentation

- [Adaptive Engine Details](adaptive-engine.md)
- [Component Integration](components.md)
- [Testing Guide](../03-development/testing.md)
- [Performance Optimization](../05-guides/troubleshooting.md)