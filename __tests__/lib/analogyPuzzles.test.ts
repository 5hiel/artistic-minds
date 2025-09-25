import { AnalogyPuzzleGenerator, AnalogyPuzzle } from '../../src/lib/puzzles/reasoning/analogy';
import { PuzzleValidator } from '../../src/lib/game/basePuzzle';

describe('AnalogyPuzzleGenerator', () => {
  let generator: AnalogyPuzzleGenerator;

  beforeEach(() => {
    generator = new AnalogyPuzzleGenerator();
  });



  describe('getRandom() method', () => {
    it('should generate valid puzzles', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.relationshipType).toBeDefined();
        expect(typeof puzzle.relationshipType).toBe('string');
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

    it('should generate puzzles with analogy format', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        const question = puzzle.question;
        const hasAnalygyPattern = question.includes(' is to ') && question.includes(' as ');
        
        expect(hasAnalygyPattern).toBe(true);
        expect(question.includes('?')).toBe(true);
      }
    });

    it('should generate different relationship types', () => {
      const relationshipTypes = new Set<string>();
      
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        relationshipTypes.add(puzzle.relationshipType);
      }
      
      // Should have generated multiple relationship types
      expect(relationshipTypes.size).toBeGreaterThan(1);
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

    it('should have unique options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const uniqueOptions = new Set(puzzle.options);
        
        expect(uniqueOptions.size).toBe(puzzle.options.length);
      }
    });
  });

  describe('Relationship type generation', () => {
    it('should generate opposite relationships correctly', () => {
      let foundOpposite = false;
      
      for (let i = 0; i < 50 && !foundOpposite; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.relationshipType === 'opposite') {
          foundOpposite = true;
          
          // Should mention opposites or antonyms in explanation
          const explanation = puzzle.explanation.toLowerCase();
          const hasOppositeRef = explanation.includes('opposite') || 
                                explanation.includes('antonym') ||
                                explanation.includes('contrast');
          expect(hasOppositeRef).toBe(true);
        }
      }
      
      expect(foundOpposite).toBe(true);
    });

    it('should generate category relationships correctly', () => {
      let foundCategory = false;
      
      for (let i = 0; i < 50 && !foundCategory; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.relationshipType === 'category') {
          foundCategory = true;
          
          // Should mention category or classification in explanation
          const explanation = puzzle.explanation.toLowerCase();
          const hasCategoryRef = explanation.includes('category') || 
                                explanation.includes('classification') ||
                                explanation.includes('belong');
          expect(hasCategoryRef).toBe(true);
        }
      }
      
      expect(foundCategory).toBe(true);
    });

    it('should generate function relationships correctly', () => {
      let foundFunction = false;
      
      for (let i = 0; i < 50 && !foundFunction; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.relationshipType === 'function') {
          foundFunction = true;
          
          // Should mention function or purpose in explanation
          const explanation = puzzle.explanation.toLowerCase();
          const hasFunctionRef = explanation.includes('function') || 
                                explanation.includes('purpose') ||
                                explanation.includes('used');
          expect(hasFunctionRef).toBe(true);
        }
      }
      
      expect(foundFunction).toBe(true);
    });

    it('should generate part-whole relationships correctly', () => {
      let foundPartWhole = false;
      
      for (let i = 0; i < 50 && !foundPartWhole; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.relationshipType === 'part-whole') {
          foundPartWhole = true;
          
          // Should mention part or whole in explanation
          const explanation = puzzle.explanation.toLowerCase();
          const hasPartWholeRef = explanation.includes('part') || 
                                 explanation.includes('whole') ||
                                 explanation.includes('component');
          expect(hasPartWholeRef).toBe(true);
        }
      }
      
      expect(foundPartWhole).toBe(true);
    });
  });

  describe('Answer validation', () => {
    it('should have reasonable distractors', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // All options should be non-empty strings
        puzzle.options.forEach(option => {
          expect(typeof option).toBe('string');
          expect(option.length).toBeGreaterThan(0);
          // Options should not be just numbers (unless it's a numeric analogy)
          expect(option.trim().length).toBeGreaterThan(0);
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
        
        // Should be a meaningful explanation (contains common explanation patterns)
        const lowerExplanation = puzzle.explanation.toLowerCase();
        const hasExplanationPattern = [
          'relationship', 'based on', 'similar', 'opposite', 'antonym', 
          'category', 'classification', 'function', 'purpose', 'part', 'whole',
          'cause', 'effect', 'sequence', 'chronological', 'transform'
        ].some(word => lowerExplanation.includes(word));
        expect(hasExplanationPattern).toBe(true);
      }
    });

  });


  describe('Edge cases', () => {

    it('should maintain question consistency', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Question should have proper capitalization
        expect(puzzle.question.charAt(0)).toBe(puzzle.question.charAt(0).toUpperCase());
        
        // Should end with question mark
        expect(puzzle.question.endsWith('?')).toBe(true);
      }
    });

  });


  describe('Deprecated functions', () => {
    it('should export generateRandomAnalogyPuzzle function', () => {
      const { generateRandomAnalogyPuzzle } = require('../../src/lib/puzzles/reasoning/analogy');
      const puzzle = generateRandomAnalogyPuzzle();
      
      expect(puzzle).toBeDefined();
      expect(puzzle.type).toBe('analogy');
      expect(puzzle.question).toBeDefined();
      expect(puzzle.options).toBeDefined();
      expect(puzzle.correctAnswer).toBeDefined();
    });
  });
});