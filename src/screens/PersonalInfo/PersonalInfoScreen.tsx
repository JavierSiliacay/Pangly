// src/screens/PersonalInfo/PersonalInfoScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react-native';

export const PersonalInfoScreen: React.FC = () => {
  const { profile, updateProfile, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [fullName, setFullName] = useState(profile.fullName);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [address, setAddress] = useState(profile.address);
  const [bloodType, setBloodType] = useState(profile.bloodType || '');
  const [contacts, setContacts] = useState(profile.emergencyContacts);
  const [customFields, setCustomFields] = useState(profile.customFields);
  const [isSaved, setIsSaved] = useState(false);

  // New Custom Field Inputs
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  // New Emergency Contact Inputs
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleSaveProfile = () => {
    updateProfile({
      fullName,
      birthday,
      phone,
      email,
      address,
      bloodType,
      emergencyContacts: contacts,
      customFields,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddCustomField = () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      { id: `cf-${Date.now()}`, label: newLabel, value: newValue },
    ]);
    setNewLabel('');
    setNewValue('');
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((cf) => cf.id !== id));
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts((prev) => [
      ...prev,
      {
        id: `em-${Date.now()}`,
        name: newContactName,
        relationship: newContactRel || 'Family',
        phone: newContactPhone,
      },
    ]);
    setNewContactName('');
    setNewContactRel('');
    setNewContactPhone('');
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* BASIC INFORMATION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Basic Information</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.fieldRow}>
            <User size={16} color={theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>FULL NAME</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <Calendar size={16} color={theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>BIRTHDAY</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={birthday}
                onChangeText={setBirthday}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <Phone size={16} color={theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>PHONE NUMBER</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <Mail size={16} color={theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>EMAIL</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={[styles.fieldRow, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <MapPin size={16} color={theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>RESIDENTIAL ADDRESS</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>
        </View>

        {/* EMERGENCY CONTACTS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Emergency Contacts</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {contacts.map((contact, idx) => (
            <View
              key={contact.id}
              style={[
                styles.contactRow,
                idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle },
              ]}
            >
              <View style={[styles.contactIconBox, { backgroundColor: theme.danger + '22' }]}>
                <HeartPulse size={16} color={theme.danger} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: theme.textPrimary }]}>{contact.name}</Text>
                <Text style={[styles.contactRel, { color: theme.textSecondary }]}>
                  {contact.relationship} • {contact.phone}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteContactBtn}
                onPress={() => handleDeleteContact(contact.id)}
              >
                <Trash2 size={16} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Contact Form */}
          <View style={[styles.addInlineForm, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <Text style={[styles.inlineHeader, { color: theme.textSecondary }]}>+ Add Emergency Contact</Text>
            <View style={styles.inlineInputs}>
              <TextInput
                style={[styles.smallInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Name"
                placeholderTextColor={theme.textMuted}
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput
                style={[styles.smallInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Relationship"
                placeholderTextColor={theme.textMuted}
                value={newContactRel}
                onChangeText={setNewContactRel}
              />
              <TextInput
                style={[styles.smallInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Phone Number"
                placeholderTextColor={theme.textMuted}
                value={newContactPhone}
                onChangeText={setNewContactPhone}
              />
            </View>
            <TouchableOpacity
              style={[styles.addInlineBtn, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}
              onPress={handleAddContact}
            >
              <Plus size={14} color={theme.primary} />
              <Text style={[styles.addInlineBtnText, { color: theme.primary }]}>Save Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CUSTOM FIELDS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Custom Fields</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {customFields.map((cf, idx) => (
            <View
              key={cf.id}
              style={[
                styles.customFieldRow,
                idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>{cf.label.toUpperCase()}</Text>
                <Text style={[styles.cfValue, { color: theme.textPrimary }]}>{cf.value}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteContactBtn}
                onPress={() => handleDeleteCustomField(cf.id)}
              >
                <Trash2 size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Custom Field Form */}
          <View style={[styles.addInlineForm, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <Text style={[styles.inlineHeader, { color: theme.textSecondary }]}>+ Add Custom Field</Text>
            <View style={styles.inlineInputs}>
              <TextInput
                style={[styles.smallInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Field Name (e.g. Blood Type, Gate Code)"
                placeholderTextColor={theme.textMuted}
                value={newLabel}
                onChangeText={setNewLabel}
              />
              <TextInput
                style={[styles.smallInput, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Field Value"
                placeholderTextColor={theme.textMuted}
                value={newValue}
                onChangeText={setNewValue}
              />
            </View>
            <TouchableOpacity
              style={[styles.addInlineBtn, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}
              onPress={handleAddCustomField}
            >
              <Plus size={14} color={theme.primary} />
              <Text style={[styles.addInlineBtnText, { color: theme.primary }]}>Add Custom Field</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.privacyFooter}>
          <ShieldCheck size={14} color={theme.primary} />
          <Text style={[styles.privacyText, { color: theme.textMuted }]}>
            All personal information is encrypted and never synchronized to any cloud database.
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    padding: 0,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
  },
  contactRel: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteContactBtn: {
    padding: 6,
  },
  customFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cfValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  addInlineForm: {
    padding: 14,
    gap: 10,
  },
  inlineHeader: {
    fontSize: 12,
    fontWeight: '700',
  },
  inlineInputs: {
    gap: 8,
  },
  smallInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
  },
  addInlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  privacyText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
