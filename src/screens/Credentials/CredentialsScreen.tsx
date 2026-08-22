// src/screens/Credentials/CredentialsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CredentialCategory, CredentialItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { CredentialDetailModal } from './CredentialDetailModal';
import { AddCredentialModal } from './AddCredentialModal';
import { PangolinCompanion } from '../../components/PangolinCompanion';
import {
  Search,
  Plus,
  KeyRound,
  Lock,
  Copy,
  ChevronRight,
  Code,
  Share2,
  Building,
  Briefcase,
  Mail,
  Server,
  Sparkles,
} from 'lucide-react-native';

export const CredentialsScreen: React.FC = () => {
  const { credentials, settings, copyToClipboardWithTimeout, requestBiometricAuth } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCred, setActiveCred] = useState<CredentialItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const categories = ['All', 'Development', 'Social', 'Banking', 'Work', 'Email', 'Hosting', 'Other'];

  const filteredCreds = credentials.filter((cred) => {
    const matchesCat = selectedCategory === 'All' || cred.category === selectedCategory;
    const matchesSearch =
      cred.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: CredentialCategory) => {
    switch (category) {
      case 'Development':
        return Code;
      case 'Banking':
        return Building;
      case 'Work':
        return Briefcase;
      case 'Email':
        return Mail;
      case 'Hosting':
        return Server;
      default:
        return KeyRound;
    }
  };

  const handleQuickCopy = (cred: CredentialItem, e: any) => {
    copyToClipboardWithTimeout(cred.password || '', `${cred.service} Password`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search accounts, services, emails..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catPill,
                selectedCategory === cat
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.catPillText,
                  {
                    color: selectedCategory === cat ? '#000' : theme.textSecondary,
                    fontWeight: selectedCategory === cat ? '700' : '500',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Credentials List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredCreds.length === 0 ? (
          <View style={styles.emptyState}>
            <PangolinCompanion mood="thinking" size={80} showBubble={false} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Keep your accounts organized.
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Store passwords, recovery codes, and tokens. Everything is encrypted on-device.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => setAddModalOpen(true)}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.emptyBtnText}>Add First Credential</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCreds.map((cred) => {
            const IconComp = getCategoryIcon(cred.category);
            return (
              <TouchableOpacity
                key={cred.id}
                activeOpacity={0.75}
                onPress={() => setActiveCred(cred)}
                style={[styles.credCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.surfaceElevated }]}>
                  <IconComp size={20} color={theme.accentAmber} />
                </View>

                <View style={styles.credInfo}>
                  <Text style={[styles.serviceName, { color: theme.textPrimary }]}>{cred.service}</Text>
                  <Text style={[styles.usernameText, { color: theme.textSecondary }]}>{cred.username}</Text>
                  <View style={styles.passRow}>
                    <Text style={[styles.maskedPass, { color: theme.textMuted }]}>••••••••••••</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.copyBtn, { backgroundColor: theme.surfaceElevated }]}
                  onPress={(e) => handleQuickCopy(cred, e)}
                >
                  <Copy size={16} color={theme.primary} />
                </TouchableOpacity>

                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Detail Modal */}
      <CredentialDetailModal
        credential={activeCred}
        visible={activeCred !== null}
        onClose={() => setActiveCred(null)}
      />

      {/* Add Modal */}
      <AddCredentialModal
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
  searchSection: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoriesSection: {
    paddingVertical: 6,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  credCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credInfo: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
  },
  usernameText: {
    fontSize: 12,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  maskedPass: {
    fontSize: 13,
    letterSpacing: 2,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
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
