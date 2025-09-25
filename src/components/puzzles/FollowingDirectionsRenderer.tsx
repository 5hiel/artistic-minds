import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/src/design';

interface FollowingDirectionsRendererProps {
  gridString: string; // Pipe-separated grid string like "🔵⬜⬜|⬜🟦⬜|⬜⬜🔺"
}

/**
 * Renders a Following Directions puzzle grid from a pipe-separated string
 * Converts pipe-separated emoji strings into properly aligned visual grids
 */
export default function FollowingDirectionsRenderer({ 
  gridString 
}: FollowingDirectionsRendererProps) {
  
  // Parse the grid string into a 2D array
  const parseGrid = (gridStr: string): string[][] => {
    if (!gridStr || typeof gridStr !== 'string') {
      return [['⬜', '⬜', '⬜']]; // Default 3x3 empty grid
    }
    
    const rows = gridStr.split('|');
    return rows.map(row => {
      // Convert string to array of emoji characters
      // Handle multi-byte emoji by using regex
      const chars = row.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|./gu) || [];
      return chars;
    });
  };

  const grid = parseGrid(gridString);

  const renderCell = (cell: string, rowIndex: number, colIndex: number) => (
    <View key={`${rowIndex}-${colIndex}`} style={styles.cell}>
      <Text style={styles.cellText}>
        {cell}
      </Text>
    </View>
  );

  const renderRow = (row: string[], rowIndex: number) => (
    <View key={rowIndex} style={styles.row}>
      {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => renderRow(row, rowIndex))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.components.background,
    borderRadius: 8,
    padding: spacing.xs,
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
    backgroundColor: 'transparent',
  },
  
  cellText: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.text.white,
    fontWeight: typography.fontWeight.normal,
  },
});