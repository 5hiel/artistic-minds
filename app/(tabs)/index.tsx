import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameState } from '@/src/hooks/useGameState';
import { useGameLogic } from '@/src/hooks/useGameLogic';
import { GAME_CONFIG } from '@/src/constants/gameConfig';
import { layoutStyles, contentStyles, getLevelGradient } from '@/src/design';
// Components - Clean imports from new structure
import {
  GameTopBarContainer,
  ScoreDisplay,
  PuzzleGrid,
  NumberSeriesRenderer,
  PictureSeriesRenderer,
  SequentialFiguresRenderer,
  TransformationRenderer,
  PaperFoldingRenderer,
  FigureClassificationRenderer,
  FollowingDirectionsMainRenderer,
  PuzzleOptionsContainer,
  PuzzleExplanation,
  PowerButtonsContainer,
  RatingPrompt,
  ScoreFlashOverlay,
  ShareScreen
} from '@/src/components';

// Memoized Grid Component to prevent render loops
const GridPuzzleRenderer = React.memo<{ currentPuzzle: any; effectiveThemeLevel: number }>(
  ({ currentPuzzle, effectiveThemeLevel }) => {
    const firstElement = currentPuzzle.grid?.[0]?.[0];
    const isTransformationPuzzle = firstElement && 
                                   typeof firstElement === 'object' && 
                                   firstElement !== null && 
                                   'shape' in firstElement;
    
    if (isTransformationPuzzle) {
      return <TransformationRenderer grid={currentPuzzle.grid as any} />;
    } else {
      return <PuzzleGrid grid={currentPuzzle.grid as string[][]} levelIndex={effectiveThemeLevel} />;
    }
  }
);
GridPuzzleRenderer.displayName = 'GridPuzzleRenderer';

/**
 * Main puzzle application component (Refactored)
 * 
 * This refactored version separates concerns into:
 * - Custom hooks for state management and game logic
 * - Smaller, focused components for UI elements
 * - Constants file for configuration
 * - Optimized styles with theme system
 * 
 * Key improvements:
 * - Better separation of concerns
 * - Easier to test individual pieces
 * - More maintainable and readable code
 * - Consistent styling with theme system
 * - Reusable components and hooks
 */
export default function PuzzleGameApp() {
  // Game state management
  const { state: gameState, actions: gameActions } = useGameState();
  
  // Game logic with power surge system
  const { 
    powerSurgeState, 
    handleOptionSelect, 
    // levelIndex, // Actual user level (for level progression logic) - commented out as unused
    effectiveThemeLevel,
    powerUpHandlers,
    ratingPrompt,
    // Viral sharing handlers
    handleScoreFlashComplete,
    handleShareComplete,
    handleShareClose
  } = useGameLogic(gameState, gameActions, GAME_CONFIG.LOOP_SECONDS);

  // Adaptive engine integration for learning data collection

  // Initialize adaptive engine on app startup
  useEffect(() => {
    // Adaptive engine initialization enabled - all core issues resolved!
    
    if (__DEV__) console.log('🔵 useEffect for adaptive engine initialization is running...');

    const initializeAdaptiveEngine = async () => {
      try {
        if (__DEV__) console.log('🚀 Starting adaptive engine initialization...');

        // Simple test first - just try to import
        if (__DEV__) console.log('📦 Attempting to import adaptive engine...');
        const adaptiveEngine = await import('../../src/lib/engine');
        if (__DEV__) console.log('✅ Import successful, available functions:', Object.keys(adaptiveEngine));

        if (adaptiveEngine.initializeAdaptiveLearningSystem) {
          if (__DEV__) console.log('🎯 Calling initializeAdaptiveLearningSystem...');
          const initialized = await adaptiveEngine.initializeAdaptiveLearningSystem();
          if (__DEV__) console.log('📊 Initialization result:', initialized);

          if (!initialized) {
            console.warn('⚠️ Adaptive engine initialization returned false');
          }
        } else {
          console.error('❌ initializeAdaptiveLearningSystem not found in import');
        }

      } catch (error) {
        console.error('❌ Failed to initialize adaptive learning system:', error);
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          if (error.stack) {
            console.error('Error stack:', error.stack);
          }
        }
      }
    };

    // Add a small delay to ensure the component is fully mounted
    setTimeout(() => {
      initializeAdaptiveEngine();
    }, 100);
  }, []);
  
  // Legacy adaptive tracking removed - simplified engine handles interactions in hooks

  // Design system styles
  const screenStyles = layoutStyles.screen(effectiveThemeLevel);
  const sectionStyles = layoutStyles.section(effectiveThemeLevel);
  const puzzleStyles = contentStyles.puzzle(effectiveThemeLevel);
  const levelGradient = getLevelGradient(effectiveThemeLevel);

  return (
    <LinearGradient
      colors={levelGradient}
      style={screenStyles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ScrollView contentContainerStyle={screenStyles.scrollContent}>
          <View style={sectionStyles.content}>
            {/* Top bar with game status indicators */}
            <GameTopBarContainer
              highScore={gameState.highScore}
              levelIndex={effectiveThemeLevel}
            />
            
            
            {/* Power surge now handled via theme switching */}
            
            
            <View style={puzzleStyles.container}>
              {/* Score tracking display */}
              <ScoreDisplay
                score={gameState.score}
                seconds={powerSurgeState.seconds}
                powerSurge={powerSurgeState.currentPowerLevel}
                correctAnswers={powerSurgeState.correctAnswersInWindow}
                isInPowerSurge={powerSurgeState.isInPowerSurge}
                levelIndex={effectiveThemeLevel}
              />

              {/* Loading state for adaptive puzzle generation */}
              {!gameState.currentPuzzle ? (
                <View style={{
                  padding: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200
                }}>
                  <Text style={{
                    fontSize: 18,
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>🧠 Generating adaptive puzzle...</Text>
                </View>
              ) : (
                <>
                  {/* Puzzle question prompt */}
                  <Text style={puzzleStyles.question}>
                    {typeof gameState.currentPuzzle.question === 'object' && gameState.currentPuzzle.question !== null
                      ? JSON.stringify(gameState.currentPuzzle.question)
                      : gameState.currentPuzzle.question}
                  </Text>

              {/* Feedback removed - game uses visual/score feedback instead */}
              
              {/* Conditional display based on puzzle type - ORDER MATTERS! */}
              
              {/* Sequential Figures (geometric sequences) - CHECK FIRST */}
              {'sequence' in gameState.currentPuzzle && gameState.currentPuzzle.sequence && (
                <SequentialFiguresRenderer 
                  sequence={gameState.currentPuzzle.sequence as any[]}
                  showMissingPlaceholder={true}
                />
              )}
              
              {/* Series puzzles (number/picture series) */}
              {'series' in gameState.currentPuzzle && gameState.currentPuzzle.series && (
                // Check if it's a number series or picture series
                typeof gameState.currentPuzzle.series[0] === 'number' ? (
                  <NumberSeriesRenderer 
                    series={gameState.currentPuzzle.series as number[]}
                    hiddenIndex={'hiddenIndex' in gameState.currentPuzzle ? gameState.currentPuzzle.hiddenIndex : 0}
                  />
                ) : (
                  <PictureSeriesRenderer 
                    series={gameState.currentPuzzle.series as any[]}
                    hiddenIndex={'hiddenIndex' in gameState.currentPuzzle ? gameState.currentPuzzle.hiddenIndex : 0}
                  />
                )
              )}
              
              {/* Grid-based puzzles (Transformation and Pattern puzzles) - CHECK LAST */}
              {'grid' in gameState.currentPuzzle && gameState.currentPuzzle.grid && 
               !('sequence' in gameState.currentPuzzle) && !('series' in gameState.currentPuzzle) && (
                <GridPuzzleRenderer 
                  currentPuzzle={gameState.currentPuzzle} 
                  effectiveThemeLevel={effectiveThemeLevel}
                />
              )}
              
              {/* Paper Folding Puzzles */}
              {('initialGrid' in gameState.currentPuzzle || 'unfoldedResult' in gameState.currentPuzzle) && (
                <PaperFoldingRenderer 
                  initialGrid={'initialGrid' in gameState.currentPuzzle ? gameState.currentPuzzle.initialGrid as any : undefined}
                  unfoldedResult={'unfoldedResult' in gameState.currentPuzzle ? gameState.currentPuzzle.unfoldedResult as any : undefined}
                  showBoth={false}
                />
              )}
              
              {/* Figure Classification Puzzles */}
              {'figures' in gameState.currentPuzzle && gameState.currentPuzzle.figures && (
                <FigureClassificationRenderer 
                  figures={gameState.currentPuzzle.figures as any[]}
                />
              )}
              
              {/* Following Directions Puzzles */}
              {'initialState' in gameState.currentPuzzle && 'instructionText' in gameState.currentPuzzle && (
                <FollowingDirectionsMainRenderer 
                  initialState={gameState.currentPuzzle.initialState as any}
                  instructionText={gameState.currentPuzzle.instructionText as string}
                  gridSize={'gridSize' in gameState.currentPuzzle ? gameState.currentPuzzle.gridSize as number : 4}
                />
              )}
              
              {/* Interactive answer options */}
              <PuzzleOptionsContainer
                options={gameState.currentPuzzle.options}
                selectedOption={gameState.selectedOption}
                correctAnswerIndex={gameState.currentPuzzle.correctAnswerIndex}
                removedOptions={gameState.removedOptions}
                onSelect={handleOptionSelect}
                levelIndex={effectiveThemeLevel}
              />
              
              {/* Power-up buttons */}
              <PowerButtonsContainer
                onSkipPuzzle={powerUpHandlers.handleSkipPuzzle}
                onAddTime={powerUpHandlers.handleAddTime}
                onRemoveWrongAnswers={powerUpHandlers.handleRemoveWrongAnswers}
                usedRemoveTwo={gameState.usedRemoveTwo}
                currentScore={gameState.score}
                levelIndex={effectiveThemeLevel}
              />
              
              {/* Educational explanations for wrong answers */}
              <PuzzleExplanation
                puzzle={gameState.currentPuzzle}
                showExplanation={gameState.showExplanation}
              />
                </>
              )}
            </View>
          </View>
        </ScrollView>
        
        {/* Rating prompt modal (only shows when appropriate) */}
        <RatingPrompt 
          state={ratingPrompt.state} 
          actions={ratingPrompt.actions} 
        />

        {/* Development tools (web only) */}

        {/* Viral Sharing Components */}
        <ScoreFlashOverlay
          show={gameState.showScoreFlash}
          score={gameState.scoreFlashData?.score || 0}
          isHighScoreBeat={gameState.scoreFlashData?.isHighScoreBeat || false}
          levelIndex={gameState.scoreFlashData?.levelIndex || 0}
          onComplete={handleScoreFlashComplete}
        />

        <ShareScreen
          show={gameState.showShareScreen}
          score={gameState.scoreFlashData?.score || gameState.sessionHighScore}
          levelIndex={effectiveThemeLevel}
          isHighScoreBeat={gameState.hasBeatenHighScoreThisSession}
          previousHighScore={gameState.highScore}
          onClose={handleShareClose}
          onShareComplete={handleShareComplete}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}