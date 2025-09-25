import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/src/design';
import { CellState } from '@/src/lib/puzzles/cognitive/paperFolding';

interface PaperFoldingRendererProps {
  initialGrid?: CellState[][];
  unfoldedResult?: CellState[][];
  showBoth?: boolean; // Show both initial and result grids side by side
}

/**
 * Renders Paper Folding puzzle grids with folded paper states
 * Handles EMPTY, HOLE, and FOLD_LINE cell states
 */
export default function PaperFoldingRenderer({ 
  initialGrid,
  unfoldedResult,
  showBoth = false
}: PaperFoldingRendererProps) {
  
  /**
   * Render a single cell with its state
   */
  const renderCell = (cellState: CellState, rowIndex: number, colIndex: number) => {
    const cellStyle = [
      styles.cell,
      getCellStateStyle(cellState)
    ];

    return (
      <View key={`${rowIndex}-${colIndex}`} style={cellStyle}>
        {cellState === CellState.HOLE && (
          <View style={styles.hole} />
        )}
        {cellState === CellState.FOLD_LINE && (
          <View style={styles.foldLine} />
        )}
      </View>
    );
  };

  /**
   * Render a grid
   */
  const renderGrid = (grid: CellState[][], title?: string) => (
    <View style={styles.gridContainer}>
      {title && (
        <Text style={styles.gridTitle}>{title}</Text>
      )}
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </View>
        ))}
      </View>
    </View>
  );

  // If we have both grids and should show both, display side by side
  if (showBoth && initialGrid && unfoldedResult) {
    return (
      <View style={styles.container}>
        <View style={styles.bothGridsContainer}>
          {renderGrid(initialGrid, "Folded")}
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          {renderGrid(unfoldedResult, "Unfolded")}
        </View>
      </View>
    );
  }

  // Show the main grid (prioritize unfoldedResult if available)
  const mainGrid = unfoldedResult || initialGrid;
  
  if (!mainGrid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No paper folding grid available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderGrid(mainGrid)}
    </View>
  );
}

/**
 * Get cell state styling
 */
function getCellStateStyle(cellState: CellState) {
  switch (cellState) {
    case CellState.EMPTY:
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
      };
    case CellState.HOLE:
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: colors.text.white,
        borderWidth: 2,
      };
    case CellState.FOLD_LINE:
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: colors.text.accent,
        borderWidth: 2,
        borderStyle: 'dashed' as const,
      };
    default:
      return {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  
  bothGridsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  
  gridContainer: {
    alignItems: 'center',
  },
  
  gridTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  grid: {
    backgroundColor: colors.components.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  cell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: 4,
  },
  
  hole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text.white,
  },
  
  foldLine: {
    width: 20,
    height: 2,
    backgroundColor: colors.text.accent,
  },
  
  arrow: {
    paddingHorizontal: spacing.sm,
  },
  
  arrowText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.white,
  },
  
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.text.white,
    textAlign: 'center',
  },
});