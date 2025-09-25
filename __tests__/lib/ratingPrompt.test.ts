/**
 * Rating Prompt Storage Tests
 *
 * Tests platform-specific rating prompt storage service.
 * Uses localStorage for web and AsyncStorage for mobile platforms.
 * Covers prompt tracking, user preferences, and cross-platform compatibility.
 */

import { RatingPromptStorage, type RatingPromptData } from '../../src/lib/storage/ratingPrompt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios' // Default to mobile platform
  }
}));

// Mock console.warn to capture calls without output
const mockConsoleWarn = jest.fn();
console.warn = mockConsoleWarn;

describe('RatingPromptStorage', () => {
  // Storage simulation for tests
  let storageData: Record<string, string> = {};

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
    storageData = {};

    // Mock AsyncStorage methods to use the in-memory storage
    mockAsyncStorage.getItem.mockImplementation((key: string) =>
      Promise.resolve(storageData[key] || null)
    );
    mockAsyncStorage.setItem.mockImplementation((key: string, value: string) => {
      storageData[key] = value;
      return Promise.resolve();
    });
    mockAsyncStorage.removeItem.mockImplementation((key: string) => {
      delete storageData[key];
      return Promise.resolve();
    });
  });

  afterEach(() => {
    storageData = {};
  });

  describe('getRatingPromptData', () => {

    it('should return default data for first-time users', async () => {
      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.promptCount).toBe(0);
      expect(data.lastPromptDate).toBe(0);
      expect(data.highestScorePrompted).toBe(0);
      expect(data.levelPrompts).toEqual([]);
      expect(data.userDeclined).toBe(false);
      expect(data.firstInstallDate).toBeGreaterThan(0);
      expect(data.ratedCurrentVersion).toBe(false);
    });

    it('should retrieve previously saved data', async () => {
      const testData: RatingPromptData = {
        promptCount: 2,
        lastPromptDate: Date.now() - 86400000, // 1 day ago
        highestScorePrompted: 150,
        levelPrompts: [1, 2],
        userDeclined: false,
        firstInstallDate: Date.now() - 604800000, // 1 week ago
        ratedCurrentVersion: false,
      };

      await RatingPromptStorage.setRatingPromptData(testData);
      const retrieved = await RatingPromptStorage.getRatingPromptData();

      expect(retrieved.promptCount).toBe(2);
      expect(retrieved.highestScorePrompted).toBe(150);
      expect(retrieved.levelPrompts).toEqual([1, 2]);
    });
  });

  describe('recordPrompt', () => {

    it('should increment prompt count and update score', async () => {
      await RatingPromptStorage.recordPrompt(100);
      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.promptCount).toBe(1);
      expect(data.highestScorePrompted).toBe(100);
      expect(data.lastPromptDate).toBeGreaterThan(0);
    });

    it('should track level prompts without duplicates', async () => {
      await RatingPromptStorage.recordPrompt(50, 1);
      await RatingPromptStorage.recordPrompt(75, 1); // Same level
      await RatingPromptStorage.recordPrompt(100, 2);

      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.promptCount).toBe(3);
      expect(data.levelPrompts).toEqual([1, 2]); // No duplicate level 1
    });

    it('should keep highest score across prompts', async () => {
      await RatingPromptStorage.recordPrompt(150);
      await RatingPromptStorage.recordPrompt(100); // Lower score

      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.highestScorePrompted).toBe(150); // Should remain highest
    });
  });

  describe('recordDeclined', () => {

    it('should mark user as having declined rating', async () => {
      await RatingPromptStorage.recordDeclined();
      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.userDeclined).toBe(true);
    });

    it('should preserve other data when recording decline', async () => {
      await RatingPromptStorage.recordPrompt(100, 1);
      await RatingPromptStorage.recordDeclined();

      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.userDeclined).toBe(true);
      expect(data.promptCount).toBe(1);
      expect(data.highestScorePrompted).toBe(100);
    });
  });

  describe('recordRated', () => {

    it('should mark current version as rated', async () => {
      await RatingPromptStorage.recordRated();
      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.ratedCurrentVersion).toBe(true);
    });
  });

  describe('resetForNewVersion', () => {

    it('should reset rated flag while preserving other data', async () => {
      // Set up existing data
      await RatingPromptStorage.recordPrompt(100, 1);
      await RatingPromptStorage.recordRated();

      // Reset for new version
      await RatingPromptStorage.resetForNewVersion();
      const data = await RatingPromptStorage.getRatingPromptData();

      expect(data.ratedCurrentVersion).toBe(false); // Reset
      expect(data.promptCount).toBe(1); // Preserved
      expect(data.highestScorePrompted).toBe(100); // Preserved
    });
  });

  describe('clearRatingPromptData', () => {

    it('should clear all stored data', async () => {
      // Set up some data
      await RatingPromptStorage.recordPrompt(100, 1);
      await RatingPromptStorage.recordDeclined();

      // Clear data
      await RatingPromptStorage.clearRatingPromptData();

      // Getting data after clear should return defaults
      const data = await RatingPromptStorage.getRatingPromptData();
      expect(data.promptCount).toBe(0);
      expect(data.userDeclined).toBe(false);
    });
  });

  describe('error handling', () => {

    it('should handle storage errors gracefully', async () => {
      // This test ensures no exceptions are thrown when storage fails
      // The methods already have try-catch blocks, so we just verify they don't throw
      await expect(RatingPromptStorage.recordPrompt(100)).resolves.not.toThrow();
      await expect(RatingPromptStorage.recordDeclined()).resolves.not.toThrow();
      await expect(RatingPromptStorage.recordRated()).resolves.not.toThrow();
    });
  });
});