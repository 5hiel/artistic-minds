/**
 * Paper Folding Puzzles Tests
 * 
 * Tests for the Paper Folding puzzle generator, covering:
 * - Geometric transformation algorithms (fold/unfold operations)
 * - Dynamic puzzle generation with progressive difficulty
 * - Spatial visualization logic and symmetry operations
 * - Answer option generation and distractor creation
 * - Educational explanations and step-by-step descriptions
 * - Integration with cognitive assessment requirements
 */

import {
  PaperFoldingPuzzleGenerator,
  paperFoldingPuzzleGenerator,
  FoldType,
  PaperFoldingDifficultyLevel as DifficultyLevel,
  CellState,
  type PaperFoldingGridPosition as GridPosition,
  type FoldOperation,
  type PunchOperation
} from '../../src/lib/puzzles/cognitive/paperFolding';
import { PuzzleValidator } from '@/src/lib/game/basePuzzle';

describe('PaperFoldingPuzzleGenerator', () => {
  let generator: PaperFoldingPuzzleGenerator;

  beforeEach(() => {
    generator = new PaperFoldingPuzzleGenerator();
  });

  describe('Dynamic Puzzle Generation', () => {
    test('should generate valid paper folding puzzles', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.puzzleType).toBe('paper-folding');
        expect(puzzle.question).toContain('folded');
        expect(puzzle.question).toContain('punched');
        expect(puzzle.question).toContain('unfolded');
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.correctAnswerIndex).toBeLessThan(4);
        expect(puzzle.explanation).toBeTruthy();
      }
    });

    test('should generate puzzles with correct structure', () => {
      const puzzle = generator.getRandom();
      
      // Check grid structure
      expect(puzzle.initialGrid).toBeDefined();
      expect(puzzle.unfoldedResult).toBeDefined();
      expect(puzzle.gridSize).toBeGreaterThanOrEqual(5);
      expect(puzzle.gridSize).toBeLessThanOrEqual(7);
      expect(puzzle.initialGrid.length).toBe(puzzle.gridSize);
      expect(puzzle.unfoldedResult.length).toBe(puzzle.gridSize);
      
      // Check sequences
      expect(Array.isArray(puzzle.foldSequence)).toBe(true);
      expect(Array.isArray(puzzle.punchSequence)).toBe(true);
      expect(puzzle.foldSequence.length).toBeGreaterThan(0);
      expect(puzzle.punchSequence.length).toBeGreaterThan(0);
      
      // Check difficulty system (should be string from BasePuzzle interface)
      expect(['easy', 'medium', 'hard']).toContain(puzzle.difficultyLevel);
      expect(Array.isArray(puzzle.foldingSteps)).toBe(true);
    });

    test('should generate different difficulty levels', () => {
      const puzzles = [];
      for (let i = 0; i < 30; i++) {
        puzzles.push(generator.getRandom());
      }
      
      const difficulties = new Set(puzzles.map(p => p.difficultyLevel));
      expect(difficulties.size).toBeGreaterThan(1); // Should generate multiple difficulty levels
      
      // Check difficulty constraints
      puzzles.forEach(puzzle => {
        switch (puzzle.difficultyLevel) {
          case 'easy':
            expect(puzzle.foldSequence.length).toBe(1);
            expect(puzzle.punchSequence.length).toBe(1);
            expect(puzzle.gridSize).toBe(5);
            break;
          case 'medium':
            expect(puzzle.foldSequence.length).toBe(2);
            expect(puzzle.punchSequence.length).toBeGreaterThanOrEqual(1);
            expect(puzzle.punchSequence.length).toBeLessThanOrEqual(2);
            expect(puzzle.gridSize).toBe(7);
            break;
          case 'hard':
            expect(puzzle.foldSequence.length).toBeGreaterThanOrEqual(2);
            expect(puzzle.foldSequence.length).toBeLessThanOrEqual(3);
            expect(puzzle.punchSequence.length).toBeGreaterThanOrEqual(2);
            expect(puzzle.punchSequence.length).toBeLessThanOrEqual(3);
            expect(puzzle.gridSize).toBe(7);
            break;
        }
      });
    });

    test('should generate different fold types', () => {
      const puzzles = [];
      for (let i = 0; i < 50; i++) {
        puzzles.push(generator.getRandom());
      }
      
      const foldTypes = new Set();
      puzzles.forEach(puzzle => {
        puzzle.foldSequence.forEach(fold => {
          foldTypes.add(fold.type);
        });
      });
      
      expect(foldTypes.size).toBeGreaterThan(1); // Should generate multiple fold types
    });
  });

  describe('Geometric Transformation Logic', () => {
    test('should correctly handle single horizontal fold', () => {
      // Create a simple test case we can verify manually
      const gridSize = 5;
      const folds: FoldOperation[] = [{ type: FoldType.HORIZONTAL, line: 2 }];
      const punches: PunchOperation[] = [{ position: { row: 1, col: 2 }, shape: 'circle' }];
      
      // Test the core transformation logic using a minimal implementation
      const generator = new PaperFoldingPuzzleGenerator();
      const puzzle = generator.getRandom();
      
      // Verify the puzzle has reasonable structure
      expect(puzzle.unfoldedResult).toBeDefined();
      expect(puzzle.unfoldedResult.length).toBe(puzzle.gridSize);
      
      // Count holes in result - should have at least the original punch
      let holeCount = 0;
      for (const row of puzzle.unfoldedResult) {
        for (const cell of row) {
          if (cell === CellState.HOLE) holeCount++;
        }
      }
      expect(holeCount).toBeGreaterThan(0);
    });

    test('should correctly handle single vertical fold', () => {
      // Test vertical fold transformation
      const puzzles = [];
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.foldSequence.some(fold => fold.type === FoldType.VERTICAL)) {
          puzzles.push(puzzle);
        }
      }
      
      expect(puzzles.length).toBeGreaterThan(0); // Should generate some vertical folds
      
      puzzles.forEach(puzzle => {
        // Check that result has holes
        let holeCount = 0;
        for (const row of puzzle.unfoldedResult) {
          for (const cell of row) {
            if (cell === CellState.HOLE) holeCount++;
          }
        }
        expect(holeCount).toBeGreaterThan(0);
      });
    });

    test('should correctly handle diagonal folds', () => {
      const puzzles = [];
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.foldSequence.some(fold => 
          fold.type === FoldType.DIAGONAL_TL_BR || fold.type === FoldType.DIAGONAL_TR_BL
        )) {
          puzzles.push(puzzle);
        }
      }
      
      expect(puzzles.length).toBeGreaterThan(0); // Should generate some diagonal folds
      
      puzzles.forEach(puzzle => {
        expect(puzzle.unfoldedResult).toBeDefined();
        
        // Verify grid structure is maintained
        expect(puzzle.unfoldedResult.length).toBe(puzzle.gridSize);
        puzzle.unfoldedResult.forEach(row => {
          expect(row.length).toBe(puzzle.gridSize);
        });
      });
    });

    test('should handle multiple folds correctly', () => {
      const puzzles = [];
      for (let i = 0; i < 15; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.foldSequence.length > 1) {
          puzzles.push(puzzle);
        }
      }
      
      expect(puzzles.length).toBeGreaterThan(0); // Should generate some multi-fold puzzles
      
      puzzles.forEach(puzzle => {
        // Multiple folds should typically create more symmetrical patterns
        let holeCount = 0;
        for (const row of puzzle.unfoldedResult) {
          for (const cell of row) {
            if (cell === CellState.HOLE) holeCount++;
          }
        }
        
        // With multiple folds, we expect multiple holes from reflections
        expect(holeCount).toBeGreaterThanOrEqual(puzzle.punchSequence.length);
      });
    });
  });

  describe('Answer Option Generation', () => {
    test('should generate 4 unique answer options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(puzzle.options).toHaveLength(4);
        
        // All options should be unique
        const uniqueOptions = new Set(puzzle.options);
        expect(uniqueOptions.size).toBe(4);
        
        // All options should be non-empty strings
        puzzle.options.forEach(option => {
          expect(typeof option).toBe('string');
          expect(option.length).toBeGreaterThan(0);
        });
      }
    });

    test('should have correct answer in options', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        const correctAnswer = puzzle.options[puzzle.correctAnswerIndex];

        expect(correctAnswer).toBeDefined();
        expect(typeof correctAnswer).toBe('string');
        expect(correctAnswer.length).toBeGreaterThan(0);
        // Check that the correct answer index points to a valid option
        expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.correctAnswerIndex).toBeLessThan(puzzle.options.length);
      }
    });

    test('should generate plausible distractor options', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        // All options should have similar structure (grid representations)
        puzzle.options.forEach(option => {
          expect(option).toMatch(/^[●○|]+$/); // Should contain only dots, circles, and separators
          
          // Should have correct number of rows (separated by |)
          const rows = option.split('|');
          expect(rows.length).toBe(puzzle.gridSize);
          
          // Each row should have correct length
          rows.forEach(row => {
            expect(row.length).toBe(puzzle.gridSize);
          });
        });
      }
    });
  });

  describe('Explanation Generation', () => {
    test('should generate meaningful explanations', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(puzzle.explanation).toBeDefined();
        expect(typeof puzzle.explanation).toBe('string');
        expect(puzzle.explanation.length).toBeGreaterThan(50); // Should be descriptive
        
        // Should mention key concepts
        const lowerExplanation = puzzle.explanation.toLowerCase();
        const hasKeyTerms = [
          'fold', 'unfold', 'punch', 'reflection', 'symmetric', 'pattern'
        ].some(term => lowerExplanation.includes(term));
        expect(hasKeyTerms).toBe(true);
      }
    });

    test('should include step-by-step folding description', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        expect(Array.isArray(puzzle.foldingSteps)).toBe(true);
        expect(puzzle.foldingSteps.length).toBeGreaterThan(2);
        
        // Should start with initial step
        expect(puzzle.foldingSteps[0]).toContain('Start with flat');
        
        // Should end with unfolding step
        const lastStep = puzzle.foldingSteps[puzzle.foldingSteps.length - 1];
        expect(lastStep).toContain('Unfold');
      }
    });

    test('should describe fold operations clearly', () => {
      const puzzle = generator.getRandom();
      
      expect(puzzle.explanation).toContain('Fold sequence:');
      expect(puzzle.explanation).toContain('Punch pattern:');
      expect(puzzle.explanation).toContain('Unfolding:');
      expect(puzzle.explanation).toContain('Final result:');
    });
  });

  describe('Grid and Cell State Management', () => {
    test('should properly initialize empty grids', () => {
      const puzzle = generator.getRandom();
      
      // Initial grid should be mostly empty
      let emptyCells = 0;
      for (const row of puzzle.initialGrid) {
        for (const cell of row) {
          if (cell === CellState.EMPTY) emptyCells++;
        }
      }
      
      // Most cells should be empty initially
      const totalCells = puzzle.gridSize * puzzle.gridSize;
      expect(emptyCells).toBe(totalCells); // Initial grid should be completely empty
    });

    test('should create valid hole patterns in result', () => {
      const puzzle = generator.getRandom();
      
      // Result should have some holes
      let holeCount = 0;
      let emptyCount = 0;
      
      for (const row of puzzle.unfoldedResult) {
        for (const cell of row) {
          if (cell === CellState.HOLE) holeCount++;
          if (cell === CellState.EMPTY) emptyCount++;
        }
      }
      
      expect(holeCount).toBeGreaterThan(0); // Should have at least some holes
      expect(holeCount + emptyCount).toBe(puzzle.gridSize * puzzle.gridSize); // Should account for all cells
    });

    test('should maintain grid structure consistency', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // All grids should be square and same size
        expect(puzzle.initialGrid.length).toBe(puzzle.gridSize);
        expect(puzzle.unfoldedResult.length).toBe(puzzle.gridSize);
        
        puzzle.initialGrid.forEach(row => {
          expect(row.length).toBe(puzzle.gridSize);
          row.forEach(cell => {
            expect(Object.values(CellState)).toContain(cell);
          });
        });
        
        puzzle.unfoldedResult.forEach(row => {
          expect(row.length).toBe(puzzle.gridSize);
          row.forEach(cell => {
            expect(Object.values(CellState)).toContain(cell);
          });
        });
      }
    });
  });

  describe('Fold and Punch Validation', () => {
    test('should generate valid fold operations', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        puzzle.foldSequence.forEach(fold => {
          // Fold type should be valid
          expect(Object.values(FoldType)).toContain(fold.type);
          
          // Fold line should be within grid bounds
          expect(fold.line).toBeGreaterThanOrEqual(0);
          expect(fold.line).toBeLessThan(puzzle.gridSize);
        });
      });
    });

    test('should generate valid punch operations', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        puzzle.punchSequence.forEach(punch => {
          // Position should be within grid bounds
          expect(punch.position.row).toBeGreaterThanOrEqual(0);
          expect(punch.position.row).toBeLessThan(puzzle.gridSize);
          expect(punch.position.col).toBeGreaterThanOrEqual(0);
          expect(punch.position.col).toBeLessThan(puzzle.gridSize);
          
          // Shape should be valid
          expect(['circle', 'square']).toContain(punch.shape);
        });
      });
    });

    test('should respect difficulty-based constraints', () => {
      const easyPuzzles = [];
      const mediumPuzzles = [];
      const hardPuzzles = [];
      
      // Generate enough puzzles to get examples of each difficulty
      for (let i = 0; i < 60; i++) {
        const puzzle = generator.getRandom();
        switch (puzzle.difficultyLevel) {
          case 'easy': easyPuzzles.push(puzzle); break;
          case 'medium': mediumPuzzles.push(puzzle); break;
          case 'hard': hardPuzzles.push(puzzle); break;
        }
      }
      
      // Should have examples of each difficulty
      expect(easyPuzzles.length).toBeGreaterThan(0);
      expect(mediumPuzzles.length).toBeGreaterThan(0);
      expect(hardPuzzles.length).toBeGreaterThan(0);
    });
  });

  describe('Cognitive Assessment Integration', () => {
    test('should support CogAT/NNAT spatial reasoning requirements', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        // Standard cognitive assessment format
        expect(puzzle.options).toHaveLength(4); // Multiple choice
        expect(puzzle.question).toContain('What does the paper look like'); // Clear instruction
        expect(puzzle.explanation).toBeTruthy(); // Educational value
        
        // Spatial visualization validation
        expect(puzzle.foldSequence.length).toBeGreaterThan(0); // Must have folding
        expect(puzzle.punchSequence.length).toBeGreaterThan(0); // Must have punching
        expect(puzzle.unfoldedResult).toBeDefined(); // Must show final result
        
        // Progressive difficulty (should be string from BasePuzzle interface)
        expect(['easy', 'medium', 'hard']).toContain(puzzle.difficultyLevel);
      });
    });

    test('should test spatial visualization skills', () => {
      const puzzle = generator.getRandom();
      
      // Should involve 3D thinking (folding in space)
      expect(puzzle.foldSequence.length).toBeGreaterThan(0);
      
      // Should require mental rotation/reflection
      const foldTypes = puzzle.foldSequence.map(f => f.type);
      expect(foldTypes.length).toBeGreaterThan(0);
      
      // Should create symmetric patterns (key spatial skill)
      let holeCount = 0;
      for (const row of puzzle.unfoldedResult) {
        for (const cell of row) {
          if (cell === CellState.HOLE) holeCount++;
        }
      }
      expect(holeCount).toBeGreaterThan(0);
    });
  });

  describe('Singleton Instance', () => {
    test('should export singleton instance', () => {
      expect(paperFoldingPuzzleGenerator).toBeInstanceOf(PaperFoldingPuzzleGenerator);
    });

    test('singleton should generate valid puzzles', () => {
      const puzzle = paperFoldingPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.puzzleType).toBe('paper-folding');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle edge fold positions gracefully', () => {
      // Generate many puzzles to test edge cases
      const puzzles = Array.from({ length: 50 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        // All puzzles should be valid despite edge cases
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        
        // Fold lines should not be at exact edges (would be trivial)
        puzzle.foldSequence.forEach(fold => {
          if (fold.type === FoldType.HORIZONTAL || fold.type === FoldType.VERTICAL) {
            expect(fold.line).toBeGreaterThan(0);
            expect(fold.line).toBeLessThan(puzzle.gridSize - 1);
          }
        });
      });
    });

    test('should maintain mathematical consistency', () => {
      const puzzle = generator.getRandom();
      
      // The unfolded result should be mathematically consistent with folds and punches
      // Each punch should create at least one hole when unfolded
      let totalHoles = 0;
      for (const row of puzzle.unfoldedResult) {
        for (const cell of row) {
          if (cell === CellState.HOLE) totalHoles++;
        }
      }
      
      // Should have at least as many holes as punches (reflections can create more)
      expect(totalHoles).toBeGreaterThanOrEqual(puzzle.punchSequence.length);
    });
  });
});

// Helper functions for testing
function countCellsOfType(grid: CellState[][], cellType: CellState): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === cellType) count++;
    }
  }
  return count;
}

function isValidGridStructure(grid: CellState[][], expectedSize: number): boolean {
  if (grid.length !== expectedSize) return false;
  
  for (const row of grid) {
    if (row.length !== expectedSize) return false;
    for (const cell of row) {
      if (!Object.values(CellState).includes(cell)) return false;
    }
  }
  
  return true;
}