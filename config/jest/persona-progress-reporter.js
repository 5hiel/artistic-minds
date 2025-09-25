const fs = require('fs');
const path = require('path');

/**
 * Custom Jest Reporter for Persona Testing
 * Provides real-time progress updates and structured logging
 */
class PersonaProgressReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this.outputDir = this._options.outputDir || './logs/personas';
    this.enableProgressLog = this._options.enableProgressLog !== false;

    // Ensure output directory exists
    this.ensureOutputDirectory();

    // Initialize session tracking
    this.currentSession = null;
    this.sessionStartTime = null;
    this.chunkProgress = new Map();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onRunStart(results, options) {
    const timestamp = new Date().toISOString();
    console.log(`\n🚀 Starting Persona Testing Session at ${timestamp}`);

    if (this.enableProgressLog) {
      const logFile = path.join(this.outputDir, `session-${Date.now()}.log`);
      this.sessionLogFile = logFile;
      fs.writeFileSync(logFile, `# Persona Testing Session Started\n# Time: ${timestamp}\n\n`);
    }
  }

  onTestStart(test) {
    const testName = test.path.split('/').pop();
    const timestamp = new Date().toISOString();

    // Extract persona and session info from test name/path
    const personaMatch = testName.match(/(omi|ira|mumu|ma)/i);
    const persona = personaMatch ? personaMatch[1].toLowerCase() : 'unknown';

    console.log(`\n📦 Starting ${persona.toUpperCase()} test: ${testName}`);
    console.log(`⏰ Started at: ${timestamp}`);

    if (this.sessionLogFile) {
      fs.appendFileSync(this.sessionLogFile, `[${timestamp}] 📦 STARTING: ${persona.toUpperCase()} - ${testName}\n`);
    }

    this.currentSession = {
      persona,
      testName,
      startTime: Date.now(),
      chunks: []
    };
  }

  onTestResult(test, testResult) {
    const duration = Date.now() - (this.currentSession?.startTime || Date.now());
    const timestamp = new Date().toISOString();
    const durationMins = (duration / 60000).toFixed(1);

    if (testResult.numFailingTests > 0) {
      console.log(`\n❌ ${this.currentSession?.persona?.toUpperCase() || 'TEST'} FAILED after ${durationMins} minutes`);
      testResult.failureMessage && console.log(`   Error: ${testResult.failureMessage.substring(0, 200)}...`);

      if (this.sessionLogFile) {
        fs.appendFileSync(this.sessionLogFile,
          `[${timestamp}] ❌ FAILED: ${this.currentSession?.persona?.toUpperCase()} - Duration: ${durationMins}min\n`);
        if (testResult.failureMessage) {
          fs.appendFileSync(this.sessionLogFile, `   Error: ${testResult.failureMessage.substring(0, 500)}\n`);
        }
      }
    } else {
      console.log(`\n✅ ${this.currentSession?.persona?.toUpperCase() || 'TEST'} COMPLETED successfully in ${durationMins} minutes`);

      if (this.sessionLogFile) {
        fs.appendFileSync(this.sessionLogFile,
          `[${timestamp}] ✅ COMPLETED: ${this.currentSession?.persona?.toUpperCase()} - Duration: ${durationMins}min\n`);
      }
    }

    // Save session summary
    if (this.currentSession) {
      const sessionSummary = {
        persona: this.currentSession.persona,
        testName: this.currentSession.testName,
        startTime: this.currentSession.startTime,
        endTime: Date.now(),
        duration: duration,
        success: testResult.numFailingTests === 0,
        timestamp: timestamp
      };

      const summaryFile = path.join(this.outputDir, `${this.currentSession.persona}-session-summary.json`);
      fs.writeFileSync(summaryFile, JSON.stringify(sessionSummary, null, 2));
    }
  }

  onRunComplete(contexts, results) {
    const timestamp = new Date().toISOString();
    const totalDuration = (Date.now() - (this.sessionStartTime || Date.now())) / 60000;

    console.log(`\n📊 Persona Testing Session Complete at ${timestamp}`);
    console.log(`   Total Duration: ${totalDuration.toFixed(1)} minutes`);
    console.log(`   Tests Passed: ${results.numPassedTests}`);
    console.log(`   Tests Failed: ${results.numFailedTests}`);
    console.log(`   Total Tests: ${results.numTotalTests}`);

    if (this.sessionLogFile) {
      fs.appendFileSync(this.sessionLogFile,
        `\n[${timestamp}] 📊 SESSION COMPLETE\n` +
        `   Duration: ${totalDuration.toFixed(1)} minutes\n` +
        `   Passed: ${results.numPassedTests}\n` +
        `   Failed: ${results.numFailedTests}\n` +
        `   Total: ${results.numTotalTests}\n`);
    }

    // Generate session index
    this.generateSessionIndex();
  }

  generateSessionIndex() {
    try {
      const sessionFiles = fs.readdirSync(this.outputDir)
        .filter(file => file.endsWith('-session-summary.json'))
        .map(file => {
          const content = JSON.parse(fs.readFileSync(path.join(this.outputDir, file), 'utf8'));
          return { file, ...content };
        })
        .sort((a, b) => b.startTime - a.startTime);

      const indexFile = path.join(this.outputDir, 'session-index.json');
      fs.writeFileSync(indexFile, JSON.stringify(sessionFiles, null, 2));

      console.log(`📋 Session index updated: ${indexFile}`);
    } catch (error) {
      console.error(`⚠️ Could not generate session index: ${error.message}`);
    }
  }

  // Custom methods for chunk progress tracking
  logChunkProgress(persona, chunkNumber, progress) {
    const timestamp = new Date().toISOString();
    const key = `${persona}-chunk-${chunkNumber}`;

    this.chunkProgress.set(key, {
      persona,
      chunkNumber,
      progress,
      timestamp
    });

    console.log(`   📦 ${persona.toUpperCase()} Chunk ${chunkNumber}: ${progress}%`);

    if (this.sessionLogFile) {
      fs.appendFileSync(this.sessionLogFile,
        `[${timestamp}] 📦 PROGRESS: ${persona.toUpperCase()} Chunk ${chunkNumber} - ${progress}%\n`);
    }
  }

  logChunkComplete(persona, chunkNumber, accuracy, puzzleCount) {
    const timestamp = new Date().toISOString();
    const accuracyPct = (accuracy * 100).toFixed(1);

    console.log(`   ✅ ${persona.toUpperCase()} Chunk ${chunkNumber}: ${accuracyPct}% accuracy (${puzzleCount} puzzles)`);

    if (this.sessionLogFile) {
      fs.appendFileSync(this.sessionLogFile,
        `[${timestamp}] ✅ CHUNK: ${persona.toUpperCase()} Chunk ${chunkNumber} - ${accuracyPct}% (${puzzleCount} puzzles)\n`);
    }
  }
}

// Make the reporter available as global for use in tests
global.personaProgressReporter = new PersonaProgressReporter();

module.exports = PersonaProgressReporter;