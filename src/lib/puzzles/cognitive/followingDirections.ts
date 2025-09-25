/**
 * Following Directions Puzzle Generator
 * 
 * Generates puzzles where users must follow sequential written instructions
 * to track object movements and determine final positions. Based on OLSAT
 * cognitive assessments for working memory and instruction comprehension.
 * 
 * Features:
 * - Dynamic instruction sequence generation
 * - Progressive difficulty levels (2-3 simple moves → complex multi-step sequences)
 * - Variable grid sizes (3x3, 4x4, 5x5)
 * - Object types: shapes, letters, numbers
 * - Instruction types: directional moves, conditional logic, object interactions
 * - Step-by-step execution tracking and validation
 */

import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

// Object types that can be placed on the grid
export enum ObjectType {
  CIRCLE = 'circle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  LETTER_A = 'A',
  LETTER_B = 'B', 
  LETTER_C = 'C',
  NUMBER_1 = '1',
  NUMBER_2 = '2',
  NUMBER_3 = '3'
}

// Directional movements
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

// Difficulty levels
export enum FollowingDirectionsDifficultyLevel {
  EASY = 1,    // 2-3 simple moves, 3x3 grid
  MEDIUM = 2,  // 4-5 moves with conditions, 4x4 grid  
  HARD = 3     // Complex sequences with interactions, 5x5 grid
}

// Grid position coordinate
export interface FollowingDirectionsGridPosition {
  row: number;
  col: number;
}

// Object on the grid
export interface GridObject {
  type: ObjectType;
  position: FollowingDirectionsGridPosition;
  id: string; // unique identifier for tracking
}

// Instruction types
export enum InstructionType {
  MOVE = 'move',           // Move object in direction
  MOVE_STEPS = 'move_steps', // Move object N steps in direction
  CONDITIONAL = 'conditional', // If condition then action
  SWAP = 'swap',           // Swap positions of two objects
  MARK = 'mark'            // Mark position/object
}

// Individual instruction
export interface Instruction {
  type: InstructionType;
  objectId?: string;
  direction?: Direction;
  steps?: number;
  condition?: string;
  action?: string;
  targetObjectId?: string;
  description: string; // Human-readable instruction text
}

// Grid state at any point in time
export interface GridState {
  size: number;
  objects: GridObject[];
  markedPositions: FollowingDirectionsGridPosition[];
}

// Following Directions puzzle interface
export interface FollowingDirectionsPuzzle extends BasePuzzle {
  initialState: GridState;
  instructions: Instruction[];
  finalState: GridState;
  gridSize: number;
  numericFollowingDirectionsDifficultyLevel: FollowingDirectionsDifficultyLevel; // Keep the numeric enum for internal logic
  executionSteps: string[]; // Step-by-step execution trace
  instructionText: string;  // Combined instruction text
}

/**
 * Following Directions Puzzle Generator Class
 * Implements instruction-following puzzles with sequential processing
 */
export class FollowingDirectionsPuzzleGenerator extends BasePuzzleGenerator<FollowingDirectionsPuzzle> {

  private determineDifficulty(difficultyLevel: FollowingDirectionsDifficultyLevel): 'easy' | 'medium' | 'hard' {
    switch (difficultyLevel) {
      case FollowingDirectionsDifficultyLevel.EASY: return 'easy';
      case FollowingDirectionsDifficultyLevel.MEDIUM: return 'medium';
      case FollowingDirectionsDifficultyLevel.HARD: return 'hard';
      default: return 'easy';
    }
  }

  private difficultyLevelToSubtype(difficultyLevel: FollowingDirectionsDifficultyLevel): string {
    const subtypeMap: Record<FollowingDirectionsDifficultyLevel, string> = {
      [FollowingDirectionsDifficultyLevel.EASY]: 'simple-moves',
      [FollowingDirectionsDifficultyLevel.MEDIUM]: 'step-moves',
      [FollowingDirectionsDifficultyLevel.HARD]: 'complex-instructions'
    };
    return subtypeMap[difficultyLevel] || 'simple-moves';
  }

  /**
   * Generate a random following directions puzzle
   */
  getRandom(): FollowingDirectionsPuzzle {
    const difficultyLevel = this.getRandomDifficulty();
    const gridSize = this.getGridSize(difficultyLevel);
    
    // Generate initial grid state with objects
    const initialState = this.generateInitialState(gridSize, difficultyLevel);
    
    // Generate instruction sequence
    const instructions = this.generateInstructions(initialState, difficultyLevel);
    
    // Execute instructions to get final state
    const { finalState, executionSteps } = this.executeInstructions(initialState, instructions);
    
    // Generate instruction text
    const instructionText = this.generateInstructionText(instructions);
    
    // Generate puzzle components
    const { question, options, correctAnswerIndex, explanation } = this.generatePuzzleComponents(
      initialState, finalState, instructionText, executionSteps, gridSize
    );
    
    const subtype = this.difficultyLevelToSubtype(difficultyLevel);
    const difficulty = this.determineDifficulty(difficultyLevel);
    const semanticId = SemanticIdGenerator.generateSemanticId('following-directions', subtype, difficulty);

    return {
      question,
      options,
      correctAnswerIndex,
      explanation,
      initialState,
      instructions,
      finalState,
      gridSize,
      numericFollowingDirectionsDifficultyLevel: difficultyLevel,
      executionSteps,
      instructionText,
      puzzleType: 'following-directions',
      puzzleSubtype: subtype,
      difficultyLevel: difficulty,
      semanticId
    };
  }

  /**
   * Get random difficulty level with weighted distribution
   */
  private getRandomDifficulty(): FollowingDirectionsDifficultyLevel {
    const random = Math.random();
    if (random < 0.4) return FollowingDirectionsDifficultyLevel.EASY;    // 40% easy
    if (random < 0.8) return FollowingDirectionsDifficultyLevel.MEDIUM;  // 40% medium
    return FollowingDirectionsDifficultyLevel.HARD;                      // 20% hard
  }

  /**
   * Determine grid size based on difficulty
   */
  private getGridSize(difficulty: FollowingDirectionsDifficultyLevel): number {
    switch (difficulty) {
      case FollowingDirectionsDifficultyLevel.EASY: return 3;
      case FollowingDirectionsDifficultyLevel.MEDIUM: return 4;
      case FollowingDirectionsDifficultyLevel.HARD: return 5;
      default: return 3;
    }
  }

  /**
   * Generate initial grid state with randomly placed objects
   */
  private generateInitialState(gridSize: number, difficulty: FollowingDirectionsDifficultyLevel): GridState {
    const objectCount = difficulty === FollowingDirectionsDifficultyLevel.EASY ? 2 :
                       difficulty === FollowingDirectionsDifficultyLevel.MEDIUM ? 3 : 4;
    
    const availableObjects = Object.values(ObjectType);
    const selectedObjects = this.selectRandomObjects(availableObjects, objectCount);
    const objects: GridObject[] = [];
    const occupiedPositions = new Set<string>();
    
    // Place objects randomly on grid
    for (let i = 0; i < selectedObjects.length; i++) {
      let position: FollowingDirectionsGridPosition;
      let positionKey: string;
      
      do {
        position = {
          row: Math.floor(Math.random() * gridSize),
          col: Math.floor(Math.random() * gridSize)
        };
        positionKey = `${position.row},${position.col}`;
      } while (occupiedPositions.has(positionKey));
      
      occupiedPositions.add(positionKey);
      
      objects.push({
        type: selectedObjects[i],
        position,
        id: `obj_${i}`
      });
    }
    
    return {
      size: gridSize,
      objects,
      markedPositions: []
    };
  }

  /**
   * Select random objects from available types
   */
  private selectRandomObjects(available: ObjectType[], count: number): ObjectType[] {
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Generate sequence of instructions based on difficulty
   */
  private generateInstructions(initialState: GridState, difficulty: FollowingDirectionsDifficultyLevel): Instruction[] {
    const instructions: Instruction[] = [];
    const instructionCount = difficulty === FollowingDirectionsDifficultyLevel.EASY ? Math.floor(Math.random() * 2) + 2 : // 2-3
                            difficulty === FollowingDirectionsDifficultyLevel.MEDIUM ? Math.floor(Math.random() * 2) + 4 : // 4-5
                            Math.floor(Math.random() * 3) + 5; // 5-7
    
    const availableObjects = initialState.objects.map(obj => obj.id);
    
    for (let i = 0; i < instructionCount; i++) {
      let instruction: Instruction;
      
      if (difficulty === FollowingDirectionsDifficultyLevel.EASY) {
        // Simple directional moves only
        instruction = this.generateSimpleMove(availableObjects);
      } else if (difficulty === FollowingDirectionsDifficultyLevel.MEDIUM) {
        // Mix of simple moves and step-based moves
        const instructionTypes = [InstructionType.MOVE, InstructionType.MOVE_STEPS];
        const type = instructionTypes[Math.floor(Math.random() * instructionTypes.length)];
        
        if (type === InstructionType.MOVE) {
          instruction = this.generateSimpleMove(availableObjects);
        } else {
          instruction = this.generateStepMove(availableObjects);
        }
      } else {
        // Complex instructions with conditionals and interactions
        const instructionTypes = [InstructionType.MOVE, InstructionType.MOVE_STEPS, InstructionType.CONDITIONAL, InstructionType.SWAP];
        const type = instructionTypes[Math.floor(Math.random() * instructionTypes.length)];
        
        switch (type) {
          case InstructionType.MOVE:
            instruction = this.generateSimpleMove(availableObjects);
            break;
          case InstructionType.MOVE_STEPS:
            instruction = this.generateStepMove(availableObjects);
            break;
          case InstructionType.CONDITIONAL:
            instruction = this.generateConditionalInstruction(availableObjects);
            break;
          case InstructionType.SWAP:
            instruction = this.generateSwapInstruction(availableObjects);
            break;
          default:
            instruction = this.generateSimpleMove(availableObjects);
        }
      }
      
      instructions.push(instruction);
    }
    
    return instructions;
  }

  /**
   * Generate simple directional move instruction
   */
  private generateSimpleMove(availableObjects: string[]): Instruction {
    const objectId = availableObjects[Math.floor(Math.random() * availableObjects.length)];
    const direction = Object.values(Direction)[Math.floor(Math.random() * Object.values(Direction).length)];
    
    return {
      type: InstructionType.MOVE,
      objectId,
      direction,
      description: `Move the ${this.getObjectDescription(objectId)} one space ${direction}.`
    };
  }

  /**
   * Generate step-based move instruction
   */
  private generateStepMove(availableObjects: string[]): Instruction {
    const objectId = availableObjects[Math.floor(Math.random() * availableObjects.length)];
    const direction = Object.values(Direction)[Math.floor(Math.random() * Object.values(Direction).length)];
    const steps = Math.floor(Math.random() * 2) + 2; // 2-3 steps
    
    return {
      type: InstructionType.MOVE_STEPS,
      objectId,
      direction,
      steps,
      description: `Move the ${this.getObjectDescription(objectId)} ${steps} spaces ${direction}.`
    };
  }

  /**
   * Generate conditional instruction
   */
  private generateConditionalInstruction(availableObjects: string[]): Instruction {
    const objectId = availableObjects[Math.floor(Math.random() * availableObjects.length)];
    const direction = Object.values(Direction)[Math.floor(Math.random() * Object.values(Direction).length)];
    
    const conditions = [
      'if it is in the top row',
      'if it is in the bottom row',
      'if it is in the left column',
      'if it is in the right column'
    ];
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      type: InstructionType.CONDITIONAL,
      objectId,
      direction,
      condition,
      action: `move it one space ${direction}`,
      description: `Look at the ${this.getObjectDescription(objectId)}. ${condition}, move it one space ${direction}.`
    };
  }

  /**
   * Generate swap instruction
   */
  private generateSwapInstruction(availableObjects: string[]): Instruction {
    if (availableObjects.length < 2) {
      return this.generateSimpleMove(availableObjects);
    }
    
    const shuffled = [...availableObjects].sort(() => Math.random() - 0.5);
    const objectId = shuffled[0];
    const targetObjectId = shuffled[1];
    
    return {
      type: InstructionType.SWAP,
      objectId,
      targetObjectId,
      description: `Swap the positions of the ${this.getObjectDescription(objectId)} and the ${this.getObjectDescription(targetObjectId)}.`
    };
  }

  /**
   * Get human-readable description of object by ID
   */
  private getObjectDescription(objectId: string): string {
    // This would need to be enhanced to track actual object types
    // For now, return generic descriptions
    const descriptions = ['circle', 'square', 'triangle', 'letter A', 'letter B', 'number 1'];
    const index = parseInt(objectId.split('_')[1]) || 0;
    return descriptions[index % descriptions.length] || 'object';
  }

  /**
   * Execute instructions step by step and track state changes
   */
  private executeInstructions(initialState: GridState, instructions: Instruction[]): { finalState: GridState, executionSteps: string[] } {
    let currentState = this.deepCopyState(initialState);
    const executionSteps: string[] = [];
    
    executionSteps.push(`Starting state: ${this.describeState(currentState)}`);
    
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      const stepResult = this.executeInstruction(currentState, instruction);
      
      currentState = stepResult.newState;
      executionSteps.push(`Step ${i + 1}: ${instruction.description}`);
      executionSteps.push(`Result: ${stepResult.description}`);
    }
    
    return {
      finalState: currentState,
      executionSteps
    };
  }

  /**
   * Execute a single instruction and return new state
   */
  private executeInstruction(state: GridState, instruction: Instruction): { newState: GridState, description: string } {
    const newState = this.deepCopyState(state);
    
    switch (instruction.type) {
      case InstructionType.MOVE:
        return this.executeMoveInstruction(newState, instruction);
      case InstructionType.MOVE_STEPS:
        return this.executeMoveStepsInstruction(newState, instruction);
      case InstructionType.CONDITIONAL:
        return this.executeConditionalInstruction(newState, instruction);
      case InstructionType.SWAP:
        return this.executeSwapInstruction(newState, instruction);
      default:
        return { newState, description: 'No action taken' };
    }
  }

  /**
   * Execute simple move instruction
   */
  private executeMoveInstruction(state: GridState, instruction: Instruction): { newState: GridState, description: string } {
    const object = state.objects.find(obj => obj.id === instruction.objectId);
    if (!object || !instruction.direction) {
      return { newState: state, description: 'Object not found or invalid direction' };
    }
    
    const newPosition = this.movePosition(object.position, instruction.direction, 1, state.size);
    if (newPosition) {
      object.position = newPosition;
      return { 
        newState: state, 
        description: `${this.getObjectDescription(instruction.objectId || '')} moved to row ${newPosition.row + 1}, column ${newPosition.col + 1}` 
      };
    } else {
      return { 
        newState: state, 
        description: `${this.getObjectDescription(instruction.objectId || '')} cannot move ${instruction.direction || 'unknown direction'} (would go outside grid)` 
      };
    }
  }

  /**
   * Execute step-based move instruction
   */
  private executeMoveStepsInstruction(state: GridState, instruction: Instruction): { newState: GridState, description: string } {
    const object = state.objects.find(obj => obj.id === instruction.objectId);
    if (!object || !instruction.direction || !instruction.steps) {
      return { newState: state, description: 'Object not found or invalid parameters' };
    }
    
    const newPosition = this.movePosition(object.position, instruction.direction, instruction.steps, state.size);
    if (newPosition) {
      object.position = newPosition;
      return { 
        newState: state, 
        description: `${this.getObjectDescription(instruction.objectId || '')} moved ${instruction.steps || 0} spaces to row ${newPosition.row + 1}, column ${newPosition.col + 1}` 
      };
    } else {
      return { 
        newState: state, 
        description: `${this.getObjectDescription(instruction.objectId || '')} cannot move ${instruction.steps || 0} spaces ${instruction.direction || 'unknown direction'} (would go outside grid)` 
      };
    }
  }

  /**
   * Execute conditional instruction
   */
  private executeConditionalInstruction(state: GridState, instruction: Instruction): { newState: GridState, description: string } {
    const object = state.objects.find(obj => obj.id === instruction.objectId);
    if (!object || !instruction.condition) {
      return { newState: state, description: 'Object not found or no condition specified' };
    }
    
    const conditionMet = this.evaluateCondition(object.position, instruction.condition, state.size);
    
    if (conditionMet && instruction.direction) {
      const newPosition = this.movePosition(object.position, instruction.direction, 1, state.size);
      if (newPosition) {
        object.position = newPosition;
        return { 
          newState: state, 
          description: `Condition met: ${this.getObjectDescription(instruction.objectId || '')} moved to row ${newPosition.row + 1}, column ${newPosition.col + 1}` 
        };
      }
    }
    
    return { 
      newState: state, 
      description: `Condition not met or move not possible: ${this.getObjectDescription(instruction.objectId || '')} stays in place` 
    };
  }

  /**
   * Execute swap instruction
   */
  private executeSwapInstruction(state: GridState, instruction: Instruction): { newState: GridState, description: string } {
    const object1 = state.objects.find(obj => obj.id === instruction.objectId);
    const object2 = state.objects.find(obj => obj.id === instruction.targetObjectId);
    
    if (!object1 || !object2) {
      return { newState: state, description: 'One or both objects not found' };
    }
    
    // Swap positions
    const tempPosition = object1.position;
    object1.position = object2.position;
    object2.position = tempPosition;
    
    return { 
      newState: state, 
      description: `Swapped positions: ${this.getObjectDescription(instruction.objectId!)} and ${this.getObjectDescription(instruction.targetObjectId!)} exchanged places` 
    };
  }

  /**
   * Move a position in the specified direction by specified steps
   */
  private movePosition(position: FollowingDirectionsGridPosition, direction: Direction, steps: number, gridSize: number): FollowingDirectionsGridPosition | null {
    let newRow = position.row;
    let newCol = position.col;
    
    switch (direction) {
      case Direction.UP:
        newRow -= steps;
        break;
      case Direction.DOWN:
        newRow += steps;
        break;
      case Direction.LEFT:
        newCol -= steps;
        break;
      case Direction.RIGHT:
        newCol += steps;
        break;
    }
    
    // Check bounds
    if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
      return null; // Move would go outside grid
    }
    
    return { row: newRow, col: newCol };
  }

  /**
   * Evaluate conditional statements
   */
  private evaluateCondition(position: FollowingDirectionsGridPosition, condition: string, gridSize: number): boolean {
    switch (condition) {
      case 'if it is in the top row':
        return position.row === 0;
      case 'if it is in the bottom row':
        return position.row === gridSize - 1;
      case 'if it is in the left column':
        return position.col === 0;
      case 'if it is in the right column':
        return position.col === gridSize - 1;
      default:
        return false;
    }
  }

  /**
   * Deep copy grid state for immutable operations
   */
  private deepCopyState(state: GridState): GridState {
    return {
      size: state.size,
      objects: state.objects.map(obj => ({
        ...obj,
        position: { ...obj.position }
      })),
      markedPositions: state.markedPositions.map(pos => ({ ...pos }))
    };
  }

  /**
   * Generate human-readable instruction text
   */
  private generateInstructionText(instructions: Instruction[]): string {
    const steps = instructions.map((instruction, index) => 
      `${index + 1}. ${instruction.description}`
    ).join('\n');
    
    return `Follow these instructions in order:\n\n${steps}`;
  }

  /**
   * Describe current state of the grid
   */
  private describeState(state: GridState): string {
    return `Grid with ${state.objects.length} objects positioned`;
  }

  /**
   * Generate puzzle components (question, options, explanation)
   */
  private generatePuzzleComponents(
    initialState: GridState,
    finalState: GridState,
    instructionText: string,
    executionSteps: string[],
    gridSize: number
  ) {
    const question = `Look at the ${gridSize}×${gridSize} grid and follow the given instructions. Which grid shows the final positions of all objects?`;
    
    // Generate 4 options: 1 correct + 3 distractors
    const options = this.generateAnswerOptions(finalState, gridSize, executionSteps);
    const correctAnswerIndex = 0; // Correct answer is first, will be shuffled
    
    // Generate explanation
    const explanation = this.generateExplanation(instructionText, executionSteps);
    
    // Shuffle options and update correct index
    const { shuffledOptions, newCorrectIndex } = this.shuffleOptionsWithCorrectIndex(options, correctAnswerIndex);
    
    return {
      question,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex,
      explanation
    };
  }

  /**
   * Generate 4 answer options (1 correct + 3 distractors)
   */
  private generateAnswerOptions(correctState: GridState, gridSize: number, executionSteps: string[]): string[] {
    const options: string[] = [];
    const optionStrings = new Set<string>();
    
    // Option 1: Correct final state
    const correctString = this.stateToString(correctState);
    options.push(correctString);
    optionStrings.add(correctString);
    
    // Generate distractors with uniqueness checking
    const distractorGenerators = [
      () => this.createPartialExecutionError(correctState, gridSize),
      () => this.createWrongDirectionError(correctState, gridSize),
      () => this.createObjectConfusionError(correctState, gridSize)
    ];
    
    // Try to generate 3 unique distractors
    for (const generator of distractorGenerators) {
      let attempts = 0;
      let distractor: string;
      
      do {
        const state = generator();
        distractor = this.stateToString(state);
        attempts++;
      } while (optionStrings.has(distractor) && attempts < 5);
      
      // If we couldn't generate a unique distractor, create a fallback
      if (optionStrings.has(distractor)) {
        distractor = this.createFallbackDistractor(correctState, gridSize, optionStrings);
      }
      
      options.push(distractor);
      optionStrings.add(distractor);
    }
    
    // Safety check: if we still don't have 4 unique options, generate random ones
    while (options.length < 4) {
      const fallback = this.createFallbackDistractor(correctState, gridSize, optionStrings);
      options.push(fallback);
      optionStrings.add(fallback);
    }
    
    return options;
  }

  /**
   * Convert grid state to string representation
   */
  private stateToString(state: GridState): string {
    const grid = Array(state.size).fill(null).map(() => Array(state.size).fill('⬜'));
    
    // Place objects on grid
    state.objects.forEach((obj, index) => {
      const symbols = ['🔵', '🟦', '🔺', '🅰️', '🅱️', '1️⃣'];
      grid[obj.position.row][obj.position.col] = symbols[index % symbols.length];
    });
    
    // Mark positions if any
    state.markedPositions.forEach(pos => {
      if (grid[pos.row][pos.col] === '⬜') {
        grid[pos.row][pos.col] = '✅';
      }
    });
    
    return grid.map(row => row.join('')).join('|');
  }

  /**
   * Create a fallback distractor when other methods fail to generate unique options
   */
  private createFallbackDistractor(correctState: GridState, gridSize: number, existingOptions: Set<string>): string {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const fallbackState = this.deepCopyState(correctState);
      
      // Randomly modify positions of objects
      fallbackState.objects.forEach((obj, index) => {
        if (Math.random() < 0.5) { // 50% chance to move each object
          let newRow = Math.floor(Math.random() * gridSize);
          let newCol = Math.floor(Math.random() * gridSize);
          
          // Make sure we don't conflict with other objects
          let attempts = 5;
          while (attempts > 0 && fallbackState.objects.some((otherObj, otherIndex) => 
            otherIndex !== index && otherObj.position.row === newRow && otherObj.position.col === newCol)) {
            newRow = Math.floor(Math.random() * gridSize);
            newCol = Math.floor(Math.random() * gridSize);
            attempts--;
          }
          
          obj.position = { row: newRow, col: newCol };
        }
      });
      
      const fallbackString = this.stateToString(fallbackState);
      if (!existingOptions.has(fallbackString)) {
        return fallbackString;
      }
      
      attempts++;
    }
    
    // Last resort: create a minimal different pattern
    const emptyState = this.deepCopyState(correctState);
    if (emptyState.objects.length > 0) {
      // Move first object to corner
      emptyState.objects[0].position = { row: 0, col: 0 };
    }
    return this.stateToString(emptyState);
  }

  /**
   * Create distractor with partial execution error
   */
  private createPartialExecutionError(correctState: GridState, gridSize: number): GridState {
    const errorState = this.deepCopyState(correctState);
    
    // Randomly move one object to a different position
    if (errorState.objects.length > 0) {
      const randomObject = errorState.objects[Math.floor(Math.random() * errorState.objects.length)];
      const directions = Object.values(Direction);
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      
      const newPosition = this.movePosition(randomObject.position, randomDirection, 1, gridSize);
      if (newPosition) {
        randomObject.position = newPosition;
      }
    }
    
    return errorState;
  }

  /**
   * Create distractor with wrong direction error
   */
  private createWrongDirectionError(correctState: GridState, gridSize: number): GridState {
    const errorState = this.deepCopyState(correctState);
    
    // Move objects in opposite directions
    errorState.objects.forEach(obj => {
      const oppositeDirections = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT
      };
      
      const randomOriginalDirection = Object.values(Direction)[Math.floor(Math.random() * Object.values(Direction).length)];
      const oppositeDirection = oppositeDirections[randomOriginalDirection];
      
      const newPosition = this.movePosition(obj.position, oppositeDirection, 1, gridSize);
      if (newPosition) {
        obj.position = newPosition;
      }
    });
    
    return errorState;
  }

  /**
   * Create distractor with object confusion error
   */
  private createObjectConfusionError(correctState: GridState, gridSize: number): GridState {
    const errorState = this.deepCopyState(correctState);
    
    // Instead of swapping, move objects to different valid positions
    errorState.objects.forEach((obj, index) => {
      if (Math.random() < 0.6) { // 60% chance to move each object
        // Find a new position that's not occupied
        let newRow: number = 0;
        let newCol: number = 0;
        let attempts = 10;
        
        do {
          newRow = Math.floor(Math.random() * gridSize);
          newCol = Math.floor(Math.random() * gridSize);
          attempts--;
        } while (attempts > 0 && errorState.objects.some((otherObj, otherIndex) => 
          otherIndex !== index && otherObj.position.row === newRow && otherObj.position.col === newCol));
        
        // Only move if we found a valid position
        if (attempts > 0) {
          obj.position = { row: newRow, col: newCol };
        }
      }
    });
    
    return errorState;
  }

  /**
   * Shuffle options while tracking correct answer position
   */
  private shuffleOptionsWithCorrectIndex(options: string[], correctIndex: number): { shuffledOptions: string[], newCorrectIndex: number } {
    const correctAnswer = options[correctIndex];
    
    // Fisher-Yates shuffle
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const newCorrectIndex = shuffled.findIndex(option => option === correctAnswer);
    
    return { shuffledOptions: shuffled, newCorrectIndex };
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(instructionText: string, executionSteps: string[]): string {
    let explanation = "Following directions step by step:\n\n";
    explanation += instructionText + "\n\n";
    explanation += "Execution trace:\n";
    explanation += executionSteps.join('\n');
    
    return explanation;
  }
}

// Export singleton instance
export const followingDirectionsPuzzleGenerator = new FollowingDirectionsPuzzleGenerator();

// Export deprecated function for backward compatibility
export function generateRandomFollowingDirectionsPuzzle(): FollowingDirectionsPuzzle {
  return followingDirectionsPuzzleGenerator.getRandom();
}