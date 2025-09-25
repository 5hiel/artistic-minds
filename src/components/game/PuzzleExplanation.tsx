import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/src/design';
import { AnyPuzzle } from '@/src/lib/game/puzzleGenerator';

interface PuzzleExplanationProps {
  puzzle: AnyPuzzle;
  showExplanation: boolean;
}

/**
 * Component for displaying puzzle explanations with fixed placeholder space
 */
export default function PuzzleExplanation({ puzzle, showExplanation }: PuzzleExplanationProps) {
  const shouldShowContent = showExplanation && 'explanation' in puzzle && puzzle.explanation;

  return (
    <View style={styles.explanationContainer}>
      {shouldShowContent ? (
        <Text style={styles.explanationText}>
          Explanation: {puzzle.explanation}
        </Text>
      ) : (
        <Text style={styles.placeholderText}> </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  explanationContainer: {
    minHeight: 60, // Reserve consistent space for explanation
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  explanationText: {
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: typography.fontSize.md,
  },
  placeholderText: {
    color: 'transparent', // Invisible placeholder to maintain space
    textAlign: 'center',
    fontSize: typography.fontSize.md,
  },
});