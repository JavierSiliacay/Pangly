// src/screens/Search/GlobalSearchScreen.tsx

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
  Search,
  ArrowLeft,
  Sparkles,
  FileText,
  KeyRound,
  Car,
  CircleDollarSign,
  FileEdit,
  Clock,
  User,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

interface GlobalSearchScreenProps {
  onBack?: () => void;
}

export const GlobalSearchScreen: React.FC<GlobalSearchScreenProps> = ({ onBack }) => {
  const {
    documents,
    credentials,
    vehicles,
    maintenance,
    notes,
    reminders,
    setActiveTab,
    sendAiMessage,
    settings,
  } = useVault();

  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  // Search each category
  const matchedDocs = q ? documents.filter(d => (d.title && d.title.toLowerCase().includes(q)) || (d.provider && d.provider.toLowerCase().includes(q)) || (d.documentNumber && d.documentNumber.toLowerCase().includes(q))) : [];
  const matchedCreds = q ? credentials.filter(c => (c.service && c.service.toLowerCase().includes(q)) || (c.username && c.username.toLowerCase().includes(q))) : [];
  const matchedVehicles = q ? vehicles.filter(v => (v.make && v.make.toLowerCase().includes(q)) || (v.model && v.model.toLowerCase().includes(q)) || (v.plateNumber && v.plateNumber.toLowerCase().includes(q))) : [];
  const matchedNotes = q ? notes.filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q))) : [];
  const matchedReminders = q ? reminders.filter(r => r.title && r.title.toLowerCase().includes(q)) : [];

  const totalResults = matchedDocs.length + matchedCreds.length + matchedVehicles.length + matchedNotes.length + matchedReminders.length;

  const handleAskAiAboutSearch = () => {
    if (!query.trim()) return;
    sendAiMessage(query);
    setActiveTab('ask_ai');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onBack ? onBack() : setActiveTab('home')}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={[styles.searchBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
          <Search size={18} color={theme.primary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search everything in your vault..."
            placeholderTextColor={theme.textMuted}
            autoFocus
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        {query.trim().length > 0 && (
          <TouchableOpacity
            style={[styles.aiBridgeCard, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}
            onPress={handleAskAiAboutSearch}
          >
            <Sparkles size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiBridgeTitle, { color: theme.primary }]}>
                Ask Pangly about "{query}"
              </Text>
              <Text style={[styles.aiBridgeSub, { color: theme.textSecondary }]}>
                Ask natural questions using on-device conversational AI
              </Text>
            </View>
            <ChevronRight size={16} color={theme.primary} />
          </TouchableOpacity>
        )}

        {query.trim().length > 0 && totalResults === 0 ? (
          <View style={styles.emptyResults}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No direct matches found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try asking our on-device AI assistant above to semantically search your notes and records.
            </Text>
          </View>
        ) : null}

        {/* DOCUMENTS SECTION */}
        {matchedDocs.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Documents ({matchedDocs.length})</Text>
            <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {matchedDocs.map((doc, idx) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.resultItem, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                  onPress={() => setActiveTab('documents')}
                >
                  <FileText size={16} color={theme.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{doc.title}</Text>
                    <Text style={[styles.itemSub, { color: theme.textMuted }]}>{doc.provider}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* CREDENTIALS SECTION */}
        {matchedCreds.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Credentials ({matchedCreds.length})</Text>
            <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {matchedCreds.map((cred, idx) => (
                <TouchableOpacity
                  key={cred.id}
                  style={[styles.resultItem, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                  onPress={() => setActiveTab('credentials')}
                >
                  <KeyRound size={16} color={theme.accentAmber} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{cred.service}</Text>
                    <Text style={[styles.itemSub, { color: theme.textMuted }]}>{cred.username}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* VEHICLES SECTION */}
        {matchedVehicles.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Vehicles ({matchedVehicles.length})</Text>
            <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {matchedVehicles.map((veh, idx) => (
                <TouchableOpacity
                  key={veh.id}
                  style={[styles.resultItem, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                  onPress={() => setActiveTab('vehicles')}
                >
                  <Car size={16} color={theme.accentTeal} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{veh.make} {veh.model}</Text>
                    <Text style={[styles.itemSub, { color: theme.textMuted }]}>Plate: {veh.plateNumber}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* NOTES SECTION */}
        {matchedNotes.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notes ({matchedNotes.length})</Text>
            <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {matchedNotes.map((n, idx) => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.resultItem, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                  onPress={() => setActiveTab('notes')}
                >
                  <FileEdit size={16} color={theme.accentPurple} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{n.title}</Text>
                    <Text style={[styles.itemSub, { color: theme.textMuted }]} numberOfLines={1}>{n.content}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* REMINDERS SECTION */}
        {matchedReminders.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Reminders ({matchedReminders.length})</Text>
            <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {matchedReminders.map((rem, idx) => (
                <TouchableOpacity
                  key={rem.id}
                  style={[styles.resultItem, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                  onPress={() => setActiveTab('reminders')}
                >
                  <Clock size={16} color={theme.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{rem.title}</Text>
                    <Text style={[styles.itemSub, { color: theme.textMuted }]}>Due: {rem.dueDate}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    padding: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  resultsScroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  aiBridgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  aiBridgeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  aiBridgeSub: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyResults: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionGroup: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  groupCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 1,
  },
});
