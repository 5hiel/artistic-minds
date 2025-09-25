const fs = require('fs');
const path = require('path');

/**
 * Global Teardown for Persona Testing
 * Cleans up resources and generates final reports
 */
module.exports = async () => {
  console.log('🧹 Persona Testing Teardown Starting...');

  try {
    // Stop memory monitoring
    if (global.memoryMonitor) {
      clearInterval(global.memoryMonitor);
      console.log('  ⏹️ Stopped memory monitoring');
    }

    // Final memory report
    if (process.env.NODE_ENV !== 'production') {
      const used = process.memoryUsage();
      const mb = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;

      console.log(`  📊 Final Memory: RSS: ${mb(used.rss)}MB, Heap: ${mb(used.heapUsed)}/${mb(used.heapTotal)}MB`);

      const memoryLog = path.resolve(process.cwd(), 'logs/personas/memory.log');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] FINAL - RSS: ${mb(used.rss)}MB, Heap: ${mb(used.heapUsed)}/${mb(used.heapTotal)}MB\n`;
      fs.appendFileSync(memoryLog, logEntry);
    }

    // Update session tracker
    const trackerFile = path.resolve(process.cwd(), 'logs/personas/session-tracker.json');
    if (fs.existsSync(trackerFile)) {
      const tracker = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
      tracker.sessionEndTime = Date.now();
      tracker.totalDuration = tracker.sessionEndTime - tracker.sessionStartTime;
      tracker.lastCleanup = Date.now();

      fs.writeFileSync(trackerFile, JSON.stringify(tracker, null, 2));
      console.log(`  📋 Updated session tracker: ${(tracker.totalDuration / 60000).toFixed(1)} minutes total`);
    }

    // Generate summary report
    await generateSessionSummary();

    // Force garbage collection
    if (global.gc) {
      global.gc();
      console.log('  ♻️ Final garbage collection');
    }

    console.log('✅ Persona Testing Teardown Complete');

  } catch (error) {
    console.error('❌ Error during teardown:', error);
  }
};

async function generateSessionSummary() {
  try {
    const personasDir = path.resolve(process.cwd(), 'logs/personas');
    const summaryFiles = fs.readdirSync(personasDir)
      .filter(file => file.endsWith('-session-summary.json'))
      .map(file => {
        const content = JSON.parse(fs.readFileSync(path.join(personasDir, file), 'utf8'));
        return content;
      });

    if (summaryFiles.length === 0) {
      console.log('  📝 No session summaries to aggregate');
      return;
    }

    const aggregatedSummary = {
      timestamp: new Date().toISOString(),
      totalSessions: summaryFiles.length,
      successfulSessions: summaryFiles.filter(s => s.success).length,
      failedSessions: summaryFiles.filter(s => !s.success).length,
      totalDuration: summaryFiles.reduce((sum, s) => sum + (s.duration || 0), 0),
      averageDuration: summaryFiles.reduce((sum, s) => sum + (s.duration || 0), 0) / summaryFiles.length,
      personas: summaryFiles.map(s => ({
        persona: s.persona,
        success: s.success,
        duration: s.duration,
        durationMinutes: ((s.duration || 0) / 60000).toFixed(1)
      })),
      completionRate: (summaryFiles.filter(s => s.success).length / summaryFiles.length * 100).toFixed(1)
    };

    const summaryFile = path.join(personasDir, 'aggregated-session-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(aggregatedSummary, null, 2));

    console.log(`  📊 Generated aggregated summary: ${aggregatedSummary.successfulSessions}/${aggregatedSummary.totalSessions} successful`);
    console.log(`     Total time: ${(aggregatedSummary.totalDuration / 60000).toFixed(1)} minutes`);
    console.log(`     Success rate: ${aggregatedSummary.completionRate}%`);

  } catch (error) {
    console.log(`  ⚠️ Could not generate session summary: ${error.message}`);
  }
}