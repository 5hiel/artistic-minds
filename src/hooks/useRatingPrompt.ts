import { useState, useCallback, useMemo } from 'react';
import { RatingPromptLogic, RatingPromptContext } from '@/src/lib/services/rating/ratingLogic';
import { NativeRating, isWebPlatform } from '@/src/lib/services/rating/nativeRating';

/**
 * Rating prompt state interface
 */
export interface RatingPromptState {
  shouldShow: boolean;
  isLoading: boolean;
  context?: RatingPromptContext;
}

/**
 * Rating prompt actions interface
 */
export interface RatingPromptActions {
  checkForPrompt: (context: RatingPromptContext) => Promise<void>;
  showPrompt: () => Promise<boolean>;
  decline: () => Promise<void>;
  rate: () => Promise<void>;
  dismiss: () => void;
  openStoreForRating: () => Promise<void>;
}

/**
 * Custom hook for managing rating prompts
 * Integrates with the game state to trigger rating prompts at appropriate times
 */
export function useRatingPrompt() {
  const [state, setState] = useState<RatingPromptState>({
    shouldShow: false,
    isLoading: false,
    context: undefined,
  });

  /**
   * Check if a rating prompt should be shown for the given context
   */
  const checkForPrompt = useCallback(async (context: RatingPromptContext) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const shouldShow = await RatingPromptLogic.shouldShowPrompt(context);
      
      setState({
        shouldShow,
        isLoading: false,
        context: shouldShow ? context : undefined,
      });
    } catch (error) {
      console.warn('Failed to check for rating prompt:', error);
      setState({
        shouldShow: false,
        isLoading: false,
        context: undefined,
      });
    }
  }, []);

  /**
   * Show the rating prompt (native or web fallback)
   */
  const showPrompt = useCallback(async (): Promise<boolean> => {
    if (!state.context) {
      console.warn('No context available for rating prompt');
      return false;
    }

    try {
      const nativeSuccess = await RatingPromptLogic.showRatingPrompt(state.context);
      
      if (nativeSuccess) {
        // Native prompt was shown successfully - hide our UI
        setState(prev => ({ ...prev, shouldShow: false, context: undefined }));
        return true;
      } else if (isWebPlatform()) {
        // Native prompt failed or not available - keep showing web UI
        return false;
      } else {
        // Native platform but prompt failed - hide UI
        setState(prev => ({ ...prev, shouldShow: false, context: undefined }));
        return false;
      }
    } catch (error) {
      console.warn('Failed to show rating prompt:', error);
      setState(prev => ({ ...prev, shouldShow: false, context: undefined }));
      return false;
    }
  }, [state.context]);

  /**
   * Record that user declined to rate
   */
  const decline = useCallback(async () => {
    try {
      await RatingPromptLogic.recordDeclined();
      setState(prev => ({ ...prev, shouldShow: false, context: undefined }));
    } catch (error) {
      console.warn('Failed to record rating decline:', error);
    }
  }, []);

  /**
   * Record that user completed rating
   */
  const rate = useCallback(async () => {
    try {
      await RatingPromptLogic.recordRated();
      setState(prev => ({ ...prev, shouldShow: false, context: undefined }));
    } catch (error) {
      console.warn('Failed to record rating completion:', error);
    }
  }, []);

  /**
   * Dismiss the prompt without recording decline (e.g., "Maybe later")
   */
  const dismiss = useCallback(() => {
    setState(prev => ({ ...prev, shouldShow: false, context: undefined }));
  }, []);

  /**
   * Open App Store for manual rating (fallback option)
   */
  const openStoreForRating = useCallback(async () => {
    try {
      await NativeRating.openStoreForRating();
      // Record as rated since user went to store
      await rate();
    } catch (error) {
      console.warn('Failed to open store for rating:', error);
    }
  }, [rate]);

  /**
   * Convenient trigger functions for common scenarios
   */
  const triggerScoreMilestone = useCallback(async (score: number) => {
    await checkForPrompt({
      trigger: 'score_milestone',
      score,
      reason: `Reached ${score} points!`,
    });
  }, [checkForPrompt]);

  const triggerLevelProgression = useCallback(async (score: number, level: number) => {
    await checkForPrompt({
      trigger: 'level_progression',
      score,
      level,
      reason: `Advanced to level ${level}!`,
    });
  }, [checkForPrompt]);

  const triggerHighEngagement = useCallback(async (score: number) => {
    await checkForPrompt({
      trigger: 'high_engagement',
      score,
      reason: 'Great gaming session!',
    });
  }, [checkForPrompt]);

  const triggerVersionUpdate = useCallback(async (score: number) => {
    await checkForPrompt({
      trigger: 'version_update',
      score,
      reason: 'Enjoying the new version?',
    });
  }, [checkForPrompt]);

  const actions: RatingPromptActions = useMemo(() => ({
    checkForPrompt,
    showPrompt,
    decline,
    rate,
    dismiss,
    openStoreForRating,
  }), [checkForPrompt, showPrompt, decline, rate, dismiss, openStoreForRating]);

  return useMemo(() => ({
    state,
    actions,
    // Convenience methods
    triggerScoreMilestone,
    triggerLevelProgression,
    triggerHighEngagement,
    triggerVersionUpdate,
  }), [state, actions, triggerScoreMilestone, triggerLevelProgression, triggerHighEngagement, triggerVersionUpdate]);
}