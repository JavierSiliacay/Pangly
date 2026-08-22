// src/screens/Reminders/AddReminderModal.tsx

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
import { ReminderRelatedType } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, Check, Clock } from 'lucide-react-native';

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({ visible, onClose }) => {
  const { addReminder, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [relatedType, setRelatedType] = useState<ReminderRelatedType>('general');
  const [repeatRule, setRepeatRule] = useState('');

  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  const relatedTypes: ReminderRelatedType[] = ['general', 'document', 'vehicle', 'maintenance', 'note'];

  const handleSave = () => {
    if (!title.trim()) return;

    let category: 'Document Expiry' | 'Vehicle Service' | 'Bill / Renewal' | 'Personal' | 'Other' = 'Personal';
    if (relatedType === 'document') category = 'Document Expiry';
    else if (relatedType === 'vehicle' || relatedType === 'maintenance') category = 'Vehicle Service';

    addReminder({
      title,
      dueDate,
      category,
      priority,
      relatedType,
      repeatRule: repeatRule || undefined,
      isCompleted: false,
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
              <Text style={[styles.title, { color: theme.textPrimary }]}>Add Reminder</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Offline notifications & expiry alerts
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>REMINDER TITLE *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Car Registration, License Renewal, Pay Bill"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Due Date */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>DUE DATE (YYYY-MM-DD) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Priority */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>PRIORITY</Text>
              <View style={styles.chipRow}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      priority === p
                        ? { backgroundColor: p === 'high' ? theme.danger : p === 'medium' ? theme.warning : theme.primary, borderColor: 'transparent' }
                        : { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: priority === p ? '#000' : theme.textSecondary, fontWeight: priority === p ? '700' : '500' },
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Related Type */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>CONNECT TO MODULE</Text>
              <View style={styles.chipRow}>
                {relatedTypes.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.chip,
                      relatedType === t
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => setRelatedType(t)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: relatedType === t ? '#000' : theme.textSecondary, fontWeight: relatedType === t ? '700' : '500' },
                      ]}
                    >
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Repeat Rule */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>REPEAT SCHEDULE (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Annual, Monthly, Every 6 months"
                placeholderTextColor={theme.textMuted}
                value={repeatRule}
                onChangeText={setRepeatRule}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#000" />
              <Text style={styles.saveBtnText}>Save Reminder</Text>
            </TouchableOpacity>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
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
});
