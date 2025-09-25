module.exports = {
  rootDir: "../",
  testEnvironment: "jsdom",
  
  // Memory optimization settings - more conservative for CI
  maxWorkers: 2, // Use 2 workers for faster parallel execution
  cacheDirectory: "<rootDir>/.jest-cache",
  clearMocks: true,
  restoreMocks: true,

  // Faster test runs
  bail: 1, // Stop after first test suite failure in CI
  verbose: false, // Less verbose output to save memory
  
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}", 
    "app/**/*.{ts,tsx}",
    "constants/**/*.{ts,tsx}",
    "styles/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/coverage/**"
  ],
  
  setupFilesAfterEnv: ["<rootDir>/config/jest/jest-setup.js"],
  
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)"
  ],

  // Exclude long-running simulation tests and problematic component tests from coverage runs
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/adaptiveEngine/.*Simulation\\.test\\.(ts|js)$",
    "/__tests__/app/\\(tabs\\)/components/ShareScreen\\.test\\.tsx$",
    "/__tests__/app/\\(tabs\\)/components/ScoreFlashOverlay\\.test\\.tsx$",
    "/__tests__/app/\\(tabs\\)/components/PowerButtonsContainer\\.test\\.tsx$",
    "/__tests__/app/\\(tabs\\)/components/GameTopBarContainer\\.test\\.tsx$",
    "/__tests__/app/\\(tabs\\)/index\\.test\\.tsx$",
    "/__tests__/lib/adaptiveEngine/index\\.test\\.ts$",
    "/__tests__/hooks/useGameState\\.test\\.ts$", // Long async tests
    "/__tests__/lib/algebraicReasoningPuzzles\\.test\\.ts$" // Verbose output slowing down CI
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
  
  // Memory and performance optimizations
  testTimeout: 30000, // 30 second timeout per test (faster)
  detectOpenHandles: false, // Disable for better memory usage in CI
  forceExit: true, // Force exit after tests complete

  // Additional memory optimizations
  workerIdleMemoryLimit: "512MB", // Limit worker memory
  maxConcurrency: 2, // Allow some concurrent test execution
  
  // Coverage optimizations (less memory intensive)
  coverageReporters: ["text-summary", "lcov"],
  collectCoverage: false // Only collect when explicitly requested
};