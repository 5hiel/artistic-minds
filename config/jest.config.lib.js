/**
 * Fast-fail Jest configuration optimized for lib folder testing
 * Designed to run under 2 minutes with early issue detection
 */

module.exports = {
  // Inherit base config
  ...require('./jest.config.js'),

  // Test targeting - lib folder only
  testMatch: [
    "<rootDir>/../__tests__/lib/**/*.(test|spec).(ts|tsx|js)"
  ],

  // Fast-fail strategy
  bail: false, // Temporarily disabled to see all results
  collectCoverage: false, // Coverage disabled for performance

  // Memory optimizations
  maxWorkers: 2, // Slightly more workers for lib tests (safer than adaptive engine)
  workerIdleMemoryLimit: "256MB", // Aggressive memory limiting
  maxConcurrency: 3, // Limit concurrent tests per worker

  // Timeout strategy
  testTimeout: 15000, // 15 seconds max per test (strict)

  // Performance optimizations
  verbose: false,
  collectCoverage: false, // Disable coverage for speed
  detectOpenHandles: false,
  forceExit: true,

  // Cache optimization
  cacheDirectory: "<rootDir>/.jest-cache-lib",

  // Test ordering - run critical tests first
  testSequencer: '<rootDir>/jest/jest-lib-sequencer.js',

  // Mock setup for heavy dependencies
  setupFiles: ['<rootDir>/jest/jest-lib-mocks.js'],

  // Global setup for lib tests
  globalSetup: '<rootDir>/jest/jest-lib-setup.js',
  globalTeardown: '<rootDir>/jest/jest-lib-teardown.js',

  // Coverage for lib only (when needed)
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "!lib/**/__tests__/**",
    "!lib/**/*.test.{ts,tsx}",
    "!lib/**/*.d.ts"
  ],

  // Reporter optimization (fast-fail temporarily disabled)
  reporters: [
    'default'
    // ['<rootDir>/jest-fast-fail-reporter.js', {
    //   maxFailures: 1,
    //   showOnlyFailures: true
    // }]
  ]
};