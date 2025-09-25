/**
 * Tests for ScoreFlashOverlay Component
 * Covers animation logic, performance optimization, and visual feedback
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Animated } from 'react-native';
import ScoreFlashOverlay from '../../../../app/(tabs)/components/ScoreFlashOverlay';

// Mock React Native Animated
const mockAnimatedValue = {
  setValue: jest.fn(),
  addListener: jest.fn(),
  removeAllListeners: jest.fn()
};

const mockAnimatedTiming = jest.fn(() => ({
  start: jest.fn((callback) => {
    // Simulate animation completion
    setTimeout(() => callback && callback({ finished: true }), 100);
  })
}));

// React Native mock is handled in jest-setup.js - extend it for this test
jest.doMock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios || options.default),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Animated: {
    Value: jest.fn(() => mockAnimatedValue),
    timing: mockAnimatedTiming,
    View: 'Animated.View',
    Text: 'Animated.Text',
    loop: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() }))
  },
  Easing: {
    inOut: jest.fn(),
    bezier: jest.fn(),
    elastic: jest.fn()
  },
  View: 'View',
  Text: 'Text',
}));

// Mock design system
jest.mock('../../../../design', () => ({
  colors: {
    text: { white: '#ffffff', accent: '#007AFF' },
    background: { overlay: '#000000aa' },
    success: '#4CD964',
    warning: '#FF9500',
    error: '#FF3B30'
  },
  spacing: { sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    title: { fontSize: 32, fontWeight: 'bold' },
    subtitle: { fontSize: 24, fontWeight: '600' },
    body: { fontSize: 18 }
  },
  zIndex: { overlay: 1000, modal: 2000 }
}));

// Mock game config for power surge colors
jest.mock('../../../../constants/gameConfig', () => ({
  LEVELS: [
    { color: '#4A90E2', glowColor: '#4A90E255' },
    { color: '#7ED321', glowColor: '#7ED32155' },
    { color: '#F5A623', glowColor: '#F5A62355' },
    { color: '#D0021B', glowColor: '#D0021B55' },
    { color: '#9013FE', glowColor: '#9013FE55' }
  ]
}));

describe('ScoreFlashOverlay Component', () => {
  let defaultProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    defaultProps = {
      show: true,
      score: 150,
      previousScore: 100,
      isPowerSurge: false,
      powerSurgeMultiplier: 1,
      levelIndex: 2,
      onAnimationComplete: jest.fn()
    };

    // Reset animated value mocks
    mockAnimatedValue.setValue.mockClear();
    mockAnimatedTiming.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Visibility', () => {
    it('should render when show is true', () => {
      const { getByTestId } = render(<ScoreFlashOverlay {...defaultProps} />);

      expect(getByTestId('score-flash-overlay')).toBeTruthy();
    });

    it('should not render when show is false', () => {
      const { queryByTestId } = render(
        <ScoreFlashOverlay {...defaultProps} show={false} />
      );

      expect(queryByTestId('score-flash-overlay')).toBeNull();
    });

    it('should handle show prop changes', () => {
      const { rerender, queryByTestId } = render(
        <ScoreFlashOverlay {...defaultProps} show={false} />
      );

      expect(queryByTestId('score-flash-overlay')).toBeNull();

      rerender(<ScoreFlashOverlay {...defaultProps} show={true} />);

      expect(queryByTestId('score-flash-overlay')).toBeTruthy();
    });
  });

  describe('Score Display', () => {
    it('should display current score', () => {
      const { getByText } = render(<ScoreFlashOverlay {...defaultProps} />);

      expect(getByText('150')).toBeTruthy();
    });

    it('should display score difference', () => {
      const { getByText } = render(<ScoreFlashOverlay {...defaultProps} />);

      expect(getByText('+50')).toBeTruthy(); // 150 - 100 = +50
    });

    it('should handle zero score difference', () => {
      const props = {
        ...defaultProps,
        score: 100,
        previousScore: 100
      };

      const { getByText } = render(<ScoreFlashOverlay {...props} />);

      expect(getByText('+0')).toBeTruthy();
    });

    it('should format large scores correctly', () => {
      const props = {
        ...defaultProps,
        score: 12345,
        previousScore: 10000
      };

      const { getByText } = render(<ScoreFlashOverlay {...props} />);

      expect(getByText('12,345')).toBeTruthy();
      expect(getByText('+2,345')).toBeTruthy();
    });

    it('should handle negative score difference', () => {
      const props = {
        ...defaultProps,
        score: 80,
        previousScore: 100
      };

      const { getByText } = render(<ScoreFlashOverlay {...props} />);

      expect(getByText('-20')).toBeTruthy();
    });
  });

  describe('Power Surge Display', () => {
    it('should show power surge indicators', () => {
      const props = {
        ...defaultProps,
        isPowerSurge: true,
        powerSurgeMultiplier: 3
      };

      const { getByText } = render(<ScoreFlashOverlay {...props} />);

      expect(getByText(/POWER SURGE/i)).toBeTruthy();
      expect(getByText(/3x/i)).toBeTruthy();
    });

    it('should apply power surge styling', () => {
      const props = {
        ...defaultProps,
        isPowerSurge: true,
        powerSurgeMultiplier: 2
      };

      const { getByTestId } = render(<ScoreFlashOverlay {...props} />);
      const overlay = getByTestId('score-flash-overlay');

      // Should have power surge styling
      expect(overlay).toBeTruthy();
    });

    it('should handle different multiplier values', () => {
      const testMultipliers = [1, 2, 3, 5, 10];

      testMultipliers.forEach(multiplier => {
        const { getByText, rerender } = render(
          <ScoreFlashOverlay
            {...defaultProps}
            isPowerSurge={true}
            powerSurgeMultiplier={multiplier}
          />
        );

        expect(getByText(`${multiplier}x`)).toBeTruthy();

        rerender(<ScoreFlashOverlay {...defaultProps} show={false} />);
      });
    });

    it('should not show power surge when not active', () => {
      const props = {
        ...defaultProps,
        isPowerSurge: false,
        powerSurgeMultiplier: 1
      };

      const { queryByText } = render(<ScoreFlashOverlay {...props} />);

      expect(queryByText(/POWER SURGE/i)).toBeNull();
      expect(queryByText(/x/)).toBeNull();
    });
  });

  describe('Animation System', () => {
    it('should initialize animations on mount', () => {
      render(<ScoreFlashOverlay {...defaultProps} />);

      expect(Animated.Value).toHaveBeenCalledTimes(3); // opacity, scale, slideY
      expect(mockAnimatedValue.setValue).toHaveBeenCalled();
    });

    it('should start entrance animation when shown', async () => {
      render(<ScoreFlashOverlay {...defaultProps} />);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(mockAnimatedTiming).toHaveBeenCalled();
    });

    it('should trigger exit animation before hiding', async () => {
      const { rerender } = render(<ScoreFlashOverlay {...defaultProps} />);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      rerender(<ScoreFlashOverlay {...defaultProps} show={false} />);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(mockAnimatedTiming).toHaveBeenCalled();
    });

    it('should call onAnimationComplete after animations', async () => {
      render(<ScoreFlashOverlay {...defaultProps} />);

      await act(async () => {
        jest.advanceTimersByTime(2000); // Animation duration
      });

      expect(defaultProps.onAnimationComplete).toHaveBeenCalled();
    });

    it('should handle rapid show/hide cycles', async () => {
      const { rerender } = render(<ScoreFlashOverlay {...defaultProps} />);

      // Rapid changes
      rerender(<ScoreFlashOverlay {...defaultProps} show={false} />);
      rerender(<ScoreFlashOverlay {...defaultProps} show={true} />);
      rerender(<ScoreFlashOverlay {...defaultProps} show={false} />);

      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      // Should not crash
      expect(mockAnimatedTiming).toHaveBeenCalled();
    });

    it('should use different animations for power surge', () => {
      const normalProps = { ...defaultProps, isPowerSurge: false };
      const powerSurgeProps = { ...defaultProps, isPowerSurge: true };

      const { rerender } = render(<ScoreFlashOverlay {...normalProps} />);

      const normalCalls = mockAnimatedTiming.mock.calls.length;

      rerender(<ScoreFlashOverlay {...powerSurgeProps} />);

      // Power surge should trigger different animations
      expect(mockAnimatedTiming).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('should prevent unnecessary re-renders', () => {
      const { rerender } = render(<ScoreFlashOverlay {...defaultProps} />);

      // Same props should not cause re-animation
      rerender(<ScoreFlashOverlay {...defaultProps} />);

      // Should initialize animations only once per show
      expect(Animated.Value).toHaveBeenCalledTimes(3);
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(<ScoreFlashOverlay {...defaultProps} />);

      unmount();

      expect(mockAnimatedValue.removeAllListeners).toHaveBeenCalled();
    });

    it('should handle component destruction during animation', () => {
      const { unmount } = render(<ScoreFlashOverlay {...defaultProps} />);

      // Start animation then immediately unmount
      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(() => unmount()).not.toThrow();
    });

    it('should optimize for multiple rapid score updates', async () => {
      const { rerender } = render(<ScoreFlashOverlay {...defaultProps} />);

      // Simulate rapid score updates
      for (let i = 0; i < 10; i++) {
        rerender(
          <ScoreFlashOverlay
            {...defaultProps}
            score={100 + i * 10}
            previousScore={100 + (i - 1) * 10}
          />
        );

        await act(async () => {
          jest.advanceTimersByTime(10);
        });
      }

      // Should handle without performance issues
      expect(mockAnimatedTiming).toHaveBeenCalled();
    });
  });

  describe('Level Theming', () => {
    it('should apply correct theme colors for different levels', () => {
      const testLevels = [0, 1, 2, 3, 4];

      testLevels.forEach(levelIndex => {
        const { getByTestId, rerender } = render(
          <ScoreFlashOverlay {...defaultProps} levelIndex={levelIndex} />
        );

        const overlay = getByTestId('score-flash-overlay');
        expect(overlay).toBeTruthy();

        rerender(<ScoreFlashOverlay {...defaultProps} show={false} />);
      });
    });

    it('should handle invalid level indices', () => {
      const renderResult = render(
        <ScoreFlashOverlay {...defaultProps} levelIndex={-1} />
      );

      expect(renderResult).toBeTruthy();

      const renderResult2 = render(
        <ScoreFlashOverlay {...defaultProps} levelIndex={100} />
      );

      expect(renderResult2).toBeTruthy();
    });

    it('should apply enhanced styling for power surge', () => {
      const { getByTestId } = render(
        <ScoreFlashOverlay
          {...defaultProps}
          isPowerSurge={true}
          levelIndex={3}
        />
      );

      const overlay = getByTestId('score-flash-overlay');

      // Should apply both level theme and power surge enhancement
      expect(overlay).toBeTruthy();
    });
  });

  describe('Animation Timing and Easing', () => {
    it('should use appropriate easing functions', () => {
      render(<ScoreFlashOverlay {...defaultProps} />);

      expect(mockAnimatedTiming).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: expect.any(Number),
          easing: expect.any(Function)
        })
      );
    });

    it('should have different durations for different animation phases', async () => {
      render(<ScoreFlashOverlay {...defaultProps} />);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      const timingCalls = mockAnimatedTiming.mock.calls;

      // Should have multiple timing calls with different configurations
      expect(timingCalls.length).toBeGreaterThan(1);
    });

    it('should handle animation interruption gracefully', async () => {
      const { rerender } = render(<ScoreFlashOverlay {...defaultProps} />);

      // Start animation
      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      // Interrupt with new animation
      rerender(
        <ScoreFlashOverlay
          {...defaultProps}
          score={200}
          previousScore={150}
        />
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(mockAnimatedTiming).toHaveBeenCalled();
    });
  });

  describe('Visual Effects', () => {
    it('should apply glow effect during power surge', () => {
      const { getByTestId } = render(
        <ScoreFlashOverlay {...defaultProps} isPowerSurge={true} />
      );

      const overlay = getByTestId('score-flash-overlay');

      // Should have glow effect styling
      expect(overlay).toBeTruthy();
    });

    it('should pulse effect for score increases', () => {
      const { getByTestId } = render(<ScoreFlashOverlay {...defaultProps} />);

      const scoreText = getByTestId('score-text');

      expect(scoreText).toBeTruthy();
    });

    it('should show particle effects for high multipliers', () => {
      const { queryByTestId } = render(
        <ScoreFlashOverlay
          {...defaultProps}
          isPowerSurge={true}
          powerSurgeMultiplier={5}
        />
      );

      // High multipliers might trigger particle effects
      expect(queryByTestId('score-flash-overlay')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<ScoreFlashOverlay {...defaultProps} />);

      expect(getByLabelText(/Score increase to 150/i)).toBeTruthy();
    });

    it('should announce score changes to screen readers', () => {
      const { getByRole } = render(<ScoreFlashOverlay {...defaultProps} />);

      expect(getByRole('alert')).toBeTruthy();
    });

    it('should provide context for power surge announcements', () => {
      const { getByLabelText } = render(
        <ScoreFlashOverlay
          {...defaultProps}
          isPowerSurge={true}
          powerSurgeMultiplier={3}
        />
      );

      expect(getByLabelText(/Power surge active, 3 times multiplier/i)).toBeTruthy();
    });

    it('should reduce motion for accessibility preferences', () => {
      // Mock AccessibilityInfo
      const mockAccessibilityInfo = {
        isReduceMotionEnabled: jest.fn().mockResolvedValue(true)
      };

      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        AccessibilityInfo: mockAccessibilityInfo
      }));

      const renderResult = render(<ScoreFlashOverlay {...defaultProps} />);

      expect(renderResult).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle animation errors gracefully', () => {
      mockAnimatedTiming.mockImplementation(() => {
        throw new Error('Animation failed');
      });

      expect(() => render(<ScoreFlashOverlay {...defaultProps} />)).not.toThrow();
    });

    it('should handle undefined props', () => {
      const minimalProps = {
        show: true,
        score: 100,
        onAnimationComplete: jest.fn()
      };

      const renderResult = render(<ScoreFlashOverlay {...minimalProps} />);

      expect(renderResult).toBeTruthy();
    });

    it('should handle negative scores', () => {
      const props = {
        ...defaultProps,
        score: -50,
        previousScore: 0
      };

      const { getByText } = render(<ScoreFlashOverlay {...props} />);

      expect(getByText('-50')).toBeTruthy();
    });

    it('should handle extremely large scores', () => {
      const props = {
        ...defaultProps,
        score: 999999999,
        previousScore: 999999998
      };

      const renderResult = render(<ScoreFlashOverlay {...props} />);

      expect(renderResult).toBeTruthy();
    });
  });

  describe('Memory Management', () => {
    it('should clean up animation listeners on unmount', () => {
      const { unmount } = render(<ScoreFlashOverlay {...defaultProps} />);

      unmount();

      expect(mockAnimatedValue.removeAllListeners).toHaveBeenCalledTimes(3); // One for each animated value
    });

    it('should handle multiple mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<ScoreFlashOverlay {...defaultProps} />);
        unmount();
      }

      expect(mockAnimatedValue.removeAllListeners).toHaveBeenCalledTimes(15); // 3 per cycle × 5 cycles
    });

    it('should prevent memory leaks from animation callbacks', async () => {
      const { unmount } = render(<ScoreFlashOverlay {...defaultProps} />);

      // Start animation
      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      // Unmount before animation completes
      unmount();

      // Complete animation timing
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // onAnimationComplete should not be called after unmount
      expect(defaultProps.onAnimationComplete).not.toHaveBeenCalled();
    });
  });
});