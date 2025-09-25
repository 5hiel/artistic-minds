import React from 'react';
import { View, Text } from 'react-native';
import { cardStyles, layoutStyles, spacing } from '@/src/design';
import Level from './Level';

interface GameTopBarContainerProps {
  highScore: number;
  levelIndex: number;
}

/**
 * Top bar component displaying game status indicators
 */
export default function GameTopBarContainer({
  highScore,
  levelIndex
}: GameTopBarContainerProps) {
  const styles = cardStyles.status(levelIndex);
  const layoutStyle = layoutStyles.section(levelIndex);

  return (
    <View style={layoutStyle.centeredContainer}>
      {/* High Score in rounded box */}
      <View style={[styles.container, { flex: 1, marginRight: spacing.sm }]}>
        <Text style={styles.text}>{highScore}</Text>
        <Text style={styles.label}>HIGH SCORE</Text>
      </View>

      {/* Level in center container */}
      <View style={[styles.container, { flex: 1, marginLeft: spacing.sm }]}>
        <Level index={levelIndex} levelIndex={levelIndex} />
        <Text style={styles.label}>LEVEL</Text>
      </View>
    </View>
  );
}