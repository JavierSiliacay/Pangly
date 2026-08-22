// src/screens/Vault/VaultHubScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';

// Child Module Views
import { DocumentsScreen } from '../Documents/DocumentsScreen';
import { CredentialsScreen } from '../Credentials/CredentialsScreen';
import { VehiclesScreen } from '../Vehicles/VehiclesScreen';
import { NotesScreen } from '../Notes/NotesScreen';
import { PersonalInfoScreen } from '../PersonalInfo/PersonalInfoScreen';

import {
  FileText,
  KeyRound,
  Car,
  FileEdit,
  User,
  Plus,
  ShieldCheck,
} from 'lucide-react-native';

export type VaultSegment = 'documents' | 'credentials' | 'vehicles' | 'notes' | 'profile';

interface VaultHubScreenProps {
  initialSegment?: VaultSegment;
}

export const VaultHubScreen: React.FC<VaultHubScreenProps> = ({ initialSegment = 'documents' }) => {
  const {
    documents,
    credentials,
    vehicles,
    notes,
    profile,
    settings,
    setUniversalAddOpen,
  } = useVault();

  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  // Active category segment (defaults to documents)
  const [activeSegment, setActiveSegment] = useState<VaultSegment>(initialSegment || 'documents');

  const categories = [
    {
      id: 'documents' as VaultSegment,
      label: 'Documents',
      tagline: 'ID cards, passports, insurance & certificates',
      icon: FileText,
      count: documents.length,
      color: theme.primary,
    },
    {
      id: 'credentials' as VaultSegment,
      label: 'Passwords',
      tagline: 'Logins, accounts, Wi-Fi & secret PINs',
      icon: KeyRound,
      count: credentials.length,
      color: theme.accentAmber,
    },
    {
      id: 'vehicles' as VaultSegment,
      label: 'Vehicles',
      tagline: 'Cars, motorcycles, registration & service history',
      icon: Car,
      count: vehicles.length,
      color: theme.accentTeal,
    },
    {
      id: 'notes' as VaultSegment,
      label: 'Notes',
      tagline: 'Personal notes, checklists & private codes',
      icon: FileEdit,
      count: notes.length,
      color: theme.accentIndigo,
    },
    {
      id: 'profile' as VaultSegment,
      label: 'Profile',
      tagline: 'Personal info, blood type & emergency contacts',
      icon: User,
      count: profile.emergencyContacts.length,
      color: theme.accentCyan,
    },
  ];

  const currentCategory = categories.find((c) => c.id === activeSegment) || categories[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Vault Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Personal Vault</Text>
            <View style={styles.securitySubRow}>
              <ShieldCheck size={12} color={theme.primary} />
              <Text style={[styles.securitySubText, { color: theme.primary }]}>
                100% On-Device Filing System
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setUniversalAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
          >
            <Plus size={16} color="#000000" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* 5-Category Filing Selector Bar */}
        <View style={styles.selectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorScroll}
          >
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeSegment === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.85}
                  onPress={() => setActiveSegment(cat.id)}
                  style={[
                    styles.categoryTab,
                    isActive
                      ? [
                          styles.activeCategoryTab,
                          {
                            backgroundColor: cat.color,
                            borderColor: cat.color,
                          },
                        ]
                      : [
                          styles.inactiveCategoryTab,
                          {
                            backgroundColor: theme.surfaceElevated,
                            borderColor: theme.border,
                          },
                        ],
                  ]}
                >
                  <IconComp
                    size={16}
                    color={isActive ? '#000000' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryTabText,
                      {
                        color: isActive ? '#000000' : theme.textPrimary,
                        fontWeight: isActive ? '800' : '600',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>

                  <View
                    style={[
                      styles.countPill,
                      {
                        backgroundColor: isActive
                          ? 'rgba(0,0,0,0.18)'
                          : theme.surfaceSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countPillText,
                        { color: isActive ? '#000000' : theme.textMuted },
                      ]}
                    >
                      {cat.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Category Description Banner */}
        <View style={[styles.contextBanner, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.contextTagline, { color: theme.textSecondary }]}>
            {currentCategory.tagline}
          </Text>
        </View>
      </View>

      {/* Selected Category Content */}
      <View style={styles.contentArea}>
        {activeSegment === 'documents' && <DocumentsScreen />}
        {activeSegment === 'credentials' && <CredentialsScreen />}
        {activeSegment === 'vehicles' && <VehiclesScreen />}
        {activeSegment === 'notes' && <NotesScreen />}
        {activeSegment === 'profile' && <PersonalInfoScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  securitySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  securitySubText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  selectorWrapper: {
    marginTop: 2,
  },
  selectorScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  activeCategoryTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCategoryTab: {},
  categoryTabText: {
    fontSize: 13,
  },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  contextBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  contextTagline: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
});
