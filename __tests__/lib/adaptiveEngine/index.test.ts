/**
 * Tests for Simplified Adaptive Engine Index Module
 */

import {
  // Core exports
  PuzzleDNAAnalyzer,
  puzzleDNAAnalyzer,
  BehavioralSignatureStorage,
  behavioralSignatureStorage,
  IntelligentPuzzleEngine,
  intelligentPuzzleEngine,
  initializeAdaptiveLearningSystem,
  type AdaptiveSystemMetrics,
  type PuzzleDNA,
  SkillTarget,
  type UserProfile,
  type LearningMetrics,
  type PuzzleRecommendation,
  type AdaptiveEngineConfig,
  type SessionContext
} from '@/src/lib/engine';

describe('Simplified Adaptive Engine Index Module', () => {

  describe('Core Exports', () => {
    it('should export PuzzleDNAAnalyzer components', () => {
      expect(PuzzleDNAAnalyzer).toBeDefined();
      expect(puzzleDNAAnalyzer).toBeDefined();
      expect(SkillTarget).toBeDefined();
    });

    it('should export BehavioralSignatureStorage components', () => {
      expect(BehavioralSignatureStorage).toBeDefined();
      expect(behavioralSignatureStorage).toBeDefined();
    });

    it('should export IntelligentPuzzleEngine components', () => {
      expect(IntelligentPuzzleEngine).toBeDefined();
      expect(intelligentPuzzleEngine).toBeDefined();
    });

    it('should export system functions', () => {
      expect(initializeAdaptiveLearningSystem).toBeDefined();
      expect(typeof initializeAdaptiveLearningSystem).toBe('function');
    });
  });

  describe('initializeAdaptiveLearningSystem', () => {
    it('should initialize successfully and return true', async () => {
      const result = await initializeAdaptiveLearningSystem();
      expect(result).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should ensure AdaptiveSystemMetrics interface compliance', () => {
      const metrics: AdaptiveSystemMetrics = {
        userMetrics: {
          totalSessions: 10,
          totalPuzzlesSolved: 50,
          overallAccuracy: 0.8,
          currentSkillLevel: 0.7
        },
        systemMetrics: {
          storageSize: 1024
        }
      };

      expect(metrics.userMetrics.totalSessions).toBe(10);
      expect(metrics.systemMetrics.storageSize).toBe(1024);
    });
  });
});