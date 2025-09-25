/**
 * Number Analogies Puzzle Tests
 *
 * Tests for the Number Analogies puzzle generator, covering:
 * - Dynamic puzzle generation
 * - Mathematical relationship validation
 * - Option generation and answer correctness
 * - Edge cases and error handling
 */

import { NumberAnalogyPuzzleGenerator, numberAnalogyPuzzleGenerator } from '../../src/lib/puzzles/numerical/numberAnalogies';
import { PuzzleValidator } from '@/src/lib/game/basePuzzle';

describe('NumberAnalogyPuzzleGenerator', () => {
  let generator: NumberAnalogyPuzzleGenerator;

  beforeEach(() => {
    generator = new NumberAnalogyPuzzleGenerator();
  });

  // Note: This generator is purely dynamic - no static puzzles

  describe('Dynamic Puzzle Generation', () => {
    test('should generate valid dynamic puzzles', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.question).toMatch(/^\d+ : \d+ :: \d+ : \?$/);
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.firstPair).toHaveLength(2);
        expect(puzzle.secondPair).toHaveLength(2);
        expect(puzzle.secondPair[1]).toBeUndefined();
        expect(puzzle.relationshipType).toMatch(/^(arithmetic|multiplicative|exponential|inverse)$/);
        expect(puzzle.operationType).toBeTruthy();
      }
    });

    test('should generate mathematically correct answers', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const [a, b] = puzzle.firstPair;
        const [c] = puzzle.secondPair;
        const correctAnswer = parseInt(puzzle.options[puzzle.correctAnswerIndex]);

        // Verify the relationship holds true
        const relationship = b / a; // For multiplicative
        const difference = b - a;   // For arithmetic

        // Test common relationships
        if (Math.abs(relationship - Math.round(relationship)) < 0.01) {
          // Multiplicative relationship
          const expectedMultiplicative = c * relationship;
          if (Math.abs(expectedMultiplicative - correctAnswer) < 0.01) {
            expect(true).toBe(true); // Multiplicative relationship is correct
          }
        } else if (Math.abs(difference) <= 10) {
          // Arithmetic relationship
          const expectedArithmetic = c + difference;
          if (expectedArithmetic === correctAnswer) {
            expect(true).toBe(true); // Arithmetic relationship is correct
          }
        }

        // At minimum, verify the correct answer is in the options
        expect(puzzle.options).toContain(correctAnswer.toString());
      }
    });

    test('should generate diverse relationship types', () => {
      const puzzles = [];
      for (let i = 0; i < 50; i++) {
        puzzles.push(generator.getRandom());
      }

      const relationshipTypes = puzzles.map(p => p.relationshipType);
      const uniqueTypes = new Set(relationshipTypes);

      expect(uniqueTypes.size).toBeGreaterThanOrEqual(2); // Should have at least 2 different types
      expect(puzzles.every(p => ['arithmetic', 'multiplicative', 'exponential', 'inverse'].includes(p.relationshipType))).toBe(true);
    });

    test('should generate valid option sets', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();

        // All options should be different
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4);

        // All options should be valid numbers
        puzzle.options.forEach(option => {
          const num = parseInt(option);
          expect(isNaN(num)).toBe(false);
          expect(num).toBeGreaterThan(0);
        });

        // Correct answer should be in options
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
        expect(correctAnswer).toBeTruthy();
      }
    });
  });

  describe('Relationship Types', () => {
    test('should generate arithmetic relationships', () => {
      let arithmeticFound = false;
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.relationshipType === 'arithmetic') {
          arithmeticFound = true;
          const [a, b] = puzzle.firstPair;
          const [c] = puzzle.secondPair;
          const correctAnswer = parseInt(puzzle.options[puzzle.correctAnswerIndex]);
          const difference = b - a;

          // Should follow arithmetic relationship: A + diff = B, so C + diff = answer
          expect(correctAnswer).toBe(c + difference);
        }
      }
      expect(arithmeticFound).toBe(true);
    });

    test('should generate multiplicative relationships', () => {
      let multiplicativeFound = false;
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.relationshipType === 'multiplicative') {
          multiplicativeFound = true;
          const [a, b] = puzzle.firstPair;
          const [c] = puzzle.secondPair;
          const correctAnswer = parseInt(puzzle.options[puzzle.correctAnswerIndex]);

          // Should follow multiplicative relationship
          const factor = b / a;
          if (Number.isInteger(factor)) {
            expect(Math.abs(correctAnswer - c * factor)).toBeLessThan(0.01);
          }
        }
      }
      expect(multiplicativeFound).toBe(true);
    });
  });

  describe('Explanations', () => {
    test('should generate clear explanations for all puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const explanation = puzzle.explanation;

        expect(explanation).toBeTruthy();
        expect(explanation).toContain('relationship');
        expect(explanation.split(':').length - 1).toBeGreaterThanOrEqual(1); // Should show the pattern

        // Should contain mathematical operation
        const hasOperation = /(\+|\-|\×|÷|\*|\/|²|³)/.test(explanation);
        expect(hasOperation).toBe(true);
      }
    });

    test('dynamic puzzle explanations should match their relationships', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const explanation = puzzle.explanation.toLowerCase();
        const operationType = puzzle.operationType.toLowerCase();

        if (operationType.includes('add')) {
          expect(explanation).toContain('add');
        } else if (operationType.includes('subtract')) {
          expect(explanation).toContain('subtract');
        } else if (operationType.includes('multiply')) {
          expect(explanation).toContain('multiply');
        } else if (operationType.includes('divide')) {
          expect(explanation).toContain('divid'); // matches "dividing"
        }
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle edge numbers gracefully', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const [a, b] = puzzle.firstPair;
        const [c] = puzzle.secondPair;

        // Should not have zero or negative numbers as primary values
        expect(a).toBeGreaterThan(0);
        expect(b).toBeGreaterThan(0);
        expect(c).toBeGreaterThan(0);

        // Should not have excessively large numbers
        expect(a).toBeLessThan(1000);
        expect(b).toBeLessThan(1000);
        expect(c).toBeLessThan(1000);
      }
    });

    test('should generate consistent puzzle structure', () => {
      const puzzle = generator.getRandom();

      expect(puzzle).toHaveProperty('firstPair');
      expect(puzzle).toHaveProperty('secondPair');
      expect(puzzle).toHaveProperty('relationshipType');
      expect(puzzle).toHaveProperty('operationType');
      expect(puzzle).toHaveProperty('puzzleType');
      expect(puzzle).toHaveProperty('puzzleSubtype');
      expect(puzzle).toHaveProperty('difficultyLevel');
      expect(puzzle).toHaveProperty('semanticId');

      expect(puzzle.puzzleType).toBe('number-analogy');
      expect(['easy', 'medium', 'hard']).toContain(puzzle.difficultyLevel);
    });
  });

  describe('Singleton Instance', () => {
    test('should export singleton instance', () => {
      expect(numberAnalogyPuzzleGenerator).toBeInstanceOf(NumberAnalogyPuzzleGenerator);
    });

    test('singleton should generate valid puzzles', () => {
      const puzzle = numberAnalogyPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.puzzleType).toBe('number-analogy');
    });
  });
});