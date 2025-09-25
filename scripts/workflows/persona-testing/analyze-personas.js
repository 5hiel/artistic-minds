#!/usr/bin/env node

/**
 * Persona Testing Analysis Tool
 *
 * Generates comprehensive summary reports from persona testing results
 * including tabular analysis, database analytics, and cross-persona comparisons.
 *
 * Usage:
 *   node analyze-personas.js [options]
 *
 * Options:
 *   --session-id <id>     Process specific session
 *   --persona <name>      Process specific persona (ira|omi|mumu|ma)
 *   --format <type>       Output format (markdown|json|txt) [default: markdown]
 *   --output <file>       Output file path
 *   --include-database    Include database analytics
 *   --compare-sessions    Compare multiple sessions
 *   --dry-run            Show what would be processed without generating
 *
 * Examples:
 *   node analyze-personas.js --session-id "ira_test_123"
 *   node analyze-personas.js --persona ira --format json
 *   node analyze-personas.js --compare-sessions --format markdown
 */

const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3');
const { promisify } = require('util');

class PersonaSummaryGenerator {
  constructor(options = {}) {
    this.options = {
      format: 'markdown',
      includeDatabase: true,
      compareSessions: false,
      dryRun: false,
      ...options
    };

    this.analyticsDb = null;
    this.results = {
      sessions: [],
      personas: new Set(),
      totalPuzzles: 0,
      overallStats: {},
      comparisons: {}
    };
  }

  async initialize() {
    console.log('🔧 Initializing persona summary generator...');

    // Check for analytics database
    const dbPath = path.join(process.cwd(), 'analytics', 'test_analytics.db');
    try {
      await fs.access(dbPath);
      this.analyticsDb = new sqlite3.Database(dbPath);
      this.analyticsDb.all = promisify(this.analyticsDb.all).bind(this.analyticsDb);
      console.log('📊 Connected to analytics database');
    } catch (error) {
      console.warn('⚠️ Analytics database not found, using log-based analysis only');
    }
  }

  async processSession(sessionId) {
    console.log(`🔍 Processing session: ${sessionId}`);

    const sessionData = {
      sessionId,
      persona: null,
      chunks: [],
      analytics: null,
      summary: {}
    };

    // Extract from database if available
    if (this.analyticsDb) {
      try {
        // Get session metadata
        const sessionInfo = await this.analyticsDb.all(
          'SELECT * FROM test_sessions WHERE session_id = ?',
          [sessionId]
        );

        if (sessionInfo.length > 0) {
          const session = sessionInfo[0];
          sessionData.persona = session.persona;
          sessionData.totalChunks = session.total_chunks;
          sessionData.puzzlesPerChunk = session.puzzles_per_chunk;
          sessionData.created = session.created_at;
          sessionData.completed = session.completed_at;

          console.log(`  📋 Found session: ${session.persona} (${session.total_chunks}x${session.puzzles_per_chunk})`);

          // Get puzzle analytics
          const puzzleData = await this.analyticsDb.all(
            'SELECT * FROM puzzle_analytics WHERE session_id = ? ORDER BY chunk_number, puzzle_sequence',
            [sessionId]
          );

          // Get profile snapshots
          const profileSnapshots = await this.analyticsDb.all(
            'SELECT * FROM profile_snapshots WHERE session_id = ? ORDER BY chunk_number',
            [sessionId]
          );

          sessionData.analytics = {
            puzzles: puzzleData,
            profiles: profileSnapshots,
            totalPuzzles: puzzleData.length
          };

          this.results.personas.add(session.persona);
          this.results.totalPuzzles += puzzleData.length;
        } else {
          console.log(`  ⚠️ No database record found for session: ${sessionId}`);
        }
      } catch (error) {
        console.error(`  ❌ Database query failed: ${error.message}`);
      }
    }

    // Look for log files as backup
    const logPattern = `persona_*${sessionId}*_output.log`;
    try {
      const files = await fs.readdir(process.cwd());
      const logFiles = files.filter(f => f.match(/persona_.*_output\.log$/));

      if (logFiles.length > 0) {
        console.log(`  📄 Found ${logFiles.length} log file(s)`);
        sessionData.logFiles = logFiles;
      }
    } catch (error) {
      console.warn(`  ⚠️ Could not scan for log files: ${error.message}`);
    }

    this.results.sessions.push(sessionData);
    return sessionData;
  }

  async findAllSessions() {
    console.log('🔍 Scanning for all available sessions...');

    const sessions = [];

    // Scan database for sessions
    if (this.analyticsDb) {
      try {
        const allSessions = await this.analyticsDb.all(
          'SELECT DISTINCT session_id, persona, created_at FROM test_sessions ORDER BY created_at DESC LIMIT 50'
        );

        sessions.push(...allSessions.map(s => s.session_id));
        console.log(`  📊 Found ${allSessions.length} sessions in database`);
      } catch (error) {
        console.error(`  ❌ Database scan failed: ${error.message}`);
      }
    }

    // Scan for log files
    try {
      const files = await fs.readdir(process.cwd());
      const logFiles = files.filter(f => f.match(/persona_.*_output\.log$/));

      // Extract session IDs from log file names
      const logSessions = logFiles.map(file => {
        const match = file.match(/persona_(.+)_output\.log$/);
        return match ? match[1] : null;
      }).filter(Boolean);

      // Add unique sessions from logs
      logSessions.forEach(sessionId => {
        if (!sessions.includes(sessionId)) {
          sessions.push(sessionId);
        }
      });

      console.log(`  📄 Found ${logFiles.length} log files with ${logSessions.length} unique sessions`);
    } catch (error) {
      console.warn(`  ⚠️ Log file scan failed: ${error.message}`);
    }

    return sessions;
  }

  generateMarkdownReport() {
    const report = [];

    // Header
    report.push('# 🎭 Persona Testing Summary Report');
    report.push('');
    report.push(`**Generated**: ${new Date().toISOString()}`);
    report.push(`**Sessions Analyzed**: ${this.results.sessions.length}`);
    report.push(`**Personas**: ${Array.from(this.results.personas).join(', ')}`);
    report.push(`**Total Puzzles**: ${this.results.totalPuzzles}`);
    report.push('');

    // Session Details
    report.push('## 📊 Session Analysis');
    report.push('');

    this.results.sessions.forEach((session, index) => {
      report.push(`### ${index + 1}. ${session.sessionId}`);
      report.push('');

      if (session.persona) {
        report.push(`**Persona**: ${session.persona}`);
        report.push(`**Configuration**: ${session.totalChunks || 'Unknown'} chunks × ${session.puzzlesPerChunk || 'Unknown'} puzzles`);

        if (session.created) {
          report.push(`**Started**: ${new Date(session.created).toLocaleString()}`);
        }

        if (session.completed) {
          report.push(`**Completed**: ${new Date(session.completed).toLocaleString()}`);
        }
      }

      // Analytics summary
      if (session.analytics && session.analytics.puzzles.length > 0) {
        const puzzles = session.analytics.puzzles;
        const totalPuzzles = puzzles.length;
        const successfulPuzzles = puzzles.filter(p => p.success === 1).length;
        const successRate = ((successfulPuzzles / totalPuzzles) * 100).toFixed(1);
        const avgDifficulty = (puzzles.reduce((sum, p) => sum + p.difficulty, 0) / totalPuzzles).toFixed(2);

        report.push('');
        report.push('**Performance Summary:**');
        report.push(`- Total Puzzles: ${totalPuzzles}`);
        report.push(`- Success Rate: ${successRate}%`);
        report.push(`- Average Difficulty: ${avgDifficulty}`);

        // Puzzle type breakdown
        const typeStats = {};
        puzzles.forEach(p => {
          if (!typeStats[p.puzzle_type]) {
            typeStats[p.puzzle_type] = { total: 0, success: 0 };
          }
          typeStats[p.puzzle_type].total++;
          if (p.success === 1) typeStats[p.puzzle_type].success++;
        });

        report.push('');
        report.push('**Puzzle Type Performance:**');
        Object.entries(typeStats).forEach(([type, stats]) => {
          const rate = ((stats.success / stats.total) * 100).toFixed(0);
          const indicator = rate >= 70 ? '✅' : rate >= 40 ? '⚠️' : '❌';
          report.push(`- ${type}: ${stats.success}/${stats.total} (${rate}%) ${indicator}`);
        });

        // Chunk progression
        const chunkStats = {};
        puzzles.forEach(p => {
          if (!chunkStats[p.chunk_number]) {
            chunkStats[p.chunk_number] = { total: 0, success: 0 };
          }
          chunkStats[p.chunk_number].total++;
          if (p.success === 1) chunkStats[p.chunk_number].success++;
        });

        if (Object.keys(chunkStats).length > 1) {
          report.push('');
          report.push('**Chunk Progression:**');
          Object.entries(chunkStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([chunk, stats]) => {
              const rate = ((stats.success / stats.total) * 100).toFixed(0);
              report.push(`- Chunk ${chunk}: ${stats.success}/${stats.total} (${rate}%)`);
            });
        }
      }

      report.push('');
    });

    // Cross-persona comparison
    if (this.results.personas.size > 1 && this.options.compareSessions) {
      report.push('## 🔄 Cross-Persona Comparison');
      report.push('');

      const personaStats = {};

      this.results.sessions.forEach(session => {
        if (session.persona && session.analytics) {
          if (!personaStats[session.persona]) {
            personaStats[session.persona] = {
              sessions: 0,
              totalPuzzles: 0,
              successfulPuzzles: 0,
              avgDifficulty: 0,
              types: {}
            };
          }

          const stats = personaStats[session.persona];
          stats.sessions++;

          session.analytics.puzzles.forEach(p => {
            stats.totalPuzzles++;
            if (p.success === 1) stats.successfulPuzzles++;
            stats.avgDifficulty += p.difficulty;

            if (!stats.types[p.puzzle_type]) {
              stats.types[p.puzzle_type] = { total: 0, success: 0 };
            }
            stats.types[p.puzzle_type].total++;
            if (p.success === 1) stats.types[p.puzzle_type].success++;
          });
        }
      });

      // Generate comparison table
      report.push('| Persona | Sessions | Puzzles | Success Rate | Avg Difficulty |');
      report.push('|---------|----------|---------|--------------|----------------|');

      Object.entries(personaStats).forEach(([persona, stats]) => {
        const successRate = ((stats.successfulPuzzles / stats.totalPuzzles) * 100).toFixed(1);
        const avgDiff = (stats.avgDifficulty / stats.totalPuzzles).toFixed(2);
        report.push(`| ${persona} | ${stats.sessions} | ${stats.totalPuzzles} | ${successRate}% | ${avgDiff} |`);
      });

      report.push('');
    }

    // Database Analytics Summary
    if (this.analyticsDb) {
      report.push('## 📊 Database Analytics');
      report.push('');
      report.push('Analytics database available with detailed metrics including:');
      report.push('- Puzzle-level performance data');
      report.push('- Profile snapshots per chunk');
      report.push('- Adaptive engine decision tracking');
      report.push('- Cross-session comparison capabilities');
      report.push('');
      report.push('Use `sqlite3 analytics/test_analytics.db` for custom queries.');
      report.push('');
    }

    // Recommendations
    report.push('## 💡 Recommendations');
    report.push('');

    if (this.results.sessions.length === 1) {
      report.push('- Consider running additional personas for comparative analysis');
      report.push('- Use `--compare-sessions` flag for cross-persona insights');
    }

    if (this.results.totalPuzzles < 50 && this.results.sessions.length === 1) {
      report.push('- Consider using `standard` or `comprehensive` presets for deeper analysis');
    }

    if (!this.analyticsDb) {
      report.push('- Analytics database not found - ensure persona tests complete successfully');
    }

    report.push('');
    report.push('---');
    report.push('');
    report.push('📁 **Generated by**: `scripts/workflows/persona-testing/analyze-personas.js`');
    report.push('🔧 **GitHub Workflow**: `persona-testing.yml`');

    return report.join('\n');
  }

  generateJsonReport() {
    const report = {
      metadata: {
        generated: new Date().toISOString(),
        sessionsAnalyzed: this.results.sessions.length,
        personas: Array.from(this.results.personas),
        totalPuzzles: this.results.totalPuzzles,
        hasDatabaseAnalytics: !!this.analyticsDb
      },
      sessions: this.results.sessions.map(session => ({
        sessionId: session.sessionId,
        persona: session.persona,
        configuration: {
          totalChunks: session.totalChunks,
          puzzlesPerChunk: session.puzzlesPerChunk
        },
        timing: {
          created: session.created,
          completed: session.completed
        },
        analytics: session.analytics ? {
          totalPuzzles: session.analytics.totalPuzzles,
          performance: this.calculateSessionPerformance(session.analytics.puzzles || [])
        } : null
      })),
      comparisons: this.options.compareSessions ? this.generateComparisons() : null
    };

    return JSON.stringify(report, null, 2);
  }

  calculateSessionPerformance(puzzles) {
    if (!puzzles || puzzles.length === 0) return null;

    const totalPuzzles = puzzles.length;
    const successfulPuzzles = puzzles.filter(p => p.success === 1).length;
    const successRate = (successfulPuzzles / totalPuzzles) * 100;
    const avgDifficulty = puzzles.reduce((sum, p) => sum + p.difficulty, 0) / totalPuzzles;

    // Calculate type distribution
    const typeStats = {};
    puzzles.forEach(p => {
      if (!typeStats[p.puzzle_type]) {
        typeStats[p.puzzle_type] = { total: 0, success: 0 };
      }
      typeStats[p.puzzle_type].total++;
      if (p.success === 1) typeStats[p.puzzle_type].success++;
    });

    return {
      totalPuzzles,
      successfulPuzzles,
      successRate: parseFloat(successRate.toFixed(1)),
      avgDifficulty: parseFloat(avgDifficulty.toFixed(2)),
      typeDistribution: Object.fromEntries(
        Object.entries(typeStats).map(([type, stats]) => [
          type,
          {
            total: stats.total,
            success: stats.success,
            rate: parseFloat(((stats.success / stats.total) * 100).toFixed(1))
          }
        ])
      )
    };
  }

  generateComparisons() {
    // Implementation for cross-persona comparisons
    const comparisons = {};

    // Group sessions by persona
    const personaSessions = {};
    this.results.sessions.forEach(session => {
      if (session.persona) {
        if (!personaSessions[session.persona]) {
          personaSessions[session.persona] = [];
        }
        personaSessions[session.persona].push(session);
      }
    });

    // Calculate persona averages
    Object.entries(personaSessions).forEach(([persona, sessions]) => {
      const allPuzzles = sessions.flatMap(s => s.analytics?.puzzles || []);
      comparisons[persona] = this.calculateSessionPerformance(allPuzzles);
    });

    return comparisons;
  }

  async saveReport(content, outputPath) {
    if (this.options.dryRun) {
      console.log('🔍 [DRY RUN] Would save report to:', outputPath);
      console.log('📊 Report preview (first 500 chars):');
      console.log(content.substring(0, 500) + '...');
      return;
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`✅ Report saved to: ${outputPath}`);
  }

  async cleanup() {
    if (this.analyticsDb) {
      this.analyticsDb.close();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--session-id':
        options.sessionId = args[++i];
        break;
      case '--persona':
        options.persona = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--include-database':
        options.includeDatabase = true;
        break;
      case '--compare-sessions':
        options.compareSessions = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        console.log(`
Persona Testing Summary Report Generator

Usage: node analyze-personas.js [options]

Options:
  --session-id <id>     Process specific session
  --persona <name>      Process specific persona (ira|omi|mumu|ma)
  --format <type>       Output format (markdown|json|txt) [default: markdown]
  --output <file>       Output file path
  --include-database    Include database analytics
  --compare-sessions    Compare multiple sessions
  --dry-run            Show what would be processed without generating
  --help               Show this help message

Examples:
  node analyze-personas.js --session-id "ira_test_123"
  node analyze-personas.js --persona ira --format json
  node analyze-personas.js --compare-sessions --format markdown
        `);
        process.exit(0);
    }
  }

  console.log('🎭 Persona Testing Summary Report Generator');
  console.log('============================================');

  const generator = new PersonaSummaryGenerator(options);

  try {
    await generator.initialize();

    // Determine which sessions to process
    let sessionIds = [];

    if (options.sessionId) {
      sessionIds = [options.sessionId];
    } else {
      sessionIds = await generator.findAllSessions();

      // Filter by persona if specified
      if (options.persona) {
        console.log(`🎭 Filtering sessions for persona: ${options.persona}`);
        // This would require additional filtering logic based on session naming or database lookup
      }
    }

    console.log(`🔍 Processing ${sessionIds.length} session(s)...`);

    // Process each session
    for (const sessionId of sessionIds.slice(0, 20)) { // Limit to 20 sessions to prevent overwhelming
      await generator.processSession(sessionId);
    }

    // Generate report
    let reportContent;
    switch (options.format) {
      case 'json':
        reportContent = generator.generateJsonReport();
        break;
      case 'markdown':
      default:
        reportContent = generator.generateMarkdownReport();
        break;
    }

    // Determine output path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultOutput = `persona-summary-report-${timestamp}.${options.format === 'json' ? 'json' : 'md'}`;
    const outputPath = options.output || path.join(process.cwd(), 'reports', defaultOutput);

    await generator.saveReport(reportContent, outputPath);

    console.log('');
    console.log('📊 Report Generation Summary:');
    console.log(`  Sessions processed: ${generator.results.sessions.length}`);
    console.log(`  Personas found: ${Array.from(generator.results.personas).join(', ') || 'None'}`);
    console.log(`  Total puzzles: ${generator.results.totalPuzzles}`);
    console.log(`  Database analytics: ${generator.analyticsDb ? 'Available' : 'Not available'}`);
    console.log(`  Output format: ${options.format || 'markdown'}`);
    console.log(`  Output file: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  } finally {
    await generator.cleanup();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { PersonaSummaryGenerator };