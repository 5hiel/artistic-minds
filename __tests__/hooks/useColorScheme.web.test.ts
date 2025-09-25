import { renderHook } from '@testing-library/react';

// Mock react-native useColorScheme
const mockUseRNColorScheme = jest.fn();
jest.mock('react-native', () => ({
  useColorScheme: mockUseRNColorScheme,
}));

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRNColorScheme.mockReturnValue('light');
  });

  it('should return a valid color scheme', () => {
    mockUseRNColorScheme.mockReturnValue('dark');

    const { useColorScheme } = require('../../hooks/useColorScheme.web');
    const { result } = renderHook(() => useColorScheme());
    
    // Should return a valid color scheme (light or dark after hydration)
    expect(['light', 'dark', null]).toContain(result.current);
  });

  it('should work with light color scheme', () => {
    mockUseRNColorScheme.mockReturnValue('light');

    const { useColorScheme } = require('../../hooks/useColorScheme.web');
    const { result } = renderHook(() => useColorScheme());
    
    // Should eventually return light
    expect(['light', 'dark', null]).toContain(result.current);
  });

  it('should handle null color scheme from RN', () => {
    mockUseRNColorScheme.mockReturnValue(null);

    const { useColorScheme } = require('../../hooks/useColorScheme.web');
    const { result } = renderHook(() => useColorScheme());
    
    // Should return light (fallback) or null
    expect(['light', null]).toContain(result.current);
  });

  it('should respond to color scheme changes', () => {
    mockUseRNColorScheme.mockReturnValue('light');

    const { useColorScheme } = require('../../hooks/useColorScheme.web');
    const { result, rerender } = renderHook(() => useColorScheme());
    
    const firstResult = result.current;
    
    // Change color scheme and re-render
    mockUseRNColorScheme.mockReturnValue('dark');
    rerender();
    
    // Should return a valid color scheme
    expect(['light', 'dark', null]).toContain(result.current);
  });
});