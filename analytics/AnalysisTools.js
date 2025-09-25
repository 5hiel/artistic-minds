/**
 * Analysis Tools for Test Analytics Database
 *
 * Command-line tools for querying and analyzing persona simulation data
 */

const { TestAnalyticsCollector } = require('./TestAnalyticsCollector');

class AnalysisTools {
  constructor(dbPath = null) {
    this.analytics = new TestAnalyticsCollector(dbPath);
  }

  /**
   * Get all sessions in the database
   */
  listSessions() {
    const sessions = this.analytics.query(`
      SELECT session_id, persona, total_chunks, puzzles_per_chunk,
             started_at, completed_at, test_config
      FROM test_sessions
      ORDER BY started_at DESC
    `);

    console.log('\n📊 Available Test Sessions:');
    console.log('=====================================');

    if (sessions.length === 0) {
      console.log('No sessions found in database.');
      return;
    }

    sessions.forEach(session => {
      const config = session.test_config ? JSON.parse(session.test_config) : {};
      const duration = session.completed_at
        ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 1000)
        : 'In Progress';

      console.log(`\n🎭 ${session.persona.toUpperCase()} - ${session.session_id}`);
      console.log(`   📦 ${session.total_chunks} chunks × ${session.puzzles_per_chunk} puzzles`);
      console.log(`   ⏰ Started: ${new Date(session.started_at).toLocaleString()}`);
      console.log(`   ⏱️ Duration: ${duration}${typeof duration === 'number' ? 's' : ''}`);
      console.log(`   ⚙️ Config: ${config.preset || 'custom'}`);
    });

    return sessions;
  }

  /**
   * Analyze a specific session
   */
  analyzeSession(sessionId) {
    console.log(`\n🔍 Analyzing Session: ${sessionId}`);
    console.log('=====================================');

    // Get session info
    const session = this.analytics.query(
      'SELECT * FROM test_sessions WHERE session_id = ?',
      [sessionId]
    )[0];

    if (!session) {
      console.log('❌ Session not found');
      return;
    }

    console.log(`🎭 Persona: ${session.persona}`);
    console.log(`📊 Target: ${session.total_chunks} chunks × ${session.puzzles_per_chunk} puzzles`);

    // Get profile snapshots
    const snapshots = this.analytics.query(`
      SELECT chunk_number, profile_data, captured_at
      FROM profile_snapshots
      WHERE session_id = ?
      ORDER BY chunk_number
    `, [sessionId]);

    if (snapshots.length > 0) {
      console.log('\n📈 Profile Evolution:');
      snapshots.forEach(snapshot => {
        const profile = JSON.parse(snapshot.profile_data);
        console.log(`   Chunk ${snapshot.chunk_number}: ` +
          `Puzzles: ${profile.totalPuzzlesSolved}, ` +
          `Accuracy: ${(profile.overallAccuracy * 100).toFixed(1)}%, ` +
          `Level: ${profile.currentLevel}`
        );
      });
    }

    // Get adaptive metrics
    const adaptiveMetrics = this.analytics.query(`
      SELECT chunk_number, generation_strategy, performance_metrics, quality_metrics
      FROM adaptive_metrics
      WHERE session_id = ?
      ORDER BY chunk_number
    `, [sessionId]);

    if (adaptiveMetrics.length > 0) {
      console.log('\n🛠️ Adaptive Performance:');
      adaptiveMetrics.forEach(metric => {
        const perf = JSON.parse(metric.performance_metrics);
        const quality = JSON.parse(metric.quality_metrics);
        console.log(`   Chunk ${metric.chunk_number}: ` +
          `Strategy: ${metric.generation_strategy}, ` +
          `Success Rate: ${((perf.successfulGenerations / (perf.successfulGenerations + perf.failedGenerations)) * 100).toFixed(1)}%, ` +
          `Variety: ${quality.puzzleTypeVariety}`
        );
      });
    }

    // Get prediction accuracy
    const predictions = this.analytics.query(`
      SELECT chunk_number, AVG(prediction_accuracy) as avg_accuracy,
             COUNT(*) as prediction_count
      FROM prediction_metrics
      WHERE session_id = ?
      GROUP BY chunk_number
      ORDER BY chunk_number
    `, [sessionId]);

    if (predictions.length > 0) {
      console.log('\n🎯 Prediction Accuracy:');
      predictions.forEach(pred => {
        console.log(`   Chunk ${pred.chunk_number}: ` +
          `${(pred.avg_accuracy * 100).toFixed(1)}% ` +
          `(${pred.prediction_count} predictions)`
        );
      });
    }

    return { session, snapshots, adaptiveMetrics, predictions };
  }

  /**
   * Compare multiple personas
   */
  comparePersonas(sessionIds) {
    console.log('\n🎭 Persona Comparison');
    console.log('=====================================');

    const results = {};

    sessionIds.forEach(sessionId => {
      const session = this.analytics.query(
        'SELECT persona FROM test_sessions WHERE session_id = ?',
        [sessionId]
      )[0];

      if (!session) {
        console.log(`❌ Session ${sessionId} not found`);
        return;
      }

      // Get final profile state
      const finalProfile = this.analytics.query(`
        SELECT profile_data FROM profile_snapshots
        WHERE session_id = ?
        ORDER BY chunk_number DESC
        LIMIT 1
      `, [sessionId])[0];

      // Get overall prediction accuracy
      const avgAccuracy = this.analytics.query(`
        SELECT AVG(prediction_accuracy) as accuracy
        FROM prediction_metrics
        WHERE session_id = ?
      `, [sessionId])[0];

      results[session.persona] = {
        sessionId,
        finalProfile: finalProfile ? JSON.parse(finalProfile.profile_data) : null,
        predictionAccuracy: avgAccuracy?.accuracy || 0
      };
    });

    // Display comparison
    Object.entries(results).forEach(([persona, data]) => {
      console.log(`\n🎭 ${persona.toUpperCase()}:`);
      if (data.finalProfile) {
        console.log(`   📊 Final Accuracy: ${(data.finalProfile.overallAccuracy * 100).toFixed(1)}%`);
        console.log(`   🧩 Puzzles Solved: ${data.finalProfile.totalPuzzlesSolved}`);
        console.log(`   📈 Level Reached: ${data.finalProfile.currentLevel}`);
      }
      console.log(`   🎯 Prediction Accuracy: ${(data.predictionAccuracy * 100).toFixed(1)}%`);
    });

    return results;
  }

  /**
   * Export session data to CSV
   */
  exportSession(sessionId, tableName = 'profile_snapshots') {
    console.log(`\n📤 Exporting ${tableName} for session ${sessionId}`);
    const csv = this.analytics.exportToCSV(tableName, sessionId);

    if (csv) {
      const fs = require('fs');
      const filename = `${sessionId}_${tableName}.csv`;
      fs.writeFileSync(filename, csv);
      console.log(`✅ Exported to ${filename}`);
      return filename;
    } else {
      console.log('❌ No data to export');
      return null;
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    const stats = this.analytics.getStats();

    console.log('\n📊 Database Statistics:');
    console.log('=====================================');
    console.log(`🎮 Sessions: ${stats.sessions}`);
    console.log(`📸 Profile Snapshots: ${stats.profileSnapshots}`);
    console.log(`🧩 Puzzles: ${stats.puzzles}`);
    console.log(`🎯 Predictions: ${stats.predictions}`);

    return stats;
  }

  /**
   * Clean up old test data
   */
  cleanup(daysOld = 30) {
    console.log(`\n🧹 Cleaning up data older than ${daysOld} days...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffString = cutoffDate.toISOString();

    const tables = [
      'test_sessions', 'profile_snapshots', 'user_classifications',
      'pool_selections', 'prediction_metrics', 'puzzle_analytics',
      'adaptive_metrics', 'engine_decisions'
    ];

    let totalDeleted = 0;

    tables.forEach(table => {
      const result = this.analytics.query(`
        DELETE FROM ${table}
        WHERE datetime(timestamp) < datetime(?) OR datetime(started_at) < datetime(?)
      `, [cutoffString, cutoffString]);

      if (result.changes) {
        console.log(`   🗑️ ${table}: ${result.changes} records deleted`);
        totalDeleted += result.changes;
      }
    });

    console.log(`✅ Cleanup complete: ${totalDeleted} total records deleted`);
    return totalDeleted;
  }
}

// Command-line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const tools = new AnalysisTools();

  switch (command) {
    case 'list':
      tools.listSessions();
      break;

    case 'analyze':
      if (args[1]) {
        tools.analyzeSession(args[1]);
      } else {
        console.log('Usage: node AnalysisTools.js analyze <session_id>');
      }
      break;

    case 'compare':
      if (args.length > 1) {
        tools.comparePersonas(args.slice(1));
      } else {
        console.log('Usage: node AnalysisTools.js compare <session_id1> <session_id2> ...');
      }
      break;

    case 'export':
      if (args[1]) {
        const table = args[2] || 'profile_snapshots';
        tools.exportSession(args[1], table);
      } else {
        console.log('Usage: node AnalysisTools.js export <session_id> [table_name]');
      }
      break;

    case 'stats':
      tools.getStats();
      break;

    case 'cleanup':
      const days = parseInt(args[1]) || 30;
      tools.cleanup(days);
      break;

    default:
      console.log(`
🔧 Test Analytics Analysis Tools

Available commands:
  list                           - List all test sessions
  analyze <session_id>           - Analyze specific session
  compare <session_id> ...       - Compare multiple personas
  export <session_id> [table]    - Export session data to CSV
  stats                          - Show database statistics
  cleanup [days]                 - Clean up old data (default: 30 days)

Examples:
  node AnalysisTools.js list
  node AnalysisTools.js analyze ira_test_123456
  node AnalysisTools.js compare ira_session omi_session ma_session
  node AnalysisTools.js export ira_session profile_snapshots
      `);
  }
}

module.exports = { AnalysisTools };