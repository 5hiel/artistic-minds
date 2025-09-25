import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/src/design';
import { 
  ShapeElement, 
  TransformationSize, 
  TransformationColor, 
  TransformationFill
} from '@/src/lib/puzzles/reasoning/transformation';

interface TransformationRendererProps {
  grid: (ShapeElement | null)[][];
}

/**
 * Renders a Transformation puzzle grid with complex ShapeElement objects
 * Handles shape, size, color, fill, and rotation properties
 */
export default function TransformationRenderer({ 
  grid 
}: TransformationRendererProps) {
  
  /**
   * Get the appropriate emoji for shape and fill combination
   */
  const getShapeEmoji = (shape: any, fill: TransformationFill) => {
    // Map shape and fill combinations to appropriate emoji symbols
    const emojiMap: Record<string, Record<string, string>> = {
      '○': { // Circle
        [TransformationFill.EMPTY]: '○',    // Empty circle
        [TransformationFill.QUARTER]: '◔',  // Quarter-filled circle
        [TransformationFill.HALF]: '◑',     // Half-filled circle  
        [TransformationFill.FULL]: '●'      // Full circle
      },
      '□': { // Square
        [TransformationFill.EMPTY]: '□',    // Empty square
        [TransformationFill.QUARTER]: '◪',  // Quarter-filled square
        [TransformationFill.HALF]: '◧',     // Half-filled square
        [TransformationFill.FULL]: '■'      // Full square
      },
      '△': { // Triangle
        [TransformationFill.EMPTY]: '△',    // Empty triangle
        [TransformationFill.QUARTER]: '◬',  // Quarter-filled triangle
        [TransformationFill.HALF]: '◭',     // Half-filled triangle
        [TransformationFill.FULL]: '▲'      // Full triangle
      },
      '◇': { // Diamond
        [TransformationFill.EMPTY]: '◇',    // Empty diamond
        [TransformationFill.QUARTER]: '◈',  // Quarter-filled diamond
        [TransformationFill.HALF]: '◈',     // Half-filled diamond (same as quarter)
        [TransformationFill.FULL]: '◆'      // Full diamond
      },
      '☆': { // Star
        [TransformationFill.EMPTY]: '☆',    // Empty star
        [TransformationFill.QUARTER]: '✦',  // Quarter-filled star
        [TransformationFill.HALF]: '✧',     // Half-filled star
        [TransformationFill.FULL]: '★'      // Full star
      }
    };

    return emojiMap[shape]?.[fill] || shape;
  };

  /**
   * Get text styling based on shape and fill level
   */
  const getShapeTextStyle = (shape: any, color: TransformationColor) => {
    const colorMap = {
      [TransformationColor.RED]: '#FF6B6B',
      [TransformationColor.BLUE]: '#4DABF7', 
      [TransformationColor.GREEN]: '#51CF66',
      [TransformationColor.YELLOW]: '#FFD43B',
      [TransformationColor.PURPLE]: '#CC5DE8',
      [TransformationColor.ORANGE]: '#FF922B',
    };

    return {
      color: colorMap[color] || '#FFFFFF',
    };
  };
  
  /**
   * Render a single shape element with all its properties
   */
  const renderShapeElement = (element: ShapeElement, rowIndex: number, colIndex: number) => {
    const shapeStyle = [
      styles.shape,
      getSizeStyle(element.size),
      { 
        transform: [{ rotate: `${element.rotation}deg` }] 
      }
    ];

    // Get the appropriate emoji for shape and fill combination
    const shapeEmoji = getShapeEmoji(element.shape, element.fill);

    return (
      <View key={`${rowIndex}-${colIndex}`} style={styles.cell}>
        <View style={shapeStyle}>
          <Text style={[styles.shapeText, getShapeTextStyle(element.shape, element.color)]}>
            {shapeEmoji}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render an empty cell
   */
  const renderEmptyCell = (rowIndex: number, colIndex: number) => (
    <View key={`${rowIndex}-${colIndex}`} style={styles.cell}>
      <View style={styles.emptyCell} />
    </View>
  );

  /**
   * Render a row of the grid
   */
  const renderRow = (row: (ShapeElement | null)[], rowIndex: number) => (
    <View key={rowIndex} style={styles.row}>
      {row.map((element, colIndex) => 
        element 
          ? renderShapeElement(element, rowIndex, colIndex)
          : renderEmptyCell(rowIndex, colIndex)
      )}
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

/**
 * Get size-based styling
 */
function getSizeStyle(size: TransformationSize) {
  switch (size) {
    case TransformationSize.SMALL:
      return {
        width: 20,
        height: 20,
      };
    case TransformationSize.MEDIUM:
      return {
        width: 30,
        height: 30,
      };
    case TransformationSize.LARGE:
      return {
        width: 40,
        height: 40,
      };
    default:
      return {
        width: 30,
        height: 30,
      };
  }
}



const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.components.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  
  cell: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  
  shape: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  
  shapeText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.text.white,
  },
  
  emptyCell: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
});