module.exports = {
  rootDir: "../",
  testEnvironment: "jsdom",

  // Optimized for CI speed
  maxWorkers: 2,
  bail: 1, // Stop after first failure
  verbose: false,
  clearMocks: true,
  restoreMocks: true,

  // Only test essential functionality for CI
  testMatch: [
    "**/__tests__/lib/services/rating/*.test.ts",
    "**/__tests__/lib/pictureSeriesPuzzles.test.ts",
    "**/__tests__/lib/patternPuzzles.test.ts",
    "**/__tests__/lib/analogyPuzzles.test.ts",
    "**/__tests__/lib/serialReasoningPuzzles.test.ts",
    "**/__tests__/constants/*.test.ts",
    "**/__tests__/hooks/useThemeColor.test.ts",
    "**/__tests__/hooks/usePowerSurge.test.ts"
  ],

  // Exclude all problematic/slow tests
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/adaptiveEngine/",
    "/__tests__/app/",
    "/__tests__/hooks/useGameState\\.test\\.ts$",
    "/__tests__/lib/algebraicReasoningPuzzles\\.test\\.ts$",
    "/__tests__/lib/infinite-puzzle-generator\\.test\\.ts$"
  ],

  setupFilesAfterEnv: ["<rootDir>/config/jest/jest-setup.js"],

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

  // Fast execution settings
  testTimeout: 15000, // 15 second timeout
  detectOpenHandles: false,
  forceExit: true,
  workerIdleMemoryLimit: "256MB",
  maxConcurrency: 2,

  // No coverage for speed
  collectCoverage: false,
  coverageReporters: ["text-summary"]
};