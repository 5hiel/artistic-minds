import { useState, useEffect } from 'react';
import { AnyPuzzle } from '@/src/lib/game/puzzleGenerator';
import { HighScoreStorage } from '@/src/lib/storage/highScore';
import { intelligentPuzzleEngine } from '@/src/lib/engine';

export interface GameState {
  score: number;
  highScore: number;
  currentPuzzle: AnyPuzzle | null;
  selectedOption: number | null;
  feedback: string;
  showFlash: boolean;
  showExplanation: boolean;
  removedOptions: Set<number>;
  usedRemoveTwo: boolean;
  // Viral sharing state
  showScoreFlash: boolean;
  scoreFlashData: {
    score: number;
    isHighScoreBeat: boolean;
    levelIndex: number;
  } | null;
  showShareScreen: boolean;
  hasBeatenHighScoreThisSession: boolean;
  sessionHighScore: number;
  hasShownScoreFlash: boolean;
  puzzleStartTime: number;
  // Game session tracking (until score resets to 0)
  currentGameSessionId: string;
  gameSessionStartTime: number;
  // Pattern variety tracking
  recentPatterns: string[];
}

export interface GameActions {
  setScore: (score: number) => void;
  setHighScore: (highScore: number) => Promise<void>;
  setCurrentPuzzle: (puzzle: AnyPuzzle | null) => void;
  setSelectedOption: (option: number | null) => void;
  setFeedback: (feedback: string) => void;
  setShowFlash: (show: boolean) => void;
  setShowExplanation: (show: boolean) => void;
  setRemovedOptions: (options: Set<number>) => void;
  setUsedRemoveTwo: (used: boolean) => void;
  resetGame: () => Promise<void>;
  nextPuzzle: () => Promise<void>;
  // Viral sharing actions
  setShowScoreFlash: (show: boolean) => void;
  setScoreFlashData: (data: { score: number; isHighScoreBeat: boolean; levelIndex: number } | null) => void;
  setShowShareScreen: (show: boolean) => void;
  setHasBeatenHighScoreThisSession: (beaten: boolean) => void;
  setSessionHighScore: (score: number) => void;
  setHasShownScoreFlash: (shown: boolean) => void;
  setPuzzleStartTime: (time: number) => void;
  // Game session tracking actions
  setCurrentGameSessionId: (sessionId: string) => void;
  setGameSessionStartTime: (time: number) => void;
  // Pattern variety tracking actions
  addRecentPattern: (pattern: string) => void;
  setRecentPatterns: (patterns: string[]) => void;
}

export function useGameState() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<AnyPuzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [removedOptions, setRemovedOptions] = useState<Set<number>>(new Set());
  const [usedRemoveTwo, setUsedRemoveTwo] = useState(false);

  // Viral sharing state
  const [showScoreFlash, setShowScoreFlash] = useState(false);
  const [scoreFlashData, setScoreFlashData] = useState<{
    score: number;
    isHighScoreBeat: boolean;
    levelIndex: number;
  } | null>(null);
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [hasBeatenHighScoreThisSession, setHasBeatenHighScoreThisSession] = useState(false);
  const [sessionHighScore, setSessionHighScore] = useState(0);
  const [hasShownScoreFlash, setHasShownScoreFlash] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());
  // Game session tracking (until score resets to 0)
  const [currentGameSessionId, setCurrentGameSessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [gameSessionStartTime, setGameSessionStartTime] = useState(Date.now());
  // Pattern variety tracking - keep last 10 patterns for variety calculation
  const [recentPatterns, setRecentPatterns] = useState<string[]>([]);

  // Load high score from persistent storage on mount
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const storedHighScore = await HighScoreStorage.getHighScore();
        setHighScoreState(storedHighScore);
      } catch (error) {
        // Keep default value (0) if storage fails
        console.warn('Failed to load high score from storage:', error);
      }
    };
    loadHighScore();
  }, []);

  // Initialize first adaptive puzzle after mount
  useEffect(() => {
    const initializeAdaptivePuzzle = async () => {
      console.log('🎮 [GameState] Initializing first adaptive puzzle...');
      const initialPuzzle = await generateNextPuzzle();
      setCurrentPuzzle(initialPuzzle);
    };
    initializeAdaptivePuzzle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pattern tracking helper function
  const addRecentPattern = (pattern: string) => {
    setRecentPatterns(prev => {
      const updated = [pattern, ...prev];
      // Keep only last 10 patterns for variety tracking
      return updated.slice(0, 10);
    });
  };

  const generateNextPuzzle = async (): Promise<AnyPuzzle> => {
    console.log('🎮 [GameState] Generating adaptive puzzle...');

    // Use adaptive engine for intelligent puzzle selection
    const recommendation = await intelligentPuzzleEngine.getNextPuzzle();
    const generatedPuzzle = recommendation.puzzle;

    console.log('🎯 [GameState] Generated puzzle:', {
      puzzleType: generatedPuzzle.puzzleType,
      puzzleSubtype: generatedPuzzle.puzzleSubtype,
      difficulty: generatedPuzzle.difficultyLevel,
      reason: recommendation.selectionReason
    });

    // Track pattern for future variety calculations (only for pattern puzzles)
    if (generatedPuzzle.puzzleType === 'pattern' && generatedPuzzle.puzzleSubtype) {
      addRecentPattern(generatedPuzzle.puzzleSubtype);
    }

    return generatedPuzzle;
  };

  // Enhanced setHighScore function that persists to storage
  const setHighScore = async (newHighScore: number): Promise<void> => {
    setHighScoreState(newHighScore);
    await HighScoreStorage.setHighScore(newHighScore);
  };

  const resetGame = async () => {
    setScore(0);
    const newPuzzle = await generateNextPuzzle();
    setCurrentPuzzle(newPuzzle);
    setSelectedOption(null);
    setFeedback('');
    setShowFlash(false);
    setShowExplanation(false);
    setRemovedOptions(new Set());
    setUsedRemoveTwo(false);
    // Reset viral sharing state
    setShowScoreFlash(false);
    setScoreFlashData(null);
    setShowShareScreen(false);
    setHasBeatenHighScoreThisSession(false);
    setSessionHighScore(0);
    setHasShownScoreFlash(false);
    setPuzzleStartTime(Date.now()); // Set start time for response tracking
    // Start new game session (score reset triggers new session)
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    setCurrentGameSessionId(newSessionId);
    setGameSessionStartTime(Date.now());
    // Reset pattern variety tracking (keep some history for continuity)
    setRecentPatterns(prev => prev.slice(0, 3)); // Keep last 3 patterns for variety
  };

  const nextPuzzle = async () => {
    const newPuzzle = await generateNextPuzzle();
    setCurrentPuzzle(newPuzzle);
    setSelectedOption(null);
    setFeedback('');
    setShowFlash(false);
    setShowExplanation(false);
    setRemovedOptions(new Set()); // Reset removed options for new puzzle
    setUsedRemoveTwo(false); // Reset remove two usage for new puzzle
    setPuzzleStartTime(Date.now()); // Set start time for response tracking
  };

  const state: GameState = {
    score,
    highScore,
    currentPuzzle,
    selectedOption,
    feedback,
    showFlash,
    showExplanation,
    removedOptions,
    usedRemoveTwo,
    // Viral sharing state
    showScoreFlash,
    scoreFlashData,
    showShareScreen,
    hasBeatenHighScoreThisSession,
    sessionHighScore,
    hasShownScoreFlash,
    puzzleStartTime,
    // Game session tracking
    currentGameSessionId,
    gameSessionStartTime,
    // Pattern variety tracking
    recentPatterns,
  };

  const actions: GameActions = {
    setScore,
    setHighScore,
    setCurrentPuzzle,
    setSelectedOption,
    setFeedback,
    setShowFlash,
    setShowExplanation,
    setRemovedOptions,
    setUsedRemoveTwo,
    resetGame,
    nextPuzzle,
    // Viral sharing actions
    setShowScoreFlash,
    setScoreFlashData,
    setShowShareScreen,
    setHasBeatenHighScoreThisSession,
    setSessionHighScore,
    setHasShownScoreFlash,
    setPuzzleStartTime,
    // Game session tracking actions
    setCurrentGameSessionId,
    setGameSessionStartTime,
    // Pattern variety tracking actions
    addRecentPattern,
    setRecentPatterns,
  };

  return { state, actions };
}