/**
 * Unified Puzzle System
 * 
 * This file defines the base interfaces and structures for all puzzle types.
 * All puzzles must follow this consistent structure for maintainability and extensibility.
 */

// Base puzzle interface that all puzzles must implement
export interface BasePuzzle {
  question: string;
  grid?: any[][]; // Optional grid for visual puzzles - flexible type to accommodate different grid content types
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  // NEW: Semantic metadata for adaptive learning
  puzzleType?: string;        // 'pattern', 'analogy', 'series', 'sequential', etc.
  puzzleSubtype?: string;     // 'mirror', 'category', 'arithmetic', 'geometric', etc.
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  semanticId?: string;        // Generated semantic ID: type_subtype_difficulty_timestamp
}

// Interface for puzzle generators
export interface PuzzleGenerator<T extends BasePuzzle = BasePuzzle> {
  // Generate random puzzle dynamically
  getRandom(): T;
  
  // NEW: Semantic-based generation methods
  getByType?(type: string, subtype?: string, difficulty?: 'easy' | 'medium' | 'hard'): T;
  getBySemanticPattern?(semanticPattern: string): T;
  getSimilarPuzzles?(type: string, subtype: string, count: number): T[];
}

// Base class that puzzle generators can extend
export abstract class BasePuzzleGenerator<T extends BasePuzzle = BasePuzzle> implements PuzzleGenerator<T> {
  // Make staticPuzzles optional - some generators are purely dynamic
  staticPuzzles?: T[];
  private rotationIndex: number = 0;

  abstract getRandom(): T;

  // Sequential puzzle access with rotation (falls back to getRandom if no static puzzles)
  getNext(): T {
    if (!this.staticPuzzles || this.staticPuzzles.length === 0) {
      // Fallback to dynamic generation for generators without static puzzles
      return this.getRandom();
    }
    const puzzle = this.staticPuzzles[this.rotationIndex];
    this.rotationIndex = (this.rotationIndex + 1) % this.staticPuzzles.length;
    return puzzle;
  }

  // Get the count of static puzzles available
  getStaticCount(): number {
    return this.staticPuzzles ? this.staticPuzzles.length : 0;
  }

  // Reset the rotation index to start from the beginning
  resetRotation(): void {
    this.rotationIndex = 0;
  }
}

// Utility functions for semantic puzzle ID generation
export class SemanticIdGenerator {
  /**
   * Generate a semantic puzzle ID in format: type-subtype-difficulty-timestamp
   */
  static generateSemanticId(
    puzzleType: string,
    puzzleSubtype: string,
    difficultyLevel: 'easy' | 'medium' | 'hard'
  ): string {
    const timestamp = Date.now().toString(36); // Base-36 timestamp for shorter IDs
    return `${puzzleType}-${puzzleSubtype}-${difficultyLevel}-${timestamp}`;
  }

  /**
   * Parse a semantic ID back into its components
   */
  static parseSemanticId(semanticId: string): {
    puzzleType: string;
    puzzleSubtype: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    timestamp: string;
  } | null {
    const parts = semanticId.split('_');
    if (parts.length < 4) return null;
    
    const [puzzleType, puzzleSubtype, difficultyLevel, timestamp] = parts;
    if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) return null;
    
    return {
      puzzleType,
      puzzleSubtype,
      difficultyLevel: difficultyLevel as 'easy' | 'medium' | 'hard',
      timestamp
    };
  }

  /**
   * Get the type-level identifier for aggregation: type_subtype_difficulty
   */
  static getTypeIdentifier(semanticId: string): string | null {
    const parsed = this.parseSemanticId(semanticId);
    if (!parsed) return null;
    return `${parsed.puzzleType}_${parsed.puzzleSubtype}_${parsed.difficultyLevel}`;
  }
}

// Utility functions for programmatic explanation generation
export class ExplanationGenerator {
  /**
   * Generate explanation for pattern-based puzzles
   */
  static generatePatternExplanation(patternType: string, details?: any): string {
    const explanations: Record<string, string> = {
      'row-shift': 'Each row is a left rotation of the previous row.',
      'mirror': 'Alternating rows are mirrored versions of each other.',
      'opposite': 'Each row applies progressive transformations to the shapes.',
      'column-shift': 'Each column shifts elements downward in sequence.',
      'arithmetic': `Numbers increase by ${details?.step || 'a fixed step'} in each ${details?.direction || 'direction'}.`,
      'geometric': `Each ${details?.direction || 'row'} multiplies the previous by ${details?.factor || 'a constant factor'}.`,
    };
    
    return explanations[patternType] || `Pattern follows ${patternType} logic.`;
  }
  
  /**
   * Generate explanation for analogy puzzles
   */
  static generateAnalogyExplanation(relationship: string, details?: any): string {
    const explanations: Record<string, string> = {
      'opposite': 'The relationship is based on opposites or antonyms.',
      'category': 'Both pairs belong to the same category or classification.',
      'function': 'The relationship is based on function or purpose.',
      'part-whole': 'One item is a part of the other item.',
      'cause-effect': 'One item causes or leads to the other.',
      'sequence': 'The items follow a sequential or chronological order.',
      'transformation': `The first item transforms to the second by ${details?.transformation || 'a specific rule'}.`,
    };
    
    return explanations[relationship] || `The relationship follows ${relationship} logic.`;
  }
  
  /**
   * Generate explanation for matrix/serial reasoning puzzles
   */
  static generateMatrixExplanation(patternType: 'numeric' | 'symbolic' | 'shape', details?: any): string {
    switch (patternType) {
      case 'numeric':
        return details?.isRowPattern 
          ? `Rows increase by ${details?.step || 'a fixed step'}. Columns follow the same pattern.`
          : `Each position follows a mathematical progression with step ${details?.step || 'value'}.`;
          
      case 'symbolic':
        return details?.isShift
          ? 'Each row is a shift of the previous row.'
          : 'Symbols follow a rotational or transformational pattern.';
          
      case 'shape':
        return details?.transformation
          ? `Shapes transform according to: ${details.transformation}`
          : 'Shapes follow a logical transformation pattern across the matrix.';
          
      default:
        return 'The matrix follows a logical pattern that can be determined by analyzing rows and columns.';
    }
  }
  
}

// Validation utility to ensure all puzzles follow the interface
export class PuzzleValidator {
  static validatePuzzle(puzzle: any): puzzle is BasePuzzle {
    return (
      typeof puzzle.question === 'string' &&
      Array.isArray(puzzle.options) &&
      puzzle.options.length > 0 &&
      typeof puzzle.correctAnswerIndex === 'number' &&
      puzzle.correctAnswerIndex >= 0 &&
      puzzle.correctAnswerIndex < puzzle.options.length &&
      typeof puzzle.explanation === 'string' &&
      (!puzzle.grid || (Array.isArray(puzzle.grid) && Array.isArray(puzzle.grid[0])))
    );
  }
  
  static validateGenerator(generator: any): generator is PuzzleGenerator {
    return (
      typeof generator.getRandom === 'function' &&
      (generator.staticPuzzles === undefined || Array.isArray(generator.staticPuzzles))
    );
  }

  // Extended validation for BasePuzzleGenerator implementations
  static validateBasePuzzleGenerator(generator: any): boolean {
    return (
      this.validateGenerator(generator) &&
      Array.isArray((generator as any).staticPuzzles) &&
      typeof (generator as any).getNext === 'function' &&
      typeof (generator as any).getStaticCount === 'function' &&
      typeof (generator as any).resetRotation === 'function'
    );
  }
}