import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FigureElement, GeometricShape, ShadingLevel, ReflectionType } from '@/src/lib/puzzles/visual/sequentialFigures';
import { colors, spacing, typography } from '@/src/design';

interface SequentialFiguresRendererProps {
  sequence: FigureElement[];
  showMissingPlaceholder?: boolean;
}

/**
 * Renders a Sequential Figures puzzle showing geometric shapes in sequence
 * Handles rotations, reflections, shading, position changes, and element modifications
 */
export default function SequentialFiguresRenderer({ 
  sequence, 
  showMissingPlaceholder = true 
}: SequentialFiguresRendererProps) {
  
  const renderFigure = (figure: FigureElement, index: number) => {
    const shapeStyle = [
      styles.shape,
      getShadingStyle(figure.shading),
      getPositionStyle(figure.position),
      { 
        transform: [
          { rotate: `${figure.rotation}deg` },
          ...(figure.reflection === ReflectionType.HORIZONTAL ? [{ scaleY: -1 }] : []),
          ...(figure.reflection === ReflectionType.VERTICAL ? [{ scaleX: -1 }] : [])
        ]
      }
    ];

    return (
      <View key={index} style={styles.figureContainer}>
        <View style={shapeStyle}>
          <Text style={styles.shapeText}>
            {getShapeDisplay(figure)}
          </Text>
        </View>
        {figure.elements >= 1 && (
          <Text style={styles.elementsText}>
            {getElementsDisplay(figure.elements)}
          </Text>
        )}
      </View>
    );
  };

  const renderMissingPlaceholder = () => (
    <View style={styles.figureContainer}>
      <View style={[styles.shape, styles.missingFigure]}>
        <Text style={styles.questionMark}>?</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sequenceContainer}>
        {sequence.map((figure, index) => renderFigure(figure, index))}
        {showMissingPlaceholder && renderMissingPlaceholder()}
      </View>
    </View>
  );
}

/**
 * Get the display representation of a shape with its properties
 */
function getShapeDisplay(figure: FigureElement): string {
  const baseShape = figure.shape;
  
  // Apply shading to the shape symbol if needed
  switch (figure.shading) {
    case ShadingLevel.LIGHT:
      return getOutlineVersion(baseShape);
    case ShadingLevel.MEDIUM:
      return getPartialVersion(baseShape);
    case ShadingLevel.DARK:
      return getFilledVersion(baseShape);
    default:
      return baseShape;
  }
}

/**
 * Get outline version of shape
 */
function getOutlineVersion(shape: GeometricShape): string {
  switch (shape) {
    case GeometricShape.TRIANGLE:
      return '△';
    case GeometricShape.SQUARE:
      return '□';
    case GeometricShape.CIRCLE:
      return '○';
    case GeometricShape.STAR:
      return '☆';
    case GeometricShape.PENTAGON:
      return '⬟';
    case GeometricShape.HEXAGON:
      return '⬢';
    default:
      return shape;
  }
}

/**
 * Get partially filled version of shape
 */
function getPartialVersion(shape: GeometricShape): string {
  switch (shape) {
    case GeometricShape.TRIANGLE:
      return '◬'; // Partially filled triangle
    case GeometricShape.SQUARE:
      return '▣';
    case GeometricShape.CIRCLE:
      return '◐';
    case GeometricShape.STAR:
      return '✦';
    default:
      return shape;
  }
}

/**
 * Get filled version of shape
 */
function getFilledVersion(shape: GeometricShape): string {
  switch (shape) {
    case GeometricShape.TRIANGLE:
      return '▲';
    case GeometricShape.SQUARE:
      return '■';
    case GeometricShape.CIRCLE:
      return '●';
    case GeometricShape.STAR:
      return '★';
    case GeometricShape.PENTAGON:
      return '⬢'; // Use hexagon as filled pentagon
    case GeometricShape.HEXAGON:
      return '⬣'; // Filled hexagon
    default:
      return shape;
  }
}

/**
 * Get elements display (dots, lines for element count)
 */
function getElementsDisplay(count: number): string {
  if (count <= 0) return '';

  // Create visual representation of elements - show actual count
  const dots = '•'.repeat(Math.min(count, 8)); // Show up to 8 dots
  return count > 8 ? `${dots}+` : dots;
}

/**
 * Get shading-based styling
 */
function getShadingStyle(shading: ShadingLevel) {
  switch (shading) {
    case ShadingLevel.LIGHT:
      return {
        backgroundColor: 'transparent',
        borderColor: colors.text.white,
        borderWidth: 2,
      };
    case ShadingLevel.MEDIUM:
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderColor: colors.text.white,
        borderWidth: 1,
      };
    case ShadingLevel.DARK:
      return {
        backgroundColor: colors.text.white,
        borderColor: colors.text.white,
        borderWidth: 1,
      };
    default:
      return {
        backgroundColor: 'transparent',
        borderColor: colors.text.white,
        borderWidth: 2,
      };
  }
}

/**
 * Get position-based styling (for position shifts)
 */
function getPositionStyle(position: { x: number; y: number }) {
  // Use absolute positioning for clearer movement visualization
  // Position values typically range from -1 to 1, center at (0,0)
  // Map to a 3x3 grid within the container
  const centerX = 40; // Half of container width (80px)
  const centerY = 40; // Half of container height (80px)
  const gridSize = 25; // Distance between grid positions

  return {
    position: 'absolute' as const,
    left: centerX + (position.x * gridSize),
    top: centerY + (position.y * gridSize),
  };
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 80,
    gap: spacing.lg,
  },
  
  figureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,  // Increased from 60 to accommodate larger movements
    minHeight: 80, // Increased from 60 to accommodate larger movements
    position: 'relative',
    // Add padding to prevent shapes from being cut off when they move
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  
  shape: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  
  shapeText: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.text.primary,
  },
  
  elementsText: {
    position: 'absolute',
    bottom: -5,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  missingFigure: {
    backgroundColor: 'transparent',
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