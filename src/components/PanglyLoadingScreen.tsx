// src/components/PanglyLoadingScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Master Animated Pangolin & Mini Vault GIF
const PANGLY_LOADING_GIF = require('../../assets/pangolin/pangly_loading.gif');

interface PanglyLoadingScreenProps {
  onFinish?: () => void;
}

export const PanglyLoadingScreen: React.FC<PanglyLoadingScreenProps> = ({
  onFinish,
}) => {
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    'Opening your private vault...',
    'Securing records on device...',
    'Welcome back.',
  ];

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Immediate, Crisp Entrance Fade & Pop (350ms)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Soft Emerald Aura Breathing Loop (Loops indefinitely)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Loading Bar: Exactly 10.0 Seconds Smooth Fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 4. Status Text Transitions across the 10 seconds
    const t1 = setTimeout(() => {
      Animated.sequence([
        Animated.timing(textFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      setStatusIndex(1);
    }, 3200);

    const t2 = setTimeout(() => {
      Animated.sequence([
        Animated.timing(textFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      setStatusIndex(2);
    }, 6800);

    // 5. Complete immediately after the 10-second loading bar finishes
    const exitTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 10200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#060D0A" />

      {/* Pulsing Emerald Aura Glow */}
      <Animated.View
        style={[
          styles.auraGlow,
          {
            opacity: glowAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      <Animated.View style={[styles.centerContent, { transform: [{ scale: scaleAnim }] }]}>
        {/* Animated Pangolin Holding Mini Vault (Continuous GIF loop) */}
        <View style={styles.mascotWrapper}>
          <Image
            source={PANGLY_LOADING_GIF}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>PANGLY</Text>

        {/* Slogan */}
        <View style={styles.sloganRow}>
          <Text style={styles.sloganHighlight}>Store it.</Text>
          <Text style={styles.sloganDot}>•</Text>
          <Text style={styles.sloganHighlight}>Ask it.</Text>
          <Text style={styles.sloganDot}>•</Text>
          <Text style={styles.sloganHighlight}>Own it.</Text>
        </View>

        {/* Privacy Pill Badge */}
        <View style={styles.privacyBadge}>
          <ShieldCheck size={13} color="#10B981" />
          <Text style={styles.privacyBadgeText}>100% On-Device • Encrypted</Text>
        </View>

        {/* 10-Second Loading Bar Track */}
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        {/* Live Status Row */}
        <Animated.View style={[styles.statusRow, { opacity: textFadeAnim }]}>
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.statusText}>{statusMessages[statusIndex]}</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#060D0A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  auraGlow: {
    position: 'absolute',
    width: width * 0.82,
    height: width * 0.82,
    borderRadius: (width * 0.82) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mascotWrapper: {
    width: 185,
    height: 185,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mascotImage: {
    width: 185,
    height: 185,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 6,
  },
  sloganRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sloganHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  sloganDot: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 22,
  },
  privacyBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressBarBg: {
    width: 220,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 22,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
