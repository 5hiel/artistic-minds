#!/usr/bin/env node
/**
 * Simulation Results Analyzer
 * Provides detailed analysis of persona simulation results
 */

const fs = require('fs');
const path = require('path');

function findResultsFiles() {
  const resultsDir = path.join(__dirname, '../__tests__/personas');
  const files = fs.readdirSync(resultsDir)
    .filter(file => file.endsWith('-results.json'))
    .map(file => ({
      name: file,
      path: path.join(resultsDir, file),
      modified: fs.statSync(path.join(resultsDir, file)).mtime
    }))
    .sort((a, b) => b.modified - a.modified);

  return files;
}

function analyzeResults(resultsFile) {
  try {
    const data = JSON.parse(fs.readFileSync(resultsFile.path, 'utf8'));

    console.log(`\n📊 ANALYZING: ${resultsFile.name}`);
    console.log(`🕐 Generated: ${data.timestamp || 'Unknown'}`);
    console.log(`📋 Test: ${data.testName || 'Unknown Test'}`);

    if (data.configuration) {
      console.log(`\n⚙️  CONFIGURATION`);
      console.log(`   Runs: ${data.configuration.numRuns || 'N/A'}`);
      console.log(`   Batch Size: ${data.configuration.batchSize || 'N/A'}`);
      console.log(`   Puzzles/Run: ${data.configuration.puzzlesPerRun || 'N/A'}`);
    }

    if (data.performance) {
      console.log(`\n⚡ PERFORMANCE`);
      console.log(`   Total Time: ${data.performance.totalTime?.toFixed(2) || 'N/A'}s`);
      console.log(`   Throughput: ${data.performance.throughput?.toFixed(1) || 'N/A'} runs/sec`);
      console.log(`   Success Rate: ${data.performance.successRate?.toFixed(1) || 'N/A'}%`);
      console.log(`   Time/Run: ${data.performance.timePerRun?.toFixed(0) || 'N/A'}ms`);
    }

    if (data.statistics) {
      console.log(`\n📈 SIMULATION RESULTS`);

      ['easy', 'hard', 'pattern'].forEach(metric => {
        const stats = data.statistics[metric];
        if (stats) {
          const improvement = stats.improved ? '✅ IMPROVED' : '❌ NO IMPROVEMENT';
          const change = metric === 'hard' ?
            `(${((stats.baseline - stats.mean) / stats.baseline * 100).toFixed(1)}% reduction)` :
            `(${((stats.mean - stats.baseline) / stats.baseline * 100).toFixed(1)}% increase)`;

          console.log(`   ${metric.toUpperCase()}: ${stats.mean?.toFixed(1)}% ± ${stats.std?.toFixed(1)} ${improvement} ${change}`);
          console.log(`         Range: ${stats.min?.toFixed(1)}%-${stats.max?.toFixed(1)}%, Baseline: ${stats.baseline}%`);
        }
      });
    }

    if (data.percentages) {
      // Legacy format support
      console.log(`\n📈 SIMULATION RESULTS (Legacy Format)`);
      console.log(`   EASY: ${data.percentages.easy}% (baseline: 8.5%) - ${data.percentages.easy > 8.5 ? '✅ IMPROVED' : '❌ NO IMPROVEMENT'}`);
      console.log(`   HARD: ${data.percentages.hard}% (baseline: 60.6%) - ${data.percentages.hard < 60.6 ? '✅ IMPROVED' : '❌ NO IMPROVEMENT'}`);
      console.log(`   PATTERN: ${data.percentages.pattern}% (baseline: 28.2%) - ${data.percentages.pattern > 28.2 ? '✅ IMPROVED' : '❌ NO IMPROVEMENT'}`);
    }

    if (data.diagnostics) {
      console.log(`\n🔬 DIAGNOSTIC DATA`);
      console.log(`   Sessions: ${data.diagnostics.totalSessions || 'N/A'}`);
      console.log(`   Puzzle Events: ${data.diagnostics.totalPuzzles || 'N/A'}`);
      console.log(`   State Snapshots: ${data.diagnostics.totalStates || 'N/A'}`);
    }

    if (data.rawSample && data.rawSample.length > 0) {
      console.log(`\n📋 SAMPLE DATA (First 3 runs)`);
      data.rawSample.slice(0, 3).forEach((run, index) => {
        console.log(`   Run ${index + 1}: Easy=${run.easy?.toFixed(0)}%, Hard=${run.hard?.toFixed(0)}%, Pattern=${run.pattern?.toFixed(0)}%, Total=${run.total}`);
      });
    }

    return data;

  } catch (error) {
    console.error(`❌ Error analyzing ${resultsFile.name}:`, error.message);
    return null;
  }
}

function compareResults(results) {
  if (results.length < 2) {
    console.log(`\n📊 COMPARISON: Need at least 2 results files for comparison`);
    return;
  }

  console.log(`\n📊 COMPARISON: Latest vs Previous`);
  const latest = results[0];
  const previous = results[1];

  if (latest.statistics && previous.statistics) {
    ['easy', 'hard', 'pattern'].forEach(metric => {
      const latestStats = latest.statistics[metric];
      const previousStats = previous.statistics[metric];

      if (latestStats && previousStats) {
        const change = latestStats.mean - previousStats.mean;
        const changeStr = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
        const trend = Math.abs(change) < 0.5 ? '➡️' : (change > 0 ? '📈' : '📉');
        console.log(`   ${metric.toUpperCase()}: ${latestStats.mean.toFixed(1)}% vs ${previousStats.mean.toFixed(1)}% ${trend} ${changeStr}`);
      }
    });
  }

  if (latest.performance && previous.performance) {
    const throughputChange = latest.performance.throughput - previous.performance.throughput;
    const throughputStr = throughputChange > 0 ? `+${throughputChange.toFixed(1)}` : `${throughputChange.toFixed(1)}`;
    console.log(`   THROUGHPUT: ${latest.performance.throughput.toFixed(1)} vs ${previous.performance.throughput.toFixed(1)} runs/sec (${throughputStr})`);
  }
}

function main() {
  console.log('🎯 SIMULATION RESULTS ANALYZER');
  console.log('===============================');

  const resultsFiles = findResultsFiles();

  if (resultsFiles.length === 0) {
    console.log('❌ No results files found in __tests__/personas/');
    console.log('💡 Run a simulation test first to generate results');
    return;
  }

  console.log(`\n📁 Found ${resultsFiles.length} results file(s):`);
  resultsFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.name} (${file.modified.toISOString()})`);
  });

  // Analyze all results files
  const analyzedResults = resultsFiles.map(analyzeResults).filter(Boolean);

  // Compare latest results
  if (analyzedResults.length > 1) {
    compareResults(analyzedResults);
  }

  console.log(`\n🎯 SUMMARY`);
  console.log('==========');

  if (analyzedResults.length > 0) {
    const latest = analyzedResults[0];
    if (latest.statistics) {
      const improvements = ['easy', 'hard', 'pattern'].filter(metric =>
        latest.statistics[metric]?.improved
      );
      console.log(`✅ Improvements achieved: ${improvements.length}/3 metrics`);
      console.log(`📊 Best performing: ${improvements.join(', ')}`);

      if (latest.performance) {
        console.log(`⚡ Peak throughput: ${latest.performance.throughput?.toFixed(1)} runs/sec`);
      }
    }
  }

  console.log(`\n💡 To view detailed results: cat __tests__/personas/async-500-run-results.json`);
  console.log(`💡 To run new simulation: NUM_RUNS=500 npm run test:personas -- --testNamePattern="Async Diagnostic"`);
}

if (require.main === module) {
  main();
}