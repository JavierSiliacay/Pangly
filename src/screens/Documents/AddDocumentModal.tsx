// src/screens/Documents/AddDocumentModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { DocumentCategory } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, Camera, Check, ShieldCheck, FileText } from 'lucide-react-native';

interface AddDocumentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ visible, onClose }) => {
  const { addDocument, setScannerModalOpen, settings, profile } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Government');
  const [provider, setProvider] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [expiryDate, setExpiryDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [autoReminder, setAutoReminder] = useState(true);

  const categories: DocumentCategory[] = [
    'Government',
    'Banking',
    'Insurance',
    'Work',
    'School',
    'Vehicle',
    'Other',
  ];

  const handleSave = () => {
    if (!title.trim() || !docNumber.trim()) return;

    addDocument({
      title,
      category,
      provider: provider || 'Official Issuer',
      documentNumber: docNumber,
      fullName: fullName || profile.fullName || undefined,
      expiryDate: expiryDate || undefined,
      issueDate: issueDate || undefined,
      notes: notes || undefined,
      isSensitive: true,
      reminderCreated: autoReminder,
    });

    onClose();
  };

  const handleScanSwitch = () => {
    onClose();
    setScannerModalOpen(true);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Add Document</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                🔒 Encrypted locally on your device
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Camera OCR Quick Switch */}
          <TouchableOpacity
            style={[styles.scanBanner, { backgroundColor: theme.accentCyan + '18', borderColor: theme.accentCyan }]}
            onPress={handleScanSwitch}
          >
            <Camera size={20} color={theme.accentCyan} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.scanTitle, { color: theme.accentCyan }]}>Scan with Camera (OCR)</Text>
              <Text style={[styles.scanSub, { color: theme.textSecondary }]}>
                Auto-fill fields instantly using on-device neural vision
              </Text>
            </View>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* Category selector */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      category === cat
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: category === cat ? '#000' : theme.textSecondary, fontWeight: category === cat ? '700' : '500' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Document Title */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>DOCUMENT TITLE *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Passport, PhilHealth, TIN"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Provider */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ISSUING AUTHORITY / PROVIDER</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. DFA, SSS, LTO Philippines, BDO"
                placeholderTextColor={theme.textMuted}
                value={provider}
                onChangeText={setProvider}
              />
            </View>

            {/* Document Number */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>DOCUMENT / ID NUMBER *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. 12-3456789-0"
                placeholderTextColor={theme.textMuted}
                value={docNumber}
                onChangeText={setDocNumber}
              />
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>FULL NAME ON DOCUMENT</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Full Name"
                placeholderTextColor={theme.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Expiry & Issue Dates */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>EXPIRATION DATE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>ISSUE DATE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                  value={issueDate}
                  onChangeText={setIssueDate}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NOTES / DETAILS</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Add special notes, restrictions, or branch details"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Auto-reminder toggle */}
            <TouchableOpacity
              style={[styles.reminderToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setAutoReminder(!autoReminder)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleText, { color: theme.textPrimary }]}>Auto-create Expiration Reminder</Text>
                <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                  Notifies you 30 days before document expires
                </Text>
              </View>
              <View style={[styles.checkbox, { backgroundColor: autoReminder ? theme.primary : 'transparent', borderColor: theme.primary }]}>
                {autoReminder && <Check size={14} color="#000" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#000" />
              <Text style={styles.saveBtnText}>Save Document to Vault</Text>
            </TouchableOpacity>
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
    marginBottom: 14,
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
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  scanTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  scanSub: {
    fontSize: 11,
    marginTop: 1,
  },
  form: {
    gap: 12,
    paddingBottom: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  catScroll: {
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
