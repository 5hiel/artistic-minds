import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, zIndex } from '@/src/design';

interface FlashOverlayProps {
  show: boolean;
}

/**
 * Flash overlay component for visual feedback on correct answers
 */
export default function FlashOverlay({ show }: FlashOverlayProps) {
  if (!show) return null;

  return <View style={styles.flashOverlay} />;
}

const styles = StyleSheet.create({
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.semantic.success,
    opacity: 0.2,
    zIndex: zIndex.flash,
  },
});