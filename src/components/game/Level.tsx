import React from 'react';
import { Text } from 'react-native';
import { cardStyles } from '@/src/design';

const LEVELS = ['Seeker', 'Learner', 'Thinker', 'Creator', 'Visionary'];

export interface LevelProps {
  index: number; // 0-based index
  levelIndex?: number;
}

export default function Level({ index, levelIndex = 0 }: LevelProps) {
  const styles = cardStyles.status(levelIndex);
  const safeLevel = Math.max(0, Math.min(index, LEVELS.length - 1));
  
  return (
    <Text style={styles.text}>{LEVELS[safeLevel].toUpperCase()}</Text>
  );
}

