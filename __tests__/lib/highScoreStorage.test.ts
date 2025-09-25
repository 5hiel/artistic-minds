import { HighScoreStorage } from '../../src/lib/storage/highScore';
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

describe('HighScoreStorage', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
  });

  describe('Mobile Platform (AsyncStorage)', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    describe('getHighScore', () => {
      it('should return stored high score', async () => {
        mockAsyncStorage.getItem.mockResolvedValue('150');
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('giftedMinds_highScore');
        expect(score).toBe(150);
      });

      it('should return 0 when no score is stored', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(0);
      });

      it('should return 0 when stored value is invalid', async () => {
        mockAsyncStorage.getItem.mockResolvedValue('invalid');
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(0); // parseInt('invalid') returns NaN, which becomes 0
      });

      it('should handle AsyncStorage errors gracefully', async () => {
        mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(0);
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to retrieve high score from storage:',
          expect.any(Error)
        );
      });

      it('should parse string numbers correctly', async () => {
        mockAsyncStorage.getItem.mockResolvedValue('999');
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(999);
      });

      it('should handle edge case scores', async () => {
        mockAsyncStorage.getItem.mockResolvedValue('0');
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(0);
      });
    });

    describe('setHighScore', () => {
      it('should store high score correctly', async () => {
        await HighScoreStorage.setHighScore(250);
        
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'giftedMinds_highScore',
          '250'
        );
      });

      it('should handle zero score', async () => {
        await HighScoreStorage.setHighScore(0);
        
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'giftedMinds_highScore',
          '0'
        );
      });

      it('should handle large scores', async () => {
        await HighScoreStorage.setHighScore(999999);
        
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'giftedMinds_highScore',
          '999999'
        );
      });

      it('should handle negative scores', async () => {
        await HighScoreStorage.setHighScore(-100);
        
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'giftedMinds_highScore',
          '-100'
        );
      });

      it('should handle AsyncStorage errors gracefully', async () => {
        mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
        
        await HighScoreStorage.setHighScore(123);
        
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to save high score to storage:',
          expect.any(Error)
        );
      });
    });

    describe('clearHighScore', () => {
      it('should remove high score from storage', async () => {
        await HighScoreStorage.clearHighScore();
        
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('giftedMinds_highScore');
      });

      it('should handle AsyncStorage errors gracefully', async () => {
        mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));
        
        await HighScoreStorage.clearHighScore();
        
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to clear high score from storage:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Web Platform (localStorage)', () => {
    let mockLocalStorage: any;

    beforeEach(() => {
      (Platform as any).OS = 'web';
      
      // Mock localStorage
      mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      
      // Make localStorage available globally
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
    });

    describe('getHighScore', () => {
      it('should return stored high score from localStorage', async () => {
        mockLocalStorage.getItem.mockReturnValue('300');
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('giftedMinds_highScore');
        expect(score).toBe(300);
      });

      it('should return 0 when no score is stored in localStorage', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(0);
      });

      it('should handle localStorage errors gracefully', async () => {
        mockLocalStorage.getItem.mockImplementation(() => {
          throw new Error('localStorage error');
        });
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(0);
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to retrieve high score from storage:',
          expect.any(Error)
        );
      });

      it('should parse localStorage string values correctly', async () => {
        mockLocalStorage.getItem.mockReturnValue('777');
        
        const score = await HighScoreStorage.getHighScore();
        
        expect(score).toBe(777);
      });
    });

    describe('setHighScore', () => {
      it('should store high score in localStorage', async () => {
        await HighScoreStorage.setHighScore(450);
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'giftedMinds_highScore',
          '450'
        );
      });

      it('should handle localStorage setItem errors gracefully', async () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('localStorage setItem error');
        });
        
        await HighScoreStorage.setHighScore(555);
        
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to save high score to storage:',
          expect.any(Error)
        );
      });

      it('should convert numbers to strings for localStorage', async () => {
        await HighScoreStorage.setHighScore(42);
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'giftedMinds_highScore',
          '42'
        );
      });
    });

    describe('clearHighScore', () => {
      it('should remove high score from localStorage', async () => {
        await HighScoreStorage.clearHighScore();
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('giftedMinds_highScore');
      });

      it('should handle localStorage removeItem errors gracefully', async () => {
        mockLocalStorage.removeItem.mockImplementation(() => {
          throw new Error('localStorage removeItem error');
        });
        
        await HighScoreStorage.clearHighScore();
        
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to clear high score from storage:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Cross-platform behavior', () => {
    it('should use different storage mechanisms based on platform', async () => {
      // Test mobile
      (Platform as any).OS = 'android';
      mockAsyncStorage.getItem.mockResolvedValue('100');
      
      let score = await HighScoreStorage.getHighScore();
      expect(mockAsyncStorage.getItem).toHaveBeenCalled();
      expect(score).toBe(100);
      
      // Test web
      (Platform as any).OS = 'web';
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('200'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
      
      score = await HighScoreStorage.getHighScore();
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      expect(score).toBe(200);
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should handle complete set-get-clear cycle', async () => {
      // Set a score
      await HighScoreStorage.setHighScore(500);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('giftedMinds_highScore', '500');
      
      // Get the score
      mockAsyncStorage.getItem.mockResolvedValue('500');
      const retrievedScore = await HighScoreStorage.getHighScore();
      expect(retrievedScore).toBe(500);
      
      // Clear the score
      await HighScoreStorage.clearHighScore();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('giftedMinds_highScore');
      
      // Verify it's cleared
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const clearedScore = await HighScoreStorage.getHighScore();
      expect(clearedScore).toBe(0);
    });

    it('should handle score updates', async () => {
      // Set initial score
      await HighScoreStorage.setHighScore(100);
      
      // Update to higher score
      await HighScoreStorage.setHighScore(250);
      expect(mockAsyncStorage.setItem).toHaveBeenLastCalledWith('giftedMinds_highScore', '250');
      
      // Update to lower score (still should work)
      await HighScoreStorage.setHighScore(50);
      expect(mockAsyncStorage.setItem).toHaveBeenLastCalledWith('giftedMinds_highScore', '50');
    });
  });
});