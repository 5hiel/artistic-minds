#!/bin/bash

# Test Persona Single Chunk Script
# Quick test script to run a single persona chunk with proper environment variables
# This demonstrates the bash commands needed for persona testing

set -e

# Default configuration
PERSONA=${PERSONA:-"omi"}
CHUNK_NUMBER=${CHUNK_NUMBER:-1}
TOTAL_CHUNKS=${TOTAL_CHUNKS:-5}
PUZZLES_PER_CHUNK=${PUZZLES_PER_CHUNK:-10}
BATCH_ID=${BATCH_ID:-"test_$(date +%s)"}
RESUME_SESSION=${RESUME_SESSION:-false}

echo "🎭 Testing single persona chunk execution"
echo "📊 Configuration:"
echo "  - Persona: ${PERSONA}"
echo "  - Chunk: ${CHUNK_NUMBER}/${TOTAL_CHUNKS}"
echo "  - Puzzles per chunk: ${PUZZLES_PER_CHUNK}"
echo "  - Batch ID: ${BATCH_ID}"
echo "  - Resume session: ${RESUME_SESSION}"
echo ""

# Build the command
CMD="PERSONA=\"${PERSONA}\" BATCH_ID=\"${BATCH_ID}\" CHUNK_NUMBER=\"${CHUNK_NUMBER}\" TOTAL_CHUNKS=\"${TOTAL_CHUNKS}\" PUZZLES_PER_CHUNK=\"${PUZZLES_PER_CHUNK}\""

if [ "$RESUME_SESSION" = "true" ]; then
    CMD="${CMD} RESUME_SESSION=true"
fi

CMD="${CMD} npm run test:personas -- --testNamePattern=\"Single persona chunk\" --testTimeout=180000"

echo "🚀 Executing command:"
echo "${CMD}"
echo ""

# Execute the test
eval "${CMD}"

echo ""
echo "✅ Single persona chunk test completed!"