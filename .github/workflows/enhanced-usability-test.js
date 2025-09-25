const { chromium } = require('playwright');
const fs = require('fs');

async function runEnhancedUsabilityTest() {
  console.log('🎮 Starting enhanced usability test with strategic assertions...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const results = {
    success: true,
    puzzlesSeen: 0,
    puzzleTypes: new Set(),
    screenshots: [],
    errors: [],
    performance: {},
    accessibility: {},
    validationResults: {
      powerSurgeWorking: false,
      correctAnswerFeedback: false,
      wrongAnswerFeedback: false,
      shareScreenWorking: false,
      powerUpButtonsWorking: false,
      scoreFlashing: false,
      gameLoadsSuccessfully: false,
      puzzleInteractionWorks: false
    }
  };

  // Helper function for strategic screenshot capture with organized folder structure
  async function captureKeyMoment(momentName, description) {
    const fs = require('fs');
    const prNumber = process.env.GITHUB_PR_NUMBER || 'local';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const testRunFolder = `screenshots/pr-${prNumber}/${timestamp}`;

    // Ensure directory exists
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots', { recursive: true });
    }
    if (!fs.existsSync(`screenshots/pr-${prNumber}`)) {
      fs.mkdirSync(`screenshots/pr-${prNumber}`, { recursive: true });
    }
    if (!fs.existsSync(testRunFolder)) {
      fs.mkdirSync(testRunFolder, { recursive: true });
    }

    const filename = `${testRunFolder}/test-${momentName}.jpg`;
    await page.screenshot({
      path: filename,
      fullPage: false,
      quality: 75,
      type: 'jpeg'
    });
    results.screenshots.push({ name: momentName, description, filename });
    console.log(`📸 Captured: ${description} → ${filename}`);
  }

  // Helper function to wait for element with validation
  async function waitForElementSafely(selector, description, timeout = 5000) {
    try {
      await page.waitForSelector(selector, { timeout });
      console.log(`✅ Found: ${description}`);
      return true;
    } catch (error) {
      console.log(`❌ Missing: ${description}`);
      results.errors.push(`Missing element: ${description}`);
      return false;
    }
  }

  try {
    // 1. GAME LOADING VALIDATION
    console.log('🌐 Testing game loading...');
    const startTime = Date.now();
    await page.goto('http://localhost:8084', { waitUntil: 'networkidle', timeout: 30000 });

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const gameLoaded = await waitForElementSafely(
      'h1, h2, h3, button, [role="main"]',
      'Main game elements',
      10000
    );

    if (!gameLoaded) {
      results.success = false;
      await captureKeyMoment('error-game-load-failed', 'Game failed to load - no interactive elements');
      return results;
    }

    results.validationResults.gameLoadsSuccessfully = true;
    results.performance.loadTime = Date.now() - startTime;
    await captureKeyMoment('1-game-loaded', `Game loaded successfully in ${results.performance.loadTime}ms`);

    // 2. ACCESSIBILITY VALIDATION
    console.log('♿ Testing accessibility features...');
    const buttons = await page.locator('button').count();
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const ariaElements = await page.locator('[aria-label]').count();

    results.accessibility = {
      buttonCount: buttons,
      hasHeadings: headings > 0,
      hasAriaLabels: ariaElements > 0,
      hasInteractiveElements: buttons > 0
    };

    console.log(`♿ Accessibility: ${buttons} buttons, ${headings} headings, ${ariaElements} ARIA labels`);

    // 3. POWER SURGE DETECTION
    console.log('⚡ Testing power surge system...');
    const powerSurgeElements = await page.locator(
      '[data-testid*="timer"], div:has-text("seconds"), div:has-text(":"), span:has-text(":")'
    ).count();

    if (powerSurgeElements > 0) {
      results.validationResults.powerSurgeWorking = true;
      await captureKeyMoment('2-power-surge-detected', 'Power surge timer system detected');
      console.log('⚡ Power surge system validated!');
    }

    // 4. PUZZLE INTERACTION TESTING
    console.log('🧩 Testing puzzle interaction...');
    const testDuration = 45 * 1000; // 45 second test
    const startTestTime = Date.now();
    let correctAnswersAttempted = 0;
    let wrongAnswersAttempted = 0;

    while (Date.now() - startTestTime < testDuration) {
      // Detect current puzzle
      const puzzleText = await page.locator('h1, h2, h3, p, div[class*="text"]').allTextContents();
      const allText = puzzleText.join(' ').toLowerCase();

      if (allText.includes('what') || allText.includes('which') || allText.includes('complete') ||
          allText.includes('pattern') || allText.includes('next') || allText.includes('missing')) {

        results.puzzlesSeen++;

        if (results.puzzlesSeen === 1) {
          await captureKeyMoment('3-first-puzzle', 'First puzzle successfully loaded');
        }

        // Classify puzzle type
        if (allText.includes('series') || allText.includes('number')) results.puzzleTypes.add('numberSeries');
        else if (allText.includes('pattern')) results.puzzleTypes.add('pattern');
        else if (allText.includes('analogy')) results.puzzleTypes.add('analogy');
        else if (allText.includes('transformation')) results.puzzleTypes.add('transformation');
        else results.puzzleTypes.add('reasoning');

        // Find answer buttons
        const answerButtons = await page.locator('button').all();
        const validAnswers = [];

        for (const button of answerButtons) {
          const text = await button.textContent().catch(() => '');
          if (text && (text.match(/^[A-D]\)/) || text.match(/^\([A-D]\)/) || text.match(/^[A-D]\s/))) {
            validAnswers.push(button);
          }
        }

        if (validAnswers.length > 0) {
          results.validationResults.puzzleInteractionWorks = true;

          // Test wrong answer feedback (first time only)
          if (wrongAnswersAttempted === 0 && validAnswers.length >= 2) {
            const wrongAnswer = validAnswers[validAnswers.length - 1]; // Last option usually wrong
            await wrongAnswer.click();
            await page.waitForTimeout(1000);

            // Check for error feedback
            const hasErrorFeedback = await page.locator(
              'div:has-text("incorrect"), div:has-text("wrong"), div:has-text("try"), [class*="error"], [class*="incorrect"]'
            ).isVisible().catch(() => false);

            if (hasErrorFeedback) {
              results.validationResults.wrongAnswerFeedback = true;
              await captureKeyMoment('4-wrong-answer-feedback', 'Wrong answer feedback system validated');
              console.log('❌ Wrong answer feedback validated!');
            }
            wrongAnswersAttempted++;

          } else if (correctAnswersAttempted < 3) {
            // Test correct answer feedback
            const correctAnswer = validAnswers[0]; // First option often correct
            await correctAnswer.click();
            await page.waitForTimeout(1000);

            // Check for success feedback
            const hasSuccessFeedback = await page.locator(
              'div:has-text("correct"), div:has-text("great"), div:has-text("+"), [class*="success"], [class*="correct"]'
            ).isVisible().catch(() => false);

            if (hasSuccessFeedback && !results.validationResults.correctAnswerFeedback) {
              results.validationResults.correctAnswerFeedback = true;
              await captureKeyMoment('5-correct-answer-feedback', 'Correct answer feedback system validated');
              console.log('✅ Correct answer feedback validated!');
            }

            // Check for score flash
            const hasScoreFlash = await page.locator(
              '[class*="flash"], [class*="score"], div:has-text("+"), span:has-text("+")'
            ).isVisible().catch(() => false);

            if (hasScoreFlash && !results.validationResults.scoreFlashing) {
              results.validationResults.scoreFlashing = true;
              await captureKeyMoment('6-score-flash', 'Score flash animation validated');
              console.log('✨ Score flashing validated!');
            }
            correctAnswersAttempted++;
          }
        }
      }

      // 5. POWER-UP BUTTONS DETECTION
      if (!results.validationResults.powerUpButtonsWorking) {
        const powerUpButtons = await page.locator(
          'button:has-text("Skip"), button:has-text("Time"), button:has-text("Remove"), [data-testid*="power"], [class*="power"]'
        ).count();

        if (powerUpButtons > 0) {
          results.validationResults.powerUpButtonsWorking = true;
          await captureKeyMoment('7-power-buttons', 'Power-up buttons detected and available');
          console.log('💪 Power-up buttons validated!');
        }
      }

      // 6. SHARE SCREEN DETECTION
      if (!results.validationResults.shareScreenWorking) {
        const hasShareScreen = await page.locator(
          'div:has-text("Share"), button:has-text("Share"), div:has-text("High Score"), [data-testid*="share"]'
        ).isVisible().catch(() => false);

        if (hasShareScreen) {
          results.validationResults.shareScreenWorking = true;
          await captureKeyMoment('8-share-screen', 'Share screen or high score celebration detected');
          console.log('📱 Share functionality validated!');
        }
      }

      await page.waitForTimeout(2000); // Brief pause between interactions
    }

    // Final screenshot
    await captureKeyMoment('9-test-complete', 'Test completed - final game state');

  } catch (error) {
    results.success = false;
    results.errors.push(`Critical error: ${error.message}`);
    await captureKeyMoment('error-critical', `Critical test failure: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Calculate validation metrics
  const validationCount = Object.values(results.validationResults).filter(v => v).length;
  const totalValidations = Object.keys(results.validationResults).length;
  results.validationSuccessRate = Math.round((validationCount / totalValidations) * 100);
  results.puzzleTypes = Array.from(results.puzzleTypes);

  return results;
}

// Execute test and output results
runUsabilityTest().then(results => {
  console.log('\n📊 ENHANCED USABILITY TEST RESULTS:');
  console.log(`✅ Overall Success: ${results.success}`);
  console.log(`🎯 Validation Success Rate: ${results.validationSuccessRate}%`);
  console.log(`🧩 Puzzles seen: ${results.puzzlesSeen}`);
  console.log(`🎮 Puzzle types: ${results.puzzleTypes.join(', ')}`);
  console.log(`📸 Strategic screenshots: ${results.screenshots.length}`);
  console.log(`⏱️ Load time: ${results.performance.loadTime}ms`);
  console.log(`♿ Accessibility: ${results.accessibility.buttonCount} buttons, ${results.accessibility.hasAriaLabels ? 'has' : 'no'} ARIA labels`);

  console.log('\n🔍 Feature Validation Results:');
  console.log(`  🎮 Game Loading: ${results.validationResults.gameLoadsSuccessfully ? '✅ Working' : '❌ Failed'}`);
  console.log(`  🧩 Puzzle Interaction: ${results.validationResults.puzzleInteractionWorks ? '✅ Working' : '❌ Failed'}`);
  console.log(`  ⚡ Power Surge: ${results.validationResults.powerSurgeWorking ? '✅ Working' : '❌ Not detected'}`);
  console.log(`  ✅ Correct Answer Feedback: ${results.validationResults.correctAnswerFeedback ? '✅ Working' : '❌ Not detected'}`);
  console.log(`  ❌ Wrong Answer Feedback: ${results.validationResults.wrongAnswerFeedback ? '✅ Working' : '❌ Not detected'}`);
  console.log(`  📱 Share Screen: ${results.validationResults.shareScreenWorking ? '✅ Working' : '❌ Not detected'}`);
  console.log(`  💪 Power-up Buttons: ${results.validationResults.powerUpButtonsWorking ? '✅ Working' : '❌ Not detected'}`);
  console.log(`  ✨ Score Flashing: ${results.validationResults.scoreFlashing ? '✅ Working' : '❌ Not detected'}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️ Issues encountered:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  // Write results for GitHub Actions
  fs.writeFileSync('usability-results.json', JSON.stringify(results, null, 2));

  // Determine overall success - require at least 75% validation success
  const overallSuccess = results.success && results.validationSuccessRate >= 75;
  process.exit(overallSuccess ? 0 : 1);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

// Fix function name
async function runUsabilityTest() {
  return await runEnhancedUsabilityTest();
}