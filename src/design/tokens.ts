/**
 * Design Tokens - Single Source of Truth
 * 
 * All design values (colors, spacing, typography, etc.) are defined here.
 * This ensures consistency and makes it easy to modify designs system-wide.
 */

import { Platform } from 'react-native';

// Core color palette
export const colors = {
  // Midnight Ocean Theme Colors
  midnight: {
    base: '#1a2332',
    light: '#253446', 
    dark: '#0f1419',
    accent: '#64b5f6',
    text: '#e8eaed',
    shadow: '#000000',
    highlight: '#ffffff08',
  },
  
  // Level-based theme colors (from existing LEVELS)
  levels: {
    seeker: '#1A202C',    // Professional, focused
    learner: '#1E90FF',   // Sky Blue - Calm, trustworthy
    thinker: '#FFD700',   // Sunshine Yellow - Optimistic, energetic
    creator: '#FF69B4',   // Candy Pink - Creative, playful
    visionary: '#32CD32', // Lime Green - Growth, mastery
  },
  
  // Semantic colors
  semantic: {
    primary: '#667EEA',
    secondary: '#ECC94B', 
    success: '#48BB78',
    error: '#F56565',
    warning: '#ED8936',
    correct: '#4CAF50',
    incorrect: '#F44336',
  },
  
  // Power surge specific colors
  powerSurge: {
    gold: '#FFD700',
    energy: '#FF6B35',
    particle: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.3)',
    trail: 'rgba(255, 107, 53, 0.5)',
  },
  
  // Background colors (Midnight theme)
  backgrounds: {
    primary: '#0f1419',        // midnight.dark - Primary background
    secondary: '#1a2332',      // midnight.base - Secondary background  
    tertiary: '#253446',       // midnight.light - Tertiary background
    overlay: 'rgba(26,35,50,0.3)', // midnight.base with transparency
  },
  
  // Text colors (Midnight theme)
  text: {
    primary: '#e8eaed',        // midnight.text - Primary text
    secondary: '#64b5f6',      // midnight.accent - Secondary/accent text  
    accent: '#64b5f6',         // midnight.accent - Accent text (kept for backward compatibility)
    inverse: '#0f1419',        // midnight.dark - Inverse text
    white: '#ffffff',          // Pure white for high contrast
    disabled: 'rgba(255,255,255,0.4)', // Disabled text with proper opacity
  },
  
  // Interactive states
  states: {
    pressed: 0.7,
    disabled: 0.5,
    hover: 0.8,
  },
  
  // Component backgrounds (uniform dark tinted sunglasses effect)
  components: {
    background: Platform.select({
      web: 'rgba(0,0,0,0.4)',     // Semi-transparent works well on web
      ios: 'rgba(0, 0, 0, 0.6)',  // Explicit spacing for iOS compatibility
      android: 'rgba(0,0,0,0.4)', // Standard opacity for Android
      default: 'rgba(0,0,0,0.4)'
    }), // Dark tinted background for all components
  }
} as const;

// Spacing scale (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8, 
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Typography scale
export const typography = {
  fontSize: {
    xs: 14,  // Labels (High Score, Timer labels, Power Button labels)
    sm: 18,  // Status & Metrics & Power Button text (unified)
    md: 18,  // Keep same as sm for consistency
    lg: 22,  // Large text (questions, etc.)
    xl: 24,  // Extra large text
    xxl: 28, // Extra extra large
    xxxl: 36, // Headlines
    xxxxl: 44, // Major headlines
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    loose: 1.6,
    relaxed: 1.4,  // Same as normal to maintain original layout behavior
  }
} as const;

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// Platform-optimized shadow definitions
export const shadows = {
  neumorphic: {
    raised: Platform.select({
      ios: {
        shadowColor: colors.midnight.shadow,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '-2px -2px 3px rgba(0,0,0,0.3)',
      },
      default: {
        shadowColor: colors.midnight.shadow,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
      }
    }),
    pressed: Platform.select({
      ios: {
        shadowColor: colors.midnight.shadow,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      },
      default: {
        shadowColor: colors.midnight.shadow,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      }
    }),
    inset: Platform.select({
      ios: {
        shadowColor: colors.midnight.highlight,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: 'inset -2px -2px 2px rgba(255,255,255,0.1)',
      },
      default: {
        shadowColor: colors.midnight.highlight,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }
    }),
    container: Platform.select({
      ios: {
        shadowColor: colors.midnight.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '4px 4px 6px rgba(0,0,0,0.3)',
      },
      default: {
        shadowColor: colors.midnight.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
      }
    })
  },
  subtle: Platform.select({
    ios: {
      shadowColor: colors.midnight.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    },
    default: {
      shadowColor: colors.midnight.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }
  })
} as const;

// Gradient definitions
export const gradients = {
  midnight: {
    primary: [colors.midnight.base, colors.midnight.light],
    secondary: [colors.midnight.dark, colors.midnight.base],
    accent: [colors.midnight.accent, '#42a5f5'],
  },
  // Level-based gradients using actual colorful level progression
  level: (levelIndex: number) => {
    const levelColors = Object.values(colors.levels);
    const currentColor = levelColors[levelIndex] || levelColors[0];
    const nextColor = levelColors[Math.min(levelIndex + 1, levelColors.length - 1)];
    return [currentColor, nextColor];
  }
} as const;

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  pulse: 800,
  glow: 1500,
  surge: 2000,
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  overlay: 10,
  modal: 100,
  tooltip: 1000,
  flash: 10000,
} as const;

// Mobile accessibility standards
export const accessibility = {
  minTouchTarget: 44, // iOS Human Interface Guidelines minimum
  minAndroidTouchTarget: 48, // Material Design minimum
  minTouchTargetSpacing: 8, // Minimum space between touch targets
} as const;

// Responsive design breakpoints
export const breakpoints = {
  small: 320, // Small phones
  medium: 375, // Standard phones
  large: 414, // Large phones
  tablet: 768, // Tablets
} as const;