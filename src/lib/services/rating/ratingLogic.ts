import { RatingPromptData, RatingPromptStorage } from '@/src/lib/storage/ratingPrompt';
import { NativeRating, isNativeRatingAvailable } from './nativeRating';

/**
 * Rating prompt timing configuration
 * Implements exponential backoff: 1 day → 1 week → 2 weeks → 1 month → 3 months
 */
export const PROMPT_CONFIG = {
  MAX_PROMPTS_PER_YEAR: 5,
  MIN_USAGE_DAYS: 3, // Minimum app usage before first prompt
  PROMPT_INTERVALS: [1, 7, 14, 30, 90], // days between prompts (exponential backoff)
  SCORE_THRESHOLDS: [50, 100, 200, 500, 1000], // Score milestones for prompts
  YEAR_IN_MS: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  DAY_IN_MS: 24 * 60 * 60 * 1000, // 1 day in milliseconds
};

/**
 * Trigger types for rating prompts
 */
export type RatingTriggerType = 'score_milestone' | 'level_progression' | 'high_engagement' | 'version_update';

/**
 * Rating prompt context information
 */
export interface RatingPromptContext {
  trigger: RatingTriggerType;
  score: number;
  level?: number;
  reason: string;
}

/**
 * Business logic for determining when to show rating prompts
 */
export class RatingPromptLogic {
  /**
   * Determines if a rating prompt should be shown based on current context
   * @param context - Current game/app context
   * @returns Promise<boolean> - true if prompt should be shown
   */
  static async shouldShowPrompt(context: RatingPromptContext): Promise<boolean> {
    try {
      const data = await RatingPromptStorage.getRatingPromptData();
      
      // Basic eligibility checks
      if (!this.isEligibleForPrompt(data)) {
        return false;
      }

      // Timing checks
      if (!this.isTimeForNextPrompt(data)) {
        return false;
      }

      // Context-specific checks
      return this.isContextAppropriate(data, context);
    } catch (error) {
      console.warn('Failed to determine if rating prompt should be shown:', error);
      return false;
    }
  }

  /**
   * Shows the appropriate rating prompt (native or web fallback)
   * @param context - Current context for the prompt
   * @returns Promise<boolean> - true if prompt was shown successfully
   */
  static async showRatingPrompt(context: RatingPromptContext): Promise<boolean> {
    try {
      // Record the prompt attempt
      await RatingPromptStorage.recordPrompt(context.score, context.level);

      if (isNativeRatingAvailable()) {
        // Try native rating first
        const success = await NativeRating.requestReview();
        if (success) {
          // Assume user rated (native prompts don't provide feedback)
          await RatingPromptStorage.recordRated();
          return true;
        }
      }

      // Fallback: return false to let UI handle web prompt
      return false;
    } catch (error) {
      console.warn('Failed to show rating prompt:', error);
      return false;
    }
  }

  /**
   * Records that user declined to rate
   */
  static async recordDeclined(): Promise<void> {
    await RatingPromptStorage.recordDeclined();
  }

  /**
   * Records that user completed rating
   */
  static async recordRated(): Promise<void> {
    await RatingPromptStorage.recordRated();
  }

  /**
   * Checks basic eligibility for showing rating prompts
   */
  private static isEligibleForPrompt(data: RatingPromptData): boolean {
    // Don't show if user explicitly declined
    if (data.userDeclined) {
      return false;
    }

    // Don't show if user already rated current version
    if (data.ratedCurrentVersion) {
      return false;
    }

    // Don't show if exceeded max prompts per year (only for recent installs)
    const oneYearAgo = Date.now() - PROMPT_CONFIG.YEAR_IN_MS;
    if (data.promptCount >= PROMPT_CONFIG.MAX_PROMPTS_PER_YEAR && data.firstInstallDate > oneYearAgo) {
      return false;
    }

    // Check minimum usage period
    const daysSinceInstall = (Date.now() - data.firstInstallDate) / PROMPT_CONFIG.DAY_IN_MS;
    if (daysSinceInstall < PROMPT_CONFIG.MIN_USAGE_DAYS) {
      return false;
    }

    return true;
  }

  /**
   * Checks if enough time has passed since last prompt based on exponential backoff
   */
  private static isTimeForNextPrompt(data: RatingPromptData): boolean {
    // First prompt - check minimum usage days
    if (data.promptCount === 0) {
      return true; // Already checked in isEligibleForPrompt
    }

    // Calculate required interval based on prompt count
    const intervalIndex = Math.min(data.promptCount - 1, PROMPT_CONFIG.PROMPT_INTERVALS.length - 1);
    const requiredIntervalDays = PROMPT_CONFIG.PROMPT_INTERVALS[intervalIndex];
    const requiredIntervalMs = requiredIntervalDays * PROMPT_CONFIG.DAY_IN_MS;

    const timeSinceLastPrompt = Date.now() - data.lastPromptDate;
    return timeSinceLastPrompt >= requiredIntervalMs;
  }

  /**
   * Checks if the current context is appropriate for showing a prompt
   */
  private static isContextAppropriate(data: RatingPromptData, context: RatingPromptContext): boolean {
    switch (context.trigger) {
      case 'score_milestone':
        // Only prompt for score milestones we haven't prompted for yet
        return PROMPT_CONFIG.SCORE_THRESHOLDS.includes(context.score) && 
               context.score > data.highestScorePrompted;

      case 'level_progression':
        // Only prompt for new levels
        return context.level !== undefined && !data.levelPrompts.includes(context.level);

      case 'high_engagement':
        // Always appropriate if timing is right
        return true;

      case 'version_update':
        // Appropriate if user hasn't rated current version
        return !data.ratedCurrentVersion;

      default:
        return false;
    }
  }

  /**
   * Gets the next interval until a prompt might be shown
   * @returns Promise<number> - Days until next possible prompt
   */
  static async getDaysUntilNextPrompt(): Promise<number> {
    try {
      const data = await RatingPromptStorage.getRatingPromptData();

      // Check for permanent ineligibility conditions
      if (data.userDeclined || data.ratedCurrentVersion) {
        return -1; // Permanently not eligible
      }

      // Check for temporary ineligibility due to max prompts per year (recent install)
      const oneYearAgo = Date.now() - PROMPT_CONFIG.YEAR_IN_MS;
      if (data.promptCount >= PROMPT_CONFIG.MAX_PROMPTS_PER_YEAR && data.firstInstallDate > oneYearAgo) {
        return -1; // Hit yearly limit for recent install
      }

      // For new users (promptCount === 0), check minimum usage days
      if (data.promptCount === 0) {
        const daysSinceInstall = (Date.now() - data.firstInstallDate) / PROMPT_CONFIG.DAY_IN_MS;
        const remainingDays = PROMPT_CONFIG.MIN_USAGE_DAYS - daysSinceInstall;
        return Math.max(0, Math.ceil(remainingDays));
      }

      // For existing users, calculate next prompt based on exponential backoff
      const intervalIndex = Math.min(data.promptCount - 1, PROMPT_CONFIG.PROMPT_INTERVALS.length - 1);
      const requiredIntervalDays = PROMPT_CONFIG.PROMPT_INTERVALS[intervalIndex];
      const requiredIntervalMs = requiredIntervalDays * PROMPT_CONFIG.DAY_IN_MS;

      const timeSinceLastPrompt = Date.now() - data.lastPromptDate;
      const remainingMs = requiredIntervalMs - timeSinceLastPrompt;

      return Math.max(0, Math.ceil(remainingMs / PROMPT_CONFIG.DAY_IN_MS));
    } catch (error) {
      console.warn('Failed to calculate days until next prompt:', error);
      return -1;
    }
  }

  /**
   * Gets rating prompt statistics for debugging/analytics
   */
  static async getPromptStats(): Promise<{
    promptCount: number;
    daysSinceInstall: number;
    daysSinceLastPrompt: number;
    daysUntilNext: number;
    isEligible: boolean;
    ratedCurrentVersion: boolean;
    userDeclined: boolean;
  }> {
    try {
      const data = await RatingPromptStorage.getRatingPromptData();
      const now = Date.now();
      
      return {
        promptCount: data.promptCount,
        daysSinceInstall: Math.floor((now - data.firstInstallDate) / PROMPT_CONFIG.DAY_IN_MS),
        daysSinceLastPrompt: data.lastPromptDate ? Math.floor((now - data.lastPromptDate) / PROMPT_CONFIG.DAY_IN_MS) : -1,
        daysUntilNext: await this.getDaysUntilNextPrompt(),
        isEligible: this.isEligibleForPrompt(data),
        ratedCurrentVersion: data.ratedCurrentVersion,
        userDeclined: data.userDeclined,
      };
    } catch (error) {
      console.warn('Failed to get prompt stats:', error);
      return {
        promptCount: 0,
        daysSinceInstall: 0,
        daysSinceLastPrompt: -1,
        daysUntilNext: -1,
        isEligible: false,
        ratedCurrentVersion: false,
        userDeclined: false,
      };
    }
  }
}