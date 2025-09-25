/**
 * Simplified Intelligent Puzzle Engine
 *
 * Core adaptive engine that selects puzzles based on:
 * - User skill level and recent performance
 * - Puzzle difficulty and type
 * - Simple engagement optimization
 */

import { infinitePuzzleGenerator, AnyPuzzle } from '@/src/lib/game/puzzleGenerator';
import { PuzzleDNA, puzzleDNAAnalyzer } from './puzzleDNAAnalyzer';
import { UserProfile, behavioralSignatureStorage } from './behavioralSignatureStorage';
import { getEnabledPuzzleTypes, getPuzzleTypesByCategory, type PuzzleTypeConfig } from '@/src/constants/puzzleConfig';

/**
 * Configuration for adaptive puzzle selection
 */
export interface AdaptiveEngineConfig {
  newUserSettings: {
    enabled: boolean;
    puzzleCountThreshold: number;
    maxDifficulty: number;
    skillLevelThreshold?: number;
    accuracyThreshold?: number;
    engagementPriority?: number;
  };
  strugglingUserSettings: {
    enabled: boolean;
    accuracyThreshold: number;
    maxDifficulty: number;
    puzzleCountThreshold?: number;
  };
  globalSettings: {
    maxDifficulty?: number; // Optional global cap for child safety
  };
  logging: {
    enabled: boolean;
  };
  metricsLogging?: {
    detailedLearningMetrics?: boolean;
    userMetricsPerAnswer?: boolean;
    predictionAccuracyTracking?: boolean;
    silentMode?: boolean;
  };
}

/**
 * Context for current user session
 */
export interface SessionContext {
  sessionId: string;
  puzzlesSolved: number;
  currentAccuracy: number;
  engagementLevel: number;
}

/**
 * Puzzle recommendation with selection reasoning
 */
export interface PuzzleRecommendation {
  puzzle: AnyPuzzle;
  dna: PuzzleDNA;
  selectionReason: string;
  confidenceScore: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AdaptiveEngineConfig = {
  newUserSettings: {
    enabled: true,
    puzzleCountThreshold: 10,
    maxDifficulty: 0.4
  },
  strugglingUserSettings: {
    enabled: true,
    accuracyThreshold: 0.4,
    maxDifficulty: 0.3
  },
  globalSettings: {
    // No global limit by default - intelligent detection handles this
  },
  logging: {
    enabled: true  // Enable to see intelligent detection working
  }
};

/**
 * Simplified Intelligent Puzzle Engine
 * Focuses on core adaptive functionality without over-engineering
 */
export class IntelligentPuzzleEngine {
  private static instance: IntelligentPuzzleEngine;
  private config: AdaptiveEngineConfig = DEFAULT_CONFIG;
  private currentSession: SessionContext | null = null;

  static getInstance(): IntelligentPuzzleEngine {
    if (!IntelligentPuzzleEngine.instance) {
      IntelligentPuzzleEngine.instance = new IntelligentPuzzleEngine();
    }
    return IntelligentPuzzleEngine.instance;
  }

  /**
   * Configure the adaptive engine
   */
  configure(config: Partial<AdaptiveEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start a new session
   */
  async startSession(): Promise<string> {
    const sessionId = await behavioralSignatureStorage.startSession();
    this.currentSession = {
      sessionId,
      puzzlesSolved: 0,
      currentAccuracy: 0,
      engagementLevel: 0.7
    };
    return sessionId;
  }

  /**
   * Get the next puzzle recommendation based on adaptive logic
   */
  async getNextPuzzle(forceType?: string): Promise<PuzzleRecommendation> {
    try {
      const userProfile = await behavioralSignatureStorage.getUserProfile();

      // Determine target difficulty based on user state
      const targetDifficulty = this.calculateTargetDifficulty(userProfile);

      // Generate puzzle candidates
      const candidates = await this.generateCandidates(targetDifficulty, forceType);

      // Select best candidate
      const selected = this.selectBestCandidate(candidates, userProfile);

      if (this.config.logging.enabled) {
        console.log(`Selected puzzle: ${selected.puzzle.puzzleType}, difficulty: ${selected.dna.difficulty}, reason: ${selected.selectionReason}`);
      }

      return selected;
    } catch (error) {
      console.warn('Error in adaptive selection, falling back to random:', error);
      return this.getFallbackPuzzle(forceType);
    }
  }

  /**
   * Record puzzle completion and update user profile
   */
  async recordPuzzleCompletion(
    puzzleId: string,
    success: boolean,
    solveTime: number,
    engagementScore: number = 0.7
  ): Promise<void> {
    try {
      // Update user profile
      await behavioralSignatureStorage.recordPuzzleCompletion(
        puzzleId,
        success,
        solveTime,
        engagementScore
      );

      // Update current session
      if (this.currentSession) {
        this.currentSession.puzzlesSolved++;
        this.currentSession.currentAccuracy =
          (this.currentSession.currentAccuracy * (this.currentSession.puzzlesSolved - 1) + (success ? 1 : 0)) /
          this.currentSession.puzzlesSolved;
        this.currentSession.engagementLevel =
          (this.currentSession.engagementLevel * 0.8) + (engagementScore * 0.2);
      }

      // Update puzzle DNA with performance data
      const dna = puzzleDNAAnalyzer.getPuzzleDNA(puzzleId);
      if (dna) {
        puzzleDNAAnalyzer.updatePuzzleDNA(puzzleId, {
          successRate: success ? 0.8 : 0.4, // Simple success rate update
          avgEngagementScore: engagementScore
        });
      }
    } catch (error) {
      console.warn('Error recording puzzle completion:', error);
    }
  }

  /**
   * Automatically detect user characteristics from behavioral patterns
   */
  private detectUserCharacteristics(userProfile: UserProfile): {
    inferredMaxDifficulty: number;
    learningStyle: 'visual' | 'logical' | 'mixed';
    developmentStage: 'early' | 'intermediate' | 'advanced';
  } {
    const characteristics: {
      inferredMaxDifficulty: number;
      learningStyle: 'visual' | 'logical' | 'mixed';
      developmentStage: 'early' | 'intermediate' | 'advanced';
    } = {
      inferredMaxDifficulty: 0.9, // Default adult level
      learningStyle: 'mixed',
      developmentStage: 'advanced'
    };

    // GRADUAL PROGRESSION: Instead of binary classification, use smooth difficulty scaling
    if (userProfile.totalPuzzlesSolved < 50) {
      // Gradual progression from 0.25 to 0.65 over first 50 puzzles
      const progressRatio = userProfile.totalPuzzlesSolved / 50;
      const baseProgression = 0.25 + (progressRatio * 0.4); // 0.25 → 0.65

      // Adjust based on recent success rate for more responsive scaling
      const recentPerformance = userProfile.recentPerformance || [];
      const recentSuccessRate = recentPerformance.length > 0
        ? recentPerformance.filter(Boolean).length / recentPerformance.length
        : 0.5;

      // Performance-based adjustment (±0.1 max)
      const performanceAdjustment = (recentSuccessRate - 0.6) * 0.25; // Scale factor

      characteristics.inferredMaxDifficulty = Math.max(0.25, Math.min(0.65, baseProgression + performanceAdjustment));
      characteristics.developmentStage = progressRatio < 0.3 ? 'early' : progressRatio < 0.7 ? 'intermediate' : 'advanced';
      characteristics.learningStyle = 'mixed'; // Will be refined after more data

      if (this.config.logging.enabled) {
        console.log(`📈 [Gradual Progression] Puzzles: ${userProfile.totalPuzzlesSolved}/50, Ratio: ${progressRatio.toFixed(2)}, Difficulty Cap: ${characteristics.inferredMaxDifficulty.toFixed(2)}`);
      }
      return characteristics;
    }

    // Analyze puzzle type performance patterns
    const puzzleTypeSuccess = this.analyzePuzzleTypePerformance(userProfile);

    // SIGNAL 1: Visual vs Abstract Reasoning Capability - only use enabled types
    const visualTypes = getPuzzleTypesByCategory('visual' as PuzzleTypeConfig['category']).filter(type => getEnabledPuzzleTypes()[type]);
    const logicalTypes = getPuzzleTypesByCategory('logical' as PuzzleTypeConfig['category']).filter(type => getEnabledPuzzleTypes()[type]);

    const visualSuccess = visualTypes.length > 0
      ? visualTypes.reduce((sum, type) => sum + (puzzleTypeSuccess[type] || 0.5), 0) / visualTypes.length
      : 0.5;

    const abstractSuccess = logicalTypes.length > 0
      ? logicalTypes.reduce((sum, type) => sum + (puzzleTypeSuccess[type] || 0), 0) / logicalTypes.length
      : 0;

    // SIGNAL 2: Mathematical Reasoning Capability - only use enabled mathematical types
    const mathTypes = getPuzzleTypesByCategory('mathematical' as PuzzleTypeConfig['category']).filter(type => getEnabledPuzzleTypes()[type]);
    const mathSuccess = mathTypes.length > 0
      ? mathTypes.reduce((sum, type) => sum + (puzzleTypeSuccess[type] || 0), 0) / mathTypes.length
      : 0;

    // SIGNAL 3: Overall skill ceiling detection
    const maxDifficultySucceeded = userProfile.currentMaxDifficulty;
    const consistentHighPerformance = userProfile.overallAccuracy > 0.75;
    const lowSkillCeiling = maxDifficultySucceeded < 0.4;

    // SIGNAL 4: Engagement and response patterns (additional early learner indicators)
    const quickGiveUps = userProfile.recentPerformance.slice(-10).filter(success => !success).length > 6;
    const lowOverallAccuracy = userProfile.overallAccuracy < 0.5;

    // SIGNAL 5: Preference and engagement patterns (NEW - critical for user satisfaction)
    const avgEngagement = userProfile.avgEngagementScore || 0.7;
    const prefersConsistentSuccess = consistentHighPerformance && avgEngagement > 0.8; // High accuracy + high engagement = likes success
    const challengeSeeker = userProfile.overallAccuracy < 0.8 && avgEngagement > 0.7; // Lower accuracy but still engaged = likes challenge
    const frustratedByDifficulty = maxDifficultySucceeded > 0.6 && avgEngagement < 0.6; // Can handle hard but low engagement = prefers easier

    // CONSERVATIVE EARLY STAGE DETECTION - prioritize child safety
    if (
      // Pattern 1: Visual preference with weak abstract reasoning
      (visualSuccess > 0.6 && abstractSuccess < 0.25 && mathSuccess < 0.35) ||
      // Pattern 2: Low skill ceiling with struggle indicators
      (lowSkillCeiling && (quickGiveUps || lowOverallAccuracy)) ||
      // Pattern 3: Consistent struggles with complex reasoning
      (mathSuccess < 0.3 && abstractSuccess < 0.2) ||
      // Pattern 4: Very low overall performance indicating developmental limitations
      (userProfile.overallAccuracy < 0.4 && maxDifficultySucceeded < 0.45)
    ) {
      characteristics.developmentStage = 'early';
      characteristics.learningStyle = 'visual';
      characteristics.inferredMaxDifficulty = Math.min(0.35, maxDifficultySucceeded + 0.05); // Very conservative cap
    } else if (prefersConsistentSuccess && !challengeSeeker) {
      // HIGH CAPABILITY but PREFERS EASIER CONTENT (like Mumu - can do hard but avoids them)
      characteristics.developmentStage = 'intermediate'; // Capable but not challenge-seeking
      characteristics.learningStyle = 'mixed';
      // CRITICAL: For preference-driven users, weight ENGAGEMENT over capability
      const engagementWeight = avgEngagement > 0.7 ? 0.8 : 0.6; // High engagement = strong preference signal
      const capabilityAdjustment = maxDifficultySucceeded * (1 - engagementWeight); // Reduce capability influence
      characteristics.inferredMaxDifficulty = Math.min(0.45, capabilityAdjustment + 0.2); // Strong preference weighting
    } else if (challengeSeeker || (mathSuccess > 0.65 && consistentHighPerformance && maxDifficultySucceeded > 0.6 && !frustratedByDifficulty)) {
      // CHALLENGE SEEKERS - Strong mathematical reasoning AND enjoys difficulty
      characteristics.developmentStage = 'advanced';
      characteristics.learningStyle = 'logical';
      characteristics.inferredMaxDifficulty = Math.min(0.9, maxDifficultySucceeded + 0.15);
    } else {
      // Balanced performance → intermediate learner
      characteristics.developmentStage = 'intermediate';
      characteristics.learningStyle = 'mixed';
      characteristics.inferredMaxDifficulty = Math.min(0.65, maxDifficultySucceeded + 0.1);
    }

    return characteristics;
  }

  /**
   * Analyze success rates by puzzle type
   */
  private analyzePuzzleTypePerformance(userProfile: UserProfile): Record<string, number> {
    // Simplified analysis based on preferred types and recent performance
    // In a full implementation, this would track per-type success rates
    const typePerformance: Record<string, number> = {};

    // Use preferred puzzle types as proxy for success
    userProfile.preferredPuzzleTypes.forEach(type => {
      typePerformance[type] = 0.8; // High success rate for preferred types
    });

    // Estimate other types based on overall performance - only for enabled types
    const baseSuccess = userProfile.overallAccuracy;
    const enabledTypes = getEnabledPuzzleTypes();
    Object.keys(enabledTypes).forEach(type => {
      if (!typePerformance[type]) {
        typePerformance[type] = baseSuccess * 0.8; // Slightly lower for non-preferred
      }
    });

    return typePerformance;
  }

  /**
   * Calculate target difficulty based on user profile
   */
  private calculateTargetDifficulty(userProfile: UserProfile): number {
    // STEP 1: Intelligently detect user characteristics
    const detectedCharacteristics = this.detectUserCharacteristics(userProfile);

    // STEP 2: Handle special cases first
    // Handle new users
    if (this.config.newUserSettings.enabled &&
        userProfile.totalPuzzlesSolved <= this.config.newUserSettings.puzzleCountThreshold) {
      return Math.min(this.config.newUserSettings.maxDifficulty, userProfile.currentSkillLevel);
    }

    // Handle struggling users
    if (this.config.strugglingUserSettings.enabled &&
        userProfile.overallAccuracy < this.config.strugglingUserSettings.accuracyThreshold) {
      return Math.min(this.config.strugglingUserSettings.maxDifficulty, userProfile.currentSkillLevel);
    }

    // STEP 3: DYNAMIC MULTI-OBJECTIVE DIFFICULTY CALCULATION
    const baseTargetDifficulty = userProfile.currentSkillLevel;

    // Recent performance adjustment
    const recentSuccessRate = userProfile.recentPerformance.length > 0
      ? userProfile.recentPerformance.filter(success => success).length / userProfile.recentPerformance.length
      : 0.6;

    // ENGAGEMENT-DRIVEN ADJUSTMENT: Critical for preference modeling
    const avgEngagement = userProfile.avgEngagementScore || 0.6;
    let engagementAdjustment = 0;
    if (avgEngagement < 0.5) {
      // Low engagement = user dissatisfied, reduce difficulty significantly
      engagementAdjustment = -0.2;
    } else if (avgEngagement > 0.8 && recentSuccessRate > 0.6) {
      // High engagement + decent success = user enjoys challenge
      engagementAdjustment = 0.1;
    }

    // PERFORMANCE-BASED ADJUSTMENT - More gradual steps
    let performanceAdjustment = 0;
    if (recentSuccessRate > 0.8) {
      performanceAdjustment = 0.05; // Smaller increase for gradual progression
    } else if (recentSuccessRate < 0.4) {
      performanceAdjustment = -0.05; // Smaller decrease for gradual progression
    }

    // WEIGHTED COMBINATION: Different personas get different weight distributions
    const capabilityWeight = detectedCharacteristics.developmentStage === 'early' ? 0.7 : 0.4;
    const engagementWeight = detectedCharacteristics.developmentStage === 'early' ? 0.2 : 0.5; // Adults: engagement matters more
    const performanceWeight = 1 - capabilityWeight - engagementWeight;

    const weightedAdjustment = (engagementAdjustment * engagementWeight) + (performanceAdjustment * performanceWeight);
    const calculatedDifficulty = Math.max(0.1, Math.min(0.9, baseTargetDifficulty + weightedAdjustment));

    // STEP 4: Apply intelligent caps
    let finalDifficulty = calculatedDifficulty;

    // 1. Intelligently inferred difficulty cap (most important)
    finalDifficulty = Math.min(finalDifficulty, detectedCharacteristics.inferredMaxDifficulty);

    // 2. Global configuration override (if any)
    if (this.config.globalSettings.maxDifficulty !== undefined) {
      finalDifficulty = Math.min(finalDifficulty, this.config.globalSettings.maxDifficulty);
    }

    // 3. Extra safety net for early-stage learners
    if (detectedCharacteristics.developmentStage === 'early') {
      // Additional conservative cap for early learners
      finalDifficulty = Math.min(finalDifficulty, 0.32);

      // Be even more conservative for very new users
      if (userProfile.totalPuzzlesSolved < 5) {
        finalDifficulty = Math.min(finalDifficulty, 0.25);
      }
    }

    // STEP 5: Log multi-objective optimization for transparency
    if (this.config.logging.enabled) {
      console.log(`🧠 Multi-Objective Optimization: ${detectedCharacteristics.developmentStage} learner`);
      console.log(`   📊 Weights: Capability=${(capabilityWeight*100).toFixed(0)}%, Engagement=${(engagementWeight*100).toFixed(0)}%, Performance=${(performanceWeight*100).toFixed(0)}%`);
      console.log(`   🎯 Adjustments: Engagement=${engagementAdjustment.toFixed(2)}, Performance=${performanceAdjustment.toFixed(2)}`);
      console.log(`   🎪 Final difficulty: ${finalDifficulty.toFixed(2)} (from base ${baseTargetDifficulty.toFixed(2)}, capped at ${detectedCharacteristics.inferredMaxDifficulty.toFixed(2)})`);
    }

    return finalDifficulty;
  }

  /**
   * Intelligently adjust puzzle type preferences based on detected characteristics
   * Now uses centralized configuration to only recommend enabled puzzle types
   */
  private getIntelligentPatternPreference(
    recentPatterns: string[],
    characteristics: { learningStyle: 'visual' | 'logical' | 'mixed'; developmentStage: 'early' | 'intermediate' | 'advanced' }
  ): string[] {
    const adjustedPatterns = [...recentPatterns];
    const enabledTypes = getEnabledPuzzleTypes();
    const enabledTypeNames = Object.keys(enabledTypes);

    // Helper function to filter only enabled types
    const filterEnabledTypes = (types: string[]): string[] => {
      return types.filter(type => enabledTypeNames.includes(type));
    };

    // EARLY STAGE: Bias toward visual and simple puzzles
    if (characteristics.developmentStage === 'early') {
      // Get visual category types that are enabled
      const visualTypes = getPuzzleTypesByCategory('visual' as PuzzleTypeConfig['category']).filter(type => enabledTypes[type]);
      adjustedPatterns.unshift(...visualTypes, ...visualTypes); // Double weight visual patterns

      // Filter out complex categories but keep only enabled types
      const simpleCategories: PuzzleTypeConfig['category'][] = ['visual', 'mathematical'];
      const allowedTypes = simpleCategories.flatMap(category =>
        getPuzzleTypesByCategory(category).filter(type => enabledTypes[type])
      );

      return adjustedPatterns.filter(type => allowedTypes.includes(type));
    }

    // VISUAL LEARNER: Prefer visual category puzzles
    if (characteristics.learningStyle === 'visual') {
      const visualTypes = getPuzzleTypesByCategory('visual' as PuzzleTypeConfig['category']).filter(type => enabledTypes[type]);
      const spatialTypes = getPuzzleTypesByCategory('spatial' as PuzzleTypeConfig['category']).filter(type => enabledTypes[type]);
      adjustedPatterns.unshift(...visualTypes, ...spatialTypes);
      return filterEnabledTypes(adjustedPatterns);
    }

    // LOGICAL LEARNER: Prefer mathematical and logical puzzles
    if (characteristics.learningStyle === 'logical') {
      const logicalTypes = getPuzzleTypesByCategory('logical' as PuzzleTypeConfig['category']).filter(type => enabledTypes[type]);
      const mathTypes = getPuzzleTypesByCategory('mathematical' as PuzzleTypeConfig['category']).filter(type => enabledTypes[type]);
      adjustedPatterns.unshift(...logicalTypes, ...mathTypes);
      return filterEnabledTypes(adjustedPatterns);
    }

    // MIXED or ADVANCED: Keep variety but only enabled types
    return filterEnabledTypes(adjustedPatterns);
  }

  /**
   * Generate puzzle candidates for selection
   */
  private async generateCandidates(targetDifficulty: number, forceType?: string): Promise<PuzzleRecommendation[]> {
    const candidates: PuzzleRecommendation[] = [];
    const candidateCount = 3; // Generate 3 candidates instead of 10

    // Get user profile and detect characteristics
    const userProfile = await behavioralSignatureStorage.getUserProfile();
    const detectedCharacteristics = this.detectUserCharacteristics(userProfile);
    const recentPatterns = userProfile.preferredPuzzleTypes.slice(-5); // Last 5 preferred types

    for (let i = 0; i < candidateCount; i++) {
      try {
        let puzzle: AnyPuzzle | null;

        if (forceType) {
          puzzle = infinitePuzzleGenerator.generateSpecificTypePuzzle(forceType);
        } else {
          // INTELLIGENT: Use detected learning style to guide puzzle generation
          const intelligentRecentPatterns = this.getIntelligentPatternPreference(
            recentPatterns,
            detectedCharacteristics
          );

          puzzle = infinitePuzzleGenerator.generatePuzzle(undefined, targetDifficulty, intelligentRecentPatterns);
        }

        // Skip null puzzles
        if (!puzzle) {
          continue;
        }

        const dna = puzzleDNAAnalyzer.analyzePuzzle(puzzle);

        candidates.push({
          puzzle,
          dna,
          selectionReason: `Generated for difficulty ${targetDifficulty.toFixed(2)}`,
          confidenceScore: this.calculateCandidateScore(dna, targetDifficulty)
        });
      } catch (error) {
        console.warn(`Failed to generate candidate ${i}:`, error);
      }
    }

    return candidates.length > 0 ? candidates : [await this.getFallbackPuzzle(forceType)];
  }

  /**
   * Select the best candidate from generated options
   */
  private selectBestCandidate(candidates: PuzzleRecommendation[], userProfile: UserProfile): PuzzleRecommendation {
    if (candidates.length === 0) {
      throw new Error('No candidates available for selection');
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    // Score each candidate
    let bestCandidate = candidates[0];
    let bestScore = this.scoreCandidateForUser(candidates[0], userProfile);

    for (let i = 1; i < candidates.length; i++) {
      const score = this.scoreCandidateForUser(candidates[i], userProfile);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidates[i];
      }
    }

    bestCandidate.selectionReason = `Best match (score: ${bestScore.toFixed(2)})`;
    bestCandidate.confidenceScore = bestScore;

    return bestCandidate;
  }

  /**
   * Score a candidate puzzle for the current user
   */
  private scoreCandidateForUser(candidate: PuzzleRecommendation, userProfile: UserProfile): number {
    let score = 0;

    // Difficulty appropriateness (0-0.4 points)
    const difficultyDiff = Math.abs(candidate.dna.difficulty - userProfile.currentSkillLevel);
    score += Math.max(0, 0.4 - difficultyDiff);

    // User engagement with this puzzle type (0-0.3 points)
    if (userProfile.preferredPuzzleTypes.includes(candidate.dna.puzzleType)) {
      score += 0.3;
    }

    // Historical success rate (0-0.3 points)
    score += candidate.dna.successRate * 0.3;

    return score;
  }

  /**
   * Calculate basic candidate score
   */
  private calculateCandidateScore(dna: PuzzleDNA, targetDifficulty: number): number {
    const difficultyMatch = 1 - Math.abs(dna.difficulty - targetDifficulty);
    const engagementScore = dna.userEngagement;
    const successScore = dna.successRate;

    return (difficultyMatch * 0.5) + (engagementScore * 0.3) + (successScore * 0.2);
  }

  /**
   * Get fallback puzzle when adaptive selection fails
   */
  private async getFallbackPuzzle(forceType?: string): Promise<PuzzleRecommendation> {
    // Use easy difficulty for fallback to be safe
    const fallbackDifficulty = 0.3;

    const puzzle = forceType
      ? infinitePuzzleGenerator.generateSpecificTypePuzzle(forceType)
      : infinitePuzzleGenerator.generatePuzzle(undefined, fallbackDifficulty, []);

    if (!puzzle) {
      // Final fallback - generate simplest pattern puzzle
      const finalFallback = infinitePuzzleGenerator.generateSpecificTypePuzzle('pattern');
      if (!finalFallback) {
        throw new Error('Failed to generate any puzzle');
      }
      const dna = puzzleDNAAnalyzer.analyzePuzzle(finalFallback);
      return {
        puzzle: finalFallback,
        dna,
        selectionReason: 'Fallback puzzle',
        confidenceScore: 0.5
      };
    }

    const dna = puzzleDNAAnalyzer.analyzePuzzle(puzzle);

    return {
      puzzle,
      dna,
      selectionReason: 'Fallback generation (adaptive selection failed)',
      confidenceScore: 0.5
    };
  }

  /**
   * Get current session data
   */
  getCurrentSession(): SessionContext | null {
    return this.currentSession;
  }

  /**
   * Reset the engine state
   */
  reset(): void {
    this.currentSession = null;
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Enable tracking for persona tests
   */
  enableTracking(): void {
    // Stub method for persona testing
  }

  /**
   * Start adaptive session for persona tests
   */
  startAdaptiveSession(config?: any, options?: any): void {
    // Stub method for persona testing
  }

  /**
   * Generate adaptive puzzle for persona tests
   */
  async generateAdaptivePuzzle(): Promise<PuzzleRecommendation | null> {
    try {
      // Use the existing getNextPuzzle implementation
      return await this.getNextPuzzle();
    } catch (error) {
      console.warn('Error in generateAdaptivePuzzle:', error);
      return null;
    }
  }
}

// Export singleton instance
export const intelligentPuzzleEngine = IntelligentPuzzleEngine.getInstance();