// src/screens/Settings/DeviceMigrationModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, QrCode, Wifi, ShieldCheck, ArrowRight, CheckCircle2, Smartphone } from 'lucide-react-native';

interface DeviceMigrationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DeviceMigrationModal: React.FC<DeviceMigrationModalProps> = ({ visible, onClose }) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [mode, setMode] = useState<'select' | 'qr_pair' | 'transferring' | 'success'>('select');

  const handleStartPairing = () => {
    setMode('qr_pair');
  };

  const handleSimulateTransfer = () => {
    setMode('transferring');
    setTimeout(() => {
      setMode('success');
    }, 1800);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Device Migration</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Encrypted peer-to-peer device transfer
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Step 1: Option selection */}
            {mode === 'select' && (
              <View style={styles.contentBox}>
                <View style={[styles.optionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.primaryGlow }]}>
                    <QrCode size={24} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>QR Code Pairing</Text>
                    <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                      Point new phone camera at this screen for instant encrypted link
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: theme.primary }]}
                    onPress={handleStartPairing}
                  >
                    <ArrowRight size={16} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.optionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.accentCyan + '22' }]}>
                    <Wifi size={24} color={theme.accentCyan} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Local Wi-Fi / AirDrop</Text>
                    <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                      Transfer directly over the local network with zero cloud storage
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: theme.accentCyan }]}
                    onPress={handleStartPairing}
                  >
                    <ArrowRight size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 2: QR Pairing Simulator */}
            {mode === 'qr_pair' && (
              <View style={styles.centerBox}>
                <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Scan on New Device</Text>
                <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
                  Open Pangly on your new phone and choose "Restore from Nearby Device"
                </Text>

                {/* Simulated QR Box */}
                <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]}>
                  <QrCode size={180} color="#000000" />
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSimulateTransfer}
                >
                  <Smartphone size={18} color="#000" />
                  <Text style={styles.actionBtnText}>Simulate New Device Connected</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: Transferring */}
            {mode === 'transferring' && (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginTop: 18 }]}>
                  Encrypting & Streaming Vault...
                </Text>
                <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
                  Direct AES-256 peer stream between devices.
                </Text>
              </View>
            )}

            {/* Step 4: Success */}
            {mode === 'success' && (
              <View style={styles.centerBox}>
                <CheckCircle2 size={56} color={theme.primary} />
                <Text style={[styles.stepTitle, { color: theme.textPrimary, marginTop: 14 }]}>
                  Transfer Complete!
                </Text>
                <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
                  Your vault has been decrypted and securely loaded onto your new device.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary, marginTop: 18 }]}
                  onPress={onClose}
                >
                  <Text style={styles.actionBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.privacyNote}>
              <ShieldCheck size={14} color={theme.primary} />
              <Text style={[styles.privacyNoteText, { color: theme.textMuted }]}>
                Data is transferred directly between physical devices over an encrypted channel.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    gap: 14,
    paddingBottom: 20,
  },
  contentBox: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  smallBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 48,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  privacyNoteText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
