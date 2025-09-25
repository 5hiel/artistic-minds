/**
 * Atomic Chunk Processor for Persona Testing
 *
 * This replaces the monolithic chunk processing with atomic, resumable operations.
 * Each chunk is independent and generates immediate reports, preventing data loss on failures.
 *
 * Environment variables:
 * - PERSONA: Target persona (omi|ira|mumu|ma)
 * - CHUNK_NUMBER: Specific chunk to process (1-20)
 * - SESSION_ID: Session identifier for continuity
 * - PUZZLES_PER_CHUNK: Number of puzzles per chunk (default: 10)
 * - CREATE_SESSION: Create new session if true (default: false)
 * - FORCE_CONTINUE: Continue even if previous chunk failed (default: false)
 *
 * Usage:
 * PERSONA=ira CHUNK_NUMBER=1 CREATE_SESSION=true npm run test:personas:atomic
 * PERSONA=ira CHUNK_NUMBER=2 SESSION_ID=ira_batch_123 npm run test:personas:atomic
 */

import { IntelligentPuzzleEngine, AdaptiveEngineConfig } from '../../src/lib/engine/intelligentPuzzleEngine';
import { testingStorage, SessionConfig, ChunkResult } from '../../src/lib/testingStorage';
import { AtomicChunkManager } from '../utils/personas/atomic-chunk-manager';
import { PersonaConfigManager } from '../utils/personas/persona-config-manager';
import { ProgressiveReportGenerator } from '../utils/personas/progressive-report-generator';

// Mock setup
jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map();
  return {
    getItem: jest.fn((key) => Promise.resolve(storage.get(key) || null)),
    setItem: jest.fn((key, value) => { storage.set(key, value); return Promise.resolve(); }),
    removeItem: jest.fn((key) => { storage.delete(key); return Promise.resolve(); }),
    clear: jest.fn(() => { storage.clear(); return Promise.resolve(); }),
    getAllKeys: jest.fn(() => Promise.resolve([...storage.keys()])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((options) => options.ios) },
}));

// Add type declarations for global objects
declare global {
  var personaProgressReporter: any;
}

describe('🔬 Atomic Chunk Processor', () => {
  let chunkManager: AtomicChunkManager;
  let personaManager: PersonaConfigManager;
  let reportGenerator: ProgressiveReportGenerator;

  beforeAll(async () => {
    chunkManager = new AtomicChunkManager();
    personaManager = new PersonaConfigManager();
    reportGenerator = new ProgressiveReportGenerator();

    // Initialize logging
    console.log('🚀 Initializing Atomic Chunk Processor...');
  });

  afterAll(async () => {
    // Cleanup and final reporting
    await reportGenerator.generateFinalReport();
    console.log('🏁 Atomic Chunk Processor Complete');
  });

  test('Process single atomic chunk with full error recovery', async () => {
    // Parse configuration from environment
    const config = parseChunkConfiguration();
    console.log(`\n🔬 Atomic Chunk Processing: ${config.persona.toUpperCase()} Chunk ${config.chunkNumber}`);
    console.log(`📊 Configuration: ${JSON.stringify(config, null, 2)}`);

    // Validate configuration
    validateConfiguration(config);

    // Get persona configuration
    const persona = personaManager.getPersonaConfig(config.persona);
    if (!persona) {
      throw new Error(`Unknown persona: ${config.persona}. Available: ${personaManager.getAvailablePersonas().join(', ')}`);
    }

    // Initialize or load session
    let sessionConfig: SessionConfig;
    if (config.createSession) {
      sessionConfig = await createNewSession(config, persona);
    } else {
      sessionConfig = await loadExistingSession(config);
    }

    // Validate session continuity
    await validateSessionContinuity(sessionConfig, config);

    // Setup adaptive engine
    const adaptiveConfig = createAdaptiveConfig();
    const engine = await setupAtomicEngine(sessionConfig, adaptiveConfig, config);

    // Process the atomic chunk
    const chunkResult = await processAtomicChunk(
      persona,
      config.chunkNumber,
      config.puzzlesPerChunk,
      sessionConfig,
      engine
    );

    // Immediate save and report generation
    await saveChunkResultImmediately(sessionConfig.sessionId, chunkResult);
    await reportGenerator.generateChunkReport(chunkResult, sessionConfig);

    // Validate chunk completion
    validateChunkResult(chunkResult, config);

    // Update session progress
    await updateSessionProgress(sessionConfig, chunkResult);

    console.log(`✅ Chunk ${config.chunkNumber} completed successfully: ${(chunkResult.chunkAccuracy * 100).toFixed(1)}% accuracy`);

  }, 600000); // 10 minute timeout per chunk

});

// Configuration parsing and validation
function parseChunkConfiguration() {
  const persona = process.env.PERSONA?.toLowerCase();
  const chunkNumber = parseInt(process.env.CHUNK_NUMBER || '1');
  const sessionId = process.env.SESSION_ID;
  const puzzlesPerChunk = parseInt(process.env.PUZZLES_PER_CHUNK || '10');
  const createSession = process.env.CREATE_SESSION === 'true';
  const forceContinue = process.env.FORCE_CONTINUE === 'true';

  if (!persona) {
    throw new Error('PERSONA environment variable is required');
  }

  if (!sessionId && !createSession) {
    throw new Error('SESSION_ID is required unless CREATE_SESSION=true');
  }

  return {
    persona,
    chunkNumber,
    sessionId: sessionId || `${persona}_atomic_${Date.now()}`,
    puzzlesPerChunk,
    createSession,
    forceContinue
  };
}

function validateConfiguration(config: any) {
  if (config.chunkNumber < 1 || config.chunkNumber > 50) {
    throw new Error(`Invalid chunk number: ${config.chunkNumber}. Must be 1-50`);
  }

  if (config.puzzlesPerChunk < 1 || config.puzzlesPerChunk > 20) {
    throw new Error(`Invalid puzzles per chunk: ${config.puzzlesPerChunk}. Must be 1-20`);
  }

  console.log('✅ Configuration validated successfully');
}

// Session management
async function createNewSession(config: any, persona: any): Promise<SessionConfig> {
  console.log(`🆕 Creating new session: ${config.sessionId}`);

  const sessionConfig: SessionConfig = {
    sessionId: config.sessionId,
    persona: persona.name,
    totalChunks: 20, // Default for cross-persona testing
    puzzlesPerChunk: config.puzzlesPerChunk,
    totalPuzzlesTarget: 20 * config.puzzlesPerChunk,
    startTime: new Date().toISOString(),
    lastChunkCompleted: 0,
    chunksRemaining: 20,
    preset: 'atomic'
  };

  await testingStorage.saveSessionConfig(sessionConfig);
  console.log('✅ New session created and saved');

  return sessionConfig;
}

async function loadExistingSession(config: any): Promise<SessionConfig> {
  console.log(`📂 Loading existing session: ${config.sessionId}`);

  const sessionConfig = await testingStorage.loadSessionConfig(config.sessionId);
  if (!sessionConfig) {
    throw new Error(`Session not found: ${config.sessionId}. Use CREATE_SESSION=true to create new session.`);
  }

  console.log(`✅ Loaded session: ${sessionConfig.persona} - ${sessionConfig.lastChunkCompleted}/${sessionConfig.totalChunks} chunks completed`);
  return sessionConfig;
}

async function validateSessionContinuity(sessionConfig: SessionConfig, config: any) {
  const expectedChunk = sessionConfig.lastChunkCompleted + 1;

  if (!config.forceContinue && config.chunkNumber !== expectedChunk) {
    throw new Error(
      `Chunk continuity error: Expected chunk ${expectedChunk}, got ${config.chunkNumber}. ` +
      `Use FORCE_CONTINUE=true to override.`
    );
  }

  if (config.chunkNumber <= sessionConfig.lastChunkCompleted && !config.forceContinue) {
    throw new Error(
      `Chunk ${config.chunkNumber} already completed. Use FORCE_CONTINUE=true to reprocess.`
    );
  }

  console.log('✅ Session continuity validated');
}

// Adaptive engine setup
function createAdaptiveConfig(): AdaptiveEngineConfig {
  return {
    newUserSettings: {
      enabled: true,
      puzzleCountThreshold: 10,
      skillLevelThreshold: 0.4,
      accuracyThreshold: 0.8,
      maxDifficulty: 0.4,
      engagementPriority: 0.7
    },
    strugglingUserSettings: {
      enabled: true,
      puzzleCountThreshold: 10,
      accuracyThreshold: 0.5,
      maxDifficulty: 0.6
    },
    metricsLogging: {
      detailedLearningMetrics: true,
      userMetricsPerAnswer: true,
      predictionAccuracyTracking: true,
      silentMode: false
    },
    globalSettings: {},
    logging: { enabled: false }
  };
}

async function setupAtomicEngine(
  sessionConfig: SessionConfig,
  adaptiveConfig: AdaptiveEngineConfig,
  config: any
): Promise<IntelligentPuzzleEngine> {
  console.log('⚙️ Setting up atomic adaptive engine...');

  const { BehavioralSignatureStorage } = require('../../lib/adaptiveEngine/behavioralSignatureStorage');
  const storage = BehavioralSignatureStorage.getInstance();

  // Create engine
  const engine = IntelligentPuzzleEngine.getInstance();
  engine.configure(adaptiveConfig);

  // Load existing profile if continuing session
  if (config.chunkNumber > 1) {
    try {
      const existingProfile = await storage.getUserProfile();
      console.log(`📊 Loading existing profile: ${existingProfile.totalPuzzlesSolved} puzzles completed`);
      (engine as any).userProfile = existingProfile;
    } catch (error) {
      console.log(`⚠️ Could not load existing profile: ${error}`);
    }
  } else {
    // Clear storage for first chunk of new session
    try {
      await storage.clearAllData();
      storage.clearCache();
      console.log('🧹 Cleared storage for new session');
    } catch (error) {
      console.log(`⚠️ Could not clear storage: ${error}`);
    }
  }

  // Enable tracking
  engine.enableTracking();

  // Start adaptive session if first chunk
  if (config.chunkNumber === 1) {
    await engine.startAdaptiveSession();
    console.log('🚀 Started new adaptive session');
  }

  console.log('✅ Atomic engine setup complete');
  return engine;
}

// Atomic chunk processing
async function processAtomicChunk(
  persona: any,
  chunkNumber: number,
  puzzlesPerChunk: number,
  sessionConfig: SessionConfig,
  engine: IntelligentPuzzleEngine
): Promise<ChunkResult> {
  console.log(`\n📦 Processing Atomic Chunk ${chunkNumber} (${puzzlesPerChunk} puzzles)...`);

  const startTime = Date.now();
  const puzzleResults: Array<{
    puzzleIndex: number;
    puzzleType: string;
    difficulty: string;
    success: boolean;
  }> = [];

  const typeDistribution: Record<string, number> = {};
  const difficultyDistribution: Record<string, number> = {};
  let chunkCorrect = 0;

  const { BehavioralSignatureStorage } = require('../../lib/adaptiveEngine/behavioralSignatureStorage');
  const storage = BehavioralSignatureStorage.getInstance();

  // Process puzzles with progress reporting
  for (let i = 1; i <= puzzlesPerChunk; i++) {
    const puzzleIndex = (chunkNumber - 1) * puzzlesPerChunk + i;

    // Report progress
    if ((global as any).personaProgressReporter) {
      const progress = Math.round((i / puzzlesPerChunk) * 100);
      (global as any).personaProgressReporter.logChunkProgress(persona.name, chunkNumber, progress);
    }

    try {
      // Generate puzzle
      const recommendation = await engine.generateAdaptivePuzzle();
      if (!recommendation) {
        throw new Error('generateAdaptivePuzzle returned null');
      }
      const puzzle = recommendation.puzzle;
      const puzzleType = puzzle.puzzleType || 'unknown';
      const difficulty = puzzle.difficultyLevel || 'easy';

      // Track distributions
      typeDistribution[puzzleType] = (typeDistribution[puzzleType] || 0) + 1;
      difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;

      // Simulate persona behavior
      const expectedAccuracy = persona.accuracyByType[puzzleType] || persona.accuracyByType['default'] || 0.30;
      const success = Math.random() < expectedAccuracy;
      if (success) chunkCorrect++;

      const responseTime = persona.responseTimeByType[puzzleType] || persona.responseTimeByType['default'] || 8000;
      const engagementScore = persona.engagementByType[puzzleType] || persona.engagementByType['default'] || 0.5;

      // Store interaction and record completion
      await storage.storeInteractionSession({
        puzzleId: `${puzzleType}_${persona.name}_chunk${chunkNumber}_${i}`,
        success: success,
        startTime: Date.now() - responseTime,
        endTime: Date.now(),
        duration: responseTime,
        puzzleType: puzzleType,
        puzzleSubtype: puzzle.puzzleSubtype || 'default',
        avgDifficulty: difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.5 : 0.8,
        engagementScore: engagementScore,
        gameSessionId: sessionConfig.sessionId,
        gameSessionStartTime: Date.now() - (puzzleIndex * 1000)
      });

      await engine.recordPuzzleCompletion(
        recommendation.puzzle.semanticId || `puzzle_${puzzleIndex}`,
        success,
        responseTime,
        engagementScore
      );

      puzzleResults.push({
        puzzleIndex,
        puzzleType,
        difficulty,
        success
      });

      // Brief pause to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));

    } catch (error) {
      console.error(`❌ Error processing puzzle ${i}: ${error}`);

      // Create failed puzzle entry
      puzzleResults.push({
        puzzleIndex,
        puzzleType: 'error',
        difficulty: 'unknown',
        success: false
      });
    }
  }

  const processingTime = (Date.now() - startTime) / 1000;
  const chunkAccuracy = chunkCorrect / puzzlesPerChunk;

  // Get final user profile snapshot
  let userProfileSnapshot = null;
  try {
    userProfileSnapshot = await storage.getUserProfile();
    console.log(`📈 Final profile: ${userProfileSnapshot.totalPuzzlesSolved} total puzzles, ${(userProfileSnapshot.overallAccuracy * 100).toFixed(1)}% accuracy`);
  } catch (error) {
    console.log(`⚠️ Could not get user profile: ${error}`);
  }

  // Report chunk completion
  if ((global as any).personaProgressReporter) {
    (global as any).personaProgressReporter.logChunkComplete(persona.name, chunkNumber, chunkAccuracy, puzzlesPerChunk);
  }

  console.log(`✅ Chunk ${chunkNumber}: ${(chunkAccuracy * 100).toFixed(1)}% accuracy (${chunkCorrect}/${puzzlesPerChunk}) | ${processingTime.toFixed(2)}s`);

  return {
    chunkNumber,
    puzzleCount: puzzlesPerChunk,
    chunkAccuracy,
    puzzleResults,
    userProfileSnapshot,
    processingTime,
    timestamp: new Date().toISOString(),
    typeDistribution,
    difficultyDistribution
  };
}

// Save and validation
async function saveChunkResultImmediately(sessionId: string, chunkResult: ChunkResult) {
  try {
    await testingStorage.saveChunkResult(sessionId, chunkResult);
    console.log(`💾 Chunk ${chunkResult.chunkNumber} result saved immediately`);
  } catch (error) {
    console.error(`❌ Failed to save chunk result: ${error}`);
    throw error;
  }
}

function validateChunkResult(chunkResult: ChunkResult, config: any) {
  if (chunkResult.puzzleCount !== config.puzzlesPerChunk) {
    throw new Error(`Puzzle count mismatch: expected ${config.puzzlesPerChunk}, got ${chunkResult.puzzleCount}`);
  }

  if (chunkResult.puzzleResults.length !== config.puzzlesPerChunk) {
    throw new Error(`Puzzle results count mismatch: expected ${config.puzzlesPerChunk}, got ${chunkResult.puzzleResults.length}`);
  }

  console.log('✅ Chunk result validated');
}

async function updateSessionProgress(sessionConfig: SessionConfig, chunkResult: ChunkResult) {
  try {
    sessionConfig.lastChunkCompleted = chunkResult.chunkNumber;
    sessionConfig.chunksRemaining = sessionConfig.totalChunks - chunkResult.chunkNumber;
    sessionConfig.currentUserProfileSnapshot = chunkResult.userProfileSnapshot;

    await testingStorage.saveSessionConfig(sessionConfig);
    console.log(`📊 Session progress updated: ${sessionConfig.lastChunkCompleted}/${sessionConfig.totalChunks} chunks`);
  } catch (error) {
    console.error(`❌ Failed to update session progress: ${error}`);
    throw error;
  }
}