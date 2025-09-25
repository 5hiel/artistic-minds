/**
 * Test Analytics Collector
 * Lightweight SQLite database for capturing persona simulation test data
 *
 * This is test-only infrastructure - never shipped with the app
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class TestAnalyticsCollector {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, 'test_analytics.db');
    this.db = null;
    this.isEnabled = process.env.NODE_ENV === 'test' || process.env.ENABLE_TEST_ANALYTICS === 'true';

    if (this.isEnabled) {
      this.initialize();
    }
  }

  /**
   * Initialize database and create schema
   */
  initialize() {
    try {
      // Create analytics directory if it doesn't exist
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Initialize SQLite database
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000');

      // Execute schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
        console.log('📊 [TestAnalytics] Database initialized:', this.dbPath);
      } else {
        console.warn('⚠️ [TestAnalytics] Schema file not found:', schemaPath);
      }

      // Prepare statements for better performance
      this.prepareStatements();
    } catch (error) {
      console.error('❌ [TestAnalytics] Initialization failed:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Prepare SQL statements for better performance
   */
  prepareStatements() {
    this.statements = {
      insertSession: this.db.prepare(`
        INSERT OR REPLACE INTO test_sessions
        (session_id, persona, total_chunks, puzzles_per_chunk, test_config)
        VALUES (?, ?, ?, ?, ?)
      `),

      updateSessionCompleted: this.db.prepare(`
        UPDATE test_sessions
        SET completed_at = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `),

      insertProfileSnapshot: this.db.prepare(`
        INSERT INTO profile_snapshots
        (session_id, chunk_number, profile_data)
        VALUES (?, ?, ?)
      `),

      insertUserClassification: this.db.prepare(`
        INSERT INTO user_classifications
        (session_id, chunk_number, puzzle_sequence, user_state, confidence_score, classification_factors)
        VALUES (?, ?, ?, ?, ?, ?)
      `),

      insertPoolSelection: this.db.prepare(`
        INSERT INTO pool_selections
        (session_id, chunk_number, puzzle_sequence, selected_pool, pool_strategy, selection_reasoning, pool_effectiveness_score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `),

      insertPredictionMetrics: this.db.prepare(`
        INSERT INTO prediction_metrics
        (session_id, chunk_number, puzzle_sequence, predicted_success, actual_success, predicted_engagement, actual_engagement, prediction_accuracy, success_error, engagement_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      insertPuzzleAnalytics: this.db.prepare(`
        INSERT INTO puzzle_analytics
        (session_id, chunk_number, puzzle_sequence, puzzle_type, difficulty, success, response_time, puzzle_dna)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),

      insertAdaptiveMetrics: this.db.prepare(`
        INSERT INTO adaptive_metrics
        (session_id, chunk_number, generation_strategy, performance_metrics, quality_metrics, pool_effectiveness)
        VALUES (?, ?, ?, ?, ?, ?)
      `),

      insertEngineDecision: this.db.prepare(`
        INSERT INTO engine_decisions
        (session_id, chunk_number, puzzle_sequence, decision_type, decision_value, reasoning, constraints_applied)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
    };
  }

  /**
   * Start tracking a test session
   */
  startSession(sessionId, persona, totalChunks, puzzlesPerChunk, testConfig = {}) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.insertSession.run(
        sessionId,
        persona,
        totalChunks,
        puzzlesPerChunk,
        JSON.stringify(testConfig)
      );
      console.log(`📊 [TestAnalytics] Started session: ${sessionId} (${persona})`);
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to start session:', error);
    }
  }

  /**
   * Mark session as completed
   */
  completeSession(sessionId) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.updateSessionCompleted.run(sessionId);
      console.log(`✅ [TestAnalytics] Completed session: ${sessionId}`);
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to complete session:', error);
    }
  }

  /**
   * Capture complete user profile snapshot
   */
  captureProfileSnapshot(sessionId, chunkNumber, profileData) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.insertProfileSnapshot.run(
        sessionId,
        chunkNumber,
        JSON.stringify(profileData)
      );
      console.log(`📸 [TestAnalytics] Profile snapshot: ${sessionId} chunk ${chunkNumber}`);
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to capture profile snapshot:', error);
    }
  }

  /**
   * Record user classification data
   */
  recordUserClassification(sessionId, chunkNumber, puzzleSequence, userState, confidenceScore, factors = {}) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.insertUserClassification.run(
        sessionId,
        chunkNumber,
        puzzleSequence,
        userState,
        confidenceScore,
        JSON.stringify(factors)
      );
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to record user classification:', error);
    }
  }

  /**
   * Record pool selection decision
   */
  recordPoolSelection(sessionId, chunkNumber, puzzleSequence, selectedPool, strategy, reasoning, effectiveness = null) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.insertPoolSelection.run(
        sessionId,
        chunkNumber,
        puzzleSequence,
        selectedPool,
        strategy,
        reasoning,
        effectiveness
      );
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to record pool selection:', error);
    }
  }

  /**
   * Record prediction accuracy metrics
   */
  recordPredictionMetrics(sessionId, chunkNumber, puzzleSequence, predicted, actual) {
    if (!this.isEnabled || !this.db) return;

    try {
      // Ensure all values are valid SQLite types (numbers, strings, or null)
      const safeSessionId = String(sessionId || '');
      const safeChunkNumber = Number(chunkNumber) || 0;
      const safePuzzleSequence = Number(puzzleSequence) || 0;

      // Extract and validate prediction values
      const predictedSuccess = this.extractNumericValue(predicted?.success);
      const actualSuccess = this.extractNumericValue(actual?.success);
      const predictedEngagement = this.extractNumericValue(predicted?.engagement);
      const actualEngagement = this.extractNumericValue(actual?.engagement);

      const predictionAccuracy = this.extractNumericValue(predicted?.predictionAccuracy) || 0;
      const successError = this.extractNumericValue(predicted?.successError) || 0;
      const engagementError = this.extractNumericValue(predicted?.engagementError) || 0;

      this.statements.insertPredictionMetrics.run(
        safeSessionId,
        safeChunkNumber,
        safePuzzleSequence,
        predictedSuccess,
        actualSuccess,
        predictedEngagement,
        actualEngagement,
        predictionAccuracy,
        successError,
        engagementError
      );
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to record prediction metrics:', error);
      console.error('   Predicted data:', predicted);
      console.error('   Actual data:', actual);
    }
  }

  /**
   * Helper to safely extract numeric values for SQLite
   */
  extractNumericValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    return null;
  }

  /**
   * Record individual puzzle analytics
   */
  recordPuzzleAnalytics(sessionId, chunkNumber, puzzleSequence, puzzleType, difficulty, success, responseTime, puzzleDNA = {}) {
    if (!this.isEnabled || !this.db) return;

    try {
      // Ensure all values are valid SQLite types
      const safeSessionId = String(sessionId || '');
      const safeChunkNumber = Number(chunkNumber) || 0;
      const safePuzzleSequence = Number(puzzleSequence) || 0;
      const safePuzzleType = String(puzzleType || '');
      const safeDifficulty = this.extractNumericValue(difficulty) || 0;
      const safeSuccess = this.extractNumericValue(success);
      const safeResponseTime = this.extractNumericValue(responseTime) || 0;
      const safePuzzleDNA = JSON.stringify(puzzleDNA || {});

      this.statements.insertPuzzleAnalytics.run(
        safeSessionId,
        safeChunkNumber,
        safePuzzleSequence,
        safePuzzleType,
        safeDifficulty,
        safeSuccess,
        safeResponseTime,
        safePuzzleDNA
      );
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to record puzzle analytics:', error);
    }
  }

  /**
   * Record adaptive metrics from generation events
   */
  recordAdaptiveMetrics(sessionId, chunkNumber, strategy, performance, quality, poolEffectiveness = {}) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.insertAdaptiveMetrics.run(
        sessionId,
        chunkNumber,
        strategy,
        JSON.stringify(performance),
        JSON.stringify(quality),
        JSON.stringify(poolEffectiveness)
      );
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to record adaptive metrics:', error);
    }
  }

  /**
   * Record engine decision
   */
  recordEngineDecision(sessionId, chunkNumber, puzzleSequence, decisionType, decisionValue, reasoning = {}, constraints = {}) {
    if (!this.isEnabled || !this.db) return;

    try {
      this.statements.insertEngineDecision.run(
        sessionId,
        chunkNumber,
        puzzleSequence,
        decisionType,
        decisionValue,
        JSON.stringify(reasoning),
        JSON.stringify(constraints)
      );
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to record engine decision:', error);
    }
  }

  /**
   * Execute custom query
   */
  query(sql, params = []) {
    if (!this.isEnabled || !this.db) return [];

    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error('❌ [TestAnalytics] Query failed:', error);
      return [];
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId) {
    if (!this.isEnabled || !this.db) return null;

    const session = this.query(
      'SELECT * FROM test_sessions WHERE session_id = ?',
      [sessionId]
    )[0];

    if (!session) return null;

    const profileSnapshots = this.query(
      'SELECT chunk_number, profile_data FROM profile_snapshots WHERE session_id = ? ORDER BY chunk_number',
      [sessionId]
    );

    const puzzleCount = this.query(
      'SELECT COUNT(*) as count FROM puzzle_analytics WHERE session_id = ?',
      [sessionId]
    )[0]?.count || 0;

    return {
      session,
      profileSnapshots: profileSnapshots.map(row => ({
        chunkNumber: row.chunk_number,
        profileData: JSON.parse(row.profile_data)
      })),
      totalPuzzles: puzzleCount
    };
  }

  /**
   * Export data to CSV
   */
  exportToCSV(tableName, sessionId = null) {
    if (!this.isEnabled || !this.db) return null;

    let sql = `SELECT * FROM ${tableName}`;
    const params = [];

    if (sessionId) {
      sql += ' WHERE session_id = ?';
      params.push(sessionId);
    }

    const data = this.query(sql, params);
    if (data.length === 0) return null;

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header =>
          typeof row[header] === 'string' && row[header].includes(',')
            ? `"${row[header]}"`
            : row[header]
        ).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('📊 [TestAnalytics] Database connection closed');
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    if (!this.isEnabled || !this.db) return {};

    try {
      const stats = {
        sessions: this.query('SELECT COUNT(*) as count FROM test_sessions')[0]?.count || 0,
        profileSnapshots: this.query('SELECT COUNT(*) as count FROM profile_snapshots')[0]?.count || 0,
        puzzles: this.query('SELECT COUNT(*) as count FROM puzzle_analytics')[0]?.count || 0,
        predictions: this.query('SELECT COUNT(*) as count FROM prediction_metrics')[0]?.count || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ [TestAnalytics] Failed to get stats:', error);
      return {};
    }
  }
}

// Singleton instance for easy access
let instance = null;

module.exports = {
  TestAnalyticsCollector,

  // Singleton access
  getInstance: (dbPath = null) => {
    if (!instance) {
      instance = new TestAnalyticsCollector(dbPath);
    }
    return instance;
  },

  // Direct methods for convenience
  startSession: (...args) => module.exports.getInstance().startSession(...args),
  completeSession: (...args) => module.exports.getInstance().completeSession(...args),
  captureProfileSnapshot: (...args) => module.exports.getInstance().captureProfileSnapshot(...args),
  recordUserClassification: (...args) => module.exports.getInstance().recordUserClassification(...args),
  recordPoolSelection: (...args) => module.exports.getInstance().recordPoolSelection(...args),
  recordPredictionMetrics: (...args) => module.exports.getInstance().recordPredictionMetrics(...args),
  recordPuzzleAnalytics: (...args) => module.exports.getInstance().recordPuzzleAnalytics(...args),
  recordAdaptiveMetrics: (...args) => module.exports.getInstance().recordAdaptiveMetrics(...args),
  recordEngineDecision: (...args) => module.exports.getInstance().recordEngineDecision(...args)
};