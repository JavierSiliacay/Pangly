// src/components/PangolinCompanion.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import { MascotRig } from './mascot/MascotRig';
import { MascotMood } from '../engine/mascotStateMachine';
import { Sparkles, Shield, Lock, Eye } from 'lucide-react-native';

const MASCOT_AWAKE = require('../../assets/pangolin/mascot_awake.jpg');
const MASCOT_LOCKED = require('../../assets/pangolin/mascot_locked.jpg');
const MASCOT_SEARCHING = require('../../assets/pangolin/mascot_searching.jpg');

interface PangolinCompanionProps {
  mood?: 'awake' | 'locked' | 'searching' | 'compact' | MascotMood;
  size?: number;
  showBubble?: boolean;
  onPress?: () => void;
  customMessage?: string;
  useVectorRig?: boolean;
}

export const PangolinCompanion: React.FC<PangolinCompanionProps> = ({
  mood = 'awake',
  size = 64,
  showBubble = false,
  onPress,
  customMessage,
  useVectorRig = false,
}) => {
  const { settings, documents, maintenance, reminders } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(showBubble);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Generate contextual dynamic smart tips
  const tips = [
    customMessage || `🔒 Everything stays safe and encrypted on this phone.`,
    `💡 Ask me anything about your documents, vehicle logs, or private notes.`,
    `🛡️ Zero tracking • 100% private to you.`,
  ];

  const handleTap = () => {
    // Spring bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Cycle through smart tips
    setBubbleIndex((prev) => (prev + 1) % tips.length);
    setBubbleVisible(true);

    if (onPress) onPress();
  };

  // Map mood to MascotRig mood if vector rig is requested or size is large
  let mappedRigMood: MascotMood = 'idle';
  if (mood === 'locked' || mood === 'shield_guard') mappedRigMood = 'shield_guard';
  else if (mood === 'searching' || mood === 'thinking') mappedRigMood = 'thinking';
  else if (mood === 'awake' || mood === 'welcome') mappedRigMood = 'welcome';
  else if (['idle', 'welcome', 'talking', 'waiting', 'thinking', 'success', 'concerned', 'confused', 'sleeping', 'shield_guard'].includes(mood as string)) {
    mappedRigMood = mood as MascotMood;
  }

  let imageSource = MASCOT_AWAKE;
  if (mood === 'locked' || mood === 'shield_guard') imageSource = MASCOT_LOCKED;
  else if (mood === 'searching' || mood === 'thinking') imageSource = MASCOT_SEARCHING;

  return (
    <View style={styles.wrapper}>
      {/* Speech / Tip Bubble */}
      {bubbleVisible && (
        <Animated.View
          style={[
            styles.bubble,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.primary,
            },
          ]}
        >
          <View style={styles.bubbleHeader}>
            <Sparkles size={12} color={theme.primary} />
            <Text style={[styles.bubbleTitle, { color: theme.primary }]}>Pango Tip</Text>
            <TouchableOpacity onPress={() => setBubbleVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: theme.textMuted, fontSize: 10 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.bubbleText, { color: theme.textPrimary }]}>{tips[bubbleIndex]}</Text>
        </Animated.View>
      )}

      {/* Animated Mascot Rig */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MascotRig
          mood={mappedRigMood}
          size={size}
          onPress={handleTap}
          showOrb={size >= 80}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    borderWidth: 2,
    padding: 2,
    position: 'relative',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bubble: {
    position: 'absolute',
    bottom: '105%',
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
    marginBottom: 8,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bubbleTitle: {
    fontSize: 10,
    fontWeight: '800',
    flex: 1,
    marginLeft: 4,
  },
  closeBtn: {
    padding: 2,
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
