#!/usr/bin/env node

/**
 * Aggregate Persona Results Script
 * Combines individual persona results into comparative analysis
 *
 * Usage: node aggregate-persona-results.js [BATCH_ID]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RESULTS_DIR = path.join(__dirname, '../__tests__/results/batch-persona-analysis');
const PERSONAS = ['ma', 'omi', 'mumu', 'ira'];

// Get batch ID from command line or use latest
const batchId = process.argv[2];

if (!batchId) {
  console.error('❌ Error: BATCH_ID required');
  console.error('Usage: node aggregate-persona-results.js [BATCH_ID]');
  process.exit(1);
}

console.log(`📊 Aggregating results for batch: ${batchId}`);
console.log(`📂 Results directory: ${RESULTS_DIR}`);

// Load individual persona results
const personaResults = {};
let loadedPersonas = 0;

for (const persona of PERSONAS) {
  const filename = path.join(RESULTS_DIR, `${batchId}_${persona}.json`);

  if (fs.existsSync(filename)) {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      personaResults[persona] = JSON.parse(data);
      loadedPersonas++;
      console.log(`✅ Loaded ${persona} results`);
    } catch (error) {
      console.error(`❌ Error loading ${persona}: ${error.message}`);
    }
  } else {
    console.warn(`⚠️  ${persona} results not found: ${filename}`);
  }
}

if (loadedPersonas === 0) {
  console.error('❌ No persona results found');
  process.exit(1);
}

console.log(`📈 Loaded ${loadedPersonas}/${PERSONAS.length} personas`);

// Generate comparative analysis
const generateComparativeAnalysis = () => {
  console.log(`\n# 🔄 **Comparative Persona Adaptation Analysis - Batch ${batchId}**\n`);

  // Adaptation Speed Comparison
  console.log(`## **⚡ Adaptation Speed Comparison**\n`);
  console.log(`| Persona | First Detection | High Confidence | Convergence | Speed Rating | Final Accuracy |`);
  console.log(`|---------|-----------------|-----------------|-------------|--------------|----------------|`);

  const adaptationData = [];

  Object.entries(personaResults).forEach(([persona, data]) => {
    const firstDetection = data.adaptationMetrics.firstDetectionChunk || 'N/A';
    const highConfidence = data.adaptationMetrics.highConfidenceChunk || 'N/A';
    const convergence = data.adaptationMetrics.convergenceChunk || 'N/A';
    const speedIcon = data.adaptationSpeed === 'fast' ? '🚀' : data.adaptationSpeed === 'medium' ? '🚶' : '🐌';
    const finalAccuracy = (data.finalAccuracy * 100).toFixed(1);

    console.log(`| **${data.persona}** | Chunk ${firstDetection} | Chunk ${highConfidence} | Chunk ${convergence} | ${speedIcon} ${data.adaptationSpeed} | ${finalAccuracy}% |`);

    adaptationData.push({
      persona: data.persona,
      firstDetection: firstDetection === 'N/A' ? 999 : firstDetection,
      highConfidence: highConfidence === 'N/A' ? 999 : highConfidence,
      convergence: convergence === 'N/A' ? 999 : convergence,
      adaptationSpeed: data.adaptationSpeed,
      finalAccuracy: data.finalAccuracy
    });
  });

  // Pattern Recognition Analysis
  console.log(`\n## **🧠 Pattern Recognition Analysis**\n`);
  console.log(`| Persona | Expected Pattern | Key Detected Patterns | Adaptation Points | Success Rate |`);
  console.log(`|---------|------------------|----------------------|-------------------|--------------|`);

  Object.entries(personaResults).forEach(([persona, data]) => {
    const expectedPattern = data.expectedPattern.substring(0, 60) + (data.expectedPattern.length > 60 ? '...' : '');
    const detectedPatterns = data.adaptationPoints.slice(0, 2).map(p => p.detectedPattern.split(';')[0]).join('; ');
    const adaptationCount = data.adaptationMetrics.totalAdaptationPoints;
    const successIcon = data.finalAccuracy >= 0.7 ? '✅' : data.finalAccuracy >= 0.5 ? '⚠️' : '❌';
    const finalAccuracy = (data.finalAccuracy * 100).toFixed(1);

    console.log(`| **${data.persona}** | ${expectedPattern} | ${detectedPatterns || 'No clear patterns'} | ${adaptationCount} | ${finalAccuracy}% ${successIcon} |`);
  });

  // Puzzle Type Preferences
  console.log(`\n## **🧩 Puzzle Type Preferences**\n`);
  console.log(`| Persona | Top 3 Preferred Types | Type Variety | Total Puzzles |`);
  console.log(`|---------|----------------------|---------------|---------------|`);

  Object.entries(personaResults).forEach(([persona, data]) => {
    const topTypes = data.puzzleDistribution.topPreferredTypes.slice(0, 3).join(', ');
    const varietyCount = Object.keys(data.puzzleDistribution.typesSeen).length;
    const totalPuzzles = Object.values(data.puzzleDistribution.typesSeen).reduce((sum, count) => sum + count, 0);

    console.log(`| **${data.persona}** | ${topTypes} | ${varietyCount} types | ${totalPuzzles} puzzles |`);
  });

  // Convergence Analysis
  console.log(`\n## **🎯 Convergence Analysis**\n`);
  Object.entries(personaResults).forEach(([persona, data]) => {
    if (data.convergencePoint) {
      console.log(`**${data.persona}**: ${data.convergencePoint.description} (Chunk ${data.convergencePoint.chunkNumber})`);
    } else {
      console.log(`**${data.persona}**: No clear convergence detected within 10 chunks`);
    }
  });

  // Performance Rankings
  console.log(`\n## **🏆 Performance Rankings**\n`);

  // Sort by adaptation speed (first detection)
  const sortedBySpeed = [...adaptationData].sort((a, b) => a.firstDetection - b.firstDetection);
  const sortedByAccuracy = [...adaptationData].sort((a, b) => b.finalAccuracy - a.finalAccuracy);

  console.log(`**🚀 Fastest Adaptation:**`);
  sortedBySpeed.slice(0, 2).forEach((item, index) => {
    console.log(`${index + 1}. **${item.persona}** - First detection at chunk ${item.firstDetection === 999 ? 'N/A' : item.firstDetection}`);
  });

  console.log(`\n**🎯 Best Final Performance:**`);
  sortedByAccuracy.slice(0, 2).forEach((item, index) => {
    console.log(`${index + 1}. **${item.persona}** - ${(item.finalAccuracy * 100).toFixed(1)}% accuracy`);
  });

  // Execution Summary
  console.log(`\n## **📊 Execution Summary**\n`);

  const totalTime = Object.values(personaResults).reduce((sum, data) => sum + data.totalTimeMs, 0);
  const totalPuzzles = Object.values(personaResults).reduce((sum, data) => {
    return sum + Object.values(data.puzzleDistribution.typesSeen).reduce((pSum, count) => pSum + count, 0);
  }, 0);

  const avgAccuracy = Object.values(personaResults).reduce((sum, data) => sum + data.finalAccuracy, 0) / loadedPersonas;

  console.log(`- **Total Execution Time**: ${(totalTime / 1000).toFixed(2)}s (${(totalTime / 60000).toFixed(1)}m)`);
  console.log(`- **Total Puzzles Generated**: ${totalPuzzles}`);
  console.log(`- **Average Final Accuracy**: ${(avgAccuracy * 100).toFixed(1)}%`);
  console.log(`- **Personas Successfully Analyzed**: ${loadedPersonas}/${PERSONAS.length}`);
  console.log(`- **Batch ID**: ${batchId}`);

  // Adaptation Insights
  console.log(`\n## **🔍 Key Adaptation Insights**\n`);

  const fastAdapters = adaptationData.filter(p => p.adaptationSpeed === 'fast').map(p => p.persona);
  const slowAdapters = adaptationData.filter(p => p.adaptationSpeed === 'slow').map(p => p.persona);
  const highPerformers = adaptationData.filter(p => p.finalAccuracy >= 0.8).map(p => p.persona);

  if (fastAdapters.length > 0) {
    console.log(`- **Fast Adaptation**: ${fastAdapters.join(', ')} showed clear behavioral patterns within 2-4 chunks`);
  }

  if (slowAdapters.length > 0) {
    console.log(`- **Challenging Cases**: ${slowAdapters.join(', ')} required more time for pattern recognition`);
  }

  if (highPerformers.length > 0) {
    console.log(`- **High Performance**: ${highPerformers.join(', ')} achieved >80% accuracy with proper adaptation`);
  }

  console.log(`- **Engine Effectiveness**: Successfully adapted to ${loadedPersonas} distinct behavioral patterns`);
  console.log(`- **Pattern Diversity**: Engine handled age ranges from 5-year-old to 60-year-old users`);
};

// Save aggregated results
const saveAggregatedResults = () => {
  const aggregatedData = {
    batchId,
    timestamp: new Date().toISOString(),
    personaCount: loadedPersonas,
    totalPersonas: PERSONAS.length,
    personas: personaResults,
    summary: {
      totalTime: Object.values(personaResults).reduce((sum, data) => sum + data.totalTimeMs, 0),
      totalPuzzles: Object.values(personaResults).reduce((sum, data) => {
        return sum + Object.values(data.puzzleDistribution.typesSeen).reduce((pSum, count) => pSum + count, 0);
      }, 0),
      avgAccuracy: Object.values(personaResults).reduce((sum, data) => sum + data.finalAccuracy, 0) / loadedPersonas,
      successfulPersonas: loadedPersonas
    }
  };

  const outputFile = path.join(RESULTS_DIR, `${batchId}_aggregated.json`);
  fs.writeFileSync(outputFile, JSON.stringify(aggregatedData, null, 2));
  console.log(`\n💾 Aggregated results saved to: ${outputFile}`);
};

// Main execution
try {
  generateComparativeAnalysis();
  saveAggregatedResults();

  console.log(`\n✅ Results aggregation completed successfully!`);
  console.log(`📁 Individual results available in: ${RESULTS_DIR}`);
  console.log(`📊 Aggregated analysis saved as: ${batchId}_aggregated.json`);

} catch (error) {
  console.error(`❌ Error during aggregation: ${error.message}`);
  process.exit(1);
}