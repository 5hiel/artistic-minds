import React from 'react';
import { View } from 'react-native';
import { contentStyles } from '@/src/design';
import OptionButton from './OptionButton';

interface PuzzleOptionsContainerProps {
  options: (string | object)[]; // Support mixed string and object options
  selectedOption: number | null;
  correctAnswerIndex: number;
  removedOptions?: Set<number>;
  onSelect: (index: number) => void;
  levelIndex?: number;
}

/**
 * Container component for rendering puzzle answer options
 */
export default function PuzzleOptionsContainer({
  options,
  selectedOption,
  correctAnswerIndex,
  removedOptions = new Set(),
  onSelect,
  levelIndex = 0,
}: PuzzleOptionsContainerProps) {
  const styles = contentStyles.options(levelIndex);
  
  // Handle case where options might be undefined
  if (!options || !Array.isArray(options)) {
    return <View style={styles.container} />;
  }
  
  const visibleOptions = options.map((option, index) => ({
    option,
    originalIndex: index,
  })).filter(({ originalIndex }) => !removedOptions.has(originalIndex));
  
  return (
    <View style={styles.container}>
      {visibleOptions.map(({ option, originalIndex }) => (
        <View key={originalIndex} style={styles.option}>
          <OptionButton
            option={option}
            index={originalIndex}
            isSelected={selectedOption === originalIndex}
            isCorrect={originalIndex === correctAnswerIndex}
            disabled={selectedOption === correctAnswerIndex}
            onSelect={onSelect}
            levelIndex={levelIndex}
          />
        </View>
      ))}
    </View>
  );
}

