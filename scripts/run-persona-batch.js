#!/usr/bin/env node

/**
 * Persona Batch Runner - Node.js Implementation
 * Runs all 4 personas sequentially using npm commands to avoid bash permission prompts
 *
 * Usage: node scripts/run-persona-batch.js [options]
 * Options:
 *   --chunks=N     Number of chunks per persona (default: 5)
 *   --puzzles=N    Puzzles per chunk (default: 10)
 *   --persona=X    Run single persona only (ma|omi|mumu|ira)
 *   --chunk=N      Run specific chunk for persona (requires --persona)
 *   --resume       Resume from existing session (requires --persona and --chunk)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PERSONAS = ['ma', 'omi', 'mumu', 'ira'];
const DEFAULT_CHUNKS = 5;
const DEFAULT_PUZZLES_PER_CHUNK = 10;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  chunks: DEFAULT_CHUNKS,
  puzzles: DEFAULT_PUZZLES_PER_CHUNK,
  persona: null,
  chunk: null,
  resume: false,
  batchId: `batch_${Date.now()}`
};

// Parse arguments
args.forEach(arg => {
  if (arg.startsWith('--chunks=')) {
    options.chunks = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--puzzles=')) {
    options.puzzles = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--persona=')) {
    options.persona = arg.split('=')[1];
  } else if (arg.startsWith('--chunk=')) {
    options.chunk = parseInt(arg.split('=')[1]);
  } else if (arg === '--resume') {
    options.resume = true;
  } else if (arg.startsWith('--batch-id=')) {
    options.batchId = arg.split('=')[1];
  }
});

// Create logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `persona-batch-${options.batchId}.log`);

// Logging function
function log(message, writeToFile = true) {
  console.log(message);
  if (writeToFile) {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
  }
}

// Run npm command with environment variables
function runNpmCommand(envVars, command, args = []) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...envVars };

    const child = spawn('npm', ['run', command, '--', ...args], {
      env,
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output); // Real-time output
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output); // Real-time output
    });

    child.on('close', (code) => {
      // Write to log file
      fs.appendFileSync(logFile, `\n--- Command: npm run ${command} ---\n`);
      fs.appendFileSync(logFile, `Environment: ${JSON.stringify(envVars)}\n`);
      fs.appendFileSync(logFile, `Exit code: ${code}\n`);
      fs.appendFileSync(logFile, `STDOUT:\n${stdout}\n`);
      if (stderr) {
        fs.appendFileSync(logFile, `STDERR:\n${stderr}\n`);
      }
      fs.appendFileSync(logFile, `--- End Command ---\n\n`);

      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Run single chunk
async function runSingleChunk(persona, chunkNumber, totalChunks, puzzlesPerChunk, batchId, resume = false) {
  const envVars = {
    PERSONA: persona,
    CHUNK_NUMBER: chunkNumber.toString(),
    TOTAL_CHUNKS: totalChunks.toString(),
    PUZZLES_PER_CHUNK: puzzlesPerChunk.toString(),
    BATCH_ID: batchId
  };

  if (resume) {
    envVars.RESUME_SESSION = 'true';
  }

  log(`  📊 Running chunk ${chunkNumber}/${totalChunks} for ${persona}`);

  const testArgs = [
    '--testNamePattern=Single persona chunk',
    '--testTimeout=180000'
  ];

  try {
    await runNpmCommand(envVars, 'test:personas:chunk', testArgs);
    log(`  ✅ ${persona} chunk ${chunkNumber} completed`);
    return true;
  } catch (error) {
    log(`  ❌ ${persona} chunk ${chunkNumber} failed: ${error.message}`);
    return false;
  }
}

// Run all chunks for a persona
async function runPersona(persona, totalChunks, puzzlesPerChunk, batchId) {
  log(`📦 Starting persona: ${persona}`);
  const startTime = Date.now();
  let failedChunks = 0;

  for (let chunk = 1; chunk <= totalChunks; chunk++) {
    const resume = chunk > 1;

    try {
      const success = await runSingleChunk(persona, chunk, totalChunks, puzzlesPerChunk, batchId, resume);
      if (!success) {
        failedChunks++;
      }
    } catch (error) {
      log(`❌ Error in ${persona} chunk ${chunk}: ${error.message}`);
      failedChunks++;
    }

    // Brief pause between chunks
    if (chunk < totalChunks) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  if (failedChunks === 0) {
    log(`✅ ${persona} completed all chunks successfully in ${duration}s`);
    return true;
  } else {
    log(`❌ ${persona} failed ${failedChunks}/${totalChunks} chunks after ${duration}s`);
    return false;
  }
}

// Main execution
async function main() {
  log('🚀 Starting Persona Analysis with Node.js Runner');
  log(`📊 Configuration: ${options.chunks} chunks × ${options.puzzles} puzzles per chunk`);
  log(`💾 Batch ID: ${options.batchId}`);
  log(`📝 Log file: ${logFile}`);

  const startTime = Date.now();

  try {
    // Single persona mode
    if (options.persona) {
      if (!PERSONAS.includes(options.persona)) {
        throw new Error(`Invalid persona: ${options.persona}. Available: ${PERSONAS.join(', ')}`);
      }

      // Single chunk mode
      if (options.chunk) {
        log(`🎯 Running single chunk: ${options.persona} chunk ${options.chunk}`);
        const success = await runSingleChunk(
          options.persona,
          options.chunk,
          options.chunks,
          options.puzzles,
          options.batchId,
          options.resume
        );

        if (success) {
          log('✅ Single chunk completed successfully!');

          // Show next step if not last chunk
          if (options.chunk < options.chunks) {
            log(`\n🔄 To continue, run:`);
            log(`node scripts/run-persona-batch.js --persona=${options.persona} --chunk=${options.chunk + 1} --resume --batch-id=${options.batchId}`);
          } else {
            log(`\n🎉 All chunks completed for ${options.persona}!`);
          }
        } else {
          process.exit(1);
        }
        return;
      }

      // Full persona mode
      log(`🎯 Running full persona: ${options.persona}`);
      const success = await runPersona(options.persona, options.chunks, options.puzzles, options.batchId);
      if (!success) {
        process.exit(1);
      }
      return;
    }

    // Full batch mode - all personas
    let successfulPersonas = 0;
    let failedPersonas = 0;

    for (const persona of PERSONAS) {
      const success = await runPersona(persona, options.chunks, options.puzzles, options.batchId);

      if (success) {
        successfulPersonas++;
      } else {
        failedPersonas++;
      }

      // Brief pause between personas
      if (persona !== PERSONAS[PERSONAS.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    log(`\n🏁 Batch Analysis Complete!`);
    log(`⏱️  Total Time: ${minutes}m ${seconds}s`);
    log(`✅ Successful: ${successfulPersonas}/${PERSONAS.length}`);

    if (failedPersonas > 0) {
      log(`❌ Failed: ${failedPersonas}/${PERSONAS.length}`);
    }

    // Run aggregation if available
    try {
      log(`\n📊 Running results aggregation...`);
      await runNpmCommand({ BATCH_ID: options.batchId }, 'run', ['node', 'scripts/aggregate-persona-results.js', options.batchId]);
      log(`✅ Results aggregation completed`);
    } catch (error) {
      log(`⚠️  Results aggregation failed: ${error.message}`);
    }

    if (failedPersonas > 0) {
      process.exit(1);
    }

  } catch (error) {
    log(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Help message
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Persona Batch Runner - Node.js Implementation

Usage: node scripts/run-persona-batch.js [options]

Options:
  --chunks=N        Number of chunks per persona (default: 5)
  --puzzles=N       Puzzles per chunk (default: 10)
  --persona=X       Run single persona only (ma|omi|mumu|ira)
  --chunk=N         Run specific chunk for persona (requires --persona)
  --resume          Resume from existing session (requires --persona and --chunk)
  --batch-id=X      Custom batch identifier
  --help, -h        Show this help message

Examples:
  # Run all personas
  node scripts/run-persona-batch.js

  # Run single persona all chunks
  node scripts/run-persona-batch.js --persona=omi

  # Run single chunk
  node scripts/run-persona-batch.js --persona=omi --chunk=1

  # Resume from specific chunk
  node scripts/run-persona-batch.js --persona=omi --chunk=3 --resume

Available personas: ${PERSONAS.join(', ')}
`);
  process.exit(0);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});