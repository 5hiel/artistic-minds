/**
 * Component Style System
 * 
 * Provides consistent styling for each component type with proper 
 * level-based theming and variant support. All styles are memoized 
 * for performance.
 */

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, gradients, zIndex, accessibility } from './tokens';

// Type definitions for component styles
export type ComponentVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'success' | 'error';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentState = 'default' | 'pressed' | 'disabled' | 'loading';

// Level-based intensity calculation
const getLevelIntensity = (levelIndex: number): number => {
  return Math.min(1, levelIndex * 0.15);
};

// Memoization cache for performance
const styleCache = new Map<string, any>();

const memoizeStyle = <T>(key: string, styleFactory: () => T): T => {
  if (!styleCache.has(key)) {
    styleCache.set(key, styleFactory());
  }
  return styleCache.get(key) as T;
};

// Pre-created base styles for better performance
const baseStyles = StyleSheet.create({
  buttonBase: {
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 0,
  },
  textBase: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  cardBase: {
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  containerBase: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.components.background,
  },
});

/**
 * Button Component Styles
 */
export const buttonStyles = {
  // Primary neumorphic button
  primary: (levelIndex: number = 0, state: ComponentState = 'default') => {
    const cacheKey = `button-primary-${levelIndex}-${state}`;
    return memoizeStyle(cacheKey, () => {
      const intensity = getLevelIntensity(levelIndex);
      
      const baseStyle: ViewStyle = {
        backgroundColor: colors.components.background,
        borderRadius: borderRadius.md,             // Beautiful rounded corners
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...shadows.neumorphic.raised,  // Beautiful cell shadow
      };

      const textStyle: TextStyle = {
        color: colors.text.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
      };

      // State modifications
      if (state === 'pressed') {
        return StyleSheet.create({
          container: {
            ...baseStyle,
            backgroundColor: colors.components.background,
            ...shadows.neumorphic.pressed,
            opacity: colors.states.pressed,
          },
          text: textStyle,
        });
      }

      if (state === 'disabled') {
        return StyleSheet.create({
          container: {
            ...baseStyle,
            opacity: colors.states.disabled,
          },
          text: {
            ...textStyle,
            opacity: colors.states.disabled,
          },
        });
      }

      return StyleSheet.create({
        container: {
          ...baseStyle,
          shadowOpacity: (shadows.neumorphic.raised.shadowOpacity || 0) + intensity * 0.2,
          shadowRadius: (shadows.neumorphic.raised.shadowRadius || 0) + intensity * 2,
          elevation: (shadows.neumorphic.raised.elevation || 0) + intensity * 2,
        },
        text: textStyle,
      });
    });
  },

  // Secondary/ghost button
  secondary: (levelIndex: number = 0, state: ComponentState = 'default') => {
    const cacheKey = `button-secondary-${levelIndex}-${state}`;
    return memoizeStyle(cacheKey, () => {
      const baseStyle: ViewStyle = {
        backgroundColor: colors.components.background,
        borderRadius: borderRadius.md,              // Beautiful rounded corners  
        borderWidth: 0,                             // No border like prototypes
        borderColor: 'transparent',                 // Clean like prototypes
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...shadows.neumorphic.raised,  // Beautiful cell shadow
      };

      const textStyle: TextStyle = {
        color: colors.text.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
      };

      if (state === 'pressed') {
        return StyleSheet.create({
          container: {
            ...baseStyle,
            backgroundColor: colors.components.background,
            opacity: colors.states.pressed,
          },
          text: textStyle,
        });
      }

      return StyleSheet.create({
        container: baseStyle,
        text: textStyle,
      });
    });
  },

  // Accent button (for special actions)
  accent: (levelIndex: number = 0, state: ComponentState = 'default') => {
    const cacheKey = `button-accent-${levelIndex}-${state}`;
    return memoizeStyle(cacheKey, () => {
      const baseStyle: ViewStyle = {
        backgroundColor: colors.components.background,
        borderRadius: borderRadius.md,             // Beautiful rounded corners
        borderWidth: 0,                            // No border like prototypes
        borderColor: 'transparent',                // Clean like prototypes
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...shadows.neumorphic.raised,  // Beautiful cell shadow
      };

      const textStyle: TextStyle = {
        color: colors.text.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
      };

      return StyleSheet.create({
        container: baseStyle,
        text: textStyle,
      });
    });
  },

  // Base option button (for puzzle answers and power buttons)
  option: (levelIndex: number = 0, variant: 'default' | 'correct' | 'incorrect' | 'power' | 'power-purchase' | 'power-disabled' = 'default') => {
    const cacheKey = `button-option-${levelIndex}-${variant}`;
    return memoizeStyle(cacheKey, () => {
      // Enhanced variant configuration with color feedback and accessibility compliance
      const getVariantConfig = () => {
        const baseConfig = {
          textColor: colors.text.white,
          backgroundColor: colors.components.background,
          borderColor: 'transparent',
          minHeight: Math.max(48, accessibility.minTouchTarget), // Ensure minimum touch target
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };

        switch (variant) {
          case 'correct':
            return {
              ...baseConfig,
              backgroundColor: '#22C55E', // Green-500 - great contrast with white text
            };
          case 'incorrect':
            return {
              ...baseConfig,
              backgroundColor: '#EF4444', // Red-500 - great contrast with white text
            };
          case 'power-disabled':
            return {
              ...baseConfig,
              textColor: colors.text.disabled,
            };
          default:
            return baseConfig;
        }
      };

      const variantConfig = getVariantConfig();

      const baseStyle: ViewStyle = {
        ...baseStyles.buttonBase,
        backgroundColor: variantConfig.backgroundColor,
        borderColor: variantConfig.borderColor,
        paddingVertical: variantConfig.paddingVertical,
        paddingHorizontal: variantConfig.paddingHorizontal,
        minHeight: variantConfig.minHeight,
        ...shadows.neumorphic.raised,
      };

      const textStyle: TextStyle = {
        ...baseStyles.textBase,
        color: variantConfig.textColor,
        textAlign: variant.startsWith('power') ? 'center' : 'left',
      };

      return StyleSheet.create({
        container: baseStyle,
        text: textStyle,
      });
    });
  },
};

/**
 * Card Component Styles  
 */
export const cardStyles = {
  // Status cards (for GameTopBar components)
  status: (levelIndex: number = 0) => {
    const cacheKey = `card-status-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      
      return StyleSheet.create({
        container: {
          backgroundColor: colors.components.background,  // Dark tinted background
          borderRadius: borderRadius.md,   // Beautiful rounded corners
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          ...shadows.subtle,  // Beautiful container shadow
        },
        text: {
          color: colors.text.white,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          textAlign: 'center',
        },
        label: {
          color: colors.text.white,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.normal,
          textAlign: 'center',
          marginTop: spacing.xs,
        },
      });
    });
  },

  // Metric cards (for ScoreDisplay)
  metric: (levelIndex: number = 0) => {
    const cacheKey = `card-metric-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        container: {
          backgroundColor: colors.components.background,
          borderRadius: borderRadius.full,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          ...shadows.subtle,  // Beautiful container shadow
        },
        text: {
          color: colors.text.white,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.normal,
        },
        value: {
          color: colors.text.primary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
        },
      });
    });
  },

  // Content cards (for puzzle containers)
  content: (levelIndex: number = 0) => {
    const cacheKey = `card-content-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        container: {
          backgroundColor: colors.components.background,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          ...shadows.subtle,
        },
        title: {
          color: colors.text.primary,
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.medium,
          textAlign: 'center',
          marginBottom: spacing.md,
        },
        content: {
          color: colors.text.primary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.lineHeight.normal,
        },
      });
    });
  },
};

/**
 * Typography Styles
 */
export const textStyles = {
  heading: (levelIndex: number = 0) => {
    const cacheKey = `text-heading-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        h1: {
          color: colors.text.primary,
          fontSize: typography.fontSize.xxxl,
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.lineHeight.tight,
        },
        h2: {
          color: colors.text.primary,
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.tight,
        },
        h3: {
          color: colors.text.primary,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.normal,
        },
      });
    });
  },

  body: (levelIndex: number = 0) => {
    const cacheKey = `text-body-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        primary: {
          color: colors.text.primary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.lineHeight.normal,
        },
        secondary: {
          color: colors.text.secondary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.lineHeight.normal,
        },
        accent: {
          color: colors.text.accent,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
          lineHeight: typography.lineHeight.normal,
        },
      });
    });
  },

  label: (levelIndex: number = 0) => {
    const cacheKey = `text-label-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        primary: {
          color: colors.text.secondary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        secondary: {
          color: colors.text.secondary,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.normal,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      });
    });
  },
};

/**
 * Layout Styles
 */
export const layoutStyles = {
  screen: (levelIndex: number = 0) => {
    const cacheKey = `layout-screen-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      
      return StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: 'transparent', // Let gradient show through
        },
        gradient: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: spacing.xs,
          minHeight: '100%',
        },
      });
    });
  },

  section: (levelIndex: number = 0) => {
    const cacheKey = `layout-section-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.sm,
          gap: spacing.xs,
        },
        centeredContainer: {
          width: '100%',
          maxWidth: 512,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          alignSelf: 'center',
        },
        scoreContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs,
          gap: spacing.sm,
        },
        content: {
          width: '100%',
          maxWidth: 512,
          alignItems: 'center',
        },
      });
    });
  },
};

/**
 * Content Component Styles
 */
export const contentStyles = {
  // Grid component (for PuzzleGrid)
  grid: (levelIndex: number = 0) => {
    const cacheKey = `content-grid-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        container: {
          padding: spacing.sm,
          borderRadius: borderRadius.md,
          marginVertical: spacing.md,
          ...shadows.subtle,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cell: {
          width: 80,
          height: 80,
          margin: 4,
          borderRadius: borderRadius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.components.background,
          ...shadows.neumorphic.raised,
        },
        cellText: {
          color: colors.text.primary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.medium,
          textAlign: 'center',
        },
      });
    });
  },

  // Puzzle container (for main puzzle content)
  puzzle: (levelIndex: number = 0) => {
    const cacheKey = `content-puzzle-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        container: {
          width: '100%',
          maxWidth: 512,
          backgroundColor: colors.components.background,  // Dark tinted background
          borderRadius: borderRadius.lg,   // Beautiful rounded corners
          padding: spacing.sm,
          margin: spacing.xs,
          marginTop: spacing.md,  // Add proper spacing below GameTopBarContainer
          ...shadows.subtle,  // Beautiful container shadow
          gap: spacing.sm,
        },
        question: {
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.white,
          textAlign: 'center',
          marginBottom: spacing.lg,
          paddingHorizontal: spacing.md,
          flexWrap: 'wrap',
        },
        explanation: {
          backgroundColor: colors.components.background,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginTop: spacing.md,
        },
        explanationText: {
          color: colors.text.primary,
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.normal,
          textAlign: 'left',
        },
      });
    });
  },

  // Options container (for puzzle answers)
  options: (levelIndex: number = 0) => {
    const cacheKey = `content-options-${levelIndex}`;
    return memoizeStyle(cacheKey, () => {
      return StyleSheet.create({
        container: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: spacing.sm,
          paddingHorizontal: spacing.sm,
          marginTop: spacing.sm,
          ...shadows.subtle,  // Beautiful container shadow
        },
        option: {
          flexBasis: '48%',
          minHeight: 60,
        },
      });
    });
  },
};

/**
 * Feedback Component Styles
 */
export const feedbackStyles = {
  flash: () => {
    return memoizeStyle('feedback-flash', () => {
      return StyleSheet.create({
        overlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.semantic.success,
          opacity: 0.2,
          zIndex: zIndex.flash,
        },
      });
    });
  },

  message: (levelIndex: number = 0, variant: 'success' | 'error' | 'info' = 'info') => {
    const cacheKey = `feedback-message-${levelIndex}-${variant}`;
    return memoizeStyle(cacheKey, () => {
      let backgroundColor: string = colors.components.background;
      let textColor: string = colors.text.primary;

      if (variant === 'success') {
        backgroundColor = colors.components.background;
        textColor = colors.semantic.success;
      } else if (variant === 'error') {
        backgroundColor = colors.components.background;
        textColor = colors.semantic.error;
      }

      return StyleSheet.create({
        container: {
          backgroundColor,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginVertical: spacing.sm,
          alignItems: 'center',
          ...shadows.subtle,  // Beautiful container shadow
        },
        text: {
          color: textColor,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
          textAlign: 'center',
        },
      });
    });
  },
};

// Helper function to clear style cache (useful for development)
export const clearStyleCache = () => {
  styleCache.clear();
};

// Clear cache in development mode for hot reloading
if (__DEV__) {
  clearStyleCache();
}

// Export level-based gradient colors for LinearGradient
export const getLevelGradient = (levelIndex: number): [string, string, ...string[]] => {
  const gradient = gradients.level(levelIndex);
  return gradient as [string, string, ...string[]];
};