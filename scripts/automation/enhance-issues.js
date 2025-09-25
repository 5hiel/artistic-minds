#!/usr/bin/env node

/**
 * GitHub Issue Enhancement Script
 * 
 * Analyzes GitHub issues against the Gifted Minds Issue Requirements Checklist
 * and provides detailed enhancement suggestions.
 * 
 * Usage:
 *   node enhance-github-issue.js <issue-number>
 *   node enhance-github-issue.js 11
 * 
 * Requirements:
 *   - GITHUB_TOKEN environment variable (for API access)
 *   - Repository context (run from project root)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const REPO_OWNER = process.env.REPO_OWNER || '5hiel';
const REPO_NAME = process.env.REPO_NAME || 'gifted-minds';
const CHECKLIST_PATH = 'docs/ISSUE_REQUIREMENTS_CHECKLIST.md';

/**
 * Load project documentation and context for AI analysis
 */
function loadProjectContext() {
  const context = {
    documentation: {},
    codebase: {},
    structure: {}
  };

  try {
    // Load key documentation files
    const docFiles = [
      'CLAUDE.md',
      'docs/ISSUE_REQUIREMENTS_CHECKLIST.md',
      'docs/WORKFLOWS.md',
      'README.md'
    ];

    for (const file of docFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        context.documentation[file] = fs.readFileSync(filePath, 'utf8');
      }
    }

    // Load key codebase files for architecture understanding
    const codeFiles = [
      'lib/infinite-puzzle-generator.ts',
      'lib/basePuzzle.ts',
      'app/(tabs)/index.tsx',
      'package.json'
    ];

    for (const file of codeFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        context.codebase[file] = fs.readFileSync(filePath, 'utf8');
      }
    }

    // Get project structure
    context.structure.directories = getProjectStructure();

  } catch (error) {
    console.warn('⚠️  Could not load full project context:', error.message);
  }

  return context;
}

/**
 * Get project directory structure
 */
function getProjectStructure() {
  const structure = {};
  const relevantDirs = ['lib', 'components', 'hooks', 'app', 'docs'];
  
  for (const dir of relevantDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      structure[dir] = getDirectoryFiles(dirPath);
    }
  }
  
  return structure;
}

/**
 * Get files in a directory
 */
function getDirectoryFiles(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .slice(0, 20); // Limit to prevent too much data
  } catch (error) {
    return [];
  }
}

/**
 * Call Claude AI for intelligent issue enhancement
 */
async function callClaudeAI(prompt) {
  const claudeToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  
  if (!claudeToken) {
    console.log('ℹ️  CLAUDE_CODE_OAUTH_TOKEN not found, using rule-based analysis');
    return null;
  }

  const requestData = JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${claudeToken}`,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.content && response.content[0] && response.content[0].text) {
            resolve(response.content[0].text);
          } else {
            console.warn('⚠️  Unexpected Claude API response format');
            resolve(null);
          }
        } catch (error) {
          console.warn('⚠️  Error parsing Claude API response:', error.message);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.warn('⚠️  Error calling Claude API:', error.message);
      resolve(null);
    });

    req.write(requestData);
    req.end();
  });
}

/**
 * Main function to enhance a GitHub issue
 */
async function enhanceIssue(issueNumber) {
  // Dynamic import for ES module
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
  try {
    console.log(`🔍 Analyzing GitHub issue #${issueNumber}...`);
    
    // Fetch issue details
    const { data: issue } = await octokit.issues.get({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: parseInt(issueNumber),
    });
    
    console.log(`📋 Issue: "${issue.title}"`);
    console.log(`👤 Author: ${issue.user.login}`);
    console.log(`🏷️  Labels: ${issue.labels.map(label => label.name).join(', ') || 'None'}`);
    console.log(`🔗 URL: ${issue.html_url}`);
    console.log('');
    
    // Load project context and checklist for analysis
    console.log('📚 Loading project context...');
    const projectContext = loadProjectContext();
    
    const checklistPath = path.join(process.cwd(), CHECKLIST_PATH);
    let checklist = '';
    try {
      checklist = fs.readFileSync(checklistPath, 'utf8');
    } catch (error) {
      console.warn(`⚠️  Could not load checklist from ${checklistPath}`);
    }
    
    // Try AI-enhanced analysis first, fall back to rule-based
    let analysis;
    console.log('🤖 Attempting AI-enhanced analysis...');
    const aiAnalysis = await performAIAnalysis(issue, projectContext, checklist);
    
    if (aiAnalysis) {
      console.log('✅ Using AI-enhanced analysis');
      analysis = aiAnalysis;
    } else {
      console.log('🔧 Falling back to rule-based analysis');
      analysis = analyzeIssueCompleteness(issue, checklist);
    }
    
    // Display results
    displayAnalysisResults(analysis);
    
    // Always rewrite the issue with enhanced details
    const enhancedIssue = generateEnhancedIssue(issue, analysis);
    
    if (enhancedIssue.body !== issue.body) {
      await updateIssueWithEnhancements(octokit, issueNumber, enhancedIssue);
      console.log('✅ Issue updated with enhanced details');
    } else {
      console.log('ℹ️  Issue already contains comprehensive details');
    }
    
    // Optionally post analysis as comment
    if (process.argv.includes('--post-comment')) {
      await postEnhancementComment(octokit, issueNumber, analysis);
      console.log('✅ Enhancement comment posted to GitHub issue');
    }
    
  } catch (error) {
    console.error('❌ Error enhancing issue:', error.message);
    if (error.status === 404) {
      console.error('   Issue not found. Check the issue number and repository access.');
    } else if (error.status === 401) {
      console.error('   Authentication failed. Check your GITHUB_TOKEN environment variable.');
    }
    process.exit(1);
  }
}

/**
 * Perform AI-enhanced analysis using Claude
 */
async function performAIAnalysis(issue, projectContext, checklist) {
  try {
    const prompt = `You are an expert software engineering assistant analyzing a GitHub issue for the "Gifted Minds" puzzle game project. 

**PROJECT CONTEXT:**
This is a React Native Expo app built with TypeScript. Key architecture:
- Puzzle system: Pattern recognition, analogies, serial reasoning
- Tech stack: React Native, Expo Router, TypeScript
- State management: React hooks (useState/useEffect)
- File structure: app/ (Expo Router), lib/ (game logic), components/ (UI)

**PROJECT DOCUMENTATION:**
${Object.entries(projectContext.documentation).map(([file, content]) => 
  `--- ${file} ---\n${content.substring(0, 2000)}...\n`).join('\n')}

**CODEBASE STRUCTURE:**
${JSON.stringify(projectContext.structure, null, 2)}

**ISSUE REQUIREMENTS CHECKLIST:**
${checklist.substring(0, 3000)}...

**ISSUE TO ANALYZE:**
Title: ${issue.title}
Body: ${issue.body || 'No description provided'}
Author: ${issue.user.login}
Labels: ${issue.labels.map(label => label.name).join(', ') || 'None'}

**ANALYSIS TASK:**
Create SPECIFIC, ACTIONABLE todo items based on what's actually needed for this particular issue. Provide a JSON response with this structure:

\`\`\`json
{
  "issueType": "puzzle-type|ui-feature|workflow|bug|performance|documentation|generic",
  "completenessScore": 85,
  "totalChecks": 14,
  "actionableTodos": [
    {
      "priority": "high|medium|low",
      "category": "Research|Design|Implementation|Testing|Documentation",
      "task": "Research existing pattern recognition algorithms in lib/patternPuzzles.ts",
      "reason": "Need to understand current implementation before adding new puzzle type",
      "files": ["lib/patternPuzzles.ts", "lib/infinite-puzzle-generator.ts"],
      "estimatedTime": "2 hours"
    }
  ],
  "specificInsights": [
    {
      "finding": "Issue mentions 'infinite analogies' but doesn't specify how they differ from existing analogyPuzzles.ts",
      "action": "Define unique characteristics and provide 3 concrete examples",
      "impact": "Without this, implementation will be generic and not truly 'infinite'"
    }
  ],
  "codeReferences": [
    {
      "file": "lib/infinite-puzzle-generator.ts",
      "line": "42-58",
      "suggestion": "Add new puzzle type to PuzzleType enum and weighted selection"
    }
  ],
  "suggestedLabels": ["puzzle-type", "enhancement"],
  "estimatedEffort": "Medium - 1-2 days with clarifications",
  "readyToImplement": false,
  "blockingQuestions": [
    "What makes these analogies 'infinite' vs current analogyPuzzles.ts?",
    "Should this extend existing analogies or be a separate puzzle type?"
  ]
}
\`\`\`

Focus on:
1. Understanding the specific codebase architecture (infinite-puzzle-generator.ts, BasePuzzle, etc.)
2. Identifying what's missing based on our 19-category checklist
3. Providing project-specific suggestions with actual file names and integration points
4. Generating enhanced content that preserves existing information while filling gaps

Respond ONLY with the JSON - no other text.`;

    const aiResponse = await callClaudeAI(prompt);
    
    if (aiResponse) {
      try {
        // Extract JSON from response (in case there's additional text)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          // Validate the response has required fields
          if (analysis.issueType && analysis.completenessScore !== undefined) {
            // Convert suggestedLabels to Set for consistency with rule-based analysis
            analysis.suggestedLabels = new Set(analysis.suggestedLabels || []);
            // Ensure we have the new actionable structure
            analysis.actionableTodos = analysis.actionableTodos || [];
            analysis.specificInsights = analysis.specificInsights || [];
            analysis.codeReferences = analysis.codeReferences || [];
            analysis.blockingQuestions = analysis.blockingQuestions || [];
            return analysis;
          }
        }
      } catch (parseError) {
        console.warn('⚠️  Error parsing AI analysis response:', parseError.message);
      }
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️  Error in AI analysis:', error.message);
    return null;
  }
}

/**
 * Generate enhanced issue content with actionable todos and insights
 */
function generateEnhancedIssue(issue, analysis) {
  const title = issue.title;
  const originalBody = issue.body || '';
  
  // Check if this is AI analysis with actionable todos
  if (analysis.actionableTodos && analysis.actionableTodos.length > 0) {
    return generateActionableEnhancement(issue, originalBody, analysis);
  }
  
  // Fall back to basic enhancement for rule-based analysis
  return generateBasicEnhancement(issue, originalBody, analysis);
}

/**
 * Generate actionable enhancement with specific todos and insights
 */
function generateActionableEnhancement(issue, originalBody, analysis) {
  let enhancedBody = originalBody + '\n\n---\n\n';
  
  enhancedBody += `## 🤖 AI Analysis & Action Plan\n\n`;
  enhancedBody += `**Issue Type:** ${analysis.issueType} | **Completeness:** ${analysis.completenessScore}% | **Ready to Implement:** ${analysis.readyToImplement ? '✅ Yes' : '❌ No'}\n\n`;
  
  // Blocking questions first
  if (analysis.blockingQuestions && analysis.blockingQuestions.length > 0) {
    enhancedBody += `### 🚫 Blocking Questions (Must resolve first)\n\n`;
    analysis.blockingQuestions.forEach((question, index) => {
      enhancedBody += `${index + 1}. **${question}**\n`;
    });
    enhancedBody += '\n';
  }
  
  // Specific insights
  if (analysis.specificInsights && analysis.specificInsights.length > 0) {
    enhancedBody += `### 💡 Key Insights\n\n`;
    analysis.specificInsights.forEach((insight, index) => {
      enhancedBody += `**${insight.finding}**\n`;
      enhancedBody += `→ *Action:* ${insight.action}\n`;
      enhancedBody += `→ *Impact:* ${insight.impact}\n\n`;
    });
  }
  
  // Actionable todos by priority
  if (analysis.actionableTodos && analysis.actionableTodos.length > 0) {
    const todosByPriority = {
      high: analysis.actionableTodos.filter(t => t.priority === 'high'),
      medium: analysis.actionableTodos.filter(t => t.priority === 'medium'),
      low: analysis.actionableTodos.filter(t => t.priority === 'low')
    };
    
    ['high', 'medium', 'low'].forEach(priority => {
      const todos = todosByPriority[priority];
      if (todos.length > 0) {
        const emoji = priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '📝';
        enhancedBody += `### ${emoji} ${priority.toUpperCase()} Priority Tasks\n\n`;
        
        todos.forEach((todo, index) => {
          enhancedBody += `**${index + 1}. ${todo.task}**\n`;
          enhancedBody += `- *Why:* ${todo.reason}\n`;
          enhancedBody += `- *Category:* ${todo.category}\n`;
          enhancedBody += `- *Est. Time:* ${todo.estimatedTime}\n`;
          if (todo.files && todo.files.length > 0) {
            enhancedBody += `- *Files:* ${todo.files.map(f => '`' + f + '`').join(', ')}\n`;
          }
          enhancedBody += '\n';
        });
      }
    });
  }
  
  // Code references
  if (analysis.codeReferences && analysis.codeReferences.length > 0) {
    enhancedBody += `### 📂 Specific Code References\n\n`;
    analysis.codeReferences.forEach(ref => {
      enhancedBody += `**${ref.file}${ref.line ? ':' + ref.line : ''}**\n`;
      enhancedBody += `${ref.suggestion}\n\n`;
    });
  }
  
  enhancedBody += `---\n*Enhanced by AI Issue Analysis System*`;
  
  return {
    title: issue.title,
    body: enhancedBody
  };
}

/**
 * Generate basic enhancement for rule-based analysis
 */
function generateBasicEnhancement(issue, originalBody, analysis) {
  let enhancedBody = originalBody + '\n\n---\n\n';
  
  enhancedBody += `## 📊 Issue Analysis\n\n`;
  enhancedBody += `**Type:** ${analysis.issueType} | **Score:** ${analysis.completenessScore}%\n\n`;
  
  if (analysis.gaps.length > 0) {
    enhancedBody += `### Missing Information:\n`;
    analysis.gaps.forEach(gap => {
      enhancedBody += `- **${gap.category}:** ${gap.description}\n`;
    });
    enhancedBody += '\n';
  }
  
  if (analysis.nextSteps.length > 0) {
    enhancedBody += `### Next Steps:\n`;
    analysis.nextSteps.forEach((step, index) => {
      enhancedBody += `${index + 1}. ${step}\n`;
    });
  }
  
  return {
    title: issue.title,
    body: enhancedBody
  };
}

/**
 * Update GitHub issue with enhanced content
 */
async function updateIssueWithEnhancements(octokit, issueNumber, enhancedIssue) {
  await octokit.issues.update({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: parseInt(issueNumber),
    title: enhancedIssue.title,
    body: enhancedIssue.body
  });
}

/**
 * Generate enhanced template for puzzle-type issues
 */
function generatePuzzleTypeTemplate(originalBody, analysis) {
  const sections = parseExistingContent(originalBody);
  
  let template = `## 🎯 Puzzle Feature Description
${sections.description || '[Please describe the new puzzle type and its purpose]'}

## 🎮 User Value
${sections.userValue || 'Why is this puzzle type important for the game experience?'}

## 📝 Detailed Requirements

### Puzzle Specifications
${sections.puzzleSpecs || `- [ ] **Puzzle Category**: [e.g., pattern recognition, reasoning, math]
- [ ] **Question Format**: [Describe how questions are presented]
- [ ] **Answer Format**: [multiple choice, grid-based, text input, etc.]
- [ ] **Difficulty Progression**: [How difficulty scales across levels]
- [ ] **Educational Objectives**: [Cognitive skills being tested]`}

### Technical Requirements
${sections.technicalReqs || `- [ ] **TypeScript Interface**:
\`\`\`typescript
export interface NewPuzzleType extends BasePuzzle {
  // Add specific properties here
  puzzleSpecificField?: string;
}
\`\`\`
- [ ] **Integration Points**: Update \`infinite-puzzle-generator.ts\`
- [ ] **Algorithm**: Step-by-step puzzle generation logic
- [ ] **Validation Rules**: Ensure generated puzzles are solvable`}

## 💡 Examples
${sections.examples || `\`\`\`typescript
// Example puzzle generation
const examplePuzzle = {
  question: "Example question here",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswerIndex: 0,
  explanation: "Explanation of correct answer"
};
\`\`\``}

## 🏗️ Implementation Plan
${sections.implementation || `### Files to Create/Modify:
- [ ] \`lib/newPuzzleType.ts\` - New puzzle generator
- [ ] \`lib/infinite-puzzle-generator.ts\` - Add to puzzle types
- [ ] \`types/puzzles.ts\` - Update type definitions

### Integration Steps:
1. [ ] Create puzzle generator class extending BasePuzzleGenerator
2. [ ] Implement generation algorithm with difficulty scaling
3. [ ] Add to infinite generator configuration
4. [ ] Update type definitions and exports`}

## 🧪 Testing & Validation
${sections.testing || `- [ ] **Unit Tests**: Test puzzle generation algorithm
- [ ] **Validation Tests**: Ensure all generated puzzles are solvable
- [ ] **Difficulty Tests**: Verify difficulty progression works
- [ ] **Integration Tests**: Test with infinite generator`}

## ✅ Acceptance Criteria
${sections.acceptance || `- [ ] User can play the new puzzle type in the game
- [ ] Puzzles generate with appropriate difficulty scaling
- [ ] All generated puzzles are valid and solvable
- [ ] Performance meets requirements (<100ms generation time)
- [ ] Integrates seamlessly with existing scoring system`}

---
*This issue was enhanced by the AI Issue Analysis system*`;

  return template;
}

/**
 * Generate enhanced template for UI feature issues
 */
function generateUIFeatureTemplate(originalBody, analysis) {
  const sections = parseExistingContent(originalBody);
  
  let template = `## 🎯 UI Feature Description
${sections.description || '[Please describe the UI feature and its purpose]'}

## 🎮 User Value
${sections.userValue || 'How does this improve the user experience?'}

## 📝 Component Specifications

### React Component Structure
${sections.componentSpecs || `- [ ] **Component Name**: \`NewComponent\`
- [ ] **Props Interface**:
\`\`\`typescript
interface NewComponentProps {
  // Define props here
}
\`\`\`
- [ ] **State Requirements**: [What state needs to be managed]
- [ ] **Event Handlers**: [User interactions to handle]`}

### Visual Design
${sections.visualDesign || `- [ ] **Layout**: [Describe component layout]
- [ ] **Styling**: [Colors, fonts, spacing requirements]
- [ ] **Responsive Design**: [Mobile, tablet, desktop behavior]
- [ ] **Animations**: [Any transitions or animations needed]`}

## 💡 Examples & Mockups
${sections.examples || `[Add screenshots, mockups, or code examples here]

\`\`\`typescript
// Example usage
<NewComponent 
  prop1={value1}
  prop2={value2}
  onAction={handleAction}
/>
\`\``}

## 🏗️ Implementation Plan
${sections.implementation || `### Files to Create/Modify:
- [ ] \`components/NewComponent.tsx\` - Main component
- [ ] \`hooks/useNewComponent.ts\` - Component logic (if needed)
- [ ] \`app/(tabs)/index.tsx\` - Integration point

### Implementation Steps:
1. [ ] Create component with TypeScript interface
2. [ ] Implement responsive styling
3. [ ] Add accessibility features
4. [ ] Integrate with existing app structure`}

## 🧪 Testing & Accessibility
${sections.testing || `- [ ] **Component Tests**: Unit tests for component behavior
- [ ] **Accessibility Tests**: Screen reader compatibility
- [ ] **Responsive Tests**: Mobile, tablet, desktop layouts
- [ ] **User Testing**: Usability validation`}

## ✅ Acceptance Criteria
${sections.acceptance || `- [ ] Component renders correctly on all supported devices
- [ ] Accessibility standards met (WCAG 2.1)
- [ ] Performance impact is minimal
- [ ] Integrates seamlessly with existing UI
- [ ] User interactions work as expected`}

---
*This issue was enhanced by the AI Issue Analysis system*`;

  return template;
}

/**
 * Generate enhanced template for workflow issues
 */
function generateWorkflowTemplate(originalBody, analysis) {
  const sections = parseExistingContent(originalBody);
  
  let template = `## 🎯 Workflow Description
${sections.description || '[Please describe the workflow/automation and its purpose]'}

## 🎮 Value & Benefits
${sections.userValue || 'How does this workflow improve development/deployment process?'}

## ⚙️ Workflow Specifications

### Triggers & Events
${sections.triggers || `- [ ] **Trigger Events**: [on push, pull request, schedule, manual dispatch, etc.]
- [ ] **Branch Filters**: [Which branches should trigger this workflow]
- [ ] **Path Filters**: [Specific files/directories that trigger workflow]`}

### Permissions & Security
${sections.permissions || `- [ ] **Required Permissions**: 
  - \`contents: read\`
  - \`issues: write\` (if needed)
  - \`actions: write\` (if needed)
- [ ] **Secrets Needed**: [List any secrets required]
- [ ] **Security Considerations**: [Security implications and mitigations]`}

## 💡 Workflow Configuration
${sections.examples || `\`\`\`yaml
name: New Workflow
on:
  push:
    branches: [main]
  pull_request:

jobs:
  example-job:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # Add workflow steps here
\`\``}

## 🏗️ Implementation Plan
${sections.implementation || `### Files to Create/Modify:
- [ ] \`.github/workflows/new-workflow.yml\` - Main workflow file
- [ ] \`scripts/workflow-script.js\` - Supporting script (if needed)

### Implementation Steps:
1. [ ] Define workflow triggers and permissions
2. [ ] Create job steps and actions
3. [ ] Add error handling and notifications
4. [ ] Test workflow in development environment`}

## 🧪 Testing & Monitoring
${sections.testing || `- [ ] **Workflow Tests**: Test with different trigger scenarios
- [ ] **Error Handling**: Verify failure scenarios are handled
- [ ] **Performance**: Ensure workflow completes in reasonable time
- [ ] **Monitoring**: Add logging and notifications for failures`}

## ✅ Acceptance Criteria
${sections.acceptance || `- [ ] Workflow triggers on specified events
- [ ] All steps execute successfully
- [ ] Error handling works correctly
- [ ] Performance meets requirements
- [ ] Documentation is updated`}

---
*This issue was enhanced by the AI Issue Analysis system*`;

  return template;
}

/**
 * Generate enhanced template for bug reports
 */
function generateBugTemplate(originalBody, analysis) {
  const sections = parseExistingContent(originalBody);
  
  let template = `## 🐛 Bug Description
${sections.description || '[Please describe the bug and its impact]'}

## 🔍 Steps to Reproduce
${sections.reproduction || `1. [First step]
2. [Second step]  
3. [Third step]
4. [See error]`}

## 💥 Expected vs Actual Behavior
${sections.expectedBehavior || `**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]`}

## 🖥️ Environment Information
${sections.environment || `- **Platform**: [iOS/Android/Web/All]
- **Device**: [Device model if relevant]
- **App Version**: [Version number]
- **Browser**: [If web-related]
- **Node.js Version**: [If development-related]`}

## 📷 Screenshots/Logs
${sections.screenshots || '[Add screenshots, error logs, or console output here]'}

## 🏗️ Investigation & Fix Plan
${sections.implementation || `### Root Cause Analysis:
- [ ] [Identify the root cause]

### Files to Investigate/Modify:
- [ ] [List relevant files]

### Proposed Solution:
- [ ] [Describe the fix approach]`}

## 🧪 Testing Plan
${sections.testing || `- [ ] **Reproduction Test**: Verify bug can be reproduced
- [ ] **Fix Validation**: Confirm fix resolves the issue
- [ ] **Regression Tests**: Ensure fix doesn't break other functionality
- [ ] **Cross-Platform Tests**: Test on all supported platforms`}

## ✅ Acceptance Criteria
${sections.acceptance || `- [ ] Bug no longer occurs following reproduction steps
- [ ] No regressions introduced
- [ ] Fix works across all supported platforms
- [ ] Performance impact is acceptable`}

---
*This issue was enhanced by the AI Issue Analysis system*`;

  return template;
}

/**
 * Generate enhanced template for generic issues
 */
function generateGenericTemplate(originalBody, analysis) {
  const sections = parseExistingContent(originalBody);
  
  let template = `## 🎯 Feature/Issue Description
${sections.description || '[Please provide a clear description of what needs to be done]'}

## 🎮 Purpose & Value
${sections.userValue || 'Why is this important? What value does it provide?'}

## 📝 Detailed Requirements
${sections.requirements || `- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]`}

## 💡 Examples & Details
${sections.examples || '[Add specific examples, code samples, or detailed explanations here]'}

## 🏗️ Implementation Plan
${sections.implementation || `### Files to Create/Modify:
- [ ] [List files that need changes]

### Implementation Steps:
1. [ ] [Step 1]
2. [ ] [Step 2]
3. [ ] [Step 3]`}

## 🧪 Testing Requirements
${sections.testing || `- [ ] [Testing requirement 1]
- [ ] [Testing requirement 2]`}

## ✅ Acceptance Criteria
${sections.acceptance || `- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]`}

---
*This issue was enhanced by the AI Issue Analysis system*`;

  return template;
}

/**
 * Parse existing issue content to preserve what's already there
 */
function parseExistingContent(body) {
  const sections = {};
  
  // Simple parsing - look for existing sections
  const lines = body.split('\n');
  let currentSection = 'description';
  let currentContent = [];
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Detect section type
      if (trimmed.includes('purpose') || trimmed.includes('value')) {
        currentSection = 'userValue';
      } else if (trimmed.includes('example') || trimmed.includes('code')) {
        currentSection = 'examples';
      } else if (trimmed.includes('implementation') || trimmed.includes('plan')) {
        currentSection = 'implementation';
      } else if (trimmed.includes('test') || trimmed.includes('validation')) {
        currentSection = 'testing';
      } else if (trimmed.includes('acceptance') || trimmed.includes('criteria')) {
        currentSection = 'acceptance';
      } else if (trimmed.includes('requirement')) {
        currentSection = 'requirements';
      } else {
        currentSection = 'other';
      }
      
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

/**
 * Analyze issue completeness against our checklist
 */
function analyzeIssueCompleteness(issue, checklist) {
  const title = issue.title.toLowerCase();
  const body = issue.body || '';
  const bodyLower = body.toLowerCase();
  
  const analysis = {
    issueType: detectIssueType(title, body),
    completenessScore: 0,
    totalChecks: 0,
    gaps: [],
    suggestions: [],
    strengths: [],
    nextSteps: [],
    suggestedLabels: new Set(),
    estimatedEffort: 'Unknown'
  };
  
  // Analyze based on issue type
  analyzeBasicRequirements(analysis, title, body);
  analyzeTypeSpecificRequirements(analysis, title, body);
  analyzeTechnicalRequirements(analysis, title, body);
  analyzeQualityRequirements(analysis, title, body);
  
  // Calculate completeness score
  analysis.completenessScore = Math.round((analysis.totalChecks - analysis.gaps.length) / analysis.totalChecks * 100);
  
  // Generate recommendations
  generateRecommendations(analysis);
  
  return analysis;
}

/**
 * Detect the type of issue based on title and content
 */
function detectIssueType(title, body) {
  const titleLower = title.toLowerCase();
  const bodyLower = body.toLowerCase();
  
  if (titleLower.includes('bug') || titleLower.includes('fix') || titleLower.includes('error')) {
    return 'bug';
  } else if (titleLower.includes('puzzle') || titleLower.includes('analogy') || titleLower.includes('pattern')) {
    return 'puzzle-type';
  } else if (titleLower.includes('ui') || titleLower.includes('component') || titleLower.includes('interface')) {
    return 'ui-feature';
  } else if (titleLower.includes('workflow') || titleLower.includes('automation') || titleLower.includes('ci')) {
    return 'workflow';
  } else if (titleLower.includes('performance') || titleLower.includes('optimization')) {
    return 'performance';
  } else if (titleLower.includes('test') || titleLower.includes('testing')) {
    return 'testing';
  } else if (titleLower.includes('doc') || titleLower.includes('documentation')) {
    return 'documentation';
  }
  
  return 'feature';
}

/**
 * Analyze basic requirements that apply to all issues
 */
function analyzeBasicRequirements(analysis, title, body) {
  const checks = [
    {
      condition: title.length > 10 && title.length < 100,
      success: 'Clear, descriptive title',
      failure: 'Title should be descriptive (10-100 characters)',
      category: 'Basic Requirements'
    },
    {
      condition: body.length > 50,
      success: 'Substantial description provided',
      failure: 'Description is too brief (needs more detail)',
      category: 'Basic Requirements'
    },
    {
      condition: body.includes('Purpose') || body.includes('**Purpose') || body.includes('## Purpose'),
      success: 'Purpose clearly stated',
      failure: 'Missing clear purpose statement',
      category: 'Basic Requirements'
    },
    {
      condition: body.includes('Requirements') || body.includes('**Requirements') || body.includes('## Requirements'),
      success: 'Requirements section provided',
      failure: 'Missing requirements section',
      category: 'Basic Requirements'
    }
  ];
  
  processChecks(analysis, checks);
}

/**
 * Analyze requirements specific to the detected issue type
 */
function analyzeTypeSpecificRequirements(analysis, title, body) {
  let checks = [];
  
  switch (analysis.issueType) {
    case 'puzzle-type':
      checks = [
        {
          condition: body.includes('interface') || body.includes('Interface'),
          success: 'TypeScript interface considerations mentioned',
          failure: 'Missing TypeScript interface specification',
          category: 'Puzzle Type Requirements'
        },
        {
          condition: body.includes('algorithm') || body.includes('Algorithm'),
          success: 'Algorithm details provided',
          failure: 'Missing algorithm or generation logic details',
          category: 'Puzzle Type Requirements'
        },
        {
          condition: body.includes('difficulty') || body.includes('Difficulty'),
          success: 'Difficulty progression considered',
          failure: 'Missing difficulty scaling strategy',
          category: 'Puzzle Type Requirements'
        }
      ];
      analysis.suggestedLabels.add('puzzle-type');
      analysis.suggestedLabels.add('feature');
      break;
      
    case 'ui-feature':
      checks = [
        {
          condition: body.includes('component') || body.includes('Component'),
          success: 'Component structure mentioned',
          failure: 'Missing React component specifications',
          category: 'UI Feature Requirements'
        },
        {
          condition: body.includes('props') || body.includes('Props') || body.includes('interface'),
          success: 'Props/interface considerations included',
          failure: 'Missing props interface definition',
          category: 'UI Feature Requirements'
        },
        {
          condition: body.includes('responsive') || body.includes('mobile'),
          success: 'Responsive design considered',
          failure: 'Missing responsive design requirements',
          category: 'UI Feature Requirements'
        }
      ];
      analysis.suggestedLabels.add('ui');
      analysis.suggestedLabels.add('component');
      break;
      
    case 'workflow':
      checks = [
        {
          condition: body.includes('trigger') || body.includes('Trigger'),
          success: 'Workflow triggers specified',
          failure: 'Missing workflow trigger specifications',
          category: 'Workflow Requirements'
        },
        {
          condition: body.includes('permissions') || body.includes('Permissions'),
          success: 'Permissions considered',
          failure: 'Missing permissions and security considerations',
          category: 'Workflow Requirements'
        }
      ];
      analysis.suggestedLabels.add('automation');
      analysis.suggestedLabels.add('ci-cd');
      break;
      
    case 'bug':
      checks = [
        {
          condition: body.includes('reproduce') || body.includes('Reproduce') || body.includes('steps'),
          success: 'Reproduction steps provided',
          failure: 'Missing steps to reproduce the bug',
          category: 'Bug Report Requirements'
        },
        {
          condition: body.includes('expected') || body.includes('Expected'),
          success: 'Expected behavior described',
          failure: 'Missing expected vs actual behavior description',
          category: 'Bug Report Requirements'
        }
      ];
      analysis.suggestedLabels.add('bug');
      break;
  }
  
  processChecks(analysis, checks);
}

/**
 * Analyze technical implementation requirements
 */
function analyzeTechnicalRequirements(analysis, title, body) {
  const checks = [
    {
      condition: body.includes('```') || body.includes('Example:') || body.includes('example'),
      success: 'Code examples or concrete examples provided',
      failure: 'Missing concrete examples or code samples',
      category: 'Technical Requirements'
    },
    {
      condition: body.includes('integration') || body.includes('Integration'),
      success: 'Integration considerations mentioned',
      failure: 'Missing integration details with existing codebase',
      category: 'Technical Requirements'
    },
    {
      condition: body.includes('dependencies') || body.includes('Dependencies'),
      success: 'Dependencies considered',
      failure: 'Missing dependency analysis',
      category: 'Technical Requirements'
    },
    {
      condition: body.includes('breaking') || body.includes('Breaking'),
      success: 'Breaking changes considered',
      failure: 'Missing breaking change analysis',
      category: 'Technical Requirements'
    }
  ];
  
  processChecks(analysis, checks);
}

/**
 * Analyze quality and testing requirements
 */
function analyzeQualityRequirements(analysis, title, body) {
  const checks = [
    {
      condition: body.includes('test') || body.includes('Test'),
      success: 'Testing considerations included',
      failure: 'Missing testing requirements and strategy',
      category: 'Quality Requirements'
    },
    {
      condition: body.includes('acceptance') || body.includes('Acceptance') || body.includes('- [ ]'),
      success: 'Acceptance criteria provided',
      failure: 'Missing acceptance criteria checklist',
      category: 'Quality Requirements'
    },
    {
      condition: body.includes('accessibility') || body.includes('Accessibility'),
      success: 'Accessibility considered',
      failure: 'Missing accessibility requirements',
      category: 'Quality Requirements'
    },
    {
      condition: body.includes('performance') || body.includes('Performance'),
      success: 'Performance considerations included',
      failure: 'Missing performance requirements',
      category: 'Quality Requirements'
    }
  ];
  
  processChecks(analysis, checks);
}

/**
 * Process a set of checks and update analysis
 */
function processChecks(analysis, checks) {
  checks.forEach(check => {
    analysis.totalChecks++;
    if (check.condition) {
      analysis.strengths.push(check.success);
    } else {
      analysis.gaps.push({
        category: check.category,
        description: check.failure
      });
    }
  });
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis) {
  // Estimate effort based on completeness and complexity
  if (analysis.completenessScore >= 80) {
    analysis.estimatedEffort = 'Low - Ready for implementation';
  } else if (analysis.completenessScore >= 60) {
    analysis.estimatedEffort = 'Medium - Needs clarification';
  } else if (analysis.completenessScore >= 40) {
    analysis.estimatedEffort = 'High - Significant details missing';
  } else {
    analysis.estimatedEffort = 'Very High - Needs major revision';
  }
  
  // Generate specific suggestions based on issue type
  if (analysis.issueType === 'puzzle-type') {
    analysis.suggestions.push({
      title: 'TypeScript Interface Template',
      content: `\`\`\`typescript
export interface NewPuzzleType extends BasePuzzle {
  // Add specific properties here
  puzzleSpecificField?: string;
}

// Update union type
export type AnyPuzzle = PatternPuzzle | AnalogyPuzzle | SerialReasoningPuzzle | NewPuzzleType;
\`\`\``
    });
  }
  
  // Generate next steps
  analysis.nextSteps = [
    'Address the missing information gaps listed above',
    'Add concrete examples with actual data/code',
    'Define measurable acceptance criteria',
    'Specify technical integration points',
    'Consider testing strategy and edge cases'
  ];
  
  if (analysis.completenessScore < 70) {
    analysis.nextSteps.unshift('Review the Issue Requirements Checklist for comprehensive guidance');
  }
}

/**
 * Display analysis results in a formatted way
 */
function displayAnalysisResults(analysis) {
  console.log('📊 ANALYSIS RESULTS');
  console.log('='.repeat(50));
  console.log(`🎯 Issue Type: ${analysis.issueType}`);
  console.log(`📈 Completeness Score: ${analysis.completenessScore}% (${analysis.totalChecks - analysis.gaps.length}/${analysis.totalChecks} checks passed)`);
  console.log(`⏱️  Estimated Effort: ${analysis.estimatedEffort}`);
  console.log(`🏷️  Suggested Labels: ${[...analysis.suggestedLabels].join(', ') || 'None'}`);
  console.log('');
  
  if (analysis.gaps.length > 0) {
    console.log('❌ MISSING INFORMATION:');
    analysis.gaps.forEach(gap => {
      console.log(`   • ${gap.category}: ${gap.description}`);
    });
    console.log('');
  }
  
  if (analysis.strengths.length > 0) {
    console.log('✅ WELL-DEFINED ASPECTS:');
    analysis.strengths.forEach(strength => {
      console.log(`   • ${strength}`);
    });
    console.log('');
  }
  
  if (analysis.suggestions.length > 0) {
    console.log('💡 ENHANCEMENT SUGGESTIONS:');
    analysis.suggestions.forEach(suggestion => {
      console.log(`   ${suggestion.title}:`);
      console.log(`   ${suggestion.content.split('\n').join('\n   ')}`);
      console.log('');
    });
  }
  
  if (analysis.nextSteps.length > 0) {
    console.log('📋 RECOMMENDED NEXT STEPS:');
    analysis.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    console.log('');
  }
}

/**
 * Post enhancement comment to GitHub issue
 */
async function postEnhancementComment(octokit, issueNumber, analysis) {
  const comment = `## 🤖 AI-Enhanced Issue Analysis

Based on our [Issue Requirements Checklist](./docs/ISSUE_REQUIREMENTS_CHECKLIST.md):

**📊 Analysis Results:**
- **Issue Type:** ${analysis.issueType}
- **Completeness Score:** ${analysis.completenessScore}% (${analysis.totalChecks - analysis.gaps.length}/${analysis.totalChecks} checks passed)
- **Estimated Effort:** ${analysis.estimatedEffort}

${analysis.gaps.length > 0 ? `
### ❌ Missing Information:
${analysis.gaps.map(gap => `- **${gap.category}**: ${gap.description}`).join('\n')}
` : ''}

${analysis.suggestions.length > 0 ? `
### 💡 Enhancement Suggestions:
${analysis.suggestions.map(suggestion => `
#### ${suggestion.title}
${suggestion.content}
`).join('\n')}
` : ''}

### ✅ Well-Defined Aspects:
${analysis.strengths.map(strength => `- ${strength}`).join('\n')}

### 📋 Recommended Next Steps:
${analysis.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

${[...analysis.suggestedLabels].length > 0 ? `
**🏷️ Suggested Labels:** ${[...analysis.suggestedLabels].join(', ')}
` : ''}

---
*This analysis was generated automatically using the Gifted Minds Issue Requirements Checklist*`;

  await octokit.issues.createComment({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: parseInt(issueNumber),
    body: comment,
  });
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 GitHub Issue Enhancement Tool

Usage:
  node enhance-github-issue.js <issue-number> [--post-comment]

Arguments:
  issue-number    The GitHub issue number to analyze

Options:
  --post-comment  Post the analysis as a comment on the GitHub issue
  --help, -h      Show this help message

Environment Variables:
  GITHUB_TOKEN    Required for GitHub API access

Examples:
  node enhance-github-issue.js 11
  node enhance-github-issue.js 10 --post-comment
`);
    return;
  }
  
  const issueNumber = args[0];
  
  if (!/^\d+$/.test(issueNumber)) {
    console.error('❌ Error: Issue number must be a positive integer');
    process.exit(1);
  }
  
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    console.error('   Get a token from: https://github.com/settings/tokens');
    process.exit(1);
  }
  
  enhanceIssue(issueNumber);
}

// Handle both direct execution and module import
if (require.main === module) {
  main();
}

module.exports = { analyzeIssueCompleteness, enhanceIssue };