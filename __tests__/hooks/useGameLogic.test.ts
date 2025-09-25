import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from '../../src/hooks/useGameLogic';
import { GameState, GameActions } from '../../src/hooks/useGameState';
// Mock pattern puzzle directly in test
const mockPatternPuzzle = {
  question: 'Test question',
  grid: [['A', 'B'], ['C', '?']],
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: 0,
  explanation: 'Test explanation',
  patternType: 'test-pattern',
  puzzleType: 'pattern',
  puzzleSubtype: 'grid',
  difficultyLevel: 'medium' as const
};

// Mock the useGameState dependencies
const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  score: 0,
  highScore: 0,
  currentPuzzle: mockPatternPuzzle,
  feedback: '',
  selectedOption: -1,
  showExplanation: false,
  showFlash: false,
  removedOptions: new Set(),
  usedRemoveTwo: false,
  // Viral sharing state
  showScoreFlash: false,
  scoreFlashData: null,
  showShareScreen: false,
  hasBeatenHighScoreThisSession: false,
  sessionHighScore: 0,
  hasShownScoreFlash: false,
  puzzleStartTime: Date.now(),
  currentGameSessionId: 'test-session',
  gameSessionStartTime: Date.now(),
  recentPatterns: [],
  ...overrides
});

const createMockGameActions = (): GameActions => ({
  setScore: jest.fn(),
  setHighScore: jest.fn().mockResolvedValue(undefined),
  setCurrentPuzzle: jest.fn(),
  setFeedback: jest.fn(),
  setSelectedOption: jest.fn(),
  setShowExplanation: jest.fn(),
  setShowFlash: jest.fn(),
  setRemovedOptions: jest.fn(),
  setUsedRemoveTwo: jest.fn(),
  resetGame: jest.fn(),
  nextPuzzle: jest.fn(),
  // Viral sharing actions
  setShowScoreFlash: jest.fn(),
  setScoreFlashData: jest.fn(),
  setShowShareScreen: jest.fn(),
  setHasBeatenHighScoreThisSession: jest.fn(),
  setSessionHighScore: jest.fn(),
  setHasShownScoreFlash: jest.fn(),
  setPuzzleStartTime: jest.fn(),
  setCurrentGameSessionId: jest.fn(),
  setGameSessionStartTime: jest.fn(),
  addRecentPattern: jest.fn(),
  setRecentPatterns: jest.fn(),
});

describe.skip('useGameLogic', () => {
  let mockGameState: GameState;
  let mockGameActions: GameActions;

  beforeEach(() => {
    // Use fake timers only when needed
    jest.useFakeTimers();
    mockGameState = createMockGameState();
    mockGameActions = createMockGameActions();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up timers and mocks more aggressively
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  describe('Initialization', () => {
    it('should initialize with correct power surge state', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      expect(result.current.powerSurgeState.seconds).toBe(60);
      expect(result.current.powerSurgeState.correctAnswersInWindow).toBe(0);
      expect(result.current.powerSurgeState.currentPowerLevel).toBe(0);
      expect(result.current.powerSurgeState.isInPowerSurge).toBe(false);
    });

    it('should calculate correct level index for high score', () => {
      const highScoreTests = [
        { highScore: 0, expectedLevel: 0 }, // Seeker
        { highScore: 10, expectedLevel: 1 }, // Learner
        { highScore: 100, expectedLevel: 2 }, // Thinker
        { highScore: 1000, expectedLevel: 3 }, // Creator
        { highScore: 10000, expectedLevel: 4 }, // Visionary
      ];

      highScoreTests.forEach(({ highScore, expectedLevel }) => {
        const gameState = createMockGameState({ highScore });
        const { result } = renderHook(() => 
          useGameLogic(gameState, mockGameActions)
        );
        expect(result.current.levelIndex).toBe(expectedLevel);
      });
    });
  });

  describe('Correct answer handling', () => {
    it('should handle correct answer with basic scoring', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      act(() => {
        result.current.handleOptionSelect(0); // Correct answer index
      });

      expect(mockGameActions.setSelectedOption).toHaveBeenCalledWith(0);
      expect(mockGameActions.setFeedback).toHaveBeenCalledWith('🎉 Correct!');
      expect(mockGameActions.setScore).toHaveBeenCalledWith(1); // First answer = 1 point
      expect(mockGameActions.setShowFlash).toHaveBeenCalledWith(true);
    });

    it('should handle correct answer during power surge', () => {
      // Build up to power surge (5+ correct answers)
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      // Simulate being in power surge by multiple quick selections
      act(() => {
        // Reduced iterations to prevent memory issues
        result.current.handleOptionSelect(0); // 1st
        result.current.handleOptionSelect(0); // 2nd  
        result.current.handleOptionSelect(0); // 3rd
        result.current.handleOptionSelect(0); // 4th
        result.current.handleOptionSelect(0); // 5th (triggers power surge)
        jest.clearAllMocks(); // Clear previous calls
      });

      // 6th correct answer should be in power surge
      act(() => {
        result.current.handleOptionSelect(0);
      });

      expect(mockGameActions.setFeedback).toHaveBeenCalledWith('🎉 POWER SURGE! +2!');
      expect(mockGameActions.setScore).toHaveBeenCalledWith(2); // 6th answer = 2 points
    });

    it('should update high score when exceeded', () => {
      const gameState = createMockGameState({ score: 95, highScore: 100 });
      const { result } = renderHook(() => 
        useGameLogic(gameState, mockGameActions)
      );

      // This should bring score to 96 (still below high score)
      act(() => {
        result.current.handleOptionSelect(0);
      });

      expect(mockGameActions.setHighScore).not.toHaveBeenCalled();

      // Reset mocks and test exceeding high score
      jest.clearAllMocks();
      const gameState2 = createMockGameState({ score: 100, highScore: 100 });
      const { result: result2 } = renderHook(() => 
        useGameLogic(gameState2, mockGameActions)
      );

      act(() => {
        result2.current.handleOptionSelect(0);
      });

      expect(mockGameActions.setHighScore).toHaveBeenCalledWith(101);
    });

    it('should auto-advance to next puzzle after correct answer', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      act(() => {
        result.current.handleOptionSelect(0);
      });

      // Fast forward past the 1200ms timeout
      act(() => {
        jest.advanceTimersByTime(1200);
      });

      expect(mockGameActions.setShowFlash).toHaveBeenCalledWith(false);
      expect(mockGameActions.nextPuzzle).toHaveBeenCalled();
    });

    it('should prevent multiple selections after correct answer', () => {
      const gameState = createMockGameState({ selectedOption: 0 }); // Already selected correct
      const { result } = renderHook(() => 
        useGameLogic(gameState, mockGameActions)
      );

      act(() => {
        result.current.handleOptionSelect(1);
      });

      expect(mockGameActions.setSelectedOption).not.toHaveBeenCalled();
    });
  });

  describe('Incorrect answer handling', () => {
    it('should handle incorrect answer', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      act(() => {
        result.current.handleOptionSelect(1); // Incorrect answer
      });

      expect(mockGameActions.setSelectedOption).toHaveBeenCalledWith(1);
      expect(mockGameActions.setFeedback).toHaveBeenCalledWith('Incorrect, please try again.');
      expect(mockGameActions.setScore).toHaveBeenCalledWith(0); // Reset score
      expect(mockGameActions.setShowExplanation).toHaveBeenCalledWith(true);
    });

    it('should reset power surge progression on wrong answer', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      // Build up power surge (reduced for memory efficiency)
      act(() => {
        result.current.handleOptionSelect(0);
        result.current.handleOptionSelect(0);
        result.current.handleOptionSelect(0);
        result.current.handleOptionSelect(0);
        result.current.handleOptionSelect(0);
        result.current.handleOptionSelect(0); // 6th correct
      });

      expect(result.current.powerSurgeState.correctAnswersInWindow).toBe(6);
      expect(result.current.powerSurgeState.isInPowerSurge).toBe(true);

      // Wrong answer should reset
      act(() => {
        result.current.handleOptionSelect(1);
      });

      expect(result.current.powerSurgeState.correctAnswersInWindow).toBe(0);
      expect(result.current.powerSurgeState.isInPowerSurge).toBe(false);
    });
  });

  describe('Power-up handlers', () => {
    it('should skip puzzle', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      act(() => {
        result.current.powerUpHandlers.handleSkipPuzzle();
      });

      expect(mockGameActions.nextPuzzle).toHaveBeenCalled();
      expect(mockGameActions.setFeedback).toHaveBeenCalledWith('');
      expect(mockGameActions.setShowExplanation).toHaveBeenCalledWith(false);
    });

    it('should add time to power surge timer', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      const initialSeconds = result.current.powerSurgeState.seconds;

      act(() => {
        result.current.powerUpHandlers.handleAddTime();
      });

      expect(result.current.powerSurgeState.seconds).toBe(initialSeconds + 15);
    });

    it('should remove two wrong answers', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions)
      );

      act(() => {
        result.current.powerUpHandlers.handleRemoveWrongAnswers();
      });

      expect(mockGameActions.setRemovedOptions).toHaveBeenCalled();
      expect(mockGameActions.setUsedRemoveTwo).toHaveBeenCalledWith(true);

      // Verify that 2 options were removed (not the correct answer)
      const removedOptionsCall = (mockGameActions.setRemovedOptions as jest.Mock).mock.calls[0][0];
      expect(removedOptionsCall.size).toBe(2);
      expect(removedOptionsCall.has(0)).toBe(false); // Correct answer should not be removed
    });

    it('should not allow removing answers twice', () => {
      const gameState = createMockGameState({ usedRemoveTwo: true });
      const { result } = renderHook(() => 
        useGameLogic(gameState, mockGameActions)
      );

      act(() => {
        result.current.powerUpHandlers.handleRemoveWrongAnswers();
      });

      expect(mockGameActions.setRemovedOptions).not.toHaveBeenCalled();
      expect(mockGameActions.setUsedRemoveTwo).not.toHaveBeenCalled();
    });
  });

  describe('Integration with power surge timing', () => {
    it('should maintain power surge state across timer cycles', () => {
      const { result } = renderHook(() => 
        useGameLogic(mockGameState, mockGameActions, 5) // 5 second timer for faster testing
      );

      // Build up answers (unrolled for memory efficiency)
      act(() => {
        result.current.handleOptionSelect(0); // 1st
        result.current.handleOptionSelect(0); // 2nd 
        result.current.handleOptionSelect(0); // 3rd
      });

      expect(result.current.powerSurgeState.correctAnswersInWindow).toBe(3);

      // Timer reset should clear power surge
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.powerSurgeState.correctAnswersInWindow).toBe(0);
      expect(result.current.powerSurgeState.currentPowerLevel).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle setHighScore errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockGameActions.setHighScore = jest.fn().mockRejectedValue(new Error('Storage failed'));
      
      const gameState = createMockGameState({ score: 100, highScore: 99 });
      const { result } = renderHook(() => 
        useGameLogic(gameState, mockGameActions)
      );

      await act(async () => {
        result.current.handleOptionSelect(0);
        // Allow any pending promises to resolve
        await Promise.resolve();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save new high score:', expect.any(Error));
      
      consoleSpy.mockRestore();
    }, 5000); // Reduced timeout
  });
});