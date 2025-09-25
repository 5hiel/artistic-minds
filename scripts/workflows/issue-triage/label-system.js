/**
 * SIMPLIFIED Label System for Gifted Minds
 *
 * Clear, minimal, no-overlap labeling system.
 * Each issue gets exactly ONE label from each category (max 3 labels total).
 */

// Simple, clear label system with NO overlap
const GIFTED_MINDS_LABELS = {
  // WHAT TYPE? (Required - exactly one)
  TYPE: {
    'bug': { color: 'd73a4a', description: '🐛 Something is broken' },
    'feature': { color: '0075ca', description: '✨ New functionality' },
    'feedback': { color: '7057ff', description: '💬 User feedback' },
    'testing': { color: '28a745', description: '🧪 Test coverage' }
  },

  // HOW URGENT? (Required - exactly one)
  PRIORITY: {
    'urgent': { color: 'd73a4a', description: '🚨 Fix immediately' },
    'normal': { color: 'fbca04', description: '⭐ Standard priority' },
    'low': { color: '0e8a16', description: '💡 When time permits' }
  },

  // WHERE? (Optional - one if relevant)
  AREA: {
    'puzzles': { color: 'bfd4f2', description: '🧩 Puzzle system' },
    'scoring': { color: 'f9ca24', description: '🏆 Points & levels' },
    'ui': { color: '7057ff', description: '🎨 User interface' },
    'performance': { color: 'f9d0c4', description: '⚡ Speed & memory' }
  }
};

// Get all labels as a flat array for GitHub API
function getAllLabels() {
  const allLabels = [];

  Object.values(GIFTED_MINDS_LABELS).forEach(category => {
    Object.entries(category).forEach(([name, config]) => {
      allLabels.push({
        name,
        color: config.color,
        description: config.description
      });
    });
  });

  return allLabels;
}

// Get labels by category
function getLabelsByCategory(category) {
  return GIFTED_MINDS_LABELS[category] || {};
}

// Check if a label exists in the system
function isValidLabel(labelName) {
  return getAllLabels().some(label => label.name === labelName);
}

// Simple label sets - NO OVERLAP, clear purpose
const LABEL_SETS = {
  // Test coverage issues: testing + normal (standard)
  TEST_COVERAGE: ['testing', 'normal'],

  // App Store feedback: feedback + varies by content
  USER_FEEDBACK: ['feedback'],

  // New unlabeled issues: needs manual categorization
  NEEDS_TRIAGE: [], // Will be categorized by triage script

  // Common combinations
  BUG_URGENT: ['bug', 'urgent'],
  BUG_NORMAL: ['bug', 'normal'],
  FEATURE_NORMAL: ['feature', 'normal'],
  PUZZLE_BUG: ['bug', 'normal', 'puzzles'],
  UI_BUG: ['bug', 'normal', 'ui']
};

// Rules for automated labeling
const LABELING_RULES = {
  // If title/body contains these words → apply these labels
  KEYWORDS: {
    'crash': ['bug', 'urgent'],
    'broken': ['bug', 'urgent'],
    'slow': ['bug', 'normal', 'performance'],
    'puzzle': ['puzzles'],
    'score': ['scoring'],
    'interface': ['ui'],
    'suggest': ['feature', 'normal'],
    'feature': ['feature', 'normal']
  }
};

module.exports = {
  GIFTED_MINDS_LABELS,
  getAllLabels,
  getLabelsByCategory,
  isValidLabel,
  LABEL_SETS,
  LABELING_RULES
};