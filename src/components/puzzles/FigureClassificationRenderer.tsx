import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing } from '@/src/design';

// Import types from the figure classification module
export interface FigureElement {
  shape: string;
  size: string;
  color: string;
  pattern: string;
  rotation: number;
}

interface FigureClassificationRendererProps {
  figures: FigureElement[];
}

export default function FigureClassificationRenderer({ figures }: FigureClassificationRendererProps) {
  const renderFigure = (figure: FigureElement, index: number) => {
    // Get size multiplier
    const getSizeMultiplier = (size: string) => {
      switch (size) {
        case 'small': return 0.8;
        case 'large': return 1.4;
        default: return 1.0; // medium
      }
    };

    // Get color style
    const getColorStyle = (color: string) => {
      const colorMap: { [key: string]: string } = {
        red: '#FF6B6B',
        blue: '#4DABF7',
        green: '#51CF66',
        yellow: '#FFD43B',
        purple: '#9775FA',
        orange: '#FF8C42',
        black: '#343A40',
        gray: '#868E96'
      };
      return { color: colorMap[color] || colors.text.white };
    };

    // Apply rotation transform
    const rotationStyle = {
      transform: [{ rotate: `${figure.rotation}deg` }]
    };

    const sizeMultiplier = getSizeMultiplier(figure.size);
    const colorStyle = getColorStyle(figure.color);

    // Get pattern-specific styling and shape modifications
    const getPatternStyle = (pattern: string, shape: string) => {
      switch (pattern) {
        case 'hollow':
          // Use hollow versions of shapes where available
          const hollowShapes: { [key: string]: string } = {
            '●': '○', // Solid circle to hollow circle
            '■': '□', // Solid square to hollow square
            '▲': '△', // Solid triangle to hollow triangle
            '◆': '◇', // Solid diamond to hollow diamond
            '★': '☆', // Solid star to hollow star
          };
          return {
            shape: hollowShapes[shape] || shape,
            opacity: 1.0,
            textDecorationLine: 'none' as const
          };
        
        case 'checkered':
          return {
            shape: '▣', // Use checkered block regardless of original shape
            opacity: 1.0,
            textDecorationLine: 'none' as const
          };
        
        case 'striped':
          return {
            shape: shape,
            opacity: 1.0,
            textDecorationLine: 'underline' as const
          };
        
        case 'dotted':
          return {
            shape: '⚫', // Use dotted representation
            opacity: 0.7,
            textDecorationLine: 'none' as const
          };
        
        default: // solid
          return {
            shape: shape,
            opacity: 1.0,
            textDecorationLine: 'none' as const
          };
      }
    };

    const patternStyle = getPatternStyle(figure.pattern, figure.shape);

    return (
      <View key={index} style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        minWidth: 80,
        minHeight: 80,
      }}>
        <View style={[rotationStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{
            fontSize: 32 * sizeMultiplier,
            ...colorStyle,
            textAlign: 'center',
            opacity: patternStyle.opacity,
            textDecorationLine: patternStyle.textDecorationLine,
          }}>
            {patternStyle.shape}
          </Text>
        </View>
        
        {/* Label */}
        <Text style={{
          color: colors.text.white,
          fontSize: 12,
          marginTop: spacing.xs,
          fontWeight: 'bold'
        }}>
          {String.fromCharCode(65 + index)}
        </Text>
      </View>
    );
  };

  return (
    <View style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: spacing.lg,
      marginTop: spacing.md,
      marginHorizontal: spacing.sm,
    }}>
      <Text style={{
        color: colors.text.white,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: spacing.md
      }}>
        Figures to Classify
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
      }}>
        {figures.map((figure, index) => renderFigure(figure, index))}
      </View>
    </View>
  );
}