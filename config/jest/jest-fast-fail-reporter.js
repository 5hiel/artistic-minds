/**
 * Fast-fail reporter for immediate feedback on critical failures
 */

class FastFailReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.failureCount = 0;
    this.maxFailures = options.maxFailures || 1;
    this.showOnlyFailures = options.showOnlyFailures || false;
  }

  onRunStart() {
    console.log('\n🏃‍♂️ Fast-fail mode: Stopping after first critical failure\n');
  }

  onTestResult(test, testResult) {
    const { testFilePath } = test;
    const filename = testFilePath.split('/').pop();

    if (testResult.numFailingTests > 0) {
      this.failureCount++;

      console.log(`\n❌ FAILURE DETECTED: ${filename}`);
      console.log('⚡ Fast-fail triggered - stopping execution\n');

      testResult.testResults.forEach((result) => {
        if (result.status === 'failed') {
          console.log(`   💥 ${result.title}`);
          if (result.failureMessages.length > 0) {
            console.log(`   📝 ${result.failureMessages[0].split('\n')[0]}`);
          }
        }
      });

      // Exit immediately on first failure
      if (this.failureCount >= this.maxFailures) {
        console.log('\n🚨 Critical failure detected - terminating test run');
        console.log('💡 Fix this issue first, then re-run tests');
        process.exit(1);
      }
    } else if (!this.showOnlyFailures) {
      const duration = testResult.perfStats.end - testResult.perfStats.start;
      const status = duration > 10000 ? '🐌' : duration > 5000 ? '⚠️' : '✅';
      console.log(`${status} ${filename} (${duration}ms)`);
    }
  }

  onRunComplete() {
    if (this.failureCount === 0) {
      console.log('\n🎉 All lib tests passed! No critical issues detected.\n');
    }
  }
}

module.exports = FastFailReporter;