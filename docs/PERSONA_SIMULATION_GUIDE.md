# Persona Simulation Testing Guide

## Overview

This guide documents how to run and analyze persona simulations for the adaptive learning engine, specifically for testing difficulty constraints and puzzle distribution for different user types (like 5-year-old Omi).

## Quick Start Commands

### Running Complete 50-Puzzle Simulation

```bash
# Run full 50-puzzle simulation (5 chunks × 10 puzzles)
PRESET=quick PERSONA=omi SESSION_ID=omi_test_$(date +%s) npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000
```

### Manual Chunk-by-Chunk Execution (Recommended)

When automatic execution fails to save all chunks, run manually:

```bash
# Initial run (chunk 1)
PRESET=quick PERSONA=omi SESSION_ID=omi_fresh_test npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=300000

# Resume subsequent chunks
RESUME_SESSION=true SESSION_ID=omi_fresh_test START_CHUNK=2 PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=120000
RESUME_SESSION=true SESSION_ID=omi_fresh_test START_CHUNK=3 PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=120000
RESUME_SESSION=true SESSION_ID=omi_fresh_test START_CHUNK=4 PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=120000
RESUME_SESSION=true SESSION_ID=omi_fresh_test START_CHUNK=5 PERSONA=omi npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=120000
```

## Available Configuration Options

### Presets
- `quick`: 5 chunks × 10 puzzles = 50 total
- `standard`: 10 chunks × 10 puzzles = 100 total
- `comprehensive`: 50 chunks × 8 puzzles = 400 total

### Personas
- `omi`: 5-year-old with strong pattern recognition (maxDifficulty: 0.4)
- `alex`: 8-year-old math enthusiast (maxDifficulty: 0.7)
- `ira`: 8-year-old competitive child with strong pattern skills (maxDifficulty: 0.5)
- `mumu`: Adult female who excels but avoids hard puzzles (maxDifficulty: 0.6)
- `ma`: 60-year-old senior who prefers challenging puzzles (maxDifficulty: 1.0)

### Environment Variables
```bash
PRESET=quick                    # Use predefined configuration
PERSONA=omi                     # Select persona
SESSION_ID=unique_session_name  # Custom session identifier
TOTAL_CHUNKS=5                  # Override chunk count
PUZZLES_PER_CHUNK=10           # Override puzzles per chunk
RESUME_SESSION=true            # Continue existing session
START_CHUNK=2                  # Resume from specific chunk
```

## Result Files Location

All results are saved to: `/tmp/test-sessions/{SESSION_ID}/`

### File Structure
```
/tmp/test-sessions/omi_fresh_test/
├── chunk-1-results.json      # Individual chunk results
├── chunk-2-results.json
├── chunk-3-results.json
├── chunk-4-results.json
├── chunk-5-results.json
├── session-config.json       # Session configuration
└── aggregated-results.json   # Complete analysis (generated after all chunks)
```

## Analyzing Results

### 1. Quick Overview
```bash
# Check session status
cat /tmp/test-sessions/{SESSION_ID}/session-config.json | grep -E "(lastChunkCompleted|chunksRemaining)"

# List available result files
ls -la /tmp/test-sessions/{SESSION_ID}/
```

### 2. Comprehensive Analysis

Read the `aggregated-results.json` file for complete statistics:

```bash
# View aggregated results
cat /tmp/test-sessions/{SESSION_ID}/aggregated-results.json
```

### Key Metrics to Analyze

#### Overall Distribution
- **Difficulty Distribution**: Easy/Medium/Hard percentages
- **Type Distribution**: Pattern/Number-series/Serial-reasoning etc.
- **Success Rates**: By difficulty and type

#### Constraint System Effectiveness
- **Hard Puzzle Count**: Should be 0 for young users like Omi
- **Constraint Warnings**: Look for `⚠️ [IntelligentPuzzleEngine] No puzzles available within difficulty constraint`
- **Fallback Usage**: Check if system fell back to unconstrained selection

#### Per-Chunk Analysis
```json
{
  "difficultyDistribution": {
    "easy": 7,
    "medium": 1,
    "hard": 2    // ❌ Should be 0 for 5-year-old
  }
}
```

## Troubleshooting

### Common Issues

1. **Only Chunk 1 Results Saved**
   - **Cause**: Automatic execution only processes first chunk
   - **Solution**: Use manual chunk-by-chunk execution

2. **Hard Puzzles Still Appearing**
   - **Check**: Constraint warnings in console output
   - **Analysis**: System detects constraints but fallback bypasses them
   - **Look for**: `proceeding with normal selection` messages

3. **Timeout Errors**
   - **Solution**: Increase timeout: `--testTimeout=300000`
   - **Alternative**: Run smaller chunks

### Debugging Constraint System

Look for these console messages:
```
⚠️ [IntelligentPuzzleEngine] No puzzles available within difficulty constraint (≤ 0.4)
⚠️ [IntelligentPuzzleEngine] Could not find easy numberSeries puzzle after 20 attempts
```

These indicate the constraint system is working but falling back to unrestricted selection.

## Expected Results for 5-Year-Old (Omi)

### Ideal Distribution
- **Easy**: 80-100% (age-appropriate)
- **Medium**: 0-20% (acceptable)
- **Hard**: 0% (should never appear)

### Current Status (After Fixes)
- **Easy**: 52% ✅
- **Medium**: 26% ⚠️
- **Hard**: 22% ❌ (significant improvement from ~50% but still problematic)

### Success Rates by Type
- **Pattern**: 84.6% ✅ (well-suited for age)
- **Number-series**: 20% ❌ (too difficult)
- **Serial-reasoning**: 50% ⚠️ (marginal)

## Advanced Analysis

### Checking User Classification
```bash
# View user profile to check classification
cat /tmp/test-sessions/{SESSION_ID}/session-config.json | grep -E "(totalPuzzlesSolved|puzzleCountThreshold)"
```

- If `totalPuzzlesSolved` > `puzzleCountThreshold`, user is "experienced"
- Current threshold: 10 (updated from 5)
- Omi has 30 puzzles solved → classified as "experienced user"

### Monitoring Adaptive Engine Behavior
```bash
# Follow real-time console output during test
PRESET=quick PERSONA=omi SESSION_ID=live_test npm run test:personas -- --testNamePattern="Enhanced configurable" 2>&1 | grep -E "(constraint|difficulty|fallback)"
```

## Implementation Notes

### Recent Fixes Applied
1. **puzzleCountThreshold**: Updated from 5 to 10
2. **Test Configuration**: Removed problematic 0.7 modifier
3. **Game Defaults**: Using engine defaults instead of test overrides
4. **Pattern Puzzles**: All set to 'easy' difficulty (working correctly)

### Remaining Issues
1. **Fallback Mechanism**: Bypasses constraints when no appropriate puzzles found
2. **New Puzzle Types**: Algebraic-reasoning, number-grid lack age-appropriate variants
3. **User Classification**: May need persona-specific overrides for testing

## Running Performance Tests

### High-Volume Testing
```bash
# Multiple iterations for statistical analysis
for i in {1..5}; do
  PRESET=quick PERSONA=omi SESSION_ID=omi_batch_$i npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=180000
done
```

### Cross-Persona Comparison
```bash
# Test all personas for comparison
PRESET=quick PERSONA=omi SESSION_ID=omi_comparison npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=180000
PRESET=quick PERSONA=alex SESSION_ID=alex_comparison npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=180000
PRESET=quick PERSONA=ira SESSION_ID=ira_comparison npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=180000
PRESET=quick PERSONA=mumu SESSION_ID=mumu_comparison npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=180000
PRESET=quick PERSONA=ma SESSION_ID=ma_comparison npm run test:personas -- --testNamePattern="Enhanced configurable" --testTimeout=180000
```

This guide provides a complete reference for running and analyzing persona simulations to validate the adaptive learning engine's constraint system and age-appropriate puzzle distribution.