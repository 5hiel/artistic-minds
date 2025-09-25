import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const HIGH_SCORE_KEY = 'giftedMinds_highScore';

/**
 * Platform-specific high score storage service
 * Uses localStorage for web and AsyncStorage for mobile platforms
 */
export class HighScoreStorage {
  /**
   * Gets the stored high score from persistent storage
   * @returns Promise<number> - The stored high score or 0 if none exists
   */
  static async getHighScore(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        // Web platform - use localStorage
        const stored = localStorage.getItem(HIGH_SCORE_KEY);
        const parsed = stored ? parseInt(stored, 10) : 0;
        return isNaN(parsed) ? 0 : parsed;
      } else {
        // Mobile platforms - use AsyncStorage
        const stored = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        const parsed = stored ? parseInt(stored, 10) : 0;
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch (error) {
      console.warn('Failed to retrieve high score from storage:', error);
      return 0;
    }
  }

  /**
   * Saves the high score to persistent storage
   * @param score - The high score to save
   */
  static async setHighScore(score: number): Promise<void> {
    try {
      const scoreString = score.toString();
      
      if (Platform.OS === 'web') {
        // Web platform - use localStorage
        localStorage.setItem(HIGH_SCORE_KEY, scoreString);
      } else {
        // Mobile platforms - use AsyncStorage
        await AsyncStorage.setItem(HIGH_SCORE_KEY, scoreString);
      }
    } catch (error) {
      console.warn('Failed to save high score to storage:', error);
    }
  }

  /**
   * Clears the stored high score (useful for testing or reset functionality)
   */
  static async clearHighScore(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web platform - use localStorage
        localStorage.removeItem(HIGH_SCORE_KEY);
      } else {
        // Mobile platforms - use AsyncStorage
        await AsyncStorage.removeItem(HIGH_SCORE_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear high score from storage:', error);
    }
  }
}