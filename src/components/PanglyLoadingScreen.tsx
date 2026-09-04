// src/components/PanglyLoadingScreen.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ShieldCheck, WifiOff } from 'lucide-react-native';
import {
  areModelsDownloaded,
  downloadModels,
  cancelDownload,
  OverallProgress,
} from '../services/modelDownloadService';

const { width } = Dimensions.get('window');

const PANGLY_LOADING_GIF = require('../../assets/pangolin/pangly_loading.gif');

interface PanglyLoadingScreenProps {
  onFinish?: () => void;
}

type Phase = 'checking' | 'downloading' | 'loading' | 'done';

export const PanglyLoadingScreen: React.FC<PanglyLoadingScreenProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<Phase>('checking');
  const [dlProgress, setDlProgress] = useState<OverallProgress | null>(null);
  const [dlError, setDlError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    'Opening your private vault...',
    'Securing records on device...',
    'Welcome back.',
  ];

  // ─── Animation values ────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const dlBarAnim = useRef(new Animated.Value(0)).current;

  // ─── Entrance animation ──────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 35, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.35, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ─── Normal loading animation (models already downloaded) ────────────────
  const startNormalLoading = useCallback(() => {
    setPhase('loading');

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const t1 = setTimeout(() => {
      Animated.sequence([
        Animated.timing(textFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setStatusIndex(1);
    }, 800);

    const t2 = setTimeout(() => {
      Animated.sequence([
        Animated.timing(textFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setStatusIndex(2);
    }, 1400);

    const exitTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setPhase('done');
        if (onFinish) onFinish();
      });
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
    };
  }, [onFinish]);

  const hasStartedDownload = useRef(false);

  // ─── Check on mount whether models need downloading ──────────────────────
  useEffect(() => {
    if (hasStartedDownload.current) return;
    hasStartedDownload.current = true;

    areModelsDownloaded().then((downloaded) => {
      if (downloaded) {
        startNormalLoading();
      } else {
        setPhase('downloading');
        startDownload();
      }
    });
  }, []);

  // ─── Download flow ───────────────────────────────────────────────────────
  const startDownload = useCallback(async () => {
    setDlError(null);

    const success = await downloadModels((progress) => {
      setDlProgress(progress);

      const activeModelProgress = progress.models.agent.progress;
      // Animate the download progress bar smoothly
      Animated.timing(dlBarAnim, {
        toValue: activeModelProgress,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });

    if (success) {
      // Model download complete -> transition immediately to onboarding/vault
      startNormalLoading();
    } else {
      setDlError('Setup couldn\'t complete. Check your connection and try again.');
    }
  }, [startNormalLoading]);

  // ─── Derived download bar width ──────────────────────────────────────────
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const dlBarWidth = dlBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ─── Download Phase UI ───────────────────────────────────────────────────
  if (phase === 'downloading') {
    const activeModel = dlProgress?.models.agent ?? null;

    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" backgroundColor="#060D0A" />

        <Animated.View style={[styles.auraGlow, { opacity: glowAnim }]} />

        <Animated.View style={[styles.centerContent, { transform: [{ scale: scaleAnim }] }]}>
          <Image source={PANGLY_LOADING_GIF} style={styles.mascotImage} resizeMode="contain" />

          <Text style={styles.brandTitle}>PANGLY</Text>

          {/* One-time setup header */}
          <View style={styles.setupHeaderBox}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.setupHeaderText}>One-time Private Setup</Text>
          </View>

          <Text style={styles.setupSubtext}>
            Everything stays on your device. This only happens once.
          </Text>

          {/* Active model card */}
          {activeModel ? (
            <View style={styles.modelCard}>
              <Text style={styles.modelCardTitle}>{activeModel.displayName}</Text>
              <Text style={styles.modelCardDesc}>{activeModel.displayDesc}</Text>

              {/* Progress bar */}
              <View style={styles.downloadBarBg}>
                <Animated.View style={[styles.downloadBarFill, { width: dlBarWidth }]} />
              </View>

              {/* Speed / progress line */}
              {activeModel.speedLabel ? (
                <Text style={styles.speedLabel}>{activeModel.speedLabel}</Text>
              ) : null}

              {/* ETA */}
              {dlProgress?.etaLabel ? (
                <Text style={styles.etaLabel}>{dlProgress.etaLabel}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.modelCard}>
              <Text style={styles.modelCardTitle}>Setting up Pangly AI</Text>
              <Text style={styles.modelCardDesc}>Getting things ready...</Text>
              <View style={styles.downloadBarBg}>
                <Animated.View style={[styles.downloadBarFill, { width: '5%' }]} />
              </View>
            </View>
          )}

          {/* Error state */}
          {dlError ? (
            <View style={styles.errorBox}>
              <WifiOff size={16} color="#F87171" />
              <Text style={styles.errorText}>{dlError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setDlError(null);
                  startDownload();
                }}
              >
                <Text style={styles.retryBtnText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Animated.View>
      </Animated.View>
    );
  }

  // ─── Normal Loading Phase UI (models ready) ──────────────────────────────
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#060D0A" />

      <Animated.View style={[styles.auraGlow, { opacity: glowAnim, transform: [{ scale: scaleAnim }] }]} />

      <Animated.View style={[styles.centerContent, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.mascotWrapper}>
          <Image source={PANGLY_LOADING_GIF} style={styles.mascotImage} resizeMode="contain" />
        </View>

        <Text style={styles.brandTitle}>PANGLY</Text>

        <View style={styles.sloganRow}>
          <Text style={styles.sloganHighlight}>Store it.</Text>
          <Text style={styles.sloganDot}>•</Text>
          <Text style={styles.sloganHighlight}>Ask it.</Text>
          <Text style={styles.sloganDot}>•</Text>
          <Text style={styles.sloganHighlight}>Own it.</Text>
        </View>

        <View style={styles.privacyBadge}>
          <ShieldCheck size={13} color="#10B981" />
          <Text style={styles.privacyBadgeText}>100% On-Device • Encrypted</Text>
        </View>

        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
        </View>

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
    width: '100%',
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
    color: 'rgba(255,255,255,0.3)',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // ── Download-specific styles ──
  setupHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    marginBottom: 8,
  },
  setupHeaderText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  setupSubtext: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11.5,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 17,
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginBottom: 4,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepLine: {
    width: 60,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
    marginBottom: 16,
  },
  stepLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#10B981',
  },
  modelCard: {
    width: width - 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
    padding: 16,
    marginBottom: 12,
  },
  modelCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  modelCardDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11.5,
    marginBottom: 12,
    lineHeight: 17,
  },
  downloadBarBg: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  downloadBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  speedLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  etaLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  errorBox: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
