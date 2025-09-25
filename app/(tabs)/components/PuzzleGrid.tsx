import React from 'react';
import { Text, View } from 'react-native';
import { contentStyles } from '@/src/design';

interface PuzzleGridProps {
  grid: string[][];
  levelIndex?: number;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({ grid, levelIndex = 0 }) => {
  const styles = contentStyles.grid(levelIndex);
  
  return (
    <View style={styles.container}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, cellIndex) => (
            <View key={cellIndex} style={styles.cell}>
              <Text style={styles.cellText}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default PuzzleGrid;
