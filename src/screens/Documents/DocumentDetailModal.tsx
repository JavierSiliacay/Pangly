// src/screens/Documents/DocumentDetailModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Image,
} from 'react-native';
import { DocumentItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import {
  X,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Trash2,
  FileText,
  Clock,
} from 'lucide-react-native';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  visible: boolean;
  onClose: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  visible,
  onClose,
}) => {
  const { deleteDocument, requestBiometricAuth, copyToClipboardWithTimeout, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [isRevealed, setIsRevealed] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!document || !visible) return null;

  const handleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }
    requestBiometricAuth({
      title: 'Reveal Sensitive Document ID',
      reason: `Biometric verification required to reveal ${document.title} number.`,
      onSuccess: () => setIsRevealed(true),
    });
  };

  const handleCopy = () => {
    copyToClipboardWithTimeout(document.documentNumber || '', document.title);
  };

  const handleShare = async () => {
    requestBiometricAuth({
      title: 'Export / Share Document',
      reason: 'Biometric authorization required to export sensitive document data.',
      onSuccess: async () => {
        try {
          await Share.share({
            message: `Pangly Document: ${document.title}\nProvider: ${document.provider || 'N/A'}\nFull Name: ${document.fullName || 'N/A'}\nID Number: ${document.documentNumber || 'N/A'}\nExpiry: ${document.expiryDate || 'N/A'}`,
          });
        } catch (e) {}
      },
    });
  };

  const handleDelete = () => {
    deleteDocument(document.id);
    setDeleteConfirmOpen(false);
    onClose();
  };

  const docNum = document.documentNumber || '';
  const displayDocNumber = isRevealed
    ? docNum
    : docNum.length > 4
    ? '••••••••' + docNum.slice(-4)
    : '••••••••';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Top Bar */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.categoryText, { color: theme.primary }]}>{document.category}</Text>
              </View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{document.title}</Text>
              <Text style={[styles.provider, { color: theme.textSecondary }]}>{document.provider}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Scanned Image / Front Document Mockup */}
            {document.imageUri ? (
              <View style={[styles.docRealImageBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Image source={{ uri: document.imageUri }} style={styles.docRealImage} resizeMode="cover" />
                <View style={[styles.privateBadgeOverlay, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
                  <ShieldCheck size={12} color={theme.primary} />
                  <Text style={[styles.privateBadgeText, { color: theme.primary }]}>Stored 100% On-Device</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.docImageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <FileText size={36} color={theme.primary} />
                <Text style={[styles.docMockHeader, { color: theme.textPrimary }]}>{(document.provider || 'DOCUMENT').toUpperCase()}</Text>
                <Text style={[styles.docMockSub, { color: theme.textMuted }]}>{document.fullName || ''}</Text>
                <Text style={[styles.docMockNumber, { color: theme.accentCyan }]}>{displayDocNumber}</Text>
              </View>
            )}

            {/* Fields List */}
            <View style={[styles.fieldCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {/* Document Number */}
              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <Hash size={16} color={theme.textMuted} />
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>DOCUMENT NUMBER</Text>
                    <Text style={[styles.fieldValueMono, { color: theme.textPrimary }]}>{displayDocNumber}</Text>
                  </View>
                </View>
                <View style={styles.fieldActions}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={handleReveal}
                  >
                    {isRevealed ? <EyeOff size={16} color={theme.primary} /> : <Eye size={16} color={theme.textPrimary} />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={handleCopy}
                  >
                    <Copy size={16} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Full Name */}
              <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                <View style={styles.fieldLeft}>
                  <User size={16} color={theme.textMuted} />
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>FULL NAME</Text>
                    <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>{document.fullName}</Text>
                  </View>
                </View>
              </View>

              {/* Expiry Date */}
              {document.expiryDate && (
                <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                  <View style={styles.fieldLeft}>
                    <Clock size={16} color={theme.accentAmber} />
                    <View>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>EXPIRATION DATE</Text>
                      <Text style={[styles.fieldValue, { color: theme.accentAmber }]}>{document.expiryDate}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Issue Date */}
              {document.issueDate && (
                <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                  <View style={styles.fieldLeft}>
                    <Calendar size={16} color={theme.textMuted} />
                    <View>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>ISSUE DATE</Text>
                      <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>{document.issueDate}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Notes */}
            {document.notes && (
              <View style={[styles.notesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>NOTES</Text>
                <Text style={[styles.notesText, { color: theme.textSecondary }]}>{document.notes}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                onPress={handleShare}
              >
                <Share2 size={16} color={theme.textPrimary} />
                <Text style={[styles.shareText, { color: theme.textPrimary }]}>Share Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: theme.danger + '18', borderColor: theme.danger }]}
                onPress={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 size={16} color={theme.danger} />
              </TouchableOpacity>
            </View>

            {/* Delete Confirmation Alert */}
            {deleteConfirmOpen && (
              <View style={[styles.confirmCard, { backgroundColor: theme.danger + '22', borderColor: theme.danger }]}>
                <Text style={[styles.confirmTitle, { color: theme.danger }]}>
                  Delete this document from vault?
                </Text>
                <Text style={[styles.confirmSub, { color: theme.textSecondary }]}>
                  This record will be permanently wiped from your local device.
                </Text>
                <View style={styles.confirmRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.border }]}
                    onPress={() => setDeleteConfirmOpen(false)}
                  >
                    <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmDeleteBtn, { backgroundColor: theme.danger }]}
                    onPress={handleDelete}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.privacyFooter}>
              <ShieldCheck size={14} color={theme.primary} />
              <Text style={[styles.privacyText, { color: theme.textMuted }]}>
                Encrypted and stored locally. Never uploaded to external servers.
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  provider: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    gap: 14,
    paddingBottom: 20,
  },
  docRealImageBox: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  docRealImage: {
    width: '100%',
    height: '100%',
  },
  privateBadgeOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  privateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docImageCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  docMockHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
  docMockSub: {
    fontSize: 13,
  },
  docMockNumber: {
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: 4,
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
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  fieldValueMono: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: 2,
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
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
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
