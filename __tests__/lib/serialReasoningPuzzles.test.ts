import { SerialReasoningPuzzleGenerator, SerialReasoningPuzzle } from '../../src/lib/puzzles/reasoning/serialReasoning';
import { PuzzleValidator } from '../../src/lib/game/basePuzzle';

describe('SerialReasoningPuzzleGenerator', () => {
  let generator: SerialReasoningPuzzleGenerator;

  beforeEach(() => {
    generator = new SerialReasoningPuzzleGenerator();
  });



  describe('getRandom() method', () => {
    it('should generate valid puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.grid).toBeDefined();
        expect(Array.isArray(puzzle.grid)).toBe(true);
        expect(puzzle.matrixType).toBeDefined();
        expect(['numeric', 'symbolic', 'shape']).toContain(puzzle.matrixType);
      }
    });

    it('should generate puzzles with correct structure', () => {
      const puzzle = generator.getRandom();
      
      expect(puzzle.question).toBeDefined();
      expect(typeof puzzle.question).toBe('string');
      expect(puzzle.options.length).toBe(4);
      expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctAnswerIndex).toBeLessThan(4);
      expect(puzzle.explanation).toBeDefined();
      expect(typeof puzzle.explanation).toBe('string');
    });

    it('should generate puzzles with consistent grid dimensions', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        expect(puzzle.grid.length).toBeGreaterThan(0);
        const firstRowLength = puzzle.grid[0].length;
        
        puzzle.grid.forEach((row, rowIndex) => {
          expect(row.length).toBe(firstRowLength);
        });
      }
    });

    it('should generate puzzles with exactly one missing element', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        let emptyCells = 0;
        puzzle.grid.forEach(row => {
          row.forEach(cell => {
            if (cell === '' || cell === null || cell === undefined) {
              emptyCells++;
            }
          });
        });
        
        expect(emptyCells).toBe(1);
      }
    });

    it('should generate different puzzle types', () => {
      const types = new Set<string>();
      
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        types.add(puzzle.matrixType);
      }
      
      // Should have generated multiple types (though not guaranteed all 3)
      expect(types.size).toBeGreaterThan(1);
    });

    it('should have correct answer in options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
        
        expect(correctAnswer).toBeDefined();
        expect(typeof correctAnswer).toBe('string');
        expect(correctAnswer.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Matrix type generation', () => {
    it('should generate numeric matrices correctly', () => {
      // Run multiple times to increase chance of getting numeric type
      let foundNumeric = false;
      
      for (let i = 0; i < 50 && !foundNumeric; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.matrixType === 'numeric') {
          foundNumeric = true;
          
          // Check that grid contains mostly numeric-like content
          const hasNumbers = puzzle.grid.some(row => 
            row.some(cell => cell && /\d/.test(cell))
          );
          
          expect(hasNumbers).toBe(true);
        }
      }
      
      // Should eventually generate a numeric puzzle
      expect(foundNumeric).toBe(true);
    });

    it('should generate symbolic matrices correctly', () => {
      let foundSymbolic = false;
      
      for (let i = 0; i < 50 && !foundSymbolic; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.matrixType === 'symbolic') {
          foundSymbolic = true;
          
          // Check that grid contains symbolic content
          const hasSymbols = puzzle.grid.some(row => 
            row.some(cell => cell && cell.length > 0 && !/^\d+$/.test(cell))
          );
          
          expect(hasSymbols).toBe(true);
        }
      }
      
      expect(foundSymbolic).toBe(true);
    });

    it('should generate shape matrices correctly', () => {
      let foundShape = false;
      
      for (let i = 0; i < 50 && !foundShape; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.matrixType === 'shape') {
          foundShape = true;
          
          // Shape puzzles should have visual elements
          const hasShapes = puzzle.grid.some(row => 
            row.some(cell => cell && cell.length > 0)
          );
          
          expect(hasShapes).toBe(true);
        }
      }
      
      expect(foundShape).toBe(true);
    });
  });

  describe('Answer validation', () => {
    it('should have unique options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const uniqueOptions = new Set(puzzle.options);
        
        expect(uniqueOptions.size).toBe(puzzle.options.length);
      }
    });

    it('should have reasonable distractors', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // All options should be non-empty strings
        puzzle.options.forEach(option => {
          expect(typeof option).toBe('string');
          expect(option.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Explanation generation', () => {
    it('should generate meaningful explanations', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(puzzle.explanation).toBeDefined();
        expect(typeof puzzle.explanation).toBe('string');
        expect(puzzle.explanation.length).toBeGreaterThan(10); // Should be descriptive
        
        // Should mention the pattern or logic
        const lowerExplanation = puzzle.explanation.toLowerCase();
        const hasPattern = ['pattern', 'logic', 'sequence', 'matrix', 'transform'].some(
          word => lowerExplanation.includes(word)
        );
        expect(hasPattern).toBe(true);
      }
    });
  });


  describe('Edge cases', () => {
    it('should handle empty grid cells correctly', () => {
      const puzzle = generator.getRandom();
      
      // Find the empty cell
      let emptyFound = false;
      puzzle.grid.forEach(row => {
        row.forEach(cell => {
          if (cell === '' || cell === null || cell === undefined) {
            emptyFound = true;
          }
        });
      });
      
      expect(emptyFound).toBe(true);
    });

    it('should maintain grid structure integrity', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Verify grid is well-formed
        expect(puzzle.grid.length).toBeGreaterThan(0);
        puzzle.grid.forEach(row => {
          expect(Array.isArray(row)).toBe(true);
          expect(row.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Edge cases and deprecated functions', () => {
    it('should handle option generation edge cases for symbolic matrices', () => {
      // This should exercise the while loops in lines 228-231 and 312-315
      const generator = new SerialReasoningPuzzleGenerator();
      
      // Generate many puzzles to ensure we hit edge cases
      const puzzles = Array.from({ length: 100 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.options).toContain(puzzle.options[puzzle.correctAnswerIndex]);
        
        // All options should be unique
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4);
      });
    });


    it('should export generateRandomSerialReasoningPuzzle function', () => {
      const { generateRandomSerialReasoningPuzzle } = require('../../src/lib/puzzles/reasoning/serialReasoning');
      const puzzle = generateRandomSerialReasoningPuzzle();
      
      expect(puzzle).toBeDefined();
      expect(puzzle.type).toBe('serialReasoning');
      expect(puzzle.grid).toBeDefined();
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctAnswer).toBeDefined();
      expect(puzzle.matrixType).toBeDefined();
    });
  });
});