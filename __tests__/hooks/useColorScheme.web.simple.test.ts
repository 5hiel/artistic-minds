import { renderHook } from '@testing-library/react';

// Mock react-native
const mockUseRNColorScheme = jest.fn();
jest.mock('react-native', () => ({
  useColorScheme: mockUseRNColorScheme,
}));

// Simple test for useColorScheme.web to get basic coverage
describe('useColorScheme.web basic coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRNColorScheme.mockReturnValue('light');
  });

  it('should export a function', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme.web');
    expect(typeof useColorScheme).toBe('function');
  });

  it('should return light before hydration', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme.web');
    const { result } = renderHook(() => useColorScheme());
    
    // Should return 'light' before hydration
    expect(result.current).toBe('light');
  });
});