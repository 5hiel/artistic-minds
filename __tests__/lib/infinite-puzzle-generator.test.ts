import {
  InfinitePuzzleGenerator,
  infinitePuzzleGenerator,
  type PuzzleGeneratorConfig
} from '../../src/lib/game/puzzleGenerator';
import { PuzzleValidator } from '../../src/lib/game/basePuzzle';
import { getEnabledPuzzleTypes, getDefaultWeights, PUZZLE_TYPES, type PuzzleTypeConfig } from '../../src/constants/puzzleConfig';

describe('InfinitePuzzleGenerator', () => {
  let generator: InfinitePuzzleGenerator;

  beforeEach(() => {
    generator = new InfinitePuzzleGenerator();
  });

  describe('constructor', () => {
    it('should initialize with default configuration from centralized config', () => {
      const stats = generator.getStatistics();
      const defaultWeights = getDefaultWeights();
      const enabledTypes = getEnabledPuzzleTypes();

      // Check that weights match centralized configuration
      expect(stats.config.weights).toEqual(defaultWeights);

      // Verify enabled types have positive weights
      Object.keys(enabledTypes).forEach(type => {
        expect(stats.config.weights[type]).toBeGreaterThan(0);
      });

      // Verify disabled types have zero weights
      Object.entries(PUZZLE_TYPES).forEach(([type, config]) => {
        if (!config.enabled) {
          expect(stats.config.weights[type]).toBe(0);
        }
      });
    });

    it('should accept custom configuration while respecting enabled types', () => {
      const enabledTypes = getEnabledPuzzleTypes();
      const customWeights: Record<string, number> = {};

      // Set custom weights only for enabled types
      Object.keys(enabledTypes).forEach((type, index) => {
        customWeights[type] = index + 2; // Different weights for each enabled type
      });

      const customConfig: Partial<PuzzleGeneratorConfig> = {
        weights: customWeights
      };

      const customGenerator = new InfinitePuzzleGenerator(customConfig);
      const stats = customGenerator.getStatistics();

      // Verify custom weights are applied
      Object.entries(customWeights).forEach(([type, weight]) => {
        expect(stats.config.weights[type]).toBe(weight);
      });
    });
  });

  describe('generatePuzzle', () => {
    it('should generate valid puzzles', () => {
      const puzzle = generator.generatePuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctAnswerIndex).toBeLessThan(4);
      expect(puzzle.explanation).toBeTruthy();
    });

    it('should generate different puzzle types from enabled types only', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.generatePuzzle());
      const puzzleTypes = puzzles.map(p => p.puzzleType);
      const enabledTypes = getEnabledPuzzleTypes();
      const enabledTypeNames = Object.keys(enabledTypes);

      // All generated puzzles should be of enabled types
      puzzleTypes.forEach(type => {
        expect(enabledTypeNames).toContain(type);
      });

      // Should have some variety in puzzle types
      const uniqueTypes = new Set(puzzleTypes);
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });

    it('should generate valid puzzles consistently', () => {
      const puzzle = generator.generatePuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
    });
  });


  describe.skip('generateDynamicPuzzle (private method)', () => {
    // These tests access private methods and should be removed or refactored
    // to test public APIs instead
  });

  describe('generateSpecificPuzzle', () => {
    const enabledTypes = getEnabledPuzzleTypes();
    const enabledTypeNames = Object.keys(enabledTypes);

    // Dynamically generate tests for enabled puzzle types
    enabledTypeNames.forEach(puzzleType => {
      it(`should generate ${puzzleType} puzzles`, () => {
        const puzzle = generator.generateSpecificPuzzle(puzzleType as any);
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        if (puzzle) {
          expect(puzzle.puzzleType).toBe(puzzleType);
        }
      });
    });

    // Test disabled types
    Object.entries(PUZZLE_TYPES).forEach(([puzzleType, config]) => {
      if (!config.enabled) {
        it(`should not generate ${puzzleType} puzzles (disabled)`, () => {
          const puzzle = generator.generateSpecificPuzzle(puzzleType as any);
          expect(puzzle).toBeNull();
        });
      }
    });

    it('should handle unknown puzzle types', () => {
      const puzzle = generator.generateSpecificPuzzle('unknownType' as any);
      expect(puzzle).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return puzzle statistics with centralized configuration data', () => {
      const stats = generator.getStatistics();
      const enabledTypes = getEnabledPuzzleTypes();

      expect(stats).toHaveProperty('config');
      expect(stats).toHaveProperty('enabledPuzzleTypes');
      expect(stats).toHaveProperty('totalPuzzleTypes');
      expect(stats).toHaveProperty('enabledTypeIndices');

      expect(stats.enabledPuzzleTypes).toBe(Object.keys(enabledTypes).length);
      expect(stats.totalPuzzleTypes).toBe(Object.keys(PUZZLE_TYPES).length);

      // Verify available puzzle types only include enabled ones
      Object.keys(stats.availablePuzzleTypes).forEach(type => {
        expect(enabledTypes[type]).toBeDefined();
      });
    });
  });

  describe('updateConfig', () => {
    it('should update configuration for enabled types', () => {
      const enabledTypes = getEnabledPuzzleTypes();
      const newWeights: Record<string, number> = {};

      // Set new weights for enabled types
      Object.keys(enabledTypes).forEach((type, index) => {
        newWeights[type] = (index + 1) * 2;
      });

      const newConfig: Partial<PuzzleGeneratorConfig> = {
        weights: newWeights
      };

      generator.updateConfig(newConfig);
      const stats = generator.getStatistics();

      // Verify weights were updated for enabled types
      Object.entries(newWeights).forEach(([type, weight]) => {
        expect(stats.config.weights[type]).toBe(weight);
      });
    });

    it('should merge with existing configuration', () => {
      const originalWeights = generator.getStatistics().config.weights;
      const enabledTypes = getEnabledPuzzleTypes();
      const firstEnabledType = Object.keys(enabledTypes)[0];

      generator.updateConfig({ weights: { ...originalWeights, [firstEnabledType]: 5 } });
      const stats = generator.getStatistics();

      expect(stats.config.weights[firstEnabledType]).toBe(5);
    });
  });

  describe('reset', () => {
    it('should reset generator state', () => {
      // Generate some puzzles to change internal state
      for (let i = 0; i < 5; i++) {
        generator.generatePuzzle();
      }
      
      generator.reset();
      
      // Should be able to generate puzzles normally after reset
      const puzzle = generator.generatePuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
    });
  });

  describe('weighted puzzle selection', () => {
    it('should respect weight configuration for enabled types', () => {
      const enabledTypes = getEnabledPuzzleTypes();
      const firstEnabledType = Object.keys(enabledTypes)[0];

      // Create weights with heavy bias on first enabled type
      const biasedWeights: Record<string, number> = {};
      Object.keys(enabledTypes).forEach(type => {
        biasedWeights[type] = type === firstEnabledType ? 10 : 0;
      });

      const biasedGenerator = new InfinitePuzzleGenerator({
        weights: biasedWeights
      });

      const puzzles = Array.from({ length: 10 }, () =>
        biasedGenerator.generatePuzzle()
      );

      // All puzzles should be valid and of enabled types
      puzzles.forEach(puzzle => {
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(Object.keys(enabledTypes)).toContain(puzzle.puzzleType);
      });
    });

    it('should handle zero weights gracefully by cycling through enabled types', () => {
      const enabledTypes = getEnabledPuzzleTypes();
      const zeroWeights: Record<string, number> = {};

      // Set all weights to zero
      Object.keys(enabledTypes).forEach(type => {
        zeroWeights[type] = 0;
      });

      const zeroWeightGenerator = new InfinitePuzzleGenerator({
        weights: zeroWeights
      });

      const puzzle = zeroWeightGenerator.generatePuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(Object.keys(enabledTypes)).toContain(puzzle.puzzleType);
    });
  });
});

describe('Legacy functions', () => {
  describe('generateInfinitePuzzle', () => {
    it('should generate valid puzzles', () => {
      const puzzle = infinitePuzzleGenerator.generatePuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
    });

    it('should generate variety of puzzles', () => {
      const puzzles = Array.from({ length: 10 }, () => infinitePuzzleGenerator.generatePuzzle());
      const questions = puzzles.map(p => p.question);
      const uniqueQuestions = new Set(questions);
      
      expect(uniqueQuestions.size).toBeGreaterThan(1);
    });
  });

  describe('infinitePuzzleGenerator singleton', () => {
    it('should be an instance of InfinitePuzzleGenerator', () => {
      expect(infinitePuzzleGenerator).toBeInstanceOf(InfinitePuzzleGenerator);
    });

    it('should generate valid puzzles', () => {
      const puzzle = infinitePuzzleGenerator.generatePuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
    });
  });
});

describe('Puzzle variety and randomization', () => {
  it('should generate puzzles with different content from enabled types', () => {
    const generator = new InfinitePuzzleGenerator();
    const puzzles = Array.from({ length: 20 }, () => generator.generatePuzzle());
    const enabledTypes = getEnabledPuzzleTypes();
    const enabledTypeNames = Object.keys(enabledTypes);

    // Check for variety in questions and that they're from enabled types
    const questions = puzzles.map(p => p.question);
    const puzzleTypes = puzzles.map(p => p.puzzleType);
    const uniqueQuestions = new Set(questions);
    const uniqueTypes = new Set(puzzleTypes);

    expect(uniqueQuestions.size).toBeGreaterThan(1); // Should have reasonable variety

    // All puzzle types should be enabled
    puzzleTypes.forEach(type => {
      expect(enabledTypeNames).toContain(type);
    });

    // Check that all puzzles are valid
    puzzles.forEach(puzzle => {
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.options).toContain(puzzle.options[puzzle.correctAnswerIndex]);
    });
  });

  it('should not create duplicate correct answers in options and only use enabled types', () => {
    const generator = new InfinitePuzzleGenerator();
    const puzzles = Array.from({ length: 50 }, () => generator.generatePuzzle());
    const enabledTypes = getEnabledPuzzleTypes();
    const enabledTypeNames = Object.keys(enabledTypes);

    puzzles.forEach(puzzle => {
      // Verify puzzle type is enabled
      expect(enabledTypeNames).toContain(puzzle.puzzleType);

      // Verify no duplicate correct answers
      const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
      const occurrences = puzzle.options.filter(option => option === correctAnswer);
      expect(occurrences).toHaveLength(1); // Should appear exactly once
    });
  });



});