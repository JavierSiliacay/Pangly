// src/components/mascot/PanglyNpcPuppet.tsx

import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { MascotMood, MOOD_CONFIGS } from '../../engine/mascotStateMachine';
import { VisemeType } from '../../engine/lipSyncEngine';
import { MascotMouthVisemes } from './MascotMouthVisemes';

const POSE_WAVING = require('../../../assets/pangolin/pangly_pose_waving.png');
const POSE_THINKING = require('../../../assets/pangolin/pangly_pose_thinking.png');
const POSE_SHIELD = require('../../../assets/pangolin/pangly_pose_shield.png');
const POSE_CELEBRATE = require('../../../assets/pangolin/pangly_pose_celebrate.png');

export interface PanglyNpcPuppetProps {
  mood?: MascotMood;
  viseme?: VisemeType;
  size?: number;
  onPress?: () => void;
  showGlow?: boolean;
}

export const PanglyNpcPuppet: React.FC<PanglyNpcPuppetProps> = ({
  mood = 'idle',
  viseme = 'REST',
  size = 140,
  onPress,
  showGlow = true,
}) => {
  const config = MOOD_CONFIGS[mood] || MOOD_CONFIGS.idle;

  // Animation values
  const breatheAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const glowPulseAnim = useRef(new Animated.Value(0.7)).current;

  // 1. Natural Breathing Loop (Vertical + slight scale)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: -config.breathingAmplitude,
          duration: (config.breathingRate * 1000) / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: (config.breathingRate * 1000) / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mood, config.breathingRate, config.breathingAmplitude]);

  // 2. Head Tilt & Inquisitive Angle Spring
  useEffect(() => {
    Animated.spring(tiltAnim, {
      toValue: config.headTiltAngle,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [config.headTiltAngle]);

  // 3. Glowing Emerald Privacy Core Pulse
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulseAnim, {
          toValue: 1.0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulseAnim, {
          toValue: 0.6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, []);

  // 4. Natural Stochastic Eye Blinking
  useEffect(() => {
    if (mood === 'sleeping' || mood === 'shield_guard') {
      blinkAnim.setValue(0);
      return;
    }

    let isMounted = true;
    let timeoutId: any;
    const triggerBlink = () => {
      if (!isMounted) return;
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.05,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted) {
          const nextInterval = config.eyeBlinkInterval + (Math.random() * 1000 - 500);
          timeoutId = setTimeout(triggerBlink, Math.max(1800, nextInterval));
        }
      });
    };

    timeoutId = setTimeout(triggerBlink, config.eyeBlinkInterval);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [mood, config.eyeBlinkInterval]);

  // Handle Tap Bounce
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  // Determine active 3D character pose directly from logo
  let characterImage = POSE_WAVING;
  if (mood === 'shield_guard' || mood === 'sleeping') {
    characterImage = POSE_SHIELD;
  } else if (mood === 'thinking' || mood === 'concerned' || mood === 'confused') {
    characterImage = POSE_THINKING;
  } else if (mood === 'success' || mood === 'celebrate') {
    characterImage = POSE_CELEBRATE;
  } else if (mood === 'idle' || mood === 'waiting') {
    characterImage = POSE_WAVING;
  }

  const tiltInterpolation = tiltAnim.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-12deg', '12deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={handlePress}
      style={[styles.container, { width: size, height: size }]}
    >
      {/* Glowing Emerald Aura Halo */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glowHalo,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
              opacity: glowPulseAnim,
            },
          ]}
        />
      )}

      {/* Layer-Rigged Character Puppet */}
      <Animated.View
        style={[
          styles.puppetLayer,
          {
            width: size,
            height: size,
            transform: [
              { translateY: breatheAnim },
              { rotate: tiltInterpolation },
              { scale: bounceAnim },
            ],
          },
        ]}
      >
        <Image
          source={characterImage}
          style={styles.characterImage}
          resizeMode="contain"
        />

        {/* Dynamic Mouth Viseme Overlay (for talking/dialogue states) */}
        {(mood === 'talking' || mood === 'welcome') && viseme !== 'REST' && (
          <View style={[styles.mouthOverlay, { bottom: size * 0.38, left: size * 0.44 }]}>
            <MascotMouthVisemes viseme={viseme} width={size * 0.16} height={size * 0.1} themeColor="#3E1A06" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const OwnlyNpcPuppet = PanglyNpcPuppet;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  },
  puppetLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  mouthOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
