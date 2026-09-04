// src/components/mascot/PanglyAnimatedMascot.tsx

import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { MascotMood } from '../../engine/mascotStateMachine';
import { PanglyNpcPuppet } from './PanglyNpcPuppet';

export interface PanglyAnimatedMascotProps {
  mood?: MascotMood | 'searching' | 'sleep' | 'compact' | 'awake' | 'locked' | 'celebrate' | 'waving';
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  isTalking?: boolean;
}

const PanglyAnimatedMascotComponent: React.FC<PanglyAnimatedMascotProps> = ({
  mood = 'idle',
  size = 140,
  style,
  isTalking = false,
}) => {
  // Normalize mood to MascotMood for PanglyNpcPuppet
  let mappedMood: MascotMood = 'idle';

  if (mood === 'thinking' || mood === 'searching' || mood === 'confused' || mood === 'concerned') {
    mappedMood = 'thinking';
  } else if (mood === 'shield_guard' || mood === 'sleeping' || mood === 'sleep' || mood === 'locked') {
    mappedMood = 'shield_guard';
  } else if (mood === 'celebrate') {
    mappedMood = 'celebrate';
  } else if (mood === 'waving' || mood === 'welcome') {
    mappedMood = 'waving';
  } else if (isTalking || mood === 'talking') {
    mappedMood = 'talking';
  } else {
    mappedMood = 'idle';
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <PanglyNpcPuppet
        mood={mappedMood}
        size={size}
        viseme={isTalking ? 'SMILE' : 'REST'}
        showGlow={false}
      />
    </View>
  );
};

// Strict memoization: Only re-render when mood or size actually changes
export const PanglyAnimatedMascot = React.memo(
  PanglyAnimatedMascotComponent,
  (prev, next) =>
    prev.mood === next.mood &&
    prev.size === next.size &&
    prev.isTalking === next.isTalking &&
    prev.style === next.style
);

export const OwnlyAnimatedMascot = PanglyAnimatedMascot;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

