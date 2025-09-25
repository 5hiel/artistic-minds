/**
 * Paper Folding / Spatial Visualization Puzzle Generator
 * 
 * Generates puzzles where users must determine what a folded and punched
 * paper looks like when unfolded. Based on CogAT and NNAT spatial reasoning tasks.
 * 
 * Features:
 * - Dynamic fold pattern generation (horizontal, vertical, diagonal)
 * - Multiple punch hole configurations  
 * - Progressive difficulty levels (1-3 folds, 1-multiple punches)
 * - Geometric transformation algorithms for fold/unfold operations
 * - Visual grid-based representation system
 */

import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

// Grid cell states
export enum CellState {
  EMPTY = 0,
  HOLE = 1,
  FOLD_LINE = 2
}

// Fold types and directions
export enum FoldType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical', 
  DIAGONAL_TL_BR = 'diagonal_tl_br', // Top-left to bottom-right
  DIAGONAL_TR_BL = 'diagonal_tr_bl'  // Top-right to bottom-left
}

// Difficulty levels
export enum PaperFoldingDifficultyLevel {
  EASY = 1,    // 1 fold, 1 punch
  MEDIUM = 2,  // 2 folds, 1-2 punches
  HARD = 3     // 2-3 folds, 2-3 punches
}

// Grid coordinate system
export interface PaperFoldingGridPosition {
  row: number;
  col: number;
}

// Fold operation
export interface FoldOperation {
  type: FoldType;
  line: number; // Position of fold line (0-based index)
}

// Punch operation  
export interface PunchOperation {
  position: PaperFoldingGridPosition;
  shape: 'circle' | 'square'; // For future expansion
}

// Paper state during folding process
export interface PaperState {
  grid: CellState[][];
  size: number; // Grid size (5x5 or 7x7)
  folds: FoldOperation[];
  punches: PunchOperation[];
}

// Paper Folding puzzle interface
export interface PaperFoldingPuzzle extends BasePuzzle {
  initialGrid: CellState[][];
  foldSequence: FoldOperation[];
  punchSequence: PunchOperation[];
  unfoldedResult: CellState[][];
  gridSize: number;
  numericPaperFoldingDifficultyLevel: PaperFoldingDifficultyLevel;
  foldingSteps: string[]; // Visual description of each step
}

/**
 * Paper Folding Puzzle Generator Class
 * Implements spatial visualization puzzles with geometric transformations
 */
export class PaperFoldingPuzzleGenerator extends BasePuzzleGenerator<PaperFoldingPuzzle> {

  private determineDifficulty(difficultyLevel: PaperFoldingDifficultyLevel): 'easy' | 'medium' | 'hard' {
    switch (difficultyLevel) {
      case PaperFoldingDifficultyLevel.EASY: return 'easy';
      case PaperFoldingDifficultyLevel.MEDIUM: return 'medium';
      case PaperFoldingDifficultyLevel.HARD: return 'hard';
      default: return 'easy';
    }
  }

  private difficultyLevelToSubtype(difficultyLevel: PaperFoldingDifficultyLevel): string {
    const subtypeMap: Record<PaperFoldingDifficultyLevel, string> = {
      [PaperFoldingDifficultyLevel.EASY]: 'simple-fold',
      [PaperFoldingDifficultyLevel.MEDIUM]: 'double-fold', 
      [PaperFoldingDifficultyLevel.HARD]: 'complex-fold'
    };
    return subtypeMap[difficultyLevel] || 'simple-fold';
  }

  /**
   * Generate a random paper folding puzzle
   */
  getRandom(): PaperFoldingPuzzle {
    const difficultyLevel = this.getRandomDifficulty();
    const gridSize = this.getGridSize(difficultyLevel);
    
    // Generate fold sequence based on difficulty
    const foldSequence = this.generateFoldSequence(difficultyLevel, gridSize);
    
    // Generate punch sequence
    const punchSequence = this.generatePunchSequence(difficultyLevel, gridSize, foldSequence);
    
    // Create initial empty grid
    const initialGrid = this.createEmptyGrid(gridSize);
    
    // Apply folds and punches to determine final result
    const unfoldedResult = this.calculateUnfoldedResult(initialGrid, foldSequence, punchSequence, gridSize);
    
    // Generate puzzle components
    const { question, options, correctAnswerIndex, explanation } = this.generatePuzzleComponents(
      initialGrid, foldSequence, punchSequence, unfoldedResult, gridSize
    );
    
    const subtype = this.difficultyLevelToSubtype(difficultyLevel);
    const difficulty = this.determineDifficulty(difficultyLevel);
    const semanticId = SemanticIdGenerator.generateSemanticId('paper-folding', subtype, difficulty);

    return {
      question,
      options,
      correctAnswerIndex,
      explanation,
      initialGrid,
      foldSequence,
      punchSequence, 
      unfoldedResult,
      gridSize,
      numericPaperFoldingDifficultyLevel: difficultyLevel,
      foldingSteps: this.generateFoldingSteps(foldSequence, punchSequence),
      puzzleType: 'paper-folding',
      puzzleSubtype: subtype,
      difficultyLevel: difficulty,
      semanticId
    };
  }

  /**
   * Get random difficulty level with weighted distribution
   */
  private getRandomDifficulty(): PaperFoldingDifficultyLevel {
    const random = Math.random();
    if (random < 0.4) return PaperFoldingDifficultyLevel.EASY;    // 40% easy
    if (random < 0.8) return PaperFoldingDifficultyLevel.MEDIUM;  // 40% medium  
    return PaperFoldingDifficultyLevel.HARD;                      // 20% hard
  }

  /**
   * Determine grid size based on difficulty
   */
  private getGridSize(difficulty: PaperFoldingDifficultyLevel): number {
    return difficulty === PaperFoldingDifficultyLevel.EASY ? 5 : 7;
  }

  /**
   * Generate sequence of fold operations
   */
  private generateFoldSequence(difficulty: PaperFoldingDifficultyLevel, gridSize: number): FoldOperation[] {
    const folds: FoldOperation[] = [];
    const numFolds = difficulty === PaperFoldingDifficultyLevel.EASY ? 1 : 
                    difficulty === PaperFoldingDifficultyLevel.MEDIUM ? 2 : 
                    Math.floor(Math.random() * 2) + 2; // 2-3 folds for hard

    const availableFoldTypes = Object.values(FoldType);
    
    for (let i = 0; i < numFolds; i++) {
      const foldType = availableFoldTypes[Math.floor(Math.random() * availableFoldTypes.length)];
      const foldLine = this.generateFoldLine(foldType, gridSize);
      
      folds.push({ type: foldType, line: foldLine });
    }
    
    return folds;
  }

  /**
   * Generate valid fold line position for given fold type
   */
  private generateFoldLine(foldType: FoldType, gridSize: number): number {
    switch (foldType) {
      case FoldType.HORIZONTAL:
      case FoldType.VERTICAL:
        // Fold line should be in middle section, not at edges
        const minPos = Math.floor(gridSize * 0.3);
        const maxPos = Math.floor(gridSize * 0.7);
        return minPos + Math.floor(Math.random() * (maxPos - minPos + 1));
        
      case FoldType.DIAGONAL_TL_BR:
      case FoldType.DIAGONAL_TR_BL:
        // For diagonal folds, return center position
        return Math.floor(gridSize / 2);
        
      default:
        return Math.floor(gridSize / 2);
    }
  }

  /**
   * Generate punch sequence based on difficulty and fold state
   */
  private generatePunchSequence(difficulty: PaperFoldingDifficultyLevel, gridSize: number, folds: FoldOperation[]): PunchOperation[] {
    const punches: PunchOperation[] = [];
    const numPunches = difficulty === PaperFoldingDifficultyLevel.EASY ? 1 :
                      difficulty === PaperFoldingDifficultyLevel.MEDIUM ? Math.floor(Math.random() * 2) + 1 :
                      Math.floor(Math.random() * 2) + 2; // 2-3 punches for hard

    for (let i = 0; i < numPunches; i++) {
      const position = this.generateValidPunchPosition(gridSize, folds);
      punches.push({
        position,
        shape: 'circle' // Default to circle for now
      });
    }

    return punches;
  }

  /**
   * Generate valid punch position that will create interesting patterns when unfolded
   */
  private generateValidPunchPosition(gridSize: number, folds: FoldOperation[]): PaperFoldingGridPosition {
    // For now, generate random positions in the center region
    // In a more sophisticated implementation, we'd consider fold lines
    const centerStart = Math.floor(gridSize * 0.25);
    const centerEnd = Math.floor(gridSize * 0.75);
    
    return {
      row: centerStart + Math.floor(Math.random() * (centerEnd - centerStart)),
      col: centerStart + Math.floor(Math.random() * (centerEnd - centerStart))
    };
  }

  /**
   * Create empty grid of specified size
   */
  private createEmptyGrid(size: number): CellState[][] {
    return Array(size).fill(null).map(() => Array(size).fill(CellState.EMPTY));
  }

  /**
   * Calculate the final unfolded result by applying geometric transformations
   * This is the core algorithm that determines what the paper looks like when unfolded
   */
  private calculateUnfoldedResult(
    initialGrid: CellState[][],
    folds: FoldOperation[],
    punches: PunchOperation[],
    gridSize: number
  ): CellState[][] {
    // Start with empty grid
    let currentGrid = this.createEmptyGrid(gridSize);
    
    // For each punch, calculate where it appears when all folds are undone
    for (const punch of punches) {
      const unfoldedPositions = this.calculateUnfoldedPositions(punch.position, folds, gridSize);
      
      // Mark all unfolded positions as holes
      for (const pos of unfoldedPositions) {
        if (this.isValidPosition(pos, gridSize)) {
          currentGrid[pos.row][pos.col] = CellState.HOLE;
        }
      }
    }
    
    return currentGrid;
  }

  /**
   * Calculate all positions where a punch appears when unfolded
   * This implements the core geometric transformation logic
   */
  private calculateUnfoldedPositions(
    punchPos: PaperFoldingGridPosition,
    folds: FoldOperation[],
    gridSize: number
  ): PaperFoldingGridPosition[] {
    let positions = [punchPos];
    
    // Apply each fold's reflection transformation in reverse order
    for (let i = folds.length - 1; i >= 0; i--) {
      const fold = folds[i];
      const newPositions: PaperFoldingGridPosition[] = [];
      
      // For each current position, add its reflection across the fold line
      for (const pos of positions) {
        newPositions.push(pos); // Keep original position
        const reflected = this.reflectPositionAcrossFold(pos, fold, gridSize);
        if (reflected) {
          newPositions.push(reflected);
        }
      }
      
      positions = newPositions;
    }
    
    // Remove duplicates
    const uniquePositions: PaperFoldingGridPosition[] = [];
    const seen = new Set<string>();
    
    for (const pos of positions) {
      const key = `${pos.row},${pos.col}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePositions.push(pos);
      }
    }
    
    return uniquePositions;
  }

  /**
   * Reflect a position across a fold line using geometric transformations
   */
  private reflectPositionAcrossFold(
    pos: PaperFoldingGridPosition,
    fold: FoldOperation,
    gridSize: number
  ): PaperFoldingGridPosition | null {
    switch (fold.type) {
      case FoldType.HORIZONTAL:
        // Reflect across horizontal line at row = fold.line
        const reflectedRow = 2 * fold.line - pos.row;
        return this.isValidPosition({ row: reflectedRow, col: pos.col }, gridSize) 
          ? { row: reflectedRow, col: pos.col } 
          : null;
          
      case FoldType.VERTICAL:
        // Reflect across vertical line at col = fold.line  
        const reflectedCol = 2 * fold.line - pos.col;
        return this.isValidPosition({ row: pos.row, col: reflectedCol }, gridSize)
          ? { row: pos.row, col: reflectedCol }
          : null;
          
      case FoldType.DIAGONAL_TL_BR:
        // Reflect across diagonal from top-left to bottom-right
        return this.isValidPosition({ row: pos.col, col: pos.row }, gridSize)
          ? { row: pos.col, col: pos.row }
          : null;
          
      case FoldType.DIAGONAL_TR_BL:
        // Reflect across diagonal from top-right to bottom-left
        const diagRow = gridSize - 1 - pos.col;
        const diagCol = gridSize - 1 - pos.row;
        return this.isValidPosition({ row: diagRow, col: diagCol }, gridSize)
          ? { row: diagRow, col: diagCol }
          : null;
          
      default:
        return null;
    }
  }

  /**
   * Check if position is within grid bounds
   */
  private isValidPosition(pos: PaperFoldingGridPosition, gridSize: number): boolean {
    return pos.row >= 0 && pos.row < gridSize && pos.col >= 0 && pos.col < gridSize;
  }

  /**
   * Generate puzzle components (question, options, explanation)
   */
  private generatePuzzleComponents(
    initialGrid: CellState[][],
    folds: FoldOperation[],
    punches: PunchOperation[],
    unfoldedResult: CellState[][],
    gridSize: number
  ) {
    const question = `A ${gridSize}×${gridSize} piece of paper is folded ${folds.length} time${folds.length > 1 ? 's' : ''} and then ${punches.length} hole${punches.length > 1 ? 's are' : ' is'} punched through it. What does the paper look like when completely unfolded?`;

    // Generate 4 options: 1 correct + 3 distractors
    const options = this.generateAnswerOptions(unfoldedResult, gridSize);
    const correctAnswerIndex = 0; // Correct answer is first, will be shuffled
    
    // Generate explanation
    const explanation = this.generateExplanation(folds, punches, unfoldedResult);
    
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
  private generateAnswerOptions(correctResult: CellState[][], gridSize: number): string[] {
    const options: string[] = [];
    const optionStrings = new Set<string>();
    
    // Option 1: Correct answer
    const correctString = this.gridToString(correctResult);
    options.push(correctString);
    optionStrings.add(correctString);
    
    // Generate distractors with uniqueness checking
    const distractorGenerators = [
      () => this.createPartialUnfoldingError(correctResult, gridSize),
      () => this.createExtraHolesError(correctResult, gridSize),
      () => this.createWrongSymmetryError(correctResult, gridSize)
    ];
    
    // Try to generate 3 unique distractors
    for (const generator of distractorGenerators) {
      let attempts = 0;
      let distractor: string;
      
      do {
        const grid = generator();
        distractor = this.gridToString(grid);
        attempts++;
      } while (optionStrings.has(distractor) && attempts < 5);
      
      // If we couldn't generate a unique distractor, create a fallback
      if (optionStrings.has(distractor)) {
        distractor = this.createFallbackDistractor(correctResult, gridSize, optionStrings);
      }
      
      options.push(distractor);
      optionStrings.add(distractor);
    }
    
    // Safety check: if we still don't have 4 unique options, generate random ones
    while (options.length < 4) {
      const fallback = this.createFallbackDistractor(correctResult, gridSize, optionStrings);
      options.push(fallback);
      optionStrings.add(fallback);
    }
    
    return options;
  }

  /**
   * Convert grid to string representation for answer options
   */
  private gridToString(grid: CellState[][]): string {
    return grid.map(row => 
      row.map(cell => cell === CellState.HOLE ? '●' : '○').join('')
    ).join('|');
  }

  /**
   * Create a fallback distractor when other methods fail to generate unique options
   */
  private createFallbackDistractor(correctResult: CellState[][], gridSize: number, existingOptions: Set<string>): string {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      const fallbackGrid = this.createEmptyGrid(gridSize);
      
      // Add random holes (different count than correct answer)
      const correctHoleCount = this.countHoles(correctResult);
      const fallbackHoleCount = correctHoleCount + (Math.random() < 0.5 ? 1 : -1);
      
      for (let i = 0; i < Math.max(1, fallbackHoleCount); i++) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        fallbackGrid[row][col] = CellState.HOLE;
      }
      
      const fallbackString = this.gridToString(fallbackGrid);
      if (!existingOptions.has(fallbackString)) {
        return fallbackString;
      }
      
      attempts++;
    }
    
    // Last resort: create a minimal different pattern
    const emptyGrid = this.createEmptyGrid(gridSize);
    emptyGrid[0][0] = CellState.HOLE; // Just one hole in corner
    return this.gridToString(emptyGrid);
  }

  /**
   * Create distractor with some holes missing (common student error)
   */
  private createPartialUnfoldingError(correctGrid: CellState[][], gridSize: number): CellState[][] {
    const errorGrid = this.createEmptyGrid(gridSize);
    
    // Find all hole positions
    const holePositions: PaperFoldingGridPosition[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (correctGrid[row][col] === CellState.HOLE) {
          holePositions.push({ row, col });
        }
      }
    }
    
    // Copy only 50-70% of the holes to ensure it's different from correct
    const keepCount = Math.floor(holePositions.length * (0.5 + Math.random() * 0.2));
    const shuffledPositions = [...holePositions].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < keepCount && i < shuffledPositions.length; i++) {
      const pos = shuffledPositions[i];
      errorGrid[pos.row][pos.col] = CellState.HOLE;
    }
    
    return errorGrid;
  }

  /**
   * Create distractor with extra holes (over-reflection error)
   */
  private createExtraHolesError(correctGrid: CellState[][], gridSize: number): CellState[][] {
    const errorGrid = this.createEmptyGrid(gridSize);
    
    // Copy all correct holes
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (correctGrid[row][col] === CellState.HOLE) {
          errorGrid[row][col] = CellState.HOLE;
        }
      }
    }
    
    // Add extra holes in a pattern that could result from reflection errors
    const extraHoles = Math.floor(Math.random() * 2) + 1;
    const attempts = 10;
    
    for (let i = 0; i < extraHoles; i++) {
      let placed = false;
      for (let attempt = 0; attempt < attempts && !placed; attempt++) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        
        // Only place if not already a hole
        if (errorGrid[row][col] !== CellState.HOLE) {
          errorGrid[row][col] = CellState.HOLE;
          placed = true;
        }
      }
    }
    
    return errorGrid;
  }

  /**
   * Create distractor with wrong symmetry pattern
   */
  private createWrongSymmetryError(correctGrid: CellState[][], gridSize: number): CellState[][] {
    const errorGrid = this.createEmptyGrid(gridSize);
    
    // Find all hole positions in correct grid
    const holePositions: PaperFoldingGridPosition[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (correctGrid[row][col] === CellState.HOLE) {
          holePositions.push({ row, col });
        }
      }
    }
    
    // Apply incomplete symmetry (e.g., only one axis of reflection)
    const useHorizontalSymmetry = Math.random() < 0.5;
    
    for (const pos of holePositions) {
      errorGrid[pos.row][pos.col] = CellState.HOLE;
      
      if (useHorizontalSymmetry) {
        // Only horizontal reflection
        const mirrorCol = gridSize - 1 - pos.col;
        if (mirrorCol !== pos.col && mirrorCol >= 0 && mirrorCol < gridSize) {
          errorGrid[pos.row][mirrorCol] = CellState.HOLE;
        }
      } else {
        // Only vertical reflection  
        const mirrorRow = gridSize - 1 - pos.row;
        if (mirrorRow !== pos.row && mirrorRow >= 0 && mirrorRow < gridSize) {
          errorGrid[mirrorRow][pos.col] = CellState.HOLE;
        }
      }
    }
    
    return errorGrid;
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
   * Generate human-readable explanation of the folding process
   */
  private generateExplanation(folds: FoldOperation[], punches: PunchOperation[], result: CellState[][]): string {
    let explanation = "Paper folding analysis:\n\n";
    
    // Describe fold sequence
    explanation += `1. Fold sequence: ${folds.length} fold${folds.length > 1 ? 's' : ''}:\n`;
    folds.forEach((fold, i) => {
      explanation += `   Step ${i + 1}: ${this.describeFold(fold)}\n`;
    });
    
    // Describe punches
    explanation += `\n2. Punch pattern: ${punches.length} hole${punches.length > 1 ? 's' : ''} punched through the folded paper\n`;
    
    // Describe unfolding logic
    explanation += `\n3. Unfolding: Each punch creates multiple holes due to the fold reflections\n`;
    explanation += `   - Each fold reflects punches across its axis\n`;
    explanation += `   - Multiple folds create compound reflections\n`;
    
    const holeCount = this.countHoles(result);
    explanation += `\n4. Final result: ${holeCount} holes arranged in a symmetric pattern`;
    
    return explanation;
  }

  /**
   * Generate human-readable description of a fold operation
   */
  private describeFold(fold: FoldOperation): string {
    switch (fold.type) {
      case FoldType.HORIZONTAL:
        return `Horizontal fold across row ${fold.line}`;
      case FoldType.VERTICAL:
        return `Vertical fold across column ${fold.line}`;
      case FoldType.DIAGONAL_TL_BR:
        return 'Diagonal fold from top-left to bottom-right';
      case FoldType.DIAGONAL_TR_BL:
        return 'Diagonal fold from top-right to bottom-left';
      default:
        return 'Unknown fold type';
    }
  }

  /**
   * Count total holes in result grid
   */
  private countHoles(grid: CellState[][]): number {
    let count = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell === CellState.HOLE) count++;
      }
    }
    return count;
  }

  /**
   * Generate step-by-step folding description for UI
   */
  private generateFoldingSteps(folds: FoldOperation[], punches: PunchOperation[]): string[] {
    const steps: string[] = [];
    
    steps.push("1. Start with flat paper");
    
    folds.forEach((fold, i) => {
      steps.push(`${i + 2}. ${this.describeFold(fold)}`);
    });
    
    steps.push(`${folds.length + 2}. Punch ${punches.length} hole${punches.length > 1 ? 's' : ''} through folded paper`);
    steps.push(`${folds.length + 3}. Unfold completely to reveal pattern`);
    
    return steps;
  }
}

// Export singleton instance
export const paperFoldingPuzzleGenerator = new PaperFoldingPuzzleGenerator();

// Export deprecated function for backward compatibility
export function generateRandomPaperFoldingPuzzle(): PaperFoldingPuzzle {
  return paperFoldingPuzzleGenerator.getRandom();
}