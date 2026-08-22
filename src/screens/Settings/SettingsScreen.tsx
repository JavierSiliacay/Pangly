// src/screens/Settings/SettingsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { StorageModal } from './StorageModal';
import { LocalAiSettingsModal } from './LocalAiSettingsModal';
import { DeviceMigrationModal } from './DeviceMigrationModal';
import { PangolinCompanion } from '../../components/PangolinCompanion';
import {
  ShieldCheck,
  Lock,
  Fingerprint,
  HardDrive,
  Cpu,
  Download,
  Upload,
  Smartphone,
  Palette,
  User,
  KeyRound,
  EyeOff,
  Clock,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    lockVault,
    exportVaultJson,
    importVaultJson,
    resetToInitialDemoData,
    copyToClipboardWithTimeout,
    requestBiometricAuth,
    setActiveTab,
  } = useVault();

  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const autoLockOptions = [
    { label: 'Immediate', sec: 0 },
    { label: '30s', sec: 30 },
    { label: '1m', sec: 60 },
    { label: '5m', sec: 300 },
    { label: '15m', sec: 900 },
  ];

  const handleExport = () => {
    requestBiometricAuth({
      title: 'Export Encrypted Vault',
      reason: 'Biometric authorization is required to export your personal vault.',
      onSuccess: () => {
        const json = exportVaultJson();
        copyToClipboardWithTimeout(json, 'Encrypted Vault JSON');
        setExportNotice(true);
        setTimeout(() => setExportNotice(false), 3000);
      },
    });
  };

  const handleViewRecoveryKey = () => {
    requestBiometricAuth({
      title: 'View Master Recovery Key',
      reason: 'Biometric authentication required to reveal your master recovery key.',
      onSuccess: () => {
        copyToClipboardWithTimeout(settings.recoveryKey, 'Recovery Key');
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Security, local storage & on-device AI
          </Text>
        </View>
        <PangolinCompanion size={40} showBubble={false} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* PERSONAL PROFILE LINK */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('profile')}
          style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
            <User size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Personal Information</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Manage identity, emergency contacts & custom fields
            </Text>
          </View>
          <ChevronRight size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* VAULT SECURITY SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Vault Security</Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Biometrics Toggle */}
            <View style={styles.row}>
              <View style={[styles.smallIcon, { backgroundColor: theme.primaryGlow }]}>
                <Fingerprint size={16} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Biometric Unlock</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>Use FaceID / Fingerprint for quick access</Text>
              </View>
              <Switch
                value={settings.biometricsEnabled}
                onValueChange={(val) => updateSettings({ biometricsEnabled: val })}
                thumbColor={settings.biometricsEnabled ? theme.primary : '#94A3B8'}
              />
            </View>

            {/* Auto-Lock Timers */}
            <View style={[styles.rowCol, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
              <View style={styles.rowHeader}>
                <Clock size={16} color={theme.textMuted} />
                <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Auto-Lock Timeout</Text>
              </View>
              <View style={styles.timerPills}>
                {autoLockOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.sec}
                    style={[
                      styles.timerBtn,
                      settings.autoLockTimeoutSeconds === opt.sec
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                    onPress={() => updateSettings({ autoLockTimeoutSeconds: opt.sec })}
                  >
                    <Text
                      style={[
                        styles.timerBtnText,
                        {
                          color: settings.autoLockTimeoutSeconds === opt.sec ? '#000' : theme.textSecondary,
                          fontWeight: settings.autoLockTimeoutSeconds === opt.sec ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* View Recovery Key */}
            <TouchableOpacity
              style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
              onPress={handleViewRecoveryKey}
            >
              <View style={[styles.smallIcon, { backgroundColor: theme.accentAmber + '22' }]}>
                <KeyRound size={16} color={theme.accentAmber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Private Backup Key</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>View or copy your offline backup key</Text>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>

            {/* Lock Now */}
            <TouchableOpacity
              style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
              onPress={lockVault}
            >
              <View style={[styles.smallIcon, { backgroundColor: theme.warning + '22' }]}>
                <Lock size={16} color={theme.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.warning }]}>Lock Pangly Now</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>Immediately protect your private space</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* BACKUP & MIGRATION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Backup & Transfer</Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Export Vault */}
            <TouchableOpacity style={styles.row} onPress={handleExport}>
              <View style={[styles.smallIcon, { backgroundColor: theme.accentTeal + '22' }]}>
                <Download size={16} color={theme.accentTeal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Save Offline Backup File</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>Save a secure copy to your device</Text>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>

            {/* Device Migration */}
            <TouchableOpacity
              style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
              onPress={() => setMigrationModalOpen(true)}
            >
              <View style={[styles.smallIcon, { backgroundColor: theme.accentIndigo + '22' }]}>
                <Smartphone size={16} color={theme.accentIndigo} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Transfer to New Device</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>Peer-to-peer Wi-Fi / QR sync</Text>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* APPEARANCE SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance</Text>

          <View style={[styles.themePillsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {[
              { id: 'dark', label: 'OLED Dark' },
              { id: 'slate', label: 'Midnight Slate' },
              { id: 'light', label: 'Clean Light' },
            ].map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeBtn,
                  settings.theme === t.id && { backgroundColor: theme.primary },
                ]}
                onPress={() => updateSettings({ theme: t.id as any })}
              >
                <Text
                  style={[
                    styles.themeBtnText,
                    {
                      color: settings.theme === t.id ? '#000' : theme.textSecondary,
                      fontWeight: settings.theme === t.id ? '700' : '500',
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DEMO DATA RESET & ONBOARDING REPLAY */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.demoResetBtn, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}
            onPress={() => {
              updateSettings({ hasCompletedOnboarding: false });
            }}
          >
            <Sparkles size={16} color={theme.primary} />
            <Text style={[styles.demoResetText, { color: theme.primary, fontWeight: '800' }]}>
              🎬 Replay Pangly Setup Experience
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoResetBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 8 }]}
            onPress={() => {
              resetToInitialDemoData();
              Alert.alert('Demo Data Reset', 'Vault has been restored to default seeded records.');
            }}
          >
            <RefreshCw size={16} color={theme.accentCyan} />
            <Text style={[styles.demoResetText, { color: theme.textPrimary }]}>Restore Seeded Demo Records</Text>
          </TouchableOpacity>

          <View style={styles.aboutBox}>
            <Text style={[styles.aboutTitle, { color: theme.textPrimary }]}>Pangly v1.0.0</Text>
            <Text style={[styles.aboutTagline, { color: theme.primary }]}>Your private second brain.</Text>
            <Text style={[styles.aboutDesc, { color: theme.textMuted }]}>
              Store it. Ask it. Own it.{'\n'}Everything stays on your device.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Storage Breakdown Modal */}
      <StorageModal
        visible={storageModalOpen}
        onClose={() => setStorageModalOpen(false)}
      />

      {/* Local AI Settings Modal */}
      <LocalAiSettingsModal
        visible={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* Device Migration Modal */}
      <DeviceMigrationModal
        visible={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
      />
    </View>
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
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowCol: {
    padding: 14,
    gap: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 1,
  },
  timerPills: {
    flexDirection: 'row',
    gap: 6,
  },
  timerBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBtnText: {
    fontSize: 11,
  },
  themePillsRow: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnText: {
    fontSize: 12,
  },
  demoResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoResetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aboutBox: {
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  aboutTagline: {
    fontSize: 13,
    fontWeight: '700',
  },
  aboutDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
