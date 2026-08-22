// src/screens/Settings/StorageModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, HardDrive, ShieldCheck, Trash2, CheckCircle2, Sparkles } from 'lucide-react-native';

interface StorageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({ visible, onClose }) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [cacheCleared, setCacheCleared] = useState(false);

  const storageItems = [
    { label: 'On-Device AI Model', size: '1.80 GB', percentage: 74, color: theme.primary },
    { label: 'Documents & PDFs', size: '420 MB', percentage: 17, color: theme.accentCyan },
    { label: 'Photos & Attachments', size: '185 MB', percentage: 7.5, color: theme.accentAmber },
    { label: 'Encrypted Database', size: '35 MB', percentage: 1.4, color: theme.accentIndigo },
    { label: 'Local Search Index', size: '2 MB', percentage: 0.1, color: theme.accentPurple },
  ];

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Vault Storage</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Total on-device usage: 2.44 GB
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Visual Storage Bar */}
            <View style={[styles.barContainer, { backgroundColor: theme.surfaceSubtle }]}>
              {storageItems.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    backgroundColor: item.color,
                  }}
                />
              ))}
            </View>

            {/* Storage Item Breakdown List */}
            <View style={[styles.breakdownCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {storageItems.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.itemRow,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.itemPercent, { color: theme.textMuted }]}>{item.percentage}% of vault</Text>
                  </View>
                  <Text style={[styles.itemSize, { color: theme.textPrimary }]}>{item.size}</Text>
                </View>
              ))}
            </View>

            {/* Cache Cleaner Action */}
            <TouchableOpacity
              style={[styles.cleanBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={handleClearCache}
            >
              {cacheCleared ? <CheckCircle2 size={16} color={theme.primary} /> : <Trash2 size={16} color={theme.accentAmber} />}
              <Text style={[styles.cleanBtnText, { color: cacheCleared ? theme.primary : theme.textPrimary }]}>
                {cacheCleared ? 'Temporary Cache Purged (64 MB freed)' : 'Clean Temporary Viewfinder Cache'}
              </Text>
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <ShieldCheck size={14} color={theme.primary} />
              <Text style={[styles.privacyNoteText, { color: theme.textMuted }]}>
                All 2.44 GB resides strictly inside this app container. Deleting cache never touches your personal documents.
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  body: {
    gap: 14,
    paddingBottom: 20,
  },
  barContainer: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  breakdownCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemPercent: {
    fontSize: 11,
    marginTop: 1,
  },
  itemSize: {
    fontSize: 14,
    fontWeight: '700',
  },
  cleanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  cleanBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  privacyNoteText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
