// src/screens/Vehicles/AddVehicleModal.tsx

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
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, Check, Car } from 'lucide-react-native';

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ visible, onClose }) => {
  const { addVehicle, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2021');
  const [plateNumber, setPlateNumber] = useState('');
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSave = () => {
    if (!make.trim() || !model.trim() || !plateNumber.trim()) return;

    const numYear = parseInt(year, 10) || 2021;
    const numMileage = parseInt(mileage.replace(/,/g, ''), 10) || 0;

    addVehicle({
      make,
      model,
      year: numYear,
      plateNumber,
      vin: vin || undefined,
      mileage: numMileage,
      nickname: nickname || undefined,
      nextMaintenanceKm: numMileage + 5000,
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
              <Text style={[styles.title, { color: theme.textPrimary }]}>Add Vehicle</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Track maintenance, expenses, and registration
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* Make & Model */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>MAKE *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Toyota, Honda, Ford"
                  placeholderTextColor={theme.textMuted}
                  value={make}
                  onChangeText={setMake}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1.4 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>MODEL *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Vios 1.5 G, Civic"
                  placeholderTextColor={theme.textMuted}
                  value={model}
                  onChangeText={setModel}
                />
              </View>
            </View>

            {/* Year & Plate */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>YEAR *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="2021"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={year}
                  onChangeText={setYear}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1.4 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>PLATE NUMBER *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. ABC 1234"
                  placeholderTextColor={theme.textMuted}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Mileage & Nickname */}
            <View style={styles.row}>
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

              <View style={[styles.fieldGroup, { flex: 1.4 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>NICKNAME (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Silver Falcon"
                  placeholderTextColor={theme.textMuted}
                  value={nickname}
                  onChangeText={setNickname}
                />
              </View>
            </View>

            {/* VIN */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>CHASSIS / VIN NUMBER (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="17-character VIN"
                placeholderTextColor={theme.textMuted}
                value={vin}
                onChangeText={setVin}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#000" />
              <Text style={styles.saveBtnText}>Save Vehicle</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
