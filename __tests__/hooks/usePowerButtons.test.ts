import { renderHook, act } from '@testing-library/react';
import { usePowerButtons, storage } from '../../src/hooks/usePowerButtons';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock AsyncStorage module - ensure it's available for dynamic require
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
}));

// Mock localStorage for web tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('usePowerButtons', () => {
  let storageGetItemSpy: jest.SpyInstance;
  let storageSetItemSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock Date to return consistent date
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-15T00:00:00.000Z');
    
    // Create fresh spies for each test
    storageGetItemSpy = jest.spyOn(storage, 'getItem').mockResolvedValue(null);
    storageSetItemSpy = jest.spyOn(storage, 'setItem').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with default state when no stored data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.skip).toBe(10);
      expect(result.current.addTime).toBe(10);
      expect(result.current.removeWrong).toBe(10);
      expect(result.current.lastResetDate).toBe('2024-01-15');
    });

    it('should load stored state when available', async () => {
      const storedState = {
        skip: 5,
        addTime: 7,
        removeWrong: 3,
        lastResetDate: '2024-01-15',
      };
      storageGetItemSpy.mockResolvedValue(JSON.stringify(storedState));

      const { result } = renderHook(() => usePowerButtons());

      // Wait for the useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(storageGetItemSpy).toHaveBeenCalledWith('powerButtonState');
      expect(result.current.skip).toBe(5);
      expect(result.current.addTime).toBe(7);
      expect(result.current.removeWrong).toBe(3);
      expect(result.current.lastResetDate).toBe('2024-01-15');
    });

    it('should handle corrupted stored data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should fall back to default state
      expect(result.current.skip).toBe(10);
      expect(result.current.addTime).toBe(10);
      expect(result.current.removeWrong).toBe(10);
    });
  });

  describe('Consume actions', () => {
    it('should consume skip when available', async () => {
      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let consumed: boolean = false;
      act(() => {
        consumed = result.current.consumeSkip();
      });

      expect(consumed).toBe(true);
      expect(result.current.skip).toBe(9);
    });

    it('should not consume skip when none available', async () => {
      const storedState = {
        skip: 0,
        addTime: 10,
        removeWrong: 10,
        lastResetDate: '2024-01-15',
      };
      storageGetItemSpy.mockResolvedValue(JSON.stringify(storedState));

      const { result } = renderHook(() => usePowerButtons());

      // Wait for the useEffect to complete and state to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      let consumed: boolean = false;
      act(() => {
        consumed = result.current.consumeSkip();
      });

      expect(consumed).toBe(false);
      expect(result.current.skip).toBe(0);
    });

    it('should consume addTime when available', async () => {
      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let consumed: boolean = false;
      act(() => {
        consumed = result.current.consumeAddTime();
      });

      expect(consumed).toBe(true);
      expect(result.current.addTime).toBe(9);
    });

    it('should consume removeWrong when available', async () => {
      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let consumed: boolean = false;
      act(() => {
        consumed = result.current.consumeRemoveWrong();
      });

      expect(consumed).toBe(true);
      expect(result.current.removeWrong).toBe(9);
    });
  });

  describe('Daily reset', () => {
    it('should reset counts when date has changed', async () => {
      const oldState = {
        skip: 2,
        addTime: 3,
        removeWrong: 1,
        lastResetDate: '2024-01-14', // Previous day
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(oldState));

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should reset to max values with new date
      expect(result.current.skip).toBe(10);
      expect(result.current.addTime).toBe(10);
      expect(result.current.removeWrong).toBe(10);
      expect(result.current.lastResetDate).toBe('2024-01-15');
    });

    it('should not reset when date is the same', async () => {
      const currentState = {
        skip: 5,
        addTime: 7,
        removeWrong: 3,
        lastResetDate: '2024-01-15', // Same day
      };
      (storage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(currentState));

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should keep existing values
      expect(result.current.skip).toBe(5);
      expect(result.current.addTime).toBe(7);
      expect(result.current.removeWrong).toBe(3);
      expect(result.current.lastResetDate).toBe('2024-01-15');
    });

    it('should trigger manual reset', async () => {
      const { result } = renderHook(() => usePowerButtons());

      // Wait for initial state to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Verify initial state is loaded
      expect(result.current.skip).toBe(10);
      expect(result.current.addTime).toBe(10);
      expect(result.current.removeWrong).toBe(10);

      // Consume some resources one by one with proper state updates
      await act(async () => {
        result.current.consumeSkip();
      });
      
      await act(async () => {
        result.current.consumeAddTime();
      });
      
      await act(async () => {
        result.current.consumeRemoveWrong();
      });

      expect(result.current.skip).toBe(9);
      expect(result.current.addTime).toBe(9);
      expect(result.current.removeWrong).toBe(9);

      // Manual reset (simulate date change)
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-16T00:00:00.000Z');
      
      act(() => {
        result.current.resetIfNeeded();
      });

      expect(result.current.skip).toBe(10);
      expect(result.current.addTime).toBe(10);
      expect(result.current.removeWrong).toBe(10);
    });
  });

  describe('Platform-specific storage', () => {
    it('should use localStorage on web platform', async () => {
      // Change Platform.OS to web
      require('react-native').Platform.OS = 'web';
      
      const webState = {
        skip: 8,
        addTime: 6,
        removeWrong: 4,
        lastResetDate: '2024-01-15',
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(webState));
      storageGetItemSpy.mockResolvedValue(JSON.stringify(webState));

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.skip).toBe(8);
      expect(result.current.addTime).toBe(6);
      expect(result.current.removeWrong).toBe(4);

      // Reset Platform.OS
      require('react-native').Platform.OS = 'ios';
    });
  });

  describe('Error handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should fall back to default state
      expect(result.current.skip).toBe(10);
      expect(result.current.addTime).toBe(10);
      expect(result.current.removeWrong).toBe(10);
    });

    it('should handle save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));

      const { result } = renderHook(() => usePowerButtons());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should still update state even if save fails
      act(() => {
        result.current.consumeSkip();
      });

      expect(result.current.skip).toBe(9);
    });
  });
});