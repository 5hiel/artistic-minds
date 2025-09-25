/**
 * Unified Infinite Puzzle Generator
 * 
 * Cycles through eleven types of puzzles with consistent interface:
 * - Pattern recognition puzzles (visual grid patterns)
 * - Serial reasoning puzzles (matrix completion)
 * - Number series puzzles (numerical sequence patterns)
 * - Algebraic reasoning puzzles (equation solving)
 * - Sequential figures puzzles (linear transformation sequences)
 * - Number grid puzzles (mathematical 3x3 grid patterns)
 * - Number analogies puzzles (quantitative A:B::C:? patterns)
 * - Figure classification puzzles (cognitive assessment style)
 * - Paper folding puzzles (spatial visualization and geometric transformations)
 * - Following directions puzzles (sequential instruction processing and working memory)
 * - Picture series puzzles (OLSAT-style figural series with "what comes next" reasoning)
 * 
 * NOTE: Transformation puzzles are disabled due to rendering issues.
 * 
 * All puzzles follow the BasePuzzle interface with programmatic explanations.
 */

import { PuzzleValidator } from './basePuzzle';
import { PUZZLE_TYPES, getEnabledPuzzleTypes, getEnabledTypeIndices, getEnabledTypeMapping, getWeightEntries, getDefaultWeights } from '@/src/constants/puzzleConfig';
import { PatternPuzzle, patternPuzzleGenerator } from '@/src/lib/puzzles/reasoning/pattern';
import { SerialReasoningPuzzle, serialReasoningPuzzleGenerator } from '@/src/lib/puzzles/reasoning/serialReasoning';
import { NumberSeriesPuzzle, numberSeriesPuzzleGenerator } from '@/src/lib/puzzles/numerical/numberSeries';
import { AlgebraicReasoningPuzzle, algebraicReasoningPuzzleGenerator } from '@/src/lib/puzzles/numerical/algebraicReasoning';
import { SequentialFiguresPuzzle, sequentialFiguresPuzzleGenerator } from '@/src/lib/puzzles/visual/sequentialFigures';
import { NumberGridPuzzle, numberGridPuzzleGenerator } from '@/src/lib/puzzles/numerical/numberGrid';
import { NumberAnalogyPuzzle, numberAnalogyPuzzleGenerator } from '@/src/lib/puzzles/numerical/numberAnalogies';
import { TransformationPuzzle, transformationPuzzleGenerator } from '@/src/lib/puzzles/reasoning/transformation';
import { FigureClassificationPuzzle, figureClassificationPuzzleGenerator } from '@/src/lib/puzzles/cognitive/figureClassification';
import { PaperFoldingPuzzle, paperFoldingPuzzleGenerator } from '@/src/lib/puzzles/cognitive/paperFolding';
import { FollowingDirectionsPuzzle, followingDirectionsPuzzleGenerator } from '@/src/lib/puzzles/cognitive/followingDirections';
import { PictureSeriesPuzzle, pictureSeriesPuzzleGenerator } from '@/src/lib/puzzles/visual/pictureSeries';

// Union type of all possible puzzle types with optional persona test properties
export type AnyPuzzle = (PatternPuzzle | SerialReasoningPuzzle | NumberSeriesPuzzle | AlgebraicReasoningPuzzle | SequentialFiguresPuzzle | NumberGridPuzzle | NumberAnalogyPuzzle | TransformationPuzzle | FigureClassificationPuzzle | PaperFoldingPuzzle | FollowingDirectionsPuzzle | PictureSeriesPuzzle) & {
  // Optional properties for persona testing compatibility
  hiddenIndex?: number;
  correctAnswer?: string | number;
};

// Export individual puzzle types for type checking
export type { PatternPuzzle, SerialReasoningPuzzle, NumberSeriesPuzzle, AlgebraicReasoningPuzzle, SequentialFiguresPuzzle, NumberGridPuzzle, NumberAnalogyPuzzle, TransformationPuzzle, FigureClassificationPuzzle, PaperFoldingPuzzle, FollowingDirectionsPuzzle, PictureSeriesPuzzle };

// Export specific interfaces that components might need
// Note: These types are now defined in the respective puzzle generators
export type ShapeToken = string;
export type GridPattern = string[][];
export type SequencePattern = string[];

/**
 * Puzzle generation modes
 */
export enum PuzzleMode {
  DYNAMIC_GENERATION = 'dynamic'  // Generate puzzles dynamically (only mode available)
}

/**
 * Configuration for puzzle generation
 */
export interface PuzzleGeneratorConfig {
  mode: PuzzleMode;
  weights: Record<string, number>;
}

/**
 * Default configuration - now dynamically generated from centralized config
 */
const DEFAULT_CONFIG: PuzzleGeneratorConfig = {
  mode: PuzzleMode.DYNAMIC_GENERATION,
  weights: getDefaultWeights()
};

/**
 * Unified Puzzle Generator Class
 * Manages all puzzle types with consistent interface and configurable behavior
 */
export class InfinitePuzzleGenerator {
  private lastType: number = 0;
  private config: PuzzleGeneratorConfig;
  
  constructor(config: Partial<PuzzleGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Get current puzzle generator configuration
   */
  getConfig(): PuzzleGeneratorConfig {
    return this.config;
  }
  
  /**
   * Generate puzzle using dynamic algorithms
   * @deprecated Use IntelligentPuzzleEngine.generateAdaptivePuzzle() instead for adaptive puzzle selection
   */
  generatePuzzle(mode?: PuzzleMode, targetDifficulty?: number, recentPatterns?: string[]): AnyPuzzle {
    // Cycle through puzzle types based on weights
    this.lastType = this.getNextPuzzleType();
    
    let puzzle: AnyPuzzle = this.generateDynamicPuzzle(this.lastType, targetDifficulty, recentPatterns);
    
    // Validate puzzle before returning
    if (!PuzzleValidator.validatePuzzle(puzzle)) {
      console.warn('Generated invalid puzzle, retrying with fallback generation');
      // Retry with a different puzzle type as fallback (enabled types only)
      const enabledTypes = getEnabledTypeIndices();
      const currentIndex = enabledTypes.indexOf(this.lastType);
      const nextIndex = (currentIndex + 1) % enabledTypes.length;
      const fallbackType = enabledTypes[nextIndex];
      puzzle = this.generateDynamicPuzzle(fallbackType, targetDifficulty, recentPatterns);
    }
    
    return puzzle;
  }

  /**
   * Generate puzzle with custom weights (for adaptive candidate generation)
   */
  generatePuzzleWithWeights(customWeights: Partial<PuzzleGeneratorConfig['weights']>, targetDifficulty?: number, recentPatterns?: string[]): AnyPuzzle {
    // Create temporary config with custom weights, ensuring all values are numbers
    const mergedWeights: Record<string, number> = {};
    Object.keys(this.config.weights).forEach(key => {
      mergedWeights[key] = customWeights[key] ?? this.config.weights[key] ?? 0;
    });

    const tempConfig = {
      ...this.config,
      weights: mergedWeights
    };

    // Generate puzzle type based on custom weights
    const puzzleType = this.getNextPuzzleTypeWithWeights(tempConfig.weights);

    let puzzle: AnyPuzzle = this.generateDynamicPuzzle(puzzleType, targetDifficulty, recentPatterns);

    // Validate puzzle before returning
    if (!PuzzleValidator.validatePuzzle(puzzle)) {
      console.warn('Generated invalid puzzle with custom weights, retrying with fallback');
      // Fallback to next enabled puzzle type
      const enabledTypes = getEnabledTypeIndices();
      const currentIndex = enabledTypes.indexOf(puzzleType);
      const nextIndex = (currentIndex + 1) % enabledTypes.length;
      const fallbackType = enabledTypes[nextIndex];
      puzzle = this.generateDynamicPuzzle(fallbackType, targetDifficulty, recentPatterns);
    }

    return puzzle;
  }

  /**
   * Generate puzzle of specific type (for targeted pool generation)
   */
  generateSpecificTypePuzzle(puzzleType: string, targetDifficulty?: number, recentPatterns?: string[]): AnyPuzzle | null {
    const typeMapping = getEnabledTypeMapping();
    const typeIndex = typeMapping[puzzleType];

    if (typeIndex === undefined) {
      console.warn(`Unknown or disabled puzzle type: ${puzzleType}`);
      return null;
    }

    const puzzle = this.generateDynamicPuzzle(typeIndex, targetDifficulty, recentPatterns);

    if (!PuzzleValidator.validatePuzzle(puzzle)) {
      console.warn(`Failed to generate valid ${puzzleType} puzzle`);
      return null;
    }

    return puzzle;
  }
  
  
  /**
   * Generate puzzle using dynamic algorithms
   */
  private generateDynamicPuzzle(typeIndex: number, targetDifficulty?: number, recentPatterns?: string[]): AnyPuzzle {
    switch (typeIndex) {
      case 0:
        // Use adaptive pattern generation if parameters provided
        if (targetDifficulty !== undefined && recentPatterns !== undefined) {
          return patternPuzzleGenerator.getAdaptive(targetDifficulty, recentPatterns);
        }
        return patternPuzzleGenerator.getRandom();
      case 1:
        // Serial reasoning can be complex - avoid for very young children
        if (targetDifficulty !== undefined && targetDifficulty <= 0.4) {
          // For young children, fall back to pattern puzzles which have adaptive difficulty
          if (recentPatterns !== undefined) {
            return patternPuzzleGenerator.getAdaptive(targetDifficulty, recentPatterns);
          }
          return patternPuzzleGenerator.getRandom();
        }
        return serialReasoningPuzzleGenerator.getRandom();
      case 2:
        // Use adaptive number series generation if targetDifficulty provided
        if (targetDifficulty !== undefined) {
          return numberSeriesPuzzleGenerator.getAdaptive(targetDifficulty);
        }
        return numberSeriesPuzzleGenerator.getRandom();
      case 3:
        // Algebraic reasoning is inherently hard - avoid for low difficulty targets
        if (targetDifficulty !== undefined && targetDifficulty <= 0.6) {
          // For children, fall back to pattern puzzles which have adaptive difficulty
          if (recentPatterns !== undefined) {
            return patternPuzzleGenerator.getAdaptive(targetDifficulty, recentPatterns);
          }
          return patternPuzzleGenerator.getRandom();
        }
        return algebraicReasoningPuzzleGenerator.getRandom();
      case 4:
        // Number grid puzzles are complex - avoid for very young children
        if (targetDifficulty !== undefined && targetDifficulty <= 0.4) {
          // For young children, fall back to pattern puzzles which have adaptive difficulty
          if (recentPatterns !== undefined) {
            return patternPuzzleGenerator.getAdaptive(targetDifficulty, recentPatterns);
          }
          return patternPuzzleGenerator.getRandom();
        }
        return numberGridPuzzleGenerator.getRandom();
      case 5:
        // Number analogies can be complex - avoid for very young children
        if (targetDifficulty !== undefined && targetDifficulty <= 0.4) {
          // For young children, fall back to number series which have adaptive difficulty
          return numberSeriesPuzzleGenerator.getAdaptive(targetDifficulty);
        }
        return numberAnalogyPuzzleGenerator.getRandom();
      case 6:
        return transformationPuzzleGenerator.getRandom();
      case 7:
        return figureClassificationPuzzleGenerator.getRandom();
      case 8:
        return paperFoldingPuzzleGenerator.getRandom();
      case 9:
        return followingDirectionsPuzzleGenerator.getRandom();
      case 10:
        return pictureSeriesPuzzleGenerator.getRandom();
      default:
        // Default to adaptive pattern generation if parameters provided
        if (targetDifficulty !== undefined && recentPatterns !== undefined) {
          return patternPuzzleGenerator.getAdaptive(targetDifficulty, recentPatterns);
        }
        return patternPuzzleGenerator.getRandom();
    }
  }
  
  /**
   * Get next puzzle type index based on weights
   * Now dynamically uses enabled puzzle types from centralized config
   */
  private getNextPuzzleType(): number {
    const weights = this.config.weights;
    const enabledTypes = getEnabledTypeIndices();
    const weightEntries = getWeightEntries();

    // Calculate total weight for enabled types only
    const totalWeight = weightEntries.reduce((sum, [typeName, typeIndex]) => {
      return sum + (weights[typeName] ?? 0);
    }, 0);

    if (totalWeight === 0) {
      // Equal rotation if no weights specified - cycle through enabled types only
      const currentIndex = enabledTypes.indexOf(this.lastType);
      const nextIndex = (currentIndex + 1) % enabledTypes.length;
      return enabledTypes[nextIndex];
    }

    // Weighted random selection
    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const [typeName, typeIndex] of weightEntries) {
      currentWeight += weights[typeName] ?? 0;
      if (random < currentWeight) {
        return typeIndex;
      }
    }

    // Fallback to first enabled type
    return enabledTypes[0] || 0;
  }
  
  /**
   * Get statistics about puzzle generation configuration
   */
  getStatistics() {
    const enabledTypes = getEnabledPuzzleTypes();
    const allTypes = PUZZLE_TYPES;

    return {
      availablePuzzleTypes: Object.fromEntries(
        Object.entries(enabledTypes).map(([typeName, config]) => [
          typeName,
          `Dynamic ${config.description.toLowerCase()}`
        ])
      ),
      enabledPuzzleTypes: Object.keys(enabledTypes).length,
      totalPuzzleTypes: Object.keys(allTypes).length,
      enabledTypeIndices: getEnabledTypeIndices(),
      config: this.config
    };
  }
  
  /**
   * Update generator configuration
   */
  updateConfig(newConfig: Partial<PuzzleGeneratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Reset generator to initial state
   */
  reset(): void {
    this.lastType = 0;
  }

  /**
   * Get next puzzle type with custom weights
   */
  private getNextPuzzleTypeWithWeights(weights: PuzzleGeneratorConfig['weights']): number {
    const enabledTypes = getEnabledTypeIndices();
    const weightEntries = getWeightEntries();

    // Calculate total weight for enabled types only
    const totalWeight = weightEntries.reduce((sum, [typeName, typeIndex]) => {
      return sum + (weights[typeName] ?? 0);
    }, 0);

    if (totalWeight === 0) {
      // Equal rotation if no weights specified - cycle through enabled types only
      const currentIndex = enabledTypes.indexOf(this.lastType);
      const nextIndex = (currentIndex + 1) % enabledTypes.length;
      return enabledTypes[nextIndex];
    }

    // Weighted random selection
    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const [typeName, typeIndex] of weightEntries) {
      currentWeight += weights[typeName] ?? 0;
      if (random < currentWeight) {
        return typeIndex;
      }
    }

    // Fallback to first enabled type
    return enabledTypes[0] || 0;
  }

  /**
   * Get puzzle type index from string name
   */
  private getPuzzleTypeIndex(typeName: string): number {
    const typeMapping = getEnabledTypeMapping();
    return typeMapping[typeName] ?? -1;
  }
  
  /**
   * Generate specific puzzle type for testing
   */
  generateSpecificPuzzle(
    type: 'pattern' | 'serialReasoning' | 'numberSeries' | 'algebraicReasoning' | 'sequentialFigures' | 'numberGrid' | 'numberAnalogy' | 'figureClassification' | 'paperFolding' | 'followingDirections',
    targetDifficulty?: number,
    recentPatterns?: string[]
  ): AnyPuzzle {
    switch (type) {
      case 'pattern':
        // Use adaptive pattern generation if parameters provided
        if (targetDifficulty !== undefined && recentPatterns !== undefined) {
          return patternPuzzleGenerator.getAdaptive(targetDifficulty, recentPatterns);
        }
        return patternPuzzleGenerator.getRandom();
      case 'serialReasoning':
        return serialReasoningPuzzleGenerator.getRandom();
      case 'numberSeries':
        return numberSeriesPuzzleGenerator.getRandom();
      case 'algebraicReasoning':
        return algebraicReasoningPuzzleGenerator.getRandom();
      case 'sequentialFigures':
        return sequentialFiguresPuzzleGenerator.getRandom();
      case 'numberGrid':
        return numberGridPuzzleGenerator.getRandom();
      case 'numberAnalogy':
        return numberAnalogyPuzzleGenerator.getRandom();
      case 'figureClassification':
        return figureClassificationPuzzleGenerator.getRandom();
      case 'paperFolding':
        return paperFoldingPuzzleGenerator.getRandom();
      case 'followingDirections':
        return followingDirectionsPuzzleGenerator.getRandom();
    }
  }
}

// Export singleton instance for backward compatibility
export const infinitePuzzleGenerator = new InfinitePuzzleGenerator();

/**
 * @deprecated Use infinitePuzzleGenerator.generatePuzzle() instead
 * 
 * Legacy function for backward compatibility
 * Generates an infinite variety of puzzles by cycling through three different puzzle types.
 */
// 🎯 REMOVED: generateInfinitePuzzle() function - use infinitePuzzleGenerator.generateSpecificPuzzle() directly

// Export the singleton as default
export default infinitePuzzleGenerator;