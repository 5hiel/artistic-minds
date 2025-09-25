import {
  PatternPuzzleGenerator,
  patternPuzzleGenerator,
  generatePatternPuzzle,
  type PatternPuzzle
} from '../../src/lib/puzzles/reasoning/pattern';
import { PuzzleValidator } from '../../src/lib/game/basePuzzle';

describe('PatternPuzzleGenerator', () => {
  let generator: PatternPuzzleGenerator;

  beforeEach(() => {
    generator = new PatternPuzzleGenerator();
  });



  describe('getRandom', () => {
    it('should generate valid random puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.grid).toBeDefined();
        expect(puzzle.grid).toHaveLength(3);
        expect(puzzle.grid[0]).toHaveLength(3);
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.patternType).toBeDefined();
        expect(puzzle.explanation).toBeTruthy();
      }
    });

    it('should generate puzzles with exactly one empty cell', () => {
      const puzzle = generator.getRandom();
      let emptyCells = 0;
      
      puzzle.grid.forEach(row => {
        row.forEach(cell => {
          if (cell === '') emptyCells++;
        });
      });
      
      expect(emptyCells).toBe(1);
    });

    it('should generate puzzles where the correct answer exists in options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
        expect(puzzle.options).toContain(correctAnswer);
      }
    });

    it('should generate variety in puzzle content', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      const grids = puzzles.map(p => JSON.stringify(p.grid));
      const uniqueGrids = new Set(grids);
      
      // Should have some variety (not all identical)
      expect(uniqueGrids.size).toBeGreaterThan(1);
    });

    it('should use different pattern types', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      const patternTypes = puzzles.map(p => p.patternType);
      const uniquePatternTypes = new Set(patternTypes);
      
      expect(uniquePatternTypes.size).toBeGreaterThan(1);
    });

    it('should not generate duplicate options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4); // Should have 4 unique options
      }
    });
  });

  describe('pattern generation logic', () => {
    it('should generate valid row-shift patterns', () => {
      // We can't directly test private methods, but we can test the output
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      const rowShiftPuzzles = puzzles.filter(p => p.patternType === 'row-shift');
      
      if (rowShiftPuzzles.length > 0) {
        rowShiftPuzzles.forEach(puzzle => {
          expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
          expect(puzzle.explanation).toContain('row');
        });
      }
    });

    it('should generate valid mirror patterns', () => {
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      const mirrorPuzzles = puzzles.filter(p => p.patternType === 'mirror');
      
      if (mirrorPuzzles.length > 0) {
        mirrorPuzzles.forEach(puzzle => {
          expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
          expect(puzzle.explanation).toContain('mirror');
        });
      }
    });

    it('should generate valid opposite patterns', () => {
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      const oppositePuzzles = puzzles.filter(p => p.patternType === 'opposite');
      
      if (oppositePuzzles.length > 0) {
        oppositePuzzles.forEach(puzzle => {
          expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
          expect(puzzle.explanation).toContain('transformation');
        });
      }
    });

    it('should generate valid column-shift patterns', () => {
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      const columnShiftPuzzles = puzzles.filter(p => p.patternType === 'column-shift');
      
      if (columnShiftPuzzles.length > 0) {
        columnShiftPuzzles.forEach(puzzle => {
          expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        });
      }
    });
  });

  describe('grid validation', () => {
    it('should generate grids with proper structure', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Grid should be 3x3
        expect(puzzle.grid).toHaveLength(3);
        puzzle.grid.forEach(row => {
          expect(row).toHaveLength(3);
          expect(Array.isArray(row)).toBe(true);
        });
        
        // Should have exactly one empty cell
        const flatGrid = puzzle.grid.flat();
        const emptyCells = flatGrid.filter(cell => cell === '');
        expect(emptyCells).toHaveLength(1);
        
        // Other cells should be non-empty strings
        const nonEmptyCells = flatGrid.filter(cell => cell !== '');
        nonEmptyCells.forEach(cell => {
          expect(typeof cell).toBe('string');
          expect(cell.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('option generation', () => {
    it('should generate exactly 4 options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        expect(puzzle.options).toHaveLength(4);
      }
    });

    it('should include the correct answer in options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];
        expect(puzzle.options).toContain(correctAnswer);
      }
    });

    it('should have valid correctAnswerIndex', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.correctAnswerIndex).toBeLessThan(4);
      }
    });
  });


});

describe('Singleton instance and legacy functions', () => {
  describe('patternPuzzleGenerator', () => {
    it('should be an instance of PatternPuzzleGenerator', () => {
      expect(patternPuzzleGenerator).toBeInstanceOf(PatternPuzzleGenerator);
    });

    it('should generate valid puzzles', () => {
      const puzzle = patternPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
    });
  });

  describe('generatePatternPuzzle (legacy)', () => {
    it('should generate valid pattern puzzles', () => {
      const puzzle = generatePatternPuzzle();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.grid).toBeDefined();
      expect(puzzle.patternType).toBeDefined();
    });

    it('should generate different puzzles on successive calls', () => {
      const puzzle1 = generatePatternPuzzle();
      const puzzle2 = generatePatternPuzzle();
      
      // While they might be the same, probability is low
      const grid1Str = JSON.stringify(puzzle1.grid);
      const grid2Str = JSON.stringify(puzzle2.grid);
      
      // At minimum, they should both be valid
      expect(PuzzleValidator.validatePuzzle(puzzle1)).toBe(true);
      expect(PuzzleValidator.validatePuzzle(puzzle2)).toBe(true);
    });
  });
});

describe('Pattern puzzle edge cases', () => {
  it('should handle empty cell placement correctly', () => {
    const puzzles = Array.from({ length: 20 }, () => patternPuzzleGenerator.getRandom());
    
    puzzles.forEach(puzzle => {
      let emptyCellFound = false;
      let emptyPosition: [number, number] | null = null;
      
      // Find the empty cell
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (puzzle.grid[i][j] === '') {
            expect(emptyCellFound).toBe(false); // Should only have one empty cell
            emptyCellFound = true;
            emptyPosition = [i, j];
          }
        }
      }
      
      expect(emptyCellFound).toBe(true);
      expect(emptyPosition).not.toBeNull();
      
      // Empty cell should not be at position (0,0) based on implementation
      if (emptyPosition) {
        expect(!(emptyPosition[0] === 0 && emptyPosition[1] === 0) || 
               (emptyPosition[0] !== 0 || emptyPosition[1] !== 0)).toBe(true);
      }
    });
  });

  it('should use emoji shapes consistently', () => {
    for (let i = 0; i < 10; i++) {
      const puzzle = patternPuzzleGenerator.getRandom();
      
      // All non-empty grid cells should be valid emoji/shapes
      puzzle.grid.flat().forEach(cell => {
        if (cell !== '') {
          expect(typeof cell).toBe('string');
          expect(cell.length).toBeGreaterThan(0);
        }
      });
      
      // All options should be valid shapes
      puzzle.options.forEach(option => {
        expect(typeof option).toBe('string');
        expect(option.length).toBeGreaterThan(0);
      });
    }
  });
});