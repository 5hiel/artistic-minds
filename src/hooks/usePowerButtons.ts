import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Try to import AsyncStorage, fall back to null if not available
let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // AsyncStorage not available, will use web storage or in-memory fallback
}

export interface PowerButtonState {
  skip: number;
  addTime: number;
  removeWrong: number;
  lastResetDate: string;
}

export interface PowerButtonActions {
  consumeSkip: () => boolean;
  consumeAddTime: () => boolean;
  consumeRemoveWrong: () => boolean;
  resetIfNeeded: () => void;
  purchaseSkip: () => Promise<{ success: boolean; error?: string }>;
  purchaseAddTime: () => Promise<{ success: boolean; error?: string }>;
  purchaseRemoveWrong: () => Promise<{ success: boolean; error?: string }>;
}

const MAX_USES = 10;
const STORAGE_KEY = 'powerButtonState';

// In-app purchase configuration
const POWER_UP_PRODUCTS = {
  SKIP: 'com.shiel.giftedminds.skip.10pack',
  ADD_TIME: 'com.shiel.giftedminds.addtime.10pack',
  REMOVE_TWO: 'com.shiel.giftedminds.removetwo.10pack'
} as const;


// Feature flag - set to false to disable purchases entirely
const PURCHASES_ENABLED = true; // Enabled - will show "Coming soon!" until store products are configured

// Cross-platform storage abstraction
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      // If AsyncStorage is not available, return null (will use default state)
      return null;
    } catch {
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
      // If AsyncStorage is not available, silently fail
    } catch {
      // Silent fail
    }
  }
};

// Export storage for testing purposes
export { storage };

// Get today's date in YYYY-MM-DD format for comparison
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Default state factory
const getDefaultState = (): PowerButtonState => ({
  skip: MAX_USES,
  addTime: MAX_USES,
  removeWrong: MAX_USES,
  lastResetDate: getTodayString()
});

export const usePowerButtons = (): PowerButtonState & PowerButtonActions => {
  const [state, setState] = useState<PowerButtonState>(getDefaultState);

  // Load state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await storage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedState: PowerButtonState = JSON.parse(stored);
          const today = getTodayString();
          
          // Reset if it's a new day
          if (parsedState.lastResetDate !== today) {
            const resetState = getDefaultState();
            setState(resetState);
            await storage.setItem(STORAGE_KEY, JSON.stringify(resetState));
          } else {
            setState(parsedState);
          }
        } else {
          // First time - save default state
          const defaultState = getDefaultState();
          setState(defaultState);
          await storage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
        }
      } catch {
        // If storage fails, use default state
        setState(getDefaultState());
      }
    };

    loadState();
  }, []);

  // Save state to storage whenever it changes
  const saveState = async (newState: PowerButtonState) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Silent fail
    }
  };

  // Reset quotas if needed (called manually or on day change)
  const resetIfNeeded = useCallback(() => {
    const today = getTodayString();
    if (state.lastResetDate !== today) {
      const resetState = getDefaultState();
      setState(resetState);
      saveState(resetState);
    }
  }, [state.lastResetDate]);

  // Consume skip power
  const consumeSkip = (): boolean => {
    if (state.skip <= 0) return false;
    
    const newState = { ...state, skip: state.skip - 1 };
    setState(newState);
    saveState(newState);
    return true;
  };

  // Consume add time power
  const consumeAddTime = (): boolean => {
    if (state.addTime <= 0) return false;
    
    const newState = { ...state, addTime: state.addTime - 1 };
    setState(newState);
    saveState(newState);
    return true;
  };

  // Consume remove wrong answers power
  const consumeRemoveWrong = (): boolean => {
    if (state.removeWrong <= 0) return false;
    
    const newState = { ...state, removeWrong: state.removeWrong - 1 };
    setState(newState);
    saveState(newState);
    return true;
  };

  // Generic purchase function
  const purchasePowerUp = async (productId: string, powerType: 'skip' | 'addTime' | 'removeWrong'): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if purchases are enabled
      if (!PURCHASES_ENABLED) {
        return { 
          success: false, 
          error: 'Purchases are not available yet. Coming soon!' 
        };
      }

      // Check if purchases are available
      if (Platform.OS === 'web') {
        return { success: false, error: 'In-app purchases not supported on web' };
      }

      // TODO: Implement actual in-app purchase logic here
      // For now, since PURCHASES_ENABLED is false, this won't be called
      console.log('Purchase attempted but not implemented yet');
      return { success: false, error: 'Purchases coming soon!' };
    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, error: 'Purchase failed. Please try again.' };
    }
  };

  // Purchase functions for each power-up type
  const purchaseSkip = () => purchasePowerUp(POWER_UP_PRODUCTS.SKIP, 'skip');
  const purchaseAddTime = () => purchasePowerUp(POWER_UP_PRODUCTS.ADD_TIME, 'addTime');
  const purchaseRemoveWrong = () => purchasePowerUp(POWER_UP_PRODUCTS.REMOVE_TWO, 'removeWrong');

  return {
    ...state,
    consumeSkip,
    consumeAddTime,
    consumeRemoveWrong,
    resetIfNeeded,
    purchaseSkip,
    purchaseAddTime,
    purchaseRemoveWrong,
  };
};