import { createContext } from 'react';

/**
 * Level-based color theme system for the puzzle application.
 * Provides distinct visual themes for different skill levels to enhance user experience.
 * Each level has a unique color scheme to represent progression and achievement.
 * 
 * Level progression:
 * 0. Seeker (Dark theme - starting level)
 * 1. Learner (Sky Blue - beginner progression) 
 * 2. Thinker (Sunshine Yellow - intermediate)
 * 3. Creator (Candy Pink - advanced)
 * 4. Visionary (Lime Green - expert level)
 */

// Level backgrounds and cell backgrounds (with alpha for transparency)
export const levelBackgrounds = [
  '#1A202C',      // Seeker (default dark)
  '#1E90FF',      // Learner (Sky Blue)
  '#FFD700',      // Thinker (Sunshine Yellow)
  '#FF69B4',      // Creator (Candy Pink)
  '#32CD32',      // Visionary (Lime Green)
];

/**
 * Semi-transparent cell backgrounds that layer over the main level backgrounds.
 * Uses rgba values with low alpha for subtle visual distinction without overwhelming the content.
 */
export const levelCellBackgrounds = [
  'rgba(26,32,44,0.7)',    // Seeker
  'rgba(30,144,255,0.25)', // Learner
  'rgba(255,215,0,0.18)',  // Thinker
  'rgba(255,105,180,0.18)',// Creator
  'rgba(50,205,50,0.18)',  // Visionary
];

/**
 * React Context for managing level-based color themes throughout the application.
 * Provides background color, cell color, and level index to consuming components.
 * Defaults to level 0 (Seeker) theme.
 */
export const LevelColorContext = createContext({
  bgColor: levelBackgrounds[0],
  cellColor: levelCellBackgrounds[0],
  levelIndex: 0,
});
