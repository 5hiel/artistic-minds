import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/src/design';

interface GridState {
  [position: string]: string; // position like "1,1" -> emoji like "🟢"
}

interface FollowingDirectionsMainRendererProps {
  initialState: GridState;
  instructionText: string;
  gridSize?: number;
}

/**
 * Renders the main content for Following Directions puzzles
 * Shows the initial grid state and instruction text
 */
export default function FollowingDirectionsMainRenderer({ 
  initialState, 
  instructionText,
  gridSize = 4
}: FollowingDirectionsMainRendererProps) {

  // Convert GridState to 2D array for rendering
  const createGridArray = (): string[][] => {
    const grid: string[][] = [];
    for (let row = 0; row < gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize; col++) {
        const position = `${row},${col}`;
        grid[row][col] = initialState[position] || '⬜'; // Default to empty square
      }
    }
    return grid;
  };

  const gridArray = createGridArray();

  return (
    <View style={styles.container}>
      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>{instructionText}</Text>
      </View>

      {/* Initial Grid State */}
      <View style={styles.gridContainer}>
        <Text style={styles.gridTitle}>Starting Position:</Text>
        <View style={styles.grid}>
          {gridArray.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <View key={colIndex} style={styles.cell}>
                  <Text style={styles.cellText}>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    maxWidth: '90%',
  },
  instructionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.white,
    lineHeight: typography.lineHeight.normal,
    textAlign: 'left',
  },
  gridContainer: {
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.white,
    marginBottom: spacing.sm,
  },
  grid: {
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cellText: {
    fontSize: 20,
    textAlign: 'center',
  },
});