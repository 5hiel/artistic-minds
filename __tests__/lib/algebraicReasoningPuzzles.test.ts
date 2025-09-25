import { 
  AlgebraicReasoningPuzzle, 
  AlgebraicReasoningPuzzleGenerator,
  algebraicReasoningPuzzleGenerator 
} from '@/src/lib/puzzles/numerical/algebraicReasoning';
import { PuzzleValidator } from '@/src/lib/game/basePuzzle';

describe('AlgebraicReasoningPuzzle', () => {
  let generator: AlgebraicReasoningPuzzleGenerator;

  beforeEach(() => {
    generator = new AlgebraicReasoningPuzzleGenerator();
  });




  describe('Dynamic Puzzle Generation', () => {
    test('getRandom() should generate valid puzzles', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.equation).toBeDefined();
        expect(puzzle.variableSymbol).toBeDefined();
        expect(puzzle.algebraType).toMatch(/^(linear|quadratic|system)$/);
        expect([1, 2, 3]).toContain(puzzle.numericDifficulty);
        expect(puzzle.options).toHaveLength(4);
        
        // Verify answer is correct option
        const answer = puzzle.options[puzzle.correctAnswerIndex];
        expect(answer).toBeTruthy();
        expect(parseInt(answer)).not.toBeNaN();
        
        console.log(`Dynamic Puzzle ${i + 1}: ${puzzle.question} → ${answer} (Level ${puzzle.difficultyLevel})`);
      }
    });

    test('should generate different difficulty levels with proper distribution', () => {
      const difficulties: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const puzzle = generator.getRandom();
        difficulties.push(puzzle.numericDifficulty);
      }
      
      const level1Count = difficulties.filter(d => d === 1).length;
      const level2Count = difficulties.filter(d => d === 2).length;
      const level3Count = difficulties.filter(d => d === 3).length;
      
      // Expect roughly 50% basic, 30% intermediate, 20% advanced
      expect(level1Count).toBeGreaterThan(30); // At least 30% basic
      expect(level2Count).toBeGreaterThan(15); // At least 15% intermediate  
      expect(level3Count).toBeGreaterThan(10); // At least 10% advanced
      
      console.log(`Distribution: Level 1: ${level1Count}%, Level 2: ${level2Count}%, Level 3: ${level3Count}%`);
    });

    test('should generate different variable symbols', () => {
      const variables = new Set<string>();
      
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        variables.add(puzzle.variableSymbol);
      }
      
      expect(variables.size).toBeGreaterThan(2); // Should use multiple variables
      expect(variables.has('x')).toBe(true);
    });

    test('basic linear equations should have correct answers', () => {
      // Generate several basic linear equations and verify answers
      for (let i = 0; i < 10; i++) {
        // Use internal method to ensure we get basic linear
        const puzzle = (generator as any).generateBasicLinear('x');
        
        expect(puzzle.numericDifficulty).toBe(1);
        expect(puzzle.algebraType).toBe('linear');
        
        const answer = parseInt(puzzle.options[puzzle.correctAnswerIndex]);
        expect(answer).toBeGreaterThan(0);
        expect(answer).toBeLessThan(20); // Reasonable range
        
        // Verify equation format
        expect(puzzle.equation).toMatch(/^\d+x \+ \d+ = \d+$/);
      }
    });
  });

  describe('Singleton Instance', () => {
    test('algebraicReasoningPuzzleGenerator should be properly instantiated', () => {
      expect(algebraicReasoningPuzzleGenerator).toBeInstanceOf(AlgebraicReasoningPuzzleGenerator);
    });

    test('singleton methods should work correctly', () => {
      const dynamicPuzzle = algebraicReasoningPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(dynamicPuzzle)).toBe(true);
    });
  });


  describe('Edge Cases', () => {

    test('should not generate negative answers in basic mode', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = (generator as any).generateBasicLinear('x');
        const answer = parseInt(puzzle.options[puzzle.correctAnswerIndex]);
        expect(answer).toBeGreaterThan(0);
      }
    });

  });
});