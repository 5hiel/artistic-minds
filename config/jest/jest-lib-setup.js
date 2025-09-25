/**
 * Global setup for lib tests - memory and performance optimizations
 */

module.exports = async () => {
  // Set aggressive garbage collection for lib tests
  if (global.gc) {
    global.gc();
  }

  // Set performance monitoring
  const startTime = Date.now();
  global.__TEST_START_TIME__ = startTime;

  console.log('🚀 Lib test suite starting - fast-fail mode enabled');
  console.log('⏱️  Target: Complete in under 2 minutes');
  console.log('🎯 Strategy: Fail fast on first critical issue');

  // Memory monitoring
  const memUsage = process.memoryUsage();
  console.log(`📊 Initial memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
};