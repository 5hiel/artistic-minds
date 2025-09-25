#!/bin/bash

# Run All Personas Sequential Analysis Script
# Executes all 4 personas (ma, omi, mumu, ira) one after another with 10 chunks × 5 puzzles each
# Results are automatically saved and aggregated for comparative analysis

set -e

# Configuration
BATCH_ID="batch_$(date +%s)"
LOG_FILE="./logs/persona-batch-${BATCH_ID}.log"
PERSONAS=("ma" "omi" "mumu" "ira")
TOTAL_PERSONAS=${#PERSONAS[@]}
TOTAL_CHUNKS=5
PUZZLES_PER_CHUNK=10

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Sequential Chunk-Based Persona Analysis${NC}"
echo -e "${BLUE}📊 Configuration: 4 personas × ${TOTAL_CHUNKS} chunks × ${PUZZLES_PER_CHUNK} puzzles = $((TOTAL_PERSONAS * TOTAL_CHUNKS * PUZZLES_PER_CHUNK)) total puzzles${NC}"
echo -e "${BLUE}💾 Batch ID: ${BATCH_ID}${NC}"
echo -e "${BLUE}📝 Log file: ${LOG_FILE}${NC}"
echo -e "${BLUE}⏱️  Chunk-based execution: ${PUZZLES_PER_CHUNK} puzzles per chunk (timeout-safe)${NC}"
echo ""

# Initialize log file
echo "Sequential Persona Analysis - Batch ID: ${BATCH_ID}" > "${LOG_FILE}"
echo "Started: $(date)" >> "${LOG_FILE}"
echo "Personas: ${PERSONAS[*]}" >> "${LOG_FILE}"
echo "----------------------------------------" >> "${LOG_FILE}"

# Track timing
BATCH_START_TIME=$(date +%s)
SUCCESSFUL_RUNS=0
FAILED_RUNS=0

# Run each persona with all chunks sequentially
for i in "${!PERSONAS[@]}"; do
    PERSONA="${PERSONAS[$i]}"
    CURRENT_PERSONA=$((i + 1))

    echo -e "${YELLOW}📦 Running Persona ${CURRENT_PERSONA}/${TOTAL_PERSONAS}: ${PERSONA}${NC}"
    echo "Starting persona: ${PERSONA} at $(date)" >> "${LOG_FILE}"

    # Track individual persona timing
    PERSONA_START_TIME=$(date +%s)
    PERSONA_CHUNKS_FAILED=0

    # Run all chunks for this persona
    for CHUNK in $(seq 1 $TOTAL_CHUNKS); do
        echo -e "${BLUE}  📊 Chunk ${CHUNK}/${TOTAL_CHUNKS} for ${PERSONA}${NC}"
        echo "    Starting chunk ${CHUNK} for ${PERSONA} at $(date)" >> "${LOG_FILE}"

        # Determine if this is a resumption
        RESUME_FLAG=""
        if [ $CHUNK -gt 1 ]; then
            RESUME_FLAG="RESUME_SESSION=true"
        fi

        # Run the chunk
        if eval "PERSONA=\"${PERSONA}\" BATCH_ID=\"${BATCH_ID}\" CHUNK_NUMBER=\"${CHUNK}\" TOTAL_CHUNKS=\"${TOTAL_CHUNKS}\" PUZZLES_PER_CHUNK=\"${PUZZLES_PER_CHUNK}\" ${RESUME_FLAG} npm run test:personas -- --testNamePattern=\"Single persona chunk\" --testTimeout=180000" 2>&1 | tee -a "${LOG_FILE}"; then
            echo -e "${GREEN}    ✅ ${PERSONA} chunk ${CHUNK} completed${NC}"
            echo "    Completed: ${PERSONA} chunk ${CHUNK}" >> "${LOG_FILE}"
        else
            echo -e "${RED}    ❌ ${PERSONA} chunk ${CHUNK} failed${NC}"
            echo "    Failed: ${PERSONA} chunk ${CHUNK}" >> "${LOG_FILE}"
            PERSONA_CHUNKS_FAILED=$((PERSONA_CHUNKS_FAILED + 1))
        fi

        # Brief pause between chunks
        if [ $CHUNK -lt $TOTAL_CHUNKS ]; then
            echo -e "${BLUE}    ⏳ Waiting 2 seconds before next chunk...${NC}"
            sleep 2
        fi
    done

    PERSONA_END_TIME=$(date +%s)
    PERSONA_DURATION=$((PERSONA_END_TIME - PERSONA_START_TIME))

    # Check persona completion status
    if [ $PERSONA_CHUNKS_FAILED -eq 0 ]; then
        SUCCESSFUL_RUNS=$((SUCCESSFUL_RUNS + 1))
        echo -e "${GREEN}✅ ${PERSONA} completed all chunks successfully in ${PERSONA_DURATION}s${NC}"
        echo "Completed: ${PERSONA} (all chunks) in ${PERSONA_DURATION}s" >> "${LOG_FILE}"
    else
        FAILED_RUNS=$((FAILED_RUNS + 1))
        echo -e "${RED}❌ ${PERSONA} failed ${PERSONA_CHUNKS_FAILED}/${TOTAL_CHUNKS} chunks after ${PERSONA_DURATION}s${NC}"
        echo "Failed: ${PERSONA} (${PERSONA_CHUNKS_FAILED} chunks failed) after ${PERSONA_DURATION}s" >> "${LOG_FILE}"
    fi

    echo "----------------------------------------" >> "${LOG_FILE}"

    # Brief pause between personas to ensure clean separation
    if [ $CURRENT_PERSONA -lt $TOTAL_PERSONAS ]; then
        echo -e "${BLUE}⏳ Waiting 5 seconds before next persona...${NC}"
        sleep 5
    fi
done

# Calculate total execution time
BATCH_END_TIME=$(date +%s)
TOTAL_DURATION=$((BATCH_END_TIME - BATCH_START_TIME))
MINUTES=$((TOTAL_DURATION / 60))
SECONDS=$((TOTAL_DURATION % 60))

# Summary
echo ""
echo -e "${BLUE}🏁 Batch Analysis Complete!${NC}"
echo -e "${BLUE}⏱️  Total Time: ${MINUTES}m ${SECONDS}s${NC}"
echo -e "${GREEN}✅ Successful: ${SUCCESSFUL_RUNS}/${TOTAL_PERSONAS}${NC}"

if [ $FAILED_RUNS -gt 0 ]; then
    echo -e "${RED}❌ Failed: ${FAILED_RUNS}/${TOTAL_PERSONAS}${NC}"
fi

# Write summary to log
echo "" >> "${LOG_FILE}"
echo "BATCH SUMMARY" >> "${LOG_FILE}"
echo "Total Duration: ${TOTAL_DURATION}s (${MINUTES}m ${SECONDS}s)" >> "${LOG_FILE}"
echo "Successful: ${SUCCESSFUL_RUNS}/${TOTAL_PERSONAS}" >> "${LOG_FILE}"
echo "Failed: ${FAILED_RUNS}/${TOTAL_PERSONAS}" >> "${LOG_FILE}"
echo "Ended: $(date)" >> "${LOG_FILE}"

# Check if results aggregation script exists and run it
if [ -f "./scripts/aggregate-persona-results.js" ]; then
    echo -e "${BLUE}📊 Running results aggregation...${NC}"
    if node ./scripts/aggregate-persona-results.js "${BATCH_ID}" 2>&1 | tee -a "${LOG_FILE}"; then
        echo -e "${GREEN}✅ Results aggregation completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Results aggregation failed, but individual results are saved${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  Results aggregation script not found - individual results saved to __tests__/results/${NC}"
fi

# Display next steps
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${BLUE}1. Check individual results in: __tests__/results/batch-persona-analysis/${NC}"
echo -e "${BLUE}2. Review full log: ${LOG_FILE}${NC}"
echo -e "${BLUE}3. Each persona's JSON results: ${BATCH_ID}_[persona].json${NC}"

# Exit with error code if any persona failed
if [ $FAILED_RUNS -gt 0 ]; then
    exit 1
else
    exit 0
fi