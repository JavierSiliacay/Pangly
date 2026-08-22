// src/components/UniversalAddModal.tsx

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import {
  FileText,
  KeyRound,
  Car,
  FileEdit,
  Clock,
  Camera,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

interface UniversalAddModalProps {
  onSelectAction: (actionType: string) => void;
}

export const UniversalAddModal: React.FC<UniversalAddModalProps> = ({ onSelectAction }) => {
  const { universalAddOpen, setUniversalAddOpen, settings, setScannerModalOpen } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  if (!universalAddOpen) return null;

  const actions = [
    {
      id: 'scan_doc',
      label: 'Scan Document with Camera',
      subtitle: 'Snap photo of ID or document (private & offline)',
      icon: Camera,
      color: theme.primary,
      isFeatured: true,
    },
    {
      id: 'add_doc',
      label: 'Add Document or ID',
      subtitle: 'Passport, license, insurance card, or certificate',
      icon: FileText,
      color: theme.primary,
    },
    {
      id: 'add_cred',
      label: 'Save Password & Login',
      subtitle: 'Website login, app account, Wi-Fi, or secret PIN',
      icon: KeyRound,
      color: theme.accentAmber,
    },
    {
      id: 'add_vehicle',
      label: 'Add Vehicle',
      subtitle: 'Car, motorcycle, plate details & service logs',
      icon: Car,
      color: theme.accentTeal,
    },
    {
      id: 'add_note',
      label: 'Write Private Note',
      subtitle: 'Secret codes, personal thoughts, or checklist',
      icon: FileEdit,
      color: theme.accentIndigo,
    },
    {
      id: 'add_reminder',
      label: 'Set Reminder & Expiry',
      subtitle: 'Document renewal, appointment, or deadline',
      icon: Clock,
      color: theme.warning,
    },
  ];

  const handleSelect = (id: string) => {
    setUniversalAddOpen(false);
    if (id === 'scan_doc') {
      setScannerModalOpen(true);
    } else {
      onSelectAction(id);
    }
  };

  return (
    <Modal
      visible={universalAddOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setUniversalAddOpen(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setUniversalAddOpen(false)}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>What do you want to add?</Text>
              <View style={styles.subRow}>
                <ShieldCheck size={12} color={theme.primary} />
                <Text style={[styles.subtitle, { color: theme.primary }]}>
                  Stored 100% on this device
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setUniversalAddOpen(false)}
              style={[styles.closeBtn, { backgroundColor: theme.surface }]}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* List of Actions */}
          <ScrollView contentContainerStyle={styles.actionList} showsVerticalScrollIndicator={false}>
            {actions.map((item) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.75}
                  onPress={() => handleSelect(item.id)}
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: item.isFeatured ? theme.primaryGlow : theme.surface,
                      borderColor: item.isFeatured ? theme.primary : theme.borderSubtle,
                    },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
                    <IconComp size={20} color={item.color} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.actionSub, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
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
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionList: {
    gap: 10,
    paddingBottom: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
