#!/usr/bin/env node

/**
 * Cross-Persona Orchestration Script
 *
 * Manages the complex Ma(1-5) → omi(6-10) → mumu(11-15) → ira(16-20) workflow
 * with automatic session handoff, retry mechanisms, and progress tracking.
 *
 * Usage:
 * node scripts/personas/cross-persona-orchestrator.js [options]
 *
 * Options:
 * --session-id <id>     Custom session ID (default: auto-generated)
 * --start-from <persona> Start from specific persona (ma|omi|mumu|ira)
 * --dry-run            Show what would be executed without running
 * --retry-failed       Retry failed chunks from previous session
 * --puzzles-per-chunk <n> Puzzles per chunk (default: 10)
 * --log-level <level>   Logging level (debug|info|warn|error)
 * --max-retries <n>     Maximum retries per chunk (default: 3)
 * --force-continue      Continue even if previous steps failed
 *
 * Examples:
 * node scripts/personas/cross-persona-orchestrator.js --session-id my_test_123
 * node scripts/personas/cross-persona-orchestrator.js --start-from omi --retry-failed
 * node scripts/personas/cross-persona-orchestrator.js --dry-run --log-level debug
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CrossPersonaOrchestrator {
  constructor(options = {}) {
    this.options = {
      sessionId: options.sessionId || `cross_persona_${Date.now()}`,
      startFrom: options.startFrom || 'ma',
      dryRun: options.dryRun || false,
      retryFailed: options.retryFailed || false,
      puzzlesPerChunk: options.puzzlesPerChunk || 10,
      logLevel: options.logLevel || 'info',
      maxRetries: options.maxRetries || 3,
      forceContinue: options.forceContinue || false
    };

    this.logDir = path.resolve(process.cwd(), 'logs/personas/orchestration');
    this.sessionLogFile = path.join(this.logDir, `${this.options.sessionId}.log`);

    // Cross-persona sequence definition
    this.personaSequence = [
      { persona: 'ma', chunks: [1, 2, 3, 4, 5], role: 'Baseline - Adult performance establishment' },
      { persona: 'omi', chunks: [6, 7, 8, 9, 10], role: 'Child Adaptation - Age constraint testing' },
      { persona: 'mumu', chunks: [11, 12, 13, 14, 15], role: 'Adult Continuation - Performance validation' },
      { persona: 'ira', chunks: [16, 17, 18, 19, 20], role: 'Competitive Child - Behavior detection' }
    ];

    this.currentStep = 0;
    this.completedSteps = [];
    this.failedSteps = [];
    this.retryAttempts = new Map();

    this.ensureLogDirectory();
    this.initializeSession();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  initializeSession() {
    const timestamp = new Date().toISOString();
    const initialLog = [
      `🎭 CROSS-PERSONA ORCHESTRATION SESSION STARTED`,
      `📅 Time: ${timestamp}`,
      `🆔 Session ID: ${this.options.sessionId}`,
      `🎯 Starting from: ${this.options.startFrom}`,
      `🧩 Puzzles per chunk: ${this.options.puzzlesPerChunk}`,
      `🔧 Options: ${JSON.stringify(this.options, null, 2)}`,
      `📊 Sequence: Ma(1-5) → omi(6-10) → mumu(11-15) → ira(16-20)`,
      `${'='.repeat(80)}`,
      ``
    ].join('\n');

    fs.writeFileSync(this.sessionLogFile, initialLog);
    this.log('info', 'Cross-persona orchestration session initialized');
  }

  log(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const levelMap = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' };
    const icon = levelMap[level] || 'ℹ️';

    const logEntry = `[${timestamp}] ${icon} ${message}`;

    // Console output based on log level
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.options.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex >= currentLevelIndex) {
      console.log(logEntry);
    }

    // Always log to file
    fs.appendFileSync(this.sessionLogFile, logEntry + '\n');

    if (error) {
      const errorEntry = `[${timestamp}] 💥 ERROR DETAILS: ${error.stack || error.message || error}`;
      fs.appendFileSync(this.sessionLogFile, errorEntry + '\n');
    }
  }

  async run() {
    try {
      this.log('info', '🚀 Starting cross-persona orchestration...');

      if (this.options.dryRun) {
        return await this.performDryRun();
      }

      // Determine starting point
      const startIndex = this.personaSequence.findIndex(step => step.persona === this.options.startFrom);
      if (startIndex === -1) {
        throw new Error(`Invalid start persona: ${this.options.startFrom}`);
      }

      this.currentStep = startIndex;
      this.log('info', `Starting from step ${startIndex + 1}: ${this.options.startFrom}`);

      // Execute sequence
      for (let i = startIndex; i < this.personaSequence.length; i++) {
        const step = this.personaSequence[i];
        this.currentStep = i;

        this.log('info', `\n📦 STEP ${i + 1}/4: ${step.persona.toUpperCase()} (Chunks ${step.chunks[0]}-${step.chunks[step.chunks.length - 1]})`);
        this.log('info', `🎯 Role: ${step.role}`);

        const success = await this.executePersonaStep(step, i);

        if (success) {
          this.completedSteps.push(step);
          this.log('info', `✅ Step ${i + 1} completed successfully: ${step.persona}`);
        } else {
          this.failedSteps.push(step);
          this.log('error', `❌ Step ${i + 1} failed: ${step.persona}`);

          if (!this.options.forceContinue) {
            this.log('error', '🛑 Stopping orchestration due to failure (use --force-continue to override)');
            break;
          } else {
            this.log('warn', '⚠️ Continuing despite failure due to --force-continue flag');
          }
        }

        // Brief pause between steps
        if (i < this.personaSequence.length - 1) {
          this.log('info', '⏸️ Pausing 10 seconds before next step...');
          await this.sleep(10000);
        }
      }

      await this.generateFinalReport();
      return this.completedSteps.length === this.personaSequence.length;

    } catch (error) {
      this.log('error', '💥 Orchestration failed with error:', error);
      throw error;
    }
  }

  async executePersonaStep(step, stepIndex) {
    const { persona, chunks } = step;
    let success = true;

    for (const chunkNumber of chunks) {
      this.log('info', `  🔬 Processing ${persona} chunk ${chunkNumber}...`);

      const chunkSuccess = await this.executeAtomicChunk(persona, chunkNumber, stepIndex === 0);

      if (!chunkSuccess) {
        const retryKey = `${persona}-${chunkNumber}`;
        const currentRetries = this.retryAttempts.get(retryKey) || 0;

        if (currentRetries < this.options.maxRetries) {
          this.retryAttempts.set(retryKey, currentRetries + 1);
          this.log('warn', `  🔄 Retrying ${persona} chunk ${chunkNumber} (attempt ${currentRetries + 1}/${this.options.maxRetries})`);

          // Exponential backoff
          const backoffTime = Math.min(5000 * Math.pow(2, currentRetries), 30000);
          this.log('info', `  ⏱️ Waiting ${backoffTime/1000}s before retry...`);
          await this.sleep(backoffTime);

          const retrySuccess = await this.executeAtomicChunk(persona, chunkNumber, false);
          if (!retrySuccess) {
            this.log('error', `  ❌ ${persona} chunk ${chunkNumber} failed after retry`);
            success = false;
          } else {
            this.log('info', `  ✅ ${persona} chunk ${chunkNumber} succeeded on retry`);
          }
        } else {
          this.log('error', `  ❌ ${persona} chunk ${chunkNumber} failed after ${this.options.maxRetries} retries`);
          success = false;
        }
      } else {
        this.log('info', `  ✅ ${persona} chunk ${chunkNumber} completed successfully`);
      }

      // Brief pause between chunks
      await this.sleep(2000);
    }

    return success;
  }

  async executeAtomicChunk(persona, chunkNumber, createSession) {
    return new Promise((resolve) => {
      const env = {
        ...process.env,
        PERSONA: persona,
        CHUNK_NUMBER: chunkNumber.toString(),
        SESSION_ID: this.options.sessionId,
        PUZZLES_PER_CHUNK: this.options.puzzlesPerChunk.toString(),
        CREATE_SESSION: createSession ? 'true' : 'false',
        FORCE_CONTINUE: 'true'  // Always force continue for orchestrated runs
      };

      const args = [
        'run',
        'test:personas:atomic',
        '--',
        '--testNamePattern=Process single atomic chunk',
        '--verbose'
      ];

      this.log('debug', `    🔧 Executing: npm ${args.join(' ')}`);
      this.log('debug', `    🌍 Environment: PERSONA=${persona} CHUNK_NUMBER=${chunkNumber} SESSION_ID=${this.options.sessionId}`);

      const child = spawn('npm', args, {
        env,
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Real-time progress logging
        const lines = text.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          if (line.includes('Processing Chunk') || line.includes('✅') || line.includes('❌')) {
            this.log('debug', `      📊 ${line.trim()}`);
          }
        });
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        // Save chunk execution log
        const chunkLogFile = path.join(this.logDir, `${this.options.sessionId}-${persona}-chunk-${chunkNumber}.log`);
        fs.writeFileSync(chunkLogFile, output);

        if (code === 0) {
          this.log('debug', `    ✅ Chunk ${chunkNumber} completed with exit code 0`);
          resolve(true);
        } else {
          this.log('error', `    ❌ Chunk ${chunkNumber} failed with exit code ${code}`);
          if (errorOutput) {
            this.log('error', `    💥 Error output: ${errorOutput.substring(0, 500)}...`);
          }
          resolve(false);
        }
      });

      child.on('error', (error) => {
        this.log('error', `    💥 Process error for chunk ${chunkNumber}:`, error);
        resolve(false);
      });
    });
  }

  async performDryRun() {
    this.log('info', '🏃 PERFORMING DRY RUN - No actual execution');
    this.log('info', '');

    const startIndex = this.personaSequence.findIndex(step => step.persona === this.options.startFrom);

    for (let i = startIndex; i < this.personaSequence.length; i++) {
      const step = this.personaSequence[i];

      this.log('info', `📦 STEP ${i + 1}/4: ${step.persona.toUpperCase()}`);
      this.log('info', `  🎯 Role: ${step.role}`);
      this.log('info', `  🧩 Chunks: ${step.chunks.join(', ')}`);
      this.log('info', `  ⏱️ Estimated time: ${step.chunks.length * 2} minutes (${step.chunks.length} chunks × 2 min/chunk)`);

      step.chunks.forEach(chunkNumber => {
        const createSession = i === startIndex && chunkNumber === step.chunks[0];
        this.log('info', `    🔬 Would execute: PERSONA=${step.persona} CHUNK_NUMBER=${chunkNumber} CREATE_SESSION=${createSession}`);
      });

      this.log('info', '');
    }

    const totalChunks = this.personaSequence.slice(startIndex).reduce((sum, step) => sum + step.chunks.length, 0);
    const estimatedTime = totalChunks * 2;

    this.log('info', `📊 DRY RUN SUMMARY:`);
    this.log('info', `  Total steps: ${this.personaSequence.length - startIndex}`);
    this.log('info', `  Total chunks: ${totalChunks}`);
    this.log('info', `  Estimated time: ${estimatedTime} minutes`);
    this.log('info', `  Session ID: ${this.options.sessionId}`);

    return true;
  }

  async generateFinalReport() {
    this.log('info', '\n📊 GENERATING FINAL ORCHESTRATION REPORT...');

    const report = {
      sessionId: this.options.sessionId,
      startTime: this.sessionStartTime,
      endTime: new Date().toISOString(),
      options: this.options,
      completedSteps: this.completedSteps.length,
      failedSteps: this.failedSteps.length,
      totalSteps: this.personaSequence.length,
      successRate: (this.completedSteps.length / this.personaSequence.length * 100).toFixed(1),
      retryAttempts: Object.fromEntries(this.retryAttempts),
      stepDetails: this.personaSequence.map((step, index) => ({
        stepNumber: index + 1,
        persona: step.persona,
        chunks: step.chunks,
        role: step.role,
        status: this.completedSteps.includes(step) ? 'completed' :
                this.failedSteps.includes(step) ? 'failed' : 'skipped'
      }))
    };

    // Save detailed report
    const reportFile = path.join(this.logDir, `${this.options.sessionId}-final-report.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Generate human-readable summary
    const summary = [
      ``,
      `🎭 CROSS-PERSONA ORCHESTRATION FINAL REPORT`,
      `${'='.repeat(60)}`,
      `📅 Session: ${this.options.sessionId}`,
      `⏰ Duration: ${report.startTime} → ${report.endTime}`,
      `📊 Success Rate: ${report.successRate}% (${report.completedSteps}/${report.totalSteps} steps)`,
      ``,
      `📋 STEP RESULTS:`,
      ...report.stepDetails.map(step =>
        `  ${step.stepNumber}. ${step.persona.toUpperCase()} (${step.chunks[0]}-${step.chunks[step.chunks.length-1]}): ${step.status.toUpperCase()}`
      ),
      ``,
      `🔄 RETRY SUMMARY:`,
      Object.entries(report.retryAttempts).length > 0 ?
        Object.entries(report.retryAttempts).map(([key, attempts]) =>
          `  ${key}: ${attempts} retries`
        ).join('\n') : '  No retries required',
      ``,
      `📁 Report saved: ${reportFile}`,
      `📄 Session log: ${this.sessionLogFile}`,
      `${'='.repeat(60)}`
    ].join('\n');

    this.log('info', summary);

    // Save summary
    const summaryFile = path.join(this.logDir, `${this.options.sessionId}-summary.txt`);
    fs.writeFileSync(summaryFile, summary);

    return report;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI handling
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--session-id':
        options.sessionId = args[++i];
        break;
      case '--start-from':
        options.startFrom = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--retry-failed':
        options.retryFailed = true;
        break;
      case '--puzzles-per-chunk':
        options.puzzlesPerChunk = parseInt(args[++i]);
        break;
      case '--log-level':
        options.logLevel = args[++i];
        break;
      case '--max-retries':
        options.maxRetries = parseInt(args[++i]);
        break;
      case '--force-continue':
        options.forceContinue = true;
        break;
      case '--help':
      case '-h':
        console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(3, 25).join('\n'));
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return options;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const orchestrator = new CrossPersonaOrchestrator(options);

    const success = await orchestrator.run();

    if (success) {
      console.log('\n🎉 Cross-persona orchestration completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💔 Cross-persona orchestration completed with failures');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Cross-persona orchestration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CrossPersonaOrchestrator;