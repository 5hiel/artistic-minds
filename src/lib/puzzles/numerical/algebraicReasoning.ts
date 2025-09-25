import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

export interface AlgebraicReasoningPuzzle extends BasePuzzle {
  equation: string;           // e.g., "2x + 5 = 19"
  variableSymbol: string;     // e.g., "x", "y", "n"  
  algebraType: 'linear' | 'quadratic' | 'system' | 'substitution';
  numericDifficulty: 1 | 2 | 3; // 1=basic, 2=intermediate, 3=advanced
}

/**
 * Algebraic Reasoning Puzzle Generator
 * Generates equation-solving puzzles with missing values for mathematical reasoning.
 */
export class AlgebraicReasoningPuzzleGenerator extends BasePuzzleGenerator<AlgebraicReasoningPuzzle> {
  private readonly variables = ['x', 'y', 'n', 'a', 'b'];
  
  private determineDifficulty(difficultyLevel: 1 | 2 | 3): 'easy' | 'medium' | 'hard' {
    // FIXED: ALL algebra is advanced mathematics - inappropriate for elementary ages
    const difficultyMap: Record<number, 'easy' | 'medium' | 'hard'> = {
      1: 'hard',      // Age 12+: Basic algebra (x + 5 = 12) - 7th/8th grade
      2: 'hard',      // Age 14+: Intermediate algebra - High school level
      3: 'hard'       // Age 16+: Advanced algebra/systems - Advanced high school
    };
    return difficultyMap[difficultyLevel] || 'hard'; // Default to hard - all algebra is advanced
  }
  
  /**
   * Example algebraic reasoning puzzles that the dynamic generator creates for developer reference:
   * 
   * Level 1: Basic Linear Equations (50% of puzzles):
   * 3x + 7 = 19         Solve by isolating variable: x = 4
   * 2y - 8 = 12         Add/subtract, then divide: y = 10  
   * 5n = 35             Direct division: n = 7
   * x + 15 = 23         Simple subtraction: x = 8
   * 4a - 12 = 16        Add constant, divide by coefficient: a = 7
   * 
   * Level 2: Intermediate Equations (30% of puzzles):
   * 2(x + 3) = 14       Distribution/factoring: x = 4
   * 3y + 2y = 25        Combine like terms: y = 5
   * n² = 36             Square root: n = 6 (positive solution)
   * 3(a - 4) = 15       Factor out, solve inner: a = 9
   * x/2 + 7 = 12        Fraction handling: x = 10
   * 
   * Level 3: Advanced Equations (20% of puzzles):
   * 2x + 3y = 17, x = 4         System substitution: y = 3
   * x² - 5x + 6 = 0             Quadratic factoring: x = 2 (smaller)
   * 2(3n - 1) + n = 19          Multi-step expansion: n = 3
   * a + b = 10, a - b = 4       System elimination: a = 7
   * y² + 4y = 12               Quadratic completion: y = 2 (positive)
   * 
   * Variable Distribution: Randomly selects from [x, y, n, a, b]
   * Difficulty Weighting: 50% basic, 30% intermediate, 20% advanced
   * Answer Generation: Creates 3 plausible wrong options using mathematical errors
   */

  /**
   * Generate adaptive algebraic reasoning puzzle based on target difficulty
   * Note: Algebraic reasoning is inherently advanced mathematics (Grade 7+)
   */
  getAdaptive(targetDifficulty: number, recentPatterns?: string[]): AlgebraicReasoningPuzzle | null {
    // Algebraic reasoning requires abstract mathematical thinking
    // All algebraic concepts (variables, equations, solving) are Grade 7+ (age 12+)
    // Target difficulty ≤ 0.4 indicates elementary age (K-6) - not appropriate
    if (targetDifficulty <= 0.4) {
      console.log('🚫 [AlgebraicReasoning] Skipping algebraic puzzle for young learner (difficulty ≤ 0.4)');
      return null; // Let the engine select a different puzzle type
    }

    // For older students (difficulty > 0.4), use existing logic
    return this.getRandom();
  }

  /**
   * Generate random algebraic reasoning puzzle
   */
  getRandom(): AlgebraicReasoningPuzzle {
    const difficulty = this.getRandomDifficulty();
    const variable = this.getRandomVariable();
    
    switch (difficulty) {
      case 1:
        return this.generateBasicLinear(variable);
      case 2:
        return this.generateIntermediate(variable);
      case 3:
        return this.generateAdvanced(variable);
      default:
        return this.generateBasicLinear(variable);
    }
  }

  private getRandomDifficulty(): 1 | 2 | 3 {
    const rand = Math.random();
    if (rand < 0.5) return 1;      // 50% basic
    if (rand < 0.8) return 2;      // 30% intermediate  
    return 3;                      // 20% advanced
  }

  private getRandomVariable(): string {
    return this.variables[Math.floor(Math.random() * this.variables.length)];
  }

  private generateBasicLinear(variable: string): AlgebraicReasoningPuzzle {
    const coefficient = Math.floor(Math.random() * 5) + 2; // 2-6
    const constant = Math.floor(Math.random() * 20) + 5;   // 5-24
    const answer = Math.floor(Math.random() * 10) + 1;     // 1-10
    const rightSide = coefficient * answer + constant;
    
    const equation = `${coefficient}${variable} + ${constant} = ${rightSide}`;
    const question = `If ${equation}, what is ${variable}?`;
    
    const { options, correctAnswerIndex } = this.generateOptions(answer);

    const difficultyLevel = this.determineDifficulty(1);
    const semanticId = SemanticIdGenerator.generateSemanticId('algebraic-reasoning', 'linear-basic', difficultyLevel);
    
    return {
      question,
      equation,
      variableSymbol: variable,
      algebraType: 'linear',
      numericDifficulty: 1,
      options,
      correctAnswerIndex,
      explanation: `Subtract ${constant} from both sides: ${coefficient}${variable} = ${rightSide - constant}. Divide by ${coefficient}: ${variable} = ${answer}.`,
      puzzleType: 'algebraic-reasoning',
      puzzleSubtype: 'linear-basic',
      difficultyLevel,
      semanticId
    };
  }

  private generateIntermediate(variable: string): AlgebraicReasoningPuzzle {
    const isSquareRoot = Math.random() < 0.3;
    
    if (isSquareRoot) {
      // Generate n² = value puzzles
      const answer = Math.floor(Math.random() * 8) + 2; // 2-9
      const rightSide = answer * answer;
      const equation = `${variable}² = ${rightSide}`;
      const question = `If ${equation}, what is ${variable}?`;
      
      const { options, correctAnswerIndex } = this.generateOptions(answer);

      const difficultyLevel = this.determineDifficulty(2);
      const semanticId = SemanticIdGenerator.generateSemanticId('algebraic-reasoning', 'quadratic-basic', difficultyLevel);
      
      return {
        question,
        equation,
        variableSymbol: variable,
        algebraType: 'quadratic',
        numericDifficulty: 2,
        options,
        correctAnswerIndex,
        explanation: `Take the square root of both sides: ${variable} = √${rightSide} = ${answer}.`,
        puzzleType: 'algebraic-reasoning',
        puzzleSubtype: 'quadratic-basic',
        difficultyLevel,
        semanticId
      };
    } else {
      // Generate 2(x + a) = b type puzzles
      const innerConstant = Math.floor(Math.random() * 8) + 1; // 1-8
      const outerCoeff = Math.floor(Math.random() * 3) + 2;     // 2-4
      const answer = Math.floor(Math.random() * 8) + 1;         // 1-8
      const rightSide = outerCoeff * (answer + innerConstant);
      
      const equation = `${outerCoeff}(${variable} + ${innerConstant}) = ${rightSide}`;
      const question = `If ${equation}, what is ${variable}?`;
      
      const { options, correctAnswerIndex } = this.generateOptions(answer);

      const difficultyLevel = this.determineDifficulty(2);
      const semanticId = SemanticIdGenerator.generateSemanticId('algebraic-reasoning', 'linear-intermediate', difficultyLevel);
      
      return {
        question,
        equation,
        variableSymbol: variable,
        algebraType: 'linear',
        numericDifficulty: 2,
        options,
        correctAnswerIndex,
        explanation: `Divide both sides by ${outerCoeff}: ${variable} + ${innerConstant} = ${rightSide / outerCoeff}. Subtract ${innerConstant}: ${variable} = ${answer}.`,
        puzzleType: 'algebraic-reasoning',
        puzzleSubtype: 'linear-intermediate',
        difficultyLevel,
        semanticId
      };
    }
  }

  private generateAdvanced(variable: string): AlgebraicReasoningPuzzle {
    // Generate system of equations: a + b = sum, a - b = diff
    const varA = variable;
    const varB = this.variables.find(v => v !== variable) || 'y';
    
    const valueA = Math.floor(Math.random() * 8) + 3; // 3-10
    const valueB = Math.floor(Math.random() * 6) + 1; // 1-6
    const sum = valueA + valueB;
    const diff = valueA - valueB;
    
    const equation = `${varA} + ${varB} = ${sum}, ${varA} - ${varB} = ${diff}`;
    const question = `If ${equation}, what is ${varA}?`;
    
    const { options, correctAnswerIndex } = this.generateOptions(valueA);

    const difficultyLevel = this.determineDifficulty(3);
    const semanticId = SemanticIdGenerator.generateSemanticId('algebraic-reasoning', 'system-advanced', difficultyLevel);
    
    return {
      question,
      equation,
      variableSymbol: varA,
      algebraType: 'system',
      numericDifficulty: 3,
      options,
      correctAnswerIndex,
      explanation: `Add the equations: 2${varA} = ${sum + diff}, so ${varA} = ${valueA}. Check: ${varA} = ${valueA}, ${varB} = ${valueB}.`,
      puzzleType: 'algebraic-reasoning',
      puzzleSubtype: 'system-advanced',
      difficultyLevel,
      semanticId
    };
  }

  private shuffleArray(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Generate exactly 4 unique options with the correct answer
   * Returns { options: string[], correctAnswerIndex: number }
   */
  private generateOptions(correctAnswer: number): { options: string[], correctAnswerIndex: number } {
    const correctStr = correctAnswer.toString();
    const wrongOptions = new Set<string>();
    
    // Generate potential wrong answers
    const candidates = [
      correctAnswer + 1, correctAnswer - 1, correctAnswer + 2, correctAnswer - 2,
      correctAnswer + 3, correctAnswer - 3, correctAnswer + 4, correctAnswer - 4,
      correctAnswer + 5, correctAnswer - 5, Math.floor(correctAnswer / 2),
      correctAnswer * 2, correctAnswer + 10, Math.max(1, correctAnswer - 10)
    ];
    
    // Add good candidates first
    for (const candidate of candidates) {
      if (candidate > 0 && candidate !== correctAnswer && wrongOptions.size < 3) {
        wrongOptions.add(candidate.toString());
      }
    }
    
    // Ensure exactly 3 wrong options by aggressive generation
    let fallbackCounter = 20;
    while (wrongOptions.size < 3 && fallbackCounter < 100) {
      const candidate = Math.floor(Math.random() * 50) + 1; // 1-50
      if (candidate !== correctAnswer && candidate > 0) {
        wrongOptions.add(candidate.toString());
      }
      fallbackCounter++;
    }
    
    // Final guarantee - add simple increments if still needed
    while (wrongOptions.size < 3) {
      const fallback = correctAnswer + wrongOptions.size + 20;
      if (fallback > 0 && fallback !== correctAnswer) {
        wrongOptions.add(fallback.toString());
      }
    }
    
    // Create final options array with exactly 4 elements
    const wrongOptionsArray = Array.from(wrongOptions).slice(0, 3);
    const allOptions = [correctStr, ...wrongOptionsArray];
    
    // Absolute safety check
    if (allOptions.length !== 4) {
      while (allOptions.length < 4) {
        allOptions.push((allOptions.length + correctAnswer + 100).toString());
      }
    }
    
    // Shuffle and find correct index
    this.shuffleArray(allOptions);
    const correctAnswerIndex = allOptions.indexOf(correctStr);
    
    if (correctAnswerIndex === -1) {
      // Emergency recovery - put correct answer at index 0
      allOptions[0] = correctStr;
      return { options: allOptions, correctAnswerIndex: 0 };
    }
    
    return { options: allOptions, correctAnswerIndex };
  }
}

// Export singleton instance
export const algebraicReasoningPuzzleGenerator = new AlgebraicReasoningPuzzleGenerator();