import { BasePuzzle, BasePuzzleGenerator, SemanticIdGenerator, ExplanationGenerator } from '@/src/lib/game/basePuzzle';

export interface PatternPuzzle extends BasePuzzle {
  grid: string[][]; // Pattern puzzles always have grids
  patternType: string;
}

/**
 * Pattern Puzzle Generator
 * Generates 3x3 grid puzzles with logical patterns for cognitive reasoning.
 */
export class PatternPuzzleGenerator extends BasePuzzleGenerator<PatternPuzzle> {
  private readonly shapes = [
    '😀', // grinning face
    '😎', // cool face
    '🐶', // dog
    '🐱', // cat
    '💎', // gem / diamond
    '🔶', // orange diamond
    '🔷', // blue diamond
    '🍎', // apple
    '🍌', // banana
    '🍕', // pizza
    '🍩', // donut
    '⭐', // star
    '✨', // sparkle
  ];
  
  private readonly patternTypes = ['row-shift', 'mirror', 'opposite', 'column-shift'];
  
  /**
   * Example patterns that the dynamic generator creates for developer reference:
   * 
   * Row-shift Pattern:
   * 🌟 ⭐ ✨    Each row shifts elements one position to the right
   * ⭐ ✨ 🌟    Row 1: [A, B, C] → Row 2: [B, C, A] → Row 3: [C, A, B]
   * ✨ 🌟 ?    Answer: ⭐
   * 
   * Mirror Pattern:
   * 🐶 🐱 🦊    Alternating rows with normal and reversed order
   * 🦊 🐱 🐶    Row 1: [A, B, C] → Row 2: [C, B, A] → Row 3: [A, B, C]
   * 🐶 🐱 ?    Answer: 🦊
   * 
   * Opposite Pattern:
   * 💎 🔶 🔷    Each row rotates the sequence by one position
   * 🔶 🔷 💎    Row 1: [A, B, C] → Row 2: [B, C, A] → Row 3: [C, A, B]
   * 🔷 💎 ?    Answer: 🔶
   * 
   * Column-shift Pattern:
   * 🍎 🍌 🍕    Each column shifts elements down one position
   * 🍌 🍕 🍩    Col 1: [A, B, C] → Col 2: [B, C, A] → Col 3: [C, A, B]
   * 🍕 🍩 ?    Answer: 🍎
   */
  
  /**
   * Dynamically generate a random pattern puzzle
   */
  getRandom(): PatternPuzzle {
    const patternType = this.patternTypes[Math.floor(Math.random() * this.patternTypes.length)];
    const baseShapes = this.selectRandomShapes(3);
    const grid = this.generatePatternGrid(patternType, baseShapes);
    
    // Hide a cell and generate options
    const { hiddenCell, answer } = this.hideRandomCell(grid);
    const options = this.generateOptions(answer);
    
    // Determine difficulty based on pattern complexity
    const difficultyLevel = this.determineDifficulty(patternType);
    
    // Generate semantic ID
    const semanticId = SemanticIdGenerator.generateSemanticId('pattern', patternType, difficultyLevel);
    
    return {
      question: 'What completes the pattern in the highlighted cell?',
      grid: hiddenCell.grid,
      options,
      correctAnswerIndex: options.indexOf(answer),
      explanation: ExplanationGenerator.generatePatternExplanation(patternType),
      patternType,
      // NEW: Semantic metadata
      puzzleType: 'pattern',
      puzzleSubtype: patternType,
      difficultyLevel,
      semanticId
    };
  }
  
  /**
   * ENHANCED: Generate adaptive pattern puzzle with specified difficulty and variety control
   */
  getAdaptive(targetDifficulty: number, recentPatterns: string[] = []): PatternPuzzle {
    // Smart pattern type selection with variety bonus
    let patternType = this.selectPatternWithVariety(recentPatterns);
    
    const baseShapes = this.selectRandomShapes(3);
    const grid = this.generatePatternGrid(patternType, baseShapes);
    
    // Hide a cell and generate options
    const { hiddenCell, answer } = this.hideRandomCell(grid);
    const options = this.generateOptions(answer);
    
    // Use adaptive difficulty system
    const difficultyLevel = this.determineDifficulty(patternType, targetDifficulty);
    
    // Generate semantic ID
    const semanticId = SemanticIdGenerator.generateSemanticId('pattern', patternType, difficultyLevel);
    
    return {
      question: 'What completes the pattern in the highlighted cell?',
      grid: hiddenCell.grid,
      options,
      correctAnswerIndex: options.indexOf(answer),
      explanation: ExplanationGenerator.generatePatternExplanation(patternType),
      patternType,
      puzzleType: 'pattern',
      puzzleSubtype: patternType,
      difficultyLevel,
      semanticId
    };
  }
  
  /**
   * Select pattern type with variety consideration
   */
  private selectPatternWithVariety(recentPatterns: string[]): string {
    // Count recent pattern usage
    const recentCounts: Record<string, number> = {};
    recentPatterns.forEach(pattern => {
      recentCounts[pattern] = (recentCounts[pattern] || 0) + 1;
    });
    
    // Calculate variety scores for each pattern type
    const varietyScores: {pattern: string, score: number}[] = this.patternTypes.map(pattern => {
      const recentCount = recentCounts[pattern] || 0;
      // Higher score = less recently used = more variety
      const varietyScore = Math.max(0.1, 1.0 - (recentCount * 0.3));
      
      return { pattern, score: varietyScore };
    });
    
    // Weighted random selection based on variety scores
    const totalScore = varietyScores.reduce((sum, item) => sum + item.score, 0);
    let random = Math.random() * totalScore;
    
    for (const item of varietyScores) {
      random -= item.score;
      if (random <= 0) {
        return item.pattern;
      }
    }
    
    // Fallback
    return this.patternTypes[0];
  }
  
  private selectRandomShapes(count: number): string[] {
    const selected: string[] = [];
    while (selected.length < count) {
      const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
      if (!selected.includes(shape)) {
        selected.push(shape);
      }
    }
    return selected;
  }
  
  private generatePatternGrid(patternType: string, baseShapes: string[]): string[][] {
    let grid: string[][] = [[], [], []];
    
    switch (patternType) {
      case 'row-shift':
        grid[0] = [...baseShapes];
        grid[1] = [baseShapes[1], baseShapes[2], baseShapes[0]];
        grid[2] = [baseShapes[2], baseShapes[0], baseShapes[1]];
        break;
        
      case 'mirror':
        grid[0] = [...baseShapes];
        grid[1] = [...baseShapes].reverse();
        grid[2] = [...baseShapes];
        break;
        
      case 'opposite':
        grid[0] = [...baseShapes];
        grid[1] = baseShapes.map(s => baseShapes[(baseShapes.indexOf(s) + 1) % 3]);
        grid[2] = baseShapes.map(s => baseShapes[(baseShapes.indexOf(s) + 2) % 3]);
        break;
        
      case 'column-shift':
        for (let c = 0; c < 3; c++) {
          grid[0][c] = baseShapes[c];
          grid[1][c] = baseShapes[(c + 1) % 3];
          grid[2][c] = baseShapes[(c + 2) % 3];
        }
        break;
    }
    
    return grid;
  }
  
  private hideRandomCell(grid: string[][]): { hiddenCell: { grid: string[][], row: number, col: number }, answer: string } {
    // Don't hide the first cell (0,0) to make pattern more obvious
    const positions = [
      [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]
    ];
    const [row, col] = positions[Math.floor(Math.random() * positions.length)];
    
    const answer = grid[row][col];
    const newGrid = grid.map((r, rIndex) => 
      r.map((c, cIndex) => (rIndex === row && cIndex === col) ? '' : c)
    );
    
    return {
      hiddenCell: { grid: newGrid, row, col },
      answer
    };
  }
  
  private generateOptions(correctAnswer: string): string[] {
    const options = [correctAnswer];
    
    // Add 3 random incorrect options
    while (options.length < 4) {
      const option = this.getRandomShape();
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  }
  
  private getRandomShape(): string {
    return this.shapes[Math.floor(Math.random() * this.shapes.length)];
  }
  
  private determineDifficulty(patternType: string, adaptiveDifficulty?: number): 'easy' | 'medium' | 'hard' {
    // ENHANCED: Use adaptive difficulty if provided by the adaptive engine
    if (adaptiveDifficulty !== undefined) {
      if (adaptiveDifficulty <= 0.4) return 'easy';
      if (adaptiveDifficulty <= 0.7) return 'medium';
      return 'hard';
    }
    
    // UPDATED: All pattern types set to 'easy' for better age-appropriate distribution
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'mirror': 'easy',      // Age 4-6: Simple visual pattern recognition
      'row-shift': 'easy',   // Changed from medium to easy
      'column-shift': 'easy', // Changed from medium to easy
      'opposite': 'easy'     // Changed from hard to easy
    };
    
    return difficultyMap[patternType] || 'medium';
  }
}

// Export singleton instance and legacy function for backward compatibility
export const patternPuzzleGenerator = new PatternPuzzleGenerator();

/**
 * @deprecated Use patternPuzzleGenerator.getRandom() instead
 */
export function generatePatternPuzzle(): PatternPuzzle {
  return patternPuzzleGenerator.getRandom();
}

// Legacy interface for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PuzzleData extends PatternPuzzle {}

export default patternPuzzleGenerator;