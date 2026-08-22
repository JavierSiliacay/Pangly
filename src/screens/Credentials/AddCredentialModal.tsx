// src/screens/Credentials/AddCredentialModal.tsx

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
import { CredentialCategory } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, Sparkles, Check, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react-native';

interface AddCredentialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddCredentialModal: React.FC<AddCredentialModalProps> = ({ visible, onClose }) => {
  const { addCredential, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [service, setService] = useState('');
  const [category, setCategory] = useState<CredentialCategory>('Development');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const categories: CredentialCategory[] = [
    'Development',
    'Social',
    'Banking',
    'Work',
    'Email',
    'Hosting',
    'Other',
  ];

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let generated = '';
    for (let i = 0; i < 18; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const handleSave = () => {
    if (!service.trim() || !password.trim()) return;

    addCredential({
      service,
      category,
      username: username || 'user@pangly.local',
      password,
      website: website || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Add Credential</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                🔒 Encrypted locally on your device
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* Category */}
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

            {/* Service Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>SERVICE / ACCOUNT NAME *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. GitHub, AWS, AutoWorx, Netflix"
                placeholderTextColor={theme.textMuted}
                value={service}
                onChangeText={setService}
              />
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>USERNAME / EMAIL *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. username@example.com or admin"
                placeholderTextColor={theme.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Password with Generator */}
            <View style={styles.fieldGroup}>
              <View style={styles.passLabelRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>PASSWORD *</Text>
                <TouchableOpacity style={styles.genBtn} onPress={generateStrongPassword}>
                  <Sparkles size={12} color={theme.accentCyan} />
                  <Text style={[styles.genBtnText, { color: theme.accentCyan }]}>Generate Strong</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary, fontFamily: 'monospace' },
                ]}
                placeholder="Enter or generate password"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Website URL */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>WEBSITE URL (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="https://..."
                placeholderTextColor={theme.textMuted}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
              />
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NOTES / 2FA RECOVERY CODES</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Backup recovery keys, security questions, or notes"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#000" />
              <Text style={styles.saveBtnText}>Save Credential</Text>
            </TouchableOpacity>

            <Text style={[styles.footerNote, { color: theme.textMuted }]}>
              🔒 Credentials are encrypted and stored only on this device.
            </Text>
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
  passLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  genBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
  footerNote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
});
