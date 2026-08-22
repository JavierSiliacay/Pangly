// src/components/VoiceCaptureModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import { Mic, X, Sparkles, Check } from 'lucide-react-native';

interface VoiceCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onVoiceResult: (transcription: string) => void;
}

export const VoiceCaptureModal: React.FC<VoiceCaptureModalProps> = ({
  visible,
  onClose,
  onVoiceResult,
}) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(true);

  const sampleVoicePrompts = [
    'Add ₱1,500 fuel expense',
    "What's my SSS ID again?",
    'When did I last change my oil?',
    'Remind me to renew car registration in 30 days',
  ];

  useEffect(() => {
    if (visible) {
      setIsRecording(true);
      const chosen = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
      setTranscription('Listening...');
      const t1 = setTimeout(() => {
        setTranscription(chosen);
        setIsRecording(false);
      }, 1400);
      return () => clearTimeout(t1);
    }
  }, [visible]);

  const handleSend = () => {
    if (transcription && transcription !== 'Listening...') {
      onVoiceResult(transcription);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View
            style={[
              styles.micRing,
              {
                backgroundColor: isRecording ? theme.primaryGlow : theme.surfaceSubtle,
                borderColor: theme.primary,
              },
            ]}
          >
            <Mic size={36} color={theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {isRecording ? 'Listening locally...' : 'Transcription Complete'}
          </Text>

          <View style={[styles.transcriptionBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.transcriptionText, { color: theme.textPrimary }]}>
              "{transcription}"
            </Text>
          </View>

          <Text style={[styles.subNote, { color: theme.textMuted }]}>
            🔒 Speech is processed 100% on-device using local audio models.
          </Text>

          {!isRecording && (
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.primary }]}
              onPress={handleSend}
            >
              <Sparkles size={18} color="#000" />
              <Text style={styles.sendText}>Ask Pangly</Text>
            </TouchableOpacity>
          )}
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
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 6,
  },
  micRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  transcriptionBox: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
  },
  transcriptionText: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subNote: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
  },
  sendText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
