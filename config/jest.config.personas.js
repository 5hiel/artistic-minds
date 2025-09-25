module.exports = {
  rootDir: "../",
  testEnvironment: "jsdom",

  // Optimized settings for long-running persona tests
  maxWorkers: 1, // Single worker to prevent memory conflicts
  cacheDirectory: "<rootDir>/.jest-cache-personas",
  clearMocks: true,
  restoreMocks: true,

  // Extended timeouts for persona testing
  bail: false, // Continue despite failures to complete partial sessions
  verbose: true, // More verbose for debugging persona sessions

  // No coverage collection for persona tests (performance optimization)
  collectCoverage: false,

  setupFilesAfterEnv: ["<rootDir>/config/jest/jest-setup.js"],

  // Only run persona tests
  testMatch: [
    "**/__tests__/personas/**/*.(ts|tsx|js)",
    "**/personas/**/*.(test|spec).(ts|tsx|js)"
  ],

  // Don't ignore any persona tests
  testPathIgnorePatterns: [
    "/node_modules/"
  ],

  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|react-test-renderer)/)"
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },

  // Extended timeouts and memory settings for persona testing
  testTimeout: 900000, // 15 minutes per test (was causing failures at 10 minutes)
  detectOpenHandles: true, // Enable for better debugging
  forceExit: false, // Don't force exit to allow proper cleanup

  // Memory optimizations for long-running tests
  workerIdleMemoryLimit: "1GB", // Increased memory limit
  maxConcurrency: 1, // Single test at a time

  // Specialized reporters for persona testing
  reporters: [
    "default",
    ["<rootDir>/config/jest/persona-progress-reporter.js", {
      outputDir: "<rootDir>/logs/personas",
      enableProgressLog: true
    }]
  ],

  // Global setup for persona testing environment
  globalSetup: "<rootDir>/config/jest/persona-global-setup.js",
  globalTeardown: "<rootDir>/config/jest/persona-global-teardown.js"
};