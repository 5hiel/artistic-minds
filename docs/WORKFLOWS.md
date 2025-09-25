# GitHub Workflows Documentation

This document describes the automated workflows available in the Gifted Minds project.

## 🤖 Issue Enhancement Workflow

### Overview
The Issue Enhancement Workflow automatically analyzes GitHub issues against our [Issue Requirements Checklist](./ISSUE_REQUIREMENTS_CHECKLIST.md) and provides detailed improvement suggestions.

### Files
- **Workflow**: `.github/workflows/enhance-issues.yml`
- **Script**: `scripts/workflows/dev-tools/enhance-github-issue.js`
- **Dependencies**: `@octokit/rest`

### How It Works

#### Automatic Trigger
The workflow runs automatically when:
- A new issue is created with the `needs-enhancement` label
- An existing issue with `needs-enhancement` label is edited

#### Manual Trigger
You can manually run the workflow:
1. Go to Actions tab in GitHub
2. Select "Enhance GitHub Issues with AI Analysis"
3. Click "Run workflow"
4. Enter the issue number to analyze

#### Analysis Process
1. **Fetches** issue details from GitHub API
2. **Analyzes** content against 19 categories from our checklist
3. **Identifies** missing information and gaps
4. **Suggests** improvements based on issue type
5. **Posts** detailed analysis as a comment
6. **Adds** appropriate labels based on content

### Local Usage

#### Prerequisites
```bash
# Install dependencies
npm install @octokit/rest

# Set environment variable
export GITHUB_TOKEN=your_github_token_here
```

#### Run Analysis
```bash
# Analyze an issue (display results only)
node scripts/workflows/dev-tools/enhance-github-issue.js 11

# Analyze and post comment to GitHub
node scripts/workflows/dev-tools/enhance-github-issue.js 11 --post-comment
```

#### Example Output
```
📊 ANALYSIS RESULTS
==================================================
🎯 Issue Type: workflow
📈 Completeness Score: 57% (8/14 checks passed)
⏱️  Estimated Effort: High - Significant details missing
🏷️  Suggested Labels: automation, ci-cd

❌ MISSING INFORMATION:
   • Workflow Requirements: Missing permissions and security considerations
   • Quality Requirements: Missing testing requirements and strategy
   
✅ WELL-DEFINED ASPECTS:
   • Clear, descriptive title
   • Purpose clearly stated
   • Requirements section provided
```

### Issue Type Detection
The system automatically detects issue types:
- **puzzle-type**: New puzzle generators or game mechanics
- **ui-feature**: React components and user interface
- **workflow**: GitHub Actions and automation
- **bug**: Bug reports and fixes
- **performance**: Optimization and performance improvements
- **testing**: Test-related issues
- **documentation**: Documentation updates

### Analysis Categories

#### Basic Requirements (4 checks)
- Descriptive title (10-100 characters)
- Substantial description (>50 characters)
- Clear purpose statement
- Requirements section

#### Type-Specific Requirements (varies by type)
- **Puzzle Types**: Interface specs, algorithms, difficulty progression
- **UI Features**: Component structure, props, responsive design
- **Workflows**: Triggers, permissions, security
- **Bugs**: Reproduction steps, expected vs actual behavior

#### Technical Requirements (4 checks)
- Concrete examples or code samples
- Integration details with existing codebase
- Dependency analysis
- Breaking change analysis

#### Quality Requirements (4 checks)
- Testing strategy and requirements
- Acceptance criteria checklist
- Accessibility considerations
- Performance requirements

### Generated Suggestions

#### For Puzzle Types
```typescript
// Suggested interface
export interface NewPuzzleType extends BasePuzzle {
  // Add specific properties here
  puzzleSpecificField?: string;
}

// Update union type
export type AnyPuzzle = PatternPuzzle | AnalogyPuzzle | SerialReasoningPuzzle | NewPuzzleType;
```

#### For UI Features
- React component structure templates
- Props interface definitions
- Styling and responsive design considerations
- Accessibility implementation guidance

#### For Workflows
- GitHub Actions YAML templates
- Permission and security configurations
- Error handling and monitoring setup

### Completeness Scoring
- **80-100%**: Ready for implementation (Low effort)
- **60-79%**: Needs clarification (Medium effort)  
- **40-59%**: Significant details missing (High effort)
- **0-39%**: Needs major revision (Very High effort)

### Labels Applied
The workflow automatically suggests and applies labels based on analysis:
- **Type labels**: `puzzle-type`, `ui`, `automation`, `bug`, etc.
- **Priority labels**: Based on completeness score
- **Status labels**: `needs-enhancement` → `ai-enhanced`

### Configuration
The workflow requires these environment variables:
- `GITHUB_TOKEN`: For GitHub API access (automatically available in Actions)
- `CLAUDE_CODE_OAUTH_TOKEN`: For advanced AI analysis (optional)

### Error Handling
- Gracefully handles API rate limits
- Validates issue existence and accessibility
- Provides helpful error messages for common issues
- Continues workflow even if some steps fail

## 🚀 Usage Examples

### Example 1: Analyzing Issue #11
```bash
$ node scripts/workflows/dev-tools/enhance-github-issue.js 11
🔍 Analyzing GitHub issue #11...
📋 Issue: "Create Workflow to Pull and Enhance GitHub Feature Requests"
👤 Author: 5hiel
🏷️  Labels: None
🔗 URL: https://github.com/5hiel/gifted-minds/issues/11

📊 ANALYSIS RESULTS
==================================================
🎯 Issue Type: workflow
📈 Completeness Score: 57% (8/14 checks passed)
⏱️  Estimated Effort: High - Significant details missing
```

### Example 2: Enhancing a Puzzle Type Issue
For issues about new puzzle types, the system provides:
- TypeScript interface templates
- Integration points with existing puzzle system
- Algorithm implementation guidance
- Testing strategy recommendations

### Example 3: UI Feature Analysis
For component-related issues, the system checks for:
- React component specifications
- Props interface definitions
- Responsive design considerations
- Accessibility requirements

## 🔧 Maintenance

### Updating Analysis Logic
To modify the analysis criteria:
1. Edit `scripts/workflows/dev-tools/enhance-github-issue.js`
2. Update the relevant analysis functions
3. Test with existing issues
4. Update this documentation

### Adding New Issue Types
1. Add detection logic in `detectIssueType()`
2. Create type-specific analysis in `analyzeTypeSpecificRequirements()`
3. Add suggestion templates
4. Update documentation

### Customizing for Other Projects
The workflow can be adapted for other projects by:
1. Updating repository configuration variables
2. Modifying the issue requirements checklist
3. Adjusting analysis criteria for project-specific needs
4. Customizing suggestion templates

---

*For more information about writing comprehensive issues, see the [Issue Requirements Checklist](./ISSUE_REQUIREMENTS_CHECKLIST.md).*