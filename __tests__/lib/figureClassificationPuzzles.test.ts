/**
 * Figure Classification Puzzles Tests
 * 
 * Tests for the Figure Classification puzzle generator, covering:
 * - Dynamic puzzle generation with all classification rules
 * - Figure element validation and properties
 * - Classification rule logic and odd-one-out detection
 * - Option generation and answer correctness
 * - Educational explanations and criteria descriptions
 * - Cognitive assessment puzzle structure
 */

import { 
  FigureClassificationPuzzleGenerator, 
  figureClassificationPuzzleGenerator,
  ClassificationRule,
  FigureShape,
  FigureSize,
  FigureColor,
  FigurePattern,
  FigureRotation
} from '../../src/lib/puzzles/cognitive/figureClassification';
import { PuzzleValidator } from '@/src/lib/game/basePuzzle';

describe('FigureClassificationPuzzleGenerator', () => {
  let generator: FigureClassificationPuzzleGenerator;

  beforeEach(() => {
    generator = new FigureClassificationPuzzleGenerator();
  });

  describe('Dynamic Puzzle Generation', () => {
    test('should generate valid figure classification puzzles', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.question).toContain('does NOT belong');
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.figures).toHaveLength(5);
        expect(puzzle.oddOneOutIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.oddOneOutIndex).toBeLessThan(5);
        expect(puzzle.classificationRule).toBeTruthy();
        expect(puzzle.criteriaDescription).toBeTruthy();
        expect(puzzle.explanation).toBeTruthy();
      }
    });

    test('should generate different classification rules', () => {
      const puzzles = [];
      for (let i = 0; i < 50; i++) {
        puzzles.push(generator.getRandom());
      }
      
      const classificationRules = puzzles.map(p => p.classificationRule);
      const uniqueRules = new Set(classificationRules);
      
      expect(uniqueRules.size).toBeGreaterThanOrEqual(3);
      expect(uniqueRules.has(ClassificationRule.SHAPE)).toBe(true);
    });

    test('should generate puzzles with odd one out in different positions', () => {
      const puzzles = [];
      for (let i = 0; i < 30; i++) {
        puzzles.push(generator.getRandom());
      }
      
      const positions = puzzles.map(p => p.oddOneOutIndex);
      const uniquePositions = new Set(positions);
      
      expect(uniquePositions.size).toBeGreaterThan(1); // Should have variety in odd positions
    });

    test('should generate mathematically consistent classifications', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Verify exactly 5 figures
        expect(puzzle.figures).toHaveLength(5);
        
        // Verify odd one out index is valid
        expect(puzzle.oddOneOutIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.oddOneOutIndex).toBeLessThan(5);
        
        // Verify the classification logic
        const figures = puzzle.figures;
        const oddIndex = puzzle.oddOneOutIndex;
        const rule = puzzle.classificationRule;
        
        // Count occurrences of each property value
        const propertyCounts = countPropertyValues(figures, rule);
        
        // Should have exactly one property value with count 1 (the odd one out)
        const singleCounts = Object.values(propertyCounts).filter(count => count === 1);
        expect(singleCounts).toHaveLength(1);
        
        // Should have exactly one property value with count 4 (the majority)
        const majorityCounts = Object.values(propertyCounts).filter(count => count === 4);
        expect(majorityCounts).toHaveLength(1);
      }
    });

    test('should generate unique options for each puzzle', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4);
        
        // Options should be A, B, C, D, E (subset of 4)
        puzzle.options.forEach(option => {
          expect(['A', 'B', 'C', 'D', 'E']).toContain(option);
        });
      }
    });
  });

  describe('Classification Rule Types', () => {
    test('should handle shape-based classification correctly', () => {
      // Generate many puzzles to get shape-based ones
      const shapePuzzles = [];
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.classificationRule === ClassificationRule.SHAPE) {
          shapePuzzles.push(puzzle);
        }
      }
      
      expect(shapePuzzles.length).toBeGreaterThan(0);
      
      shapePuzzles.forEach(puzzle => {
        expect(puzzle.explanation.toLowerCase()).toContain('shape');
        expect(puzzle.criteriaDescription.toLowerCase()).toContain('shape');
        
        // Verify shape classification logic
        const shapes = puzzle.figures.map(f => f.shape);
        const shapeCounts = countValues(shapes);
        const singleCounts = Object.values(shapeCounts).filter(count => count === 1);
        expect(singleCounts).toHaveLength(1);
      });
    });

    test('should handle size-based classification correctly', () => {
      const sizePuzzles = [];
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.classificationRule === ClassificationRule.SIZE) {
          sizePuzzles.push(puzzle);
        }
      }
      
      if (sizePuzzles.length > 0) {
        sizePuzzles.forEach(puzzle => {
          expect(puzzle.explanation.toLowerCase()).toMatch(/(size|large|medium|small)/);
          expect(puzzle.criteriaDescription.toLowerCase()).toMatch(/(size|large|medium|small)/);
        });
      }
    });

    test('should handle color-based classification correctly', () => {
      const colorPuzzles = [];
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.classificationRule === ClassificationRule.COLOR) {
          colorPuzzles.push(puzzle);
        }
      }
      
      if (colorPuzzles.length > 0) {
        colorPuzzles.forEach(puzzle => {
          expect(puzzle.explanation.toLowerCase()).toMatch(/(color|red|blue|green|yellow|purple|orange|black|gray)/);
          expect(puzzle.criteriaDescription.toLowerCase()).toMatch(/(color|red|blue|green|yellow|purple|orange|black|gray)/);
        });
      }
    });

    test('should handle pattern-based classification correctly', () => {
      const patternPuzzles = [];
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.classificationRule === ClassificationRule.PATTERN) {
          patternPuzzles.push(puzzle);
        }
      }
      
      if (patternPuzzles.length > 0) {
        patternPuzzles.forEach(puzzle => {
          expect(puzzle.explanation.toLowerCase()).toContain('pattern');
          expect(puzzle.criteriaDescription.toLowerCase()).toContain('pattern');
        });
      }
    });

    test('should handle count-based classification correctly', () => {
      const countPuzzles = [];
      for (let i = 0; i < 50; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.classificationRule === ClassificationRule.COUNT) {
          countPuzzles.push(puzzle);
        }
      }
      
      if (countPuzzles.length > 0) {
        countPuzzles.forEach(puzzle => {
          expect(puzzle.explanation.toLowerCase()).toContain('element');
          expect(puzzle.criteriaDescription.toLowerCase()).toContain('element');
        });
      }
    });
  });

  describe('Figure Element Validation', () => {
    test('should generate valid figure elements with all required properties', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        puzzle.figures.forEach((figure, index) => {
          expect(figure).toHaveProperty('shape');
          expect(figure).toHaveProperty('size');
          expect(figure).toHaveProperty('color');
          expect(figure).toHaveProperty('pattern');
          expect(figure).toHaveProperty('rotation');
          expect(figure).toHaveProperty('count');
          expect(figure).toHaveProperty('position');
          
          expect(Object.values(FigureShape)).toContain(figure.shape);
          expect(Object.values(FigureSize)).toContain(figure.size);
          expect(Object.values(FigureColor)).toContain(figure.color);
          expect(Object.values(FigurePattern)).toContain(figure.pattern);
          expect(Object.values(FigureRotation)).toContain(figure.rotation);
          expect(typeof figure.count).toBe('number');
          expect(figure.count).toBeGreaterThan(0);
          expect(['center', 'left', 'right', 'top', 'bottom']).toContain(figure.position);
        });
      }
    });

    test('should generate figures with consistent properties for majority group', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const figures = puzzle.figures;
        const rule = puzzle.classificationRule;
        
        // Get the property values for classification
        const propertyValues = figures.map(figure => getPropertyValue(figure, rule));
        
        // Count occurrences
        const counts = countValues(propertyValues);
        
        // Should have exactly one value occurring 4 times (majority)
        const majorityValues = Object.entries(counts).filter(([_, count]) => count === 4);
        expect(majorityValues).toHaveLength(1);
        
        // Should have exactly one value occurring 1 time (odd one out)
        const oddValues = Object.entries(counts).filter(([_, count]) => count === 1);
        expect(oddValues).toHaveLength(1);
      }
    });
  });

  describe('Explanations and Criteria', () => {
    test('should generate clear explanations for all puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const explanation = puzzle.explanation;
        
        expect(explanation).toBeTruthy();
        expect(explanation).toMatch(/(answer is|classification|property|pattern|different)/i);
        expect(explanation.length).toBeGreaterThan(30); // Should be descriptive
        
        // Should mention the correct position (A, B, C, D, E)
        expect(explanation).toMatch(/answer is [A-E]/);
      }
    });

    test('should generate appropriate criteria descriptions', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const criteriaDescription = puzzle.criteriaDescription;
        
        expect(criteriaDescription).toBeTruthy();
        expect(criteriaDescription.length).toBeGreaterThan(20);
        expect(criteriaDescription).toMatch(/four figures/i);
        expect(criteriaDescription).toMatch(/one/i);
      }
    });

    test('explanations should match their classification rules', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        const explanation = puzzle.explanation.toLowerCase();
        const rule = puzzle.classificationRule;
        
        switch (rule) {
          case ClassificationRule.SHAPE:
            expect(explanation).toContain('shape');
            break;
          case ClassificationRule.SIZE:
            expect(explanation).toMatch(/(size|large|medium|small)/);
            break;
          case ClassificationRule.COLOR:
            expect(explanation).toMatch(/(color|red|blue|green|yellow|purple|orange|black|gray)/);
            break;
          case ClassificationRule.PATTERN:
            expect(explanation).toContain('pattern');
            break;
          case ClassificationRule.COUNT:
            expect(explanation).toContain('element');
            break;
        }
      }
    });
  });

  describe('Cognitive Assessment Integration', () => {
    test('should have consistent interface with other puzzle types', () => {
      const puzzle = generator.getRandom();
      
      // Should have all BasePuzzle properties
      expect(puzzle).toHaveProperty('question');
      expect(puzzle).toHaveProperty('options');
      expect(puzzle).toHaveProperty('correctAnswerIndex');
      expect(puzzle).toHaveProperty('explanation');
      
      // Should have FigureClassificationPuzzle specific properties
      expect(puzzle).toHaveProperty('figures');
      expect(puzzle).toHaveProperty('oddOneOutIndex');
      expect(puzzle).toHaveProperty('classificationRule');
      expect(puzzle).toHaveProperty('criteriaDescription');
    });

    test('should generate puzzles suitable for cognitive assessment', () => {
      const puzzles = [];
      for (let i = 0; i < 20; i++) {
        puzzles.push(generator.getRandom());
      }
      
      puzzles.forEach(puzzle => {
        // Should have exactly 5 figures for classification
        expect(puzzle.figures).toHaveLength(5);
        
        // Should have 4 answer options (A, B, C, D, E subset)
        expect(puzzle.options).toHaveLength(4);
        
        // Should have clear, educational explanation
        expect(puzzle.explanation).toBeTruthy();
        expect(puzzle.explanation.length).toBeGreaterThan(30);
        
        // Should test logical reasoning
        expect(puzzle.question).toContain('does NOT belong');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle edge cases in dynamic generation', () => {
      // Test multiple times to catch any edge cases
      for (let i = 0; i < 30; i++) {
        const puzzle = generator.getRandom();
        
        // Ensure valid puzzle structure
        expect(puzzle.figures).toHaveLength(5);
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.oddOneOutIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.oddOneOutIndex).toBeLessThan(5);
        
        // Ensure valid classification
        const rule = puzzle.classificationRule;
        expect(Object.values(ClassificationRule)).toContain(rule);
      }
    });

    test('should ensure answer options are unique and valid', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4);
        
        puzzle.options.forEach(option => {
          expect(typeof option).toBe('string');
          expect(option.length).toBe(1);
          expect(['A', 'B', 'C', 'D', 'E']).toContain(option);
        });
      }
    });

    test('should generate consistent odd-one-out logic', () => {
      for (let i = 0; i < 15; i++) {
        const puzzle = generator.getRandom();
        
        // Verify that the identified odd one out is actually different
        const figures = puzzle.figures;
        const oddIndex = puzzle.oddOneOutIndex;
        const rule = puzzle.classificationRule;
        
        const oddFigure = figures[oddIndex];
        const otherFigures = figures.filter((_, idx) => idx !== oddIndex);
        
        const oddValue = getPropertyValue(oddFigure, rule);
        const otherValues = otherFigures.map(f => getPropertyValue(f, rule));
        
        // All other figures should have the same property value
        const uniqueOtherValues = new Set(otherValues);
        expect(uniqueOtherValues.size).toBe(1);
        
        // The odd figure should have a different value
        const commonValue = otherValues[0];
        expect(oddValue).not.toBe(commonValue);
      }
    });
  });

  describe('Singleton Instance', () => {
    test('should export singleton instance', () => {
      expect(figureClassificationPuzzleGenerator).toBeInstanceOf(FigureClassificationPuzzleGenerator);
    });

    test('singleton should generate valid puzzles', () => {
      const puzzle = figureClassificationPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.figures).toHaveLength(5);
    });
  });
});

describe('Figure Classification Integration', () => {
  test('should integrate with BasePuzzle validation', () => {
    const puzzle = figureClassificationPuzzleGenerator.getRandom();
    expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
  });

  test('should generate variety of classification types', () => {
    const puzzles = [];
    for (let i = 0; i < 100; i++) {
      puzzles.push(figureClassificationPuzzleGenerator.getRandom());
    }
    
    const classificationRules = puzzles.map(p => p.classificationRule);
    const uniqueRules = new Set(classificationRules);
    
    // Should generate multiple different classification types
    expect(uniqueRules.size).toBeGreaterThanOrEqual(3);
  });

  test('should support cognitive assessment requirements', () => {
    const puzzles = [];
    for (let i = 0; i < 50; i++) {
      puzzles.push(figureClassificationPuzzleGenerator.getRandom());
    }
    
    puzzles.forEach(puzzle => {
      // CogAT/OLSAT/NNAT requirements
      expect(puzzle.figures).toHaveLength(5); // Standard format
      expect(puzzle.options).toHaveLength(4); // Multiple choice
      expect(puzzle.question).toContain('does NOT belong'); // Clear instruction
      expect(puzzle.explanation).toBeTruthy(); // Educational value
      
      // Cognitive reasoning validation
      expect(puzzle.classificationRule).toBeTruthy();
      expect(puzzle.criteriaDescription).toBeTruthy();
    });
  });
});

// Helper functions for tests
function countPropertyValues(figures: any[], rule: ClassificationRule): Record<string, number> {
  const counts: Record<string, number> = {};
  
  figures.forEach(figure => {
    const value = getPropertyValue(figure, rule);
    counts[value] = (counts[value] || 0) + 1;
  });
  
  return counts;
}

function getPropertyValue(figure: any, rule: ClassificationRule): string {
  switch (rule) {
    case ClassificationRule.SHAPE:
      return figure.shape;
    case ClassificationRule.SIZE:
      return figure.size;
    case ClassificationRule.COLOR:
      return figure.color;
    case ClassificationRule.PATTERN:
      return figure.pattern;
    case ClassificationRule.ROTATION:
      return figure.rotation.toString();
    case ClassificationRule.COUNT:
      return figure.count.toString();
    case ClassificationRule.MULTI_CRITERIA:
      return `${figure.shape}-${figure.color}`;
    default:
      return figure.shape;
  }
}

function countValues(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  values.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}