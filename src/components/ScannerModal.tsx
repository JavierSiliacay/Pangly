// src/components/ScannerModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import { Camera, X, Check, ShieldCheck, ImageIcon, RefreshCw, FolderLock, Calendar, Lock } from 'lucide-react-native';
import { captureDocumentPhoto, pickDocumentFromLibrary } from '../services/imageStorageService';
import { DocumentCategory } from '../types/vault';

export const ScannerModal: React.FC = () => {
  const { scannerModalOpen, setScannerModalOpen, addDocument, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Form fields for scanned document
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Identification');
  const [docNumber, setDocNumber] = useState('');
  const [docProvider, setDocProvider] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const categories: DocumentCategory[] = [
    'Identification',
    'Government',
    'Vehicle',
    'Insurance',
    'Banking',
    'Work',
    'Health',
    'Other',
  ];

  useEffect(() => {
    if (scannerModalOpen) {
      setCapturedImageUri(null);
      setDocTitle('');
      setDocCategory('Identification');
      setDocNumber('');
      setDocProvider('');
      setDocExpiry('');
      setDocNotes('');
    }
  }, [scannerModalOpen]);

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    const result = await captureDocumentPhoto();
    setIsCapturing(false);
    if (result?.uri) {
      setCapturedImageUri(result.uri);
      if (!docTitle) setDocTitle('Scanned Document');
    }
  };

  const handlePickFromGallery = async () => {
    setIsCapturing(true);
    const result = await pickDocumentFromLibrary();
    setIsCapturing(false);
    if (result?.uri) {
      setCapturedImageUri(result.uri);
      if (!docTitle) setDocTitle('Imported Document');
    }
  };

  const handleSave = () => {
    addDocument({
      title: docTitle.trim() || 'Scanned Document',
      category: docCategory,
      provider: docProvider.trim() || undefined,
      documentNumber: docNumber.trim() || undefined,
      expiryDate: docExpiry.trim() || undefined,
      imageUri: capturedImageUri || undefined,
      notes: docNotes.trim() || undefined,
      isSensitive: true,
      reminderCreated: !!docExpiry.trim(),
    });
    setScannerModalOpen(false);
  };

  if (!scannerModalOpen) return null;

  return (
    <Modal
      visible={scannerModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setScannerModalOpen(false)}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header */}
        <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.borderSubtle }]}>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
            onPress={() => setScannerModalOpen(false)}
            activeOpacity={0.7}
          >
            <X size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Document Scanner</Text>
            <View style={styles.privatePill}>
              <ShieldCheck size={11} color={theme.primary} />
              <Text style={[styles.privateText, { color: theme.primary }]}>Stored 100% On-Device Only</Text>
            </View>
          </View>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Step 1: Capture or Pick Photo */}
          {!capturedImageUri ? (
            <View style={styles.capturePromptCard}>
              <View style={[styles.viewfinderMock, { borderColor: theme.primary, backgroundColor: theme.surface }]}>
                <Camera size={48} color={theme.primary} />
                <Text style={[styles.viewfinderHeading, { color: theme.textPrimary }]}>
                  Scan ID or Document
                </Text>
                <Text style={[styles.viewfinderSub, { color: theme.textSecondary }]}>
                  Photos stay private inside Pangly and will never appear in your public phone gallery.
                </Text>
              </View>

              {isCapturing ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Opening camera...</Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleTakePhoto}
                    style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
                  >
                    <Camera size={18} color="#000000" />
                    <Text style={styles.primaryActionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePickFromGallery}
                    style={[styles.secondaryActionBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  >
                    <ImageIcon size={18} color={theme.textPrimary} />
                    <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>Choose from Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Step 2: Image Preview & Details Form */
            <View style={styles.formContainer}>
              {/* Photo Preview Thumbnail */}
              <View style={[styles.previewBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Image source={{ uri: capturedImageUri }} style={styles.previewImage} resizeMode="contain" />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTakePhoto}
                  style={[styles.retakeBtn, { backgroundColor: 'rgba(0,0,0,0.75)' }]}
                >
                  <RefreshCw size={14} color="#FFFFFF" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>

              {/* Document Details Form */}
              <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.formSectionTitle, { color: theme.textPrimary }]}>Document Details</Text>

                {/* Title */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title / Name *</Text>
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                    value={docTitle}
                    onChangeText={setDocTitle}
                    placeholder="e.g. Driver's License, Passport"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                {/* Category Pills */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        activeOpacity={0.8}
                        onPress={() => setDocCategory(cat)}
                        style={[
                          styles.catPill,
                          docCategory === cat
                            ? { backgroundColor: theme.primary, borderColor: theme.primary }
                            : { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catPillText,
                            { color: docCategory === cat ? '#000000' : theme.textPrimary, fontWeight: docCategory === cat ? '700' : '500' },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* ID / Document Number */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Document Number (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                    value={docNumber}
                    onChangeText={setDocNumber}
                    placeholder="e.g. N02-14-123456"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                {/* Issuing Authority / Provider */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Issuing Authority / Agency (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                    value={docProvider}
                    onChangeText={setDocProvider}
                    placeholder="e.g. LTO, DFA, PhilHealth"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                {/* Expiration Date */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Expiration Date (YYYY-MM-DD) (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                    value={docExpiry}
                    onChangeText={setDocExpiry}
                    placeholder="e.g. 2029-08-15"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              >
                <Check size={18} color="#000000" />
                <Text style={styles.saveBtnText}>Save to Vault</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  privatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  privateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 18,
    paddingBottom: 40,
  },
  capturePromptCard: {
    gap: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  viewfinderMock: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  viewfinderHeading: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  viewfinderSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 13,
  },
  btnRow: {
    width: '100%',
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  previewBox: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  catScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});
