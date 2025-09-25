/**
 * Memory monitoring and leak detection for tests
 */

class MemoryMonitor {
  constructor() {
    this.initialMemory = process.memoryUsage();
    this.testMemoryData = new Map();
    this.memoryWarningThreshold = 512 * 1024 * 1024; // 512MB
    this.memoryErrorThreshold = 1024 * 1024 * 1024; // 1GB
  }

  startTest(testName) {
    const memory = process.memoryUsage();
    this.testMemoryData.set(testName, {
      start: memory,
      startTime: Date.now()
    });
  }

  endTest(testName) {
    const endMemory = process.memoryUsage();
    const testData = this.testMemoryData.get(testName);

    if (!testData) return;

    const memoryDiff = endMemory.heapUsed - testData.start.heapUsed;
    const duration = Date.now() - testData.startTime;

    testData.end = endMemory;
    testData.diff = memoryDiff;
    testData.duration = duration;

    // Check for memory issues
    if (memoryDiff > this.memoryWarningThreshold) {
      console.warn(`⚠️  Memory warning in ${testName}: +${Math.round(memoryDiff / 1024 / 1024)}MB`);
    }

    if (endMemory.heapUsed > this.memoryErrorThreshold) {
      console.error(`🚨 Memory critical in ${testName}: ${Math.round(endMemory.heapUsed / 1024 / 1024)}MB total`);

      // Force garbage collection
      if (global.gc) {
        console.log('🧹 Forcing garbage collection...');
        global.gc();

        const postGcMemory = process.memoryUsage();
        const recovered = endMemory.heapUsed - postGcMemory.heapUsed;
        console.log(`♻️  Recovered ${Math.round(recovered / 1024 / 1024)}MB`);
      }
    }
  }

  getMemoryReport() {
    const currentMemory = process.memoryUsage();
    const totalHeapGrowth = currentMemory.heapUsed - this.initialMemory.heapUsed;

    const report = {
      initial: Math.round(this.initialMemory.heapUsed / 1024 / 1024),
      current: Math.round(currentMemory.heapUsed / 1024 / 1024),
      growth: Math.round(totalHeapGrowth / 1024 / 1024),
      testsAnalyzed: this.testMemoryData.size,
      heaviestTests: this.getHeaviestTests(5)
    };

    return report;
  }

  getHeaviestTests(limit = 5) {
    return Array.from(this.testMemoryData.entries())
      .filter(([, data]) => data.diff !== undefined)
      .sort((a, b) => b[1].diff - a[1].diff)
      .slice(0, limit)
      .map(([testName, data]) => ({
        test: testName.split('/').pop(),
        memory: Math.round(data.diff / 1024 / 1024),
        duration: data.duration
      }));
  }

  cleanup() {
    this.testMemoryData.clear();
    if (global.gc) {
      global.gc();
    }
  }
}

// Export singleton
const memoryMonitor = new MemoryMonitor();

module.exports = {
  MemoryMonitor,
  memoryMonitor
};