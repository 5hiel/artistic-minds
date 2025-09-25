import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { THEME } from '@/src/constants/gameConfig';
import { shadows } from '@/src/design/tokens';
import { RatingPromptActions, RatingPromptState } from '@/src/hooks/useRatingPrompt';

export interface RatingPromptProps {
  state: RatingPromptState;
  actions: RatingPromptActions;
}

/**
 * Web fallback component for rating prompts when native rating is not available
 * Displays a modal with rating options and store links
 */
export function RatingPrompt({ state, actions }: RatingPromptProps) {
  const modalBackgroundColor = useThemeColor({ light: '#F7FAFC', dark: THEME.colors.background.secondary }, 'background');
  const borderColor = useThemeColor({ light: '#E2E8F0', dark: THEME.colors.background.tertiary }, 'background');

  if (!state.shouldShow || !state.context) {
    return null;
  }

  const handleRate = async () => {
    // Try native rating first, fallback to store if needed
    const nativeSuccess = await actions.showPrompt();
    if (!nativeSuccess && Platform.OS === 'web') {
      // Web platform - open store link
      await actions.openStoreForRating();
    }
  };

  const handleMaybeLater = () => {
    actions.dismiss();
  };

  const handleDontAskAgain = async () => {
    await actions.decline();
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleMaybeLater}
    >
      <View style={styles.overlay}>
        <ThemedView style={[styles.container, { backgroundColor: modalBackgroundColor, borderColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              ⭐ Rate Gifted Minds
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              {state.context.reason}
            </ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ThemedText style={styles.description}>
              Your feedback helps us improve the game and reach more puzzle enthusiasts!
            </ThemedText>

            {Platform.OS === 'web' && (
              <ThemedText style={styles.webNote}>
                We&apos;ll redirect you to the app store to leave your review.
              </ThemedText>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleRate}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                ⭐ Rate Now
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleMaybeLater}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>
                  Maybe Later
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.tertiaryButton]} 
                onPress={handleDontAskAgain}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.buttonText, styles.tertiaryButtonText]}>
                  Don&apos;t Ask Again
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  container: {
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    padding: THEME.spacing.xl,
    maxWidth: 400,
    width: '100%',
    ...shadows.neumorphic.container,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
    fontSize: THEME.fontSize.xxl,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: THEME.fontSize.lg,
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  description: {
    textAlign: 'center',
    fontSize: THEME.fontSize.md,
    lineHeight: 24,
    marginBottom: THEME.spacing.md,
    opacity: 0.9,
  },
  webNote: {
    textAlign: 'center',
    fontSize: THEME.fontSize.sm,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  actions: {
    gap: THEME.spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  button: {
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
    ...shadows.subtle,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.text.secondary,
    flex: 1,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  buttonText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: THEME.colors.text.secondary,
  },
  tertiaryButtonText: {
    color: THEME.colors.text.secondary,
    opacity: 0.7,
    fontSize: THEME.fontSize.sm,
  },
});