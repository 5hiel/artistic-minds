import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

/**
 * Mathematical rule categories for number grid puzzles
 */
export enum GridRuleType {
  ROW_COLUMN_ARITHMETIC = 'arithmetic',
  MAGIC_SQUARE = 'magic',
  CROSS_LOGIC = 'cross',
  PROGRESSIVE_OPERATIONS = 'progressive',
  COMBINATION_RULES = 'combination'
}

/**
 * Number Grid Puzzle interface extending BasePuzzle
 * Represents 3x3 mathematical grid puzzles with one missing number
 */
export interface NumberGridPuzzle extends BasePuzzle {
  grid: string[][]; // 3x3 grid with empty string for missing number (converted from numbers)
  numberGrid: (number | null)[][]; // Original number grid for internal use
  ruleType: GridRuleType;
  numericDifficulty: 1 | 2 | 3 | 4 | 5;
  missingPosition: [number, number]; // [row, col] of missing number
  expectedSum?: number; // For magic squares
  rule: string; // Description of mathematical rule
}

/**
 * Number Grid Puzzle Generator
 * Generates 3x3 mathematical grid puzzles with hidden numerical relationships
 * Supports 5 categories: Arithmetic, Magic Square, Cross Logic, Progressive, Combination
 */
export class NumberGridPuzzleGenerator extends BasePuzzleGenerator<NumberGridPuzzle> {
  
  private determineDifficulty(ruleType: GridRuleType): 'easy' | 'medium' | 'hard' {
    // FIXED: Number grid puzzles require pattern recognition and arithmetic reasoning
    const difficultyMap: Record<GridRuleType, 'easy' | 'medium' | 'hard'> = {
      [GridRuleType.ROW_COLUMN_ARITHMETIC]: 'easy',      // Age 6-8: Simple grid patterns - changed from medium to easy
      [GridRuleType.MAGIC_SQUARE]: 'hard',              // Age 12+: Magic squares require advanced mathematical concepts
      [GridRuleType.CROSS_LOGIC]: 'hard',               // Age 10-12: Cross relationships require abstract reasoning
      [GridRuleType.PROGRESSIVE_OPERATIONS]: 'hard',    // Age 12+: Multi-step operations are very advanced
      [GridRuleType.COMBINATION_RULES]: 'hard'          // Age 12+: Formula-based rules require algebraic thinking
    };
    return difficultyMap[ruleType] || 'hard'; // Default to hard - most grid logic is advanced
  }
  /**
   * Example number grid puzzles that the dynamic generator creates for developer reference:
   * 
   * Row/Column Arithmetic (30% of puzzles):
   * [2] [4] [6]    Row pattern: multiply by 1, 2, 3
   * [3] [6] [9]    Each row follows same rule
   * [1] [2] [?]    Answer: 3 (1 × 3 = 3)
   * 
   * [1] [2] [3]    Column pattern: each column +1
   * [3] [4] [5]    Vertical arithmetic progression
   * [5] [?] [7]    Answer: 6 (4 + 2 = 6)
   * 
   * Magic Square (20% of puzzles):
   * [8] [1] [6]    All rows/columns/diagonals = 15
   * [3] [5] [7]    Classic 3×3 magic square
   * [4] [9] [?]    Answer: 2 (4 + 9 + 2 = 15)
   * 
   * [2] [7] [6]    Alternative magic square layout
   * [9] [5] [1]    Sum = 15 for all directions
   * [4] [?] [8]    Answer: 3 (middle column: 7+5+3=15)
   * 
   * Cross Logic (15% of puzzles):
   * [2] [4] [6]    Center relates to corners
   * [1] [3] [5]    Average or sum relationships
   * [0] [?] [4]    Answer: 2 (center is average: (0+4)/2)
   * 
   * Progressive Operations (20% of puzzles):
   * [1] [3] [9]     Each row: ×3 then ×3 again
   * [2] [6] [18]    Progressive multiplication
   * [3] [9] [?]     Answer: 27 (9 × 3 = 27)
   * 
   * [1] [4] [7]     Each row: +3 pattern
   * [2] [5] [8]     Consistent addition rule
   * [3] [6] [?]     Answer: 9 (6 + 3 = 9)
   * 
   * Combination Rules (15% of puzzles):
   * [2] [3] [5]     Row rule: a + b = c
   * [4] [2] [6]     Addition relationship
   * [1] [6] [?]     Answer: 7 (1 + 6 = 7)
   * 
   * [2] [3] [1]     Row rule: (a × b) - c = 5
   * [4] [2] [3]     Formula: (4 × 2) - 3 = 5
   * [1] [6] [?]     Answer: 1 ((1 × 6) - 1 = 5)
   * 
   * Difficulty Distribution:
   * - Easy (30%): Simple arithmetic, clear patterns
   * - Easy-Medium (20%): Basic magic squares, addition rules
   * - Medium (20%): Cross relationships, progressive patterns  
   * - Hard (20%): Complex formulas, multi-step operations
   * - Very Hard (10%): Advanced combinations, irregular patterns
   */
  
  /**
   * Helper function to convert number grid to string grid for UI compatibility
   */
  private convertToStringGrid(numberGrid: (number | null)[][]): string[][] {
    return numberGrid.map(row => 
      row.map(cell => cell === null ? '' : cell.toString())
    );
  }
  
  /**
   * Helper to create a puzzle with both string and number grids
   */
  private createPuzzle(
    question: string,
    numberGrid: (number | null)[][],
    options: string[],
    correctAnswerIndex: number,
    explanation: string,
    ruleType: GridRuleType,
    numericDifficulty: 1 | 2 | 3 | 4 | 5,
    missingPosition: [number, number],
    rule: string,
    expectedSum?: number
  ): NumberGridPuzzle {
    const semanticDifficulty = this.determineDifficulty(ruleType);
    const semanticId = SemanticIdGenerator.generateSemanticId('number-grid', ruleType, semanticDifficulty);
    
    return {
      question,
      grid: this.convertToStringGrid(numberGrid),
      numberGrid,
      options,
      correctAnswerIndex,
      explanation,
      ruleType,
      numericDifficulty,
      missingPosition,
      rule,
      expectedSum,
      puzzleType: 'number-grid',
      puzzleSubtype: ruleType,
      difficultyLevel: semanticDifficulty,
      semanticId
    };
  }


  /**
   * Generate adaptive number grid puzzle based on target difficulty
   */
  getAdaptive(targetDifficulty: number, recentPatterns?: string[]): NumberGridPuzzle {
    // For children (difficulty ≤ 0.4), provide only simple arithmetic grids
    if (targetDifficulty <= 0.4) {
      return this.generateSimpleArithmeticGrid(targetDifficulty);
    }

    // For older users, use full complexity
    return this.getRandom();
  }

  /**
   * Generate simple arithmetic grid suitable for children
   */
  private generateSimpleArithmeticGrid(targetDifficulty: number): NumberGridPuzzle {
    // Always use simple row/column arithmetic for children (the only "easy" type)
    const difficulty: 1 | 2 | 3 | 4 | 5 = 1; // Force easy difficulty

    // Generate simple addition patterns only
    const isRowPattern = Math.random() < 0.5;
    const startNum = Math.floor(Math.random() * 2) + 1; // 1-2 for very easy numbers
    const step = Math.floor(Math.random() * 2) + 1; // 1-2 for simpler steps

    const grid: (number | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    let answer = 0;
    const missingRow = Math.floor(Math.random() * 3);
    const missingCol = Math.floor(Math.random() * 3);

    if (isRowPattern) {
      // Each ROW follows the same addition pattern: start, start+step, start+2*step
      for (let row = 0; row < 3; row++) {
        const rowStartValue = startNum + row; // Each row starts differently
        for (let col = 0; col < 3; col++) {
          const value = rowStartValue + (col * step);

          if (row === missingRow && col === missingCol) {
            grid[row][col] = null;
            answer = value;
          } else {
            grid[row][col] = value;
          }
        }
      }
    } else {
      // Each COLUMN follows the same addition pattern: start, start+step, start+2*step
      for (let col = 0; col < 3; col++) {
        const colStartValue = startNum + col; // Each column starts differently
        for (let row = 0; row < 3; row++) {
          const value = colStartValue + (row * step);

          if (row === missingRow && col === missingCol) {
            grid[row][col] = null;
            answer = value;
          } else {
            grid[row][col] = value;
          }
        }
      }
    }

    // Generate child-friendly options (smaller range)
    const options = this.generateSimpleNumericOptions(answer.toString(), 2);

    return this.createPuzzle(
      'Find the missing number in the grid pattern.',
      grid,
      options,
      options.indexOf(answer.toString()),
      `Each ${isRowPattern ? 'row' : 'column'} follows an addition pattern where numbers increase by ${step}. Look for the pattern and find the missing number.`,
      GridRuleType.ROW_COLUMN_ARITHMETIC,
      difficulty,
      [missingRow, missingCol],
      `${isRowPattern ? 'Row' : 'Column'} addition pattern (+${step})`
    );
  }

  /**
   * Generate simple numeric options for child-friendly puzzles
   */
  private generateSimpleNumericOptions(correctAnswer: string, range: number = 2): string[] {
    const correct = parseInt(correctAnswer);
    const options = [correctAnswer];

    // Generate wrong options within smaller range for children
    let attempts = 0;
    const maxAttempts = 50;

    while (options.length < 4 && attempts < maxAttempts) {
      const variation = correct + Math.floor(Math.random() * (range * 2 + 1)) - range;
      const optionStr = variation.toString();
      if (variation > 0 && variation <= 15 && !options.includes(optionStr)) {
        options.push(optionStr);
      }
      attempts++;
    }

    // Fill remaining slots if needed with slightly larger range
    while (options.length < 4) {
      const expandedRange = range + 1;
      const variation = correct + Math.floor(Math.random() * (expandedRange * 2 + 1)) - expandedRange;
      const optionStr = variation.toString();
      if (variation > 0 && variation <= 20 && !options.includes(optionStr)) {
        options.push(optionStr);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }

  /**
   * Generate random number grid puzzle
   */
  getRandom(): NumberGridPuzzle {
    const ruleTypes = Object.values(GridRuleType);
    const ruleType = ruleTypes[Math.floor(Math.random() * ruleTypes.length)];
    const difficulty = this.getRandomDifficulty();

    switch (ruleType) {
      case GridRuleType.ROW_COLUMN_ARITHMETIC:
        return this.generateArithmeticGrid(difficulty);
      case GridRuleType.MAGIC_SQUARE:
        return this.generateMagicSquare(difficulty);
      case GridRuleType.CROSS_LOGIC:
        return this.generateCrossLogicGrid(difficulty);
      case GridRuleType.PROGRESSIVE_OPERATIONS:
        return this.generateProgressiveGrid(difficulty);
      case GridRuleType.COMBINATION_RULES:
        return this.generateCombinationGrid(difficulty);
      default:
        return this.generateArithmeticGrid(difficulty);
    }
  }

  private getRandomDifficulty(): 1 | 2 | 3 | 4 | 5 {
    const rand = Math.random();
    if (rand < 0.3) return 1;      // 30% easy
    if (rand < 0.5) return 2;      // 20% easy-medium  
    if (rand < 0.7) return 3;      // 20% medium
    if (rand < 0.9) return 4;      // 20% hard
    return 5;                      // 10% very hard
  }

  /**
   * Generate arithmetic grid puzzle (row/column patterns)
   */
  private generateArithmeticGrid(difficulty: 1 | 2 | 3 | 4 | 5): NumberGridPuzzle {
    // Simplify for 5-year-olds - use only addition patterns
    const isRowPattern = Math.random() < 0.5;
    const startNum = Math.floor(Math.random() * 3) + 1; // 1-3 for easier numbers
    const step = Math.floor(Math.random() * 2) + 1; // 1-2 for simpler steps

    const grid: (number | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    let answer = 0;
    const missingRow = Math.floor(Math.random() * 3);
    const missingCol = Math.floor(Math.random() * 3);

    if (isRowPattern) {
      // Each ROW follows the same addition pattern: start, start+step, start+2*step
      for (let row = 0; row < 3; row++) {
        const rowStartValue = startNum + row; // Each row starts differently
        for (let col = 0; col < 3; col++) {
          const value = rowStartValue + (col * step);

          if (row === missingRow && col === missingCol) {
            grid[row][col] = null;
            answer = value;
          } else {
            grid[row][col] = value;
          }
        }
      }
    } else {
      // Each COLUMN follows the same addition pattern: start, start+step, start+2*step
      for (let col = 0; col < 3; col++) {
        const colStartValue = startNum + col; // Each column starts differently
        for (let row = 0; row < 3; row++) {
          const value = colStartValue + (row * step);

          if (row === missingRow && col === missingCol) {
            grid[row][col] = null;
            answer = value;
          } else {
            grid[row][col] = value;
          }
        }
      }
    }

    const options = this.generateNumericOptions(answer.toString(), 3); // Wider range for options

    return this.createPuzzle(
      'Find the missing number in the grid pattern.',
      grid,
      options,
      options.indexOf(answer.toString()),
      `Each ${isRowPattern ? 'row' : 'column'} follows an addition pattern where numbers increase by ${step}. Look for the pattern and find the missing number.`,
      GridRuleType.ROW_COLUMN_ARITHMETIC,
      difficulty,
      [missingRow, missingCol],
      `${isRowPattern ? 'Row' : 'Column'} addition pattern (+${step})`
    );
  }

  /**
   * Generate magic square puzzle
   */
  private generateMagicSquare(difficulty: 1 | 2 | 3 | 4 | 5): NumberGridPuzzle {
    // Use the classic 3x3 magic square as a base and create variations
    const baseMagicSquares = [
      [[8, 1, 6], [3, 5, 7], [4, 9, 2]], // sum = 15
      [[2, 7, 6], [9, 5, 1], [4, 3, 8]], // sum = 15
      [[6, 1, 8], [7, 5, 3], [2, 9, 4]], // sum = 15
    ];
    
    const baseSquare = baseMagicSquares[Math.floor(Math.random() * baseMagicSquares.length)];
    const missingRow = Math.floor(Math.random() * 3);
    const missingCol = Math.floor(Math.random() * 3);
    
    // Create copy and remove one number
    const grid: (number | null)[][] = baseSquare.map(row => [...row]);
    const answer = grid[missingRow][missingCol];
    grid[missingRow][missingCol] = null;
    
    const options = this.generateNumericOptions(answer!.toString(), 2);
    
    return this.createPuzzle(
      'Complete this magic square where all rows, columns, and diagonals sum to 15.',
      grid,
      options,
      options.indexOf(answer!.toString()),
      'In a magic square, all rows, columns, and diagonals sum to 15. Calculate which number makes this possible.',
      GridRuleType.MAGIC_SQUARE,
      difficulty,
      [missingRow, missingCol],
      'Magic square with sum 15',
      15
    );
  }

  /**
   * Generate cross logic puzzle (center relates to neighbors)
   */
  private generateCrossLogicGrid(difficulty: 1 | 2 | 3 | 4 | 5): NumberGridPuzzle {
    const grid: (number | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    // Create a simple cross pattern: center equals sum of neighbors
    const centerValue = Math.floor(Math.random() * 3) + 4; // 4-6 for center

    // Place center value
    grid[1][1] = centerValue;

    // Generate adjacent values that sum to center (cross pattern)
    const top = Math.floor(Math.random() * 2) + 1; // 1-2
    const bottom = centerValue - top; // Make sure top + bottom = center
    const left = Math.floor(Math.random() * 2) + 1; // 1-2
    const right = centerValue - left; // Make sure left + right = center

    // Place cross values
    grid[0][1] = top;
    grid[1][0] = left;
    grid[1][2] = Math.max(1, right); // Ensure positive
    grid[2][1] = Math.max(1, bottom); // Ensure positive

    // Fill corners with simple values
    grid[0][0] = Math.floor(Math.random() * 3) + 1;
    grid[0][2] = Math.floor(Math.random() * 3) + 1;
    grid[2][0] = Math.floor(Math.random() * 3) + 1;
    grid[2][2] = Math.floor(Math.random() * 3) + 1;

    // Pick a cross position to hide (not center or corners)
    const crossPositions = [[0, 1], [1, 0], [1, 2], [2, 1]];
    const hidePos = crossPositions[Math.floor(Math.random() * crossPositions.length)];
    const missingRow = hidePos[0];
    const missingCol = hidePos[1];

    const answer = grid[missingRow][missingCol];
    grid[missingRow][missingCol] = null;

    const options = this.generateNumericOptions(answer!.toString(), 3);

    return this.createPuzzle(
      'Find the missing number in the cross pattern.',
      grid,
      options,
      options.indexOf(answer!.toString()),
      `The center number (${centerValue}) equals the sum of numbers above and below it, and also equals the sum of numbers to its left and right.`,
      GridRuleType.CROSS_LOGIC,
      difficulty,
      [missingRow, missingCol],
      'Cross addition pattern'
    );
  }

  /**
   * Generate progressive operations puzzle
   */
  private generateProgressiveGrid(difficulty: 1 | 2 | 3 | 4 | 5): NumberGridPuzzle {
    // Simplify for 5-year-olds - only simple addition progressions
    const startNum = Math.floor(Math.random() * 2) + 1; // 1-2
    const step = Math.floor(Math.random() * 2) + 1; // 1-2

    const grid: (number | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    let answer = 0;
    const missingRow = Math.floor(Math.random() * 3);
    const missingCol = Math.floor(Math.random() * 3);

    // Each position follows: (row * 3 + col) * step + startNum
    // This creates a progressive pattern across the entire grid
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const position = row * 3 + col; // 0-8
        const value = startNum + (position * step);

        if (row === missingRow && col === missingCol) {
          answer = value;
          grid[row][col] = null;
        } else {
          grid[row][col] = value;
        }
      }
    }

    const options = this.generateNumericOptions(answer.toString(), 3);

    return this.createPuzzle(
      'Find the missing number in the counting sequence.',
      grid,
      options,
      options.indexOf(answer.toString()),
      `The numbers follow a counting sequence, increasing by ${step} from left to right, top to bottom.`,
      GridRuleType.PROGRESSIVE_OPERATIONS,
      difficulty,
      [missingRow, missingCol],
      `Progressive counting (+${step})`
    );
  }

  /**
   * Generate combination rules puzzle
   */
  private generateCombinationGrid(difficulty: 1 | 2 | 3 | 4 | 5): NumberGridPuzzle {
    // Simple rule for 5-year-olds: first + second = third in each row
    const grid: (number | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    let answer = 0;
    const missingRow = Math.floor(Math.random() * 3);
    const missingCol = Math.floor(Math.random() * 3);

    // Generate values where A + B = C in each row
    for (let row = 0; row < 3; row++) {
      const a = Math.floor(Math.random() * 3) + 1; // 1-3
      const b = Math.floor(Math.random() * 3) + 1; // 1-3
      const c = a + b;

      grid[row][0] = a;
      grid[row][1] = b;
      grid[row][2] = c;

      if (row === missingRow && missingCol === 0) {
        answer = a;
        grid[row][0] = null;
      } else if (row === missingRow && missingCol === 1) {
        answer = b;
        grid[row][1] = null;
      } else if (row === missingRow && missingCol === 2) {
        answer = c;
        grid[row][2] = null;
      }
    }

    const options = this.generateNumericOptions(answer.toString(), 3);

    return this.createPuzzle(
      'Find the missing number using the addition rule.',
      grid,
      options,
      options.indexOf(answer.toString()),
      'In each row, the first number plus the second number equals the third number (A + B = C).',
      GridRuleType.COMBINATION_RULES,
      difficulty,
      [missingRow, missingCol],
      'Row addition rule (A + B = C)'
    );
  }

  /**
   * Generate numeric options for multiple choice
   */
  private generateNumericOptions(correctAnswer: string, range: number = 3): string[] {
    const correct = parseInt(correctAnswer);
    const options = [correctAnswer];

    // Generate wrong options within range
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    while (options.length < 4 && attempts < maxAttempts) {
      const variation = correct + Math.floor(Math.random() * (range * 2 + 1)) - range;
      const optionStr = variation.toString();
      if (variation > 0 && !options.includes(optionStr)) {
        options.push(optionStr);
      }
      attempts++;
    }

    // If we couldn't generate 4 options within range, expand the range
    while (options.length < 4) {
      const expandedRange = range + Math.floor(options.length);
      const variation = correct + Math.floor(Math.random() * (expandedRange * 2 + 1)) - expandedRange;
      const optionStr = variation.toString();
      if (variation > 0 && !options.includes(optionStr)) {
        options.push(optionStr);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }
}

// Export singleton instance
export const numberGridPuzzleGenerator = new NumberGridPuzzleGenerator();


/**
 * @deprecated Use numberGridPuzzleGenerator.getRandom() instead
 * Legacy function for backward compatibility
 */
export function generateRandomNumberGridPuzzle(): NumberGridPuzzle {
  return numberGridPuzzleGenerator.getRandom();
}