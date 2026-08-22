// src/components/Header.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import { PangolinCompanion } from './PangolinCompanion';
import { Search, Lock, ShieldCheck, Sparkles } from 'lucide-react-native';

interface HeaderProps {
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchPress }) => {
  const { settings, lockVault, setActiveTab, profile } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const firstName = profile.fullName ? profile.fullName.split(' ')[0] : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.borderSubtle }]}>
      <View style={styles.leftSection}>
        <PangolinCompanion size={44} showBubble={false} />
        <View style={styles.greetingSection}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandText, { color: theme.textPrimary }]}>Pangly</Text>
            <View style={[styles.privacyPill, { backgroundColor: theme.privacyBadgeBg }]}>
              <ShieldCheck size={11} color={theme.privacyBadgeText} />
              <Text style={[styles.privacyText, { color: theme.privacyBadgeText }]}>Stored on device</Text>
            </View>
          </View>
          <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
            {firstName ? `Hello, ${firstName} 👋` : 'Your private space 🛡️'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (onSearchPress) onSearchPress();
            else setActiveTab('search');
          }}
          style={[styles.actionBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
        >
          <Search size={18} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={lockVault}
          style={[styles.actionBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
        >
          <Lock size={16} color={theme.warning} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingSection: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  greetingText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
