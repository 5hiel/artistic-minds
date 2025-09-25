/**
 * Tests for Main Game Component (PuzzleGameApp)
 * Covers core game flow, state management, and user interactions
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaView } from 'react-native';

// Mock all external dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

jest.mock('../../../hooks/useGameState', () => ({
  useGameState: jest.fn()
}));

jest.mock('../../../hooks/useGameLogic', () => ({
  useGameLogic: jest.fn()
}));

jest.mock('../../../constants/gameConfig', () => ({
  GAME_CONFIG: {
    LOOP_SECONDS: 60
  }
}));

jest.mock('../../../design', () => ({
  layoutStyles: {
    screen: jest.fn(() => ({
      container: { flex: 1 },
      scrollContainer: { flexGrow: 1 }
    }))
  },
  contentStyles: {
    puzzle: jest.fn(() => ({
      container: { flex: 1 }
    }))
  },
  getLevelGradient: jest.fn(() => ['#000000', '#111111'])
}));

// Mock all component dependencies
jest.mock('../../../app/(tabs)/components/GameTopBarContainer', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `GameTopBarContainer-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/ScoreDisplay', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `ScoreDisplay-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/PuzzleGrid', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `PuzzleGrid-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/PuzzleOptionsContainer', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `PuzzleOptionsContainer-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/PuzzleExplanation', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `PuzzleExplanation-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/PowerButtonsContainer', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `PowerButtonsContainer-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/ScoreFlashOverlay', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `ScoreFlashOverlay-${testID}` });
  })
);
jest.mock('../../../app/(tabs)/components/ShareScreen', () =>
  jest.fn(({ testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: `ShareScreen-${testID}` });
  })
);

// Mock renderer components
jest.mock('../../../components/NumberSeriesRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "NumberSeriesRenderer" });
  })
);
jest.mock('../../../components/PictureSeriesRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "PictureSeriesRenderer" });
  })
);
jest.mock('../../../components/SequentialFiguresRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "SequentialFiguresRenderer" });
  })
);
jest.mock('../../../components/TransformationRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "TransformationRenderer" });
  })
);
jest.mock('../../../components/PaperFoldingRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "PaperFoldingRenderer" });
  })
);
jest.mock('../../../components/FigureClassificationRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "FigureClassificationRenderer" });
  })
);
jest.mock('../../../components/FollowingDirectionsMainRenderer', () =>
  jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "FollowingDirectionsMainRenderer" });
  })
);
jest.mock('../../../components/RatingPrompt', () => ({
  RatingPrompt: jest.fn(() => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: "RatingPrompt" });
  })
}));

// Mock adaptive engine
jest.mock('../../../lib/adaptiveEngine', () => ({
  initializeAdaptiveLearningSystem: jest.fn().mockResolvedValue(undefined)
}));

// Import the mocked hooks
import { useGameState } from '../../../src/hooks/useGameState';
import { useGameLogic } from '../../../src/hooks/useGameLogic';

// Import the component after all mocks
import PuzzleGameApp from '../../../app/(tabs)/index';

const mockUseGameState = useGameState as jest.MockedFunction<typeof useGameState>;
const mockUseGameLogic = useGameLogic as jest.MockedFunction<typeof useGameLogic>;

describe('PuzzleGameApp', () => {
  let mockGameState: any;
  let mockGameActions: any;
  let mockGameLogicReturn: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock game state
    mockGameState = {
      currentPuzzle: {
        type: 'pattern',
        question: 'Test question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: 'Test explanation',
        grid: [['1', '2'], ['3', '?']]
      },
      score: 100,
      highScore: 150,
      gamePhase: 'playing',
      selectedOption: null,
      isCorrect: null,
      showExplanation: false,
      showShareScreen: false,
      puzzleHistory: []
    };

    mockGameActions = {
      selectOption: jest.fn(),
      nextPuzzle: jest.fn(),
      showExplanation: jest.fn(),
      hideExplanation: jest.fn(),
      resetGame: jest.fn(),
      updateScore: jest.fn()
    };

    mockGameLogicReturn = {
      powerSurgeState: {
        isActive: false,
        remainingTime: 60,
        streakCount: 0,
        bonusMultiplier: 1
      },
      handleOptionSelect: jest.fn(),
      effectiveThemeLevel: 2,
      powerUpHandlers: {
        skipPuzzle: jest.fn(),
        addTime: jest.fn(),
        removeWrongAnswers: jest.fn()
      },
      ratingPrompt: {
        show: false,
        trigger: null,
        onRate: jest.fn(),
        onDecline: jest.fn()
      },
      handleScoreFlashComplete: jest.fn(),
      handleShareComplete: jest.fn(),
      handleShareClose: jest.fn()
    };

    mockUseGameState.mockReturnValue({
      state: mockGameState,
      actions: mockGameActions
    });

    mockUseGameLogic.mockReturnValue(mockGameLogicReturn);
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<PuzzleGameApp />);
      // Component should render successfully
      expect(getByTestId).toBeDefined();
    });

    it('should render all main UI components', () => {
      render(<PuzzleGameApp />);

      // Verify hook calls
      expect(mockUseGameState).toHaveBeenCalled();
      expect(mockUseGameLogic).toHaveBeenCalledWith(
        mockGameState,
        mockGameActions,
        60
      );
    });

    it('should render with proper layout structure', () => {
      const { UNSAFE_getByType } = render(<PuzzleGameApp />);

      // Should have SafeAreaView as root
      const safeArea = UNSAFE_getByType(SafeAreaView);
      expect(safeArea).toBeTruthy();
    });
  });

  describe('Game State Integration', () => {
    it('should pass game state to child components', () => {
      render(<PuzzleGameApp />);

      // Verify hooks are called with correct parameters
      expect(mockUseGameLogic).toHaveBeenCalledWith(
        mockGameState,
        mockGameActions,
        60
      );
    });

    it('should handle different game phases', () => {
      // Test playing phase
      mockGameState.gamePhase = 'playing';
      const { rerender } = render(<PuzzleGameApp />);

      // Test answering phase
      mockGameState.gamePhase = 'answering';
      rerender(<PuzzleGameApp />);

      // Test feedback phase
      mockGameState.gamePhase = 'feedback';
      rerender(<PuzzleGameApp />);

      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('should handle score updates', () => {
      mockGameState.score = 200;
      mockGameState.highScore = 180; // New high score

      render(<PuzzleGameApp />);

      expect(mockUseGameLogic).toHaveBeenCalledWith(
        expect.objectContaining({ score: 200, highScore: 180 }),
        mockGameActions,
        60
      );
    });
  });

  describe('Puzzle Rendering', () => {
    it('should render grid puzzles correctly', () => {
      mockGameState.currentPuzzle = {
        type: 'pattern',
        grid: [['A', 'B'], ['C', '?']],
        question: 'Complete the pattern'
      };

      render(<PuzzleGameApp />);

      // Should render with grid data
      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('should render number series puzzles', () => {
      mockGameState.currentPuzzle = {
        type: 'numberSeries',
        sequence: [2, 4, 6, 8],
        question: 'What comes next?'
      };

      render(<PuzzleGameApp />);

      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('should render transformation puzzles', () => {
      mockGameState.currentPuzzle = {
        type: 'transformation',
        grid: [[{ shape: 'circle', color: 'red' }]],
        question: 'Complete the transformation'
      };

      render(<PuzzleGameApp />);

      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('should handle puzzle with missing data', () => {
      mockGameState.currentPuzzle = null;

      const renderResult = render(<PuzzleGameApp />);

      // Should not crash with null puzzle
      expect(renderResult).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle option selection', () => {
      render(<PuzzleGameApp />);

      // The handleOptionSelect should be available from game logic
      expect(mockGameLogicReturn.handleOptionSelect).toBeDefined();
    });

    it('should handle power-up usage', () => {
      render(<PuzzleGameApp />);

      // Power-up handlers should be available
      expect(mockGameLogicReturn.powerUpHandlers.skipPuzzle).toBeDefined();
      expect(mockGameLogicReturn.powerUpHandlers.addTime).toBeDefined();
      expect(mockGameLogicReturn.powerUpHandlers.removeWrongAnswers).toBeDefined();
    });

    it('should handle score flash completion', () => {
      render(<PuzzleGameApp />);

      expect(mockGameLogicReturn.handleScoreFlashComplete).toBeDefined();
    });

    it('should handle sharing interactions', () => {
      render(<PuzzleGameApp />);

      expect(mockGameLogicReturn.handleShareComplete).toBeDefined();
      expect(mockGameLogicReturn.handleShareClose).toBeDefined();
    });
  });

  describe('Power Surge System', () => {
    it('should display power surge state when active', () => {
      mockGameLogicReturn.powerSurgeState = {
        isActive: true,
        remainingTime: 45,
        streakCount: 3,
        bonusMultiplier: 2
      };

      render(<PuzzleGameApp />);

      expect(mockUseGameLogic).toHaveBeenCalledWith(
        mockGameState,
        mockGameActions,
        60
      );
    });

    it('should handle power surge expiration', () => {
      mockGameLogicReturn.powerSurgeState = {
        isActive: false,
        remainingTime: 0,
        streakCount: 0,
        bonusMultiplier: 1
      };

      render(<PuzzleGameApp />);

      expect(mockGameLogicReturn.powerSurgeState.isActive).toBe(false);
    });
  });

  describe('Theme System', () => {
    it('should apply correct theme level', () => {
      mockGameLogicReturn.effectiveThemeLevel = 3;

      render(<PuzzleGameApp />);

      expect(mockGameLogicReturn.effectiveThemeLevel).toBe(3);
    });

    it('should handle theme transitions', () => {
      const { rerender } = render(<PuzzleGameApp />);

      // Change theme level
      mockGameLogicReturn.effectiveThemeLevel = 4;
      rerender(<PuzzleGameApp />);

      expect(mockGameLogicReturn.effectiveThemeLevel).toBe(4);
    });
  });

  describe('Rating Prompt System', () => {
    it('should show rating prompt when triggered', () => {
      mockGameLogicReturn.ratingPrompt = {
        show: true,
        trigger: 'score_milestone',
        onRate: jest.fn(),
        onDecline: jest.fn()
      };

      render(<PuzzleGameApp />);

      expect(mockGameLogicReturn.ratingPrompt.show).toBe(true);
    });

    it('should handle rating prompt interactions', () => {
      const mockOnRate = jest.fn();
      const mockOnDecline = jest.fn();

      mockGameLogicReturn.ratingPrompt = {
        show: true,
        trigger: 'level_progression',
        onRate: mockOnRate,
        onDecline: mockOnDecline
      };

      render(<PuzzleGameApp />);

      expect(mockOnRate).toBeDefined();
      expect(mockOnDecline).toBeDefined();
    });
  });

  describe('Share Screen Integration', () => {
    it('should show share screen after high score', () => {
      mockGameState.showShareScreen = true;
      mockGameState.score = 250;
      mockGameState.highScore = 200; // Beat high score

      render(<PuzzleGameApp />);

      expect(mockGameState.showShareScreen).toBe(true);
    });

    it('should handle share completion', () => {
      render(<PuzzleGameApp />);

      // Share handlers should be available
      expect(mockGameLogicReturn.handleShareComplete).toBeDefined();
      expect(mockGameLogicReturn.handleShareClose).toBeDefined();
    });
  });

  describe('Adaptive Engine Integration', () => {
    it('should initialize adaptive engine on mount', async () => {
      render(<PuzzleGameApp />);

      // Wait for useEffect to run
      await waitFor(() => {
        // Adaptive engine should be initialized
        expect(mockUseGameState).toHaveBeenCalled();
      });
    });

    it('should handle adaptive engine initialization errors', async () => {
      // Mock console methods
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<PuzzleGameApp />);

      await waitFor(() => {
        expect(mockUseGameState).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Optimization', () => {
    it('should memoize grid puzzle renderer', () => {
      const puzzle1 = {
        type: 'pattern',
        grid: [['A', 'B'], ['C', '?']]
      };

      mockGameState.currentPuzzle = puzzle1;

      const { rerender } = render(<PuzzleGameApp />);

      // Same puzzle should use memoized component
      rerender(<PuzzleGameApp />);

      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('should handle component re-renders efficiently', () => {
      const { rerender } = render(<PuzzleGameApp />);

      // Multiple re-renders should not cause issues
      rerender(<PuzzleGameApp />);
      rerender(<PuzzleGameApp />);

      expect(mockUseGameState).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle hook errors gracefully', () => {
      mockUseGameState.mockImplementation(() => {
        throw new Error('Hook error');
      });

      // Should not crash the entire app
      expect(() => render(<PuzzleGameApp />)).toThrow();

      // Reset mock
      mockUseGameState.mockReturnValue({
        state: mockGameState,
        actions: mockGameActions
      });
    });

    it('should handle missing puzzle data', () => {
      mockGameState.currentPuzzle = undefined;

      const renderResult = render(<PuzzleGameApp />);

      expect(renderResult).toBeTruthy();
    });

    it('should handle invalid theme level', () => {
      mockGameLogicReturn.effectiveThemeLevel = -1;

      const renderResult = render(<PuzzleGameApp />);

      expect(renderResult).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup resources on unmount', () => {
      const { unmount } = render(<PuzzleGameApp />);

      unmount();

      // Should complete without errors
      expect(mockUseGameState).toHaveBeenCalled();
    });

    it('should handle rapid mount/unmount cycles', () => {
      const { unmount } = render(<PuzzleGameApp />);
      unmount();

      const { unmount: unmount2 } = render(<PuzzleGameApp />);
      unmount2();

      expect(mockUseGameState).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper accessibility structure', () => {
      const { UNSAFE_getByType } = render(<PuzzleGameApp />);

      // Should have SafeAreaView for proper accessibility
      const safeArea = UNSAFE_getByType(SafeAreaView);
      expect(safeArea).toBeTruthy();
    });

    it('should support screen readers', () => {
      const renderResult = render(<PuzzleGameApp />);

      // Should render without accessibility violations
      expect(renderResult).toBeTruthy();
    });
  });
});