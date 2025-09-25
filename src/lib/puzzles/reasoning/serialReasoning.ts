import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator, ExplanationGenerator } from '@/src/lib/game/basePuzzle';

export interface SerialReasoningPuzzle extends BasePuzzle {
  grid: string[][]; // Matrix puzzles always have grids
  matrixType: 'numeric' | 'symbolic' | 'shape';
}

/**
 * Serial Reasoning Puzzle Generator
 * Generates matrix completion puzzles (Raven's Progressive Matrices style) for logical reasoning.
 */
export class SerialReasoningPuzzleGenerator extends BasePuzzleGenerator<SerialReasoningPuzzle> {
  
  private determineDifficulty(subtype: string): 'easy' | 'medium' | 'hard' {
    // FIXED: Matrix reasoning requires abstract thinking - Raven's Progressive Matrices style
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'numeric': 'easy',      // Age 6-8: Simple numerical pattern matrices - changed from medium to easy
      'symbolic': 'hard',     // Age 12+: Abstract symbol manipulation - advanced cognitive skill
      'shape': 'hard'         // Age 12+: Spatial transformation matrices - very advanced
    };
    return difficultyMap[subtype] || 'hard'; // Default to hard - matrix reasoning is advanced
  }

  /**
   * Example matrix puzzles that the dynamic generator creates for developer reference:
   * 
   * Numeric Arithmetic Progression:
   * [1] [2] [3]    Each cell increases by step value (1, 2, 3, or 5)
   * [4] [5] [6]    Follows row-by-row or continuous sequence
   * [7] [8] [?]    Answer: next number in sequence (9)
   * 
   * [2] [4] [6]    Step of 2
   * [8] [10][12]   
   * [14][16][?]    Answer: 18
   * 
   * Shape Pattern Matrix:
   * [△] [△] [△]    Same shapes in each row
   * [▽] [▽] [▽]    Different shape per row
   * [?] [△] [▽]    Answer: ▽ (following row pattern)
   * 
   * [○] [●] [○]    Checkerboard alternating pattern  
   * [●] [○] [●]    Light/dark alternates by position
   * [○] [?] [○]    Answer: ● (middle position should be dark)
   * 
   * Symbolic Transformation:
   * [⬜] [⬛] [⬜]   Checkerboard pattern with squares
   * [⬛] [⬜] [⬛]   Each position follows alternating rule
   * [⬜] [?] [⬜]   Answer: ⬛ (position needs dark square)
   * 
   * [★] [☆] [★]    Filled/outlined star alternation
   * [☆] [★] [☆]    Pattern based on position parity  
   * [★] [?] [★]    Answer: ☆ (outline star for middle)
   */
  
  /**
   * Generate adaptive serial reasoning puzzle based on target difficulty
   */
  getAdaptive(targetDifficulty: number, recentPatterns?: string[]): SerialReasoningPuzzle {
    // For children (difficulty ≤ 0.4), only use numeric matrices (marked as 'easy')
    if (targetDifficulty <= 0.4) {
      return this.generateNumericMatrix();
    }

    // For older users, allow all matrix types including advanced symbolic/shape puzzles
    return this.getRandom();
  }

  /**
   * Dynamically generate a random matrix puzzle
   */
  getRandom(): SerialReasoningPuzzle {
    const matrixTypes: ('numeric' | 'symbolic' | 'shape')[] = ['numeric', 'symbolic', 'shape'];
    const matrixType = matrixTypes[Math.floor(Math.random() * matrixTypes.length)];
    
    switch (matrixType) {
      case 'numeric':
        return this.generateNumericMatrix();
      case 'symbolic':
        return this.generateSymbolicMatrix();
      case 'shape':
        return this.generateShapeMatrix();
    }
  }
  
  private generateNumericMatrix(): SerialReasoningPuzzle {
    const steps = [1, 2, 3, 5, 10];
    const step = steps[Math.floor(Math.random() * steps.length)];
    const startNum = Math.floor(Math.random() * 10) + 1;
    
    const grid: string[][] = [];
    let currentNum = startNum;
    
    for (let row = 0; row < 3; row++) {
      grid[row] = [];
      for (let col = 0; col < 3; col++) {
        if (row === 2 && col === 2) {
          grid[row][col] = ''; // Hide last cell
        } else {
          grid[row][col] = currentNum.toString();
          currentNum += step;
        }
      }
    }
    
    const answer = (startNum + (8 * step)).toString();
    const options = this.generateNumericOptions(answer, step);
    
    const difficultyLevel = this.determineDifficulty('numeric');
    const semanticId = SemanticIdGenerator.generateSemanticId('serial-reasoning', 'numeric', difficultyLevel);
    
    return {
      question: 'What number completes the matrix?',
      grid,
      options,
      correctAnswerIndex: options.indexOf(answer),
      explanation: ExplanationGenerator.generateMatrixExplanation('numeric', { step, isRowPattern: true }),
      matrixType: 'numeric',
      puzzleType: 'serial-reasoning',
      puzzleSubtype: 'numeric',
      difficultyLevel,
      semanticId
    };
  }
  
  private generateSymbolicMatrix(): SerialReasoningPuzzle {
    // Fun and vibrant symbols for engaging puzzles
    const symbols = ['🌟', '⭐', '✨', '🎊', '🎉', '🍭', '🦄', '🚀', '⚡', '🌈', '🎯', '🎪', '🎭', '🎨', '🎮', '🎵'];
    const symbol1 = symbols[Math.floor(Math.random() * symbols.length)];
    let symbol2 = symbols[Math.floor(Math.random() * symbols.length)];
    while (symbol2 === symbol1) {
      symbol2 = symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    const patterns = ['checkerboard', 'rows', 'columns'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const grid: string[][] = [];
    let answer = '';
    
    for (let row = 0; row < 3; row++) {
      grid[row] = [];
      for (let col = 0; col < 3; col++) {
        if (row === 2 && col === 2) {
          grid[row][col] = ''; // Hide last cell
        } else {
          let cellSymbol = '';
          switch (pattern) {
            case 'checkerboard':
              cellSymbol = (row + col) % 2 === 0 ? symbol1 : symbol2;
              break;
            case 'rows':
              cellSymbol = row % 2 === 0 ? symbol1 : symbol2;
              break;
            case 'columns':
              cellSymbol = col % 2 === 0 ? symbol1 : symbol2;
              break;
          }
          grid[row][col] = cellSymbol;
        }
      }
    }
    
    // Calculate answer based on pattern
    switch (pattern) {
      case 'checkerboard':
        answer = (2 + 2) % 2 === 0 ? symbol1 : symbol2; // row 2, col 2
        break;
      case 'rows':
        answer = 2 % 2 === 0 ? symbol1 : symbol2;
        break;
      case 'columns':
        answer = 2 % 2 === 0 ? symbol1 : symbol2;
        break;
    }
    
    // Generate unique options: correct answer + 3 different wrong options
    const uniqueOptions = [answer];
    const usedSymbols = new Set([answer]);
    
    // Add remaining symbols that aren't already used
    for (const symbol of symbols) {
      if (!usedSymbols.has(symbol) && uniqueOptions.length < 4) {
        uniqueOptions.push(symbol);
        usedSymbols.add(symbol);
      }
    }
    
    // If we still need more options, generate them randomly but ensure uniqueness
    while (uniqueOptions.length < 4) {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      if (!usedSymbols.has(randomSymbol)) {
        uniqueOptions.push(randomSymbol);
        usedSymbols.add(randomSymbol);
      }
    }
    
    // Shuffle options
    for (let i = uniqueOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueOptions[i], uniqueOptions[j]] = [uniqueOptions[j], uniqueOptions[i]];
    }
    
    const difficultyLevel = this.determineDifficulty('symbolic');
    const semanticId = SemanticIdGenerator.generateSemanticId('serial-reasoning', 'symbolic', difficultyLevel);
    
    return {
      question: 'Which symbol completes the matrix?',
      grid,
      options: uniqueOptions.slice(0, 4),
      correctAnswerIndex: uniqueOptions.indexOf(answer),
      explanation: ExplanationGenerator.generateMatrixExplanation('symbolic', { isShift: false }),
      matrixType: 'symbolic',
      puzzleType: 'serial-reasoning',
      puzzleSubtype: 'symbolic',
      difficultyLevel,
      semanticId
    };
  }
  
  private generateShapeMatrix(): SerialReasoningPuzzle {
    // Fun and engaging shapes for better user experience
    const shapes = ['🌟', '🎭', '🎪', '🎯', '🎸', '🍭', '🦄', '🚀', '⚡', '🌈', '🎨', '🎮', '🎲', '🎵', '🍕', '🌙'];
    const primaryShape = shapes[Math.floor(Math.random() * shapes.length)];
    const secondaryShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const patterns = ['same-row', 'alternating', 'diagonal'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const grid: string[][] = [];
    let answer = '';
    
    for (let row = 0; row < 3; row++) {
      grid[row] = [];
      for (let col = 0; col < 3; col++) {
        if (row === 1 && col === 1) {
          grid[row][col] = ''; // Hide middle cell instead
        } else {
          let cellShape = '';
          switch (pattern) {
            case 'same-row':
              cellShape = row === 0 ? primaryShape : (row === 1 ? secondaryShape : primaryShape);
              break;
            case 'alternating':
              cellShape = (row + col) % 2 === 0 ? primaryShape : secondaryShape;
              break;
            case 'diagonal':
              cellShape = row === col ? primaryShape : secondaryShape;
              break;
          }
          grid[row][col] = cellShape;
        }
      }
    }
    
    // Calculate answer for middle cell (1,1)
    switch (pattern) {
      case 'same-row':
        answer = secondaryShape;
        break;
      case 'alternating':
        answer = (1 + 1) % 2 === 0 ? primaryShape : secondaryShape;
        break;
      case 'diagonal':
        answer = 1 === 1 ? primaryShape : secondaryShape; // diagonal
        break;
    }
    
    // Generate unique options: correct answer + 3 different wrong options
    const uniqueOptions = [answer];
    const usedShapes = new Set([answer]);
    
    // Add remaining shapes that aren't already used
    for (const shape of shapes) {
      if (!usedShapes.has(shape) && uniqueOptions.length < 4) {
        uniqueOptions.push(shape);
        usedShapes.add(shape);
      }
    }
    
    // If we still need more options, generate them randomly but ensure uniqueness
    while (uniqueOptions.length < 4) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      if (!usedShapes.has(randomShape)) {
        uniqueOptions.push(randomShape);
        usedShapes.add(randomShape);
      }
    }
    
    // Shuffle options
    for (let i = uniqueOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueOptions[i], uniqueOptions[j]] = [uniqueOptions[j], uniqueOptions[i]];
    }
    
    const difficultyLevel = this.determineDifficulty('shape');
    const semanticId = SemanticIdGenerator.generateSemanticId('serial-reasoning', 'shape', difficultyLevel);
    
    return {
      question: 'Find the missing shape in the matrix.',
      grid,
      options: uniqueOptions.slice(0, 4),
      correctAnswerIndex: uniqueOptions.indexOf(answer),
      explanation: ExplanationGenerator.generateMatrixExplanation('shape', { transformation: `${pattern} pattern` }),
      matrixType: 'shape',
      puzzleType: 'serial-reasoning',
      puzzleSubtype: 'shape',
      difficultyLevel,
      semanticId
    };
  }
  
  private generateNumericOptions(correctAnswer: string, step: number): string[] {
    const answer = parseInt(correctAnswer);
    const options = [correctAnswer];
    
    // Add plausible incorrect options
    options.push((answer + step).toString());
    options.push((answer - step).toString());
    options.push((answer + step * 2).toString());
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  }
}

// Export singleton instance and legacy functions for backward compatibility
export const serialReasoningPuzzleGenerator = new SerialReasoningPuzzleGenerator();


/**
 * @deprecated Use serialReasoningPuzzleGenerator.getRandom() instead
 */
export function generateRandomSerialReasoningPuzzle(): SerialReasoningPuzzle & { type: string; correctAnswer: string } {
  const puzzle = serialReasoningPuzzleGenerator.getRandom();
  return {
    ...puzzle,
    type: 'serialReasoning',
    correctAnswer: puzzle.options[puzzle.correctAnswerIndex]
  };
}

export default serialReasoningPuzzleGenerator;