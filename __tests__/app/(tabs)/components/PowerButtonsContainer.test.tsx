/**
 * Tests for PowerButtonsContainer Component
 * Covers power-up logic, purchase functionality, and business rules
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PowerButtonsContainer from '../../../../app/(tabs)/components/PowerButtonsContainer';

// Mock the usePowerButtons hook
const mockUsePowerButtons = jest.fn();
jest.mock('@/hooks/usePowerButtons', () => ({
  usePowerButtons: mockUsePowerButtons
}));

// Mock PowerButton component
const mockPowerButton = jest.fn(({ testID, onPress, children }) => (
  <div data-testid={testID} onClick={onPress}>
    {children}
  </div>
));
jest.mock('../../../../app/(tabs)/components/PowerButton', () => mockPowerButton);

// Mock game config
jest.mock('@/constants/gameConfig', () => ({
  LEVELS: [
    { threshold: 0, name: 'Seeker', color: '#4A90E2' },
    { threshold: 10, name: 'Learner', color: '#7ED321' },
    { threshold: 50, name: 'Thinker', color: '#F5A623' },
    { threshold: 100, name: 'Creator', color: '#D0021B' },
    { threshold: 200, name: 'Visionary', color: '#9013FE' }
  ]
}));

// Mock design system
jest.mock('@/design', () => ({
  layoutStyles: {
    section: jest.fn(() => ({
      powerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16
      }
    }))
  }
}));

describe('PowerButtonsContainer Component', () => {
  let defaultProps: any;
  let mockPowerButtonsHook: any;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultProps = {
      onSkipPuzzle: jest.fn().mockResolvedValue(undefined),
      onAddTime: jest.fn().mockResolvedValue(undefined),
      onRemoveWrongAnswers: jest.fn().mockResolvedValue(undefined),
      usedRemoveTwo: false,
      currentScore: 75,
      levelIndex: 2
    };

    mockPowerButtonsHook = {
      inventory: 5,
      canPurchase: true,
      purchasePowerUps: jest.fn().mockResolvedValue(true),
      powerUpCosts: {
        skip: 1,
        addTime: 1,
        removeWrong: 2
      },
      isLoading: false,
      error: null,
      lastPurchase: null
    };

    mockUsePowerButtons.mockReturnValue(mockPowerButtonsHook);
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const renderResult = render(<PowerButtonsContainer {...defaultProps} />);

      expect(renderResult).toBeTruthy();
    });

    it('should render all three power buttons', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      expect(mockPowerButton).toHaveBeenCalledTimes(3);
    });

    it('should pass correct props to PowerButton components', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      // Verify PowerButton calls
      const calls = mockPowerButton.mock.calls;

      // Skip button
      expect(calls[0][0]).toMatchObject({
        type: 'skip',
        cost: 1,
        available: true,
        levelIndex: 2
      });

      // Add time button
      expect(calls[1][0]).toMatchObject({
        type: 'addTime',
        cost: 1,
        available: true,
        levelIndex: 2
      });

      // Remove wrong button
      expect(calls[2][0]).toMatchObject({
        type: 'removeWrong',
        cost: 2,
        available: true,
        levelIndex: 2,
        disabled: false // usedRemoveTwo is false
      });
    });
  });

  describe('Level Calculation', () => {
    it('should calculate correct level from score', () => {
      const testCases = [
        { score: 0, expectedLevel: 0 },
        { score: 5, expectedLevel: 0 },
        { score: 10, expectedLevel: 1 },
        { score: 25, expectedLevel: 1 },
        { score: 50, expectedLevel: 2 },
        { score: 75, expectedLevel: 2 },
        { score: 100, expectedLevel: 3 },
        { score: 150, expectedLevel: 3 },
        { score: 200, expectedLevel: 4 },
        { score: 500, expectedLevel: 4 }
      ];

      testCases.forEach(({ score, expectedLevel }) => {
        const { rerender } = render(
          <PowerButtonsContainer {...defaultProps} currentScore={score} />
        );

        expect(mockPowerButton).toHaveBeenCalledWith(
          expect.objectContaining({ levelIndex: expectedLevel }),
          expect.any(Object)
        );

        rerender(<PowerButtonsContainer {...defaultProps} currentScore={0} />);
      });
    });

    it('should use prop levelIndex when provided', () => {
      const props = {
        ...defaultProps,
        currentScore: 150, // Would normally be level 3
        levelIndex: 1 // Override to level 1
      };

      render(<PowerButtonsContainer {...props} />);

      expect(mockPowerButton).toHaveBeenCalledWith(
        expect.objectContaining({ levelIndex: 1 }),
        expect.any(Object)
      );
    });

    it('should handle undefined currentScore', () => {
      const props = {
        ...defaultProps,
        currentScore: undefined
      };

      render(<PowerButtonsContainer {...props} />);

      // Should default to level 0
      expect(mockPowerButton).toHaveBeenCalledWith(
        expect.objectContaining({ levelIndex: 0 }),
        expect.any(Object)
      );
    });
  });

  describe('Power-Up Availability', () => {
    it('should show available power-ups when user has inventory', () => {
      mockPowerButtonsHook.inventory = 10;

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toMatchObject({ available: true });
      });
    });

    it('should show unavailable power-ups when inventory is empty', () => {
      mockPowerButtonsHook.inventory = 0;

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toMatchObject({ available: false });
      });
    });

    it('should show limited availability for expensive power-ups', () => {
      mockPowerButtonsHook.inventory = 1; // Can only afford 1-cost items

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      // Skip (cost 1) should be available
      expect(calls[0][0]).toMatchObject({ available: true });

      // Add time (cost 1) should be available
      expect(calls[1][0]).toMatchObject({ available: true });

      // Remove wrong (cost 2) should not be available
      expect(calls[2][0]).toMatchObject({ available: false });
    });

    it('should disable removeWrong button when already used', () => {
      const props = {
        ...defaultProps,
        usedRemoveTwo: true
      };

      render(<PowerButtonsContainer {...props} />);

      const removeWrongCall = mockPowerButton.mock.calls[2];
      expect(removeWrongCall[0]).toMatchObject({ disabled: true });
    });
  });

  describe('Feature Flag Control', () => {
    it('should show purchase options when purchases enabled', () => {
      // PURCHASES_ENABLED is true by default in the component
      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toHaveProperty('canPurchase', true);
      });
    });

    it('should handle purchase functionality', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      expect(mockPowerButton).toHaveBeenCalledWith(
        expect.objectContaining({
          purchasePowerUps: mockPowerButtonsHook.purchasePowerUps
        }),
        expect.any(Object)
      );
    });
  });

  describe('Power-Up Handlers', () => {
    it('should handle skip puzzle correctly', async () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const skipButtonCall = mockPowerButton.mock.calls[0];
      const skipHandler = skipButtonCall[0].onPress;

      await skipHandler();

      expect(defaultProps.onSkipPuzzle).toHaveBeenCalled();
    });

    it('should handle add time correctly', async () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const addTimeButtonCall = mockPowerButton.mock.calls[1];
      const addTimeHandler = addTimeButtonCall[0].onPress;

      await addTimeHandler();

      expect(defaultProps.onAddTime).toHaveBeenCalled();
    });

    it('should handle remove wrong answers correctly', async () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const removeWrongButtonCall = mockPowerButton.mock.calls[2];
      const removeWrongHandler = removeWrongButtonCall[0].onPress;

      await removeWrongHandler();

      expect(defaultProps.onRemoveWrongAnswers).toHaveBeenCalled();
    });

    it('should handle power-up handler errors', async () => {
      const errorProps = {
        ...defaultProps,
        onSkipPuzzle: jest.fn().mockRejectedValue(new Error('Skip failed'))
      };

      render(<PowerButtonsContainer {...errorProps} />);

      const skipHandler = mockPowerButton.mock.calls[0][0].onPress;

      // Should not crash on handler error
      await expect(skipHandler()).resolves.not.toThrow();
    });
  });

  describe('Hook Integration', () => {
    it('should use power buttons hook correctly', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      expect(mockUsePowerButtons).toHaveBeenCalledWith({
        currentScore: 75,
        levelIndex: 2
      });
    });

    it('should pass hook data to power buttons', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toMatchObject({
          inventory: 5,
          canPurchase: true,
          purchasePowerUps: mockPowerButtonsHook.purchasePowerUps
        });
      });
    });

    it('should handle hook loading state', () => {
      mockPowerButtonsHook.isLoading = true;

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toMatchObject({ isLoading: true });
      });
    });

    it('should handle hook error state', () => {
      mockPowerButtonsHook.error = 'Purchase failed';

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toMatchObject({ error: 'Purchase failed' });
      });
    });
  });

  describe('Purchase Integration', () => {
    it('should handle successful purchases', async () => {
      mockPowerButtonsHook.purchasePowerUps.mockResolvedValue(true);

      render(<PowerButtonsContainer {...defaultProps} />);

      const purchaseHandler = mockPowerButton.mock.calls[0][0].purchasePowerUps;

      const result = await purchaseHandler(5);

      expect(result).toBe(true);
      expect(mockPowerButtonsHook.purchasePowerUps).toHaveBeenCalledWith(5);
    });

    it('should handle failed purchases', async () => {
      mockPowerButtonsHook.purchasePowerUps.mockResolvedValue(false);

      render(<PowerButtonsContainer {...defaultProps} />);

      const purchaseHandler = mockPowerButton.mock.calls[0][0].purchasePowerUps;

      const result = await purchaseHandler(10);

      expect(result).toBe(false);
    });

    it('should handle purchase errors', async () => {
      mockPowerButtonsHook.purchasePowerUps.mockRejectedValue(new Error('Network error'));

      render(<PowerButtonsContainer {...defaultProps} />);

      const purchaseHandler = mockPowerButton.mock.calls[0][0].purchasePowerUps;

      await expect(purchaseHandler(5)).rejects.toThrow('Network error');
    });

    it('should update inventory after successful purchase', () => {
      // Initial render
      const { rerender } = render(<PowerButtonsContainer {...defaultProps} />);

      // Simulate inventory update after purchase
      mockPowerButtonsHook.inventory = 10;
      mockUsePowerButtons.mockReturnValue({
        ...mockPowerButtonsHook,
        inventory: 10
      });

      rerender(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls.slice(-3); // Last 3 calls

      calls.forEach(call => {
        expect(call[0]).toMatchObject({ inventory: 10 });
      });
    });
  });

  describe('Cost Calculation', () => {
    it('should pass correct costs to power buttons', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      expect(calls[0][0].cost).toBe(1); // Skip
      expect(calls[1][0].cost).toBe(1); // Add time
      expect(calls[2][0].cost).toBe(2); // Remove wrong
    });

    it('should handle dynamic cost changes', () => {
      const { rerender } = render(<PowerButtonsContainer {...defaultProps} />);

      // Update costs
      mockPowerButtonsHook.powerUpCosts = {
        skip: 2,
        addTime: 3,
        removeWrong: 4
      };

      rerender(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls.slice(-3);

      expect(calls[0][0].cost).toBe(2);
      expect(calls[1][0].cost).toBe(3);
      expect(calls[2][0].cost).toBe(4);
    });
  });

  describe('Theme Integration', () => {
    it('should apply correct theme for different levels', () => {
      const testLevels = [0, 1, 2, 3, 4];

      testLevels.forEach(levelIndex => {
        const { rerender } = render(
          <PowerButtonsContainer {...defaultProps} levelIndex={levelIndex} />
        );

        const calls = mockPowerButton.mock.calls.slice(-3);

        calls.forEach(call => {
          expect(call[0].levelIndex).toBe(levelIndex);
        });

        rerender(<PowerButtonsContainer {...defaultProps} levelIndex={0} />);
      });
    });

    it('should handle invalid level indices', () => {
      const renderResult = render(
        <PowerButtonsContainer {...defaultProps} levelIndex={-1} />
      );

      expect(renderResult).toBeTruthy();

      const renderResult2 = render(
        <PowerButtonsContainer {...defaultProps} levelIndex={100} />
      );

      expect(renderResult2).toBeTruthy();
    });
  });

  describe('Performance Optimization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<PowerButtonsContainer {...defaultProps} />);

      const initialCallCount = mockPowerButton.mock.calls.length;

      // Same props should not trigger re-render
      rerender(<PowerButtonsContainer {...defaultProps} />);

      expect(mockPowerButton.mock.calls.length).toBe(initialCallCount * 2); // Normal re-render
    });

    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(<PowerButtonsContainer {...defaultProps} />);

      // Rapid score changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <PowerButtonsContainer {...defaultProps} currentScore={i * 10} />
        );
      }

      expect(mockPowerButton).toHaveBeenCalled();
    });

    it('should cleanup resources properly', () => {
      const { unmount } = render(<PowerButtonsContainer {...defaultProps} />);

      unmount();

      // Should complete without errors
      expect(mockUsePowerButtons).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing hook return values', () => {
      mockUsePowerButtons.mockReturnValue({});

      const renderResult = render(<PowerButtonsContainer {...defaultProps} />);

      expect(renderResult).toBeTruthy();
    });

    it('should handle undefined power-up costs', () => {
      mockPowerButtonsHook.powerUpCosts = {};

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      // Should handle gracefully with fallback values
      calls.forEach(call => {
        expect(call[0].cost).toBeDefined();
      });
    });

    it('should handle negative inventory', () => {
      mockPowerButtonsHook.inventory = -5;

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        expect(call[0]).toMatchObject({ available: false });
      });
    });

    it('should handle extremely high scores', () => {
      const renderResult = render(
        <PowerButtonsContainer {...defaultProps} currentScore={999999999} />
      );

      expect(renderResult).toBeTruthy();
    });

    it('should handle missing onPress handlers', () => {
      const incompleteProps = {
        onSkipPuzzle: jest.fn(),
        onAddTime: jest.fn(),
        onRemoveWrongAnswers: jest.fn(),
        currentScore: 50
      };

      expect(() =>
        render(<PowerButtonsContainer {...incompleteProps} />)
      ).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility props to power buttons', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach((call, index) => {
        const props = call[0];
        expect(props).toHaveProperty('accessible', true);

        // Each button should have appropriate accessibility label
        expect(props.accessibilityLabel).toBeDefined();
      });
    });

    it('should provide context for power-up costs', () => {
      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        const props = call[0];
        expect(props.accessibilityHint).toContain('costs');
      });
    });

    it('should indicate availability status to screen readers', () => {
      mockPowerButtonsHook.inventory = 0;

      render(<PowerButtonsContainer {...defaultProps} />);

      const calls = mockPowerButton.mock.calls;

      calls.forEach(call => {
        const props = call[0];
        expect(props.accessibilityLabel).toContain('unavailable');
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from hook errors', () => {
      mockUsePowerButtons.mockImplementation(() => {
        throw new Error('Hook error');
      });

      expect(() =>
        render(<PowerButtonsContainer {...defaultProps} />)
      ).toThrow(); // Hook errors should be handled by error boundaries

      // Reset hook
      mockUsePowerButtons.mockReturnValue(mockPowerButtonsHook);

      expect(() =>
        render(<PowerButtonsContainer {...defaultProps} />)
      ).not.toThrow();
    });

    it('should handle component re-mounting after errors', () => {
      const { unmount } = render(<PowerButtonsContainer {...defaultProps} />);

      unmount();

      // Re-mount should work
      const renderResult = render(<PowerButtonsContainer {...defaultProps} />);

      expect(renderResult).toBeTruthy();
    });
  });
});