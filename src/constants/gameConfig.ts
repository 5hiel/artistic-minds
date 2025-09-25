/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  LOOP_SECONDS: 60, // Duration of each power surge evaluation window
  POWER_SURGE_THRESHOLD: 5, // Minimum points to maintain power surge
  AUTO_ADVANCE_DELAY: 1200, // Delay before advancing to next puzzle (ms)
} as const;

/**
 * Level configuration with thresholds and visual themes
 */
export const LEVELS = [
  {
    name: 'Seeker',
    threshold: 0,
    backgroundColor: '#1A202C', // Dark theme
    description: 'Professional, focused'
  },
  {
    name: 'Learner',
    threshold: 10,
    backgroundColor: '#1E90FF', // Sky Blue
    description: 'Calm, trustworthy'
  },
  {
    name: 'Thinker',
    threshold: 100,
    backgroundColor: '#FFD700', // Sunshine Yellow
    description: 'Optimistic, energetic'
  },
  {
    name: 'Creator',
    threshold: 1000,
    backgroundColor: '#FF69B4', // Candy Pink
    description: 'Creative, playful'
  },
  {
    name: 'Visionary',
    threshold: 10000,
    backgroundColor: '#32CD32', // Lime Green
    description: 'Growth, mastery'
  }
] as const;

/**
 * UI Theme constants
 */
export const THEME = {
  colors: {
    primary: '#667EEA',
    secondary: '#ECC94B',
    success: '#48BB78',
    error: '#F56565',
    warning: '#ED8936',
    background: {
      primary: '#1A202C',
      secondary: '#2D3748',
      tertiary: '#4A5568',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#A0AEC0',
      accent: '#ECC94B',
    },
    flash: {
      success: '#4CAF50',
      opacity: 0.2,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
  fontSize: {
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
} as const;