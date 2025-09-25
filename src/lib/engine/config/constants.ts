/**
 * Adaptive Engine Constants
 *
 * Centralized configuration for all strings, numbers, and constants used
 * throughout the adaptive learning system. Single source of truth for
 * easy maintenance and consistent behavior.
 */

// ===============================================
// PUZZLE TYPES
// ===============================================

// === STANDARD PUZZLE TYPE IDENTIFIERS ===
// Using kebab-case as the single canonical format across the entire adaptive engine
export const PUZZLE_TYPES = {
  PATTERN: 'pattern',
  NUMBER_SERIES: 'number-series',
  NUMBER_ANALOGY: 'number-analogy',
  ALGEBRAIC_REASONING: 'algebraic-reasoning',
  SERIAL_REASONING: 'serial-reasoning',
  NUMBER_GRID: 'number-grid',
  TRANSFORMATION: 'transformation',
  SEQUENTIAL_FIGURES: 'sequential-figures',
  ANALOGY: 'analogy'
} as const;

// === PUZZLE TYPE GROUPS ===
export const PUZZLE_TYPE_GROUPS = {
  // By difficulty for beginners
  BEGINNER_FRIENDLY: [PUZZLE_TYPES.PATTERN, PUZZLE_TYPES.NUMBER_ANALOGY, PUZZLE_TYPES.ANALOGY],
  INTERMEDIATE: [PUZZLE_TYPES.NUMBER_SERIES, PUZZLE_TYPES.SEQUENTIAL_FIGURES],
  ADVANCED: [PUZZLE_TYPES.ALGEBRAIC_REASONING, PUZZLE_TYPES.SERIAL_REASONING, PUZZLE_TYPES.NUMBER_GRID, PUZZLE_TYPES.TRANSFORMATION],

  // By skill requirement
  MATH_REQUIRED: [
    PUZZLE_TYPES.NUMBER_SERIES,
    PUZZLE_TYPES.NUMBER_ANALOGY,
    PUZZLE_TYPES.ALGEBRAIC_REASONING,
    PUZZLE_TYPES.NUMBER_GRID
  ],
  VISUAL_SPATIAL: [
    PUZZLE_TYPES.PATTERN,
    PUZZLE_TYPES.TRANSFORMATION,
    PUZZLE_TYPES.SEQUENTIAL_FIGURES,
    PUZZLE_TYPES.NUMBER_GRID
  ],
  VERBAL_LOGICAL: [
    PUZZLE_TYPES.ANALOGY,
    PUZZLE_TYPES.SERIAL_REASONING
  ],

  // By memory requirement
  LOW_MEMORY: [PUZZLE_TYPES.PATTERN, PUZZLE_TYPES.ANALOGY],
  MEDIUM_MEMORY: [
    PUZZLE_TYPES.NUMBER_SERIES,
    PUZZLE_TYPES.NUMBER_ANALOGY,
    PUZZLE_TYPES.ALGEBRAIC_REASONING,
    PUZZLE_TYPES.SEQUENTIAL_FIGURES
  ],
  HIGH_MEMORY: [
    PUZZLE_TYPES.SERIAL_REASONING,
    PUZZLE_TYPES.NUMBER_GRID,
    PUZZLE_TYPES.TRANSFORMATION
  ],

  // For general user adaptations (game-relevant only)
  NON_MATH_FOCUSED: [PUZZLE_TYPES.PATTERN, PUZZLE_TYPES.SEQUENTIAL_FIGURES, PUZZLE_TYPES.TRANSFORMATION, PUZZLE_TYPES.ANALOGY],
  MATH_HEAVY: [
    PUZZLE_TYPES.ALGEBRAIC_REASONING,
    PUZZLE_TYPES.NUMBER_GRID,
    PUZZLE_TYPES.NUMBER_SERIES,
    PUZZLE_TYPES.NUMBER_ANALOGY
  ],

  // Complete coverage groups
  ALL_PUZZLE_TYPES: [
    PUZZLE_TYPES.PATTERN,
    PUZZLE_TYPES.NUMBER_SERIES,
    PUZZLE_TYPES.NUMBER_ANALOGY,
    PUZZLE_TYPES.ALGEBRAIC_REASONING,
    PUZZLE_TYPES.SERIAL_REASONING,
    PUZZLE_TYPES.NUMBER_GRID,
    PUZZLE_TYPES.TRANSFORMATION,
    PUZZLE_TYPES.SEQUENTIAL_FIGURES,
    PUZZLE_TYPES.ANALOGY
  ],

  // By cognitive complexity
  LOW_COGNITIVE_LOAD: [PUZZLE_TYPES.PATTERN, PUZZLE_TYPES.ANALOGY],
  MEDIUM_COGNITIVE_LOAD: [PUZZLE_TYPES.NUMBER_SERIES, PUZZLE_TYPES.NUMBER_ANALOGY, PUZZLE_TYPES.SEQUENTIAL_FIGURES],
  HIGH_COGNITIVE_LOAD: [PUZZLE_TYPES.ALGEBRAIC_REASONING, PUZZLE_TYPES.SERIAL_REASONING, PUZZLE_TYPES.NUMBER_GRID, PUZZLE_TYPES.TRANSFORMATION]
} as const;

// ===============================================
// USER STATES & MODIFIERS
// ===============================================

// === USER STATES ===
export const USER_STATES = {
  NEW_USER: 'new_user',
  CHILD_LIKE_USER: 'child_like_user',
  SEVERELY_STRUGGLING: 'severely_struggling',
  STRUGGLING: 'struggling',
  FALLING_BACK: 'falling_back',
  STABLE: 'stable',
  PROGRESSING: 'progressing',
  EXCELLING: 'excelling',
  EXPERT_DEMANDING: 'expert_demanding'
} as const;

// === USER STATE MODIFIERS ===
export const USER_STATE_MODIFIERS = {
  CONFIDENCE_CRISIS: 'confidence_crisis',
  DISENGAGED: 'disengaged',
  POWER_DEPENDENT: 'power_dependent',
  FATIGUED: 'fatigued',
  SESSION_DECLINE: 'session_decline'
} as const;

// === USER STATE GROUPS ===
export const USER_STATE_GROUPS = {
  NEEDS_SUPPORT: [
    USER_STATES.SEVERELY_STRUGGLING,
    USER_STATES.STRUGGLING,
    USER_STATES.FALLING_BACK
  ],
  PERFORMING_WELL: [
    USER_STATES.PROGRESSING,
    USER_STATES.EXCELLING,
    USER_STATES.EXPERT_DEMANDING
  ],
  SPECIAL_HANDLING: [
    USER_STATES.NEW_USER,
    USER_STATES.CHILD_LIKE_USER
  ],
  CRISIS_STATES: [
    USER_STATES.SEVERELY_STRUGGLING
  ]
} as const;

// === LEARNING TRENDS ===
export const LEARNING_TRENDS = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DECLINING: 'declining'
} as const;

// ===============================================
// SKILL TARGETS
// ===============================================

// === SKILL TARGET IDENTIFIERS ===
export const SKILL_TARGETS = {
  PATTERN_RECOGNITION: 'pattern_recognition',
  LOGICAL_REASONING: 'logical_reasoning',
  SPATIAL_VISUALIZATION: 'spatial_visualization',
  WORKING_MEMORY: 'working_memory',
  PROCESSING_SPEED: 'processing_speed',
  ATTENTION_CONTROL: 'attention_control',
  MATHEMATICAL_REASONING: 'mathematical_reasoning',
  VERBAL_REASONING: 'verbal_reasoning',
  ABSTRACT_REASONING: 'abstract_reasoning'
} as const;

// === SKILL TARGET GROUPS ===
export const SKILL_TARGET_GROUPS = {
  ALL_AGES: [
    SKILL_TARGETS.PATTERN_RECOGNITION,
    SKILL_TARGETS.SPATIAL_VISUALIZATION,
    SKILL_TARGETS.PROCESSING_SPEED,
    SKILL_TARGETS.ATTENTION_CONTROL
  ],
  ADVANCED_COGNITIVE: [
    SKILL_TARGETS.ABSTRACT_REASONING,
    SKILL_TARGETS.WORKING_MEMORY,
    SKILL_TARGETS.LOGICAL_REASONING
  ],
  MATH_DEPENDENT: [
    SKILL_TARGETS.MATHEMATICAL_REASONING
  ],
  LANGUAGE_DEPENDENT: [
    SKILL_TARGETS.VERBAL_REASONING
  ]
} as const;

// ===============================================
// STORAGE KEYS
// ===============================================

// === PRIMARY STORAGE KEYS ===
export const STORAGE_KEYS = {
  USER_PROFILE: 'gm_user_profile',
  BEHAVIORAL_SIGNATURE: 'gm_behavioral_sig',
  SESSION_HISTORY: 'gm_session_hist',
  POWER_UP_DATA: 'gm_powerup_data',
  PUZZLE_DNAS: 'gm_puzzle_dnas',
  HIGH_SCORE: 'giftedMinds_highScore'
} as const;

// === CACHE KEYS ===
export const CACHE_KEYS = {
  USER_STATE_ANALYSIS: 'cache_user_state_analysis',
  PUZZLE_RECOMMENDATIONS: 'cache_puzzle_recommendations',
  DIFFICULTY_CALIBRATION: 'cache_difficulty_calibration',
  ENGAGEMENT_METRICS: 'cache_engagement_metrics'
} as const;

// ===============================================
// NUMERIC CONSTANTS
// ===============================================

// === DIFFICULTY CONSTANTS ===
export const DIFFICULTY = {
  // Escalation parameters
  ESCALATION_RATE: 0.05,
  PLATEAU_THRESHOLD: 0.85,
  SMOOTHING_FACTOR: 0.3,

  // Difficulty adjustments
  AGGRESSIVE_ADJUSTMENT: 0.15,
  GRADUAL_ADJUSTMENT: 0.1,
  MODERATE_ADJUSTMENT: 0.08,
  SMALL_ADJUSTMENT: 0.05,

  // Base difficulty values
  EASY_BASE: 0.1,
  MEDIUM_BASE: 0.4,
  HARD_BASE: 0.7,

  // Constraint limits
  EXPERT_MINIMUM: 0.7,
  CHILD_MAXIMUM: 0.5,
  NEW_USER_PROTECTION_CAP: 0.4, // For generator-easy puzzles

  // Impact multipliers for DNA analysis
  VISUAL_COMPLEXITY_IMPACT: 0.1,
  RULE_DEPTH_IMPACT: 0.15,
  PATTERN_SOPHISTICATION_IMPACT: 0.1,
  ABSTRACTION_IMPACT: 0.08,
  TIME_IMPACT: 0.05,
  ERROR_PRONENESS_IMPACT: 0.05,
  EXPERTISE_IMPACT: 0.05,

  // Bonuses
  MULTI_STEP_BONUS: 0.05,
  HIGH_MEMORY_BONUS: 0.08,
  MEDIUM_MEMORY_BONUS: 0.03,

  // Color variety and visual noise calculations
  COLOR_VARIETY_DIVISOR: 20,
  VISUAL_NOISE_MULTIPLIER: 0.05,
  RULE_DEPTH_DIVISOR: 5,
  SOLVE_TIME_DIVISOR: 60000
} as const;

// === SUCCESS RATE THRESHOLDS ===
export const SUCCESS_RATES = {
  SEVERELY_STRUGGLING: 0.3,
  STRUGGLING: 0.5,
  PROGRESSING: 0.6,
  EXCELLING: 0.8,
  EXPERT_DEMANDING: 0.9,

  // Optimal targets
  OPTIMAL_TARGET: 0.7,
  OPTIMAL_RANGE: 0.1 // ±0.1 around target
} as const;

// === USER CLASSIFICATION THRESHOLDS ===
export const USER_CLASSIFICATION = {
  // New user threshold
  NEW_USER_PUZZLE_COUNT: 10,

  // Child-like user detection
  CHILD_RESPONSE_TIME_THRESHOLD: 8000, // milliseconds
  CHILD_SKILL_LEVEL_MAX: 0.55,
  CHILD_PUZZLE_COUNT_MIN: 10,
  CHILD_PUZZLE_COUNT_MAX: 50,
  CHILD_MATH_CAPABILITY_THRESHOLD: 0.6,

  // Skill momentum thresholds
  NEGATIVE_MOMENTUM_THRESHOLD: -0.2,
  SLIGHT_NEGATIVE_MOMENTUM: -0.1,
  POSITIVE_MOMENTUM_THRESHOLD: 0.1,
  HIGH_POSITIVE_MOMENTUM: 0.15,

  // Session decline thresholds
  GRADUAL_DECLINE: 0.1,
  SIGNIFICANT_DECLINE: 0.2,

  // Consecutive failures
  CONFIDENCE_CRISIS_FAILURES: 3,
  EMERGENCY_SUPPORT_FAILURES: 5,

  // Power-up dependency
  MODERATE_DEPENDENCY: 0.5,
  HIGH_DEPENDENCY: 0.7
} as const;

// === ENGAGEMENT THRESHOLDS ===
export const ENGAGEMENT = {
  // Engagement level thresholds
  DISENGAGED_THRESHOLD: 0.4,
  LOW_ENGAGEMENT: 0.5,
  MODERATE_ENGAGEMENT: 0.6,
  HIGH_ENGAGEMENT: 0.7,
  FLOW_STATE_THRESHOLD: 0.8,

  // Variety and challenge needs
  VARIETY_DEFICIT_MODERATE: 0.15,
  VARIETY_DEFICIT_CRITICAL: 0.2,
  CHALLENGE_DEFICIT_MODERATE: 0.2,
  CHALLENGE_DEFICIT_SIGNIFICANT: 0.3,

  // Expert user boredom detection
  EXPERT_BOREDOM_THRESHOLD: 0.6,

  // Session engagement tracking
  SESSION_DECLINING_THRESHOLD: 0.5,
  SESSION_RECOVERY_TARGET: 0.6
} as const;

// === RETENTION RISK THRESHOLDS ===
export const RETENTION_RISK = {
  // Base churn probability
  BASE_CHURN_RISK: 0.1,

  // Churn probability adjustments
  CHALLENGE_DEFICIT_PENALTY: 0.4,
  VARIETY_DEFICIT_PENALTY: 0.2,
  SATISFACTION_DECLINE_PENALTY: 0.3,
  ENGAGEMENT_DECLINE_PENALTY: 0.15,

  // Churn probability thresholds
  LOW_CHURN_RISK: 0.4,
  MEDIUM_CHURN_RISK: 0.6,
  HIGH_CHURN_RISK: 0.8,
  CRITICAL_CHURN_RISK: 0.95,

  // Session tracking
  CONSECUTIVE_LOW_SATISFACTION_THRESHOLD: 3,
  LOW_SATISFACTION_THRESHOLD: 0.6,
  SATISFACTION_DECLINE_THRESHOLD: 0.1,
  ENGAGEMENT_DECLINE_MODERATE: 0.03,
  ENGAGEMENT_DECLINE_SIGNIFICANT: 0.05,

  // Expected difficulty/variety by user state
  EXPERT_EXPECTED_DIFFICULTY: 0.8,
  EXCELLING_EXPECTED_DIFFICULTY: 0.7,
  GENERAL_EXPECTED_DIFFICULTY: 0.6,
  EXPERT_EXPECTED_VARIETY: 4,
  GENERAL_EXPECTED_VARIETY: 3
} as const;

// === DATA LIMITS ===
export const DATA_LIMITS = {
  // History tracking limits
  SESSION_HISTORY_LIMIT: 50,
  RECENT_SESSIONS_LIMIT: 20,
  PUZZLE_DNA_CACHE_LIMIT: 100,
  STATE_HISTORY_LIMIT: 10,
  POWER_UP_EVENTS_LIMIT: 100,
  PURCHASE_HISTORY_LIMIT: 20,

  // Analysis requirements
  MIN_DATA_POINTS_DIFFICULTY: 5,
  MIN_DATA_POINTS_SKILL_ASSESSMENT: 3,
  MIN_DATA_POINTS_MEMORY_ASSESSMENT: 3,
  MIN_DATA_POINTS_ATTENTION_ASSESSMENT: 4,
  MIN_DATA_POINTS_ENGAGEMENT: 10,

  // Math capability assessment
  MIN_MATH_ATTEMPTS: 3,
  RELIABLE_MATH_ASSESSMENT: 5,

  // Confidence levels based on data volume
  FULL_CONFIDENCE_PUZZLES: 10,
  HIGH_CONFIDENCE_PUZZLES: 5,
  MODERATE_CONFIDENCE_PUZZLES: 3,
  LOW_CONFIDENCE_PUZZLES: 1
} as const;

// === TIMING CONSTANTS ===
export const TIMING = {
  // Sync and cache management
  SYNC_COOLDOWN_MS: 5 * 60 * 1000, // 5 minutes

  // Puzzle DNA analysis timing
  BASE_SOLVE_TIME_MS: 5000,
  MAX_SOLVE_TIME_MS: 60000,
  TIME_PER_ELEMENT_MS: 200,
  TIME_PER_RULE_DEPTH_MS: 3000,
  TIME_PER_UNIQUE_ELEMENT_MS: 500,

  // Response time categories
  FAST_RESPONSE_MS: 3000,
  NORMAL_RESPONSE_MS: 5000,
  SLOW_RESPONSE_MS: 8000,
  VERY_SLOW_RESPONSE_MS: 12000,

  // Session duration analysis
  SHORT_SESSION_MS: 2 * 60 * 1000,     // 2 minutes
  NORMAL_SESSION_MS: 10 * 60 * 1000,   // 10 minutes
  LONG_SESSION_MS: 20 * 60 * 1000,     // 20 minutes
  VERY_LONG_SESSION_MS: 30 * 60 * 1000, // 30 minutes

  // Time estimation for difficulty calculation
  SOLVE_TIME_DIFFERENCE_THRESHOLD: 5000, // 5 seconds difference triggers update

  // Churn prediction timing
  RAPID_SATISFACTION_DECLINE_SESSIONS: 10,
  RAPID_ENGAGEMENT_DECLINE_SESSIONS: 15,
  DEFAULT_OPTIMISTIC_SESSIONS: 20
} as const;

// === POOL DISTRIBUTION CONSTANTS ===
export const POOL_DISTRIBUTION = {
  // Pool size
  TOTAL_POOL_SIZE: 10,

  // Base distributions for each user state [confidence, skill, challenge, recovery, exploratory]
  DISTRIBUTIONS: {
    [USER_STATES.CHILD_LIKE_USER]: [8, 2, 0, 0, 0],
    [USER_STATES.NEW_USER]: [7, 2, 1, 0, 0],
    [USER_STATES.SEVERELY_STRUGGLING]: [6, 2, 0, 2, 0],
    [USER_STATES.STRUGGLING]: [4, 3, 1, 2, 0],
    [USER_STATES.FALLING_BACK]: [5, 2, 1, 2, 0],
    [USER_STATES.STABLE]: [2, 4, 3, 0, 1],
    [USER_STATES.PROGRESSING]: [2, 3, 4, 0, 1],
    [USER_STATES.EXCELLING]: [1, 2, 4, 0, 3],
    [USER_STATES.EXPERT_DEMANDING]: [0, 1, 7, 0, 2]
  },

  // Strength-based adjustments for pre-Level 15
  CONFIDENCE_BOOST: 3,
  CHALLENGE_REDUCTION: 2,
  VISUAL_PATTERN_BOOST: 2, // For users showing visual/pattern strengths
  SKILL_DEVELOPMENT_REDUCTION: 1,

  // Modifier adjustments
  CONFIDENCE_CRISIS_BOOST: 2,
  CONFIDENCE_CRISIS_CHALLENGE_REDUCTION: 2,
  DISENGAGED_RECOVERY_BOOST: 2,
  DISENGAGED_SKILL_REDUCTION: 1,
  DISENGAGED_EXPLORATORY_REDUCTION: 1,
  POWER_DEPENDENT_CONFIDENCE_BOOST: 1,
  POWER_DEPENDENT_EXPLORATORY_REDUCTION: 1,
  FATIGUED_ENGAGEMENT_BOOST: 1,
  FATIGUED_CONFIDENCE_BOOST: 1,
  FATIGUED_CHALLENGE_REDUCTION: 2,
  SESSION_DECLINE_ENGAGEMENT_BOOST: 1,
  SESSION_DECLINE_SKILL_REDUCTION: 1
} as const;

// === USER PROFILE DEFAULTS ===
export const USER_DEFAULTS = {
  // Initial skill levels
  INITIAL_SKILL_LEVEL: 0.3,
  INITIAL_MAX_DIFFICULTY: 0.4,
  INITIAL_PROGRESSION_RATE: 0.5,
  INITIAL_GROWTH_TARGET: 10,
  INITIAL_POWER_UP_INVENTORY: 10,

  // Cognitive profile defaults
  DEFAULT_PROCESSING_SPEED: 0.5,
  DEFAULT_WORKING_MEMORY: 0.5,
  DEFAULT_ATTENTION_CONTROL: 0.5,
  DEFAULT_ERROR_RECOVERY: 0.5,
  DEFAULT_OPTIMAL_SESSION_LENGTH: 15, // minutes
  DEFAULT_PEAK_PERFORMANCE_HOUR: 19, // 7 PM
  DEFAULT_FATIGUE_RESISTANCE: 0.7,

  // Engagement patterns
  DEFAULT_RESPONSE_TIME: 5000, // milliseconds
  DEFAULT_HESITATION_TENDENCY: 0.3,
  DEFAULT_POWER_UP_DEPENDENCY: 0.2,
  DEFAULT_FLOW_DURATION: 5, // minutes
  DEFAULT_OPTIMAL_CHALLENGE_LEVEL: 0.6
} as const;

// === PUZZLE DNA ANALYSIS CONSTANTS ===
export const PUZZLE_DNA = {
  // Visual complexity analysis
  ELEMENT_COUNT_DIFFICULTY_FACTOR: 20, // Divisor for element count impact
  COLOR_VARIETY_DIFFICULTY_FACTOR: 20, // Divisor for color variety impact
  VISUAL_NOISE_MULTIPLIER: 0.05,

  // Memory requirement thresholds (element counts)
  HIGH_MEMORY_ELEMENT_THRESHOLD: 15,
  MEDIUM_MEMORY_ELEMENT_THRESHOLD: 8,

  // Pattern sophistication calculation
  WORD_COUNT_NORMALIZER: 20,
  WORD_LENGTH_NORMALIZER: 10,
  SPECIAL_CHAR_NORMALIZER: 10,

  // Similarity calculation factors
  ELEMENT_COUNT_SIMILARITY_NORMALIZER: 50,
  COLOR_VARIETY_SIMILARITY_NORMALIZER: 10,
  RULE_DEPTH_SIMILARITY_NORMALIZER: 5,

  // Abstraction level calculation
  ABSTRACTION_KEYWORD_BOOST: 0.2,

  // Error proneness calculation factors
  VISUAL_NOISE_ERROR_FACTOR: 0.3,
  COLOR_VARIETY_ERROR_FACTOR: 0.4,
  RULE_DEPTH_ERROR_FACTOR: 0.15,

  // Time estimate update threshold
  TIME_ESTIMATE_UPDATE_WEIGHT_NEW: 0.7,
  TIME_ESTIMATE_UPDATE_WEIGHT_OLD: 0.3
} as const;

// === ADAPTIVE LEARNING CONSTANTS ===
export const ADAPTIVE_LEARNING = {
  // Confidence weighting
  NEW_DATA_WEIGHT: 0.7,
  EXISTING_DATA_WEIGHT: 0.3,
  DATA_WEIGHT_FACTOR: 0.1,
  CONSERVATIVE_UPDATE_WEIGHT: 0.1,

  // Skill level confidence intervals
  LOW_CONFIDENCE: 0.5,
  MODERATE_CONFIDENCE: 0.7,
  HIGH_CONFIDENCE: 0.8,
  VERY_HIGH_CONFIDENCE: 0.9,
  MAX_CONFIDENCE: 0.95,

  // Processing speed assessment
  MIN_PUZZLES_PER_MINUTE: 0.5,
  MAX_PUZZLES_PER_MINUTE: 3.0,
  PUZZLES_PER_MINUTE_RANGE: 2.5,
  SESSION_QUALITY_WEIGHT: 0.5,
  MIN_EFFICIENCY_RATIO: 2.0,
  EFFICIENCY_SCORE_OFFSET: 0.5,
  EFFICIENCY_SCORE_MULTIPLIER: 0.67,

  // Working memory assessment
  HIGH_DIFFICULTY_THRESHOLD: 0.6,
  MEMORY_PERFORMANCE_BONUS: 1.0,
  ENGAGEMENT_BONUS_FACTOR: 0.2,
  COMPLEXITY_WEIGHT_MINIMUM: 0.5,
  PERFORMANCE_WEIGHT_FACTOR: 0.5,

  // Attention control assessment
  ATTENTION_NOISE_THRESHOLD: 0.6,
  ATTENTION_COLOR_VARIETY_THRESHOLD: 8,
  NOISE_WEIGHT_FACTOR: 0.5,
  TIME_CONSISTENCY_FACTOR: 0.8,

  // Behavioral pattern merging
  BEHAVIORAL_MERGE_WEIGHT: 0.7,
  ACCURACY_INFLUENCE_RATE: 0.4,
  TIME_SCORE_NORMALIZER: 20000, // 20 seconds
  PREFERENCE_ACCURACY_WEIGHT: 0.8,
  PREFERENCE_TIME_WEIGHT: 0.2,

  // Skill progression
  SKILL_PROGRESSION_RATE: 0.1,
  ACCURACY_CONFIDENCE_WEIGHT: 0.1,
  ACCURACY_WEIGHT_FACTOR: 0.3,
  ENGAGEMENT_INFLUENCE: 0.05
} as const;

// === VIRAL SHARING CONSTANTS ===
export const VIRAL = {
  // Level 15 trigger
  VIRAL_LEVEL_THRESHOLD: 15,
  POINTS_PER_LEVEL: 30,

  // Pre-viral optimization
  PRE_VIRAL_STRENGTH_FOCUS_PERCENTAGE: 0.8, // 80% from strong types
  PRE_VIRAL_SUCCESS_TARGET: 0.75 // 75% target success rate
} as const;

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export type PuzzleType = typeof PUZZLE_TYPES[keyof typeof PUZZLE_TYPES];
export type UserState = typeof USER_STATES[keyof typeof USER_STATES];
export type UserStateModifier = typeof USER_STATE_MODIFIERS[keyof typeof USER_STATE_MODIFIERS];
export type LearningTrend = typeof LEARNING_TRENDS[keyof typeof LEARNING_TRENDS];
export type SkillTarget = typeof SKILL_TARGETS[keyof typeof SKILL_TARGETS];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];

// ===============================================
// VALIDATION ARRAYS
// ===============================================

export const VALID_PUZZLE_TYPES = Object.values(PUZZLE_TYPES);
export const VALID_USER_STATES = Object.values(USER_STATES);
export const VALID_USER_STATE_MODIFIERS = Object.values(USER_STATE_MODIFIERS);
export const VALID_LEARNING_TRENDS = Object.values(LEARNING_TRENDS);
export const VALID_SKILL_TARGETS = Object.values(SKILL_TARGETS);

// ===============================================
// VALIDATION FUNCTIONS
// ===============================================

export const isPuzzleTypeValid = (type: string): type is PuzzleType => {
  return VALID_PUZZLE_TYPES.includes(type as PuzzleType);
};

export const isUserStateValid = (state: string): state is UserState => {
  return VALID_USER_STATES.includes(state as UserState);
};

export const isSkillTargetValid = (skill: string): skill is SkillTarget => {
  return VALID_SKILL_TARGETS.includes(skill as SkillTarget);
};

// ===============================================
// LEGACY NORMALIZATION (for migration)
// ===============================================

export const normalizePuzzleType = (type: string): PuzzleType | null => {
  // Already using standard format
  if (VALID_PUZZLE_TYPES.includes(type as PuzzleType)) {
    return type as PuzzleType;
  }

  // Convert common variations to standard format
  const normalizations: Record<string, PuzzleType> = {
    'numberSeries': PUZZLE_TYPES.NUMBER_SERIES,
    'numberAnalogy': PUZZLE_TYPES.NUMBER_ANALOGY,
    'algebraicReasoning': PUZZLE_TYPES.ALGEBRAIC_REASONING,
    'serialReasoning': PUZZLE_TYPES.SERIAL_REASONING,
    'numberGrid': PUZZLE_TYPES.NUMBER_GRID,
    'sequentialFigures': PUZZLE_TYPES.SEQUENTIAL_FIGURES,

    // Handle any legacy display names
    'Number Series': PUZZLE_TYPES.NUMBER_SERIES,
    'Pattern Recognition': PUZZLE_TYPES.PATTERN,
    'Algebraic Reasoning': PUZZLE_TYPES.ALGEBRAIC_REASONING,
    'Serial Reasoning': PUZZLE_TYPES.SERIAL_REASONING,
    'Number Analogy': PUZZLE_TYPES.NUMBER_ANALOGY
  };

  return normalizations[type] || null;
};