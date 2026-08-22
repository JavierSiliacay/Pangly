// src/components/mascot/MascotRig.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MascotMood } from '../../engine/mascotStateMachine';
import { VisemeType } from '../../engine/lipSyncEngine';
import { PanglyAnimatedMascot } from './PanglyAnimatedMascot';

interface MascotRigProps {
  mood?: MascotMood;
  viseme?: VisemeType;
  size?: number;
  onPress?: () => void;
  showOrb?: boolean;
}

const MascotRigComponent: React.FC<MascotRigProps> = ({
  mood = 'idle',
  viseme = 'REST',
  size = 140,
  onPress,
  showOrb = true,
}) => {
  const isTalking = viseme !== 'REST';

  const mascotContent = (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {showOrb && (
        <View
          style={[
            styles.glowOrb,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
            },
          ]}
        />
      )}
      <PanglyAnimatedMascot
        mood={mood}
        size={size}
        isTalking={isTalking}
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {mascotContent}
      </TouchableOpacity>
    );
  }

  return mascotContent;
};

// Strict memoization: Only re-render when mood or size actually changes
export const MascotRig = React.memo(
  MascotRigComponent,
  (prev, next) =>
    prev.mood === next.mood &&
    prev.size === next.size &&
    prev.showOrb === next.showOrb &&
    prev.viseme === next.viseme &&
    prev.onPress === next.onPress
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    transform: [{ scale: 1.1 }],
  },
});
