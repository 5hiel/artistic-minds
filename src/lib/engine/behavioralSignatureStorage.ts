/**
 * Simplified Behavioral Signature Storage
 *
 * Lightweight storage for essential user data only:
 * - Basic user profile and progress
 * - Recent performance tracking
 * - Simple preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_PROFILE: 'adaptive_user_profile',
  RECENT_PERFORMANCE: 'adaptive_recent_performance'
};

export interface UserProfile {
  userId: string;
  createdAt: number;
  lastActive: number;

  // Core metrics only
  totalSessions: number;
  totalPuzzlesSolved: number;
  overallAccuracy: number;
  currentSkillLevel: number;        // 0-1, overall skill estimation
  highScore: number;
  currentLevel: number;

  // Simple adaptation data
  currentMaxDifficulty: number;     // Current difficulty ceiling
  recentPerformance: boolean[];     // Last 10 puzzle results
  preferredPuzzleTypes: string[];   // Types user enjoys most
  avgEngagementScore: number;       // Average engagement score for preference detection

  // Session tracking
  currentGameScore: number;
  powerUpInventory: number;
  lastPowerUpRefresh: number;
}

export interface LearningMetrics {
  totalPuzzlesAttempted: number;
  totalCorrectAnswers: number;
  averageSessionLength: number;
  skillProgression: number;         // How much skill has improved
  engagementScore: number;          // How engaged user appears
}

/**
 * Simplified Behavioral Signature Storage
 * Focuses on essential user data with minimal complexity
 */
export class BehavioralSignatureStorage {
  private static instance: BehavioralSignatureStorage;
  private currentProfile: UserProfile | null = null;

  static getInstance(): BehavioralSignatureStorage {
    if (!BehavioralSignatureStorage.instance) {
      BehavioralSignatureStorage.instance = new BehavioralSignatureStorage();
    }
    return BehavioralSignatureStorage.instance;
  }

  /**
   * Get user profile, creating default if none exists
   */
  async getUserProfile(): Promise<UserProfile> {
    if (this.currentProfile) {
      return this.currentProfile;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (stored) {
        this.currentProfile = JSON.parse(stored);
        return this.currentProfile!;
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }

    // Create default profile
    this.currentProfile = this.createDefaultProfile();
    await this.saveUserProfile();
    return this.currentProfile;
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const profile = await this.getUserProfile();
    Object.assign(profile, updates, { lastActive: Date.now() });
    await this.saveUserProfile();
  }

  /**
   * Record puzzle completion and update metrics
   */
  async recordPuzzleCompletion(
    puzzleId: string,
    success: boolean,
    solveTime: number,
    engagementScore: number
  ): Promise<void> {
    const profile = await this.getUserProfile();

    // Update basic stats
    profile.totalPuzzlesSolved++;
    if (success) {
      profile.overallAccuracy = (profile.overallAccuracy * (profile.totalPuzzlesSolved - 1) + 1) / profile.totalPuzzlesSolved;
    } else {
      profile.overallAccuracy = (profile.overallAccuracy * (profile.totalPuzzlesSolved - 1)) / profile.totalPuzzlesSolved;
    }

    // Update recent performance (keep last 10)
    profile.recentPerformance.push(success);
    if (profile.recentPerformance.length > 10) {
      profile.recentPerformance.shift();
    }

    // Update engagement score (rolling average)
    profile.avgEngagementScore = profile.avgEngagementScore
      ? (profile.avgEngagementScore * 0.9) + (engagementScore * 0.1) // Weight recent engagement
      : engagementScore; // First engagement score

    // Simple skill level adjustment
    const recentAccuracy = profile.recentPerformance.filter(r => r).length / profile.recentPerformance.length;
    if (recentAccuracy > 0.8 && profile.currentSkillLevel < 1.0) {
      profile.currentSkillLevel = Math.min(1.0, profile.currentSkillLevel + 0.05);
    } else if (recentAccuracy < 0.4 && profile.currentSkillLevel > 0.1) {
      profile.currentSkillLevel = Math.max(0.1, profile.currentSkillLevel - 0.03);
    }

    // Adjust difficulty ceiling based on skill level
    profile.currentMaxDifficulty = Math.min(0.9, profile.currentSkillLevel + 0.2);

    await this.saveUserProfile();
  }

  /**
   * Start new session
   */
  async startSession(): Promise<string> {
    const profile = await this.getUserProfile();
    profile.totalSessions++;
    await this.saveUserProfile();

    return `session_${Date.now()}`;
  }

  /**
   * Update puzzle type preferences based on usage
   */
  async updatePuzzleTypePreference(puzzleType: string, liked: boolean): Promise<void> {
    const profile = await this.getUserProfile();

    if (liked && !profile.preferredPuzzleTypes.includes(puzzleType)) {
      profile.preferredPuzzleTypes.push(puzzleType);
      // Keep max 5 preferred types
      if (profile.preferredPuzzleTypes.length > 5) {
        profile.preferredPuzzleTypes.shift();
      }
    } else if (!liked) {
      profile.preferredPuzzleTypes = profile.preferredPuzzleTypes.filter(t => t !== puzzleType);
    }

    await this.saveUserProfile();
  }

  /**
   * Get simple learning metrics
   */
  async getLearningMetrics(): Promise<LearningMetrics> {
    const profile = await this.getUserProfile();

    return {
      totalPuzzlesAttempted: profile.totalPuzzlesSolved,
      totalCorrectAnswers: Math.round(profile.totalPuzzlesSolved * profile.overallAccuracy),
      averageSessionLength: profile.totalPuzzlesSolved / Math.max(1, profile.totalSessions),
      skillProgression: profile.currentSkillLevel,
      engagementScore: this.calculateEngagementScore(profile)
    };
  }

  /**
   * Reset all user data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_PERFORMANCE);
      this.currentProfile = null;
    } catch (error) {
      console.warn('Failed to clear user data:', error);
    }
  }

  /**
   * Get storage metrics for debugging
   */
  async getStorageMetrics(): Promise<{ totalSize: number; compressionRatio: number }> {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const performance = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_PERFORMANCE);

      const totalSize = (profile?.length || 0) + (performance?.length || 0);
      return {
        totalSize,
        compressionRatio: 1.0 // No compression in simplified version
      };
    } catch {
      return { totalSize: 0, compressionRatio: 1.0 };
    }
  }

  /**
   * Store interaction session data (simplified)
   */
  async storeInteractionSession(data: {
    puzzleId: string;
    success: boolean;
    solveTime: number;
    engagementScore?: number;
  }): Promise<void> {
    // In simplified version, just record the completion
    await this.recordPuzzleCompletion(
      data.puzzleId,
      data.success,
      data.solveTime,
      data.engagementScore || 0.7
    );
  }

  // Private helper methods

  private createDefaultProfile(): UserProfile {
    return {
      userId: `user_${Date.now()}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
      totalSessions: 0,
      totalPuzzlesSolved: 0,
      overallAccuracy: 0.6,
      currentSkillLevel: 0.5,
      highScore: 0,
      currentLevel: 0,
      currentMaxDifficulty: 0.7,
      recentPerformance: [],
      preferredPuzzleTypes: [],
      avgEngagementScore: 0.7, // Default neutral engagement
      currentGameScore: 0,
      powerUpInventory: 3,
      lastPowerUpRefresh: Date.now()
    };
  }

  private async saveUserProfile(): Promise<void> {
    if (!this.currentProfile) return;

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(this.currentProfile)
      );
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }

  private calculateEngagementScore(profile: UserProfile): number {
    // Simple engagement calculation
    const accuracyFactor = profile.overallAccuracy;
    const progressFactor = profile.currentSkillLevel;
    const activityFactor = Math.min(1.0, profile.totalSessions / 10);

    return (accuracyFactor + progressFactor + activityFactor) / 3;
  }
}

// Export singleton instance
export const behavioralSignatureStorage = BehavioralSignatureStorage.getInstance();