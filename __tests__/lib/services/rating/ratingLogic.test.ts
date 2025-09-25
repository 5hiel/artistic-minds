/**
 * Tests for Rating Logic Service
 * Covers prompt timing, eligibility checks, and rating flow
 */

import {
  RatingPromptLogic,
  PROMPT_CONFIG,
  type RatingTriggerType,
  type RatingPromptContext
} from '../../../../src/lib/services/rating/ratingLogic';
import { RatingPromptStorage } from '../../../../src/lib/storage/ratingPrompt';
import { NativeRating, isNativeRatingAvailable } from '../../../../src/lib/services/rating/nativeRating';

// Mock dependencies
jest.mock('../../../../src/lib/storage/ratingPrompt', () => ({
  RatingPromptStorage: {
    getRatingPromptData: jest.fn(),
    recordPrompt: jest.fn(),
    recordRated: jest.fn(),
    recordDeclined: jest.fn()
  }
}));

jest.mock('../../../../src/lib/services/rating/nativeRating', () => ({
  NativeRating: {
    requestReview: jest.fn()
  },
  isNativeRatingAvailable: jest.fn(),
  isWebPlatform: jest.fn()
}));

describe('Rating Prompt Logic', () => {
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
  });

  describe('PROMPT_CONFIG Constants', () => {
    it('should export correct configuration values', () => {
      expect(PROMPT_CONFIG.MAX_PROMPTS_PER_YEAR).toBe(5);
      expect(PROMPT_CONFIG.MIN_USAGE_DAYS).toBe(3);
      expect(PROMPT_CONFIG.PROMPT_INTERVALS).toEqual([1, 7, 14, 30, 90]);
      expect(PROMPT_CONFIG.SCORE_THRESHOLDS).toEqual([50, 100, 200, 500, 1000]);
      expect(PROMPT_CONFIG.YEAR_IN_MS).toBe(365 * 24 * 60 * 60 * 1000);
      expect(PROMPT_CONFIG.DAY_IN_MS).toBe(24 * 60 * 60 * 1000);
    });

    it('should have correct exponential backoff intervals', () => {
      const intervals = PROMPT_CONFIG.PROMPT_INTERVALS;
      expect(intervals).toEqual([1, 7, 14, 30, 90]); // Days: 1, 1 week, 2 weeks, 1 month, 3 months
    });

    it('should have reasonable score thresholds for milestones', () => {
      const thresholds = PROMPT_CONFIG.SCORE_THRESHOLDS;
      expect(thresholds).toEqual([50, 100, 200, 500, 1000]);
      expect(thresholds).toHaveLength(5); // Same as max prompts per year
    });
  });

  describe('shouldShowPrompt()', () => {
    const mockContext: RatingPromptContext = {
      trigger: 'score_milestone',
      score: 100,
      reason: 'User reached score milestone'
    };

    beforeEach(() => {
      const mockData = {
        promptCount: 0,
        firstInstallDate: Date.now() - 7 * PROMPT_CONFIG.DAY_IN_MS, // 7 days ago
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      };
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue(mockData);
    });

    it('should return true for eligible new user with score milestone', async () => {
      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);
      expect(result).toBe(true);
    });

    it('should return false if user declined rating', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 1,
        firstInstallDate: Date.now() - 7 * PROMPT_CONFIG.DAY_IN_MS,
        lastPromptDate: Date.now() - 2 * PROMPT_CONFIG.DAY_IN_MS,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: true, // User declined
        ratedCurrentVersion: false
      });

      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);
      expect(result).toBe(false);
    });

    it('should return false if user already rated current version', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 1,
        firstInstallDate: Date.now() - 7 * PROMPT_CONFIG.DAY_IN_MS,
        lastPromptDate: Date.now() - 2 * PROMPT_CONFIG.DAY_IN_MS,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: true // Already rated
      });

      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);
      expect(result).toBe(false);
    });

    it('should return false if exceeded max prompts per year', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 6, // Exceeded MAX_PROMPTS_PER_YEAR (5)
        firstInstallDate: Date.now() - 30 * PROMPT_CONFIG.DAY_IN_MS, // Recent install
        lastPromptDate: Date.now() - 2 * PROMPT_CONFIG.DAY_IN_MS,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);
      expect(result).toBe(false);
    });

    it('should return false if not enough usage days', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 0,
        firstInstallDate: Date.now() - 1 * PROMPT_CONFIG.DAY_IN_MS, // Only 1 day ago (min is 3)
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);
      expect(result).toBe(false);
    });

    it('should return false if not enough time since last prompt', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 1,
        firstInstallDate: Date.now() - 30 * PROMPT_CONFIG.DAY_IN_MS,
        lastPromptDate: Date.now() - 0.5 * PROMPT_CONFIG.DAY_IN_MS, // Only 12 hours ago (interval is 1 day)
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);
      expect(result).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await RatingPromptLogic.shouldShowPrompt(mockContext);

      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to determine if rating prompt should be shown:',
        expect.any(Error)
      );
    });
  });

  describe('Context Appropriateness Checks', () => {
    const baseData = {
      promptCount: 1,
      firstInstallDate: Date.now() - 7 * PROMPT_CONFIG.DAY_IN_MS,
      lastPromptDate: Date.now() - 2 * PROMPT_CONFIG.DAY_IN_MS,
      highestScorePrompted: 50,
      levelPrompts: [1, 2],
      userDeclined: false,
      ratedCurrentVersion: false
    };

    beforeEach(() => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue(baseData);
    });

    it('should allow score milestone for new milestone scores', async () => {
      const context: RatingPromptContext = {
        trigger: 'score_milestone',
        score: 100, // Higher than highestScorePrompted (50) and in thresholds
        reason: 'Score milestone reached'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(true);
    });

    it('should reject score milestone for already prompted scores', async () => {
      const context: RatingPromptContext = {
        trigger: 'score_milestone',
        score: 50, // Same as highestScorePrompted
        reason: 'Score milestone reached'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(false);
    });

    it('should reject score milestone for non-threshold scores', async () => {
      const context: RatingPromptContext = {
        trigger: 'score_milestone',
        score: 75, // Not in SCORE_THRESHOLDS
        reason: 'Score milestone reached'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(false);
    });

    it('should allow level progression for new levels', async () => {
      const context: RatingPromptContext = {
        trigger: 'level_progression',
        score: 150,
        level: 3, // Not in levelPrompts [1, 2]
        reason: 'Level progression'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(true);
    });

    it('should reject level progression for already prompted levels', async () => {
      const context: RatingPromptContext = {
        trigger: 'level_progression',
        score: 150,
        level: 2, // Already in levelPrompts [1, 2]
        reason: 'Level progression'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(false);
    });

    it('should allow high engagement triggers', async () => {
      const context: RatingPromptContext = {
        trigger: 'high_engagement',
        score: 150,
        reason: 'High engagement session'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(true);
    });

    it('should allow version update triggers', async () => {
      const context: RatingPromptContext = {
        trigger: 'version_update',
        score: 150,
        reason: 'App version updated'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(true);
    });

    it('should reject version update if user already rated current version', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        ...baseData,
        ratedCurrentVersion: true
      });

      const context: RatingPromptContext = {
        trigger: 'version_update',
        score: 150,
        reason: 'App version updated'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(false);
    });

    it('should reject unknown trigger types', async () => {
      const context: RatingPromptContext = {
        trigger: 'unknown_trigger' as RatingTriggerType,
        score: 150,
        reason: 'Unknown trigger'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(false);
    });
  });

  describe('showRatingPrompt()', () => {
    const mockContext: RatingPromptContext = {
      trigger: 'score_milestone',
      score: 100,
      level: 5,
      reason: 'User reached milestone'
    };

    beforeEach(() => {
      (RatingPromptStorage.recordPrompt as jest.Mock).mockResolvedValue(undefined);
      (RatingPromptStorage.recordRated as jest.Mock).mockResolvedValue(undefined);
    });

    it('should show native rating when available and successful', async () => {
      (isNativeRatingAvailable as jest.Mock).mockReturnValue(true);
      (NativeRating.requestReview as jest.Mock).mockResolvedValue(true);

      const result = await RatingPromptLogic.showRatingPrompt(mockContext);

      expect(RatingPromptStorage.recordPrompt).toHaveBeenCalledWith(100, 5);
      expect(NativeRating.requestReview).toHaveBeenCalled();
      expect(RatingPromptStorage.recordRated).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should fallback to web when native rating unavailable', async () => {
      (isNativeRatingAvailable as jest.Mock).mockReturnValue(false);

      const result = await RatingPromptLogic.showRatingPrompt(mockContext);

      expect(RatingPromptStorage.recordPrompt).toHaveBeenCalledWith(100, 5);
      expect(NativeRating.requestReview).not.toHaveBeenCalled();
      expect(RatingPromptStorage.recordRated).not.toHaveBeenCalled();
      expect(result).toBe(false); // Returns false to let UI handle web prompt
    });

    it('should fallback to web when native rating fails', async () => {
      (isNativeRatingAvailable as jest.Mock).mockReturnValue(true);
      (NativeRating.requestReview as jest.Mock).mockResolvedValue(false);

      const result = await RatingPromptLogic.showRatingPrompt(mockContext);

      expect(RatingPromptStorage.recordPrompt).toHaveBeenCalledWith(100, 5);
      expect(NativeRating.requestReview).toHaveBeenCalled();
      expect(RatingPromptStorage.recordRated).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      (RatingPromptStorage.recordPrompt as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await RatingPromptLogic.showRatingPrompt(mockContext);

      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to show rating prompt:',
        expect.any(Error)
      );
    });

    it('should handle native rating errors gracefully', async () => {
      (isNativeRatingAvailable as jest.Mock).mockReturnValue(true);
      (NativeRating.requestReview as jest.Mock).mockRejectedValue(new Error('Native rating error'));

      const result = await RatingPromptLogic.showRatingPrompt(mockContext);

      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to show rating prompt:',
        expect.any(Error)
      );
    });
  });

  describe('recordDeclined()', () => {
    it('should call storage to record declined rating', async () => {
      (RatingPromptStorage.recordDeclined as jest.Mock).mockResolvedValue(undefined);

      await RatingPromptLogic.recordDeclined();

      expect(RatingPromptStorage.recordDeclined).toHaveBeenCalled();
    });
  });

  describe('recordRated()', () => {
    it('should call storage to record completed rating', async () => {
      (RatingPromptStorage.recordRated as jest.Mock).mockResolvedValue(undefined);

      await RatingPromptLogic.recordRated();

      expect(RatingPromptStorage.recordRated).toHaveBeenCalled();
    });
  });

  describe('getDaysUntilNextPrompt()', () => {
    it('should return -1 for ineligible users', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 0,
        firstInstallDate: Date.now() - 1 * PROMPT_CONFIG.DAY_IN_MS,
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: true, // User explicitly declined - permanently ineligible
        ratedCurrentVersion: false
      });

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();
      expect(days).toBe(-1);
    });

    it('should calculate days until first prompt for new users', async () => {
      const installDate = Date.now() - 1 * PROMPT_CONFIG.DAY_IN_MS; // 1 day ago
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 0,
        firstInstallDate: installDate,
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();
      expect(days).toBe(2); // 3 days minimum - 1 day elapsed = 2 days remaining
    });

    it('should return 0 when ready for first prompt', async () => {
      const installDate = Date.now() - 5 * PROMPT_CONFIG.DAY_IN_MS; // 5 days ago
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 0,
        firstInstallDate: installDate,
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();
      expect(days).toBe(0);
    });

    it('should calculate days until next prompt based on exponential backoff', async () => {
      const lastPromptDate = Date.now() - 5 * PROMPT_CONFIG.DAY_IN_MS; // 5 days ago
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 2, // Second prompt, so interval should be PROMPT_INTERVALS[1] = 7 days
        firstInstallDate: Date.now() - 30 * PROMPT_CONFIG.DAY_IN_MS,
        lastPromptDate,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();
      expect(days).toBe(2); // 7 days required - 5 days elapsed = 2 days remaining
    });

    it('should use maximum interval for high prompt counts', async () => {
      const lastPromptDate = Date.now() - 30 * PROMPT_CONFIG.DAY_IN_MS; // 30 days ago
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 10, // Very high count, should use last interval (90 days)
        firstInstallDate: Date.now() - 400 * PROMPT_CONFIG.DAY_IN_MS, // Over a year ago
        lastPromptDate,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();
      expect(days).toBe(60); // 90 days required - 30 days elapsed = 60 days remaining
    });

    it('should handle storage errors gracefully', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();

      expect(days).toBe(-1);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to calculate days until next prompt:',
        expect.any(Error)
      );
    });
  });

  describe('getPromptStats()', () => {
    const mockData = {
      promptCount: 2,
      firstInstallDate: Date.now() - 15 * PROMPT_CONFIG.DAY_IN_MS, // 15 days ago
      lastPromptDate: Date.now() - 8 * PROMPT_CONFIG.DAY_IN_MS, // 8 days ago
      highestScorePrompted: 100,
      levelPrompts: [1, 2],
      userDeclined: false,
      ratedCurrentVersion: false
    };

    it('should return comprehensive stats', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue(mockData);

      const stats = await RatingPromptLogic.getPromptStats();

      expect(stats).toEqual({
        promptCount: 2,
        daysSinceInstall: 15,
        daysSinceLastPrompt: 8,
        daysUntilNext: expect.any(Number),
        isEligible: expect.any(Boolean),
        ratedCurrentVersion: false,
        userDeclined: false
      });

      expect(stats.promptCount).toBe(2);
      expect(stats.daysSinceInstall).toBe(15);
      expect(stats.daysSinceLastPrompt).toBe(8);
      expect(typeof stats.isEligible).toBe('boolean');
    });

    it('should return -1 for daysSinceLastPrompt when no last prompt date', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        ...mockData,
        lastPromptDate: 0 // No last prompt
      });

      const stats = await RatingPromptLogic.getPromptStats();

      expect(stats.daysSinceLastPrompt).toBe(-1);
    });

    it('should handle storage errors gracefully', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const stats = await RatingPromptLogic.getPromptStats();

      expect(stats).toEqual({
        promptCount: 0,
        daysSinceInstall: 0,
        daysSinceLastPrompt: -1,
        daysUntilNext: -1,
        isEligible: false,
        ratedCurrentVersion: false,
        userDeclined: false
      });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to get prompt stats:',
        expect.any(Error)
      );
    });
  });

  describe('Exponential Backoff Logic', () => {
    it('should use correct intervals based on prompt count', async () => {
      const testCases = [
        { promptCount: 1, expectedInterval: 1 },   // First interval
        { promptCount: 2, expectedInterval: 7 },   // Second interval
        { promptCount: 3, expectedInterval: 14 },  // Third interval
        { promptCount: 4, expectedInterval: 30 },  // Fourth interval
        { promptCount: 5, expectedInterval: 90 },  // Fifth interval
        { promptCount: 10, expectedInterval: 90 }, // Should use last interval
      ];

      for (const { promptCount, expectedInterval } of testCases) {
        const lastPromptDate = Date.now() - (expectedInterval - 1) * PROMPT_CONFIG.DAY_IN_MS; // 1 day short

        // Use old install date for high prompt counts to avoid yearly limit
        const installDate = promptCount >= PROMPT_CONFIG.MAX_PROMPTS_PER_YEAR
          ? Date.now() - 400 * PROMPT_CONFIG.DAY_IN_MS  // Over a year ago
          : Date.now() - 100 * PROMPT_CONFIG.DAY_IN_MS; // Recent install

        (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
          promptCount,
          firstInstallDate: installDate,
          lastPromptDate,
          highestScorePrompted: 0,
          levelPrompts: [],
          userDeclined: false,
          ratedCurrentVersion: false
        });

        const days = await RatingPromptLogic.getDaysUntilNextPrompt();
        expect(days).toBe(1); // Should have 1 day remaining for each test case
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined level in context', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 0,
        firstInstallDate: Date.now() - 7 * PROMPT_CONFIG.DAY_IN_MS,
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const context: RatingPromptContext = {
        trigger: 'level_progression',
        score: 100,
        // level is undefined
        reason: 'Level progression'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(false); // Should fail because level is undefined
    });

    it('should handle very old install dates correctly', async () => {
      const veryOldDate = Date.now() - 400 * PROMPT_CONFIG.DAY_IN_MS; // Over a year ago
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 6, // Over the yearly limit
        firstInstallDate: veryOldDate,
        lastPromptDate: Date.now() - 91 * PROMPT_CONFIG.DAY_IN_MS, // 91 days ago (> 90 day interval)
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const context: RatingPromptContext = {
        trigger: 'high_engagement',
        score: 100,
        reason: 'High engagement'
      };

      const result = await RatingPromptLogic.shouldShowPrompt(context);
      expect(result).toBe(true); // Should be eligible because install was over a year ago
    });

    it('should handle zero and negative timestamps correctly', async () => {
      (RatingPromptStorage.getRatingPromptData as jest.Mock).mockResolvedValue({
        promptCount: 0,
        firstInstallDate: 0, // Invalid date
        lastPromptDate: 0,
        highestScorePrompted: 0,
        levelPrompts: [],
        userDeclined: false,
        ratedCurrentVersion: false
      });

      const days = await RatingPromptLogic.getDaysUntilNextPrompt();
      expect(days).toBeGreaterThanOrEqual(-1); // Should handle gracefully
    });
  });
});