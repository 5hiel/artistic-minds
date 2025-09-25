import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { buttonStyles } from '@/src/design';
import FollowingDirectionsRenderer from '@/src/components/puzzles/FollowingDirectionsRenderer';
import SequentialFiguresRenderer from '@/src/components/puzzles/SequentialFiguresRenderer';

interface OptionButtonProps {
  option: string | object; // Allow both string and object options for Sequential Figures
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
  levelIndex?: number; // Level-based theming
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  index,
  isSelected,
  isCorrect,
  disabled,
  onSelect,
  levelIndex = 0
}) => {
  // Determine variant based on selection state
  const getVariant = () => {
    if (!isSelected) return 'default';
    return isCorrect ? 'correct' : 'incorrect';
  };

  const variant = getVariant();
  const styles = buttonStyles.option(levelIndex, variant);
  
  // Check if this option contains a Following Directions grid (pipe-separated emojis)
  const isFollowingDirectionsGrid = typeof option === 'string' && option.includes('|') &&
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|⬜|⬛/u.test(option);

  // Check if this option is a Sequential Figures element (FigureElement object)
  let isSequentialFigureElement = false;
  let figureElement = null;

  try {
    // Try to parse as JSON if it's a string representation of a FigureElement
    if (typeof option === 'string' && option.startsWith('{') && option.includes('shape')) {
      figureElement = JSON.parse(option);
      isSequentialFigureElement = figureElement &&
        typeof figureElement === 'object' &&
        'shape' in figureElement &&
        'position' in figureElement;
    }
    // Or if it's already an object with the right structure
    else if (typeof option === 'object' && option !== null && 'shape' in option && 'position' in option) {
      figureElement = option;
      isSequentialFigureElement = true;
    }
  } catch {
    // Not a valid JSON or FigureElement, continue with text rendering
  }
  
  return (
    <Pressable
      onPress={() => onSelect(index)}
      disabled={disabled}
      style={styles.container}
    >
      {isFollowingDirectionsGrid ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.text, { textAlign: 'center', marginBottom: 4 }]}>
            {String.fromCharCode(65 + index)})
          </Text>
          <FollowingDirectionsRenderer gridString={option as string} />
        </View>
      ) : isSequentialFigureElement && figureElement ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.text, { textAlign: 'center', marginBottom: 8 }]}>
            {String.fromCharCode(65 + index)})
          </Text>
          <SequentialFiguresRenderer
            sequence={[figureElement]}
            showMissingPlaceholder={false}
          />
        </View>
      ) : (
        <Text style={[styles.text, { textAlign: 'left', lineHeight: 22 }]}>
          {String.fromCharCode(65 + index)}) {
            typeof option === 'object' && option !== null
              ? JSON.stringify(option).slice(0, 50) + '...'
              : option
          }
        </Text>
      )}
    </Pressable>
  );
};

export default OptionButton;

