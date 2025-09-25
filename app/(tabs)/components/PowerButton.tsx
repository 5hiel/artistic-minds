import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { buttonStyles } from '@/src/design';

export interface PowerButtonProps {
  icon: string;
  label: string;
  count: number;
  maxCount: number;
  onPress: () => void;
  disabled?: boolean;
  iconColor?: string;
  onPurchase?: () => Promise<void>;
  purchasing?: boolean;
  levelIndex?: number; // Level-based theming
  variant?: 'primary' | 'purchase'; // Button variant
}

const PowerButton: React.FC<PowerButtonProps> = ({
  icon,
  label,
  count,
  maxCount,
  onPress,
  disabled = false,
  iconColor,
  onPurchase,
  purchasing = false,
  levelIndex = 0,
  variant = 'primary'
}) => {
  const isDisabled = disabled || (count <= 0 && !onPurchase);
  const showPurchaseButton = count <= 0 && onPurchase;
  
  // Get appropriate variant for unified option button styling
  const getButtonVariant = () => {
    if (purchasing) return 'power-disabled';
    if (showPurchaseButton) return 'power-purchase';
    if (isDisabled) return 'power-disabled';
    return 'power';
  };

  const buttonVariant = getButtonVariant();
  const styles = buttonStyles.option(levelIndex, buttonVariant);
  
  if (showPurchaseButton) {
    return (
      <TouchableOpacity
        style={[styles.container, { flex: 1, marginHorizontal: 2, marginVertical: 4, minWidth: 110 }]}
        onPress={onPurchase}
        disabled={purchasing}
        accessibilityLabel={`Buy 10 ${label} for $0.99`}
        accessibilityRole="button"
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.text}>
            💰 $0.99{purchasing ? ' ...' : ''}
          </Text>
          <Text style={[styles.text, { fontSize: 14, fontStyle: 'italic' }]}>
            BUY 10
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[styles.container, { flex: 1, marginHorizontal: 2, marginVertical: 4, minWidth: 110 }]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={`${label}: ${count} of ${maxCount} remaining`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.text}>
          <Text style={{ color: '#ffffff' }}>{icon}</Text> {count}
        </Text>
        <Text style={[styles.text, { fontSize: 14, fontStyle: 'italic' }]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PowerButton;