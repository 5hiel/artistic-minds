import { 
  BasePuzzle, 
  PuzzleValidator, 
  ExplanationGenerator, 
  BasePuzzleGenerator 
} from '../../src/lib/game/basePuzzle';
// Mock puzzles directly in test
const mockPatternPuzzle = {
  question: 'Test question',
  grid: [['A', 'B'], ['C', '?']],
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: 0,
  explanation: 'Test explanation',
  patternType: 'test-pattern',
  puzzleType: 'pattern',
  puzzleSubtype: 'grid',
  difficultyLevel: 'medium' as const
};

const mockInvalidPuzzle = {
  question: '',
  options: ['A'],
  correctAnswerIndex: 5,
  explanation: '',
  puzzleType: 'invalid',
  puzzleSubtype: 'test',
  difficultyLevel: 'medium' as const
};

// Mock generator for testing base class
class MockPuzzleGenerator extends BasePuzzleGenerator<BasePuzzle> {
  staticPuzzles: BasePuzzle[] = [
    {
      question: 'Test puzzle 1',
      options: ['A', 'B', 'C', 'D'],
      correctAnswerIndex: 0,
      explanation: 'Test explanation 1'
    },
    {
      question: 'Test puzzle 2',
      options: ['W', 'X', 'Y', 'Z'],
      correctAnswerIndex: 1,
      explanation: 'Test explanation 2'
    }
  ];

  getRandom(): BasePuzzle {
    const index = Math.floor(Math.random() * this.staticPuzzles.length);
    return this.staticPuzzles[index];
  }
}

describe('PuzzleValidator', () => {
  describe('validatePuzzle', () => {
    it('should validate a correct puzzle', () => {
      expect(PuzzleValidator.validatePuzzle(mockPatternPuzzle)).toBe(true);
    });

    it('should reject puzzle with invalid question', () => {
      const invalidPuzzle = { ...mockPatternPuzzle, question: null };
      expect(PuzzleValidator.validatePuzzle(invalidPuzzle)).toBe(false);
    });

    it('should reject puzzle with empty options', () => {
      const invalidPuzzle = { ...mockPatternPuzzle, options: [] };
      expect(PuzzleValidator.validatePuzzle(invalidPuzzle)).toBe(false);
    });

    it('should reject puzzle with invalid correctAnswerIndex', () => {
      const invalidPuzzle = { ...mockPatternPuzzle, correctAnswerIndex: 5 };
      expect(PuzzleValidator.validatePuzzle(invalidPuzzle)).toBe(false);
    });

    it('should reject puzzle with negative correctAnswerIndex', () => {
      const invalidPuzzle = { ...mockPatternPuzzle, correctAnswerIndex: -1 };
      expect(PuzzleValidator.validatePuzzle(invalidPuzzle)).toBe(false);
    });

    it('should reject puzzle with invalid explanation', () => {
      const invalidPuzzle = { ...mockPatternPuzzle, explanation: null };
      expect(PuzzleValidator.validatePuzzle(invalidPuzzle)).toBe(false);
    });

    it('should validate puzzle with grid property', () => {
      const puzzleWithGrid = {
        ...mockPatternPuzzle,
        grid: [['A', 'B'], ['C', '?']]
      };
      expect(PuzzleValidator.validatePuzzle(puzzleWithGrid)).toBe(true);
    });

    it('should reject puzzle with invalid grid structure', () => {
      const puzzleWithInvalidGrid = {
        ...mockPatternPuzzle,
        grid: 'invalid'
      };
      expect(PuzzleValidator.validatePuzzle(puzzleWithInvalidGrid)).toBe(false);
    });
  });

  describe('validateGenerator', () => {
    it('should validate a correct generator', () => {
      const generator = new MockPuzzleGenerator();
      expect(PuzzleValidator.validateGenerator(generator)).toBe(true);
    });

    it('should reject generator without staticPuzzles', () => {
      const invalidGenerator = {
        getNext: () => mockPatternPuzzle,
        getRandom: () => mockPatternPuzzle,
        getStaticCount: () => 1
      };
      expect(PuzzleValidator.validateBasePuzzleGenerator(invalidGenerator)).toBe(false);
    });

    it('should reject generator without required methods', () => {
      const invalidGenerator = { staticPuzzles: [] };
      expect(PuzzleValidator.validateGenerator(invalidGenerator)).toBe(false);
    });
  });
});

describe('ExplanationGenerator', () => {
  describe('generatePatternExplanation', () => {
    it('should generate row-shift explanation', () => {
      const explanation = ExplanationGenerator.generatePatternExplanation('row-shift');
      expect(explanation).toBe('Each row is a left rotation of the previous row.');
    });

    it('should generate arithmetic explanation with details', () => {
      const explanation = ExplanationGenerator.generatePatternExplanation('arithmetic', { 
        step: 2, 
        direction: 'row' 
      });
      expect(explanation).toBe('Numbers increase by 2 in each row.');
    });

    it('should generate default explanation for unknown pattern', () => {
      const explanation = ExplanationGenerator.generatePatternExplanation('unknown');
      expect(explanation).toBe('Pattern follows unknown logic.');
    });
  });

  describe('generateAnalogyExplanation', () => {
    it('should generate opposite relationship explanation', () => {
      const explanation = ExplanationGenerator.generateAnalogyExplanation('opposite');
      expect(explanation).toBe('The relationship is based on opposites or antonyms.');
    });

    it('should generate transformation explanation with details', () => {
      const explanation = ExplanationGenerator.generateAnalogyExplanation('transformation', {
        transformation: 'capitalization'
      });
      expect(explanation).toBe('The first item transforms to the second by capitalization.');
    });

    it('should generate default explanation for unknown relationship', () => {
      const explanation = ExplanationGenerator.generateAnalogyExplanation('unknown');
      expect(explanation).toBe('The relationship follows unknown logic.');
    });
  });

  describe('generateMatrixExplanation', () => {
    it('should generate numeric explanation with row pattern', () => {
      const explanation = ExplanationGenerator.generateMatrixExplanation('numeric', { 
        isRowPattern: true, 
        step: 3 
      });
      expect(explanation).toBe('Rows increase by 3. Columns follow the same pattern.');
    });

    it('should generate symbolic explanation with shift', () => {
      const explanation = ExplanationGenerator.generateMatrixExplanation('symbolic', { 
        isShift: true 
      });
      expect(explanation).toBe('Each row is a shift of the previous row.');
    });

    it('should generate shape explanation with transformation', () => {
      const explanation = ExplanationGenerator.generateMatrixExplanation('shape', { 
        transformation: 'rotation 90 degrees' 
      });
      expect(explanation).toBe('Shapes transform according to: rotation 90 degrees');
    });

    it('should generate default explanation', () => {
      const explanation = ExplanationGenerator.generateMatrixExplanation('numeric');
      expect(explanation).toBe('Each position follows a mathematical progression with step value.');
    });
  });
});

describe('BasePuzzleGenerator', () => {
  let generator: MockPuzzleGenerator;

  beforeEach(() => {
    generator = new MockPuzzleGenerator();
  });

  describe('getNext', () => {
    it('should return puzzles in rotation order', () => {
      const first = generator.getNext();
      const second = generator.getNext();
      const third = generator.getNext(); // Should wrap to first

      expect(first.question).toBe('Test puzzle 1');
      expect(second.question).toBe('Test puzzle 2');
      expect(third.question).toBe('Test puzzle 1'); // Wrapped around
    });
  });

  describe('getStaticCount', () => {
    it('should return correct count of static puzzles', () => {
      expect(generator.getStaticCount()).toBe(2);
    });
  });

  describe('resetRotation', () => {
    it('should reset rotation index to 0', () => {
      generator.getNext(); // Move to index 1
      generator.resetRotation();
      const puzzle = generator.getNext();
      expect(puzzle.question).toBe('Test puzzle 1');
    });
  });

  describe('getRandom', () => {
    it('should return a valid puzzle', () => {
      const puzzle = generator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
    });

    it('should return puzzles from static collection', () => {
      const puzzle = generator.getRandom();
      const questions = generator.staticPuzzles.map(p => p.question);
      expect(questions).toContain(puzzle.question);
    });
  });

  describe('Static methods', () => {
    it('should generate matrix explanation for default case', () => {
      // Test the default case in generateMatrixExplanation
      // @ts-ignore - Testing with invalid type to hit default case
      const explanation = ExplanationGenerator.generateMatrixExplanation('invalid');
      expect(explanation).toBe('The matrix follows a logical pattern that can be determined by analyzing rows and columns.');
    });

    it('should generate matrix explanation for all valid types', () => {
      const numericExplanation = ExplanationGenerator.generateMatrixExplanation('numeric');
      expect(numericExplanation).toContain('mathematical progression');
      
      const symbolicExplanation = ExplanationGenerator.generateMatrixExplanation('symbolic');
      expect(symbolicExplanation).toContain('pattern');
      
      const shapeExplanation = ExplanationGenerator.generateMatrixExplanation('shape');
      expect(shapeExplanation).toContain('transformation');
    });
  });
});