# Persona Testing Framework

Advanced adaptive learning simulation with comprehensive behavioral analysis covering **9 puzzle types** and **4 distinct user personas** to measure adaptation timing and pattern recognition effectiveness.

## 🎭 Available Personas

| Persona | Age | Description | Expected Behavior | Max Difficulty | Characteristics |
|---------|-----|-------------|------------------|----------------|-----------------|
| **ira** | 8 years | Competitive child with strong pattern skills | Visual/spatial focus, avoid complex math | 0.5 | Performance-driven, pattern recognition |
| **omi** | 5 years | Curious explorer with high enthusiasm | Visual/pattern puzzles, very limited math | 0.3 | Creativity-focused, needs encouragement |
| **mumu** | 25 years | Casual adult with balanced skills | Prefers high scores, avoids frustration | 0.8 | Balanced performance, score-focused |
| **ma** | 60 years | Experienced adult focused on cognitive maintenance | Complex reasoning, challenging puzzles | 0.9 | Deep analytical skills, lifelong learning |

## 🚀 Single Persona Testing

### Complete 50-Puzzle Analysis (Recommended)
Runs all 5 chunks × 10 puzzles = 50 total puzzles with comprehensive tabular reporting:

```bash
# Individual persona tests with full analysis
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
PRESET=quick PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
PRESET=quick PERSONA=mumu npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
PRESET=quick PERSONA=ma npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
```

### Custom Configuration Options
```bash
# Custom chunk/puzzle counts
PERSONA=ira TOTAL_CHUNKS=10 PUZZLES_PER_CHUNK=8 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# Quick test (reduced puzzles)
PERSONA=omi TOTAL_CHUNKS=3 PUZZLES_PER_CHUNK=5 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000

# Comprehensive test (more puzzles)
PERSONA=ma TOTAL_CHUNKS=10 PUZZLES_PER_CHUNK=10 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=1200000
```

## 🔄 Multiple Persona Testing

### Sequential Batch Testing
Run all personas one after another for comparative analysis:

```bash
# Method 1: Using Node.js batch script (recommended)
npm run personas:run-batch

# Method 2: Manual sequential execution
for persona in ira omi mumu ma; do
  echo "Testing persona: $persona"
  PRESET=quick PERSONA=$persona npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
  sleep 5
done
```

### Parallel Testing (Advanced)
Run multiple personas simultaneously (requires more system resources):

```bash
# Run in parallel (use different terminals or screen sessions)
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 &
PRESET=quick PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 &
PRESET=quick PERSONA=mumu npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 &
wait
```

### Batch Results Aggregation
```bash
# Aggregate results from multiple persona runs
npm run personas:aggregate

# Manual aggregation with specific batch ID
node scripts/aggregate-persona-results.js batch_1234567890
```

## 🔄 Cross-Persona Adaptive Testing

**Objective**: Test how the adaptive engine responds when different personas use the same continuous game session, simulating real-world scenarios where multiple users might play on the same device or account.

### Key Testing Benefits
- **Adaptive Engine Validation**: Measures engine's ability to detect and adapt to different user behaviors
- **Constraint System Testing**: Validates age-appropriate difficulty enforcement across age groups
- **Session Persistence**: Tests state continuity across behavioral transitions
- **Behavioral Recognition**: Evaluates engine's persona detection capabilities

### Cross-Persona Test Configuration

**Session Structure**: One shared session with sequential persona execution
**Pattern**: Ma(1-5) → omi(6-10) → mumu(11-15) → ira(16-20)
**Total**: 20 chunks, 200 puzzles, ~20-25 minutes execution time

| Persona | Chunks | Role | Expected Behavior |
|---------|--------|------|------------------|
| **Ma** | 1-5 | Baseline | Establishes session with adult-level performance |
| **omi** | 6-10 | Child Adaptation | Tests constraint system for age-appropriate content |
| **mumu** | 11-15 | Adult Continuation | Validates adult behavioral patterns |
| **ira** | 16-20 | Competitive Child | Tests competitive vs exploratory behavior detection |

### Step-by-Step Execution

#### 1. Ma Persona - Baseline Establishment (Chunks 1-5)
```bash
# Fresh session creation
PERSONA=ma TOTAL_CHUNKS=5 PUZZLES_PER_CHUNK=10 SESSION_ID=ma_batch_$(date +%s) npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000 > ma_persona_report.log 2>&1

# Extract session ID for next personas
grep "Session ID:" ma_persona_report.log
# Expected output: Session ID: ma_batch_[TIMESTAMP]
```

#### 2. omi Persona - Child Adaptation Test (Chunks 6-10)
```bash
# Resume from Ma's session - tests age-appropriate adaptation
RESUME_SESSION=true SESSION_ID=ma_batch_[TIMESTAMP] START_CHUNK=6 PERSONA=omi TOTAL_CHUNKS=10 PUZZLES_PER_CHUNK=10 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000 > omi_persona_report.log 2>&1
```

#### 3. mumu Persona - Adult Continuation (Chunks 11-15)
```bash
# Continue from previous personas - tests adult behavioral patterns
RESUME_SESSION=true SESSION_ID=ma_batch_[TIMESTAMP] START_CHUNK=11 PERSONA=mumu TOTAL_CHUNKS=15 PUZZLES_PER_CHUNK=10 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000 > mumu_persona_report.log 2>&1
```

#### 4. ira Persona - Competitive Child Test (Chunks 16-20)
```bash
# Final persona - tests competitive vs exploratory behavior
RESUME_SESSION=true SESSION_ID=ma_batch_[TIMESTAMP] START_CHUNK=16 PERSONA=ira TOTAL_CHUNKS=20 PUZZLES_PER_CHUNK=10 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000 > ira_persona_report.log 2>&1
```

### Report Generation & Analysis

#### Extract Individual Reports
```bash
# Extract each persona's tabular analysis
grep -B 10 -A 100 "USER PROFILE EVOLUTION" ma_persona_report.log > ma_individual_report.txt
grep -B 10 -A 100 "USER PROFILE EVOLUTION" mumu_persona_report.log > mumu_individual_report.txt
grep -B 5 -A 50 "OMI ANALYSIS COMPLETE" omi_persona_report.log > omi_individual_report.txt
grep -B 5 -A 50 "IRA ANALYSIS COMPLETE" ira_persona_report.log > ira_individual_report.txt
```

#### Create Consolidated Analysis
```bash
# Generate comprehensive cross-persona report
cat > consolidated_report.txt << 'EOF'
🎯 CROSS-PERSONA ADAPTIVE TESTING ANALYSIS
📊 20-Chunk Journey: Ma(1-5) → omi(6-10) → mumu(11-15) → ira(16-20)
=================================================================================

## MA PERSONA ANALYSIS (Chunks 1-5)
EOF

cat ma_individual_report.txt >> consolidated_report.txt

echo -e "\n## OMI PERSONA ANALYSIS (Chunks 6-10)" >> consolidated_report.txt
cat omi_individual_report.txt >> consolidated_report.txt

echo -e "\n## MUMU PERSONA ANALYSIS (Chunks 11-15)" >> consolidated_report.txt
cat mumu_individual_report.txt >> consolidated_report.txt

echo -e "\n## IRA PERSONA ANALYSIS (Chunks 16-20)" >> consolidated_report.txt
cat ira_individual_report.txt >> consolidated_report.txt
```

### Key Metrics to Analyze

#### 1. Constraint System Behavior
- **Age Violation Detection**: Check for "CONSTRAINT VIOLATIONS DETECTED" messages
- **Difficulty Adaptation**: Monitor EASY/HARD puzzle distribution changes
- **Real-time Correction**: Observe mid-session difficulty adjustments

#### 2. Performance Evolution
- **Accuracy Progression**: Track changes in success rates across personas
- **Skill Level Transitions**: Monitor engine's skill level calibration
- **Pattern Recognition**: Compare pattern preference scores

#### 3. Behavioral Adaptation Points
- **60→5 Year Transition**: Adult to child adaptation (Ma→omi)
- **5→25 Year Transition**: Child to adult progression (omi→mumu)
- **25→8 Year Transition**: Adult to competitive child (mumu→ira)

### Expected Results & Validation

#### Success Indicators
✅ **All personas complete**: Each shows "[PERSONA] ANALYSIS COMPLETE"
✅ **Session continuity**: Same session ID across all executions
✅ **Constraint enforcement**: omi shows difficulty reduction for age-appropriate content
✅ **Behavioral recognition**: ira maintains appropriate challenge level for competitive nature
✅ **Adaptive responses**: Engine adjusts puzzle types and difficulty per persona characteristics

#### Common Findings
- **omi (5y)**: Highest pattern recognition, constraint violations detected and corrected
- **ira (8y)**: Competitive performance with maintained challenge levels
- **Adults (Ma/mumu)**: Consistent performance with appropriate difficulty distribution
- **Cross-session**: Engine maintains learning state while adapting to behavioral changes

### ⚠️ Critical Execution Guidelines (Lessons Learned)

#### ✅ CORRECT Execution Pattern
**Key Finding**: The testing framework automatically processes all chunks in one execution when you specify `TOTAL_CHUNKS=X`. Individual chunk execution via `START_CHUNK` works for resume sessions only.

```bash
# ✅ CORRECT: Ma baseline (processes chunks 1-5 automatically)
PERSONA=ma TOTAL_CHUNKS=5 PUZZLES_PER_CHUNK=10 SESSION_ID=ma_batch_$(date +%s) npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000

# ✅ CORRECT: Resume sessions process chunks START_CHUNK to TOTAL_CHUNKS automatically
RESUME_SESSION=true SESSION_ID=ma_batch_1234567890 START_CHUNK=6 PERSONA=omi TOTAL_CHUNKS=10 PUZZLES_PER_CHUNK=10 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000
```

#### ❌ COMMON MISTAKES to Avoid

**1. Individual Chunk Execution Misunderstanding**
```bash
# ❌ WRONG: This won't work as expected - framework doesn't support individual chunk execution for fresh sessions
PERSONA=ma TOTAL_CHUNKS=1 PUZZLES_PER_CHUNK=10 SESSION_ID=ma_batch_$(date +%s) npm run test:personas...
RESUME_SESSION=true SESSION_ID=ma_batch_[ID] START_CHUNK=2 TOTAL_CHUNKS=2...
```

**2. Timeout Specification Errors**
```bash
# ❌ WRONG: Short timeout causes failures
--testTimeout=120000  # 2 minutes - too short, will timeout

# ✅ CORRECT: Adequate timeout for chunk processing
--testTimeout=300000  # 5 minutes - sufficient for most cases
```

**3. Missing Required Parameters**
```bash
# ❌ WRONG: Missing TOTAL_CHUNKS and PUZZLES_PER_CHUNK in resume
RESUME_SESSION=true SESSION_ID=ma_batch_1234567890 START_CHUNK=6 PERSONA=omi

# ✅ CORRECT: All parameters specified
RESUME_SESSION=true SESSION_ID=ma_batch_1234567890 START_CHUNK=6 PERSONA=omi TOTAL_CHUNKS=10 PUZZLES_PER_CHUNK=10
```

## 📊 Report Features

### Automated Tabular Reports
**Format**: Chunks as columns (1-5), metrics as rows

**📈 User Profile Evolution**:
- Chunk Accuracy progression
- Total Puzzles Solved tracking
- Overall Accuracy improvement
- Skill Level advancement

**👤 GM User Profile Evolution**:
- Current Skill Level progression
- Current Level advancement
- Skill Momentum changes
- Learning Velocity trends

**🧩 Puzzle Type Success/Total Distribution**:
- Pattern recognition performance (✅ ⚠️ ❌)
- Number series accuracy
- Serial reasoning success rates
- Algebraic reasoning performance
- All 9 puzzle types tracked

**⚖️ Difficulty Distribution**:
- Easy/Medium/Hard puzzle breakdown
- Age-appropriate constraint compliance
- Progression analysis across chunks

**🚨 Constraint System Violations**:
- Age-appropriate difficulty validation
- Hard puzzle detection for children
- Compliance reporting

### Sample Report Structure
```
🔄 **IRA'S Evolution: Chunks as Columns, Metrics as Rows**
📊 50-Puzzle Journey Analysis (5 chunks × 10 puzzles)

================================================================================
Metric | Chunk 1 | Chunk 2 | Chunk 3 | Chunk 4 | Chunk 5 | Trend
================================================================================

📈 **USER PROFILE EVOLUTION**
Chunk Accuracy | 80.0% | 90.0% | 85.0% | 95.0% | 100.0% | 📈 ↗️
Total Puzzles Solved | 10 | 20 | 30 | 40 | 50 | 📈 ↗️
Overall Accuracy | 80.0% | 85.0% | 85.0% | 87.5% | 90.0% | 📈 ↗️

👤 **GM USER PROFILE EVOLUTION**
Current Skill Level | 0.50 | 0.65 | 0.75 | 0.82 | 0.90 | 📈 ↗️
Current Level | 0 | 1 | 2 | 3 | 4 | 📈 ↗️
Skill Momentum | 0.00 | 0.15 | 0.25 | 0.32 | 0.40 | 📈 ↗️

🧩 **PUZZLE TYPE SUCCESS/TOTAL DISTRIBUTION**
pattern | 4/5✅ | 5/5✅ | 4/4✅ | 5/5✅ | 5/5✅ | →
number series | 1/2⚠️ | 2/3⚠️ | 2/3⚠️ | 3/3✅ | 3/3✅ | →
serial reasoning | 0/2❌ | 1/2⚠️ | 2/2✅ | 2/2✅ | 2/2✅ | →

🎯 **PATTERN PREFERENCE ANALYSIS**
Pattern Preference Score | 0.65 | 0.75 | 0.82 | 0.88 | 0.92 | 📈 ↗️
Pattern Success Rate | 80.0% | 100.0% | 100.0% | 100.0% | 100.0% | 📈 ↗️

⚖️ **DIFFICULTY DISTRIBUTION**
EASY | 7 (70%) | 8 (80%) | 9 (90%) | 8 (80%) | 7 (70%) | →
MEDIUM | 2 (20%) | 2 (20%) | 1 (10%) | 2 (20%) | 3 (30%) | →
HARD | 1 (10%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | →

🚨 **CONSTRAINT SYSTEM VIOLATIONS**
✅ CONSTRAINT SATISFIED: All puzzles appropriate for age group

📊 **SESSION SUMMARY**
🎯 Final Accuracy: 100.0%
🧠 Final Skill Level: 0.90
📈 Total Progression: 5 chunks completed
⏱️ Total Time: 45.2s (0.8 minutes)
🎮 Adaptation Speed: Fast
🎨 Pattern Recognition: ✅ EXCELLENT (0.92)
```

## 🗄️ Database-Powered Analytics

Advanced database analytics provide structured SQL-based analysis beyond console logs, enabling complex queries and cross-session comparisons.

### Database Overview
**Location**: `analytics/test_analytics.db` (SQLite)

**📊 Available Tables:**
- **test_sessions** - Session metadata and configuration
- **profile_snapshots** - User profile evolution per chunk
- **puzzle_analytics** - Individual puzzle performance data
- **adaptive_metrics** - Generation strategy and performance metrics
- **prediction_metrics** - Prediction accuracy tracking
- **user_classifications** - User state classifications
- **pool_selections** - Puzzle pool selection decisions
- **engine_decisions** - Adaptive engine decision tracking

### Quick Database Access

```bash
# Open database for interactive queries
sqlite3 analytics/test_analytics.db

# List all tables and view schema
.tables
.schema puzzle_analytics
```

### Essential Analytics Queries

#### Session Overview Query
```sql
-- View all recent sessions
SELECT session_id, persona, total_chunks, puzzles_per_chunk, created_at
FROM test_sessions
ORDER BY created_at DESC LIMIT 10;
```

#### Puzzle Type Distribution Analysis
```sql
-- Puzzle type performance by session
SELECT
    puzzle_type,
    COUNT(*) as total_puzzles,
    ROUND(AVG(CASE WHEN success = 1 THEN 100.0 ELSE 0.0 END), 1) as success_rate,
    ROUND(AVG(difficulty), 2) as avg_difficulty
FROM puzzle_analytics
WHERE session_id = 'your_session_id'
GROUP BY puzzle_type
ORDER BY total_puzzles DESC;
```

#### Chunk Performance Progression
```sql
-- Track performance across chunks
SELECT
    chunk_number,
    COUNT(*) as puzzles_solved,
    ROUND(AVG(CASE WHEN success = 1 THEN 100.0 ELSE 0.0 END), 1) as accuracy,
    ROUND(AVG(difficulty), 2) as avg_difficulty
FROM puzzle_analytics
WHERE session_id = 'your_session_id'
GROUP BY chunk_number
ORDER BY chunk_number;
```

#### Cross-Persona Comparison
```sql
-- Compare personas across all sessions
SELECT
    ts.persona,
    COUNT(pa.puzzle_sequence) as total_puzzles,
    ROUND(AVG(CASE WHEN pa.success = 1 THEN 100.0 ELSE 0.0 END), 1) as success_rate,
    ROUND(AVG(pa.difficulty), 2) as avg_difficulty
FROM test_sessions ts
JOIN puzzle_analytics pa ON ts.session_id = pa.session_id
GROUP BY ts.persona
ORDER BY success_rate DESC;
```

### Advanced Analysis Scripts

#### Comprehensive Session Analysis
```bash
# Generate detailed session report
SESSION_ID="your_session_id"

sqlite3 analytics/test_analytics.db << EOF
.headers on
.mode column

-- Session Metadata
SELECT '=== SESSION OVERVIEW ===' as analysis_section;
SELECT session_id, persona, total_chunks, puzzles_per_chunk, created_at, completed_at
FROM test_sessions WHERE session_id = '$SESSION_ID';

-- Puzzle Type Performance
SELECT '=== PUZZLE TYPE PERFORMANCE ===' as analysis_section;
SELECT puzzle_type, COUNT(*) as total,
       printf('%.1f%%', AVG(CASE WHEN success = 1 THEN 100.0 ELSE 0.0 END)) as success_rate,
       printf('%.2f', AVG(difficulty)) as avg_difficulty
FROM puzzle_analytics WHERE session_id = '$SESSION_ID'
GROUP BY puzzle_type ORDER BY total DESC;

-- Difficulty Distribution
SELECT '=== DIFFICULTY DISTRIBUTION ===' as analysis_section;
SELECT
    CASE
        WHEN difficulty < 0.4 THEN 'EASY'
        WHEN difficulty < 0.7 THEN 'MEDIUM'
        ELSE 'HARD'
    END as difficulty_level,
    COUNT(*) as count,
    printf('%.1f%%', COUNT(*) * 100.0 / (SELECT COUNT(*) FROM puzzle_analytics WHERE session_id = '$SESSION_ID')) as percentage
FROM puzzle_analytics WHERE session_id = '$SESSION_ID'
GROUP BY difficulty_level;
EOF
```

#### Multi-Session Comparative Analysis
```bash
# Compare recent sessions across personas
sqlite3 analytics/test_analytics.db << EOF
.headers on
.mode column
SELECT
    ts.persona,
    COUNT(DISTINCT ts.session_id) as sessions,
    COUNT(pa.puzzle_sequence) as total_puzzles,
    printf('%.1f%%', AVG(CASE WHEN pa.success = 1 THEN 100.0 ELSE 0.0 END)) as success_rate,
    printf('%.2f', AVG(pa.difficulty)) as avg_difficulty,
    printf('%.1fs', AVG(pa.response_time)) as avg_response_time
FROM test_sessions ts
LEFT JOIN puzzle_analytics pa ON ts.session_id = pa.session_id
WHERE ts.created_at > datetime('now', '-7 days')
GROUP BY ts.persona
ORDER BY success_rate DESC;
EOF
```

### Data Export & Reporting

#### CSV Export Commands
```bash
# Export session puzzle data
SESSION_ID="your_session_id"
sqlite3 -header -csv analytics/test_analytics.db \
    "SELECT chunk_number, puzzle_type, difficulty, success, response_time
     FROM puzzle_analytics WHERE session_id = '$SESSION_ID'
     ORDER BY chunk_number, puzzle_sequence" \
    > session_${SESSION_ID}_data.csv

# Export all sessions summary
sqlite3 -header -csv analytics/test_analytics.db \
    "SELECT session_id, persona, total_chunks, created_at, completed_at
     FROM test_sessions ORDER BY created_at DESC" \
    > all_sessions_summary.csv
```

#### Generate Formatted Reports
```bash
# Create comprehensive analysis report
SESSION_ID="your_session_id"
sqlite3 analytics/test_analytics.db << EOF > database_report_${SESSION_ID}.txt
.headers on
.mode column
.width 15 8 12 12

SELECT '📊 SESSION: $SESSION_ID' as report_header;
SELECT session_id, persona, total_chunks, created_at FROM test_sessions WHERE session_id = '$SESSION_ID';

SELECT '🧩 PUZZLE TYPE BREAKDOWN' as report_section;
SELECT puzzle_type, COUNT(*) as count,
       printf('%.1f%%', AVG(CASE WHEN success = 1 THEN 100.0 ELSE 0.0 END)) as success_rate
FROM puzzle_analytics WHERE session_id = '$SESSION_ID'
GROUP BY puzzle_type ORDER BY count DESC;

SELECT '📈 CHUNK PROGRESSION' as report_section;
SELECT chunk_number, COUNT(*) as puzzles,
       printf('%.1f%%', AVG(CASE WHEN success = 1 THEN 100.0 ELSE 0.0 END)) as accuracy
FROM puzzle_analytics WHERE session_id = '$SESSION_ID'
GROUP BY chunk_number ORDER BY chunk_number;
EOF
```

### Database vs Log Analysis

| Method | Database Analytics | Log-Based Analysis |
|--------|-------------------|-------------------|
| **💪 Strengths** | Structured queries, cross-session analysis, fast indexing | Real-time monitoring, simple validation, quick grep |
| **⚙️ Use Cases** | Complex analysis, historical trends, data export | Live debugging, test validation, immediate feedback |
| **🎯 Best For** | Detailed puzzle analysis, persona comparisons | Quick checks, monitoring test execution |

### Database Maintenance

#### Cleanup Commands
```bash
# Remove sessions older than 30 days
sqlite3 analytics/test_analytics.db << EOF
DELETE FROM puzzle_analytics WHERE session_id IN (
    SELECT session_id FROM test_sessions
    WHERE created_at < datetime('now', '-30 days')
);
DELETE FROM test_sessions WHERE created_at < datetime('now', '-30 days');
VACUUM;
EOF
```

#### Database Statistics
```bash
# View database statistics
sqlite3 analytics/test_analytics.db << EOF
SELECT 'Sessions: ' || COUNT(*) FROM test_sessions;
SELECT 'Puzzle Records: ' || COUNT(*) FROM puzzle_analytics;
SELECT 'Profile Snapshots: ' || COUNT(*) FROM profile_snapshots;
EOF
```

## ⏱️ Execution Time Estimates

| Test Type | Puzzles | Estimated Time | Memory Usage | Recommended Use |
|-----------|---------|----------------|--------------|-----------------|
| **Single Persona (Quick)** | 50 (5×10) | 3-5 minutes | 4GB | Development testing |
| **Single Persona (Custom)** | 80 (10×8) | 5-8 minutes | 4GB | Thorough analysis |
| **Multiple Personas (Sequential)** | 200 (4×50) | 12-20 minutes | 4GB | Comparative studies |
| **Multiple Personas (Parallel)** | 200 (4×50) | 6-10 minutes | 8GB+ | Production validation |

## 🎯 Step-by-Step Execution Guide

### Single Persona Testing
```bash
# Step 1: Choose your persona and run test
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# Step 2: Monitor execution progress
# - Watch for "📦 Processing Chunk X" messages
# - Each chunk processes 10 puzzles with real-time analysis
# - Engine adaptation occurs between chunks

# Step 3: Review comprehensive tabular report
# - Report appears at end of execution
# - Look for "🔄 **[PERSONA]'S Evolution: Chunks as Columns, Metrics as Rows**"
# - Contains complete 50-puzzle analysis
```

### Multiple Persona Comparative Testing
```bash
# Method 1: Automated batch execution
npm run personas:run-batch

# Method 2: Manual sequential testing for fine control
for persona in ira omi mumu ma; do
  echo "📊 Testing persona: $persona"
  PRESET=quick PERSONA=$persona npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
  echo "✅ $persona completed, starting next..."
  sleep 5
done

# Method 3: Parallel execution (advanced users)
# Open 4 terminal windows and run simultaneously:
# Terminal 1: PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
# Terminal 2: PRESET=quick PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
# etc.
```

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Core settings
PRESET=quick                    # Use predefined configuration (quick|standard|comprehensive)
PERSONA=ira                     # Target persona (ira|omi|mumu|ma)
TOTAL_CHUNKS=5                  # Number of chunks to run
PUZZLES_PER_CHUNK=10           # Puzzles per chunk
SESSION_ID=my_custom_session   # Custom session identifier

# Advanced settings
AUTO_CHUNK_SIZE=true           # Automatically optimize chunk sizes
BATCH_ID=comparative_study     # Group multiple tests together
SAVE_RESULTS=true              # Save results to files (default: true)

# Example: Custom configuration
PERSONA=ma TOTAL_CHUNKS=8 PUZZLES_PER_CHUNK=12 SESSION_ID=ma_extended_test npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=800000
```

### Preset Configurations
```bash
# Quick preset: 5 chunks × 10 puzzles = 50 total (3-5 minutes)
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# Standard preset: 10 chunks × 10 puzzles = 100 total (8-12 minutes)
PRESET=standard PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=1200000

# Comprehensive preset: 50 chunks × 8 puzzles = 400 total (25-35 minutes)
PRESET=comprehensive PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=2400000
```

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

**❌ Issue 1: Test Timeout Errors**
```bash
# Problem: Default Jest timeout too short for 50 puzzles
# Symptoms: "Test timeout after 120000ms"

# ✅ Solution: Use adequate timeout
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# For custom tests, calculate timeout: chunks × puzzles × 2 seconds × 1000
# Example: 10 chunks × 10 puzzles = 200 seconds = 200000ms timeout needed
```

**❌ Issue 2: Memory Errors**
```bash
# Problem: "JavaScript heap out of memory"
# Symptoms: Process crashes during execution

# ✅ Solution: Already configured in package.json with --max-old-space-size=4096
# No action needed - memory is pre-allocated appropriately
```

**❌ Issue 3: Environment Variables Not Working**
```bash
# ❌ WRONG - May not work on some systems
PRESET=quick PERSONA=ira npm run test:personas

# ✅ CORRECT - Use explicit env prefix
env PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# Alternative: Export variables first
export PRESET=quick
export PERSONA=ira
npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
```

**❌ Issue 4: Missing Tabular Report**
```bash
# Problem: Report doesn't appear in output
# Cause: Test may have failed before report generation

# ✅ Solutions:
# 1. Save output to file and search for report
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 > persona_test.log 2>&1

# 2. Search for report markers
grep -A 100 "🔄.*Evolution.*Chunks as Columns" persona_test.log

# 3. Check for test completion
grep "🎉.*ANALYSIS COMPLETE" persona_test.log
```

**❌ Issue 5: Invalid Persona Name**
```bash
# Problem: "Persona 'xyz' not found"
# ✅ Solution: Use only valid persona names
# Valid: ira, omi, mumu, ma (lowercase only)

# Check available personas
grep -A 10 "Available Personas" PERSONA_TESTING.md
```

**❌ Issue 6: Parallel Testing Conflicts**
```bash
# Problem: Multiple tests interfere with each other
# ✅ Solution: Use unique session IDs for parallel tests

# Sequential (recommended)
for persona in ira omi mumu ma; do
  PRESET=quick PERSONA=$persona SESSION_ID=${persona}_$(date +%s) npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000
done

# Parallel with unique IDs
PRESET=quick PERSONA=ira SESSION_ID=ira_parallel_1 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 &
PRESET=quick PERSONA=omi SESSION_ID=omi_parallel_1 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 &
```

### Performance Optimization

**For Faster Execution:**
```bash
# Reduce puzzles for quick testing
PERSONA=ira TOTAL_CHUNKS=3 PUZZLES_PER_CHUNK=5 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000

# Use standard memory allocation (default)
node --max-old-space-size=4096 npm run test:personas

# Enable auto chunk sizing for large tests
AUTO_CHUNK_SIZE=true PRESET=comprehensive PERSONA=ma npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=2400000
```

**For Comprehensive Analysis:**
```bash
# Maximum detail testing
PRESET=comprehensive PERSONA=ma npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=2400000

# Custom extensive testing
PERSONA=ira TOTAL_CHUNKS=20 PUZZLES_PER_CHUNK=10 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=3600000
```

### Debug Mode
```bash
# Run with verbose Jest output
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 --verbose

# Monitor real-time progress with timestamps
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 2>&1 | ts '[%Y-%m-%d %H:%M:%S]'
```

## 📊 Expected Results & Data Validation

### Report Structure
The comprehensive tabular report includes these sections in order:
1. **📈 User Profile Evolution** - Core adaptive metrics per chunk
2. **👤 GM User Profile Evolution** - Lifetime progression metrics with trends
3. **🧩 Puzzle Type Success/Total Distribution** - Performance by puzzle type
4. **⚖️ Difficulty Distribution** - Easy/medium/hard puzzle breakdown
5. **🎯 Pattern Preference Analysis** - Visual learner detection
6. **🚨 Constraint System Violations** - Age-appropriate difficulty compliance
7. **📊 Session Summary** - Final statistics and recommendations

### Expected Data Progression
**For persona tests** (fresh user profile - storage automatically cleared):

| Metric | Chunk 1 | Chunk 2 | Chunk 3 | Chunk 4 | Chunk 5 | Pattern |
|--------|---------|---------|---------|---------|---------|---------|
| `totalPuzzlesSolved` | 10 | 20 | 30 | 40 | 50 | ↗️ Linear |
| `overallAccuracy` | 70% | 75% | 80% | 82% | 85% | ↗️ Improving |
| `currentLevel` | 1 | 2 | 3 | 4 | 5 | ↗️ Progressive |
| `skillMomentum` | 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | ↗️ Building |

### Success Indicators
✅ **Test completed successfully if you see:**
- All 5 chunks processed (📦 Processing Chunk 1-5)
- Tabular report generated (🔄 **[PERSONA]'S Evolution**)
- Final analysis summary (🎉 [PERSONA] ANALYSIS COMPLETE)
- No Jest timeout errors
- Clean session completion

### Validation Checklist
```bash
# 1. Verify all chunks completed
grep "📦 Processing Chunk" persona_test.log | wc -l
# Should show: 5

# 2. Check tabular report presence
grep -c "🔄.*Evolution.*Chunks as Columns" persona_test.log
# Should show: 1

# 3. Validate final summary
grep "🎉.*ANALYSIS COMPLETE" persona_test.log
# Should show completion message

# 4. Check for any errors
grep -i "error\|failed\|timeout" persona_test.log
# Should show minimal or no critical errors
```

---

## 🎯 Quick Reference Commands

```bash
# Single persona (50 puzzles, ~5 minutes)
PRESET=quick PERSONA=ira npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000

# All personas sequential (~25 minutes)
npm run personas:run-batch

# Custom configuration
PERSONA=ma TOTAL_CHUNKS=8 PUZZLES_PER_CHUNK=12 npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=800000

# Debug mode with verbose output
PRESET=quick PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=600000 --verbose

# Extract report from saved output
grep -A 100 "🔄.*Evolution.*Chunks as Columns" persona_test.log
```