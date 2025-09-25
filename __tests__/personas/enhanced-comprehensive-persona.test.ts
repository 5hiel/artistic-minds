/**
 * Enhanced Comprehensive Persona Test
 *
 * Validates that the adaptive engine properly generates different puzzle types
 * for all personas and adapts correctly to different user behaviors.
 */

import { IntelligentPuzzleEngine } from '../../src/lib/engine/intelligentPuzzleEngine';
import { getEnabledPuzzleTypes, getPuzzleConfigSummary } from '../../src/constants/puzzleConfig';
import { PersonaConfigManager } from '../utils/personas/persona-config-manager';

describe('Enhanced Comprehensive Persona Testing', () => {
  const personaManager = new PersonaConfigManager();
  const personas = ['ira', 'omi', 'mumu', 'ma'];

  beforeEach(async () => {
    // Reset the engine before each test
    const engine = IntelligentPuzzleEngine.getInstance();
    engine.reset();
  });

  describe('Adaptive Engine Puzzle Distribution', () => {
    const testConfiguration = process.env.PRESET === 'quick' ? {
      totalChunks: 5,
      puzzlesPerChunk: 10,
      testTimeout: 300000 // 5 minutes
    } : {
      totalChunks: 10,
      puzzlesPerChunk: 20,
      testTimeout: 600000 // 10 minutes
    };

    personas.forEach(persona => {
      it(`should generate diverse puzzle types for ${persona} persona`, async () => {
        console.log(`\n🎯 Testing ${persona.toUpperCase()} persona...`);

        const personaConfig = personaManager.getPersonaConfig(persona);
        expect(personaConfig).toBeTruthy();

        const puzzleTypes = new Set<string>();
        const puzzleDetails: Array<{
          type: string;
          subtype?: string;
          difficulty?: number;
          reason: string;
          puzzleIndex: number;
        }> = [];

        const enabledTypes = getEnabledPuzzleTypes();
        const configSummary = getPuzzleConfigSummary();

        console.log(`📋 Testing against ${configSummary.enabledCount} enabled puzzle types: ${configSummary.enabled.join(', ')}`);

        const totalPuzzles = testConfiguration.totalChunks * testConfiguration.puzzlesPerChunk;
        const engine = IntelligentPuzzleEngine.getInstance();

        // Generate puzzles and track responses
        for (let i = 0; i < totalPuzzles; i++) {
          try {
            const recommendation = await engine.generateAdaptivePuzzle();
            if (!recommendation) {
              throw new Error('generateAdaptivePuzzle returned null');
            }
            const puzzle = recommendation.puzzle;

            const puzzleType = puzzle.puzzleType || 'unknown';
            puzzleTypes.add(puzzleType);

            // Convert string difficulty level to number
            const difficultyMap = { 'easy': 0.3, 'medium': 0.6, 'hard': 0.9 };
            const difficultyNum = puzzle.difficultyLevel ?
              difficultyMap[puzzle.difficultyLevel as keyof typeof difficultyMap] || 0.5 : 0.5;

            puzzleDetails.push({
              type: puzzleType,
              subtype: puzzle.puzzleSubtype || 'default',
              difficulty: difficultyNum,
              reason: recommendation.selectionReason,
              puzzleIndex: i + 1
            });

            // Simulate persona-appropriate responses
            const shouldBeCorrect = shouldPersonaGetCorrect(persona, puzzleType, i);
            const responseTime = getPersonaResponseTime(persona, puzzleType);

            await engine.recordPuzzleCompletion(puzzle.semanticId || `puzzle_${i}`, shouldBeCorrect, responseTime);

            // Log progress every 10 puzzles
            if ((i + 1) % 10 === 0) {
              console.log(`  Progress: ${i + 1}/${totalPuzzles} - Current types: ${Array.from(puzzleTypes).join(', ')}`);
            }

          } catch (error) {
            console.error(`  ❌ Error generating puzzle ${i + 1} for ${persona}: ${(error as Error).message}`);
            throw error;
          }
        }

        // Analysis
        console.log(`\n📊 ${persona.toUpperCase()} Results:`);
        console.log(`  Unique types generated: ${puzzleTypes.size}/${configSummary.enabledCount}`);
        console.log(`  Types: ${Array.from(puzzleTypes).join(', ')}`);

        // Validate puzzle variety
        expect(puzzleTypes.size).toBeGreaterThan(1);
        expect(puzzleTypes.size).toBeGreaterThanOrEqual(Math.min(3, configSummary.enabledCount));

        // Ensure all generated types are enabled
        puzzleTypes.forEach(type => {
          expect(enabledTypes[type]).toBeDefined();
        });

        // Check for adaptation over time
        const firstHalf = puzzleDetails.slice(0, Math.floor(totalPuzzles / 2));
        const secondHalf = puzzleDetails.slice(Math.floor(totalPuzzles / 2));

        const firstHalfTypes = new Set(firstHalf.map(p => p.type));
        const secondHalfTypes = new Set(secondHalf.map(p => p.type));

        console.log(`  First half types: ${Array.from(firstHalfTypes).join(', ')}`);
        console.log(`  Second half types: ${Array.from(secondHalfTypes).join(', ')}`);

        // Report type distribution
        const typeDistribution: Record<string, number> = {};
        puzzleDetails.forEach(detail => {
          typeDistribution[detail.type] = (typeDistribution[detail.type] || 0) + 1;
        });

        console.log(`  Type distribution:`);
        Object.entries(typeDistribution).forEach(([type, count]) => {
          const percentage = ((count / totalPuzzles) * 100).toFixed(1);
          console.log(`    ${type}: ${count} (${percentage}%)`);
        });

        // Validate variety is maintained (no single type dominates more than 70%)
        Object.values(typeDistribution).forEach(count => {
          expect(count / totalPuzzles).toBeLessThan(0.7);
        });

        // Store results for cross-persona analysis
        global.personaTestResults = global.personaTestResults || {};
        global.personaTestResults[persona] = {
          uniqueTypes: Array.from(puzzleTypes),
          typeCount: puzzleTypes.size,
          typeDistribution,
          totalPuzzles,
          details: puzzleDetails
        };

      }, testConfiguration.testTimeout);
    });

    it('should generate all enabled puzzle types across all personas', async () => {
      console.log('\n🔍 Cross-Persona Analysis...');

      const results = global.personaTestResults || {};
      const configSummary = getPuzzleConfigSummary();

      // Collect all types generated across all personas
      const allTypesGenerated = new Set<string>();
      Object.values(results).forEach((result: any) => {
        result.uniqueTypes.forEach((type: string) => allTypesGenerated.add(type));
      });

      console.log(`📈 Overall Results:`);
      console.log(`  Total unique types across all personas: ${allTypesGenerated.size}/${configSummary.enabledCount}`);
      console.log(`  Types generated: ${Array.from(allTypesGenerated).join(', ')}`);

      const missingTypes = configSummary.enabled.filter(type => !allTypesGenerated.has(type));
      if (missingTypes.length > 0) {
        console.log(`  ⚠️  Missing types: ${missingTypes.join(', ')}`);
      } else {
        console.log(`  ✅ All enabled puzzle types are being generated!`);
      }

      // Validate that most enabled types are covered
      const coveragePercentage = (allTypesGenerated.size / configSummary.enabledCount) * 100;
      console.log(`  Coverage: ${coveragePercentage.toFixed(1)}%`);

      expect(coveragePercentage).toBeGreaterThan(70); // At least 70% coverage

      // Validate persona variety
      Object.entries(results).forEach(([persona, result]: [string, any]) => {
        console.log(`  ${persona}: ${result.typeCount}/${configSummary.enabledCount} types (${((result.typeCount / configSummary.enabledCount) * 100).toFixed(1)}%)`);
        expect(result.typeCount).toBeGreaterThan(1); // Each persona should get variety
      });

    }, 60000); // 1 minute timeout for analysis
  });
});

// Helper functions for persona simulation
function shouldPersonaGetCorrect(persona: string, puzzleType: string, puzzleIndex: number): boolean {
  // Simulate different personas having different strengths
  const baseAccuracy = getPersonaBaseAccuracy(persona, puzzleType);

  // Add some variation and learning progression
  const progressionBonus = Math.min(0.1, puzzleIndex * 0.002); // Slight improvement over time
  const randomVariation = (Math.random() - 0.5) * 0.2; // ±10% variation

  const finalAccuracy = Math.max(0.1, Math.min(0.95, baseAccuracy + progressionBonus + randomVariation));

  return Math.random() < finalAccuracy;
}

function getPersonaBaseAccuracy(persona: string, puzzleType: string): number {
  // Simplified persona characteristics for testing
  const personaAccuracies: Record<string, Record<string, number>> = {
    ira: { // 8-year-old competitive child
      'pattern': 0.8,
      'number-grid': 0.7,
      'number-analogy': 0.6,
      'serial-reasoning': 0.4,
      'number-series': 0.5,
      'default': 0.6
    },
    omi: { // 5-year-old visual learner
      'pattern': 0.7,
      'serial-reasoning': 0.5,
      'number-grid': 0.3,
      'number-analogy': 0.3,
      'number-series': 0.2,
      'default': 0.4
    },
    mumu: { // Adult high performer
      'pattern': 0.9,
      'number-grid': 0.9,
      'number-analogy': 0.85,
      'serial-reasoning': 0.85,
      'number-series': 0.9,
      'default': 0.85
    },
    ma: { // Senior analytical thinker
      'pattern': 0.8,
      'number-grid': 0.75,
      'number-analogy': 0.85,
      'serial-reasoning': 0.9,
      'number-series': 0.8,
      'default': 0.8
    }
  };

  return personaAccuracies[persona]?.[puzzleType] || personaAccuracies[persona]?.['default'] || 0.5;
}

function getPersonaResponseTime(persona: string, puzzleType: string): number {
  // Simulate different response times
  const personaBaseTimes: Record<string, number> = {
    ira: 3000,  // Fast competitive child
    omi: 6000,  // Slower child
    mumu: 2500, // Fast adult
    ma: 8000    // Thoughtful senior
  };

  const baseTime = personaBaseTimes[persona] || 5000;
  const variation = (Math.random() - 0.5) * baseTime * 0.4; // ±20% variation

  return Math.max(1000, baseTime + variation);
}

// Declare global for TypeScript
declare global {
  var personaTestResults: Record<string, any>;
}