/**
 * Global teardown for lib tests - performance reporting and cleanup
 */

module.exports = async () => {
  // Calculate total execution time
  const startTime = global.__TEST_START_TIME__;
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;

  // Memory usage report
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

  console.log('\n📊 Lib Test Suite Complete');
  console.log('========================');
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)}s ${totalTime < 120 ? '✅ Under 2min' : '⚠️ Over 2min'}`);
  console.log(`💾 Final memory: ${heapUsedMB}MB / ${heapTotalMB}MB`);

  if (totalTime > 120) {
    console.log('\n⚠️  WARNING: Tests exceeded 2-minute target');
    console.log('💡 Consider reviewing slow tests or increasing parallelism');
  }

  if (heapUsedMB > 1024) {
    console.log('\n⚠️  WARNING: High memory usage detected');
    console.log('💡 Consider reviewing memory leaks in test setup');
  }

  // Force cleanup
  if (global.gc) {
    global.gc();
  }
};