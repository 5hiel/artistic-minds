/**
 * Unit tests for GameTopBarContainer component
 * Tests rendering, props handling, and layout structure
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock dependencies
jest.mock('../../../../design', () => ({
  cardStyles: {
    status: jest.fn(() => ({
      container: { padding: 10, backgroundColor: '#fff' },
      text: { fontSize: 16, color: '#000' },
      label: { fontSize: 12, color: '#666' }
    }))
  },
  layoutStyles: {
    section: jest.fn(() => ({
      centeredContainer: { flexDirection: 'row', justifyContent: 'center' }
    }))
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24
  }
}));

jest.mock('../../../../app/(tabs)/components/Level', () => {
  return jest.fn(({ index, levelIndex }) => {
    const mockReact = require('react');
    const { Text } = require('react-native');
    const levels = ['SEEKER', 'LEARNER', 'THINKER', 'CREATOR', 'VISIONARY'];
    const safeLevel = Math.max(0, Math.min(index, levels.length - 1));
    return mockReact.createElement(Text, {
      testID: 'level-component',
      'data-level': safeLevel,
      'data-level-index': levelIndex
    }, levels[safeLevel]);
  });
});

// Import component after mocks
import GameTopBarContainer from '../../../../app/(tabs)/components/GameTopBarContainer';

// Debug the import
console.log('GameTopBarContainer import:', GameTopBarContainer);
console.log('GameTopBarContainer type:', typeof GameTopBarContainer);

describe('GameTopBarContainer', () => {
  const defaultProps = {
    highScore: 1500,
    levelIndex: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const renderResult = render(<GameTopBarContainer {...defaultProps} />);
      expect(renderResult.toJSON()).toBeTruthy();
    });

    it('should display the high score', () => {
      render(<GameTopBarContainer {...defaultProps} />);
      expect(screen.getByText('1500')).toBeTruthy();
      expect(screen.getByText('HIGH SCORE')).toBeTruthy();
    });

    it('should display the level label', () => {
      render(<GameTopBarContainer {...defaultProps} />);
      expect(screen.getByText('LEVEL')).toBeTruthy();
    });

    it('should render the Level component with correct props', () => {
      render(<GameTopBarContainer {...defaultProps} />);
      const levelComponent = screen.getByTestId('level-component');
      expect(levelComponent).toBeTruthy();
      expect(levelComponent.props['data-level']).toBe(2);
      expect(levelComponent.props['data-level-index']).toBe(2);
    });
  });

  describe('Props Handling', () => {
    it('should handle different high score values', () => {
      const { rerender } = render(<GameTopBarContainer highScore={0} levelIndex={0} />);
      expect(screen.getByText('0')).toBeTruthy();

      rerender(<GameTopBarContainer highScore={999999} levelIndex={0} />);
      expect(screen.getByText('999999')).toBeTruthy();
    });

    it('should handle different level indices', () => {
      const { rerender } = render(<GameTopBarContainer highScore={100} levelIndex={0} />);
      let levelComponent = screen.getByTestId('level-component');
      expect(levelComponent.props['data-level-index']).toBe(0);

      rerender(<GameTopBarContainer highScore={100} levelIndex={4} />);
      levelComponent = screen.getByTestId('level-component');
      expect(levelComponent.props['data-level-index']).toBe(4);
    });

    it('should pass levelIndex to both Level component and style functions', () => {
      const { cardStyles, layoutStyles } = require('../../../../design');

      render(<GameTopBarContainer highScore={200} levelIndex={3} />);

      expect(cardStyles.status).toHaveBeenCalledWith(3);
      expect(layoutStyles.section).toHaveBeenCalledWith(3);
    });
  });

  describe('Layout Structure', () => {
    it('should have the correct container structure', () => {
      const renderResult = render(<GameTopBarContainer {...defaultProps} />);
      const component = renderResult.toJSON();

      // Should have main container with row layout
      expect(component.props.style).toEqual(
        expect.objectContaining({
          flexDirection: 'row',
          justifyContent: 'center'
        })
      );
    });

    it('should have two main sections (high score and level)', () => {
      const renderResult = render(<GameTopBarContainer {...defaultProps} />);
      const component = renderResult.toJSON();

      // Should have exactly 2 child containers
      expect(component.children).toHaveLength(2);
    });

    it('should apply correct spacing to containers', () => {
      const renderResult = render(<GameTopBarContainer {...defaultProps} />);
      const component = renderResult.toJSON();

      const highScoreContainer = component.children[0];
      const levelContainer = component.children[1];

      // High score container should have right margin
      expect(highScoreContainer.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marginRight: 8 })
        ])
      );

      // Level container should have left margin
      expect(levelContainer.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marginLeft: 8 })
        ])
      );
    });
  });

  describe('Style Integration', () => {
    it('should call design system functions with correct parameters', () => {
      const { cardStyles, layoutStyles } = require('../../../../design');

      render(<GameTopBarContainer highScore={500} levelIndex={1} />);

      expect(cardStyles.status).toHaveBeenCalledWith(1);
      expect(layoutStyles.section).toHaveBeenCalledWith(1);
    });

    it('should apply styles from design system', () => {
      const renderResult = render(<GameTopBarContainer {...defaultProps} />);
      const component = renderResult.toJSON();
      const highScoreContainer = component.children[0];

      // Should apply container styles from design system
      expect(highScoreContainer.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 10,
            backgroundColor: '#fff'
          })
        ])
      );
    });
  });

  describe('Text Content', () => {
    it('should display high score as string', () => {
      render(<GameTopBarContainer highScore={12345} levelIndex={0} />);
      expect(screen.getByText('12345')).toBeTruthy();
    });

    it('should display labels in correct case', () => {
      render(<GameTopBarContainer {...defaultProps} />);
      expect(screen.getByText('HIGH SCORE')).toBeTruthy();
      expect(screen.getByText('LEVEL')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero high score', () => {
      render(<GameTopBarContainer highScore={0} levelIndex={0} />);
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should handle negative level index', () => {
      render(<GameTopBarContainer highScore={100} levelIndex={-1} />);
      const levelComponent = screen.getByTestId('level-component');
      expect(levelComponent.props['data-level-index']).toBe(-1);
    });

    it('should handle very large high scores', () => {
      const largeScore = 999999999;
      render(<GameTopBarContainer highScore={largeScore} levelIndex={0} />);
      expect(screen.getByText(largeScore.toString())).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should pass both index and levelIndex to Level component', () => {
      render(<GameTopBarContainer highScore={100} levelIndex={2} />);
      const levelComponent = screen.getByTestId('level-component');

      // Both props should be passed with the same value (levelIndex)
      expect(levelComponent.props['data-level']).toBe(2);
      expect(levelComponent.props['data-level-index']).toBe(2);
    });

    it('should maintain Level component functionality', () => {
      render(<GameTopBarContainer highScore={100} levelIndex={1} />);

      // Should display the correct level text (LEARNER for index 1)
      expect(screen.getByText('LEARNER')).toBeTruthy();
    });
  });
});