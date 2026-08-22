// src/components/ClipboardToast.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import { ShieldCheck, Clock } from 'lucide-react-native';

export const ClipboardToast: React.FC = () => {
  const { clipboardToast, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  if (!clipboardToast || !clipboardToast.visible) return null;

  const displayMessage = clipboardToast.label
    ? `${clipboardToast.label} copied securely`
    : 'Copied to clipboard';

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
      <View style={styles.iconContainer}>
        <ShieldCheck size={18} color={theme.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.message, { color: theme.textPrimary }]}>{displayMessage}</Text>
        <Text style={[styles.sub, { color: theme.textMuted }]}>Auto-clearing for privacy</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: theme.primaryGlow }]}>
        <Clock size={12} color={theme.primary} />
        <Text style={[styles.timer, { color: theme.primary }]}>{clipboardToast.secondsLeft}s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    fontWeight: '700',
  },
  sub: {
    fontSize: 10,
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  timer: {
    fontSize: 11,
    fontWeight: '800',
  },
});
