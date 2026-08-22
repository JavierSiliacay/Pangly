// src/screens/Vehicles/AddMaintenanceModal.tsx

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
import { MaintenanceType } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, Check, Wrench, Calendar, CircleDollarSign, Bell, ShieldCheck } from 'lucide-react-native';

interface AddMaintenanceModalProps {
  vehicleId: string;
  vehicleName: string;
  currentMileage: number;
  visible: boolean;
  onClose: () => void;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  vehicleId,
  vehicleName,
  currentMileage,
  visible,
  onClose,
}) => {
  const { addMaintenance, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [type, setType] = useState<MaintenanceType>('Oil Change');
  const [cost, setCost] = useState('');
  const [mileage, setMileage] = useState(currentMileage ? currentMileage.toString() : '48200');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [parts, setParts] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [autoExpense, setAutoExpense] = useState(true);
  const [scheduleReminder, setScheduleReminder] = useState(true);

  const maintenanceTypes: MaintenanceType[] = [
    'Oil Change',
    'PMS',
    'Brake Service',
    'Battery Replacement',
    'Tire Replacement',
    'Repair',
    'Other',
  ];

  const handleSave = () => {
    const numCost = parseFloat(cost.replace(/,/g, '')) || 0;
    const numMileage = parseInt(mileage, 10) || currentMileage;
    const nextReminderKm = scheduleReminder ? numMileage + 5000 : undefined;

    addMaintenance(
      {
        vehicleId,
        vehicleName,
        type,
        date,
        mileage: numMileage,
        cost: numCost,
        parts: parts || undefined,
        serviceProvider: serviceProvider || undefined,
        notes: notes || undefined,
      },
      nextReminderKm
    );

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
              <Text style={[styles.title, { color: theme.textPrimary }]}>Record Maintenance</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{vehicleName}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* Maintenance Type Selector */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>SERVICE TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {maintenanceTypes.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.chip,
                      type === t
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: type === t ? '#000' : theme.textSecondary, fontWeight: type === t ? '700' : '500' },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cost & Mileage */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>TOTAL COST (₱) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="2,850"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={cost}
                  onChangeText={setCost}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>ODOMETER (KM) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="48,200"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={mileage}
                  onChangeText={setMileage}
                />
              </View>
            </View>

            {/* Date & Service Provider */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>SERVICE DATE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>SERVICE PROVIDER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Toyota BGC"
                  placeholderTextColor={theme.textMuted}
                  value={serviceProvider}
                  onChangeText={setServiceProvider}
                />
              </View>
            </View>

            {/* Parts Replaced */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>PARTS / FLUIDS REPLACED</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. 4L Synthetic 5W-30 Oil, Denso Filter"
                placeholderTextColor={theme.textMuted}
                value={parts}
                onChangeText={setParts}
              />
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NOTES / RECOMMENDATIONS</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Mechanic advised checking rear brake drums at 55,000 km"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Auto-Add to Expenses Toggle */}
            <TouchableOpacity
              style={[styles.toggleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setAutoExpense(!autoExpense)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleText, { color: theme.textPrimary }]}>Auto-add to Money Expenses</Text>
                <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                  Automatically records a ₱{cost || '0'} vehicle expense
                </Text>
              </View>
              <View style={[styles.checkbox, { backgroundColor: autoExpense ? theme.primary : 'transparent', borderColor: theme.primary }]}>
                {autoExpense && <Check size={14} color="#000" />}
              </View>
            </TouchableOpacity>

            {/* Auto-Schedule Reminder Toggle */}
            <TouchableOpacity
              style={[styles.toggleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setScheduleReminder(!scheduleReminder)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleText, { color: theme.textPrimary }]}>Schedule Next Service Reminder</Text>
                <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                  Remind me again in 5,000 km ({parseInt(mileage || '48200', 10) + 5000} km)
                </Text>
              </View>
              <View style={[styles.checkbox, { backgroundColor: scheduleReminder ? theme.accentCyan : 'transparent', borderColor: theme.accentCyan }]}>
                {scheduleReminder && <Check size={14} color="#000" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#000" />
              <Text style={styles.saveBtnText}>Save Maintenance Log</Text>
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
  chipScroll: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    paddingTop: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
