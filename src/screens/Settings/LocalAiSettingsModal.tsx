// src/screens/Settings/LocalAiSettingsModal.tsx

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import {
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  KeyRound,
  User,
  Car,
  FileEdit,
  Clock,
  Trash2,
} from 'lucide-react-native';

interface LocalAiSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocalAiSettingsModal: React.FC<LocalAiSettingsModalProps> = ({ visible, onClose }) => {
  const { settings, updateSettings, clearAiChatHistory } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  if (!visible) return null;

  const togglePermission = (key: keyof typeof settings.aiPermissions) => {
    updateSettings({
      aiPermissions: {
        ...settings.aiPermissions,
        [key]: !settings.aiPermissions[key],
      },
    });
  };

  const permissionItems = [
    { key: 'documents' as const, label: 'Documents & IDs', sub: 'Look up expiry dates and numbers', icon: FileText, color: theme.primary },
    { key: 'credentials' as const, label: 'Saved Logins', sub: 'Find usernames and passwords (with biometric unlock)', icon: KeyRound, color: theme.accentAmber },
    { key: 'vehicles' as const, label: 'Vehicles & Service', sub: 'Answer questions on mileage and maintenance', icon: Car, color: theme.accentCyan },
    { key: 'notes' as const, label: 'Private Notes', sub: 'Look up ideas, checklists, and medical notes', icon: FileEdit, color: theme.accentPurple },
    { key: 'reminders' as const, label: 'Reminders & Deadlines', sub: 'Track and create upcoming renewals', icon: Clock, color: theme.warning },
    { key: 'personalInfo' as const, label: 'Personal Information', sub: 'Find contact and emergency details', icon: User, color: theme.info },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Smart Assistant Settings</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Privacy Banner */}
          <View style={[styles.privacyBanner, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
              <ShieldCheck size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Private & On-Device</Text>
              <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                Pangly processes your questions directly on your phone. None of your sensitive data or queries are ever sent to an external server.
              </Text>
            </View>
          </View>

          {/* Permissions Section */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Assistant Permissions</Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
            Control which parts of your vault Pangly can look into when answering your questions.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {permissionItems.map((item, idx) => {
              const IconComp = item.icon;
              const isEnabled = settings.aiPermissions[item.key] ?? true;

              return (
                <View
                  key={item.key}
                  style={[
                    styles.permRow,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle },
                  ]}
                >
                  <View style={[styles.permIcon, { backgroundColor: item.color + '22' }]}>
                    <IconComp size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.permLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.permSub, { color: theme.textMuted }]}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => togglePermission(item.key)}
                    trackColor={{ false: theme.surfaceSubtle, true: theme.primaryGlow }}
                    thumbColor={isEnabled ? theme.primary : theme.textMuted}
                  />
                </View>
              );
            })}
          </View>

          {/* Clear History */}
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {
              clearAiChatHistory();
              onClose();
            }}
          >
            <Trash2 size={16} color={theme.danger} />
            <Text style={[styles.clearBtnText, { color: theme.danger }]}>Clear Chat History</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: -10,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  permIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  permSub: {
    fontSize: 11,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
