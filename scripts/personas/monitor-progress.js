#!/usr/bin/env node

/**
 * Real-time Progress Monitor for Cross-Persona Testing
 * Watch session progress, display metrics, and provide interactive monitoring
 */

const fs = require('fs');
const path = require('path');

class ProgressMonitor {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'logs/personas/structured');
    this.enhancedDir = path.resolve(process.cwd(), 'logs/personas/enhanced');
    this.running = false;
    this.refreshInterval = 3000; // 3 seconds
    this.maxLines = 50;
  }

  /**
   * Start monitoring a specific session
   */
  async startMonitoring(sessionId, options = {}) {
    const { watch = true, continuous = false, follow = false } = options;

    console.clear();
    console.log(`🔍 Starting progress monitor for session: ${sessionId}`);
    console.log(`📂 Monitoring directory: ${this.baseDir}`);
    console.log(`⏱️ Refresh interval: ${this.refreshInterval}ms`);
    console.log('='.repeat(80));
    console.log('');

    this.running = true;

    if (follow) {
      this.followLogs(sessionId);
    } else if (continuous) {
      this.continuousMonitor(sessionId);
    } else {
      this.displaySnapshot(sessionId);
    }
  }

  /**
   * Display current session snapshot
   */
  displaySnapshot(sessionId) {
    try {
      const progress = this.loadProgress(sessionId);
      const metrics = this.loadMetrics(sessionId);
      const crossPersonaSession = this.loadCrossPersonaSession(sessionId);

      console.clear();
      this.renderSessionStatus(sessionId, progress, metrics, crossPersonaSession);

    } catch (error) {
      console.error(`❌ Error loading session data: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Continuous monitoring with auto-refresh
   */
  continuousMonitor(sessionId) {
    const intervalId = setInterval(() => {
      if (!this.running) {
        clearInterval(intervalId);
        return;
      }

      try {
        this.displaySnapshot(sessionId);
      } catch (error) {
        console.error(`❌ Monitoring error: ${error.message}`);
      }
    }, this.refreshInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping monitor...');
      this.running = false;
      clearInterval(intervalId);
      process.exit(0);
    });

    console.log('Press Ctrl+C to stop monitoring');
  }

  /**
   * Follow log file in real-time
   */
  followLogs(sessionId) {
    const logFile = path.join(this.baseDir, `${sessionId}-structured.log`);

    if (!fs.existsSync(logFile)) {
      console.error(`❌ Log file not found: ${logFile}`);
      process.exit(1);
    }

    console.log(`📄 Following log file: ${logFile}`);
    console.log('='.repeat(80));

    let lastSize = 0;

    const checkForUpdates = () => {
      try {
        const stats = fs.statSync(logFile);
        if (stats.size > lastSize) {
          const stream = fs.createReadStream(logFile, {
            start: lastSize,
            end: stats.size
          });

          stream.on('data', (chunk) => {
            process.stdout.write(chunk);
          });

          lastSize = stats.size;
        }
      } catch (error) {
        console.error(`❌ Error reading log file: ${error.message}`);
      }
    };

    // Initial read
    checkForUpdates();

    // Monitor for changes
    const intervalId = setInterval(checkForUpdates, 1000);

    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping log follower...');
      clearInterval(intervalId);
      process.exit(0);
    });

    console.log('\nPress Ctrl+C to stop following logs');
  }

  /**
   * List all available sessions
   */
  listSessions() {
    console.log('📋 Available Sessions:');
    console.log('='.repeat(60));

    const sessions = new Set();

    // Check structured logs
    if (fs.existsSync(this.baseDir)) {
      const files = fs.readdirSync(this.baseDir);
      for (const file of files) {
        if (file.endsWith('-progress.json') || file.endsWith('-metrics.json')) {
          const sessionId = file.replace(/-progress\.json$/, '').replace(/-metrics\.json$/, '');
          sessions.add(sessionId);
        }
      }
    }

    // Check enhanced sessions
    if (fs.existsSync(this.enhancedDir)) {
      const files = fs.readdirSync(this.enhancedDir);
      for (const file of files) {
        if (file.endsWith('-cross-persona.json')) {
          const sessionId = file.replace(/-cross-persona\.json$/, '');
          sessions.add(sessionId);
        }
      }
    }

    if (sessions.size === 0) {
      console.log('   No sessions found. Start a cross-persona test to create sessions.');
      return;
    }

    Array.from(sessions).sort().forEach((sessionId, index) => {
      const progress = this.loadProgress(sessionId);
      const status = this.getSessionStatus(sessionId);

      console.log(`${index + 1}. ${sessionId}`);
      if (progress) {
        console.log(`   Status: ${status}`);
        console.log(`   Progress: ${progress.completedChunks}/${progress.totalChunks} chunks (${progress.progressPercentage.toFixed(1)}%)`);
        console.log(`   Current: ${progress.currentPersona} (chunk ${progress.currentChunk})`);
      }
      console.log('');
    });

    console.log('Usage:');
    console.log('  node scripts/personas/monitor-progress.js [sessionId] [options]');
    console.log('  Options: --continuous, --follow, --snapshot (default)');
  }

  /**
   * Render comprehensive session status
   */
  renderSessionStatus(sessionId, progress, metrics, crossPersonaSession) {
    const lines = [];

    // Header
    lines.push(`🔄 CROSS-PERSONA SESSION MONITOR`);
    lines.push(`📊 Session ID: ${sessionId}`);
    lines.push(`⏱️ Last Update: ${new Date().toLocaleTimeString()}`);
    lines.push('='.repeat(80));
    lines.push('');

    // Progress Overview
    if (progress) {
      lines.push(`📈 PROGRESS OVERVIEW`);
      lines.push(`   Status: ${this.getSessionStatus(sessionId)}`);
      lines.push(`   Current: Chunk ${progress.currentChunk} | Persona: ${progress.currentPersona}`);
      lines.push(`   Completed: ${progress.completedChunks}/${progress.totalChunks} chunks (${progress.progressPercentage.toFixed(1)}%)`);

      if (progress.failedChunks > 0) {
        lines.push(`   Failed: ${progress.failedChunks} | Error rate: ${(progress.errorRate * 100).toFixed(1)}%`);
      }

      const elapsedMin = Math.ceil(progress.elapsedTime / 60000);
      const etaMin = Math.ceil(progress.estimatedTimeRemaining / 60000);
      lines.push(`   Timing: ${elapsedMin} min elapsed | ${etaMin} min remaining`);
      lines.push(`   Throughput: ${progress.throughputPuzzlesPerMinute.toFixed(1)} puzzles/min`);

      // Progress bar
      const barLength = 40;
      const completed = Math.floor((progress.progressPercentage / 100) * barLength);
      const bar = '█'.repeat(completed) + '░'.repeat(barLength - completed);
      lines.push(`   Progress: [${bar}] ${progress.progressPercentage.toFixed(1)}%`);
      lines.push('');
    }

    // Persona Breakdown
    if (metrics && metrics.personaMetrics) {
      lines.push(`👥 PERSONA BREAKDOWN`);
      for (const [persona, pMetrics] of Object.entries(metrics.personaMetrics)) {
        const accuracy = (pMetrics.accuracy * 100).toFixed(1);
        const responseTime = pMetrics.averageResponseTime.toFixed(0);
        const status = this.getPersonaStatus(persona, progress, crossPersonaSession);

        lines.push(`   ${persona.toUpperCase()}: ${status}`);
        lines.push(`      Chunks: ${pMetrics.chunksCompleted} completed, ${pMetrics.chunksFailed} failed`);
        lines.push(`      Performance: ${accuracy}% accuracy, ${responseTime}ms avg response`);
        lines.push(`      Puzzles: ${pMetrics.correctAnswers}/${pMetrics.totalPuzzles} correct`);

        if (pMetrics.constraintViolations > 0) {
          lines.push(`      ⚠️ Constraint violations: ${pMetrics.constraintViolations}`);
        }
        if (pMetrics.adaptationEvents > 0) {
          lines.push(`      🔄 Adaptation events: ${pMetrics.adaptationEvents}`);
        }
      }
      lines.push('');
    }

    // Cross-Persona Session Details
    if (crossPersonaSession) {
      lines.push(`🔗 CROSS-PERSONA SESSION`);
      lines.push(`   Total Personas: ${crossPersonaSession.totalPersonas}`);
      lines.push(`   Current Index: ${crossPersonaSession.currentPersonaIndex + 1}/${crossPersonaSession.totalPersonas}`);
      lines.push(`   Validation Checkpoints: ${crossPersonaSession.validationCheckpoints.length}`);

      const duration = Date.now() - crossPersonaSession.startTime;
      lines.push(`   Session Duration: ${Math.ceil(duration / 60000)} minutes`);

      // Chunk allocation
      lines.push(`   Chunk Allocation:`);
      for (const [persona, allocation] of Object.entries(crossPersonaSession.chunkAllocation)) {
        lines.push(`      ${persona}: chunks ${allocation.start}-${allocation.end} (${allocation.count} chunks)`);
      }
      lines.push('');
    }

    // Recent Activity
    const recentLogs = this.getRecentLogs(sessionId, 8);
    if (recentLogs.length > 0) {
      lines.push(`📝 RECENT ACTIVITY`);
      recentLogs.forEach(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        const level = this.formatLogLevel(log.level);
        lines.push(`   ${time} ${level} ${log.message}`);
      });
      lines.push('');
    }

    // Validation Status
    if (metrics && metrics.validationMetrics) {
      const vm = metrics.validationMetrics;
      const successRate = vm.totalValidations > 0 ? (vm.successfulValidations / vm.totalValidations * 100).toFixed(1) : '0';

      lines.push(`✅ VALIDATION STATUS`);
      lines.push(`   Success Rate: ${successRate}% (${vm.successfulValidations}/${vm.totalValidations})`);

      if (vm.stateInconsistencies > 0) {
        lines.push(`   ⚠️ State Inconsistencies: ${vm.stateInconsistencies}`);
      }
      if (vm.continuityIssues > 0) {
        lines.push(`   🔗 Continuity Issues: ${vm.continuityIssues}`);
      }
      if (vm.constraintViolations > 0) {
        lines.push(`   🚨 Constraint Violations: ${vm.constraintViolations}`);
      }

      lines.push(`   Avg Validation Time: ${vm.averageValidationTime.toFixed(0)}ms`);
      lines.push('');
    }

    // Instructions
    lines.push(`💡 MONITORING COMMANDS`);
    lines.push(`   Current mode: Snapshot (one-time)`);
    lines.push(`   Use --continuous for auto-refresh monitoring`);
    lines.push(`   Use --follow to tail the log file`);
    lines.push(`   Use --list to see all available sessions`);

    console.log(lines.join('\n'));
  }

  /**
   * Helper methods
   */
  loadProgress(sessionId) {
    const progressFile = path.join(this.baseDir, `${sessionId}-progress.json`);
    if (fs.existsSync(progressFile)) {
      try {
        return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      } catch (error) {
        console.warn(`Warning: Could not parse progress file: ${error.message}`);
      }
    }
    return null;
  }

  loadMetrics(sessionId) {
    const metricsFile = path.join(this.baseDir, `${sessionId}-metrics.json`);
    if (fs.existsSync(metricsFile)) {
      try {
        return JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      } catch (error) {
        console.warn(`Warning: Could not parse metrics file: ${error.message}`);
      }
    }
    return null;
  }

  loadCrossPersonaSession(sessionId) {
    const sessionFile = path.join(this.enhancedDir, `${sessionId}-cross-persona.json`);
    if (fs.existsSync(sessionFile)) {
      try {
        return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      } catch (error) {
        console.warn(`Warning: Could not parse cross-persona session file: ${error.message}`);
      }
    }
    return null;
  }

  getSessionStatus(sessionId) {
    const crossPersonaSession = this.loadCrossPersonaSession(sessionId);
    if (crossPersonaSession) {
      return crossPersonaSession.status.toUpperCase();
    }

    const progress = this.loadProgress(sessionId);
    if (!progress) return 'UNKNOWN';

    if (progress.progressPercentage >= 100) return 'COMPLETED';
    if (progress.failedChunks > 0) return 'FAILED';
    if (progress.completedChunks > 0) return 'RUNNING';
    return 'INITIALIZED';
  }

  getPersonaStatus(persona, progress, crossPersonaSession) {
    if (!crossPersonaSession || !progress) return 'Unknown';

    const allocation = crossPersonaSession.chunkAllocation[persona];
    if (!allocation) return 'Unknown';

    const currentChunk = progress.currentChunk;

    if (currentChunk < allocation.start) {
      return 'Pending';
    } else if (currentChunk >= allocation.start && currentChunk <= allocation.end) {
      return `Active (chunk ${currentChunk - allocation.start + 1}/${allocation.count})`;
    } else {
      return 'Completed';
    }
  }

  getRecentLogs(sessionId, count = 5) {
    const logFile = path.join(this.baseDir, `${sessionId}-structured.log`);
    if (!fs.existsSync(logFile)) return [];

    try {
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n').slice(-count);

      return lines.map(line => {
        // Parse log line: timestamp [LEVEL] [CATEGORY] sessionId: message
        const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+\[(\w+)\]\s+\[(\w+)\]\s+([^:]+):\s+(.+)$/);
        if (match) {
          return {
            timestamp: new Date(match[1]).getTime(),
            level: match[2],
            category: match[3],
            sessionId: match[4],
            message: match[5]
          };
        }
        return { timestamp: Date.now(), level: 'INFO', category: 'SYSTEM', sessionId, message: line };
      }).filter(log => log.sessionId.includes(sessionId));
    } catch (error) {
      console.warn(`Warning: Could not read log file: ${error.message}`);
      return [];
    }
  }

  formatLogLevel(level) {
    const symbols = {
      'DEBUG': '🔍',
      'INFO': 'ℹ️',
      'WARN': '⚠️',
      'ERROR': '❌',
      'SUCCESS': '✅'
    };
    return symbols[level] || '📝';
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const monitor = new ProgressMonitor();

  // Parse arguments
  const sessionId = args.find(arg => !arg.startsWith('--'));
  const continuous = args.includes('--continuous');
  const follow = args.includes('--follow');
  const list = args.includes('--list');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
🔍 Cross-Persona Progress Monitor

Usage:
  node scripts/personas/monitor-progress.js [sessionId] [options]

Options:
  --list        List all available sessions
  --continuous  Auto-refresh monitoring every 3 seconds
  --follow      Follow log file in real-time
  --help, -h    Show this help message

Examples:
  # List all sessions
  node scripts/personas/monitor-progress.js --list

  # One-time snapshot
  node scripts/personas/monitor-progress.js my_session

  # Continuous monitoring
  node scripts/personas/monitor-progress.js my_session --continuous

  # Follow logs in real-time
  node scripts/personas/monitor-progress.js my_session --follow
`);
    return;
  }

  if (list) {
    monitor.listSessions();
    return;
  }

  if (!sessionId) {
    console.error('❌ Session ID required. Use --list to see available sessions or --help for usage.');
    process.exit(1);
  }

  monitor.startMonitoring(sessionId, { continuous, follow });
}

if (require.main === module) {
  main();
}

module.exports = ProgressMonitor;