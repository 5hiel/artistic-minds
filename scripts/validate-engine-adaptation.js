#!/usr/bin/env node

/**
 * Script to validate that the adaptive engine is generating different puzzle types
 * for different personas and adapting properly to all enabled puzzle types.
 */

const { intelligentPuzzleEngine } = require('../lib/adaptiveEngine');
const { getEnabledPuzzleTypes, getPuzzleConfigSummary } = require('../constants/puzzleConfig');

async function validateEngineAdaptation() {
  console.log('🔍 Validating Adaptive Engine Puzzle Distribution...\n');

  // Show current configuration
  const configSummary = getPuzzleConfigSummary();
  console.log('📋 Current Puzzle Configuration:');
  console.log(`  Enabled Types: ${configSummary.enabled.join(', ')}`);
  console.log(`  Total Enabled: ${configSummary.enabledCount}/${configSummary.totalCount}`);
  console.log('');

  // Test personas: simulate different user profiles
  const personas = [
    { name: 'Ira (8y)', skill: 0.3, age: 8 },
    { name: 'Omi (5y)', skill: 0.1, age: 5 },
    { name: 'Mumu (25y)', skill: 0.7, age: 25 },
    { name: 'Ma (60y)', skill: 0.8, age: 60 }
  ];

  const testResults = {};

  for (const persona of personas) {
    console.log(`🎯 Testing ${persona.name}...`);

    const puzzleTypes = new Set();
    const puzzleDetails = [];

    // Generate 20 puzzles for each persona
    for (let i = 0; i < 20; i++) {
      try {
        const recommendation = await intelligentPuzzleEngine.getNextPuzzle();
        const puzzle = recommendation.puzzle;

        puzzleTypes.add(puzzle.puzzleType);
        puzzleDetails.push({
          type: puzzle.puzzleType,
          subtype: puzzle.puzzleSubtype || 'N/A',
          difficulty: puzzle.difficultyLevel || 'N/A',
          reason: recommendation.selectionReason
        });

        // Add some variety in response patterns
        if (i % 3 === 0) {
          await intelligentPuzzleEngine.recordResponse(puzzle, true, 2000); // Correct
        } else if (i % 5 === 0) {
          await intelligentPuzzleEngine.recordResponse(puzzle, false, 5000); // Wrong
        } else {
          await intelligentPuzzleEngine.recordResponse(puzzle, true, 3000); // Correct
        }

      } catch (error) {
        console.error(`  ❌ Error generating puzzle ${i + 1}: ${error.message}`);
      }
    }

    testResults[persona.name] = {
      uniqueTypes: Array.from(puzzleTypes),
      typeCount: puzzleTypes.size,
      details: puzzleDetails
    };

    console.log(`  ✅ Generated ${puzzleTypes.size} unique types: ${Array.from(puzzleTypes).join(', ')}`);
    console.log('');
  }

  // Analysis
  console.log('📊 Analysis Results:');
  console.log('');

  // Check if all personas are getting variety
  const allTypesGenerated = new Set();
  for (const [personaName, results] of Object.entries(testResults)) {
    results.uniqueTypes.forEach(type => allTypesGenerated.add(type));

    console.log(`${personaName}:`);
    console.log(`  Variety Score: ${results.typeCount}/${configSummary.enabledCount} types`);
    console.log(`  Types: ${results.uniqueTypes.join(', ')}`);

    // Show some example selections
    const examples = results.details.slice(0, 3);
    examples.forEach((detail, index) => {
      console.log(`  Example ${index + 1}: ${detail.type} (${detail.subtype}) - ${detail.reason}`);
    });
    console.log('');
  }

  // Overall assessment
  console.log('🎯 Overall Assessment:');
  console.log(`Total unique types generated across all personas: ${allTypesGenerated.size}/${configSummary.enabledCount}`);
  console.log(`Types generated: ${Array.from(allTypesGenerated).join(', ')}`);

  const missingTypes = configSummary.enabled.filter(type => !allTypesGenerated.has(type));
  if (missingTypes.length > 0) {
    console.log(`⚠️  Missing types: ${missingTypes.join(', ')}`);
  } else {
    console.log('✅ All enabled puzzle types are being generated!');
  }

  // Check adaptation
  const personaVariety = Object.values(testResults).map(r => r.typeCount);
  const avgVariety = personaVariety.reduce((a, b) => a + b, 0) / personaVariety.length;

  console.log(`📈 Average variety per persona: ${avgVariety.toFixed(1)} types`);

  if (avgVariety >= configSummary.enabledCount * 0.7) {
    console.log('✅ Engine is providing good variety across personas');
  } else {
    console.log('⚠️  Engine may need improvement in variety distribution');
  }

  console.log('\n🎮 Validation Complete!');
}

// Run validation
if (require.main === module) {
  validateEngineAdaptation().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateEngineAdaptation };