/**
 * Testing Storage Utility
 * Handles persistent storage for sequential chunk testing with user profile continuity
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration interfaces
export interface SessionConfig {
  sessionId: string;
  persona: string;
  totalChunks: number;
  puzzlesPerChunk: number;
  totalPuzzlesTarget: number;
  startTime: string;
  lastChunkCompleted: number;
  chunksRemaining: number;
  currentUserProfileSnapshot?: any;
  estimatedTimeRemaining?: string;
  preset?: string;
  autoChunkSize?: boolean;
}

export interface ChunkResult {
  chunkNumber: number;
  puzzleCount: number;
  chunkAccuracy: number;
  puzzleResults: {
    puzzleIndex: number;
    puzzleType: string;
    difficulty: string;
    success: boolean;
  }[];
  userProfileSnapshot: any;
  processingTime: number;
  timestamp: string;
  typeDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  adaptationPoints?: number[] | number; // For persona testing compatibility
}

export interface SessionProgress {
  sessionConfig: SessionConfig;
  completedChunks: number;
  totalPuzzlesCompleted: number;
  overallAccuracy: number;
  estimatedTimeRemaining: string;
  nextChunkNumber: number;
  canResume: boolean;
}

export interface AggregatedResults {
  sessionConfig: SessionConfig;
  chunkResults: ChunkResult[];
  overallStats: {
    totalAccuracy: number;
    learningProgression: number;
    aggregatedTypeStats: {
      puzzleType: string;
      totalCount: number;
      successCount: number;
      successRate: number;
      percentageOfTotal: number;
    }[];
    aggregatedDifficultyStats: {
      difficulty: string;
      totalCount: number;
      successCount: number;
      successRate: number;
      percentageOfTotal: number;
    }[];
    chunkAccuracies: number[];
  };
  learningAnalysis: {
    convergenceDetected: boolean;
    optimalChunkCount?: number;
    stabilizationPoint?: number;
    learningVelocity: number;
  };
}

export class TestingStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = '/tmp/test-sessions';
    this.ensureBaseDirectory();
  }

  private ensureBaseDirectory(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getSessionDir(sessionId: string): string {
    const sessionDir = path.join(this.baseDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    return sessionDir;
  }

  // Session Configuration Management
  async saveSessionConfig(config: SessionConfig): Promise<void> {
    const sessionDir = this.getSessionDir(config.sessionId);
    const configPath = path.join(sessionDir, 'session-config.json');

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  async loadSessionConfig(sessionId: string): Promise<SessionConfig | null> {
    try {
      const sessionDir = this.getSessionDir(sessionId);
      const configPath = path.join(sessionDir, 'session-config.json');

      if (!fs.existsSync(configPath)) {
        return null;
      }

      const configData = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      console.error(`Error loading session config for ${sessionId}:`, error);
      return null;
    }
  }

  // User Profile Persistence
  async saveUserProfile(sessionId: string, userProfile: any): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    const profilePath = path.join(sessionDir, 'user-profile.json');

    fs.writeFileSync(profilePath, JSON.stringify(userProfile, null, 2));
  }

  async loadUserProfile(sessionId: string): Promise<any | null> {
    try {
      const sessionDir = this.getSessionDir(sessionId);
      const profilePath = path.join(sessionDir, 'user-profile.json');

      if (!fs.existsSync(profilePath)) {
        return null;
      }

      const profileData = fs.readFileSync(profilePath, 'utf-8');
      return JSON.parse(profileData);
    } catch (error) {
      console.error(`Error loading user profile for ${sessionId}:`, error);
      return null;
    }
  }

  // Chunk Results Management
  async saveChunkResult(sessionId: string, chunkResult: ChunkResult): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    const chunkPath = path.join(sessionDir, `chunk-${chunkResult.chunkNumber}-results.json`);

    fs.writeFileSync(chunkPath, JSON.stringify(chunkResult, null, 2));

    // Update session config with latest chunk completion
    const config = await this.loadSessionConfig(sessionId);
    if (config) {
      config.lastChunkCompleted = chunkResult.chunkNumber;
      config.chunksRemaining = config.totalChunks - chunkResult.chunkNumber;
      config.currentUserProfileSnapshot = chunkResult.userProfileSnapshot;
      await this.saveSessionConfig(config);
    }
  }

  async loadChunkResult(sessionId: string, chunkNumber: number): Promise<ChunkResult | null> {
    try {
      const sessionDir = this.getSessionDir(sessionId);
      const chunkPath = path.join(sessionDir, `chunk-${chunkNumber}-results.json`);

      if (!fs.existsSync(chunkPath)) {
        return null;
      }

      const chunkData = fs.readFileSync(chunkPath, 'utf-8');
      return JSON.parse(chunkData);
    } catch (error) {
      console.error(`Error loading chunk ${chunkNumber} for ${sessionId}:`, error);
      return null;
    }
  }

  async loadAllChunkResults(sessionId: string): Promise<ChunkResult[]> {
    const sessionDir = this.getSessionDir(sessionId);
    const chunkFiles = fs.readdirSync(sessionDir)
      .filter(file => file.startsWith('chunk-') && file.endsWith('-results.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/chunk-(\d+)-results\.json/)?.[1] || '0');
        const bNum = parseInt(b.match(/chunk-(\d+)-results\.json/)?.[1] || '0');
        return aNum - bNum;
      });

    const results: ChunkResult[] = [];
    for (const file of chunkFiles) {
      try {
        const filePath = path.join(sessionDir, file);
        const chunkData = fs.readFileSync(filePath, 'utf-8');
        results.push(JSON.parse(chunkData));
      } catch (error) {
        console.error(`Error loading chunk file ${file}:`, error);
      }
    }

    return results;
  }

  // Session Progress & Status
  async getSessionProgress(sessionId: string): Promise<SessionProgress | null> {
    const config = await this.loadSessionConfig(sessionId);
    if (!config) {
      return null;
    }

    const chunkResults = await this.loadAllChunkResults(sessionId);
    const completedChunks = chunkResults.length;
    const totalPuzzlesCompleted = chunkResults.reduce((sum, chunk) => sum + chunk.puzzleCount, 0);
    const totalCorrect = chunkResults.reduce((sum, chunk) =>
      sum + chunk.puzzleResults.filter(p => p.success).length, 0);

    const overallAccuracy = totalPuzzlesCompleted > 0 ? totalCorrect / totalPuzzlesCompleted : 0;
    const nextChunkNumber = config.lastChunkCompleted + 1;

    // Estimate time remaining based on average chunk time
    const avgChunkTime = chunkResults.length > 0
      ? chunkResults.reduce((sum, chunk) => sum + chunk.processingTime, 0) / chunkResults.length
      : 0.5; // Default estimate
    const remainingChunks = config.totalChunks - completedChunks;
    const estimatedSeconds = remainingChunks * avgChunkTime;
    const estimatedTimeRemaining = `${Math.ceil(estimatedSeconds / 60)} minutes`;

    return {
      sessionConfig: config,
      completedChunks,
      totalPuzzlesCompleted,
      overallAccuracy,
      estimatedTimeRemaining,
      nextChunkNumber,
      canResume: nextChunkNumber <= config.totalChunks
    };
  }

  // Aggregated Results & Analysis
  async generateAggregatedResults(sessionId: string): Promise<AggregatedResults | null> {
    const config = await this.loadSessionConfig(sessionId);
    const chunkResults = await this.loadAllChunkResults(sessionId);

    if (!config || chunkResults.length === 0) {
      return null;
    }

    // Calculate overall statistics
    const allPuzzleResults = chunkResults.flatMap(chunk => chunk.puzzleResults);
    const totalCorrect = allPuzzleResults.filter(p => p.success).length;
    const totalAccuracy = allPuzzleResults.length > 0 ? totalCorrect / allPuzzleResults.length : 0;

    // Learning progression (first chunk vs last chunk accuracy)
    const firstChunkAccuracy = chunkResults[0]?.chunkAccuracy || 0;
    const lastChunkAccuracy = chunkResults[chunkResults.length - 1]?.chunkAccuracy || 0;
    const learningProgression = lastChunkAccuracy - firstChunkAccuracy;

    // Aggregate type statistics
    const typeStatsMap = new Map<string, { total: number; success: number }>();
    const difficultyStatsMap = new Map<string, { total: number; success: number }>();

    allPuzzleResults.forEach(puzzle => {
      // Type stats
      if (!typeStatsMap.has(puzzle.puzzleType)) {
        typeStatsMap.set(puzzle.puzzleType, { total: 0, success: 0 });
      }
      const typeStats = typeStatsMap.get(puzzle.puzzleType)!;
      typeStats.total++;
      if (puzzle.success) typeStats.success++;

      // Difficulty stats
      if (!difficultyStatsMap.has(puzzle.difficulty)) {
        difficultyStatsMap.set(puzzle.difficulty, { total: 0, success: 0 });
      }
      const diffStats = difficultyStatsMap.get(puzzle.difficulty)!;
      diffStats.total++;
      if (puzzle.success) diffStats.success++;
    });

    const aggregatedTypeStats = Array.from(typeStatsMap.entries()).map(([type, stats]) => ({
      puzzleType: type,
      totalCount: stats.total,
      successCount: stats.success,
      successRate: stats.total > 0 ? stats.success / stats.total : 0,
      percentageOfTotal: (stats.total / allPuzzleResults.length * 100)
    })).sort((a, b) => b.totalCount - a.totalCount);

    const aggregatedDifficultyStats = Array.from(difficultyStatsMap.entries()).map(([difficulty, stats]) => ({
      difficulty: difficulty,
      totalCount: stats.total,
      successCount: stats.success,
      successRate: stats.total > 0 ? stats.success / stats.total : 0,
      percentageOfTotal: (stats.total / allPuzzleResults.length * 100)
    })).sort((a, b) => b.totalCount - a.totalCount);

    // Learning analysis
    const chunkAccuracies = chunkResults.map(chunk => chunk.chunkAccuracy);
    const learningVelocity = this.calculateLearningVelocity(chunkAccuracies);
    const convergenceDetected = this.detectConvergence(chunkAccuracies);
    const stabilizationPoint = this.findStabilizationPoint(chunkAccuracies);

    const aggregatedResults: AggregatedResults = {
      sessionConfig: config,
      chunkResults,
      overallStats: {
        totalAccuracy,
        learningProgression,
        aggregatedTypeStats,
        aggregatedDifficultyStats,
        chunkAccuracies
      },
      learningAnalysis: {
        convergenceDetected,
        stabilizationPoint,
        learningVelocity,
        optimalChunkCount: convergenceDetected ? stabilizationPoint : undefined
      }
    };

    // Save aggregated results
    const sessionDir = this.getSessionDir(sessionId);
    const aggregatedPath = path.join(sessionDir, 'aggregated-results.json');
    fs.writeFileSync(aggregatedPath, JSON.stringify(aggregatedResults, null, 2));

    return aggregatedResults;
  }

  // Learning Analysis Utilities
  private calculateLearningVelocity(accuracies: number[]): number {
    if (accuracies.length < 3) return 0;

    let totalChange = 0;
    for (let i = 1; i < accuracies.length; i++) {
      totalChange += (accuracies[i] - accuracies[i - 1]);
    }
    return totalChange / (accuracies.length - 1);
  }

  private detectConvergence(accuracies: number[], threshold: number = 0.02): boolean {
    if (accuracies.length < 5) return false;

    const lastFive = accuracies.slice(-5);
    const variance = this.calculateVariance(lastFive);
    return variance < threshold;
  }

  private findStabilizationPoint(accuracies: number[]): number | undefined {
    if (accuracies.length < 5) return undefined;

    for (let i = 4; i < accuracies.length; i++) {
      const window = accuracies.slice(i - 4, i + 1);
      if (this.calculateVariance(window) < 0.02) {
        return i - 4 + 1; // Return 1-indexed chunk number
      }
    }
    return undefined;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // Session Management
  async sessionExists(sessionId: string): Promise<boolean> {
    const config = await this.loadSessionConfig(sessionId);
    return config !== null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  }

  async listSessions(): Promise<string[]> {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }

    return fs.readdirSync(this.baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  }

  // Cleanup utilities
  async cleanupOldSessions(olderThanDays: number = 7): Promise<number> {
    const sessions = await this.listSessions();
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const sessionId of sessions) {
      const config = await this.loadSessionConfig(sessionId);
      if (config && new Date(config.startTime).getTime() < cutoffTime) {
        await this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Export singleton instance
export const testingStorage = new TestingStorage();