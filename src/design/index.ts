/**
 * Design System - Main Entry Point
 * 
 * Provides a clean, unified API for accessing all design system components.
 * This is the single import that components need to use the design system.
 */

// Re-export everything from tokens and components
// Re-export for direct access
import { 
  colors, 
  spacing, 
  typography, 
  borderRadius, 
  shadows, 
  gradients, 
  animations, 
  zIndex 
} from './tokens';

import {
  buttonStyles,
  cardStyles,
  textStyles,
  layoutStyles, 
  contentStyles,
  feedbackStyles,
  getLevelGradient,
  clearStyleCache,
} from './components';

export * from './tokens';
export * from './components';

// Main design system object for easy access
export const designSystem = {
  // Component styles
  buttons: buttonStyles,
  cards: cardStyles,  
  text: textStyles,
  layout: layoutStyles,
  content: contentStyles,
  feedback: feedbackStyles,
  
  // Design tokens
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  gradients,
  animations,
  zIndex,
  
  // Utilities
  getLevelGradient,
  clearStyleCache,
} as const;

// Default export
export default designSystem;