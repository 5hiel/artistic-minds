-- Test Analytics Database Schema
-- SQLite database for capturing persona simulation test data

-- Test sessions metadata
CREATE TABLE IF NOT EXISTS test_sessions (
  session_id TEXT PRIMARY KEY,
  persona TEXT NOT NULL,
  total_chunks INTEGER,
  puzzles_per_chunk INTEGER,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  test_config JSON
);

-- Complete profile snapshots per chunk
CREATE TABLE IF NOT EXISTS profile_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER NOT NULL,
  profile_data JSON NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- User classification tracking
CREATE TABLE IF NOT EXISTS user_classifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER,
  puzzle_sequence INTEGER,
  user_state TEXT NOT NULL,  -- 'new_user', 'struggling_user', 'experienced_user'
  confidence_score REAL,
  classification_factors JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Pool distribution analytics
CREATE TABLE IF NOT EXISTS pool_selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER,
  puzzle_sequence INTEGER,
  selected_pool TEXT,  -- 'skill_development', 'confidence_building', etc.
  pool_strategy TEXT,
  selection_reasoning TEXT,
  pool_effectiveness_score REAL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Prediction accuracy tracking
CREATE TABLE IF NOT EXISTS prediction_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER,
  puzzle_sequence INTEGER,
  predicted_success REAL,
  actual_success BOOLEAN,
  predicted_engagement REAL,
  actual_engagement REAL,
  prediction_accuracy REAL,
  success_error REAL,
  engagement_error REAL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Individual puzzle analytics
CREATE TABLE IF NOT EXISTS puzzle_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER,
  puzzle_sequence INTEGER,
  puzzle_type TEXT,
  difficulty REAL,
  success BOOLEAN,
  response_time REAL,
  puzzle_dna JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Adaptive metrics from generation events
CREATE TABLE IF NOT EXISTS adaptive_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER,
  generation_strategy TEXT,
  performance_metrics JSON,  -- totalTime, avgPerCandidate, successRate, fallbacks
  quality_metrics JSON,      -- varietyScore, skillCoverage, poolBreakdown
  pool_effectiveness JSON,   -- per-pool success rates and engagement
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Decision engine analytics
CREATE TABLE IF NOT EXISTS engine_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chunk_number INTEGER,
  puzzle_sequence INTEGER,
  decision_type TEXT,  -- 'difficulty_selection', 'pool_choice', 'adaptation_trigger'
  decision_value TEXT,
  reasoning JSON,
  constraints_applied JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_snapshots_session_chunk ON profile_snapshots(session_id, chunk_number);
CREATE INDEX IF NOT EXISTS idx_user_classifications_session ON user_classifications(session_id);
CREATE INDEX IF NOT EXISTS idx_pool_selections_session ON pool_selections(session_id);
CREATE INDEX IF NOT EXISTS idx_prediction_metrics_session ON prediction_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_analytics_session ON puzzle_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_metrics_session ON adaptive_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_engine_decisions_session ON engine_decisions(session_id);