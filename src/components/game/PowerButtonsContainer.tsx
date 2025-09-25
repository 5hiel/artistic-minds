import React from 'react';
import { View } from 'react-native';
import PowerButton from './PowerButton';
import { usePowerButtons } from '@/src/hooks/usePowerButtons';
import { LEVELS } from '@/src/constants/gameConfig';

// Feature flag - should match the one in usePowerButtons
const PURCHASES_ENABLED = true;

export interface PowerButtonsProps {
  onSkipPuzzle: () => Promise<void>;
  onAddTime: () => Promise<void>;
  onRemoveWrongAnswers: () => Promise<void>;
  usedRemoveTwo?: boolean;
  currentScore?: number; // For determining level
  levelIndex?: number;
}

const PowerButtonsContainer: React.FC<PowerButtonsProps> = ({
  onSkipPuzzle,
  onAddTime,
  onRemoveWrongAnswers,
  usedRemoveTwo = false,
  currentScore = 0,
  levelIndex: propLevelIndex
}) => {
  // Calculate current level based on score
  const getCurrentLevel = (score: number) => {
    let level = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (score >= LEVELS[i].threshold) {
        level = i;
        break;
      }
    }
    return level;
  };

  const levelIndex = propLevelIndex ?? getCurrentLevel(currentScore);
  const {
    skip,
    addTime,
    removeWrong,
    consumeSkip,
    consumeAddTime,
    consumeRemoveWrong,
    resetIfNeeded,
    purchaseSkip,
    purchaseAddTime,
    purchaseRemoveWrong
  } = usePowerButtons();

  const [purchasing, setPurchasing] = React.useState({
    skip: false,
    addTime: false,
    removeWrong: false
  });

  // Check for daily reset on each render
  React.useEffect(() => {
    resetIfNeeded();
  }, [resetIfNeeded]);

  const handleSkip = async () => {
    if (consumeSkip()) {
      await onSkipPuzzle();
    }
  };

  const handleAddTime = async () => {
    if (consumeAddTime()) {
      await onAddTime();
    }
  };

  const handleRemoveWrong = async () => {
    if (consumeRemoveWrong()) {
      await onRemoveWrongAnswers();
    }
  };

  // Purchase handlers
  const handlePurchaseSkip = async () => {
    setPurchasing(prev => ({ ...prev, skip: true }));
    try {
      const result = await purchaseSkip();
      if (result.success) {
        // Show success message or handle success
        console.log('Purchase successful!');
      } else {
        // Show error message
        console.error('Purchase failed:', result.error);
        alert(`Purchase failed: ${result.error}`);
      }
    } finally {
      setPurchasing(prev => ({ ...prev, skip: false }));
    }
  };

  const handlePurchaseAddTime = async () => {
    setPurchasing(prev => ({ ...prev, addTime: true }));
    try {
      const result = await purchaseAddTime();
      if (result.success) {
        console.log('Purchase successful!');
      } else {
        console.error('Purchase failed:', result.error);
        alert(`Purchase failed: ${result.error}`);
      }
    } finally {
      setPurchasing(prev => ({ ...prev, addTime: false }));
    }
  };

  const handlePurchaseRemoveWrong = async () => {
    setPurchasing(prev => ({ ...prev, removeWrong: true }));
    try {
      const result = await purchaseRemoveWrong();
      if (result.success) {
        console.log('Purchase successful!');
      } else {
        console.error('Purchase failed:', result.error);
        alert(`Purchase failed: ${result.error}`);
      }
    } finally {
      setPurchasing(prev => ({ ...prev, removeWrong: false }));
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 4,
      gap: 4,
      width: '100%'
    }}>
      <PowerButton
        icon="➤"
        label="SKIP"
        count={skip}
        maxCount={10}
        onPress={handleSkip}
        onPurchase={PURCHASES_ENABLED ? handlePurchaseSkip : undefined}
        purchasing={purchasing.skip}
        levelIndex={levelIndex}
      />
      <PowerButton
        icon="🕐"
        label="+15 SECS"
        count={addTime}
        maxCount={10}
        onPress={handleAddTime}
        onPurchase={PURCHASES_ENABLED ? handlePurchaseAddTime : undefined}
        purchasing={purchasing.addTime}
        levelIndex={levelIndex}
      />
      <PowerButton
        icon="½"
        label="50-50"
        count={removeWrong}
        maxCount={10}
        onPress={handleRemoveWrong}
        disabled={usedRemoveTwo}
        onPurchase={PURCHASES_ENABLED ? handlePurchaseRemoveWrong : undefined}
        purchasing={purchasing.removeWrong}
        levelIndex={levelIndex}
      />
    </View>
  );
};

export default PowerButtonsContainer;