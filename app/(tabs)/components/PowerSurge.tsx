import React from 'react';
import { Text } from 'react-native';
import { cardStyles } from '@/src/design';

export interface PowerSurgeProps {
  value?: number;
  correctAnswers?: number;
  isInPowerSurge?: boolean;
  levelIndex?: number;
}

export default function PowerSurge({ 
  value = 1, 
  correctAnswers = 0, 
  isInPowerSurge = false,
  levelIndex = 0
}: PowerSurgeProps) {
  const styles = cardStyles.status(levelIndex);
  const icon = isInPowerSurge ? '🔥' : '⚡';
  const displayValue = isInPowerSurge ? `+${value}` : correctAnswers.toString();
  
  return (
    <Text style={styles.text}>
      {icon} {displayValue}
    </Text>
  );
}

