/**
 * Simplified Puzzle DNA Analyzer
 *
 * Basic puzzle characterization focused on what actually matters:
 * - Difficulty level (0-1)
 * - Puzzle type
 * - Historical user engagement
 * - Success rate data
 */

import { AnyPuzzle } from '@/src/lib/game/puzzleGenerator';

export interface PuzzleDNA {
  puzzleId: string;
  puzzleType: string;
  difficulty: number;           // 0-1, simple difficulty estimate
  userEngagement: number;       // 0-1, historical engagement data
  successRate: number;          // 0-1, historical success rate
  generatedAt: number;
}

export enum SkillTarget {
  PATTERN_RECOGNITION = 'pattern_recognition',
  LOGICAL_REASONING = 'logical_reasoning',
  MATHEMATICAL_REASONING = 'mathematical_reasoning',
  SPATIAL_REASONING = 'spatial_reasoning',
  WORKING_MEMORY = 'working_memory'
}

/**
 * Simple Puzzle DNA Analyzer
 * Focuses on essential puzzle characteristics only
 */
export class PuzzleDNAAnalyzer {
  private puzzleDatabase: Map<string, PuzzleDNA> = new Map();

  /**
   * Analyze puzzle and create simple DNA profile
   */
  analyzePuzzle(puzzle: AnyPuzzle): PuzzleDNA {
    const puzzleId = this.generatePuzzleId(puzzle);

    // Check if we already have DNA for this puzzle
    const existing = this.puzzleDatabase.get(puzzleId);
    if (existing) {
      return existing;
    }

    // Create simple DNA profile
    const dna: PuzzleDNA = {
      puzzleId,
      puzzleType: puzzle.puzzleType || 'unknown',
      difficulty: this.estimateBasicDifficulty(puzzle),
      userEngagement: 0.7, // Default until we have data
      successRate: 0.6,    // Default until we have data
      generatedAt: Date.now()
    };

    this.puzzleDatabase.set(puzzleId, dna);
    return dna;
  }

  /**
   * Update puzzle DNA with actual user performance data
   */
  updatePuzzleDNA(puzzleId: string, performanceData: {
    successRate?: number;
    avgEngagementScore?: number;
    sessionCount?: number;
  }): void {
    const existing = this.puzzleDatabase.get(puzzleId);
    if (!existing) return;

    // Update with real user data
    if (performanceData.successRate !== undefined) {
      existing.successRate = performanceData.successRate;
    }
    if (performanceData.avgEngagementScore !== undefined) {
      existing.userEngagement = performanceData.avgEngagementScore;
    }

    this.puzzleDatabase.set(puzzleId, existing);
  }

  /**
   * Get puzzle DNA by ID
   */
  getPuzzleDNA(puzzleId: string): PuzzleDNA | undefined {
    return this.puzzleDatabase.get(puzzleId);
  }

  /**
   * Simple difficulty estimation based on puzzle characteristics
   */
  private estimateBasicDifficulty(puzzle: AnyPuzzle): number {
    // Use existing difficulty level if available
    if (puzzle.difficultyLevel) {
      const difficultyMap = { 'easy': 0.3, 'medium': 0.6, 'hard': 0.9 };
      return difficultyMap[puzzle.difficultyLevel] || 0.5;
    }

    // Simple heuristics based on puzzle type
    const typeComplexity: Record<string, number> = {
      'pattern': 0.3,
      'number-series': 0.4,
      'analogy': 0.5,
      'serial-reasoning': 0.7,
      'algebraic': 0.8,
      'transformation': 0.9
    };

    const puzzleType = puzzle.puzzleType?.toLowerCase() || 'unknown';
    return typeComplexity[puzzleType] || 0.5;
  }

  /**
   * Generate consistent puzzle ID
   */
  private generatePuzzleId(puzzle: AnyPuzzle): string {
    // Use semantic ID if available, otherwise create simple hash
    if (puzzle.semanticId) {
      return puzzle.semanticId;
    }

    // Create simple hash from puzzle content
    const content = JSON.stringify({
      question: puzzle.question,
      options: puzzle.options,
      type: puzzle.puzzleType
    });

    return `puzzle_${this.simpleHash(content)}`;
  }

  /**
   * Simple hash function for puzzle identification
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Export singleton instance
export const puzzleDNAAnalyzer = new PuzzleDNAAnalyzer();