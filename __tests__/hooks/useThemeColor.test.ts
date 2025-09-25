import { renderHook } from '@testing-library/react';
import { useThemeColor } from '../../src/hooks/useThemeColor';

// Mock the useColorScheme hook completely
jest.mock('../../src/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

// Import the mocked function
import { useColorScheme } from '../../src/hooks/useColorScheme';
const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Light mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should return light color from Colors when no props provided', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe('#11181C'); // Light text color
    });

    it('should return props light color when provided', () => {
      const { result } = renderHook(() => 
        useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text')
      );
      expect(result.current).toBe('#custom-light');
    });

    it('should return Colors light color when only dark prop provided', () => {
      const { result } = renderHook(() => 
        useThemeColor({ dark: '#custom-dark' }, 'background')
      );
      expect(result.current).toBe('#fff'); // Light background color
    });

    it('should work with different color names', () => {
      const { result: tintResult } = renderHook(() => useThemeColor({}, 'tint'));
      const { result: iconResult } = renderHook(() => useThemeColor({}, 'icon'));
      
      expect(tintResult.current).toBe('#0a7ea4');
      expect(iconResult.current).toBe('#687076');
    });
  });

  describe('Dark mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('should return dark color from Colors when no props provided', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe('#ECEDEE'); // Dark text color
    });

    it('should return props dark color when provided', () => {
      const { result } = renderHook(() => 
        useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text')
      );
      expect(result.current).toBe('#custom-dark');
    });

    it('should return Colors dark color when only light prop provided', () => {
      const { result } = renderHook(() => 
        useThemeColor({ light: '#custom-light' }, 'background')
      );
      expect(result.current).toBe('#151718'); // Dark background color
    });

    it('should work with different color names', () => {
      const { result: tintResult } = renderHook(() => useThemeColor({}, 'tint'));
      const { result: iconResult } = renderHook(() => useThemeColor({}, 'icon'));
      
      expect(tintResult.current).toBe('#fff');
      expect(iconResult.current).toBe('#9BA1A6');
    });
  });

  describe('Null color scheme fallback', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue(null);
    });

    it('should fallback to light mode when colorScheme is null', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe('#11181C'); // Light text color
    });

    it('should use light prop when colorScheme is null', () => {
      const { result } = renderHook(() => 
        useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text')
      );
      expect(result.current).toBe('#custom-light');
    });
  });

  describe('All color names', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should handle all available color names', () => {
      const colorNames = ['text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'] as const;
      
      colorNames.forEach(colorName => {
        const { result } = renderHook(() => useThemeColor({}, colorName));
        expect(typeof result.current).toBe('string');
        expect(result.current.length).toBeGreaterThan(0);
      });
    });
  });
});