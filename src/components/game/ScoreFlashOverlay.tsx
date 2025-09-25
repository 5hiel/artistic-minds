import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography, zIndex } from '@/src/design';
import { LEVELS } from '@/src/constants/gameConfig';

interface ScoreFlashOverlayProps {
  show: boolean;
  score: number;
  isHighScoreBeat?: boolean;
  levelIndex?: number;
  onComplete?: () => void;
}

/**
 * Two-tier flash system:
 * - Simple flash: Shows final score before reset (bomb-out)
 * - Celebration flash: Animated high score achievement celebration
 */
export default function ScoreFlashOverlay({ 
  show, 
  score, 
  isHighScoreBeat = false, 
  levelIndex = 0,
  onComplete 
}: ScoreFlashOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Store onComplete in a ref to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (show && !isAnimating) {
      console.log('🎭 ScoreFlashOverlay: Showing with score:', score, 'isHighScore:', isHighScoreBeat);
      setIsAnimating(true);
      
      // Clear any existing timer
      if (timerRef.current) {
        console.log('🧹 ScoreFlashOverlay: Clearing existing timer');
        clearTimeout(timerRef.current as number);
        timerRef.current = null;
      }
      
      // Simple show-then-fade animation (no complex flashing)
      fadeAnim.setValue(1); // Show immediately
      scaleAnim.setValue(1); // Full size immediately
      
      // Wait for display duration, then fade out
      const displayDuration = isHighScoreBeat ? 2000 : 1500;
      console.log('⏰ ScoreFlashOverlay: Will fade after', displayDuration, 'ms');
      
      timerRef.current = setTimeout(() => {
        console.log('🌅 ScoreFlashOverlay: Starting fade out...');
        // Fade out smoothly
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }).start(() => {
          console.log('✅ ScoreFlashOverlay: Fade complete, calling onComplete');
          setIsAnimating(false);
          timerRef.current = null;
          onCompleteRef.current?.();
        });
      }, displayDuration) as unknown as number;

    } else if (!show) {
      console.log('👻 ScoreFlashOverlay: Hidden, resetting');
      setIsAnimating(false);
      
      // Clear any pending timer
      if (timerRef.current) {
        console.log('🧹 ScoreFlashOverlay: Cleaning up timer');
        clearTimeout(timerRef.current as number);
        timerRef.current = null;
      }
      
      // Reset when hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(1);
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        console.log('🧹 ScoreFlashOverlay: Cleaning up timer on unmount');
        clearTimeout(timerRef.current as number);
        timerRef.current = null;
      }
    };
  }, [show, isHighScoreBeat, fadeAnim, scaleAnim]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  const levelTheme = LEVELS[levelIndex];
  const containerStyle = isHighScoreBeat ? styles.celebrationContainer : styles.simpleContainer;
  const overlayStyle = isHighScoreBeat 
    ? [styles.celebrationOverlay, { backgroundColor: levelTheme.backgroundColor }]
    : styles.simpleOverlay;

  return (
    <View style={styles.flashContainer}>
      <Animated.View 
        style={[
          containerStyle,
          overlayStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Simple celebration decoration */}
        {isHighScoreBeat && (
          <View style={styles.sparkleContainer}>
            <Text style={styles.sparkle}>🎉</Text>
          </View>
        )}

        {/* Main content */}
        <View style={styles.contentContainer}>
          {isHighScoreBeat && (
            <Text style={styles.celebrationTitle}>NEW HIGH SCORE!</Text>
          )}
          
          <Text style={isHighScoreBeat ? styles.celebrationScore : styles.simpleScore}>
            {score}
          </Text>
          
          {isHighScoreBeat && (
            <Text style={styles.subtitle}>
              {`${levelTheme.name} Level Unlocked!`}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const containerWidth = Math.min(screenWidth * 0.6, 300); // 60% of screen width, max 300px

const styles = StyleSheet.create({
  flashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.flash,
    pointerEvents: 'none', // Allow touches to pass through
  },
  
  // Simple flash styles
  simpleContainer: {
    width: containerWidth,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleOverlay: {
    backgroundColor: colors.components.background,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  
  // Celebration flash styles
  celebrationContainer: {
    width: containerWidth * 1.2,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  celebrationOverlay: {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
    elevation: 12,
    opacity: 0.95,
  },
  
  // Content styles
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  celebrationTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    // textShadow not supported in React Native - removed
  },
  celebrationScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    // textShadow not supported in React Native - removed
  },
  simpleScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // Sparkle animation styles
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
  sparkle2: {
    top: '20%',
    right: '15%',
    fontSize: 20,
  },
  sparkle3: {
    bottom: '25%',
    left: '10%',
    fontSize: 18,
  },
  sparkle4: {
    top: '15%',
    left: '20%',
    fontSize: 22,
  },
});