import { useEffect } from 'react';
import { GameState, GameActions } from './useGameState';
import { PowerSurgeState, usePowerSurge } from './usePowerSurge';
import { useRatingPrompt } from './useRatingPrompt';
import { LEVELS } from '@/src/constants/gameConfig';
import { behavioralSignatureStorage } from '@/src/lib/engine/behavioralSignatureStorage';

export interface GameLogicHook {
  powerSurgeState: PowerSurgeState;
  handleOptionSelect: (index: number) => void;
  levelIndex: number;
  effectiveThemeLevel: number; // Theme level used for UI (includes power surge effect)
  powerUpHandlers: {
    handleSkipPuzzle: () => Promise<void>;
    handleAddTime: () => Promise<void>;
    handleRemoveWrongAnswers: () => Promise<void>;
  };
  ratingPrompt: ReturnType<typeof useRatingPrompt>;
  // Viral sharing handlers
  handleScoreFlashComplete: () => void;
  handleShareComplete: (platform: string) => void;
  handleShareClose: () => void;
}

/**
 * Custom hook that combines game state and power surge logic.
 * Handles the main game mechanics including scoring, level progression, and power surge calculations.
 */
export function useGameLogic(
  gameState: GameState,
  gameActions: GameActions,
  loopSeconds: number = 60
): GameLogicHook {
  const { state: powerSurgeState, actions: powerSurgeActions, addTime } = usePowerSurge(loopSeconds);
  const { currentPowerLevel, isInPowerSurge } = powerSurgeState;
  const ratingPrompt = useRatingPrompt();

  /**
   * Handles user option selection and manages game state transitions.
   * Processes correct/incorrect answers with appropriate feedback and scoring.
   */
  const handleOptionSelect = (index: number) => {
    // Guard against null puzzle
    if (!gameState.currentPuzzle) return;

    // Prevent multiple selections after correct answer
    if (gameState.selectedOption === gameState.currentPuzzle.correctAnswerIndex) return;

    gameActions.setSelectedOption(index);

    if (index === gameState.currentPuzzle.correctAnswerIndex) {
      // Correct answer logic
      const pointsEarned = powerSurgeActions.recordCorrectAnswer();
      gameActions.setFeedback(isInPowerSurge ? `🎉 POWER SURGE! +${pointsEarned}!` : '');
      gameActions.setShowExplanation(false);
      
      const newScore = gameState.score + pointsEarned;
      gameActions.setScore(newScore);
      
      // Score flash flag is reset when high scores are beaten (see below)
      
      // Check for rating prompt on score milestones
      const scoreMilestones = [50, 100, 200, 500, 1000];
      if (scoreMilestones.includes(newScore)) {
        ratingPrompt.triggerScoreMilestone(newScore);
      }
      
      // Check if this beats the session high score OR the all-time high score
      const beatsSessionHigh = newScore > gameState.sessionHighScore;
      const beatsAllTimeHigh = newScore > gameState.highScore;

      if (beatsSessionHigh || beatsAllTimeHigh) {
        // Mark that high score was beaten this session (includes session highs)
        gameActions.setHasBeatenHighScoreThisSession(true);
        gameActions.setSessionHighScore(newScore);

        // Reset score flash flag so viral messaging can trigger when they bomb out
        gameActions.setHasShownScoreFlash(false);

        console.log('🏆 [DEBUG] High score beaten!', {
          newScore,
          sessionHighScore: gameState.sessionHighScore,
          allTimeHighScore: gameState.highScore,
          beatsSessionHigh,
          beatsAllTimeHigh
        });
      }

      if (beatsAllTimeHigh) {
        // Save new all-time high score asynchronously without blocking game flow
        gameActions.setHighScore(newScore).catch(error => {
          console.warn('Failed to save new high score:', error);
        });
      }
      
      gameActions.setShowFlash(true);
      
      // Record puzzle completion in session history
      try {
        const responseTime = Date.now() - gameState.puzzleStartTime;
        
        
        // Calculate engagement score based on response time (faster = more engaged)
        // Good response time: 2-8 seconds = high engagement (0.8-1.0)
        // Average: 8-15 seconds = medium engagement (0.5-0.8)  
        // Slow: >15 seconds = low engagement (0.3-0.5)
        const responseTimeSeconds = responseTime / 1000;
        let engagementScore = 0.5;
        if (responseTimeSeconds <= 2) engagementScore = 1.0;
        else if (responseTimeSeconds <= 8) engagementScore = 0.8 + (8 - responseTimeSeconds) * 0.2 / 6;
        else if (responseTimeSeconds <= 15) engagementScore = 0.5 + (15 - responseTimeSeconds) * 0.3 / 7;
        else engagementScore = Math.max(0.3, 0.5 - (responseTimeSeconds - 15) * 0.02);
        
        // Store session data in background - don't block UI with await
        behavioralSignatureStorage.storeInteractionSession({
          puzzleId: `${gameState.currentPuzzle.puzzleType}_${gameState.currentPuzzle.puzzleSubtype}`,
          success: true,
          solveTime: responseTime,
          engagementScore
        }).catch(error => {
          console.warn('Failed to record puzzle completion:', error);
        });
      } catch (error) {
        console.warn('Failed to calculate session metrics:', error);
      }
      
      // Auto-advance to next puzzle after brief celebration
      setTimeout(async () => {
        gameActions.setShowFlash(false);
        await gameActions.nextPuzzle();
      }, 1200);
    } else {
      // Incorrect answer logic - BOMB OUT!

      powerSurgeActions.recordWrongAnswer(); // Reset power surge progression
      gameActions.setFeedback('');

      const finalScore = gameState.score;
      const currentLevelIndex = calculateLevelIndex(gameState.highScore);
      const isHighScoreBeat = gameState.hasBeatenHighScoreThisSession;
      
      // Minimum score threshold for viral sharing (10+ points)
      const MINIMUM_SHARE_SCORE = 10;

      // Debug logging for viral sharing conditions
      console.log('🔍 [DEBUG] Viral sharing check:', {
        finalScore,
        isHighScoreBeat,
        MINIMUM_SHARE_SCORE,
        hasShownScoreFlash: gameState.hasShownScoreFlash,
        showScoreFlash: gameState.showScoreFlash,
        sessionHighScore: gameState.sessionHighScore,
        highScore: gameState.highScore
      });

      // Simple rule: triggered when they beat their high score AND score is 10+
      const shouldTriggerShare = isHighScoreBeat && finalScore >= MINIMUM_SHARE_SCORE;
      console.log('🎯 [DEBUG] shouldTriggerShare:', shouldTriggerShare, {
        condition: `isHighScoreBeat(${isHighScoreBeat}) && finalScore(${finalScore}) >= MINIMUM_SHARE_SCORE(${MINIMUM_SHARE_SCORE})`,
        result: shouldTriggerShare
      });

      
      // Show score flash if there's an actual score to display AND we haven't shown it yet
      // Fixed: Added additional safeguards to prevent continuous flashing
      if (finalScore > 0 && !gameState.hasShownScoreFlash && !gameState.showScoreFlash) {

        // IMPORTANT: Store the final score BEFORE resetting it, so share screen can access it
        gameActions.setScoreFlashData({
          score: finalScore, // This preserves the actual score for sharing
          isHighScoreBeat,
          levelIndex: currentLevelIndex
        });
        gameActions.setShowScoreFlash(true);
        gameActions.setHasShownScoreFlash(true);

        console.log('🎯 [DEBUG] Score flash data set:', {
          score: finalScore,
          isHighScoreBeat,
          levelIndex: currentLevelIndex
        });
      } else {
        console.log('❌ [DEBUG] Score flash NOT triggered:', {
          finalScore,
          hasShownScoreFlash: gameState.hasShownScoreFlash,
          showScoreFlash: gameState.showScoreFlash
        });
      }

      // Reset score after showing flash (this is OK because we saved it in scoreFlashData)
      gameActions.setScore(0); 
      gameActions.setShowExplanation(true);
      
      // Record puzzle completion in session history
      try {
        const responseTime = Date.now() - gameState.puzzleStartTime;
        
        
        // Calculate engagement score based on response time (failed attempts = lower engagement)
        const responseTimeSeconds = responseTime / 1000;
        let engagementScore = 0.3; // Lower baseline for incorrect answers
        if (responseTimeSeconds <= 2) engagementScore = 0.6; // Quick wrong answer = moderate engagement
        else if (responseTimeSeconds <= 8) engagementScore = 0.4 + (8 - responseTimeSeconds) * 0.2 / 6;
        else if (responseTimeSeconds <= 15) engagementScore = 0.3 + (15 - responseTimeSeconds) * 0.1 / 7;
        else engagementScore = Math.max(0.2, 0.3 - (responseTimeSeconds - 15) * 0.01);
        
        // Store session data in background - don't block UI with await
        behavioralSignatureStorage.storeInteractionSession({
          puzzleId: `${gameState.currentPuzzle.puzzleType}_${gameState.currentPuzzle.puzzleSubtype}`,
          success: false,
          solveTime: responseTime,
          engagementScore
        }).catch(error => {
          console.warn('Failed to record puzzle completion:', error);
        });
      } catch (error) {
        console.warn('Failed to calculate session metrics:', error);
      }
      
      // If should trigger share, prepare share screen for after flash
      if (shouldTriggerShare) {
        // Share screen will be shown after score flash completes
      }
    }
  };

  /**
   * Computes the user's current level based on their high score.
   */
  const calculateLevelIndex = (highScore: number): number => {
    if (highScore >= 10000) return 4; // Visionary
    if (highScore >= 1000) return 3;  // Creator
    if (highScore >= 100) return 2;   // Thinker
    if (highScore >= 10) return 1;    // Learner
    return 0; // Seeker
  };

  const levelIndex = calculateLevelIndex(gameState.highScore);

  /**
   * Calculate effective theme level for UI display.
   * During power surge, shows next level theme in circular progression.
   */
  const getEffectiveThemeLevel = (): number => {
    if (isInPowerSurge && currentPowerLevel > 1) {
      // Circular progression: (currentLevel + 1) % totalLevels
      return (levelIndex + 1) % LEVELS.length;
    }
    return levelIndex;
  };

  const effectiveThemeLevel = getEffectiveThemeLevel();

  // Track level progression for rating prompts
  useEffect(() => {
    // TEMP FIX: Disable level progression tracking to prevent infinite loops
    return;

    // eslint-disable-next-line no-unreachable
    const previousLevel = calculateLevelIndex(gameState.highScore - 1);
    if (levelIndex > previousLevel && gameState.highScore > 0) {
      // Level progression detected
      ratingPrompt.triggerLevelProgression(gameState.highScore, levelIndex);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Power-up handlers for special game abilities
   */
  const powerUpHandlers = {
    handleSkipPuzzle: async () => {
      try {
        await gameActions.nextPuzzle();
        gameActions.setFeedback('');
        gameActions.setShowExplanation(false);
        
        // Power-up usage tracking simplified in this version
      } catch (error) {
        console.error('Error tracking skip power-up usage:', error);
      }
    },

    handleAddTime: async () => {
      try {
        addTime(15); // Add 15 seconds to power surge timer
        
        // Power-up usage tracking simplified in this version
      } catch (error) {
        console.error('Error tracking add time power-up usage:', error);
      }
    },

    handleRemoveWrongAnswers: async () => {
      try {
        // Don't allow using Remove Two more than once per puzzle
        if (gameState.usedRemoveTwo) {
          return;
        }

        const correctIndex = gameState.currentPuzzle?.correctAnswerIndex;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
        
        // Shuffle wrong indices and take first 2 to remove
        const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
        const toRemove = shuffled.slice(0, 2);
        
        gameActions.setRemovedOptions(new Set(toRemove));
        gameActions.setUsedRemoveTwo(true); // Mark as used for this puzzle
        
        // Power-up usage tracking simplified in this version
      } catch (error) {
        console.error('Error tracking remove wrong answers power-up usage:', error);
      }
    },
  };

  /**
   * Viral sharing handler functions
   */
  const handleScoreFlashComplete = () => {

    gameActions.setShowScoreFlash(false);

    // Check if we should show share screen after flash (use same threshold as shouldTriggerShare)
    console.log('🔍 [DEBUG] Score flash complete, checking share trigger:', {
      scoreFlashData: gameState.scoreFlashData,
      isHighScoreBeat: gameState.scoreFlashData?.isHighScoreBeat,
      score: gameState.scoreFlashData?.score,
      threshold: 10
    });

    // Simple rule: high score beat AND score is 10+
    const shouldShowShare = gameState.scoreFlashData?.isHighScoreBeat &&
                           gameState.scoreFlashData.score >= 10;

    if (shouldShowShare) {
      console.log('🎯 [DEBUG] Triggering share screen!');
      gameActions.setShowShareScreen(true);
    } else {
      console.log('❌ [DEBUG] Share screen NOT triggered - conditions not met:', {
        isHighScoreBeat: gameState.scoreFlashData?.isHighScoreBeat,
        score: gameState.scoreFlashData?.score,
        meetsThreshold: (gameState.scoreFlashData?.score ?? 0) >= 10,
        shouldShowShare
      });
    }

    // Keep flash data for share screen - will be cleared when share screen closes
  };

  const handleShareComplete = async (platform: string) => {
    
    // Local analytics tracking (no external services)
    try {
      // Store locally for insights (optional - could be expanded later)
    } catch (error) {
      console.warn('Failed to track share analytics:', error);
    }
  };

  const handleShareClose = () => {
    gameActions.setShowShareScreen(false);
    // Clear score flash data now that share screen is closing
    gameActions.setScoreFlashData(null);
    // Reset session state after sharing flow completes
    gameActions.setHasBeatenHighScoreThisSession(false);
    gameActions.setSessionHighScore(0);
  };

  return {
    powerSurgeState,
    handleOptionSelect,
    levelIndex,
    effectiveThemeLevel,
    powerUpHandlers,
    ratingPrompt,
    // Viral sharing handlers
    handleScoreFlashComplete,
    handleShareComplete,
    handleShareClose,
  };
}