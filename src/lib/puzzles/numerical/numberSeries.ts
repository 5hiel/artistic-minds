import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator } from '@/src/lib/game/basePuzzle';

export interface NumberSeriesPuzzle extends BasePuzzle {
  series: number[]; // The number series with last element hidden
  seriesType: 'arithmetic' | 'geometric' | 'mixed' | 'powers' | 'primes';
  hiddenIndex: number; // Index of the hidden number (usually last)
}

/**
 * Number Series Puzzle Generator
 * Generates sequences of numbers that follow logical rules for numerical pattern recognition.
 * Supports 5 categories: arithmetic, geometric, mixed operations, powers, and prime numbers.
 */
export class NumberSeriesPuzzleGenerator extends BasePuzzleGenerator<NumberSeriesPuzzle> {
  
  private determineDifficulty(seriesType: 'arithmetic' | 'geometric' | 'mixed' | 'powers' | 'primes', targetDifficulty?: number): 'easy' | 'medium' | 'hard' {
    // ENHANCED: Added support for adaptive medium difficulty targeting
    if (targetDifficulty !== undefined) {
      if (targetDifficulty <= 0.4) return 'easy';
      if (targetDifficulty <= 0.7) return 'medium';
      return 'hard';
    }

    // FIXED: Based on actual cognitive development and mathematical complexity
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'arithmetic': 'easy',      // Age 6-8: [2,4,6,8,?] simple counting patterns - changed from medium to easy
      'geometric': 'hard',       // Age 12+: [2,4,8,16,?] requires understanding multiplication/doubling
      'mixed': 'hard',           // Age 14+: Complex alternating patterns - very advanced
      'powers': 'hard',          // Age 14+: [1,4,9,16,?] squares require advanced math concepts
      'primes': 'hard'           // Age 16+: [2,3,5,7,11,?] requires advanced number theory
    };
    return difficultyMap[seriesType] || 'hard'; // Default to hard since most are too advanced
  }
  /**
   * Example number series that the dynamic generator creates for developer reference:
   * 
   * Arithmetic Progression (50% of puzzles):
   * [2, 5, 8, 11, 14, ?]     Step +3: Answer is 17
   * [10, 20, 30, 40, 50, ?]  Step +10: Answer is 60
   * [1, 4, 7, 10, 13, ?]     Step +3: Answer is 16
   * 
   * Geometric Progression (20% of puzzles):
   * [2, 4, 8, 16, 32, ?]     Multiply ×2: Answer is 64
   * [3, 9, 27, 81, 243, ?]   Multiply ×3: Answer is 729
   * [1, 2, 4, 8, 16, ?]      Multiply ×2: Answer is 32
   * 
   * Mixed Operations - Alternating Patterns (15% of puzzles):
   * [3, 6, 12, 11, 22, 21, ?]  Alternate: double, subtract 1: Answer is 42
   * [2, 5, 10, 11, 22, 23, ?]  Alternate: add 3, double: Answer is 46
   * [4, 8, 9, 18, 19, 38, ?]   Alternate: double, add 1: Answer is 39
   * 
   * Perfect Powers (10% of puzzles):
   * [1, 4, 9, 16, 25, ?]       Perfect squares: 1², 2², 3², 4², 5², 6² = 36
   * [1, 8, 27, 64, 125, ?]     Perfect cubes: 1³, 2³, 3³, 4³, 5³, 6³ = 216
   * [1, 16, 81, 256, 625, ?]   Fourth powers: 1⁴, 2⁴, 3⁴, 4⁴, 5⁴, 6⁴ = 1296
   * 
   * Prime Number Sequences (5% of puzzles):
   * [2, 3, 5, 7, 11, ?]        Prime sequence: Answer is 13
   * [3, 5, 7, 11, 13, ?]       Prime sequence: Answer is 17
   * [7, 11, 13, 17, 19, ?]     Prime sequence: Answer is 23
   */

  /**
   * Dynamically generate a random number series puzzle
   */
  getRandom(): NumberSeriesPuzzle {
    const seriesTypes: NumberSeriesPuzzle['seriesType'][] = ['arithmetic', 'geometric', 'mixed', 'powers', 'primes'];
    const seriesType = seriesTypes[Math.floor(Math.random() * seriesTypes.length)];
    
    let series: number[];
    let answer: number;
    let explanation: string;

    switch (seriesType) {
      case 'arithmetic':
        const { series: arithmeticSeries, answer: arithmeticAnswer, explanation: arithmeticExplanation } = 
          this.generateArithmeticSeries();
        series = arithmeticSeries;
        answer = arithmeticAnswer;
        explanation = arithmeticExplanation;
        break;

      case 'geometric':
        const { series: geometricSeries, answer: geometricAnswer, explanation: geometricExplanation } = 
          this.generateGeometricSeries();
        series = geometricSeries;
        answer = geometricAnswer;
        explanation = geometricExplanation;
        break;

      case 'mixed':
        const { series: mixedSeries, answer: mixedAnswer, explanation: mixedExplanation } = 
          this.generateMixedSeries();
        series = mixedSeries;
        answer = mixedAnswer;
        explanation = mixedExplanation;
        break;

      case 'powers':
        const { series: powersSeries, answer: powersAnswer, explanation: powersExplanation } = 
          this.generatePowersSeries();
        series = powersSeries;
        answer = powersAnswer;
        explanation = powersExplanation;
        break;

      case 'primes':
        const { series: primesSeries, answer: primesAnswer, explanation: primesExplanation } = 
          this.generatePrimesSeries();
        series = primesSeries;
        answer = primesAnswer;
        explanation = primesExplanation;
        break;
    }

    const options = this.generateOptions(answer, seriesType);

    const difficultyLevel = this.determineDifficulty(seriesType);
    const semanticId = SemanticIdGenerator.generateSemanticId('number-series', seriesType, difficultyLevel);
    
    return {
      question: 'What number comes next in this series?',
      series,
      options: options.map(String),
      correctAnswerIndex: options.indexOf(answer),
      explanation,
      seriesType,
      hiddenIndex: series.length - 1,
      puzzleType: 'number-series',
      puzzleSubtype: seriesType,
      difficultyLevel,
      semanticId
    };
  }

  /**
   * Generate adaptive number series puzzle based on target difficulty
   */
  getAdaptive(targetDifficulty: number): NumberSeriesPuzzle {
    // Use difficulty-based series type selection
    this.determineDifficulty('arithmetic', targetDifficulty); // Get the target difficulty level

    // Select series types based on target difficulty
    let seriesTypes: NumberSeriesPuzzle['seriesType'][];
    if (targetDifficulty <= 0.4) {
      // Easy: Only arithmetic progressions (suitable for children)
      seriesTypes = ['arithmetic'];
    } else if (targetDifficulty <= 0.7) {
      // Medium: Arithmetic and some geometric
      seriesTypes = ['arithmetic', 'geometric'];
    } else {
      // Hard: All types including complex ones
      seriesTypes = ['arithmetic', 'geometric', 'mixed', 'powers', 'primes'];
    }

    const seriesType = seriesTypes[Math.floor(Math.random() * seriesTypes.length)];

    let series: number[];
    let answer: number;
    let explanation: string;

    switch (seriesType) {
      case 'arithmetic':
        const { series: arithmeticSeries, answer: arithmeticAnswer, explanation: arithmeticExplanation } =
          this.generateArithmeticSeries();
        series = arithmeticSeries;
        answer = arithmeticAnswer;
        explanation = arithmeticExplanation;
        break;

      case 'geometric':
        const { series: geometricSeries, answer: geometricAnswer, explanation: geometricExplanation } =
          this.generateGeometricSeries();
        series = geometricSeries;
        answer = geometricAnswer;
        explanation = geometricExplanation;
        break;

      case 'mixed':
        const { series: mixedSeries, answer: mixedAnswer, explanation: mixedExplanation } =
          this.generateMixedSeries();
        series = mixedSeries;
        answer = mixedAnswer;
        explanation = mixedExplanation;
        break;

      case 'powers':
        const { series: powersSeries, answer: powersAnswer, explanation: powersExplanation } =
          this.generatePowersSeries();
        series = powersSeries;
        answer = powersAnswer;
        explanation = powersExplanation;
        break;

      case 'primes':
        const { series: primesSeries, answer: primesAnswer, explanation: primesExplanation } =
          this.generatePrimesSeries();
        series = primesSeries;
        answer = primesAnswer;
        explanation = primesExplanation;
        break;
    }

    const options = this.generateOptions(answer, seriesType);

    // Use the passed targetDifficulty to determine difficulty level
    const actualDifficultyLevel = this.determineDifficulty(seriesType, targetDifficulty);
    const semanticId = SemanticIdGenerator.generateSemanticId('number-series', seriesType, actualDifficultyLevel);

    return {
      question: 'What number comes next in this series?',
      series,
      options: options.map(String),
      correctAnswerIndex: options.indexOf(answer),
      explanation,
      seriesType,
      hiddenIndex: series.length - 1,
      puzzleType: 'number-series',
      puzzleSubtype: seriesType,
      difficultyLevel: actualDifficultyLevel,
      semanticId
    };
  }

  /**
   * Generate arithmetic progression series
   */
  private generateArithmeticSeries(): { series: number[], answer: number, explanation: string } {
    const start = Math.floor(Math.random() * 20) + 1; // 1-20
    const step = Math.floor(Math.random() * 15) + 1; // 1-15
    const length = 5;

    const series: number[] = [];
    for (let i = 0; i < length; i++) {
      series.push(start + i * step);
    }

    const answer = series[series.length - 1]; // The hidden element (last in series)
    const explanation = `This is an arithmetic series where each number increases by ${step}. The missing element is ${answer}.`;

    return { series, answer, explanation };
  }

  /**
   * Generate geometric progression series
   */
  private generateGeometricSeries(): { series: number[], answer: number, explanation: string } {
    const start = Math.floor(Math.random() * 5) + 2; // 2-6
    const ratio = Math.floor(Math.random() * 3) + 2; // 2-4
    const length = 5;

    const series: number[] = [];
    let current = start;
    for (let i = 0; i < length; i++) {
      series.push(current);
      current *= ratio;
    }

    const answer = series[series.length - 1]; // The hidden element (last in series)
    const explanation = `This is a geometric series where each number is multiplied by ${ratio}. The missing element is ${answer}.`;

    return { series, answer, explanation };
  }

  /**
   * Generate mixed operations series
   */
  private generateMixedSeries(): { series: number[], answer: number, explanation: string } {
    const operations = [
      { op1: (n: number) => n * 2, op2: (n: number) => n - 1, desc: 'doubling and subtracting 1' },
      { op1: (n: number) => n + 3, op2: (n: number) => n * 2, desc: 'adding 3 and doubling' },
      { op1: (n: number) => n * 2, op2: (n: number) => n + 1, desc: 'doubling and adding 1' }
    ];

    const selected = operations[Math.floor(Math.random() * operations.length)];
    let current = Math.floor(Math.random() * 5) + 2; // 2-6
    const series: number[] = [current];

    // Generate 5 more numbers alternating operations
    for (let i = 0; i < 5; i++) {
      current = i % 2 === 0 ? selected.op1(current) : selected.op2(current);
      series.push(current);
    }

    const answer = series[series.length - 1]; // The hidden element (last in series)
    const explanation = `This series alternates between ${selected.desc}. The missing element is ${answer}.`;

    return { series, answer, explanation };
  }

  /**
   * Generate powers series (squares or cubes)
   */
  private generatePowersSeries(): { series: number[], answer: number, explanation: string } {
    const power = Math.random() < 0.7 ? 2 : 3; // 70% squares, 30% cubes
    const start = 1;
    const length = power === 2 ? 4 : 3; // 4 elements shown for squares, 3 for cubes

    const series: number[] = [];
    for (let i = start; i <= start + length - 1; i++) {
      series.push(Math.pow(i, power));
    }

    const answer = series[series.length - 1]; // The hidden element (last in series)
    const powerName = power === 2 ? 'squares' : 'cubes';
    const hiddenPosition = start + length - 1;
    const explanation = `This series represents perfect ${powerName}: ${series.map((_, i) => `${start + i}${power === 2 ? '²' : '³'}`).join(', ')}. The missing element is ${hiddenPosition}${power === 2 ? '²' : '³'} = ${answer}.`;

    return { series, answer, explanation };
  }

  /**
   * Generate prime numbers series
   */
  private generatePrimesSeries(): { series: number[], answer: number, explanation: string } {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const startIndex = Math.floor(Math.random() * 6); // Start from different positions
    const length = 5;

    const series = primes.slice(startIndex, startIndex + length);
    const answer = series[series.length - 1]; // The hidden element (last in series)
    const explanation = `This series follows prime numbers: ${series.join(', ')}. The missing element is ${answer}.`;

    return { series, answer, explanation };
  }

  /**
   * Generate plausible distractor options for the correct answer
   */
  private generateOptions(correctAnswer: number, seriesType: NumberSeriesPuzzle['seriesType']): number[] {
    const options = [correctAnswer];

    // Generate smart distractors based on series type
    switch (seriesType) {
      case 'arithmetic':
      case 'geometric':
        // Off-by-one errors and nearby multiples
        options.push(correctAnswer + 1, correctAnswer - 1, correctAnswer + 2);
        break;

      case 'mixed':
        // Common mistakes in alternating patterns
        options.push(correctAnswer + 1, correctAnswer * 2, Math.floor(correctAnswer / 2));
        break;

      case 'powers':
        // Nearby squares/cubes or wrong power calculations
        options.push(correctAnswer + 1, correctAnswer - 1, Math.floor(correctAnswer * 1.2));
        break;

      case 'primes':
        // Nearby non-prime numbers
        const nearbyNumbers = [correctAnswer + 1, correctAnswer + 2, correctAnswer - 1, correctAnswer + 4];
        options.push(...nearbyNumbers.filter(n => !this.isPrime(n)).slice(0, 3));
        break;
    }

    // Remove duplicates and ensure we have exactly 4 options
    const uniqueOptions = [...new Set(options)];
    while (uniqueOptions.length < 4) {
      const distractor = correctAnswer + Math.floor(Math.random() * 10) - 5;
      if (distractor > 0 && !uniqueOptions.includes(distractor)) {
        uniqueOptions.push(distractor);
      }
    }

    // If we have more than 4 options, we need to ensure the correct answer is always included
    let finalOptions: number[];
    if (uniqueOptions.length > 4) {
      // Separate correct answer from distractors
      const correctIndex = uniqueOptions.indexOf(correctAnswer);
      const distractors = uniqueOptions.filter((_, index) => index !== correctIndex);

      // Randomly select 3 distractors and add the correct answer
      const shuffledDistractors = [...distractors];
      for (let i = shuffledDistractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDistractors[i], shuffledDistractors[j]] = [shuffledDistractors[j], shuffledDistractors[i]];
      }

      finalOptions = [correctAnswer, ...shuffledDistractors.slice(0, 3)];
    } else {
      finalOptions = [...uniqueOptions];
    }

    // Shuffle final options
    for (let i = finalOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
    }

    return finalOptions;
  }

  /**
   * Check if a number is prime
   */
  private isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    
    return true;
  }
}

// Export singleton instance and legacy function for backward compatibility
export const numberSeriesPuzzleGenerator = new NumberSeriesPuzzleGenerator();

/**
 * @deprecated Use numberSeriesPuzzleGenerator.getRandom() instead
 */
export function generateNumberSeriesPuzzle(): NumberSeriesPuzzle & { type: string; correctAnswer: string } {
  const puzzle = numberSeriesPuzzleGenerator.getRandom();
  return {
    ...puzzle,
    type: 'numberSeries',
    correctAnswer: puzzle.options[puzzle.correctAnswerIndex]
  };
}

export default numberSeriesPuzzleGenerator;