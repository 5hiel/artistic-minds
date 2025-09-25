/**
 * Mock setup for lib tests - heavy dependencies
 */

// Mock AsyncStorage to prevent memory issues
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage = new Map();
  return {
    getItem: jest.fn((key) => Promise.resolve(mockStorage.get(key) || null)),
    setItem: jest.fn((key, value) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      mockStorage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockStorage.clear();
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve([...mockStorage.keys()])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  };
});

// Mock Expo modules to reduce overhead
jest.mock('expo-constants', () => ({
  Constants: {
    systemFonts: [],
    platform: { ios: null },
  },
}));

// Mock heavy React Native modules
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  Dimensions: { get: jest.fn(() => ({ width: 375, height: 667 })) },
  StyleSheet: { create: jest.fn((styles) => styles) },
}));