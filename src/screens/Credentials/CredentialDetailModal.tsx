// src/screens/Credentials/CredentialDetailModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CredentialItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import {
  X,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Lock,
  Globe,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react-native';

interface CredentialDetailModalProps {
  credential: CredentialItem | null;
  visible: boolean;
  onClose: () => void;
}

export const CredentialDetailModal: React.FC<CredentialDetailModalProps> = ({
  credential,
  visible,
  onClose,
}) => {
  const { deleteCredential, requestBiometricAuth, copyToClipboardWithTimeout, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [isRevealed, setIsRevealed] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!credential || !visible) return null;

  const handleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }
    requestBiometricAuth({
      title: 'Reveal Secret Password',
      reason: `Biometric authentication required to reveal password for ${credential.service}.`,
      onSuccess: () => setIsRevealed(true),
    });
  };

  const handleCopyPassword = () => {
    copyToClipboardWithTimeout(credential.password || '', `${credential.service} Password`);
  };

  const handleCopyUsername = () => {
    copyToClipboardWithTimeout(credential.username, `${credential.service} Username`);
  };

  const handleDelete = () => {
    deleteCredential(credential.id);
    setDeleteConfirm(false);
    onClose();
  };

  const displayPassword = isRevealed ? credential.password : '••••••••••••••••';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={[styles.badge, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>{credential.category}</Text>
              </View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{credential.service}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Password Display Box */}
            <View style={[styles.passBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.passHeader}>
                <Lock size={14} color={theme.primary} />
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>PASSWORD</Text>
              </View>

              <Text style={[styles.passText, { color: theme.textPrimary }]}>{displayPassword}</Text>

              <View style={styles.passActionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.surfaceElevated }]}
                  onPress={handleReveal}
                >
                  {isRevealed ? <EyeOff size={16} color={theme.primary} /> : <Eye size={16} color={theme.textPrimary} />}
                  <Text style={[styles.actionBtnText, { color: isRevealed ? theme.primary : theme.textPrimary }]}>
                    {isRevealed ? 'Hide' : 'Reveal'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={handleCopyPassword}
                >
                  <Copy size={16} color="#000" />
                  <Text style={[styles.actionBtnText, { color: '#000' }]}>Copy Password</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Username & Website */}
            <View style={[styles.fieldCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <User size={16} color={theme.textMuted} />
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>USERNAME / EMAIL</Text>
                    <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>{credential.username}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: theme.surfaceElevated }]}
                  onPress={handleCopyUsername}
                >
                  <Copy size={16} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              {credential.website && (
                <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                  <View style={styles.fieldLeft}>
                    <Globe size={16} color={theme.textMuted} />
                    <View>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>WEBSITE</Text>
                      <Text style={[styles.fieldValue, { color: theme.accentCyan }]}>{credential.website}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Notes */}
            {credential.notes && (
              <View style={[styles.notesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>ENCRYPTED NOTES</Text>
                <Text style={[styles.notesText, { color: theme.textSecondary }]}>{credential.notes}</Text>
              </View>
            )}

            {/* Delete button */}
            <TouchableOpacity
              style={[styles.deleteBtn, { backgroundColor: theme.danger + '18', borderColor: theme.danger }]}
              onPress={() => setDeleteConfirm(true)}
            >
              <Trash2 size={16} color={theme.danger} />
              <Text style={[styles.deleteText, { color: theme.danger }]}>Delete Credential</Text>
            </TouchableOpacity>

            {/* Delete Confirmation */}
            {deleteConfirm && (
              <View style={[styles.confirmCard, { backgroundColor: theme.danger + '22', borderColor: theme.danger }]}>
                <Text style={[styles.confirmTitle, { color: theme.danger }]}>Delete this credential?</Text>
                <Text style={[styles.confirmSub, { color: theme.textSecondary }]}>
                  This login will be permanently removed from your encrypted device storage.
                </Text>
                <View style={styles.confirmRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.border }]}
                    onPress={() => setDeleteConfirm(false)}
                  >
                    <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmDeleteBtn, { backgroundColor: theme.danger }]}
                    onPress={handleDelete}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Confirm Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.privacyFooter}>
              <ShieldCheck size={14} color={theme.primary} />
              <Text style={[styles.privacyText, { color: theme.textMuted }]}>
                🔒 Passwords are encrypted with AES-256 and stored strictly on this device.
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    gap: 14,
    paddingBottom: 20,
  },
  passBox: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  passText: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 2,
    marginVertical: 4,
  },
  passActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  confirmTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmSub: {
    fontSize: 12,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  privacyText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
