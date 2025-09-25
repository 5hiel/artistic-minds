import { useState, useEffect, useRef } from 'react';

export interface PowerSurgeState {
  seconds: number;
  correctAnswersInWindow: number;
  currentPowerLevel: number;
  isInPowerSurge: boolean;
}

export interface PowerSurgeActions {
  resetWindow: () => void;
  recordCorrectAnswer: () => number; // Returns points earned
  recordWrongAnswer: () => void;
}

/**
 * Custom hook for managing the redesigned power surge system.
 * 
 * New Power Surge Mechanics:
 * - 60-second windows
 * - First 5 correct answers: +1 point each
 * - After 5th answer: arithmetic progression (+2, +3, +4, +5, etc.)
 * - Wrong answer resets progression within window
 * - Window end resets everything back to +1 scoring
 */
export function usePowerSurge(loopSeconds: number = 60) {
  const [seconds, setSeconds] = useState(loopSeconds);
  const [correctAnswersInWindow, setCorrectAnswersInWindow] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCountRef = useRef<number>(0);

  // Initialize and manage the main game timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Reset window when timer hits 0
          setCorrectAnswersInWindow(0);
          pendingCountRef.current = 0;
          return loopSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loopSeconds]);

  // Calculate current power level based on answers in window
  const getCurrentPowerLevel = () => {
    if (correctAnswersInWindow < 5) return 0; // No power surge until 5th answer
    return correctAnswersInWindow - 4; // 5th answer = 1, 6th = 2, 7th = 3, etc.
  };

  const recordCorrectAnswer = (): number => {
    // Track pending count for batched calls
    pendingCountRef.current += 1;
    const effectiveCount = correctAnswersInWindow + pendingCountRef.current;
    const points = effectiveCount <= 5 ? 1 : effectiveCount - 4;
    
    setCorrectAnswersInWindow((prev) => {
      // Reset pending count when setState callback runs
      pendingCountRef.current = 0;
      return prev + 1;
    });
    
    return points;
  };

  const recordWrongAnswer = () => {
    setCorrectAnswersInWindow(0); // Reset progression on wrong answer
    pendingCountRef.current = 0; // Reset pending count as well
  };

  const resetWindow = () => {
    setCorrectAnswersInWindow(0);
    setSeconds(loopSeconds);
    pendingCountRef.current = 0; // Reset pending count as well
  };

  const addTime = (additionalSeconds: number) => {
    setSeconds((prev) => Math.max(0, prev + additionalSeconds));
  };

  const state: PowerSurgeState = {
    seconds,
    correctAnswersInWindow,
    currentPowerLevel: getCurrentPowerLevel(),
    isInPowerSurge: correctAnswersInWindow >= 5,
  };

  const actions: PowerSurgeActions = {
    resetWindow,
    recordCorrectAnswer,
    recordWrongAnswer,
  };

  return { 
    state, 
    actions, 
    addTime
  };
}