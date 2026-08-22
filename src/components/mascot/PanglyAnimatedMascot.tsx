// src/components/mascot/PanglyAnimatedMascot.tsx

import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { MascotMood } from '../../engine/mascotStateMachine';

// Static require mappings for animated GIF assets
const GIF_ASSETS = {
  waving: require('../../../assets/pangolin/pangly_waving.gif'),
  idle: require('../../../assets/pangolin/pangly_idle.gif'),
  thinking: require('../../../assets/pangolin/pangly_thinking.gif'),
  shield: require('../../../assets/pangolin/pangly_shield.gif'),
  celebrate: require('../../../assets/pangolin/pangly_celebrate.gif'),
};

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
  imageStyle,
  isTalking = false,
}) => {
  // Select active GIF loop based on mood / action (Default: calm ownly_idle.gif)
  let activeGif = GIF_ASSETS.idle;

  if (mood === 'thinking' || mood === 'searching' || mood === 'confused' || mood === 'concerned') {
    activeGif = GIF_ASSETS.thinking;
  } else if (mood === 'shield_guard' || mood === 'sleeping' || mood === 'sleep' || mood === 'locked') {
    activeGif = GIF_ASSETS.shield;
  } else if (mood === 'celebrate') {
    activeGif = GIF_ASSETS.celebrate;
  } else if (mood === 'waving' || mood === 'welcome' || (isTalking && mood === 'talking')) {
    activeGif = GIF_ASSETS.waving;
  } else {
    // Default calm, idle companion state
    activeGif = GIF_ASSETS.idle;
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={activeGif}
        style={[
          styles.gifImage,
          { width: size, height: size },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

// Strict memoization: NEVER re-render or restart GIF decoding when parent text/typing state changes
export const PanglyAnimatedMascot = React.memo(
  PanglyAnimatedMascotComponent,
  (prev, next) =>
    prev.mood === next.mood &&
    prev.size === next.size &&
    prev.isTalking === next.isTalking &&
    prev.style === next.style &&
    prev.imageStyle === next.imageStyle
);

export const OwnlyAnimatedMascot = PanglyAnimatedMascot;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifImage: {
    backgroundColor: 'transparent',
  },
});
