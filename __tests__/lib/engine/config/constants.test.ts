import {
  PUZZLE_TYPES,
  PUZZLE_TYPE_GROUPS,
  USER_STATES,
  USER_STATE_MODIFIERS,
  USER_STATE_GROUPS,
  LEARNING_TRENDS,
  SKILL_TARGETS,
  SKILL_TARGET_GROUPS,
  STORAGE_KEYS,
  CACHE_KEYS,
  DIFFICULTY,
  SUCCESS_RATES,
  USER_CLASSIFICATION,
  ENGAGEMENT,
  RETENTION_RISK,
  DATA_LIMITS,
  TIMING,
  POOL_DISTRIBUTION,
  USER_DEFAULTS,
  PUZZLE_DNA,
  ADAPTIVE_LEARNING,
  VIRAL,
  VALID_PUZZLE_TYPES,
  VALID_USER_STATES,
  VALID_USER_STATE_MODIFIERS,
  VALID_LEARNING_TRENDS,
  VALID_SKILL_TARGETS,
  isPuzzleTypeValid,
  isUserStateValid,
  isSkillTargetValid,
  normalizePuzzleType,
  PuzzleType,
  UserState,
  UserStateModifier,
  LearningTrend,
  SkillTarget,
  StorageKey,
  CacheKey
} from '../../../../src/lib/engine/config/constants';

describe('Adaptive Engine Constants', () => {
  describe('PUZZLE_TYPES', () => {
    it('should define all puzzle types', () => {
      expect(PUZZLE_TYPES.PATTERN).toBe('pattern');
      expect(PUZZLE_TYPES.NUMBER_SERIES).toBe('number-series');
      expect(PUZZLE_TYPES.NUMBER_ANALOGY).toBe('number-analogy');
      expect(PUZZLE_TYPES.ALGEBRAIC_REASONING).toBe('algebraic-reasoning');
      expect(PUZZLE_TYPES.SERIAL_REASONING).toBe('serial-reasoning');
      expect(PUZZLE_TYPES.NUMBER_GRID).toBe('number-grid');
      expect(PUZZLE_TYPES.TRANSFORMATION).toBe('transformation');
      expect(PUZZLE_TYPES.SEQUENTIAL_FIGURES).toBe('sequential-figures');
      expect(PUZZLE_TYPES.ANALOGY).toBe('analogy');
    });

    it('should have exactly 9 puzzle types', () => {
      expect(Object.keys(PUZZLE_TYPES).length).toBe(9);
    });
  });

  describe('PUZZLE_TYPE_GROUPS', () => {
    it('should define beginner-friendly puzzle types', () => {
      expect(PUZZLE_TYPE_GROUPS.BEGINNER_FRIENDLY).toContain(PUZZLE_TYPES.PATTERN);
      expect(PUZZLE_TYPE_GROUPS.BEGINNER_FRIENDLY).toContain(PUZZLE_TYPES.NUMBER_ANALOGY);
      expect(PUZZLE_TYPE_GROUPS.BEGINNER_FRIENDLY).toContain(PUZZLE_TYPES.ANALOGY);
      expect(PUZZLE_TYPE_GROUPS.BEGINNER_FRIENDLY.length).toBe(3);
    });

    it('should define advanced puzzle types', () => {
      expect(PUZZLE_TYPE_GROUPS.ADVANCED).toContain(PUZZLE_TYPES.ALGEBRAIC_REASONING);
      expect(PUZZLE_TYPE_GROUPS.ADVANCED).toContain(PUZZLE_TYPES.SERIAL_REASONING);
      expect(PUZZLE_TYPE_GROUPS.ADVANCED).toContain(PUZZLE_TYPES.NUMBER_GRID);
      expect(PUZZLE_TYPE_GROUPS.ADVANCED).toContain(PUZZLE_TYPES.TRANSFORMATION);
      expect(PUZZLE_TYPE_GROUPS.ADVANCED.length).toBe(4);
    });

    it('should define math-required puzzle types', () => {
      expect(PUZZLE_TYPE_GROUPS.MATH_REQUIRED).toContain(PUZZLE_TYPES.NUMBER_SERIES);
      expect(PUZZLE_TYPE_GROUPS.MATH_REQUIRED).toContain(PUZZLE_TYPES.NUMBER_ANALOGY);
      expect(PUZZLE_TYPE_GROUPS.MATH_REQUIRED).toContain(PUZZLE_TYPES.ALGEBRAIC_REASONING);
      expect(PUZZLE_TYPE_GROUPS.MATH_REQUIRED).toContain(PUZZLE_TYPES.NUMBER_GRID);
      expect(PUZZLE_TYPE_GROUPS.MATH_REQUIRED.length).toBe(4);
    });

    it('should include all puzzle types in ALL_PUZZLE_TYPES', () => {
      expect(PUZZLE_TYPE_GROUPS.ALL_PUZZLE_TYPES.length).toBe(9);
      Object.values(PUZZLE_TYPES).forEach(type => {
        expect(PUZZLE_TYPE_GROUPS.ALL_PUZZLE_TYPES).toContain(type);
      });
    });

    it('should categorize by cognitive load correctly', () => {
      expect(PUZZLE_TYPE_GROUPS.LOW_COGNITIVE_LOAD).toContain(PUZZLE_TYPES.PATTERN);
      expect(PUZZLE_TYPE_GROUPS.MEDIUM_COGNITIVE_LOAD).toContain(PUZZLE_TYPES.NUMBER_SERIES);
      expect(PUZZLE_TYPE_GROUPS.HIGH_COGNITIVE_LOAD).toContain(PUZZLE_TYPES.ALGEBRAIC_REASONING);
    });
  });

  describe('USER_STATES', () => {
    it('should define all user states', () => {
      expect(USER_STATES.NEW_USER).toBe('new_user');
      expect(USER_STATES.CHILD_LIKE_USER).toBe('child_like_user');
      expect(USER_STATES.SEVERELY_STRUGGLING).toBe('severely_struggling');
      expect(USER_STATES.STRUGGLING).toBe('struggling');
      expect(USER_STATES.FALLING_BACK).toBe('falling_back');
      expect(USER_STATES.STABLE).toBe('stable');
      expect(USER_STATES.PROGRESSING).toBe('progressing');
      expect(USER_STATES.EXCELLING).toBe('excelling');
      expect(USER_STATES.EXPERT_DEMANDING).toBe('expert_demanding');
    });

    it('should have exactly 9 user states', () => {
      expect(Object.keys(USER_STATES).length).toBe(9);
    });
  });

  describe('USER_STATE_MODIFIERS', () => {
    it('should define all modifiers', () => {
      expect(USER_STATE_MODIFIERS.CONFIDENCE_CRISIS).toBe('confidence_crisis');
      expect(USER_STATE_MODIFIERS.DISENGAGED).toBe('disengaged');
      expect(USER_STATE_MODIFIERS.POWER_DEPENDENT).toBe('power_dependent');
      expect(USER_STATE_MODIFIERS.FATIGUED).toBe('fatigued');
      expect(USER_STATE_MODIFIERS.SESSION_DECLINE).toBe('session_decline');
    });
  });

  describe('USER_STATE_GROUPS', () => {
    it('should group states that need support', () => {
      expect(USER_STATE_GROUPS.NEEDS_SUPPORT).toContain(USER_STATES.SEVERELY_STRUGGLING);
      expect(USER_STATE_GROUPS.NEEDS_SUPPORT).toContain(USER_STATES.STRUGGLING);
      expect(USER_STATE_GROUPS.NEEDS_SUPPORT).toContain(USER_STATES.FALLING_BACK);
    });

    it('should group states performing well', () => {
      expect(USER_STATE_GROUPS.PERFORMING_WELL).toContain(USER_STATES.PROGRESSING);
      expect(USER_STATE_GROUPS.PERFORMING_WELL).toContain(USER_STATES.EXCELLING);
      expect(USER_STATE_GROUPS.PERFORMING_WELL).toContain(USER_STATES.EXPERT_DEMANDING);
    });

    it('should group special handling states', () => {
      expect(USER_STATE_GROUPS.SPECIAL_HANDLING).toContain(USER_STATES.NEW_USER);
      expect(USER_STATE_GROUPS.SPECIAL_HANDLING).toContain(USER_STATES.CHILD_LIKE_USER);
    });
  });

  describe('LEARNING_TRENDS', () => {
    it('should define all learning trends', () => {
      expect(LEARNING_TRENDS.IMPROVING).toBe('improving');
      expect(LEARNING_TRENDS.STABLE).toBe('stable');
      expect(LEARNING_TRENDS.DECLINING).toBe('declining');
    });
  });

  describe('SKILL_TARGETS', () => {
    it('should define all skill targets', () => {
      expect(SKILL_TARGETS.PATTERN_RECOGNITION).toBe('pattern_recognition');
      expect(SKILL_TARGETS.LOGICAL_REASONING).toBe('logical_reasoning');
      expect(SKILL_TARGETS.SPATIAL_VISUALIZATION).toBe('spatial_visualization');
      expect(SKILL_TARGETS.WORKING_MEMORY).toBe('working_memory');
      expect(SKILL_TARGETS.PROCESSING_SPEED).toBe('processing_speed');
      expect(SKILL_TARGETS.ATTENTION_CONTROL).toBe('attention_control');
      expect(SKILL_TARGETS.MATHEMATICAL_REASONING).toBe('mathematical_reasoning');
      expect(SKILL_TARGETS.VERBAL_REASONING).toBe('verbal_reasoning');
      expect(SKILL_TARGETS.ABSTRACT_REASONING).toBe('abstract_reasoning');
    });

    it('should have exactly 9 skill targets', () => {
      expect(Object.keys(SKILL_TARGETS).length).toBe(9);
    });
  });

  describe('SKILL_TARGET_GROUPS', () => {
    it('should group skills for all ages', () => {
      expect(SKILL_TARGET_GROUPS.ALL_AGES).toContain(SKILL_TARGETS.PATTERN_RECOGNITION);
      expect(SKILL_TARGET_GROUPS.ALL_AGES).toContain(SKILL_TARGETS.SPATIAL_VISUALIZATION);
      expect(SKILL_TARGET_GROUPS.ALL_AGES).toContain(SKILL_TARGETS.PROCESSING_SPEED);
      expect(SKILL_TARGET_GROUPS.ALL_AGES).toContain(SKILL_TARGETS.ATTENTION_CONTROL);
    });

    it('should group advanced cognitive skills', () => {
      expect(SKILL_TARGET_GROUPS.ADVANCED_COGNITIVE).toContain(SKILL_TARGETS.ABSTRACT_REASONING);
      expect(SKILL_TARGET_GROUPS.ADVANCED_COGNITIVE).toContain(SKILL_TARGETS.WORKING_MEMORY);
      expect(SKILL_TARGET_GROUPS.ADVANCED_COGNITIVE).toContain(SKILL_TARGETS.LOGICAL_REASONING);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should define all storage keys', () => {
      expect(STORAGE_KEYS.USER_PROFILE).toBe('gm_user_profile');
      expect(STORAGE_KEYS.BEHAVIORAL_SIGNATURE).toBe('gm_behavioral_sig');
      expect(STORAGE_KEYS.SESSION_HISTORY).toBe('gm_session_hist');
      expect(STORAGE_KEYS.POWER_UP_DATA).toBe('gm_powerup_data');
      expect(STORAGE_KEYS.PUZZLE_DNAS).toBe('gm_puzzle_dnas');
      expect(STORAGE_KEYS.HIGH_SCORE).toBe('giftedMinds_highScore');
    });
  });

  describe('CACHE_KEYS', () => {
    it('should define all cache keys', () => {
      expect(CACHE_KEYS.USER_STATE_ANALYSIS).toBe('cache_user_state_analysis');
      expect(CACHE_KEYS.PUZZLE_RECOMMENDATIONS).toBe('cache_puzzle_recommendations');
      expect(CACHE_KEYS.DIFFICULTY_CALIBRATION).toBe('cache_difficulty_calibration');
      expect(CACHE_KEYS.ENGAGEMENT_METRICS).toBe('cache_engagement_metrics');
    });
  });

  describe('DIFFICULTY constants', () => {
    it('should define escalation parameters', () => {
      expect(DIFFICULTY.ESCALATION_RATE).toBe(0.05);
      expect(DIFFICULTY.PLATEAU_THRESHOLD).toBe(0.85);
      expect(DIFFICULTY.SMOOTHING_FACTOR).toBe(0.3);
    });

    it('should define difficulty adjustments', () => {
      expect(DIFFICULTY.AGGRESSIVE_ADJUSTMENT).toBe(0.15);
      expect(DIFFICULTY.GRADUAL_ADJUSTMENT).toBe(0.1);
      expect(DIFFICULTY.MODERATE_ADJUSTMENT).toBe(0.08);
      expect(DIFFICULTY.SMALL_ADJUSTMENT).toBe(0.05);
    });

    it('should define base difficulty values', () => {
      expect(DIFFICULTY.EASY_BASE).toBe(0.1);
      expect(DIFFICULTY.MEDIUM_BASE).toBe(0.4);
      expect(DIFFICULTY.HARD_BASE).toBe(0.7);
    });

    it('should define constraint limits', () => {
      expect(DIFFICULTY.EXPERT_MINIMUM).toBe(0.7);
      expect(DIFFICULTY.CHILD_MAXIMUM).toBe(0.5);
      expect(DIFFICULTY.NEW_USER_PROTECTION_CAP).toBe(0.4);
    });

    it('should define impact multipliers', () => {
      expect(DIFFICULTY.VISUAL_COMPLEXITY_IMPACT).toBe(0.1);
      expect(DIFFICULTY.RULE_DEPTH_IMPACT).toBe(0.15);
      expect(DIFFICULTY.PATTERN_SOPHISTICATION_IMPACT).toBe(0.1);
      expect(DIFFICULTY.ABSTRACTION_IMPACT).toBe(0.08);
      expect(DIFFICULTY.TIME_IMPACT).toBe(0.05);
      expect(DIFFICULTY.ERROR_PRONENESS_IMPACT).toBe(0.05);
      expect(DIFFICULTY.EXPERTISE_IMPACT).toBe(0.05);
    });

    it('should define bonuses', () => {
      expect(DIFFICULTY.MULTI_STEP_BONUS).toBe(0.05);
      expect(DIFFICULTY.HIGH_MEMORY_BONUS).toBe(0.08);
      expect(DIFFICULTY.MEDIUM_MEMORY_BONUS).toBe(0.03);
    });
  });

  describe('SUCCESS_RATES', () => {
    it('should define success rate thresholds', () => {
      expect(SUCCESS_RATES.SEVERELY_STRUGGLING).toBe(0.3);
      expect(SUCCESS_RATES.STRUGGLING).toBe(0.5);
      expect(SUCCESS_RATES.PROGRESSING).toBe(0.6);
      expect(SUCCESS_RATES.EXCELLING).toBe(0.8);
      expect(SUCCESS_RATES.EXPERT_DEMANDING).toBe(0.9);
    });

    it('should define optimal targets', () => {
      expect(SUCCESS_RATES.OPTIMAL_TARGET).toBe(0.7);
      expect(SUCCESS_RATES.OPTIMAL_RANGE).toBe(0.1);
    });
  });

  describe('USER_CLASSIFICATION', () => {
    it('should define new user threshold', () => {
      expect(USER_CLASSIFICATION.NEW_USER_PUZZLE_COUNT).toBe(10);
    });

    it('should define child-like user detection thresholds', () => {
      expect(USER_CLASSIFICATION.CHILD_RESPONSE_TIME_THRESHOLD).toBe(8000);
      expect(USER_CLASSIFICATION.CHILD_SKILL_LEVEL_MAX).toBe(0.55);
      expect(USER_CLASSIFICATION.CHILD_PUZZLE_COUNT_MIN).toBe(10);
      expect(USER_CLASSIFICATION.CHILD_PUZZLE_COUNT_MAX).toBe(50);
      expect(USER_CLASSIFICATION.CHILD_MATH_CAPABILITY_THRESHOLD).toBe(0.6);
    });

    it('should define momentum thresholds', () => {
      expect(USER_CLASSIFICATION.NEGATIVE_MOMENTUM_THRESHOLD).toBe(-0.2);
      expect(USER_CLASSIFICATION.SLIGHT_NEGATIVE_MOMENTUM).toBe(-0.1);
      expect(USER_CLASSIFICATION.POSITIVE_MOMENTUM_THRESHOLD).toBe(0.1);
      expect(USER_CLASSIFICATION.HIGH_POSITIVE_MOMENTUM).toBe(0.15);
    });

    it('should define failure thresholds', () => {
      expect(USER_CLASSIFICATION.CONFIDENCE_CRISIS_FAILURES).toBe(3);
      expect(USER_CLASSIFICATION.EMERGENCY_SUPPORT_FAILURES).toBe(5);
    });

    it('should define dependency thresholds', () => {
      expect(USER_CLASSIFICATION.MODERATE_DEPENDENCY).toBe(0.5);
      expect(USER_CLASSIFICATION.HIGH_DEPENDENCY).toBe(0.7);
    });
  });

  describe('ENGAGEMENT', () => {
    it('should define engagement level thresholds', () => {
      expect(ENGAGEMENT.DISENGAGED_THRESHOLD).toBe(0.4);
      expect(ENGAGEMENT.LOW_ENGAGEMENT).toBe(0.5);
      expect(ENGAGEMENT.MODERATE_ENGAGEMENT).toBe(0.6);
      expect(ENGAGEMENT.HIGH_ENGAGEMENT).toBe(0.7);
      expect(ENGAGEMENT.FLOW_STATE_THRESHOLD).toBe(0.8);
    });

    it('should define variety and challenge deficits', () => {
      expect(ENGAGEMENT.VARIETY_DEFICIT_MODERATE).toBe(0.15);
      expect(ENGAGEMENT.VARIETY_DEFICIT_CRITICAL).toBe(0.2);
      expect(ENGAGEMENT.CHALLENGE_DEFICIT_MODERATE).toBe(0.2);
      expect(ENGAGEMENT.CHALLENGE_DEFICIT_SIGNIFICANT).toBe(0.3);
    });

    it('should define expert boredom threshold', () => {
      expect(ENGAGEMENT.EXPERT_BOREDOM_THRESHOLD).toBe(0.6);
    });
  });

  describe('RETENTION_RISK', () => {
    it('should define base churn risk', () => {
      expect(RETENTION_RISK.BASE_CHURN_RISK).toBe(0.1);
    });

    it('should define churn probability adjustments', () => {
      expect(RETENTION_RISK.CHALLENGE_DEFICIT_PENALTY).toBe(0.4);
      expect(RETENTION_RISK.VARIETY_DEFICIT_PENALTY).toBe(0.2);
      expect(RETENTION_RISK.SATISFACTION_DECLINE_PENALTY).toBe(0.3);
      expect(RETENTION_RISK.ENGAGEMENT_DECLINE_PENALTY).toBe(0.15);
    });

    it('should define churn risk thresholds', () => {
      expect(RETENTION_RISK.LOW_CHURN_RISK).toBe(0.4);
      expect(RETENTION_RISK.MEDIUM_CHURN_RISK).toBe(0.6);
      expect(RETENTION_RISK.HIGH_CHURN_RISK).toBe(0.8);
      expect(RETENTION_RISK.CRITICAL_CHURN_RISK).toBe(0.95);
    });

    it('should define expected values by user state', () => {
      expect(RETENTION_RISK.EXPERT_EXPECTED_DIFFICULTY).toBe(0.8);
      expect(RETENTION_RISK.EXCELLING_EXPECTED_DIFFICULTY).toBe(0.7);
      expect(RETENTION_RISK.GENERAL_EXPECTED_DIFFICULTY).toBe(0.6);
      expect(RETENTION_RISK.EXPERT_EXPECTED_VARIETY).toBe(4);
      expect(RETENTION_RISK.GENERAL_EXPECTED_VARIETY).toBe(3);
    });
  });

  describe('DATA_LIMITS', () => {
    it('should define history tracking limits', () => {
      expect(DATA_LIMITS.SESSION_HISTORY_LIMIT).toBe(50);
      expect(DATA_LIMITS.RECENT_SESSIONS_LIMIT).toBe(20);
      expect(DATA_LIMITS.PUZZLE_DNA_CACHE_LIMIT).toBe(100);
      expect(DATA_LIMITS.STATE_HISTORY_LIMIT).toBe(10);
      expect(DATA_LIMITS.POWER_UP_EVENTS_LIMIT).toBe(100);
      expect(DATA_LIMITS.PURCHASE_HISTORY_LIMIT).toBe(20);
    });

    it('should define analysis requirements', () => {
      expect(DATA_LIMITS.MIN_DATA_POINTS_DIFFICULTY).toBe(5);
      expect(DATA_LIMITS.MIN_DATA_POINTS_SKILL_ASSESSMENT).toBe(3);
      expect(DATA_LIMITS.MIN_DATA_POINTS_MEMORY_ASSESSMENT).toBe(3);
      expect(DATA_LIMITS.MIN_DATA_POINTS_ATTENTION_ASSESSMENT).toBe(4);
      expect(DATA_LIMITS.MIN_DATA_POINTS_ENGAGEMENT).toBe(10);
    });

    it('should define confidence levels', () => {
      expect(DATA_LIMITS.FULL_CONFIDENCE_PUZZLES).toBe(10);
      expect(DATA_LIMITS.HIGH_CONFIDENCE_PUZZLES).toBe(5);
      expect(DATA_LIMITS.MODERATE_CONFIDENCE_PUZZLES).toBe(3);
      expect(DATA_LIMITS.LOW_CONFIDENCE_PUZZLES).toBe(1);
    });
  });

  describe('TIMING', () => {
    it('should define sync cooldown', () => {
      expect(TIMING.SYNC_COOLDOWN_MS).toBe(5 * 60 * 1000);
    });

    it('should define puzzle DNA analysis timing', () => {
      expect(TIMING.BASE_SOLVE_TIME_MS).toBe(5000);
      expect(TIMING.MAX_SOLVE_TIME_MS).toBe(60000);
      expect(TIMING.TIME_PER_ELEMENT_MS).toBe(200);
      expect(TIMING.TIME_PER_RULE_DEPTH_MS).toBe(3000);
      expect(TIMING.TIME_PER_UNIQUE_ELEMENT_MS).toBe(500);
    });

    it('should define response time categories', () => {
      expect(TIMING.FAST_RESPONSE_MS).toBe(3000);
      expect(TIMING.NORMAL_RESPONSE_MS).toBe(5000);
      expect(TIMING.SLOW_RESPONSE_MS).toBe(8000);
      expect(TIMING.VERY_SLOW_RESPONSE_MS).toBe(12000);
    });

    it('should define session duration thresholds', () => {
      expect(TIMING.SHORT_SESSION_MS).toBe(2 * 60 * 1000);
      expect(TIMING.NORMAL_SESSION_MS).toBe(10 * 60 * 1000);
      expect(TIMING.LONG_SESSION_MS).toBe(20 * 60 * 1000);
      expect(TIMING.VERY_LONG_SESSION_MS).toBe(30 * 60 * 1000);
    });
  });

  describe('POOL_DISTRIBUTION', () => {
    it('should define total pool size', () => {
      expect(POOL_DISTRIBUTION.TOTAL_POOL_SIZE).toBe(10);
    });

    it('should define distributions for each user state', () => {
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.CHILD_LIKE_USER]).toEqual([8, 2, 0, 0, 0]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.NEW_USER]).toEqual([7, 2, 1, 0, 0]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.SEVERELY_STRUGGLING]).toEqual([6, 2, 0, 2, 0]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.STRUGGLING]).toEqual([4, 3, 1, 2, 0]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.FALLING_BACK]).toEqual([5, 2, 1, 2, 0]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.STABLE]).toEqual([2, 4, 3, 0, 1]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.PROGRESSING]).toEqual([2, 3, 4, 0, 1]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.EXCELLING]).toEqual([1, 2, 4, 0, 3]);
      expect(POOL_DISTRIBUTION.DISTRIBUTIONS[USER_STATES.EXPERT_DEMANDING]).toEqual([0, 1, 7, 0, 2]);
    });

    it('should verify all distributions sum to pool size', () => {
      Object.values(POOL_DISTRIBUTION.DISTRIBUTIONS).forEach(distribution => {
        const sum = distribution.reduce((acc, val) => acc + val, 0);
        expect(sum).toBe(POOL_DISTRIBUTION.TOTAL_POOL_SIZE);
      });
    });

    it('should define strength-based adjustments', () => {
      expect(POOL_DISTRIBUTION.CONFIDENCE_BOOST).toBe(3);
      expect(POOL_DISTRIBUTION.CHALLENGE_REDUCTION).toBe(2);
      expect(POOL_DISTRIBUTION.VISUAL_PATTERN_BOOST).toBe(2);
      expect(POOL_DISTRIBUTION.SKILL_DEVELOPMENT_REDUCTION).toBe(1);
    });

    it('should define modifier adjustments', () => {
      expect(POOL_DISTRIBUTION.CONFIDENCE_CRISIS_BOOST).toBe(2);
      expect(POOL_DISTRIBUTION.DISENGAGED_RECOVERY_BOOST).toBe(2);
      expect(POOL_DISTRIBUTION.FATIGUED_CHALLENGE_REDUCTION).toBe(2);
    });
  });

  describe('USER_DEFAULTS', () => {
    it('should define initial skill levels', () => {
      expect(USER_DEFAULTS.INITIAL_SKILL_LEVEL).toBe(0.3);
      expect(USER_DEFAULTS.INITIAL_MAX_DIFFICULTY).toBe(0.4);
      expect(USER_DEFAULTS.INITIAL_PROGRESSION_RATE).toBe(0.5);
      expect(USER_DEFAULTS.INITIAL_GROWTH_TARGET).toBe(10);
      expect(USER_DEFAULTS.INITIAL_POWER_UP_INVENTORY).toBe(10);
    });

    it('should define cognitive profile defaults', () => {
      expect(USER_DEFAULTS.DEFAULT_PROCESSING_SPEED).toBe(0.5);
      expect(USER_DEFAULTS.DEFAULT_WORKING_MEMORY).toBe(0.5);
      expect(USER_DEFAULTS.DEFAULT_ATTENTION_CONTROL).toBe(0.5);
      expect(USER_DEFAULTS.DEFAULT_ERROR_RECOVERY).toBe(0.5);
      expect(USER_DEFAULTS.DEFAULT_OPTIMAL_SESSION_LENGTH).toBe(15);
      expect(USER_DEFAULTS.DEFAULT_PEAK_PERFORMANCE_HOUR).toBe(19);
      expect(USER_DEFAULTS.DEFAULT_FATIGUE_RESISTANCE).toBe(0.7);
    });

    it('should define engagement patterns', () => {
      expect(USER_DEFAULTS.DEFAULT_RESPONSE_TIME).toBe(5000);
      expect(USER_DEFAULTS.DEFAULT_HESITATION_TENDENCY).toBe(0.3);
      expect(USER_DEFAULTS.DEFAULT_POWER_UP_DEPENDENCY).toBe(0.2);
      expect(USER_DEFAULTS.DEFAULT_FLOW_DURATION).toBe(5);
      expect(USER_DEFAULTS.DEFAULT_OPTIMAL_CHALLENGE_LEVEL).toBe(0.6);
    });
  });

  describe('PUZZLE_DNA', () => {
    it('should define visual complexity analysis factors', () => {
      expect(PUZZLE_DNA.ELEMENT_COUNT_DIFFICULTY_FACTOR).toBe(20);
      expect(PUZZLE_DNA.COLOR_VARIETY_DIFFICULTY_FACTOR).toBe(20);
      expect(PUZZLE_DNA.VISUAL_NOISE_MULTIPLIER).toBe(0.05);
    });

    it('should define memory requirement thresholds', () => {
      expect(PUZZLE_DNA.HIGH_MEMORY_ELEMENT_THRESHOLD).toBe(15);
      expect(PUZZLE_DNA.MEDIUM_MEMORY_ELEMENT_THRESHOLD).toBe(8);
    });

    it('should define pattern sophistication normalizers', () => {
      expect(PUZZLE_DNA.WORD_COUNT_NORMALIZER).toBe(20);
      expect(PUZZLE_DNA.WORD_LENGTH_NORMALIZER).toBe(10);
      expect(PUZZLE_DNA.SPECIAL_CHAR_NORMALIZER).toBe(10);
    });

    it('should define similarity calculation factors', () => {
      expect(PUZZLE_DNA.ELEMENT_COUNT_SIMILARITY_NORMALIZER).toBe(50);
      expect(PUZZLE_DNA.COLOR_VARIETY_SIMILARITY_NORMALIZER).toBe(10);
      expect(PUZZLE_DNA.RULE_DEPTH_SIMILARITY_NORMALIZER).toBe(5);
    });

    it('should define abstraction and error factors', () => {
      expect(PUZZLE_DNA.ABSTRACTION_KEYWORD_BOOST).toBe(0.2);
      expect(PUZZLE_DNA.VISUAL_NOISE_ERROR_FACTOR).toBe(0.3);
      expect(PUZZLE_DNA.COLOR_VARIETY_ERROR_FACTOR).toBe(0.4);
      expect(PUZZLE_DNA.RULE_DEPTH_ERROR_FACTOR).toBe(0.15);
    });

    it('should define time estimate update weights', () => {
      expect(PUZZLE_DNA.TIME_ESTIMATE_UPDATE_WEIGHT_NEW).toBe(0.7);
      expect(PUZZLE_DNA.TIME_ESTIMATE_UPDATE_WEIGHT_OLD).toBe(0.3);
    });
  });

  describe('ADAPTIVE_LEARNING', () => {
    it('should define confidence weighting', () => {
      expect(ADAPTIVE_LEARNING.NEW_DATA_WEIGHT).toBe(0.7);
      expect(ADAPTIVE_LEARNING.EXISTING_DATA_WEIGHT).toBe(0.3);
      expect(ADAPTIVE_LEARNING.DATA_WEIGHT_FACTOR).toBe(0.1);
      expect(ADAPTIVE_LEARNING.CONSERVATIVE_UPDATE_WEIGHT).toBe(0.1);
    });

    it('should define confidence intervals', () => {
      expect(ADAPTIVE_LEARNING.LOW_CONFIDENCE).toBe(0.5);
      expect(ADAPTIVE_LEARNING.MODERATE_CONFIDENCE).toBe(0.7);
      expect(ADAPTIVE_LEARNING.HIGH_CONFIDENCE).toBe(0.8);
      expect(ADAPTIVE_LEARNING.VERY_HIGH_CONFIDENCE).toBe(0.9);
      expect(ADAPTIVE_LEARNING.MAX_CONFIDENCE).toBe(0.95);
    });

    it('should define processing speed assessment', () => {
      expect(ADAPTIVE_LEARNING.MIN_PUZZLES_PER_MINUTE).toBe(0.5);
      expect(ADAPTIVE_LEARNING.MAX_PUZZLES_PER_MINUTE).toBe(3.0);
      expect(ADAPTIVE_LEARNING.PUZZLES_PER_MINUTE_RANGE).toBe(2.5);
    });

    it('should define memory and attention assessment', () => {
      expect(ADAPTIVE_LEARNING.HIGH_DIFFICULTY_THRESHOLD).toBe(0.6);
      expect(ADAPTIVE_LEARNING.MEMORY_PERFORMANCE_BONUS).toBe(1.0);
      expect(ADAPTIVE_LEARNING.ATTENTION_NOISE_THRESHOLD).toBe(0.6);
      expect(ADAPTIVE_LEARNING.ATTENTION_COLOR_VARIETY_THRESHOLD).toBe(8);
    });

    it('should define skill progression', () => {
      expect(ADAPTIVE_LEARNING.SKILL_PROGRESSION_RATE).toBe(0.1);
      expect(ADAPTIVE_LEARNING.ACCURACY_CONFIDENCE_WEIGHT).toBe(0.1);
      expect(ADAPTIVE_LEARNING.ACCURACY_WEIGHT_FACTOR).toBe(0.3);
      expect(ADAPTIVE_LEARNING.ENGAGEMENT_INFLUENCE).toBe(0.05);
    });
  });

  describe('VIRAL', () => {
    it('should define viral trigger thresholds', () => {
      expect(VIRAL.VIRAL_LEVEL_THRESHOLD).toBe(15);
      expect(VIRAL.POINTS_PER_LEVEL).toBe(30);
    });

    it('should define pre-viral optimization parameters', () => {
      expect(VIRAL.PRE_VIRAL_STRENGTH_FOCUS_PERCENTAGE).toBe(0.8);
      expect(VIRAL.PRE_VIRAL_SUCCESS_TARGET).toBe(0.75);
    });
  });

  describe('Type Definitions', () => {
    it('should export valid type definitions', () => {
      const puzzleType: PuzzleType = PUZZLE_TYPES.PATTERN;
      expect(puzzleType).toBe('pattern');

      const userState: UserState = USER_STATES.STABLE;
      expect(userState).toBe('stable');

      const modifier: UserStateModifier = USER_STATE_MODIFIERS.FATIGUED;
      expect(modifier).toBe('fatigued');

      const trend: LearningTrend = LEARNING_TRENDS.IMPROVING;
      expect(trend).toBe('improving');

      const skill: SkillTarget = SKILL_TARGETS.PATTERN_RECOGNITION;
      expect(skill).toBe('pattern_recognition');

      const storage: StorageKey = STORAGE_KEYS.USER_PROFILE;
      expect(storage).toBe('gm_user_profile');

      const cache: CacheKey = CACHE_KEYS.USER_STATE_ANALYSIS;
      expect(cache).toBe('cache_user_state_analysis');
    });
  });

  describe('Validation Arrays', () => {
    it('should export valid puzzle types array', () => {
      expect(VALID_PUZZLE_TYPES).toHaveLength(9);
      expect(VALID_PUZZLE_TYPES).toContain(PUZZLE_TYPES.PATTERN);
      expect(VALID_PUZZLE_TYPES).toContain(PUZZLE_TYPES.NUMBER_SERIES);
      expect(VALID_PUZZLE_TYPES).toEqual(Object.values(PUZZLE_TYPES));
    });

    it('should export valid user states array', () => {
      expect(VALID_USER_STATES).toHaveLength(9);
      expect(VALID_USER_STATES).toContain(USER_STATES.NEW_USER);
      expect(VALID_USER_STATES).toContain(USER_STATES.EXPERT_DEMANDING);
      expect(VALID_USER_STATES).toEqual(Object.values(USER_STATES));
    });

    it('should export valid user state modifiers array', () => {
      expect(VALID_USER_STATE_MODIFIERS).toHaveLength(5);
      expect(VALID_USER_STATE_MODIFIERS).toContain(USER_STATE_MODIFIERS.CONFIDENCE_CRISIS);
      expect(VALID_USER_STATE_MODIFIERS).toEqual(Object.values(USER_STATE_MODIFIERS));
    });

    it('should export valid learning trends array', () => {
      expect(VALID_LEARNING_TRENDS).toHaveLength(3);
      expect(VALID_LEARNING_TRENDS).toContain(LEARNING_TRENDS.IMPROVING);
      expect(VALID_LEARNING_TRENDS).toEqual(Object.values(LEARNING_TRENDS));
    });

    it('should export valid skill targets array', () => {
      expect(VALID_SKILL_TARGETS).toHaveLength(9);
      expect(VALID_SKILL_TARGETS).toContain(SKILL_TARGETS.PATTERN_RECOGNITION);
      expect(VALID_SKILL_TARGETS).toEqual(Object.values(SKILL_TARGETS));
    });
  });

  describe('Validation Functions', () => {
    describe('isPuzzleTypeValid', () => {
      it('should return true for valid puzzle types', () => {
        expect(isPuzzleTypeValid('pattern')).toBe(true);
        expect(isPuzzleTypeValid('number-series')).toBe(true);
        expect(isPuzzleTypeValid('transformation')).toBe(true);
      });

      it('should return false for invalid puzzle types', () => {
        expect(isPuzzleTypeValid('invalid-type')).toBe(false);
        expect(isPuzzleTypeValid('Pattern')).toBe(false);
        expect(isPuzzleTypeValid('')).toBe(false);
      });
    });

    describe('isUserStateValid', () => {
      it('should return true for valid user states', () => {
        expect(isUserStateValid('new_user')).toBe(true);
        expect(isUserStateValid('stable')).toBe(true);
        expect(isUserStateValid('expert_demanding')).toBe(true);
      });

      it('should return false for invalid user states', () => {
        expect(isUserStateValid('invalid_state')).toBe(false);
        expect(isUserStateValid('NEW_USER')).toBe(false);
        expect(isUserStateValid('')).toBe(false);
      });
    });

    describe('isSkillTargetValid', () => {
      it('should return true for valid skill targets', () => {
        expect(isSkillTargetValid('pattern_recognition')).toBe(true);
        expect(isSkillTargetValid('logical_reasoning')).toBe(true);
        expect(isSkillTargetValid('abstract_reasoning')).toBe(true);
      });

      it('should return false for invalid skill targets', () => {
        expect(isSkillTargetValid('invalid_skill')).toBe(false);
        expect(isSkillTargetValid('PATTERN_RECOGNITION')).toBe(false);
        expect(isSkillTargetValid('')).toBe(false);
      });
    });
  });

  describe('normalizePuzzleType', () => {
    it('should return valid puzzle types as-is', () => {
      expect(normalizePuzzleType('pattern')).toBe('pattern');
      expect(normalizePuzzleType('number-series')).toBe('number-series');
      expect(normalizePuzzleType('transformation')).toBe('transformation');
    });

    it('should normalize camelCase variations', () => {
      expect(normalizePuzzleType('numberSeries')).toBe('number-series');
      expect(normalizePuzzleType('numberAnalogy')).toBe('number-analogy');
      expect(normalizePuzzleType('algebraicReasoning')).toBe('algebraic-reasoning');
      expect(normalizePuzzleType('serialReasoning')).toBe('serial-reasoning');
      expect(normalizePuzzleType('numberGrid')).toBe('number-grid');
      expect(normalizePuzzleType('sequentialFigures')).toBe('sequential-figures');
    });

    it('should normalize display names', () => {
      expect(normalizePuzzleType('Number Series')).toBe('number-series');
      expect(normalizePuzzleType('Pattern Recognition')).toBe('pattern');
      expect(normalizePuzzleType('Algebraic Reasoning')).toBe('algebraic-reasoning');
      expect(normalizePuzzleType('Serial Reasoning')).toBe('serial-reasoning');
      expect(normalizePuzzleType('Number Analogy')).toBe('number-analogy');
    });

    it('should return null for unknown variations', () => {
      expect(normalizePuzzleType('unknown-type')).toBeNull();
      expect(normalizePuzzleType('InvalidType')).toBeNull();
      expect(normalizePuzzleType('')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle numeric boundary values correctly', () => {
      expect(DIFFICULTY.ESCALATION_RATE).toBeGreaterThan(0);
      expect(DIFFICULTY.PLATEAU_THRESHOLD).toBeLessThan(1);
      expect(SUCCESS_RATES.OPTIMAL_TARGET + SUCCESS_RATES.OPTIMAL_RANGE).toBeLessThanOrEqual(1);
      expect(SUCCESS_RATES.OPTIMAL_TARGET - SUCCESS_RATES.OPTIMAL_RANGE).toBeGreaterThanOrEqual(0);
    });

    it('should ensure all percentages are between 0 and 1', () => {
      Object.values(SUCCESS_RATES).forEach(rate => {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(1);
      });

      Object.values(ENGAGEMENT).forEach(value => {
        if (typeof value === 'number') {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should ensure all time values are positive', () => {
      Object.entries(TIMING).forEach(([key, value]) => {
        if (key.includes('_MS')) {
          expect(value).toBeGreaterThan(0);
        }
      });
    });

    it('should ensure pool distributions are consistent', () => {
      Object.entries(POOL_DISTRIBUTION.DISTRIBUTIONS).forEach(([state, distribution]) => {
        expect(Array.isArray(distribution)).toBe(true);
        expect(distribution.length).toBe(5);
        distribution.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(POOL_DISTRIBUTION.TOTAL_POOL_SIZE);
        });
      });
    });

    it('should ensure all limits are positive integers', () => {
      Object.entries(DATA_LIMITS).forEach(([key, value]) => {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
      });
    });

    it('should ensure consistency across related constants', () => {
      expect(USER_CLASSIFICATION.CHILD_PUZZLE_COUNT_MIN).toBeLessThan(USER_CLASSIFICATION.CHILD_PUZZLE_COUNT_MAX);
      expect(ENGAGEMENT.VARIETY_DEFICIT_MODERATE).toBeLessThan(ENGAGEMENT.VARIETY_DEFICIT_CRITICAL);
      expect(RETENTION_RISK.LOW_CHURN_RISK).toBeLessThan(RETENTION_RISK.MEDIUM_CHURN_RISK);
      expect(RETENTION_RISK.MEDIUM_CHURN_RISK).toBeLessThan(RETENTION_RISK.HIGH_CHURN_RISK);
      expect(RETENTION_RISK.HIGH_CHURN_RISK).toBeLessThan(RETENTION_RISK.CRITICAL_CHURN_RISK);
    });
  });
});