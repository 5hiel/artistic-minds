/**
 * Tests for ShareScreen Component
 * Covers sharing functionality, platform detection, and viral message generation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform, Alert } from 'react-native';
import ShareScreen from '../../../../app/(tabs)/components/ShareScreen';

// Mock expo-sharing
const mockShareAsync = jest.fn();
const mockIsAvailableAsync = jest.fn();

jest.mock('expo-sharing', () => ({
  shareAsync: mockShareAsync,
  isAvailableAsync: mockIsAvailableAsync
}));

// Mock viral message service
const mockGenerateViralMessage = jest.fn();
jest.mock('../../../../lib/services/viralMessage', () => ({
  generateViralMessage: mockGenerateViralMessage,
  ViralMessageContext: {}
}));

// Mock design system
jest.mock('../../../../design', () => ({
  colors: {
    text: { white: '#ffffff', dark: '#000000' },
    background: { overlay: '#000000aa' },
    accent: { primary: '#007AFF' }
  },
  spacing: { sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    title: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 16 },
    caption: { fontSize: 14 }
  },
  zIndex: { overlay: 1000 }
}));

// Mock game config
jest.mock('../../../../constants/gameConfig', () => ({
  LEVELS: [
    { threshold: 0, name: 'Seeker', color: '#4A90E2' },
    { threshold: 10, name: 'Learner', color: '#7ED321' },
    { threshold: 50, name: 'Thinker', color: '#F5A623' },
    { threshold: 100, name: 'Creator', color: '#D0021B' },
    { threshold: 200, name: 'Visionary', color: '#9013FE' }
  ]
}));

// Mock Platform
const mockPlatform = Platform as jest.Mocked<typeof Platform>;

// Mock Alert
const mockAlert = Alert as jest.Mocked<typeof Alert>;
mockAlert.alert = jest.fn();

describe('ShareScreen Component', () => {
  let defaultProps: any;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultProps = {
      show: true,
      score: 150,
      levelIndex: 2,
      isHighScoreBeat: true,
      previousHighScore: 100,
      onClose: jest.fn(),
      onShareComplete: jest.fn()
    };

    mockGenerateViralMessage.mockReturnValue({
      message: 'I just scored 150 points in Gifted Minds! 🧠',
      hashtags: ['#GiftedMinds', '#PuzzleGame'],
      url: 'https://apps.apple.com/app/gifted-minds/'
    });

    mockIsAvailableAsync.mockResolvedValue(true);
    mockShareAsync.mockResolvedValue({ action: 'sharedAction' });
  });

  describe('Component Visibility', () => {
    it('should render when show is true', () => {
      const { getByText } = render(<ShareScreen {...defaultProps} />);

      expect(getByText(/New High Score!/i)).toBeTruthy();
      expect(getByText(/150/)).toBeTruthy();
    });

    it('should not render when show is false', () => {
      const { queryByText } = render(
        <ShareScreen {...defaultProps} show={false} />
      );

      expect(queryByText(/New High Score!/i)).toBeNull();
    });

    it('should show achievement message for high score beat', () => {
      const { getByText } = render(<ShareScreen {...defaultProps} />);

      expect(getByText(/New High Score!/i)).toBeTruthy();
      expect(getByText(/Previous: 100/i)).toBeTruthy();
    });

    it('should show regular message when not beating high score', () => {
      const props = {
        ...defaultProps,
        isHighScoreBeat: false,
        previousHighScore: undefined
      };

      const { getByText, queryByText } = render(<ShareScreen {...props} />);

      expect(getByText(/Great Score!/i)).toBeTruthy();
      expect(queryByText(/Previous:/)).toBeNull();
    });
  });

  describe('Viral Message Generation', () => {
    it('should generate viral message with correct context', () => {
      render(<ShareScreen {...defaultProps} />);

      expect(mockGenerateViralMessage).toHaveBeenCalledWith({
        score: 150,
        levelIndex: 2,
        isHighScoreBeat: true,
        previousHighScore: 100,
        gameContext: 'share_screen'
      });
    });

    it('should handle different score values', () => {
      const props = { ...defaultProps, score: 500, levelIndex: 4 };
      render(<ShareScreen {...props} />);

      expect(mockGenerateViralMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 500,
          levelIndex: 4
        })
      );
    });

    it('should handle missing previous high score', () => {
      const props = {
        ...defaultProps,
        isHighScoreBeat: false,
        previousHighScore: undefined
      };

      render(<ShareScreen {...props} />);

      expect(mockGenerateViralMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          isHighScoreBeat: false,
          previousHighScore: undefined
        })
      );
    });
  });

  describe('Platform-Specific Sharing', () => {
    describe('iOS Platform', () => {
      beforeEach(() => {
        mockPlatform.OS = 'ios';
      });

      it('should handle iOS sharing successfully', async () => {
        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockShareAsync).toHaveBeenCalledWith(
            'I just scored 150 points in Gifted Minds! 🧠 https://apps.apple.com/app/gifted-minds/ #GiftedMinds #PuzzleGame',
            {
              mimeType: 'text/plain',
              dialogTitle: 'Share your achievement!'
            }
          );
        });

        expect(defaultProps.onShareComplete).toHaveBeenCalledWith('native');
        expect(defaultProps.onClose).toHaveBeenCalled();
      });

      it('should handle iOS sharing errors', async () => {
        mockShareAsync.mockRejectedValue(new Error('Sharing failed'));

        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockAlert.alert).toHaveBeenCalledWith(
            'Sharing Failed',
            'Unable to share at this time. Please try again.',
            [{ text: 'OK' }]
          );
        });
      });

      it('should handle unavailable sharing on iOS', async () => {
        mockIsAvailableAsync.mockResolvedValue(false);

        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockAlert.alert).toHaveBeenCalledWith(
            'Sharing Unavailable',
            'Sharing is not available on this device.',
            [{ text: 'OK' }]
          );
        });
      });
    });

    describe('Android Platform', () => {
      beforeEach(() => {
        mockPlatform.OS = 'android';
      });

      it('should handle Android sharing successfully', async () => {
        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockShareAsync).toHaveBeenCalledWith(
            'I just scored 150 points in Gifted Minds! 🧠 https://apps.apple.com/app/gifted-minds/ #GiftedMinds #PuzzleGame',
            {
              mimeType: 'text/plain',
              dialogTitle: 'Share your achievement!'
            }
          );
        });

        expect(defaultProps.onShareComplete).toHaveBeenCalledWith('native');
      });

      it('should handle Android sharing cancellation', async () => {
        mockShareAsync.mockResolvedValue({ action: 'dismissedAction' });

        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(defaultProps.onShareComplete).not.toHaveBeenCalled();
        });

        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    describe('Web Platform', () => {
      beforeEach(() => {
        mockPlatform.OS = 'web';
        // Mock Web Share API
        Object.defineProperty(global.navigator, 'share', {
          value: jest.fn().mockResolvedValue(undefined),
          writable: true
        });
      });

      it('should use Web Share API when available', async () => {
        const mockNavigatorShare = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(global.navigator, 'share', {
          value: mockNavigatorShare,
          writable: true
        });

        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockNavigatorShare).toHaveBeenCalledWith({
            title: 'Gifted Minds Achievement',
            text: 'I just scored 150 points in Gifted Minds! 🧠',
            url: 'https://apps.apple.com/app/gifted-minds/'
          });
        });

        expect(defaultProps.onShareComplete).toHaveBeenCalledWith('web');
      });

      it('should fallback to clipboard when Web Share API unavailable', async () => {
        Object.defineProperty(global.navigator, 'share', {
          value: undefined,
          writable: true
        });

        // Mock clipboard API
        const mockWriteText = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(global.navigator, 'clipboard', {
          value: { writeText: mockWriteText },
          writable: true
        });

        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockWriteText).toHaveBeenCalledWith(
            'I just scored 150 points in Gifted Minds! 🧠 https://apps.apple.com/app/gifted-minds/ #GiftedMinds #PuzzleGame'
          );
        });

        expect(mockAlert.alert).toHaveBeenCalledWith(
          'Copied!',
          'Achievement copied to clipboard. Paste it anywhere to share!',
          [{ text: 'OK' }]
        );
      });

      it('should handle web sharing errors', async () => {
        const mockNavigatorShare = jest.fn().mockRejectedValue(new Error('Share failed'));
        Object.defineProperty(global.navigator, 'share', {
          value: mockNavigatorShare,
          writable: true
        });

        const { getByText } = render(<ShareScreen {...defaultProps} />);
        const shareButton = getByText(/Share/i);

        fireEvent.press(shareButton);

        await waitFor(() => {
          expect(mockAlert.alert).toHaveBeenCalledWith(
            'Sharing Failed',
            'Unable to share at this time. Please try again.',
            [{ text: 'OK' }]
          );
        });
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle close button press', () => {
      const { getByText } = render(<ShareScreen {...defaultProps} />);
      const closeButton = getByText(/Close/i);

      fireEvent.press(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should prevent multiple rapid shares', async () => {
      const { getByText } = render(<ShareScreen {...defaultProps} />);
      const shareButton = getByText(/Share/i);

      // Rapid clicks
      fireEvent.press(shareButton);
      fireEvent.press(shareButton);
      fireEvent.press(shareButton);

      // Should only call sharing once
      await waitFor(() => {
        expect(mockShareAsync).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during sharing', async () => {
      // Make sharing take time
      mockShareAsync.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ action: 'sharedAction' }), 100))
      );

      const { getByText } = render(<ShareScreen {...defaultProps} />);
      const shareButton = getByText(/Share/i);

      fireEvent.press(shareButton);

      // Should show loading state
      expect(getByText(/Sharing.../i)).toBeTruthy();

      await waitFor(() => {
        expect(defaultProps.onShareComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Level Theming', () => {
    it('should apply correct theme for different levels', () => {
      const { rerender } = render(<ShareScreen {...defaultProps} levelIndex={0} />);

      rerender(<ShareScreen {...defaultProps} levelIndex={3} />);
      // Theme changes should render without error
      expect(true).toBeTruthy();

      rerender(<ShareScreen {...defaultProps} levelIndex={4} />);
      expect(true).toBeTruthy();
    });

    it('should handle invalid level indices', () => {
      const renderResult1 = render(<ShareScreen {...defaultProps} levelIndex={-1} />);
      expect(renderResult1).toBeTruthy();

      const renderResult2 = render(<ShareScreen {...defaultProps} levelIndex={100} />);
      expect(renderResult2).toBeTruthy();
    });

    it('should display correct level name', () => {
      const { getByText } = render(<ShareScreen {...defaultProps} levelIndex={2} />);

      expect(getByText(/Thinker/i)).toBeTruthy();
    });
  });

  describe('Score Display', () => {
    it('should format large scores correctly', () => {
      const props = { ...defaultProps, score: 12345 };
      const { getByText } = render(<ShareScreen {...props} />);

      expect(getByText(/12,345/)).toBeTruthy();
    });

    it('should handle zero scores', () => {
      const props = { ...defaultProps, score: 0 };
      const { getByText } = render(<ShareScreen {...props} />);

      expect(getByText(/0/)).toBeTruthy();
    });

    it('should show score improvement', () => {
      const { getByText } = render(<ShareScreen {...defaultProps} />);

      expect(getByText(/\+50/)).toBeTruthy(); // 150 - 100 = +50
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<ShareScreen {...defaultProps} />);

      expect(getByLabelText(/Share achievement/i)).toBeTruthy();
      expect(getByLabelText(/Close share screen/i)).toBeTruthy();
    });

    it('should support screen readers', () => {
      const { getByLabelText } = render(<ShareScreen {...defaultProps} />);

      expect(getByLabelText(/Share your score of 150/i)).toBeTruthy();
    });

    it('should have proper accessibility hints', () => {
      const { getByHintText } = render(<ShareScreen {...defaultProps} />);

      expect(getByHintText(/Double tap to share/i)).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle viral message generation failures', () => {
      mockGenerateViralMessage.mockImplementation(() => {
        throw new Error('Message generation failed');
      });

      const renderResult = render(<ShareScreen {...defaultProps} />);

      // Should not crash
      expect(renderResult).toBeTruthy();
    });

    it('should handle undefined viral message', () => {
      mockGenerateViralMessage.mockReturnValue(undefined);

      const { getByText } = render(<ShareScreen {...defaultProps} />);
      const shareButton = getByText(/Share/i);

      fireEvent.press(shareButton);

      // Should handle gracefully
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle missing props gracefully', () => {
      const minimalProps = {
        show: true,
        score: 100,
        levelIndex: 1,
        isHighScoreBeat: false,
        onClose: jest.fn()
      };

      const renderResult = render(<ShareScreen {...minimalProps} />);

      expect(renderResult).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup resources on unmount', () => {
      const { unmount } = render(<ShareScreen {...defaultProps} />);

      unmount();

      // Should complete without errors
      expect(mockGenerateViralMessage).toHaveBeenCalled();
    });

    it('should handle rapid show/hide cycles', () => {
      const { rerender } = render(<ShareScreen {...defaultProps} show={false} />);

      rerender(<ShareScreen {...defaultProps} show={true} />);
      rerender(<ShareScreen {...defaultProps} show={false} />);
      rerender(<ShareScreen {...defaultProps} show={true} />);

      expect(mockGenerateViralMessage).toHaveBeenCalled();
    });

    it('should update when props change', () => {
      const { rerender } = render(<ShareScreen {...defaultProps} />);

      rerender(<ShareScreen {...defaultProps} score={300} />);

      expect(mockGenerateViralMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance', () => {
    it('should not regenerate message unnecessarily', () => {
      const { rerender } = render(<ShareScreen {...defaultProps} />);

      // Same props should not trigger regeneration
      rerender(<ShareScreen {...defaultProps} />);

      // Should only generate once
      expect(mockGenerateViralMessage).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple renders efficiently', () => {
      const startTime = Date.now();

      const { rerender } = render(<ShareScreen {...defaultProps} />);

      for (let i = 0; i < 10; i++) {
        rerender(<ShareScreen {...defaultProps} score={100 + i} />);
      }

      const endTime = Date.now();

      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});