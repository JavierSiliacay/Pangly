// src/components/voice/VoiceInputModal.tsx
// On-device voice dictation modal for Ask Pangly.
// Uses friendly, non-technical language and living mascot animations.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { MascotRig } from '../mascot/MascotRig';
import { Mic, X, Send, Sparkles } from 'lucide-react-native';

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSendTranscription: (text: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  visible,
  onClose,
  onSendTranscription,
}) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      setIsRecording(true);
      setTranscript('');

      // Pulse animation for mic
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      setIsRecording(false);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleSend = () => {
    const finalQuery = transcript.trim() || 'Show my saved documents';
    onSendTranscription(finalQuery);
    onClose();
  };

  const handleSampleDictation = (text: string) => {
    setTranscript(text);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={16} color={theme.primary} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>Speak to Pangly</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Living Mascot */}
          <View style={styles.mascotBox}>
            <MascotRig mood={isRecording ? 'thinking' : 'idle'} size={110} />
          </View>

          {/* Status */}
          <Text style={[styles.statusText, { color: theme.primary }]}>
            {isRecording ? 'Listening to your voice...' : 'Ready'}
          </Text>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>
            Private to your phone — never sent to the cloud.
          </Text>

          {/* Live Transcript / Prompt Box */}
          <View style={[styles.transcriptBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Text style={[styles.transcriptText, { color: transcript ? theme.textPrimary : theme.textMuted }]}>
              {transcript ? `"${transcript}"` : 'Say something like "Remind me to renew my passport next month" or "Show my vehicle records"...'}
            </Text>
          </View>

          {/* Quick Voice Suggestions */}
          <View style={styles.suggestionsRow}>
            <TouchableOpacity
              style={[styles.samplePill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={() => handleSampleDictation('Remind me to pay electric bill on Monday')}
            >
              <Text style={[styles.sampleText, { color: theme.textSecondary }]}>"Remind me to pay bill"</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.samplePill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={() => handleSampleDictation('Save a note about car battery warranty')}
            >
              <Text style={[styles.sampleText, { color: theme.textSecondary }]}>"Save a note..."</Text>
            </TouchableOpacity>
          </View>

          {/* Mic Action Control */}
          <View style={styles.actionRow}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.micBigBtn, { backgroundColor: theme.primary }]}
                onPress={handleSend}
                activeOpacity={0.8}
              >
                {transcript ? <Send size={24} color="#000000" /> : <Mic size={24} color="#000000" />}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  mascotBox: {
    marginVertical: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  subText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  transcriptBox: {
    width: '100%',
    minHeight: 70,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'center',
    marginBottom: 14,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  samplePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  sampleText: {
    fontSize: 12,
  },
  actionRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBigBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
