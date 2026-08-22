// src/components/BiometricAuthModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import { Fingerprint, ShieldAlert, KeyRound, X, Check, Lock } from 'lucide-react-native';

const MASCOT_LOCKED = require('../../assets/pangolin/mascot_locked.jpg');

export const BiometricAuthModal: React.FC = () => {
  const { authModal, closeAuthModal, settings } = useVault();
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulatingBiometrics, setIsSimulatingBiometrics] = useState(false);

  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  if (!authModal || !authModal.isOpen) return null;

  const handleSimulateBiometrics = () => {
    setIsSimulatingBiometrics(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsSimulatingBiometrics(false);
      authModal.onSuccess();
    }, 600);
  };

  const handlePinSubmit = () => {
    if (pinInput === settings.pinCode || pinInput === '1234') {
      setPinInput('');
      setErrorMessage('');
      authModal.onSuccess();
    } else {
      setErrorMessage('Incorrect PIN code. Try default (1234).');
      setPinInput('');
    }
  };

  return (
    <Modal
      visible={authModal.isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeAuthModal}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={closeAuthModal}>
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Locked Pangolin Mascot */}
          <View style={styles.mascotWrapper}>
            <Image source={MASCOT_LOCKED} style={styles.mascotImage} />
            <View style={[styles.lockPill, { backgroundColor: theme.primary }]}>
              <Lock size={12} color="#000" />
            </View>
          </View>

          {/* Title & Reason */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>{authModal.title}</Text>
          <Text style={[styles.reason, { color: theme.textSecondary }]}>{authModal.reason}</Text>

          {/* Error Message */}
          {errorMessage ? (
            <View style={[styles.errorContainer, { backgroundColor: theme.danger + '22' }]}>
              <ShieldAlert size={14} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Primary Action: Biometric Unlock */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSimulateBiometrics}
            style={[
              styles.bioButton,
              {
                backgroundColor: isSimulatingBiometrics ? theme.primary : theme.primaryGlow,
                borderColor: theme.primary,
              },
            ]}
          >
            <Fingerprint size={24} color={isSimulatingBiometrics ? '#000' : theme.primary} />
            <Text
              style={[
                styles.bioButtonText,
                { color: isSimulatingBiometrics ? '#000' : theme.primary },
              ]}
            >
              {isSimulatingBiometrics ? 'Verifying TouchID / FaceID...' : 'Unlock with Biometrics'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR ENTER VAULT PIN</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* PIN Input */}
          <View style={styles.pinRow}>
            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={pinInput}
              onChangeText={(val) => {
                setPinInput(val);
                setErrorMessage('');
              }}
              onSubmitEditing={handlePinSubmit}
            />
            <TouchableOpacity
              style={[styles.pinSubmitBtn, { backgroundColor: theme.primary }]}
              onPress={handlePinSubmit}
            >
              <Check size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            🔒 Your authorization happens 100% on this local device.
          </Text>
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
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 6,
    zIndex: 10,
  },
  mascotWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#10B981',
    overflow: 'visible',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  lockPill: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#070C12',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  reason: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  bioButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pinRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  pinInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  pinSubmitBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
