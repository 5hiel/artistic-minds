import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../src/hooks/useGameState';
import { HighScoreStorage } from '../../src/lib/storage/highScore';
import { intelligentPuzzleEngine } from '../../src/lib/engine';

// Mock dependencies
jest.mock('../../src/lib/storage/highScore');
jest.mock('../../src/lib/engine');

const mockHighScoreStorage = HighScoreStorage as jest.Mocked<typeof HighScoreStorage>;
const mockIntelligentPuzzleEngine = intelligentPuzzleEngine as jest.Mocked<typeof intelligentPuzzleEngine>;

describe('useGameState Hook', () => {
  const mockPuzzle = {
    question: 'Test question',
    grid: [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', '?']
    ],
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0,
    explanation: 'Test explanation',
    patternType: 'test-pattern',
    puzzleType: 'pattern',
    puzzleSubtype: 'grid',
    difficultyLevel: 'medium' as const
  };

  const mockRecommendation = {
    puzzle: mockPuzzle,
    dna: {
      puzzleId: 'test-puzzle-id',
      puzzleType: 'pattern',
      accuracy: 0.5,
      speed: 0.5,
      difficulty: 0.5,
      complexity: 0.5,
      patternType: 'test-pattern',
      timestamp: Date.now(),
      userEngagement: 0.8,
      successRate: 0.7,
      generatedAt: Date.now()
    },
    selectionReason: 'Test recommendation',
    confidenceScore: 0.8
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHighScoreStorage.getHighScore.mockResolvedValue(100);
    mockHighScoreStorage.setHighScore.mockResolvedValue();
    mockIntelligentPuzzleEngine.getNextPuzzle.mockResolvedValue(mockRecommendation);
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.state.score).toBe(0);
      expect(result.current.state.highScore).toBe(0);
      expect(result.current.state.currentPuzzle).toBeDefined();
      expect(result.current.state.selectedOption).toBe(null);
      expect(result.current.state.feedback).toBe('');
      expect(result.current.state.showFlash).toBe(false);
      expect(result.current.state.showExplanation).toBe(false);
      expect(result.current.state.removedOptions).toEqual(new Set());
      expect(result.current.state.usedRemoveTwo).toBe(false);
    });

    it('should load high score from storage on mount', async () => {
      const { result } = renderHook(() => useGameState());

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockHighScoreStorage.getHighScore).toHaveBeenCalledTimes(1);
      expect(result.current.state.highScore).toBe(100);
    });

    it('should generate initial puzzle', () => {
      renderHook(() => useGameState());
      expect(mockIntelligentPuzzleEngine.getNextPuzzle).toHaveBeenCalledTimes(1);
    });
  });

  describe('State setters', () => {
    it('should update score', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.setScore(50);
      });

      expect(result.current.state.score).toBe(50);
    });

    it('should update high score and persist to storage', async () => {
      const { result } = renderHook(() => useGameState());

      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.actions.setHighScore(150);
      });

      expect(result.current.state.highScore).toBe(150);
      expect(mockHighScoreStorage.setHighScore).toHaveBeenCalledWith(150);
    });

    it('should update current puzzle', () => {
      const { result } = renderHook(() => useGameState());
      const newPuzzle = { ...mockPuzzle, id: 'new-puzzle' };

      act(() => {
        result.current.actions.setCurrentPuzzle(newPuzzle);
      });

      expect(result.current.state.currentPuzzle).toBe(newPuzzle);
    });

    it('should update selected option', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.setSelectedOption(2);
      });

      expect(result.current.state.selectedOption).toBe(2);
    });

    it('should update feedback', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.setFeedback('Correct!');
      });

      expect(result.current.state.feedback).toBe('Correct!');
    });

    it('should update show flash', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.setShowFlash(true);
      });

      expect(result.current.state.showFlash).toBe(true);
    });

    it('should update show explanation', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.setShowExplanation(true);
      });

      expect(result.current.state.showExplanation).toBe(true);
    });

    it('should update removed options', () => {
      const { result } = renderHook(() => useGameState());
      const removedSet = new Set([1, 2]);

      act(() => {
        result.current.actions.setRemovedOptions(removedSet);
      });

      expect(result.current.state.removedOptions).toBe(removedSet);
    });

    it('should update used remove two', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.setUsedRemoveTwo(true);
      });

      expect(result.current.state.usedRemoveTwo).toBe(true);
    });
  });

  describe('Game actions', () => {
    it('should reset game state', async () => {
      const { result } = renderHook(() => useGameState());

      // Set some state first
      act(() => {
        result.current.actions.setScore(100);
        result.current.actions.setSelectedOption(2);
        result.current.actions.setFeedback('Test feedback');
        result.current.actions.setShowFlash(true);
        result.current.actions.setShowExplanation(true);
        result.current.actions.setRemovedOptions(new Set([1, 2]));
        result.current.actions.setUsedRemoveTwo(true);
      });

      // Reset the game
      await act(async () => {
        await result.current.actions.resetGame();
      });

      expect(result.current.state.score).toBe(0);
      expect(result.current.state.selectedOption).toBe(null);
      expect(result.current.state.feedback).toBe('');
      expect(result.current.state.showFlash).toBe(false);
      expect(result.current.state.showExplanation).toBe(false);
      expect(result.current.state.removedOptions).toEqual(new Set());
      expect(result.current.state.usedRemoveTwo).toBe(false);
      expect(mockIntelligentPuzzleEngine.getNextPuzzle).toHaveBeenCalledTimes(2); // Initial + reset
    });

    it('should move to next puzzle', async () => {
      const { result } = renderHook(() => useGameState());

      // Set some state first
      act(() => {
        result.current.actions.setSelectedOption(2);
        result.current.actions.setFeedback('Test feedback');
        result.current.actions.setShowFlash(true);
        result.current.actions.setShowExplanation(true);
        result.current.actions.setRemovedOptions(new Set([1, 2]));
        result.current.actions.setUsedRemoveTwo(true);
      });

      // Go to next puzzle
      await act(async () => {
        await result.current.actions.nextPuzzle();
      });

      expect(result.current.state.selectedOption).toBe(null);
      expect(result.current.state.feedback).toBe('');
      expect(result.current.state.showFlash).toBe(false);
      expect(result.current.state.showExplanation).toBe(false);
      expect(result.current.state.removedOptions).toEqual(new Set());
      expect(result.current.state.usedRemoveTwo).toBe(false);
      expect(mockIntelligentPuzzleEngine.getNextPuzzle).toHaveBeenCalledTimes(2); // Initial + next
    });
  });

  describe('Error handling', () => {
    it('should handle high score storage failure gracefully', async () => {
      mockHighScoreStorage.getHighScore.mockRejectedValue(new Error('Storage failed'));
      
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should keep default high score when storage fails
      expect(result.current.state.highScore).toBe(0);
    });

    it('should handle set high score failure gracefully', async () => {
      mockHighScoreStorage.setHighScore.mockRejectedValue(new Error('Storage failed'));
      
      const { result } = renderHook(() => useGameState());

      // Should handle error gracefully
      await act(async () => {
        try {
          await result.current.actions.setHighScore(200);
        } catch (error) {
          // Expected to catch error but not crash the hook
        }
      });
    });
  });
});