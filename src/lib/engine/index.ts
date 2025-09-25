/**
 * Simplified Adaptive Engine
 *
 * Core adaptive learning system that continuously learns and adapts
 * from user interactions to provide optimal puzzle experiences.
 *
 * Core Features:
 * - Basic puzzle characterization (Puzzle DNA)
 * - Essential user profile storage
 * - Intelligent adaptive puzzle selection
 * - Simple difficulty adaptation
 */

// Core adaptive engine components
export {
  PuzzleDNAAnalyzer,
  puzzleDNAAnalyzer,
  type PuzzleDNA,
  SkillTarget
} from './puzzleDNAAnalyzer';

export {
  BehavioralSignatureStorage,
  behavioralSignatureStorage,
  type UserProfile,
  type LearningMetrics
} from './behavioralSignatureStorage';

export {
  IntelligentPuzzleEngine,
  intelligentPuzzleEngine,
  type PuzzleRecommendation,
  type AdaptiveEngineConfig,
  type SessionContext
} from './intelligentPuzzleEngine';

// iOS/Android compatible storage (simplified)
export {
  getStorageInstance,
  getStorageInfo
} from './adaptiveStorageAdapter';

/**
 * Initialize the simplified adaptive learning system
 */
export async function initializeAdaptiveLearningSystem(): Promise<boolean> {
  try {
    console.log('🚀 Starting Simplified Adaptive Learning System...');

    // Initialize basic storage
    const { getStorageInstance } = await import('./adaptiveStorageAdapter');
    getStorageInstance();

    console.log('✅ Adaptive Learning System initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Adaptive Learning System:', error);
    return false;
  }
}

/**
 * Get basic system metrics
 */
export async function getAdaptiveSystemMetrics(): Promise<AdaptiveSystemMetrics> {
  try {
    const { behavioralSignatureStorage } = await import('./behavioralSignatureStorage');
    const userProfile = await behavioralSignatureStorage.getUserProfile();
    const storageMetrics = await behavioralSignatureStorage.getStorageMetrics();

    return {
      userMetrics: {
        totalSessions: userProfile.totalSessions,
        totalPuzzlesSolved: userProfile.totalPuzzlesSolved,
        overallAccuracy: userProfile.overallAccuracy,
        currentSkillLevel: userProfile.currentSkillLevel
      },
      systemMetrics: {
        storageSize: storageMetrics.totalSize
      }
    };
  } catch (error) {
    console.error('Failed to get adaptive system metrics:', error);
    return getDefaultSystemMetrics();
  }
}

/**
 * Reset the adaptive learning system
 */
export async function resetAdaptiveLearningSystem(): Promise<void> {
  try {
    const { behavioralSignatureStorage } = await import('./behavioralSignatureStorage');
    const { intelligentPuzzleEngine } = await import('./intelligentPuzzleEngine');

    await behavioralSignatureStorage.clearAllData();
    intelligentPuzzleEngine.reset();

    console.log('🔄 Adaptive Learning System reset successfully');
  } catch (error) {
    console.error('Failed to reset adaptive learning system:', error);
    throw error;
  }
}

// Supporting types
export interface AdaptiveSystemMetrics {
  userMetrics: {
    totalSessions: number;
    totalPuzzlesSolved: number;
    overallAccuracy: number;
    currentSkillLevel: number;
  };
  systemMetrics: {
    storageSize: number;
  };
}

function getDefaultSystemMetrics(): AdaptiveSystemMetrics {
  return {
    userMetrics: {
      totalSessions: 0,
      totalPuzzlesSolved: 0,
      overallAccuracy: 0,
      currentSkillLevel: 0.5
    },
    systemMetrics: {
      storageSize: 0
    }
  };
}