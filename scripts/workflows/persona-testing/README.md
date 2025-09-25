# Persona Testing Workflow

Automated analysis of adaptive engine performance across different user personas using comprehensive testing and reporting.

## Overview

The persona testing workflow runs adaptive engine analysis across 4 distinct user personas:
- **ira** (8y): Competitive child with strong pattern skills
- **omi** (5y): Curious explorer with high enthusiasm
- **mumu** (25y): Casual adult with balanced skills
- **ma** (60y): Experienced adult focused on cognitive maintenance

## Workflow Configuration

### Trigger: Manual Dispatch

```yaml
name: 🎭 Persona Testing - Adaptive Engine Analysis
```

### Input Parameters

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `persona` | Persona to test | `ira` | `ira`, `omi`, `mumu`, `ma`, `all` |
| `preset` | Test configuration | `quick` | `quick`, `standard`, `comprehensive`, `custom` |
| `total_chunks` | Custom chunk count | `5` | Any positive integer |
| `puzzles_per_chunk` | Custom puzzles per chunk | `10` | Any positive integer |
| `session_id` | Custom session identifier | Auto-generated | Any string |
| `generate_report` | Create summary report | `true` | `true`, `false` |
| `upload_artifacts` | Upload test results | `true` | `true`, `false` |

### Preset Configurations

| Preset | Chunks | Puzzles/Chunk | Total | Duration | Use Case |
|--------|--------|---------------|-------|----------|----------|
| `quick` | 5 | 10 | 50 | ~5 min | Development testing |
| `standard` | 10 | 10 | 100 | ~12 min | Regular analysis |
| `comprehensive` | 50 | 8 | 400 | ~35 min | Deep analysis |
| `custom` | Variable | Variable | Variable | Variable | Specific requirements |

## Execution Flow

1. **Configuration Validation**: Validates persona and preset inputs
2. **Environment Setup**: Configures Node.js with memory allocation
3. **Single Persona Test**: Runs individual persona analysis
4. **Multi-Persona Test**: Sequential execution for "all" option
5. **Result Extraction**: Parses test outputs and analytics
6. **Report Generation**: Creates comprehensive analysis reports
7. **Artifact Upload**: Preserves results for 30 days

## Output Artifacts

### Test Results Directory
```
test_results/
├── tabular_report.txt      # Chunk progression tables
├── session_summary.txt     # Performance metrics
├── completion_status.txt   # Test execution status
├── errors.txt             # Error analysis
└── workflow_summary.md    # High-level overview
```

### Comprehensive Reports
```
comprehensive_report/
├── README.md              # Report index and usage
├── persona_test_output.log # Complete execution log
├── session_overview.txt   # Database session analysis
├── puzzle_analysis.txt    # Puzzle type performance
└── chunk_progression.txt  # Progressive difficulty analysis
```

### Analytics Database
- **File**: `analytics/test_analytics.db` (SQLite)
- **Tables**: Sessions, puzzles, profiles, metrics
- **Queries**: Pre-built analysis queries
- **Retention**: 30 days with test artifacts

## Analysis Scripts

### `analyze-personas.js`

Comprehensive analysis tool for processing persona testing results.

**Usage:**
```bash
node scripts/workflows/persona-testing/analyze-personas.js [options]
```

**Key Features:**
- Multi-format output (Markdown, JSON, text)
- Database integration with SQLite analytics
- Cross-persona comparison analysis
- Configurable report generation
- Dry-run mode for testing

**Examples:**
```bash
# Analyze specific session
node analyze-personas.js --session-id "ira_test_123"

# Generate comparative analysis
node analyze-personas.js --compare-sessions --format markdown

# JSON export for integration
node analyze-personas.js --persona ira --format json --output results.json
```

## Integration Points

### Database Analytics
- **Connection**: `analytics/test_analytics.db`
- **Schema**: Test sessions, puzzle analytics, profile snapshots
- **Queries**: Performance analysis, progression tracking

### Test Framework Integration
- **Base Test**: `__tests__/personas/enhanced-configurable-persona.test.ts`
- **Configuration**: Environment variables and presets
- **Storage**: Persistent session state across chunks

### GitHub Actions Integration
- **Workflow**: `.github/workflows/persona-testing.yml`
- **Artifacts**: Automatic result preservation
- **Summaries**: Integrated step summaries and status

## Monitoring and Alerts

### Success Indicators
- ✅ Test completion: "ANALYSIS COMPLETE" messages
- ✅ Profile evolution: Progressive skill development
- ✅ Constraint compliance: Age-appropriate difficulty
- ✅ Analytics generation: Database creation and population

### Failure Detection
- ❌ Timeout errors: Tests exceed allocated time
- ❌ Memory issues: Heap exhaustion during execution
- ❌ Constraint violations: Hard puzzles to children
- ❌ Profile corruption: Invalid state transitions

### Performance Metrics
- **Response Times**: Per-puzzle completion times
- **Accuracy Trends**: Progressive improvement patterns
- **Engagement Scores**: Persona-specific preferences
- **Adaptive Responses**: Engine decision tracking

## Configuration Files

### Environment Variables
```bash
# Core configuration
PRESET=quick                    # Predefined test configuration
PERSONA=ira                     # Target persona identifier
SESSION_ID=custom_session       # Unique session tracking
TOTAL_CHUNKS=5                  # Custom chunk count
PUZZLES_PER_CHUNK=10           # Custom puzzle count

# Advanced options
AUTO_CHUNK_SIZE=true           # Dynamic optimization
SHARED_PROFILE_MODE=false      # Cross-persona continuity
RESUME_SESSION=false           # Session continuation
START_CHUNK=1                  # Resume point
```

### Memory Allocation
- **Standard**: 6144MB for comprehensive testing
- **CI/CD**: 4096MB for automated runs
- **Development**: 2048MB for quick tests

## Troubleshooting

### Common Issues

**Timeout Errors**: Increase `testTimeout` parameter or reduce puzzle count
**Memory Exhaustion**: Verify `NODE_OPTIONS --max-old-space-size` allocation
**Database Errors**: Check SQLite file permissions and disk space
**Profile Corruption**: Clear storage with fresh session start

### Debug Mode
```bash
# Verbose execution with timestamps
npm run test:personas:enhanced -- --verbose --testTimeout=600000

# Monitor progress with logging
PRESET=quick PERSONA=ira npm run test:personas:enhanced 2>&1 | tee debug.log
```

### Support Resources
- **Documentation**: `PERSONA_TESTING.md` for complete guidance
- **Test Framework**: Jest configuration in `config/jest.config.personas.js`
- **Analytics**: SQLite browser for database exploration

## Maintenance

### Regular Tasks
- **Artifact Cleanup**: Automated 30-day retention
- **Database Optimization**: VACUUM operations for performance
- **Log Rotation**: Prevent excessive disk usage
- **Performance Tuning**: Memory allocation optimization

### Updates and Changes
- **Persona Configuration**: Update `PERSONA_CONFIGS` in test files
- **Preset Modification**: Adjust chunk/puzzle ratios in presets
- **Report Format**: Enhance analysis scripts for new metrics
- **Integration**: Update GitHub Actions for new requirements

---

**Generated by**: Persona Testing Workflow v1.0
**Last Updated**: Auto-generated documentation
**Workflow File**: `.github/workflows/persona-testing.yml`