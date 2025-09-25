import React from 'react';
import { View, Text } from 'react-native';
import { cardStyles, layoutStyles } from '@/src/design';

interface ScoreDisplayProps {
  score: number;
  seconds: number;
  powerSurge: number;
  correctAnswers?: number;
  isInPowerSurge?: boolean;
  levelIndex?: number;
}

/**
 * Component for displaying current score, timer, and power surge
 */
export default function ScoreDisplay({ score, seconds, powerSurge, correctAnswers = 0, isInPowerSurge = false, levelIndex = 0 }: ScoreDisplayProps) {
  const styles = cardStyles.metric(levelIndex);
  const layoutStyle = layoutStyles.section(levelIndex);

  return (
    <View style={layoutStyle.scoreContainer}>
      <View style={styles.container}>
        <Text style={styles.text}>Score: </Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Time: </Text>
        <Text style={styles.value}>{seconds}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Power: </Text>
        <Text style={styles.value}>
          {isInPowerSurge ? '🔥' : '⚡'} {isInPowerSurge ? `+${powerSurge}` : 1}
        </Text>
      </View>
    </View>
  );
}