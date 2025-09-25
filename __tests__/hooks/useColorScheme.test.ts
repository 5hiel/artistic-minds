// Mock react-native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useColorScheme', () => {
  it('should export useColorScheme from react-native', () => {
    // Import our hook
    const { useColorScheme } = require('../../hooks/useColorScheme');
    const mockRNUseColorScheme = require('react-native').useColorScheme;
    
    // They should be the same function
    expect(useColorScheme).toBe(mockRNUseColorScheme);
  });

  it('should be a function', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme');
    expect(typeof useColorScheme).toBe('function');
  });
});