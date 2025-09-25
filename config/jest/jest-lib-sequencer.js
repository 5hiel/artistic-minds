/**
 * Custom test sequencer for lib folder
 * Prioritizes critical tests first for fast-fail detection
 */

const Sequencer = require('@jest/test-sequencer').default;

class LibTestSequencer extends Sequencer {
  sort(tests) {
    // Define test priority order (most critical first)
    const priorityOrder = [
      // Core puzzle generation (highest priority - used everywhere)
      'basePuzzle.test.ts',
      'infinite-puzzle-generator.test.ts',

      // Services (high priority - user-facing functionality)
      'viralMessage.test.ts',
      'monitoring.test.ts',

      // Individual puzzle types (medium priority - specific failures)
      'patternPuzzles.test.ts',
      'numberSeriesPuzzles.test.ts',
      'algebraicReasoningPuzzles.test.ts',
      'serialReasoningPuzzles.test.ts',
      'numberAnalogies.test.ts',
      'analogyPuzzles.test.ts',

      // Complex puzzle types (can run later)
      'numberGridPuzzles.test.ts',
      'sequentialFiguresPuzzles.test.ts',
      'transformationPuzzles.test.ts',
      'figureClassificationPuzzles.test.ts',
      'pictureSeriesPuzzles.test.ts',
      'paperFoldingPuzzles.test.ts',
      'followingDirectionsPuzzles.test.ts',

      // Storage and configuration (lower priority)
      'ratingPrompt.test.ts',
      'highScoreStorage.test.ts',

      // Adaptive engine metrics (lowest priority - complex algorithms)
      'adaptiveMetrics.test.ts'
    ];

    const sortedTests = [];
    const remainingTests = [...tests];

    // Sort by priority first
    priorityOrder.forEach(priorityFile => {
      const index = remainingTests.findIndex(test => test.path.includes(priorityFile));
      if (index !== -1) {
        sortedTests.push(remainingTests.splice(index, 1)[0]);
      }
    });

    // Add remaining tests
    sortedTests.push(...remainingTests);

    console.log('🎯 Lib test execution order (fast-fail priority):');
    sortedTests.slice(0, 5).forEach((test, i) => {
      const filename = test.path.split('/').pop();
      console.log(`  ${i + 1}. ${filename} ${i < 2 ? '(CRITICAL)' : i < 7 ? '(HIGH)' : '(LOW)'}`);
    });

    return sortedTests;
  }
}

module.exports = LibTestSequencer;