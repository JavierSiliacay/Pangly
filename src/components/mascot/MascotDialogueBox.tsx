// src/components/mascot/MascotDialogueBox.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { VisemeType } from '../../engine/lipSyncEngine';
import { Sparkles, ChevronRight } from 'lucide-react-native';

interface MascotDialogueBoxProps {
  dialogue: string;
  speakerName?: string;
  onComplete?: () => void;
  onVisemeChange?: (viseme: VisemeType) => void;
  actions?: { label: string; primary?: boolean; onPress: () => void }[];
}

export const MascotDialogueBox: React.FC<MascotDialogueBoxProps> = ({
  dialogue,
  speakerName = 'Pangly • Your Private Companion 🛡️',
  onComplete,
  actions = [],
}) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Self-contained typewriter effect (does not trigger mascot re-renders)
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    let charIndex = 0;
    let isCancelled = false;

    const interval = setInterval(() => {
      if (isCancelled) return;

      if (charIndex < dialogue.length) {
        setDisplayedText(dialogue.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
        if (onComplete) onComplete();
      }
    }, 24);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [dialogue]);

  // Fast forward skip
  const handleSkip = () => {
    setDisplayedText(dialogue);
    setIsTypingComplete(true);
    if (onComplete) onComplete();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Speaker Tag */}
      <View style={styles.header}>
        <View style={[styles.speakerBadge, { backgroundColor: theme.primaryGlow }]}>
          <Sparkles size={12} color={theme.primary} />
          <Text style={[styles.speakerName, { color: theme.primary }]}>{speakerName}</Text>
        </View>

        {!isTypingComplete && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip ⏩</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Dialogue Text */}
      <TouchableOpacity activeOpacity={1} onPress={handleSkip} style={styles.textContainer}>
        <Text style={[styles.dialogueText, { color: theme.textPrimary }]}>
          {displayedText}
          {!isTypingComplete && <Text style={[styles.cursor, { color: theme.primary }]}> ▌</Text>}
        </Text>
      </TouchableOpacity>

      {/* Action Buttons if any */}
      {isTypingComplete && actions.length > 0 && (
        <View style={styles.actionRow}>
          {actions.map((act, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={act.onPress}
              style={[
                styles.actionBtn,
                act.primary
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.actionText,
                  { color: act.primary ? '#000000' : theme.textPrimary, fontWeight: act.primary ? '700' : '600' },
                ]}
              >
                {act.label}
              </Text>
              <ChevronRight size={14} color={act.primary ? '#000000' : theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  speakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speakerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textContainer: {
    minHeight: 60,
    justifyContent: 'center',
  },
  dialogueText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  cursor: {
    fontSize: 14,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
  },
});
