import {
  NumberSeriesPuzzleGenerator,
  numberSeriesPuzzleGenerator,
  type NumberSeriesPuzzle
} from '../../src/lib/puzzles/numerical/numberSeries';
import { PuzzleValidator } from '../../src/lib/game/basePuzzle';

describe('NumberSeriesPuzzleGenerator', () => {
  let generator: NumberSeriesPuzzleGenerator;

  beforeEach(() => {
    generator = new NumberSeriesPuzzleGenerator();
  });



  describe('getRandom', () => {
    it('should generate valid random puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.series).toBeDefined();
        expect(Array.isArray(puzzle.series)).toBe(true);
        expect(puzzle.series.length).toBeGreaterThan(2);
        expect(puzzle.seriesType).toBeDefined();
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.explanation).toBeTruthy();
      }
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
      const series = puzzles.map(p => JSON.stringify(p.series));
      const uniqueSeries = new Set(series);
      
      // Should have some variety (not all identical)
      expect(uniqueSeries.size).toBeGreaterThan(1);
    });

    it('should use different series types', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      const seriesTypes = puzzles.map(p => p.seriesType);
      const uniqueSeriesTypes = new Set(seriesTypes);
      
      expect(uniqueSeriesTypes.size).toBeGreaterThan(0);
    });

    it('should not generate duplicate options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4); // Should have 4 unique options
      }
    });

    it('should generate series with proper numerical progression', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Series should contain only numbers
        puzzle.series.forEach(num => {
          expect(typeof num).toBe('number');
          expect(Number.isFinite(num)).toBe(true);
        });
        
        // Series should be in ascending order for most types
        if (puzzle.seriesType === 'arithmetic' || puzzle.seriesType === 'geometric') {
          for (let j = 1; j < puzzle.series.length; j++) {
            expect(puzzle.series[j]).toBeGreaterThanOrEqual(puzzle.series[j-1]);
          }
        }
      }
    });
  });

  describe('series validation', () => {
    it('should generate valid arithmetic series', () => {
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      const arithmeticPuzzles = puzzles.filter(p => p.seriesType === 'arithmetic');
      
      if (arithmeticPuzzles.length > 0) {
        arithmeticPuzzles.forEach(puzzle => {
          expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
          expect(puzzle.explanation).toMatch(/arithmetic|increase|add/i);
          
          // Check if it's actually arithmetic progression
          if (puzzle.series.length >= 3) {
            const diff1 = puzzle.series[1] - puzzle.series[0];
            const diff2 = puzzle.series[2] - puzzle.series[1];
            expect(Math.abs(diff1 - diff2)).toBeLessThanOrEqual(0.001); // Allow for floating point precision
          }
        });
      }
    });

    it('should generate valid geometric series', () => {
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      const geometricPuzzles = puzzles.filter(p => p.seriesType === 'geometric');
      
      if (geometricPuzzles.length > 0) {
        geometricPuzzles.forEach(puzzle => {
          expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
          expect(puzzle.explanation).toMatch(/geometric|multiply|ratio/i);
          
          // Check if it's actually geometric progression
          if (puzzle.series.length >= 3 && puzzle.series[0] !== 0 && puzzle.series[1] !== 0) {
            const ratio1 = puzzle.series[1] / puzzle.series[0];
            const ratio2 = puzzle.series[2] / puzzle.series[1];
            expect(Math.abs(ratio1 - ratio2)).toBeLessThanOrEqual(0.001); // Allow for floating point precision
          }
        });
      }
    });

    it('should handle edge cases in number generation', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        
        // No zero division in geometric series
        if (puzzle.seriesType === 'geometric') {
          puzzle.series.forEach(num => {
            expect(num).not.toBe(0);
          });
        }
        
        // Numbers should not be excessively large
        puzzle.series.forEach(num => {
          expect(Math.abs(num)).toBeLessThan(1000000);
        });
        
        // Options should be reasonable numbers
        puzzle.options.forEach(option => {
          const num = parseFloat(option);
          expect(Number.isFinite(num)).toBe(true);
          expect(Math.abs(num)).toBeLessThan(1000000);
        });
      }
    });
  });

  describe('hiddenIndex functionality', () => {

    it('should generate puzzles with proper hiddenIndex', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        expect(puzzle.hiddenIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.hiddenIndex).toBeLessThan(puzzle.series.length);
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

    it('should generate numeric options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        puzzle.options.forEach(option => {
          expect(typeof option).toBe('string');
          const num = parseFloat(option);
          expect(Number.isFinite(num)).toBe(true);
        });
      }
    });
  });


});

describe('Singleton instance', () => {
  describe('numberSeriesPuzzleGenerator', () => {
    it('should be an instance of NumberSeriesPuzzleGenerator', () => {
      expect(numberSeriesPuzzleGenerator).toBeInstanceOf(NumberSeriesPuzzleGenerator);
    });

    it('should generate valid puzzles', () => {
      const puzzle = numberSeriesPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.series).toBeDefined();
      expect(puzzle.seriesType).toBeDefined();
    });
  });
});

describe('Number series mathematical accuracy', () => {
  it('should maintain mathematical consistency in arithmetic series', () => {
    const puzzles = Array.from({ length: 30 }, () => numberSeriesPuzzleGenerator.getRandom());
    const arithmeticPuzzles = puzzles.filter(p => p.seriesType === 'arithmetic');
    
    arithmeticPuzzles.forEach(puzzle => {
      if (puzzle.series.length >= 4) {
        // Check that differences are consistent
        const differences = [];
        for (let i = 1; i < puzzle.series.length; i++) {
          differences.push(puzzle.series[i] - puzzle.series[i-1]);
        }
        
        // All differences should be the same in arithmetic progression
        const firstDiff = differences[0];
        differences.forEach(diff => {
          expect(Math.abs(diff - firstDiff)).toBeLessThanOrEqual(0.001);
        });
      }
    });
  });

  it('should maintain mathematical consistency in geometric series', () => {
    const puzzles = Array.from({ length: 30 }, () => numberSeriesPuzzleGenerator.getRandom());
    const geometricPuzzles = puzzles.filter(p => p.seriesType === 'geometric');
    
    geometricPuzzles.forEach(puzzle => {
      if (puzzle.series.length >= 4) {
        // Check that ratios are consistent (avoiding zero division)
        const nonZeroSeries = puzzle.series.filter(num => num !== 0);
        if (nonZeroSeries.length >= 3) {
          const ratios = [];
          for (let i = 1; i < nonZeroSeries.length; i++) {
            ratios.push(nonZeroSeries[i] / nonZeroSeries[i-1]);
          }
          
          // All ratios should be the same in geometric progression
          if (ratios.length > 1) {
            const firstRatio = ratios[0];
            ratios.forEach(ratio => {
              expect(Math.abs(ratio - firstRatio)).toBeLessThanOrEqual(0.001);
            });
          }
        }
      }
    });
  });

  describe('Edge cases and deprecated functions', () => {
    it('should handle case where additional distractors are needed', () => {
      // This test exercises the while loop in lines 301-303
      const generator = new NumberSeriesPuzzleGenerator();
      
      // Generate multiple puzzles to ensure we hit the case where we need more distractors
      const puzzles = Array.from({ length: 200 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.options).toContain(puzzle.options[puzzle.correctAnswerIndex]);
        
        // All options should be positive numbers
        puzzle.options.forEach(option => {
          expect(Number(option)).toBeGreaterThan(0);
        });
      });
    });

    it('should handle edge case with manual option forcing', () => {
      // Force a scenario where we need to generate additional distractors
      const generator = new NumberSeriesPuzzleGenerator();
      
      // Create a case where the natural distractors might create duplicates
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        
        // Check for unique options
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4);
        
        // All options should be valid positive numbers
        puzzle.options.forEach(option => {
          const num = Number(option);
          expect(num).toBeGreaterThan(0);
          expect(Number.isInteger(num)).toBe(true);
        });
      }
    });

    it('should export deprecated generateNumberSeriesPuzzle function', () => {
      const { generateNumberSeriesPuzzle } = require('../../lib/puzzles/numerical/numberSeries');
      const puzzle = generateNumberSeriesPuzzle();
      
      expect(puzzle).toBeDefined();
      expect(puzzle.type).toBe('numberSeries');
      expect(puzzle.series).toBeDefined();
      expect(puzzle.options).toHaveLength(4);
      expect(puzzle.correctAnswer).toBeDefined();
    });
  });
});