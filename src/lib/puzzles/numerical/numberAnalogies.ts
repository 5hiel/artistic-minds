import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

export interface NumberAnalogyPuzzle extends BasePuzzle {
  firstPair: [number, number];    // A : B
  secondPair: [number, number?];  // C : ? (? is undefined)
  relationshipType: 'arithmetic' | 'multiplicative' | 'exponential' | 'inverse';
  operationType: string;          // e.g., "add 3", "multiply by 2", "square"
}

/**
 * Number Analogies Puzzle Generator
 * Generates A:B as C:? numerical relationship puzzles for quantitative reasoning.
 */
export class NumberAnalogyPuzzleGenerator extends BasePuzzleGenerator<NumberAnalogyPuzzle> {
  
  private determineDifficulty(relationshipType: 'arithmetic' | 'multiplicative' | 'exponential' | 'inverse'): 'easy' | 'medium' | 'hard' {
    // FIXED: Number analogies require abstract relational thinking - all are advanced cognitive skills
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'arithmetic': 'hard',      // Age 12+: 2:4::3:? requires understanding proportional relationships
      'multiplicative': 'hard',  // Age 14+: Multiplicative relationships require advanced math concepts
      'exponential': 'hard',     // Age 16+: Exponential thinking requires advanced mathematical reasoning
      'inverse': 'hard'          // Age 16+: Inverse relationships are very abstract concepts
    };
    return difficultyMap[relationshipType] || 'hard'; // Default to hard - all analogies are advanced
  }
  
  /**
   * Example number analogy puzzles that the dynamic generator creates for developer reference:
   * 
   * Arithmetic Relationships (40% of puzzles):
   * 2 : 4 :: 3 : ?      Add 2: 2+2=4, so 3+2=5
   * 5 : 8 :: 7 : ?      Add 3: 5+3=8, so 7+3=10
   * 7 : 12 :: 9 : ?     Add 5: 7+5=12, so 9+5=14
   * 12 : 9 :: 15 : ?    Subtract 3: 12-3=9, so 15-3=12
   * 16 : 12 :: 20 : ?   Subtract 4: 16-4=12, so 20-4=16
   * 
   * Multiplicative Relationships (40% of puzzles):
   * 2 : 4 :: 3 : ?      Multiply by 2: 2×2=4, so 3×2=6
   * 4 : 12 :: 5 : ?     Multiply by 3: 4×3=12, so 5×3=15
   * 3 : 12 :: 2 : ?     Multiply by 4: 3×4=12, so 2×4=8
   * 10 : 5 :: 8 : ?     Divide by 2: 10÷2=5, so 8÷2=4
   * 6 : 3 :: 10 : ?     Divide by 2: 6÷2=3, so 10÷2=5
   * 
   * Exponential Relationships (20% of puzzles):
   * 3 : 9 :: 4 : ?      Square: 3²=9, so 4²=16
   * 1 : 1 :: 5 : ?      Square: 1²=1, so 5²=25
   * 2 : 8 :: 3 : ?      Cube: 2³=8, so 3³=27
   * 
   * Number Range Controls:
   * - Arithmetic: 1-20 range, avoid negatives
   * - Multiplicative: 2-16 range, ensure clean division
   * - Exponential: 2-6 range, keep results manageable
   * 
   * Answer Generation:
   * - Creates 3 plausible distractors based on relationship type
   * - Arithmetic: ±1, ±2, ±3 variations from correct answer
   * - Multiplicative: Half/double or nearby multiples
   * - Exponential: Powers of nearby numbers or arithmetic errors
   * 
   * Question Format: "A : B :: C : ?" with numeric relationships
   */
  
  /**
   * Generate adaptive number analogy puzzle based on target difficulty
   */
  getAdaptive(targetDifficulty: number, recentPatterns?: string[]): NumberAnalogyPuzzle {
    // For children (difficulty ≤ 0.4), provide simpler arithmetic analogies
    if (targetDifficulty <= 0.4) {
      return this.generateSimpleArithmeticAnalogy(targetDifficulty);
    }

    // For older users, use full complexity
    return this.getRandom();
  }

  /**
   * Generate simple arithmetic analogies suitable for children
   */
  private generateSimpleArithmeticAnalogy(targetDifficulty: number): NumberAnalogyPuzzle {
    // Use only simple addition for young children
    const simpleOperations = [
      { type: 'add', value: 1, description: 'add 1' },
      { type: 'add', value: 2, description: 'add 2' },
      { type: 'add', value: 3, description: 'add 3' }
    ];

    const operation = simpleOperations[Math.floor(Math.random() * simpleOperations.length)];

    // Use smaller numbers (1-8) for easier computation
    const firstNum = this.getRandomNumber(1, 8);
    const secondNum = this.applyOperation(firstNum, operation);
    const thirdNum = this.getRandomNumber(1, 8, firstNum);
    const correctAnswer = this.applyOperation(thirdNum, operation);

    // Generate simpler distractors with smaller variations
    const allOptions = this.generateSimpleOptions(correctAnswer);

    // Shuffle the options to randomize correct answer position
    const options = this.shuffleArray(allOptions);
    const correctIndex = options.indexOf(correctAnswer.toString());

    // Override difficulty to 'easy' for child-appropriate content
    const semanticId = SemanticIdGenerator.generateSemanticId('number-analogy', 'arithmetic', 'easy');

    return {
      question: `${firstNum} : ${secondNum} :: ${thirdNum} : ?`,
      firstPair: [firstNum, secondNum],
      secondPair: [thirdNum, undefined],
      options: options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(firstNum, secondNum, thirdNum, correctAnswer, operation),
      relationshipType: 'arithmetic',
      operationType: operation.description,
      puzzleType: 'number-analogy',
      puzzleSubtype: 'arithmetic',
      difficultyLevel: 'easy', // Child-appropriate difficulty
      semanticId
    };
  }

  /**
   * Generate simpler options for child-friendly analogies
   */
  private generateSimpleOptions(correctAnswer: number): string[] {
    const options = new Set<string>();
    options.add(correctAnswer.toString());

    // Generate distractors with ±1, ±2 variations only
    const variations = [1, 2];

    for (const variation of variations) {
      if (options.size >= 4) break;

      // Add positive variation
      const higher = correctAnswer + variation;
      if (higher > 0 && higher <= 20 && !options.has(higher.toString())) {
        options.add(higher.toString());
      }

      // Add negative variation
      const lower = correctAnswer - variation;
      if (lower > 0 && !options.has(lower.toString())) {
        options.add(lower.toString());
      }
    }

    // Fill remaining slots if needed
    while (options.size < 4) {
      const fallback = correctAnswer + (options.size * 3);
      if (fallback > 0 && fallback <= 20 && !options.has(fallback.toString())) {
        options.add(fallback.toString());
      }
    }

    return Array.from(options);
  }

  /**
   * Dynamically generate a random number analogy puzzle
   */
  getRandom(): NumberAnalogyPuzzle {
    const templates = this.getAnalogieTemplates();
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate specific values for this instance
    const firstNum = this.getRandomNumber(template.range.min, template.range.max);
    const secondNum = this.applyOperation(firstNum, template.operation);
    const thirdNum = this.getRandomNumber(template.range.min, template.range.max, firstNum);
    const correctAnswer = this.applyOperation(thirdNum, template.operation);

    // Generate distractors (generateOptions already includes correct answer)
    const allOptions = this.generateOptions(correctAnswer, template.relationshipType);

    // Shuffle the options to randomize correct answer position
    const options = this.shuffleArray(allOptions);
    const correctIndex = options.indexOf(correctAnswer.toString());

    const difficultyLevel = this.determineDifficulty(template.relationshipType);
    const semanticId = SemanticIdGenerator.generateSemanticId('number-analogy', template.relationshipType, difficultyLevel);

    return {
      question: `${firstNum} : ${secondNum} :: ${thirdNum} : ?`,
      firstPair: [firstNum, secondNum],
      secondPair: [thirdNum, undefined],
      options: options,
      correctAnswerIndex: correctIndex,
      explanation: this.generateExplanation(firstNum, secondNum, thirdNum, correctAnswer, template.operation),
      relationshipType: template.relationshipType,
      operationType: template.operation.description,
      puzzleType: 'number-analogy',
      puzzleSubtype: template.relationshipType,
      difficultyLevel,
      semanticId
    };
  }
  
  private getAnalogieTemplates() {
    return [
      {
        operation: { type: 'add', value: 2, description: 'add 2' },
        relationshipType: 'arithmetic' as const,
        range: { min: 1, max: 15 }
      },
      {
        operation: { type: 'add', value: 3, description: 'add 3' },
        relationshipType: 'arithmetic' as const,
        range: { min: 1, max: 15 }
      },
      {
        operation: { type: 'add', value: 5, description: 'add 5' },
        relationshipType: 'arithmetic' as const,
        range: { min: 1, max: 12 }
      },
      {
        operation: { type: 'subtract', value: 2, description: 'subtract 2' },
        relationshipType: 'arithmetic' as const,
        range: { min: 5, max: 20 }
      },
      {
        operation: { type: 'subtract', value: 3, description: 'subtract 3' },
        relationshipType: 'arithmetic' as const,
        range: { min: 6, max: 20 }
      },
      {
        operation: { type: 'multiply', value: 2, description: 'multiply by 2' },
        relationshipType: 'multiplicative' as const,
        range: { min: 2, max: 8 }
      },
      {
        operation: { type: 'multiply', value: 3, description: 'multiply by 3' },
        relationshipType: 'multiplicative' as const,
        range: { min: 2, max: 6 }
      },
      {
        operation: { type: 'divide', value: 2, description: 'divide by 2' },
        relationshipType: 'multiplicative' as const,
        range: { min: 4, max: 16 }
      },
      {
        operation: { type: 'square', value: 2, description: 'square' },
        relationshipType: 'exponential' as const,
        range: { min: 2, max: 6 }
      },
      {
        operation: { type: 'cube', value: 3, description: 'cube' },
        relationshipType: 'exponential' as const,
        range: { min: 2, max: 4 }
      }
    ];
  }
  
  private getRandomNumber(min: number, max: number, avoid?: number): number {
    let num;
    do {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (num === avoid);
    return num;
  }
  
  private applyOperation(num: number, operation: { type: string, value: number }): number {
    switch (operation.type) {
      case 'add':
        return num + operation.value;
      case 'subtract':
        return Math.max(1, num - operation.value);
      case 'multiply':
        return num * operation.value;
      case 'divide':
        return Math.floor(num / operation.value);
      case 'square':
        return num * num;
      case 'cube':
        return num * num * num;
      default:
        return num;
    }
  }
  
  private generateOptions(correctAnswer: number, relationshipType: string): string[] {
    const options = new Set<string>();
    options.add(correctAnswer.toString());
    
    // Generate plausible distractors based on relationship type
    let attempts = 0;
    const maxAttempts = 20; // Prevent infinite loops
    
    while (options.size < 4 && attempts < maxAttempts) {
      let distractor: number;
      attempts++;
      
      switch (relationshipType) {
        case 'arithmetic':
          // Add/subtract small variations with more variety
          const offset = Math.floor(Math.random() * 6) + 1; // 1-6
          distractor = correctAnswer + (Math.random() < 0.5 ? -offset : offset);
          break;
        case 'multiplicative':
          // Multiply/divide by small factors with more variety
          const factor = 0.4 + Math.random() * 1.2; // 0.4 to 1.6
          distractor = Math.floor(correctAnswer * factor);
          break;
        case 'exponential':
          // Powers and roots create large variations
          const expFactor = 0.2 + Math.random() * 0.8; // 0.2 to 1.0
          distractor = Math.floor(correctAnswer * expFactor);
          break;
        default:
          // More varied default distractors
          const defaultOffset = Math.floor(Math.random() * 8) + 1; // 1-8
          distractor = correctAnswer + (Math.random() < 0.5 ? -defaultOffset : defaultOffset);
      }
      
      if (distractor > 0 && distractor !== correctAnswer && !options.has(distractor.toString())) {
        options.add(distractor.toString());
      }
    }
    
    // If we still don't have enough options, add some fallback distractors
    while (options.size < 4) {
      const fallbackDistractor = correctAnswer + (options.size - 2) * 3; // Spread out by 3
      if (fallbackDistractor > 0 && fallbackDistractor !== correctAnswer) {
        options.add(fallbackDistractor.toString());
      } else {
        // Use negative offsets if positive ones don't work
        const negativeDistractor = Math.abs(correctAnswer - (options.size * 2));
        if (negativeDistractor > 0 && negativeDistractor !== correctAnswer) {
          options.add(negativeDistractor.toString());
        }
      }
    }
    
    return Array.from(options);
  }
  
  private shuffleArray(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  private generateExplanation(first: number, second: number, third: number, answer: number, operation: { type: string, value: number, description: string }): string {
    switch (operation.type) {
      case 'add':
        return `The relationship is adding ${operation.value}: ${first} + ${operation.value} = ${second}, so ${third} + ${operation.value} = ${answer}.`;
      case 'subtract':
        return `The relationship is subtracting ${operation.value}: ${first} - ${operation.value} = ${second}, so ${third} - ${operation.value} = ${answer}.`;
      case 'multiply':
        return `The relationship is multiplying by ${operation.value}: ${first} × ${operation.value} = ${second}, so ${third} × ${operation.value} = ${answer}.`;
      case 'divide':
        return `The relationship is dividing by ${operation.value}: ${first} ÷ ${operation.value} = ${second}, so ${third} ÷ ${operation.value} = ${answer}.`;
      case 'square':
        return `The relationship is squaring: ${first}² = ${second}, so ${third}² = ${answer}.`;
      case 'cube':
        return `The relationship is cubing: ${first}³ = ${second}, so ${third}³ = ${answer}.`;
      default:
        return `The relationship follows ${operation.description}: ${first} → ${second}, so ${third} → ${answer}.`;
    }
  }
}

// Export singleton instance and legacy functions for backward compatibility
export const numberAnalogyPuzzleGenerator = new NumberAnalogyPuzzleGenerator();


/**
 * @deprecated Use numberAnalogyPuzzleGenerator.getRandom() instead  
 */
export function generateRandomNumberAnalogyPuzzle(): NumberAnalogyPuzzle & { type: string; correctAnswer: string } {
  const puzzle = numberAnalogyPuzzleGenerator.getRandom();
  return {
    ...puzzle,
    type: 'numberAnalogy',
    correctAnswer: puzzle.options[puzzle.correctAnswerIndex]
  };
}

export default numberAnalogyPuzzleGenerator;