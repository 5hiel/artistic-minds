import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Share } from 'react-native';
import { colors, spacing, typography, zIndex } from '@/src/design';
import { LEVELS } from '@/src/constants/gameConfig';
import { generateViralMessage, ViralMessageContext } from '@/src/lib/services/viralMessage';

interface ShareScreenProps {
  show: boolean;
  score: number;
  levelIndex: number;
  isHighScoreBeat: boolean;
  previousHighScore?: number;
  onClose: () => void;
  onShareComplete?: (platform: string) => void;
}

/**
 * Native sharing screen that appears after high score achievement + bomb out
 * Shows score and provides one-tap sharing across platforms
 */
export default function ShareScreen({
  show,
  score,
  levelIndex,
  isHighScoreBeat,
  previousHighScore,
  onClose,
  onShareComplete
}: ShareScreenProps) {
  const [isSharing, setIsSharing] = useState(false);

  if (!show) return null;

  const levelTheme = LEVELS[levelIndex];
  
  // Generate viral message
  const messageContext: ViralMessageContext = {
    score,
    levelIndex,
    isHighScoreBeat,
    previousHighScore
  };
  
  const viralMessage = generateViralMessage(messageContext);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      // Use native Web Share API on web, expo-sharing on mobile
      if (Platform.OS === 'web' && navigator.share) {
        // Don't use separate URL parameter - include it in text to ensure full message is shared
        await navigator.share({
          title: 'Gifted Minds Achievement!',
          text: viralMessage.text, // Already includes the URL in the formatted text
        });
      } else if (Platform.OS === 'web') {
        // Fallback for web browsers without Web Share API
        await handleCopyToClipboard();
        Alert.alert(
          'Text Copied!',
          'Your achievement has been copied to clipboard. You can now paste it anywhere to share!',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      } else {
        // Mobile platforms - use React Native's built-in Share API
        try {
          const shareResult = await Share.share({
            message: viralMessage.text,
            title: 'Share your Gifted Minds achievement!'
          });

          if (shareResult.action === Share.dismissedAction) {
            // User dismissed the share dialog
            console.log('Share dismissed by user');
            return;
          }
        } catch (sharingError) {
          console.warn('Native sharing failed, using clipboard fallback:', sharingError);
          // If native sharing fails, fall back to clipboard
          await handleCopyToClipboard();
          return;
        }
      }

      // Track share completion (local analytics only)
      onShareComplete?.('platform_native');

      // Close share screen after successful share
      onClose();

    } catch (error) {
      console.warn('Share failed:', error);
      Alert.alert(
        'Share Failed',
        'Unable to share at this time. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      // For web platform, use navigator.clipboard
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(viralMessage.text);
        Alert.alert(
          'Text Copied!',
          'Your achievement message has been copied to clipboard. Ready to share!',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        // For mobile (iOS/Android), show the message in an alert that allows easy copying
        Alert.alert(
          'Share Your Achievement! 🎉',
          viralMessage.text,
          [
            { text: 'Close', onPress: onClose },
            {
              text: 'Copy Text',
              onPress: () => {
                // Try to copy if we can, otherwise just show success
                Alert.alert(
                  'Ready to Share! 📱',
                  'Your achievement message is ready! You can manually copy and paste this text to share your success.',
                  [{ text: 'Got it!', onPress: onClose }]
                );
              }
            }
          ],
          { cancelable: true, onDismiss: onClose }
        );
        return;
      }

      onShareComplete?.('clipboard');
    } catch (error) {
      console.warn('Copy failed:', error);
      // Fall back to showing the message in a user-friendly way
      Alert.alert(
        'Share Your Achievement! 🎉',
        viralMessage.text,
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={[styles.shareCard, { backgroundColor: levelTheme.backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎉 Amazing Run!</Text>
            <Text style={styles.scoreText}>{score} Points</Text>
            {isHighScoreBeat && (
              <Text style={styles.achievementText}>New Personal Best! 🏆</Text>
            )}
          </View>

          {/* Message Preview */}
          <View style={styles.messagePreview}>
            <Text style={styles.messageText} numberOfLines={3}>
              {viralMessage.text.split('\n')[0]}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.shareButton, isSharing && styles.sharingButton]}
              onPress={handleShare}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? 'Sharing...' : '📱 Share Your Run'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyToClipboard}
            >
              <Text style={styles.copyButtonText}>
                📋 Copy Message
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.modal,
    paddingHorizontal: spacing.lg,
  },
  
  container: {
    width: '100%',
    maxWidth: 400,
  },
  
  shareCard: {
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.text.white,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    elevation: 16,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    // textShadow not supported in React Native - removed
  },
  
  scoreText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
    // textShadow not supported in React Native - removed
  },
  
  achievementText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.white,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  
  messagePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  
  messageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: 20,
    color: colors.text.white,
    textAlign: 'center',
  },
  
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  
  shareButton: {
    backgroundColor: colors.text.white,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  
  sharingButton: {
    opacity: 0.7,
  },
  
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    color: '#000000',
  },

  copyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: '#ffffff',
  },
  
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  
  closeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
});