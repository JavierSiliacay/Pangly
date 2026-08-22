// src/screens/Reminders/RemindersScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ReminderItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { AddReminderModal } from './AddReminderModal';
import { PangolinCompanion } from '../../components/PangolinCompanion';
import {
  Plus,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  Car,
  CircleDollarSign,
  FileEdit,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';

export const RemindersScreen: React.FC = () => {
  const { reminders, toggleReminder, deleteReminder, settings, setActiveTab } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [addModalOpen, setAddModalOpen] = useState(false);

  const upcomingReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'vehicle':
        return Car;
      case 'maintenance':
        return Car;
      case 'note':
        return FileEdit;
      default:
        return Clock;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return theme.danger;
      case 'medium':
        return theme.accentAmber;
      default:
        return theme.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Reminders</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {upcomingReminders.length} active deadlines & renewals
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => setAddModalOpen(true)}
        >
          <Plus size={18} color="#000" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <PangolinCompanion size={80} showBubble={false} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Never forget an important date.
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Track driver's license expirations, vehicle registrations, PMS intervals, and bills.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => setAddModalOpen(true)}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.emptyBtnText}>Add First Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* UPCOMING SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Upcoming ({upcomingReminders.length})
              </Text>
            </View>

            {upcomingReminders.map((rem) => {
              const relType = rem.relatedType || 'general';
              const IconComp = getModuleIcon(relType);
              const pColor = getPriorityColor(rem.priority);

              return (
                <View
                  key={rem.id}
                  style={[styles.remCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => toggleReminder(rem.id)}
                  >
                    <Circle size={22} color={theme.textMuted} />
                  </TouchableOpacity>

                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.remTitle, { color: theme.textPrimary }]}>{rem.title}</Text>
                    <View style={styles.remMetaRow}>
                      <View style={styles.dateBox}>
                        <Calendar size={12} color={theme.accentAmber} />
                        <Text style={[styles.dueDate, { color: theme.accentAmber }]}>Due: {rem.dueDate}</Text>
                      </View>

                      <View style={[styles.tagPill, { backgroundColor: theme.surfaceElevated }]}>
                        <IconComp size={10} color={theme.primary} />
                        <Text style={[styles.tagPillText, { color: theme.textSecondary }]}>
                          {(rem.relatedType || rem.category || 'REMINDER').toUpperCase()}
                        </Text>
                      </View>

                      <View style={[styles.priorityDot, { backgroundColor: pColor }]} />
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => deleteReminder(rem.id)}>
                    <Trash2 size={14} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* COMPLETED SECTION */}
            {completedReminders.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                  <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                    Completed ({completedReminders.length})
                  </Text>
                </View>

                {completedReminders.map((rem) => (
                  <View
                    key={rem.id}
                    style={[styles.remCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle, opacity: 0.6 }]}
                  >
                    <TouchableOpacity
                      style={styles.checkBtn}
                      onPress={() => toggleReminder(rem.id)}
                    >
                      <CheckCircle size={22} color={theme.primary} />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.remTitle, { color: theme.textMuted, textDecorationLine: 'line-through' }]}>
                        {rem.title}
                      </Text>
                      <Text style={[styles.dueDate, { color: theme.textMuted }]}>Finished</Text>
                    </View>

                    <TouchableOpacity onPress={() => deleteReminder(rem.id)}>
                      <Trash2 size={14} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Reminder Modal */}
      <AddReminderModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  remCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  checkBtn: {
    padding: 2,
  },
  remTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  remMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
