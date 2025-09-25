import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const RATING_PROMPT_KEY = 'giftedMinds_ratingPrompt';

/**
 * Interface for rating prompt data structure
 */
export interface RatingPromptData {
  promptCount: number;          // Total prompts shown (max 5/year)
  lastPromptDate: number;       // Timestamp of last prompt
  highestScorePrompted: number; // Highest score when last prompted
  levelPrompts: number[];       // Levels where prompts were shown
  userDeclined: boolean;        // User explicitly declined rating
  firstInstallDate: number;     // App first install date
  ratedCurrentVersion: boolean; // User already rated this version
}

/**
 * Default rating prompt data structure
 */
const defaultRatingPromptData: RatingPromptData = {
  promptCount: 0,
  lastPromptDate: 0,
  highestScorePrompted: 0,
  levelPrompts: [],
  userDeclined: false,
  firstInstallDate: Date.now(),
  ratedCurrentVersion: false,
};

/**
 * Platform-specific rating prompt storage service
 * Uses localStorage for web and AsyncStorage for mobile platforms
 * Follows the same pattern as HighScoreStorage
 */
export class RatingPromptStorage {
  /**
   * Gets the stored rating prompt data from persistent storage
   * @returns Promise<RatingPromptData> - The stored data or default if none exists
   */
  static async getRatingPromptData(): Promise<RatingPromptData> {
    try {
      let stored: string | null = null;

      if (Platform.OS === 'web') {
        // Web platform - use localStorage
        stored = localStorage.getItem(RATING_PROMPT_KEY);
      } else {
        // Mobile platforms - use AsyncStorage
        stored = await AsyncStorage.getItem(RATING_PROMPT_KEY);
      }

      if (!stored) {
        // First time - set install date and return defaults
        const data = { ...defaultRatingPromptData };
        await this.setRatingPromptData(data);
        return data;
      }

      const parsed = JSON.parse(stored) as RatingPromptData;

      // Ensure all fields exist (for backward compatibility)
      return {
        ...defaultRatingPromptData,
        ...parsed,
      };
    } catch (error) {
      console.warn('Failed to retrieve rating prompt data from storage:', error);
      return { ...defaultRatingPromptData };
    }
  }

  /**
   * Saves the rating prompt data to persistent storage
   * @param data - The rating prompt data to save
   */
  static async setRatingPromptData(data: RatingPromptData): Promise<void> {
    try {
      const dataString = JSON.stringify(data);
      
      if (Platform.OS === 'web') {
        // Web platform - use localStorage
        localStorage.setItem(RATING_PROMPT_KEY, dataString);
      } else {
        // Mobile platforms - use AsyncStorage
        await AsyncStorage.setItem(RATING_PROMPT_KEY, dataString);
      }
    } catch (error) {
      console.warn('Failed to save rating prompt data to storage:', error);
    }
  }

  /**
   * Records a rating prompt event
   * @param score - Current score when prompted
   * @param level - Current level when prompted (optional)
   */
  static async recordPrompt(score: number, level?: number): Promise<void> {
    try {
      const data = await this.getRatingPromptData();
      
      const updatedData: RatingPromptData = {
        ...data,
        promptCount: data.promptCount + 1,
        lastPromptDate: Date.now(),
        highestScorePrompted: Math.max(data.highestScorePrompted, score),
        levelPrompts: level !== undefined && !data.levelPrompts.includes(level) 
          ? [...data.levelPrompts, level] 
          : data.levelPrompts,
      };

      await this.setRatingPromptData(updatedData);
    } catch (error) {
      console.warn('Failed to record rating prompt:', error);
    }
  }

  /**
   * Records that user declined to rate
   */
  static async recordDeclined(): Promise<void> {
    try {
      const data = await this.getRatingPromptData();
      await this.setRatingPromptData({
        ...data,
        userDeclined: true,
      });
    } catch (error) {
      console.warn('Failed to record rating decline:', error);
    }
  }

  /**
   * Records that user rated the current app version
   */
  static async recordRated(): Promise<void> {
    try {
      const data = await this.getRatingPromptData();
      await this.setRatingPromptData({
        ...data,
        ratedCurrentVersion: true,
      });
    } catch (error) {
      console.warn('Failed to record rating completion:', error);
    }
  }

  /**
   * Resets rating prompt data for new app version
   * Called when app version changes
   */
  static async resetForNewVersion(): Promise<void> {
    try {
      const data = await this.getRatingPromptData();
      await this.setRatingPromptData({
        ...data,
        ratedCurrentVersion: false,
        // Keep other data but allow rating prompts again
      });
    } catch (error) {
      console.warn('Failed to reset rating data for new version:', error);
    }
  }

  /**
   * Clears all rating prompt data (useful for testing or reset functionality)
   */
  static async clearRatingPromptData(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web platform - use localStorage
        localStorage.removeItem(RATING_PROMPT_KEY);
      } else {
        // Mobile platforms - use AsyncStorage
        await AsyncStorage.removeItem(RATING_PROMPT_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear rating prompt data from storage:', error);
    }
  }
}