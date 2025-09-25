/**
 * Centralized Puzzle Type Configuration
 *
 * Single source of truth for all puzzle type settings.
 * Change enabled status here to enable/disable puzzle types throughout the entire system.
 */

export interface PuzzleTypeConfig {
  index: number;           // Internal type index for generator
  enabled: boolean;        // Whether this type is active
  category: 'visual' | 'logical' | 'mathematical' | 'spatial' | 'memory'; // Category for adaptive filtering
  name: string;           // Display name
  description: string;    // Description for debugging/docs
  weight: number;         // Default weight for generation (only used if enabled)
}

/**
 * Master puzzle type configuration
 *
 * To enable/disable puzzle types, change the 'enabled' property below.
 * All other systems will automatically adapt.
 */
export const PUZZLE_TYPES: Record<string, PuzzleTypeConfig> = {
  pattern: {
    index: 0,
    enabled: true,         // ✅ ENABLED
    category: 'visual',
    name: 'Pattern Recognition',
    description: 'Visual grid patterns with emoji symbols',
    weight: 1
  },
  'serial-reasoning': {
    index: 1,
    enabled: true,         // ✅ ENABLED
    category: 'logical',
    name: 'Serial Reasoning',
    description: 'Matrix completion puzzles (Raven\'s style)',
    weight: 1
  },
  'number-series': {
    index: 2,
    enabled: true,         // ✅ ENABLED for testing
    category: 'mathematical',
    name: 'Number Series',
    description: 'Number sequence patterns (2,4,8,16...)',
    weight: 1
  },
  'algebraic-reasoning': {
    index: 3,
    enabled: false,        // ❌ DISABLED
    category: 'mathematical',
    name: 'Algebraic Reasoning',
    description: 'Equation solving (x + 5 = 12)',
    weight: 0
  },
  'number-grid': {
    index: 4,
    enabled: true,         // ✅ ENABLED
    category: 'mathematical',
    name: 'Number Grid',
    description: '3x3 mathematical grid patterns',
    weight: 1
  },
  'number-analogy': {
    index: 5,
    enabled: true,         // ✅ ENABLED
    category: 'mathematical',
    name: 'Number Analogy',
    description: 'Numerical relationships (5:8::7:?)',
    weight: 1
  },
  transformation: {
    index: 6,
    enabled: false,        // ❌ DISABLED - rendering issues
    category: 'visual',
    name: 'Transformation',
    description: 'Complex shape grids with properties',
    weight: 0
  },
  figureClassification: {
    index: 7,
    enabled: false,        // ❌ DISABLED - has bugs
    category: 'logical',
    name: 'Figure Classification',
    description: 'Cognitive assessment patterns',
    weight: 0
  },
  paperFolding: {
    index: 8,
    enabled: false,        // ❌ DISABLED - has bugs
    category: 'spatial',
    name: 'Paper Folding',
    description: 'Spatial visualization puzzles',
    weight: 0
  },
  followingDirections: {
    index: 9,
    enabled: false,        // ❌ DISABLED - has bugs
    category: 'memory',
    name: 'Following Directions',
    description: 'Sequential instruction puzzles',
    weight: 0
  },
  pictureSeries: {
    index: 10,
    enabled: false,        // ❌ DISABLED - has bugs
    category: 'visual',
    name: 'Picture Series',
    description: 'OLSAT-style "what comes next"',
    weight: 0
  }
};

/**
 * Computed configurations (auto-generated from PUZZLE_TYPES)
 */

// Get all enabled puzzle types
export const getEnabledPuzzleTypes = (): Record<string, PuzzleTypeConfig> => {
  return Object.fromEntries(
    Object.entries(PUZZLE_TYPES).filter(([_, config]) => config.enabled)
  );
};

// Get enabled type indices for fallback cycling
export const getEnabledTypeIndices = (): number[] => {
  return Object.values(PUZZLE_TYPES)
    .filter(config => config.enabled)
    .map(config => config.index)
    .sort((a, b) => a - b);
};

// Get type name to index mapping for enabled types only
export const getEnabledTypeMapping = (): Record<string, number> => {
  return Object.fromEntries(
    Object.entries(PUZZLE_TYPES)
      .filter(([_, config]) => config.enabled)
      .map(([typeName, config]) => [typeName, config.index])
  );
};

// Get type entries for puzzle generation (returns [typeName, typeIndex] for enabled types)
export const getWeightEntries = (): [string, number][] => {
  return Object.entries(PUZZLE_TYPES)
    .filter(([_, config]) => config.enabled)
    .map(([typeName, config]) => [typeName, config.index]);
};

// Get default weights configuration
export const getDefaultWeights = (): Record<string, number> => {
  return Object.fromEntries(
    Object.entries(PUZZLE_TYPES).map(([typeName, config]) => [
      typeName,
      config.enabled ? config.weight : 0
    ])
  );
};

// Get puzzle types by category (for adaptive engine filtering)
export const getPuzzleTypesByCategory = (category: PuzzleTypeConfig['category']): string[] => {
  return Object.entries(PUZZLE_TYPES)
    .filter(([_, config]) => config.category === category)
    .map(([typeName, _]) => typeName);
};

// Get categories that have enabled puzzle types
export const getActiveCategories = (): PuzzleTypeConfig['category'][] => {
  const categories = Object.values(PUZZLE_TYPES)
    .filter(config => config.enabled)
    .map(config => config.category);
  return [...new Set(categories)];
};

/**
 * Configuration summary for debugging
 */
export const getPuzzleConfigSummary = () => {
  const enabled = getEnabledPuzzleTypes();
  const enabledCount = Object.keys(enabled).length;
  const totalCount = Object.keys(PUZZLE_TYPES).length;

  return {
    enabled: Object.keys(enabled),
    enabledCount,
    totalCount,
    enabledIndices: getEnabledTypeIndices(),
    activeCategories: getActiveCategories(),
    configuration: 'Change enabled status in constants/puzzleConfig.ts'
  };
};