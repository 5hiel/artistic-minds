/**
 * Viral Message Service Tests
 *
 * Tests for viral message generation with contextual messages based on:
 * - Score achieved
 * - Player level (Seeker, Learner, Thinker, Creator, Visionary)
 * - Achievement type (milestone, high score beat)
 * - Personality variants (humble, competitive, casual)
 */

import { generateViralMessage, getShareAnalytics, type ViralMessageContext } from '../../src/lib/services/viralMessage';

describe('ViralMessage Service', () => {

  describe('generateViralMessage', () => {

    it('should generate milestone messages for score >= 50', () => {
      const context: ViralMessageContext = {
        score: 50,
        levelIndex: 0, // Seeker
        isHighScoreBeat: false
      };

      const message = generateViralMessage(context);

      expect(message.text).toContain('50');
      expect(message.text).toContain('Seeker');
      expect(message.text).toContain('https://apps.apple.com/us/app/gifted-minds/id6751567047');
      expect(message.hashtags).toContain('#GiftedMinds');
      expect(message.hashtags).toContain('#BrainTraining');
    });

    it('should generate milestone messages for score >= 100', () => {
      const context: ViralMessageContext = {
        score: 100,
        levelIndex: 1, // Learner
        isHighScoreBeat: true
      };

      const message = generateViralMessage(context);

      expect(message.text).toContain('100');
      expect(message.text).toContain('Learner');
      expect(message.text).toContain('🏆 New Personal Best!');
      expect(message.hashtags).toContain('#TripleDigits');
    });

    it('should generate milestone messages for score >= 500', () => {
      const context: ViralMessageContext = {
        score: 500,
        levelIndex: 2, // Thinker
        isHighScoreBeat: true
      };

      const message = generateViralMessage(context);

      expect(message.text).toContain('500');
      expect(message.text).toContain('Thinker');
      expect(message.hashtags).toContain('#BrainMarathon');
    });

    it('should generate milestone messages for score >= 1000', () => {
      const context: ViralMessageContext = {
        score: 1000,
        levelIndex: 4, // Visionary
        isHighScoreBeat: true
      };

      const message = generateViralMessage(context);

      expect(message.text).toContain('1000');
      expect(message.text).toContain('Visionary');
      expect(message.hashtags).toContain('#ThousandClub');
    });

    it('should include level-based achievement status', () => {
      const highScoreContext: ViralMessageContext = {
        score: 25,
        levelIndex: 0,
        isHighScoreBeat: true
      };

      const message = generateViralMessage(highScoreContext);

      expect(message.text).toContain('🏆 New Personal Best!');
    });

    it('should include challenge prompt when no high score', () => {
      const regularContext: ViralMessageContext = {
        score: 25,
        levelIndex: 0,
        isHighScoreBeat: false
      };

      const message = generateViralMessage(regularContext);

      expect(message.text).toContain('💪 Challenge yourself!');
    });

    it('should always include app store link', () => {
      const context: ViralMessageContext = {
        score: 25,
        levelIndex: 0,
        isHighScoreBeat: false
      };

      const message = generateViralMessage(context);

      expect(message.appStoreLink).toBe('https://apps.apple.com/us/app/gifted-minds/id6751567047');
    });

    it('should handle different level names', () => {
      const levels = ['Seeker', 'Learner', 'Thinker', 'Creator', 'Visionary'];

      levels.forEach((levelName, index) => {
        const context: ViralMessageContext = {
          score: 50,
          levelIndex: index,
          isHighScoreBeat: false
        };

        const message = generateViralMessage(context);
        expect(message.text).toContain(levelName);
      });
    });
  });

  describe('getShareAnalytics', () => {

    it('should return analytics object with timestamp', () => {
      const analytics = getShareAnalytics();

      expect(analytics).toHaveProperty('timestamp');
      expect(typeof analytics.timestamp).toBe('number');
      expect(analytics.timestamp).toBeGreaterThan(0);
    });

    it('should include platform and category info', () => {
      const analytics = getShareAnalytics();

      expect(analytics.platform).toBe('unknown');
      expect(analytics.messageCategory).toBe('viral_share');
      expect(analytics.version).toBe('1.0');
    });
  });
});