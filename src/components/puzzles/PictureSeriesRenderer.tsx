import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeriesFigure, SeriesShape, SeriesColor, SeriesSize, SeriesPosition } from '@/src/lib/puzzles/visual/pictureSeries';
import { colors, spacing, typography } from '@/src/design';

interface PictureSeriesRendererProps {
  series: SeriesFigure[];
  hiddenIndex: number;
}

/**
 * Renders a Picture Series puzzle showing geometric figures in sequence
 * Displays shapes, colors, sizes, positions, and rotations
 */
export default function PictureSeriesRenderer({ series, hiddenIndex }: PictureSeriesRendererProps) {
  const renderFigure = (figure: SeriesFigure, index: number) => {
    if (index === hiddenIndex) {
      return (
        <View key={index} style={[styles.figureContainer, styles.hiddenFigure]}>
          <Text style={styles.questionMark}>?</Text>
        </View>
      );
    }

    const shapeStyle = [
      styles.shape,
      getShapeStyle(figure.shape),
      getColorStyle(figure.color),
      getSizeStyle(figure.size),
      getPositionStyle(figure.position),
      { transform: [{ rotate: `${figure.rotation}deg` }] }
    ];

    return (
      <View key={index} style={styles.figureContainer}>
        <View style={shapeStyle}>
          <Text style={styles.shapeText}>
            {getShapeSymbol(figure.shape)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.seriesContainer}>
        {series.map((figure, index) => renderFigure(figure, index))}
        {hiddenIndex >= series.length && (
          <View style={[styles.figureContainer, styles.hiddenFigure]}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Get shape symbol from enum
 */
function getShapeSymbol(shape: SeriesShape): string {
  return shape; // SeriesShape enum values are already symbols like '△', '■', etc.
}

/**
 * Get shape-specific styles
 */
function getShapeStyle(shape: SeriesShape) {
  const baseStyle = {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  switch (shape) {
    case SeriesShape.CIRCLE:
      return { ...baseStyle, borderRadius: 20 };
    case SeriesShape.SQUARE:
      return { ...baseStyle, borderRadius: 0 };
    case SeriesShape.TRIANGLE:
      return { ...baseStyle, borderRadius: 0 };
    case SeriesShape.DIAMOND:
      return { ...baseStyle, borderRadius: 0, transform: [{ rotate: '45deg' }] };
    case SeriesShape.STAR:
      return { ...baseStyle, borderRadius: 0 };
    case SeriesShape.PENTAGON:
      return { ...baseStyle, borderRadius: 8 };
    case SeriesShape.HEXAGON:
      return { ...baseStyle, borderRadius: 6 };
    default:
      return baseStyle;
  }
}

/**
 * Get color styles from enum
 */
function getColorStyle(color?: SeriesColor) {
  if (!color) return { backgroundColor: colors.text.white };
  
  switch (color) {
    case SeriesColor.RED:
      return { backgroundColor: '#F44336' };
    case SeriesColor.BLUE:
      return { backgroundColor: '#2196F3' };
    case SeriesColor.GREEN:
      return { backgroundColor: '#4CAF50' };
    case SeriesColor.YELLOW:
      return { backgroundColor: '#FFEB3B' };
    case SeriesColor.PURPLE:
      return { backgroundColor: '#9C27B0' };
    case SeriesColor.ORANGE:
      return { backgroundColor: '#FF9800' };
    default:
      return { backgroundColor: colors.text.white };
  }
}

/**
 * Get size styles
 */
function getSizeStyle(size: SeriesSize) {
  switch (size) {
    case SeriesSize.SMALL:
      return { 
        width: 30, 
        height: 30,
        fontSize: 16
      };
    case SeriesSize.MEDIUM:
      return { 
        width: 40, 
        height: 40,
        fontSize: 20
      };
    case SeriesSize.LARGE:
      return { 
        width: 50, 
        height: 50,
        fontSize: 24
      };
    default:
      return { 
        width: 40, 
        height: 40,
        fontSize: 20
      };
  }
}

/**
 * Get position styles (for layout within container)
 */
function getPositionStyle(position: SeriesPosition) {
  switch (position) {
    case SeriesPosition.TOP:
      return { alignSelf: 'flex-start' as const };
    case SeriesPosition.BOTTOM:
      return { alignSelf: 'flex-end' as const };
    case SeriesPosition.LEFT:
      return { marginRight: spacing.sm };
    case SeriesPosition.RIGHT:
      return { marginLeft: spacing.sm };
    case SeriesPosition.CENTER:
    default:
      return { alignSelf: 'center' as const };
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  
  seriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 80,
    gap: spacing.md,
  },
  
  figureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 60,
  },
  
  shape: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.text.white,
  },
  
  shapeText: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  
  hiddenFigure: {
    backgroundColor: colors.components.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.text.white,
    borderStyle: 'dashed',
  },
  
  questionMark: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.white,
    textAlign: 'center',
  },
});