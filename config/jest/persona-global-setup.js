const fs = require('fs');
const path = require('path');

/**
 * Global Setup for Persona Testing
 * Prepares the environment for robust cross-persona testing
 */
module.exports = async () => {
  console.log('🔧 Initializing Persona Testing Environment...');

  // Create necessary directories
  const directories = [
    'logs/personas',
    'logs/personas/chunks',
    'logs/personas/reports',
    'logs/personas/sessions',
    '/tmp/test-sessions',
    '/tmp/persona-state'
  ];

  directories.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  📁 Created directory: ${dir}`);
    }
  });

  // Initialize session tracking
  const sessionTracker = {
    activeSession: null,
    sessionStartTime: Date.now(),
    activeSessions: [],
    completedSessions: [],
    lastCleanup: Date.now()
  };

  const trackerFile = path.resolve(process.cwd(), 'logs/personas/session-tracker.json');
  fs.writeFileSync(trackerFile, JSON.stringify(sessionTracker, null, 2));

  // Clean up old session data (older than 7 days)
  try {
    const tmpSessionsDir = '/tmp/test-sessions';
    if (fs.existsSync(tmpSessionsDir)) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const sessions = fs.readdirSync(tmpSessionsDir);

      let cleanedCount = 0;
      sessions.forEach(sessionId => {
        const sessionPath = path.join(tmpSessionsDir, sessionId);
        const stats = fs.statSync(sessionPath);

        if (stats.mtime.getTime() < sevenDaysAgo) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        console.log(`  🧹 Cleaned up ${cleanedCount} old session(s)`);
      }
    }
  } catch (error) {
    console.log(`  ⚠️ Warning: Could not clean old sessions: ${error.message}`);
  }

  // Set up memory monitoring
  if (process.env.NODE_ENV !== 'production') {
    const memoryLogger = () => {
      const used = process.memoryUsage();
      const mb = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;

      console.log(`  🧠 Memory: RSS: ${mb(used.rss)}MB, Heap: ${mb(used.heapUsed)}/${mb(used.heapTotal)}MB`);

      // Log to file
      const memoryLog = path.resolve(process.cwd(), 'logs/personas/memory.log');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] RSS: ${mb(used.rss)}MB, Heap: ${mb(used.heapUsed)}/${mb(used.heapTotal)}MB\n`;
      fs.appendFileSync(memoryLog, logEntry);
    };

    // Initial memory check
    memoryLogger();

    // Set up periodic memory monitoring (every 5 minutes)
    global.memoryMonitor = setInterval(memoryLogger, 5 * 60 * 1000);
  }

  // Set up graceful shutdown handlers
  const cleanup = () => {
    console.log('🛑 Cleaning up persona testing environment...');

    if (global.memoryMonitor) {
      clearInterval(global.memoryMonitor);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('  ♻️ Forced garbage collection');
    }
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception in persona testing:', error);
    cleanup();
    process.exit(1);
  });

  console.log('✅ Persona Testing Environment Ready');
};