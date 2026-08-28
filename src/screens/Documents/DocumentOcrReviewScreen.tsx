// src/screens/Documents/DocumentOcrReviewScreen.tsx
// Gate 2 — User reviews and edits extracted text before saving to vault.
// Shown after Gate 1 confirmation. Every field is editable so 100% accuracy is guaranteed.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { parseDocumentFields } from '../../services/ocrService';
import { CheckCircle, Edit3, ChevronDown } from 'lucide-react-native';
import { DocumentCategory } from '../../types/vault';

interface DocumentOcrReviewScreenProps {
  photoUri: string;
  ocrText: string;
  ocrExtractedAt: string;
  onSave: (fields: {
    title: string;
    category: DocumentCategory;
    documentNumber: string;
    fullName: string;
    issueDate: string;
    expiryDate: string;
    ocrText: string;
    ocrExtractedAt: string;
    imageUri: string;
  }) => void;
  onBack: () => void;
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Government', 'Banking', 'Insurance', 'Work', 'School', 'Vehicle', 'Other',
];

export const DocumentOcrReviewScreen: React.FC<DocumentOcrReviewScreenProps> = ({
  photoUri,
  ocrText,
  ocrExtractedAt,
  onSave,
  onBack,
}) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  // Pre-fill from OCR parsing
  const parsed = parseDocumentFields(ocrText);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Government');
  const [docNumber, setDocNumber] = useState(parsed.documentNumber ?? '');
  const [fullName, setFullName] = useState(parsed.fullName ?? '');
  const [issueDate, setIssueDate] = useState(parsed.issueDate ?? '');
  const [expiryDate, setExpiryDate] = useState(parsed.expiryDate ?? '');
  const [showCategories, setShowCategories] = useState(false);
  const [showFullOcr, setShowFullOcr] = useState(false);

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      category,
      documentNumber: docNumber.trim(),
      fullName: fullName.trim(),
      issueDate: issueDate.trim(),
      expiryDate: expiryDate.trim(),
      ocrText,
      ocrExtractedAt,
      imageUri: photoUri,
    });
  };

  const inputStyle = [styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }];
  const labelStyle = [styles.label, { color: theme.textMuted }];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Review & Save</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Edit any field before saving</Text>
        </View>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Thumbnail + OCR source info */}
        <View style={[styles.sourceRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Image source={{ uri: photoUri }} style={styles.thumbnail} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sourceLabel, { color: theme.textPrimary }]}>
              Text read from your photo
            </Text>
            <Text style={[styles.sourceSub, { color: theme.textMuted }]}>
              {ocrText.length > 0
                ? `${ocrText.split('\n').filter(Boolean).length} lines detected`
                : 'No text detected — fill in manually below'}
            </Text>
            <TouchableOpacity onPress={() => setShowFullOcr(!showFullOcr)} style={styles.rawToggle}>
              <Edit3 size={12} color={theme.primary} />
              <Text style={[styles.rawToggleText, { color: theme.primary }]}>
                {showFullOcr ? 'Hide raw text' : 'View raw text'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Raw OCR text panel */}
        {showFullOcr && ocrText.length > 0 && (
          <View style={[styles.rawOcrBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Text style={[styles.rawOcrText, { color: theme.textSecondary }]}>{ocrText}</Text>
          </View>
        )}

        {/* ─── Fields ──────────────────────────────────────────────────────── */}
        <View style={styles.fieldsSection}>
          <Text style={[styles.fieldsSectionTitle, { color: theme.textPrimary }]}>Document Details</Text>

          {/* Title (required) */}
          <View style={styles.fieldGroup}>
            <Text style={labelStyle}>Document Name *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. SSS ID, Passport, Driver's License"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          {/* Category Picker */}
          <View style={styles.fieldGroup}>
            <Text style={labelStyle}>Category</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={() => setShowCategories(!showCategories)}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 14 }}>{category}</Text>
              <ChevronDown size={16} color={theme.textMuted} />
            </TouchableOpacity>
            {showCategories && (
              <View style={[styles.categoryDropdown, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryItem, { borderBottomColor: theme.borderSubtle }]}
                    onPress={() => { setCategory(cat); setShowCategories(false); }}
                  >
                    <Text style={[styles.categoryItemText, { color: category === cat ? theme.primary : theme.textPrimary, fontWeight: category === cat ? '700' : '500' }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Document Number */}
          <View style={styles.fieldGroup}>
            <Text style={labelStyle}>ID / Document Number</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. 03-1234567-8"
              placeholderTextColor={theme.textMuted}
              value={docNumber}
              onChangeText={setDocNumber}
            />
            {parsed.documentNumber && docNumber !== parsed.documentNumber && (
              <TouchableOpacity onPress={() => setDocNumber(parsed.documentNumber!)}>
                <Text style={[styles.restoreHint, { color: theme.primary }]}>
                  ↺ Restore detected: {parsed.documentNumber}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={labelStyle}>Full Name on Document</Text>
            <TextInput
              style={inputStyle}
              placeholder="Name as printed on document"
              placeholderTextColor={theme.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Dates row */}
          <View style={styles.datesRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={labelStyle}>Issue Date</Text>
              <TextInput
                style={inputStyle}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.textMuted}
                value={issueDate}
                onChangeText={setIssueDate}
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={labelStyle}>Expiry Date</Text>
              <TextInput
                style={inputStyle}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.textMuted}
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>
          </View>
        </View>

        {/* Save hint */}
        {!canSave && (
          <Text style={[styles.saveHint, { color: theme.textMuted }]}>
            ⓘ Add a document name to save
          </Text>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: canSave ? theme.primary : theme.surfaceSubtle },
          ]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <CheckCircle size={20} color={canSave ? '#000' : theme.textMuted} />
          <Text style={[styles.saveBtnText, { color: canSave ? '#000' : theme.textMuted }]}>
            Save to Vault
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 11, marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  thumbnail: { width: 64, height: 64, borderRadius: 10 },
  sourceLabel: { fontSize: 13, fontWeight: '700' },
  sourceSub: { fontSize: 11, marginTop: 2 },
  rawToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rawToggleText: { fontSize: 11, fontWeight: '600' },
  rawOcrBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    maxHeight: 160,
  },
  rawOcrText: { fontSize: 11, lineHeight: 17, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  fieldsSection: { gap: 10 },
  fieldsSectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  fieldGroup: { gap: 5 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: -4,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  categoryItemText: { fontSize: 14 },
  restoreHint: { fontSize: 11, marginTop: 3, fontWeight: '600' },
  datesRow: { flexDirection: 'row', gap: 10 },
  saveHint: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
    marginTop: 4,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
});
