import { renderHook, act } from '@testing-library/react';
import { usePowerSurge } from '../../src/hooks/usePowerSurge';

// Mock timers for consistent testing
jest.useFakeTimers();

describe('usePowerSurge', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Timer functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePowerSurge());

      expect(result.current.state.seconds).toBe(60);
      expect(result.current.state.correctAnswersInWindow).toBe(0);
      expect(result.current.state.currentPowerLevel).toBe(0);
      expect(result.current.state.isInPowerSurge).toBe(false);
    });

    it('should initialize with custom loop seconds', () => {
      const { result } = renderHook(() => usePowerSurge(90));

      expect(result.current.state.seconds).toBe(90);
    });

    it('should countdown timer each second', () => {
      const { result } = renderHook(() => usePowerSurge());

      expect(result.current.state.seconds).toBe(60);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.state.seconds).toBe(59);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.state.seconds).toBe(54);
    });

    it('should reset to loop seconds when timer reaches 0', () => {
      const { result } = renderHook(() => usePowerSurge(10));

      // Fast forward to near end
      act(() => {
        jest.advanceTimersByTime(9000);
      });
      expect(result.current.state.seconds).toBe(1);

      // Advance one more second to trigger reset
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.state.seconds).toBe(10);
    });

    it('should reset correctAnswersInWindow when timer resets', () => {
      const { result } = renderHook(() => usePowerSurge(5));

      // Add some correct answers
      act(() => {
        result.current.actions.recordCorrectAnswer();
        result.current.actions.recordCorrectAnswer();
      });
      expect(result.current.state.correctAnswersInWindow).toBe(2);

      // Fast forward to timer reset
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.state.correctAnswersInWindow).toBe(0);
      expect(result.current.state.currentPowerLevel).toBe(0);
    });
  });

  describe('Power level calculations', () => {
    it('should return 0 power level for less than 5 correct answers', () => {
      const { result } = renderHook(() => usePowerSurge());

      expect(result.current.state.currentPowerLevel).toBe(0);

      act(() => {
        result.current.actions.recordCorrectAnswer();
      });
      expect(result.current.state.currentPowerLevel).toBe(0);

      act(() => {
        result.current.actions.recordCorrectAnswer();
        result.current.actions.recordCorrectAnswer();
        result.current.actions.recordCorrectAnswer();
      });
      expect(result.current.state.correctAnswersInWindow).toBe(4);
      expect(result.current.state.currentPowerLevel).toBe(0);
      expect(result.current.state.isInPowerSurge).toBe(false);
    });

    it('should calculate power level correctly for 5+ answers', () => {
      const { result } = renderHook(() => usePowerSurge());

      // Get to 5 correct answers
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.actions.recordCorrectAnswer();
        }
      });

      expect(result.current.state.correctAnswersInWindow).toBe(5);
      expect(result.current.state.currentPowerLevel).toBe(1); // 5 - 4 = 1
      expect(result.current.state.isInPowerSurge).toBe(true);

      // 6th answer
      act(() => {
        result.current.actions.recordCorrectAnswer();
      });
      expect(result.current.state.currentPowerLevel).toBe(2); // 6 - 4 = 2

      // 7th answer
      act(() => {
        result.current.actions.recordCorrectAnswer();
      });
      expect(result.current.state.currentPowerLevel).toBe(3); // 7 - 4 = 3
    });
  });

  describe('Scoring system', () => {
    it('should return 1 point for first 5 correct answers', () => {
      const { result } = renderHook(() => usePowerSurge());

      for (let i = 0; i < 5; i++) {
        let points;
        act(() => {
          points = result.current.actions.recordCorrectAnswer();
        });
        expect(points).toBe(1);
      }
    });

    it('should return arithmetic progression points after 5th answer', () => {
      const { result } = renderHook(() => usePowerSurge());

      // First 5 answers (1 point each)
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.actions.recordCorrectAnswer();
        }
      });

      // 6th answer should give 2 points (6 - 4 = 2)
      let points;
      act(() => {
        points = result.current.actions.recordCorrectAnswer();
      });
      expect(points).toBe(2);

      // 7th answer should give 3 points (7 - 4 = 3)
      act(() => {
        points = result.current.actions.recordCorrectAnswer();
      });
      expect(points).toBe(3);

      // 8th answer should give 4 points (8 - 4 = 4)
      act(() => {
        points = result.current.actions.recordCorrectAnswer();
      });
      expect(points).toBe(4);
    });

    it('should reset progression on wrong answer', () => {
      const { result } = renderHook(() => usePowerSurge());

      // Build up some correct answers
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.actions.recordCorrectAnswer();
        }
      });
      expect(result.current.state.correctAnswersInWindow).toBe(7);
      expect(result.current.state.currentPowerLevel).toBe(3);

      // Wrong answer should reset
      act(() => {
        result.current.actions.recordWrongAnswer();
      });
      expect(result.current.state.correctAnswersInWindow).toBe(0);
      expect(result.current.state.currentPowerLevel).toBe(0);
      expect(result.current.state.isInPowerSurge).toBe(false);

      // Next correct answer should be back to 1 point
      let points;
      act(() => {
        points = result.current.actions.recordCorrectAnswer();
      });
      expect(points).toBe(1);
    });
  });

  describe('Manual controls', () => {
    it('should reset window manually', () => {
      const { result } = renderHook(() => usePowerSurge());

      // Build up state
      act(() => {
        for (let i = 0; i < 6; i++) {
          result.current.actions.recordCorrectAnswer();
        }
        jest.advanceTimersByTime(30000); // 30 seconds elapsed
      });

      expect(result.current.state.correctAnswersInWindow).toBe(6);
      expect(result.current.state.seconds).toBe(30);

      // Manual reset
      act(() => {
        result.current.actions.resetWindow();
      });

      expect(result.current.state.correctAnswersInWindow).toBe(0);
      expect(result.current.state.seconds).toBe(60);
      expect(result.current.state.currentPowerLevel).toBe(0);
    });

    it('should add time correctly', () => {
      const { result } = renderHook(() => usePowerSurge());

      act(() => {
        jest.advanceTimersByTime(20000); // 20 seconds elapsed
      });
      expect(result.current.state.seconds).toBe(40);

      act(() => {
        result.current.addTime(15);
      });
      expect(result.current.state.seconds).toBe(55);
    });
  });

  describe('Timer cleanup', () => {
    it('should clear timer on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = renderHook(() => usePowerSurge());
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid answer submissions', () => {
      const { result } = renderHook(() => usePowerSurge());

      // Simulate rapid clicking
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.actions.recordCorrectAnswer();
        }
      });

      expect(result.current.state.correctAnswersInWindow).toBe(10);
      expect(result.current.state.currentPowerLevel).toBe(6); // 10 - 4 = 6
    });

    it('should handle negative time addition gracefully', () => {
      const { result } = renderHook(() => usePowerSurge());

      act(() => {
        result.current.addTime(-70); // More than current seconds
      });

      // Should not go negative (depends on implementation)
      expect(result.current.state.seconds).toBeGreaterThanOrEqual(0);
    });
  });
});