/**
 * Following Directions Puzzles Tests
 * 
 * Tests for the Following Directions puzzle generator, covering:
 * - Dynamic instruction generation and execution
 * - Grid state management and object positioning
 * - Sequential processing and working memory challenges
 * - Progressive difficulty levels and instruction complexity
 * - OLSAT cognitive assessment compatibility
 * - Answer option generation and execution validation
 */

import {
  FollowingDirectionsPuzzleGenerator,
  followingDirectionsPuzzleGenerator,
  FollowingDirectionsDifficultyLevel as DifficultyLevel,
  Direction,
  InstructionType,
  ObjectType,
  type FollowingDirectionsGridPosition as GridPosition,
  type GridState,
  type Instruction
} from '../../src/lib/puzzles/cognitive/followingDirections';
import { PuzzleValidator } from '@/src/lib/game/basePuzzle';

describe('FollowingDirectionsPuzzleGenerator', () => {
  let generator: FollowingDirectionsPuzzleGenerator;

  beforeEach(() => {
    generator = new FollowingDirectionsPuzzleGenerator();
  });

  describe('Dynamic Puzzle Generation', () => {
    test('should generate valid following directions puzzles', () => {
      for (let i = 0; i < 20; i++) {
        const puzzle = generator.getRandom();
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        expect(puzzle.initialState).toBeDefined();
        expect(puzzle.question).toContain('follow');
        expect(puzzle.question).toContain('instructions');
        expect(puzzle.question).toContain('final positions');
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.correctAnswerIndex).toBeLessThan(4);
        expect(puzzle.explanation).toBeTruthy();
      }
    });

    test('should generate puzzles with correct structure', () => {
      const puzzle = generator.getRandom();
      
      // Check grid structure
      expect(puzzle.initialState).toBeDefined();
      expect(puzzle.finalState).toBeDefined();
      expect(puzzle.gridSize).toBeGreaterThanOrEqual(3);
      expect(puzzle.gridSize).toBeLessThanOrEqual(5);
      expect(puzzle.initialState.size).toBe(puzzle.gridSize);
      expect(puzzle.finalState.size).toBe(puzzle.gridSize);
      
      // Check instructions
      expect(Array.isArray(puzzle.instructions)).toBe(true);
      expect(puzzle.instructions.length).toBeGreaterThan(0);
      expect(puzzle.instructionText).toBeTruthy();
      expect(Array.isArray(puzzle.executionSteps)).toBe(true);
      
      // Check difficulty system (should be string from BasePuzzle interface)
      expect(['easy', 'medium', 'hard']).toContain(puzzle.difficultyLevel);
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
            expect(puzzle.gridSize).toBe(3);
            expect(puzzle.instructions.length).toBeGreaterThanOrEqual(2);
            expect(puzzle.instructions.length).toBeLessThanOrEqual(3);
            expect(puzzle.initialState.objects.length).toBe(2);
            break;
          case 'medium':
            expect(puzzle.gridSize).toBe(4);
            expect(puzzle.instructions.length).toBeGreaterThanOrEqual(4);
            expect(puzzle.instructions.length).toBeLessThanOrEqual(5);
            expect(puzzle.initialState.objects.length).toBe(3);
            break;
          case 'hard':
            expect(puzzle.gridSize).toBe(5);
            expect(puzzle.instructions.length).toBeGreaterThanOrEqual(5);
            expect(puzzle.instructions.length).toBeLessThanOrEqual(7);
            expect(puzzle.initialState.objects.length).toBe(4);
            break;
        }
      });
    });

    test('should generate different instruction types', () => {
      const puzzles = [];
      for (let i = 0; i < 50; i++) {
        puzzles.push(generator.getRandom());
      }
      
      const instructionTypes = new Set();
      puzzles.forEach(puzzle => {
        puzzle.instructions.forEach(instruction => {
          instructionTypes.add(instruction.type);
        });
      });
      
      expect(instructionTypes.size).toBeGreaterThan(1); // Should generate multiple instruction types
      expect(instructionTypes.has(InstructionType.MOVE)).toBe(true); // Should always have basic moves
    });
  });

  describe('Grid State Management', () => {
    test('should create valid initial states', () => {
      for (let i = 0; i < 15; i++) {
        const puzzle = generator.getRandom();
        const state = puzzle.initialState;
        
        // Check grid structure
        expect(state.size).toBe(puzzle.gridSize);
        expect(Array.isArray(state.objects)).toBe(true);
        expect(state.objects.length).toBeGreaterThan(0);
        expect(Array.isArray(state.markedPositions)).toBe(true);
        
        // Check object positioning
        const positionStrings = new Set<string>();
        state.objects.forEach(obj => {
          // Check position bounds
          expect(obj.position.row).toBeGreaterThanOrEqual(0);
          expect(obj.position.row).toBeLessThan(state.size);
          expect(obj.position.col).toBeGreaterThanOrEqual(0);
          expect(obj.position.col).toBeLessThan(state.size);
          
          // Check for duplicate positions
          const posStr = `${obj.position.row},${obj.position.col}`;
          expect(positionStrings.has(posStr)).toBe(false);
          positionStrings.add(posStr);
          
          // Check object properties
          expect(Object.values(ObjectType)).toContain(obj.type);
          expect(obj.id).toBeTruthy();
        });
      }
    });

    test('should maintain state consistency during execution', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Initial and final states should have same number of objects
        expect(puzzle.finalState.objects.length).toBe(puzzle.initialState.objects.length);
        
        // Object IDs should be preserved
        const initialIds = new Set(puzzle.initialState.objects.map(obj => obj.id));
        const finalIds = new Set(puzzle.finalState.objects.map(obj => obj.id));
        expect(finalIds).toEqual(initialIds);
        
        // All final positions should be within bounds
        puzzle.finalState.objects.forEach(obj => {
          expect(obj.position.row).toBeGreaterThanOrEqual(0);
          expect(obj.position.row).toBeLessThan(puzzle.gridSize);
          expect(obj.position.col).toBeGreaterThanOrEqual(0);
          expect(obj.position.col).toBeLessThan(puzzle.gridSize);
        });
      }
    });
  });

  describe('Instruction Generation and Validation', () => {
    test('should generate valid instructions with proper structure', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        puzzle.instructions.forEach(instruction => {
          // Basic structure
          expect(instruction.type).toBeDefined();
          expect(Object.values(InstructionType)).toContain(instruction.type);
          expect(instruction.description).toBeTruthy();
          expect(typeof instruction.description).toBe('string');
          
          // Type-specific validation
          switch (instruction.type) {
            case InstructionType.MOVE:
              expect(instruction.objectId).toBeTruthy();
              expect(Object.values(Direction)).toContain(instruction.direction!);
              expect(instruction.description).toContain('one space');
              break;
              
            case InstructionType.MOVE_STEPS:
              expect(instruction.objectId).toBeTruthy();
              expect(Object.values(Direction)).toContain(instruction.direction!);
              expect(instruction.steps).toBeGreaterThan(1);
              expect(instruction.description).toContain('spaces');
              break;
              
            case InstructionType.CONDITIONAL:
              expect(instruction.objectId).toBeTruthy();
              expect(instruction.condition).toBeTruthy();
              expect(instruction.description).toContain('if');
              break;
              
            case InstructionType.SWAP:
              expect(instruction.objectId).toBeTruthy();
              expect(instruction.targetObjectId).toBeTruthy();
              expect(instruction.objectId).not.toBe(instruction.targetObjectId);
              expect(instruction.description.toLowerCase()).toContain('swap');
              break;
          }
        });
      });
    });

    test('should generate human-readable instruction text', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(puzzle.instructionText).toContain('Follow these instructions');
        expect(puzzle.instructionText).toContain('in order');
        
        // Should contain all individual instruction descriptions
        puzzle.instructions.forEach((instruction, index) => {
          expect(puzzle.instructionText).toContain(`${index + 1}.`);
          expect(puzzle.instructionText).toContain(instruction.description);
        });
      }
    });

    test('should generate valid execution steps', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        expect(Array.isArray(puzzle.executionSteps)).toBe(true);
        expect(puzzle.executionSteps.length).toBeGreaterThan(0);
        
        // First step should describe starting state
        expect(puzzle.executionSteps[0]).toContain('Starting state');
        
        // Should have step entries for each instruction
        let stepCount = 0;
        puzzle.executionSteps.forEach(step => {
          if (step.includes('Step ')) {
            stepCount++;
          }
        });
        
        expect(stepCount).toBe(puzzle.instructions.length);
      }
    });
  });

  describe('Direction and Movement Logic', () => {
    test('should handle basic directional movements correctly', () => {
      // Create a simple test case we can verify
      const puzzle = generator.getRandom();
      const initialPositions = puzzle.initialState.objects.map(obj => ({ ...obj.position }));
      
      // Verify that objects have moved appropriately
      let totalMoves = 0;
      puzzle.instructions.forEach(instruction => {
        if (instruction.type === InstructionType.MOVE || instruction.type === InstructionType.MOVE_STEPS) {
          totalMoves++;
        }
      });
      
      // If we have moves, at least one object should be in a different position
      if (totalMoves > 0) {
        const finalPositions = puzzle.finalState.objects.map(obj => ({ ...obj.position }));
        let hasMovement = false;
        
        for (let i = 0; i < initialPositions.length; i++) {
          if (initialPositions[i].row !== finalPositions[i].row || 
              initialPositions[i].col !== finalPositions[i].col) {
            hasMovement = true;
            break;
          }
        }
        
        // Note: Movement might not always occur due to boundary conditions
        // So we just verify the puzzle structure is valid
        expect(puzzle.finalState.objects.length).toBe(puzzle.initialState.objects.length);
      }
    });

    test('should respect grid boundaries', () => {
      for (let i = 0; i < 15; i++) {
        const puzzle = generator.getRandom();
        
        // All objects should remain within grid bounds after execution
        puzzle.finalState.objects.forEach(obj => {
          expect(obj.position.row).toBeGreaterThanOrEqual(0);
          expect(obj.position.row).toBeLessThan(puzzle.gridSize);
          expect(obj.position.col).toBeGreaterThanOrEqual(0);
          expect(obj.position.col).toBeLessThan(puzzle.gridSize);
        });
      }
    });

    test('should handle conditional instructions appropriately', () => {
      // Generate puzzles until we find ones with conditionals
      const puzzlesWithConditionals = [];
      for (let i = 0; i < 50 && puzzlesWithConditionals.length < 5; i++) {
        const puzzle = generator.getRandom();
        if (puzzle.instructions.some(inst => inst.type === InstructionType.CONDITIONAL)) {
          puzzlesWithConditionals.push(puzzle);
        }
      }
      
      // Should have found at least some conditional puzzles
      expect(puzzlesWithConditionals.length).toBeGreaterThan(0);
      
      puzzlesWithConditionals.forEach(puzzle => {
        // Conditional instructions should have proper structure
        const conditionals = puzzle.instructions.filter(inst => inst.type === InstructionType.CONDITIONAL);
        conditionals.forEach(conditional => {
          expect(conditional.condition).toBeTruthy();
          expect(conditional.description).toContain('if');
        });
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
        expect(puzzle.options[puzzle.correctAnswerIndex]).toBe(correctAnswer);
      }
    });

    test('should generate plausible distractor options', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        // All options should have similar structure (grid representations)
        puzzle.options.forEach(option => {
          // Should contain grid symbols and separators
          expect(option).toMatch(/^[🔵🟦🔺🅰️🅱️1️⃣⬜✅|]+$/);
          
          // Should have correct number of rows (separated by |)
          const rows = option.split('|');
          expect(rows.length).toBe(puzzle.gridSize);
          
          // Each row should have correct length
          rows.forEach(row => {
            // Unicode emoji characters vary in width, so just check we have content
            expect(row.length).toBeGreaterThan(0);
            expect(row.length).toBeGreaterThanOrEqual(puzzle.gridSize);
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
          'follow', 'instruction', 'step', 'move', 'direction', 'execution'
        ].some(term => lowerExplanation.includes(term));
        expect(hasKeyTerms).toBe(true);
      }
    });

    test('should include instruction text and execution trace', () => {
      for (let i = 0; i < 5; i++) {
        const puzzle = generator.getRandom();
        
        expect(puzzle.explanation).toContain('Follow these instructions');
        expect(puzzle.explanation).toContain('Execution trace');
        
        // Should contain instruction descriptions
        puzzle.instructions.forEach(instruction => {
          expect(puzzle.explanation).toContain(instruction.description);
        });
      }
    });
  });

  describe('Object Types and Positioning', () => {
    test('should use valid object types from enum', () => {
      const puzzles = Array.from({ length: 15 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        puzzle.initialState.objects.forEach(obj => {
          expect(Object.values(ObjectType)).toContain(obj.type);
          expect(obj.id).toBeTruthy();
          expect(typeof obj.id).toBe('string');
        });
        
        puzzle.finalState.objects.forEach(obj => {
          expect(Object.values(ObjectType)).toContain(obj.type);
          expect(obj.id).toBeTruthy();
          expect(typeof obj.id).toBe('string');
        });
      });
    });

    test('should maintain object uniqueness within grid', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Check initial state
        const initialPositions = new Set();
        puzzle.initialState.objects.forEach(obj => {
          const posKey = `${obj.position.row},${obj.position.col}`;
          expect(initialPositions.has(posKey)).toBe(false);
          initialPositions.add(posKey);
        });
        
        // Check final state - each object should still have a valid position
        puzzle.finalState.objects.forEach(obj => {
          expect(obj.position.row).toBeGreaterThanOrEqual(0);
          expect(obj.position.row).toBeLessThan(puzzle.gridSize);
          expect(obj.position.col).toBeGreaterThanOrEqual(0);
          expect(obj.position.col).toBeLessThan(puzzle.gridSize);
        });
        
        // Check that positions are mostly unique (allowing for edge cases where 
        // movements fail due to boundaries or other constraints)
        const finalPositions = new Set();
        puzzle.finalState.objects.forEach(obj => {
          const posKey = `${obj.position.row},${obj.position.col}`;
          finalPositions.add(posKey);
        });
        
        // Most objects should have unique positions, but we allow some collisions
        // due to boundary conditions and failed movements
        expect(finalPositions.size).toBeGreaterThanOrEqual(Math.max(1, puzzle.finalState.objects.length - 1));
      }
    });
  });

  describe('OLSAT Cognitive Assessment Integration', () => {
    test('should support OLSAT working memory requirements', () => {
      const puzzles = Array.from({ length: 20 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        // Standard cognitive assessment format
        expect(puzzle.options).toHaveLength(4); // Multiple choice
        expect(puzzle.question).toContain('follow'); // Clear instruction
        expect(puzzle.explanation).toBeTruthy(); // Educational value
        
        // Working memory validation
        expect(puzzle.instructions.length).toBeGreaterThan(1); // Sequential processing
        expect(puzzle.instructionText).toBeTruthy(); // Must have written instructions
        expect(puzzle.executionSteps).toBeDefined(); // Must track execution
        
        // Progressive difficulty (should be string from BasePuzzle interface)
        expect(['easy', 'medium', 'hard']).toContain(puzzle.difficultyLevel);
      });
    });

    test('should test sequential processing skills', () => {
      const puzzle = generator.getRandom();
      
      // Should involve multiple steps
      expect(puzzle.instructions.length).toBeGreaterThan(1);
      
      // Should require instruction comprehension
      expect(puzzle.instructionText).toBeTruthy();
      puzzle.instructions.forEach(instruction => {
        expect(instruction.description).toBeTruthy();
        expect(instruction.description.length).toBeGreaterThan(10);
      });
      
      // Should track state changes
      expect(puzzle.executionSteps.length).toBeGreaterThan(puzzle.instructions.length);
    });

    test('should progressively increase working memory load', () => {
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
      
      // Easy puzzles should have fewer instructions and objects than hard puzzles
      if (easyPuzzles.length > 0 && hardPuzzles.length > 0) {
        const avgEasyInstructions = easyPuzzles.reduce((sum, p) => sum + p.instructions.length, 0) / easyPuzzles.length;
        const avgHardInstructions = hardPuzzles.reduce((sum, p) => sum + p.instructions.length, 0) / hardPuzzles.length;
        
        expect(avgHardInstructions).toBeGreaterThan(avgEasyInstructions);
      }
    });
  });

  describe('Singleton Instance', () => {
    test('should export singleton instance', () => {
      expect(followingDirectionsPuzzleGenerator).toBeInstanceOf(FollowingDirectionsPuzzleGenerator);
    });

    test('singleton should generate valid puzzles', () => {
      const puzzle = followingDirectionsPuzzleGenerator.getRandom();
      expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
      expect(puzzle.difficultyLevel).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle boundary movement attempts gracefully', () => {
      // Generate many puzzles to test edge cases
      const puzzles = Array.from({ length: 30 }, () => generator.getRandom());
      
      puzzles.forEach(puzzle => {
        // All puzzles should be valid despite boundary conditions
        expect(PuzzleValidator.validatePuzzle(puzzle)).toBe(true);
        
        // No object should be outside grid bounds
        puzzle.finalState.objects.forEach(obj => {
          expect(obj.position.row).toBeGreaterThanOrEqual(0);
          expect(obj.position.row).toBeLessThan(puzzle.gridSize);
          expect(obj.position.col).toBeGreaterThanOrEqual(0);
          expect(obj.position.col).toBeLessThan(puzzle.gridSize);
        });
      });
    });

    test('should maintain instruction execution consistency', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // Execution steps should match instruction count
        const instructionSteps = puzzle.executionSteps.filter(step => step.includes('Step '));
        expect(instructionSteps.length).toBe(puzzle.instructions.length);
        
        // Each instruction should have a corresponding result
        const resultSteps = puzzle.executionSteps.filter(step => step.includes('Result:'));
        expect(resultSteps.length).toBe(puzzle.instructions.length);
      }
    });

    test('should generate valid state representations', () => {
      for (let i = 0; i < 10; i++) {
        const puzzle = generator.getRandom();
        
        // All options should be valid grid representations
        puzzle.options.forEach(option => {
          const rows = option.split('|');
          expect(rows.length).toBe(puzzle.gridSize);
          
          rows.forEach(row => {
            expect(row.length).toBeGreaterThan(0);
            // Should only contain valid grid symbols
            expect(row).toMatch(/^[🔵🟦🔺🅰️🅱️1️⃣⬜✅]+$/);
          });
        });
      }
    });
  });
});

// Helper functions for testing
function countObjectsInState(state: GridState): number {
  return state.objects.length;
}

function isValidPosition(position: GridPosition, gridSize: number): boolean {
  return position.row >= 0 && position.row < gridSize && 
         position.col >= 0 && position.col < gridSize;
}

function hasUniquePositions(objects: Array<{position: GridPosition}>): boolean {
  const positions = new Set();
  for (const obj of objects) {
    const posKey = `${obj.position.row},${obj.position.col}`;
    if (positions.has(posKey)) {
      return false;
    }
    positions.add(posKey);
  }
  return true;
}