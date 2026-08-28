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
  ShieldCheck,
  FileText,
  KeyRound,
  User,
  Car,
  FileEdit,
  Clock,
  Trash2,
  MessageCircle,
  Globe,
  Zap,
  Lock,
  CheckCircle,
  Camera,
  ScanLine,
  Brain,
} from 'lucide-react-native';

interface LocalAiSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocalAiSettingsModal: React.FC<LocalAiSettingsModalProps> = ({ visible, onClose }) => {
  const { settings, updateSettings, clearAiChatHistory } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  if (!visible) return null;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const togglePermission = (key: keyof typeof settings.aiPermissions) => {
    updateSettings({
      aiPermissions: { ...settings.aiPermissions, [key]: !settings.aiPermissions[key] },
    });
  };

  const setPersonality = (val: 'friendly' | 'professional' | 'minimal') => {
    updateSettings({ aiPreferences: { ...settings.aiPreferences, personality: val } });
  };

  const setLanguage = (val: 'auto' | 'english' | 'filipino') => {
    updateSettings({ aiPreferences: { ...settings.aiPreferences, responseLanguage: val } });
  };

  const togglePref = (key: keyof typeof settings.aiPreferences) => {
    const cur = settings.aiPreferences[key];
    if (typeof cur === 'boolean') {
      updateSettings({ aiPreferences: { ...settings.aiPreferences, [key]: !cur } });
    }
  };

  const toggleScan = (key: keyof typeof settings.documentScan) => {
    const cur = settings.documentScan[key];
    if (typeof cur === 'boolean') {
      updateSettings({ documentScan: { ...settings.documentScan, [key]: !cur } });
    }
  };

  const setBlurSensitivity = (val: 'low' | 'medium' | 'high') => {
    updateSettings({ documentScan: { ...settings.documentScan, blurSensitivity: val } });
  };

  // ─── Permission items (vault data access) ────────────────────────────────
  const permissionItems = [
    { key: 'documents' as const, label: 'Documents & IDs', sub: 'Expiry dates and ID numbers', icon: FileText, color: theme.primary },
    { key: 'credentials' as const, label: 'Saved Logins', sub: 'Usernames (passwords stay hidden)', icon: KeyRound, color: theme.accentAmber },
    { key: 'vehicles' as const, label: 'Vehicles & Service', sub: 'Mileage, maintenance, registration', icon: Car, color: theme.accentCyan },
    { key: 'notes' as const, label: 'Private Notes', sub: 'Ideas, checklists, and records', icon: FileEdit, color: theme.accentPurple },
    { key: 'reminders' as const, label: 'Reminders & Deadlines', sub: 'Upcoming renewals and tasks', icon: Clock, color: theme.warning },
    { key: 'personalInfo' as const, label: 'Personal Information', sub: 'Contact and emergency details', icon: User, color: theme.info },
  ];

  // ─── Personality options ──────────────────────────────────────────────────
  const personalities: { id: 'friendly' | 'professional' | 'minimal'; label: string; desc: string }[] = [
    { id: 'friendly', label: '😊 Friendly', desc: 'Warm, natural tone' },
    { id: 'professional', label: '💼 Professional', desc: 'Concise and factual' },
    { id: 'minimal', label: '⚡ Minimal', desc: 'Essential facts only' },
  ];

  // ─── Language options ─────────────────────────────────────────────────────
  const languages: { id: 'auto' | 'english' | 'filipino'; label: string }[] = [
    { id: 'auto', label: 'Auto-detect' },
    { id: 'english', label: 'English' },
    { id: 'filipino', label: 'Filipino' },
  ];

  // ─── Blur sensitivity options ─────────────────────────────────────────────
  const blurOptions: { id: 'low' | 'medium' | 'high'; label: string }[] = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
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
                Pangly runs entirely on your phone. Your data and questions never leave your device.
              </Text>
            </View>
          </View>

          {/* ─── SECTION: AI Behavior ─────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>AI Behavior</Text>

          {/* Personality Picker */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardInnerHeader}>
              <MessageCircle size={15} color={theme.textMuted} />
              <Text style={[styles.cardInnerTitle, { color: theme.textPrimary }]}>Personality</Text>
            </View>
            <View style={styles.pillsRow}>
              {personalities.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.pill,
                    { borderColor: theme.border, backgroundColor: theme.surfaceElevated },
                    settings.aiPreferences.personality === p.id && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setPersonality(p.id)}
                >
                  <Text style={[
                    styles.pillText,
                    { color: theme.textSecondary },
                    settings.aiPreferences.personality === p.id && { color: '#000', fontWeight: '700' },
                  ]}>
                    {p.label}
                  </Text>
                  <Text style={[
                    styles.pillDesc,
                    { color: theme.textMuted },
                    settings.aiPreferences.personality === p.id && { color: '#000000AA' },
                  ]}>
                    {p.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language Picker */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardInnerHeader}>
              <Globe size={15} color={theme.textMuted} />
              <Text style={[styles.cardInnerTitle, { color: theme.textPrimary }]}>Response Language</Text>
            </View>
            <View style={styles.pillsRowCompact}>
              {languages.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[
                    styles.pillCompact,
                    { borderColor: theme.border, backgroundColor: theme.surfaceElevated },
                    settings.aiPreferences.responseLanguage === l.id && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setLanguage(l.id)}
                >
                  <Text style={[
                    styles.pillCompactText,
                    { color: theme.textSecondary },
                    settings.aiPreferences.responseLanguage === l.id && { color: '#000', fontWeight: '700' },
                  ]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Streaming Toggle */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toggleRow}>
              <View style={[styles.permIcon, { backgroundColor: theme.accentPurple + '22' }]}>
                <Zap size={16} color={theme.accentPurple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permLabel, { color: theme.textPrimary }]}>Live Streaming Replies</Text>
                <Text style={[styles.permSub, { color: theme.textMuted }]}>
                  See Pangly's answer appear word by word as it generates
                </Text>
              </View>
              <Switch
                value={settings.aiPreferences.streamingResponses}
                onValueChange={() => togglePref('streamingResponses')}
                trackColor={{ false: theme.surfaceSubtle, true: theme.primaryGlow }}
                thumbColor={settings.aiPreferences.streamingResponses ? theme.primary : theme.textMuted}
              />
            </View>
          </View>

          {/* ─── SECTION: AI Privacy ─────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>AI Privacy</Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
            Control what Pangly can do with sensitive information.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Passwords via Chat */}
            <View style={styles.toggleRow}>
              <View style={[styles.permIcon, { backgroundColor: theme.accentAmber + '22' }]}>
                <KeyRound size={16} color={theme.accentAmber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permLabel, { color: theme.textPrimary }]}>Show Passwords in Chat</Text>
                <Text style={[styles.permSub, { color: theme.textMuted }]}>
                  Allow Pangly to surface masked passwords when you ask
                </Text>
              </View>
              <Switch
                value={settings.aiPermissions.allowPasswordsViaChat}
                onValueChange={() => togglePermission('allowPasswordsViaChat')}
                trackColor={{ false: theme.surfaceSubtle, true: theme.primaryGlow }}
                thumbColor={settings.aiPermissions.allowPasswordsViaChat ? theme.primary : theme.textMuted}
              />
            </View>

            {/* Confirm Before Create */}
            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
              <View style={[styles.permIcon, { backgroundColor: theme.accentCyan + '22' }]}>
                <CheckCircle size={16} color={theme.accentCyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permLabel, { color: theme.textPrimary }]}>Confirm Before Saving</Text>
                <Text style={[styles.permSub, { color: theme.textMuted }]}>
                  Always ask before Pangly creates or saves anything to your vault
                </Text>
              </View>
              <Switch
                value={settings.aiPermissions.requireConfirmBeforeCreate}
                onValueChange={() => togglePermission('requireConfirmBeforeCreate')}
                trackColor={{ false: theme.surfaceSubtle, true: theme.primaryGlow }}
                thumbColor={settings.aiPermissions.requireConfirmBeforeCreate ? theme.primary : theme.textMuted}
              />
            </View>

            {/* Auto-Reveal Sensitive */}
            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
              <View style={[styles.permIcon, { backgroundColor: theme.danger + '18' }]}>
                <Lock size={16} color={theme.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permLabel, { color: theme.textPrimary }]}>Skip Biometric for Reveal</Text>
                <Text style={[styles.permSub, { color: theme.textMuted }]}>
                  Off (recommended) — biometric always required to reveal sensitive data
                </Text>
              </View>
              <Switch
                value={settings.aiPermissions.autoRevealSensitive}
                onValueChange={() => togglePermission('autoRevealSensitive')}
                trackColor={{ false: theme.surfaceSubtle, true: theme.danger + '88' }}
                thumbColor={settings.aiPermissions.autoRevealSensitive ? theme.danger : theme.textMuted}
              />
            </View>
          </View>

          {/* ─── SECTION: Vault Access Permissions ───────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Vault Access</Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
            Choose which sections Pangly can look into when answering questions.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {permissionItems.map((item, idx) => {
              const IconComp = item.icon;
              const isEnabled = settings.aiPermissions[item.key] ?? true;
              return (
                <View
                  key={item.key}
                  style={[styles.toggleRow, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                >
                  <View style={[styles.permIcon, { backgroundColor: item.color + '22' }]}>
                    <IconComp size={16} color={item.color} />
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

          {/* ─── SECTION: Document Scanning ──────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Document Scanning</Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
            Quality gates to ensure every scanned document is accurate before saving.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Gate 1 — Clarity Confirmation */}
            <View style={styles.toggleRow}>
              <View style={[styles.permIcon, { backgroundColor: theme.accentCyan + '22' }]}>
                <Camera size={16} color={theme.accentCyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permLabel, { color: theme.textPrimary }]}>Photo Clarity Check</Text>
                <Text style={[styles.permSub, { color: theme.textMuted }]}>
                  Preview and confirm your photo is clear before reading it
                </Text>
              </View>
              <Switch
                value={settings.documentScan.showClarityConfirmation}
                onValueChange={() => toggleScan('showClarityConfirmation')}
                trackColor={{ false: theme.surfaceSubtle, true: theme.primaryGlow }}
                thumbColor={settings.documentScan.showClarityConfirmation ? theme.primary : theme.textMuted}
              />
            </View>

            {/* Gate 2 — OCR Review */}
            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
              <View style={[styles.permIcon, { backgroundColor: theme.accentPurple + '22' }]}>
                <ScanLine size={16} color={theme.accentPurple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permLabel, { color: theme.textPrimary }]}>Review Extracted Text</Text>
                <Text style={[styles.permSub, { color: theme.textMuted }]}>
                  Check and edit what Pangly read from the document before saving
                </Text>
              </View>
              <Switch
                value={settings.documentScan.showOcrReview}
                onValueChange={() => toggleScan('showOcrReview')}
                trackColor={{ false: theme.surfaceSubtle, true: theme.primaryGlow }}
                thumbColor={settings.documentScan.showOcrReview ? theme.primary : theme.textMuted}
              />
            </View>

            {/* Blur Sensitivity */}
            <View style={[{ padding: 14, borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
              <Text style={[styles.permLabel, { color: theme.textPrimary, marginBottom: 10 }]}>
                Blur Detection Sensitivity
              </Text>
              <View style={styles.pillsRowCompact}>
                {blurOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.pillCompact,
                      { borderColor: theme.border, backgroundColor: theme.surfaceElevated, flex: 1 },
                      settings.documentScan.blurSensitivity === opt.id && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setBlurSensitivity(opt.id)}
                  >
                    <Text style={[
                      styles.pillCompactText,
                      { color: theme.textSecondary },
                      settings.documentScan.blurSensitivity === opt.id && { color: '#000', fontWeight: '700' },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Clear History */}
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => { clearAiChatHistory(); onClose(); }}
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
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
  bannerTitle: { fontSize: 14, fontWeight: '800' },
  bannerSub: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3, marginTop: 4 },
  sectionSub: { fontSize: 11, marginTop: -6 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  cardInnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardInnerTitle: { fontSize: 12, fontWeight: '700' },
  pillsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  pill: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  pillText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  pillDesc: { fontSize: 9.5, textAlign: 'center' },
  pillsRowCompact: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  pillCompact: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  pillCompactText: { fontSize: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  permIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permLabel: { fontSize: 13, fontWeight: '700' },
  permSub: { fontSize: 10.5, marginTop: 2, lineHeight: 15 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  clearBtnText: { fontSize: 13, fontWeight: '700' },
});
