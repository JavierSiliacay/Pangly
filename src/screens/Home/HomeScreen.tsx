// src/screens/Home/HomeScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { Header } from '../../components/Header';
import { MascotRig } from '../../components/mascot/MascotRig';
import {
  Sparkles,
  Camera,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Car,
  FileText,
  KeyRound,
  Wrench,
  FileEdit,
  Bell,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';

interface HomeScreenProps {
  onOpenAiWithPrompt?: (prompt: string) => void;
  onOpenScanner?: () => void;
  onOpenUniversalAdd?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenAiWithPrompt,
  onOpenScanner,
  onOpenUniversalAdd,
}) => {
  const {
    documents,
    credentials,
    vehicles,
    maintenance,
    reminders,
    settings,
    profile,
    setActiveTab,
    setScannerModalOpen,
    setUniversalAddOpen,
    sendAiMessage,
  } = useVault();

  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;
  const [quickInput, setQuickInput] = useState('');

  const suggestedQuestions = [
    "When does my ID expire?",
    "When is my next vehicle service?",
    "Show my saved private notes",
    "Where is my emergency contact?",
  ];

  const handleAskQuick = (promptText?: string) => {
    const textToSend = promptText || quickInput;
    if (!textToSend.trim()) {
      setActiveTab('ask_ai');
      return;
    }
    sendAiMessage(textToSend);
    setQuickInput('');
    setActiveTab('ask_ai');
  };

  const upcomingReminders = reminders.filter((r) => !r.isCompleted).slice(0, 3);
  const expiringDocs = documents.filter((d) => d.expiryDate).slice(0, 2);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header onSearchPress={() => setActiveTab('search')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Living Mascot NPC Greeting Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActiveTab('ask_ai')}
          style={[styles.mascotHeroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <MascotRig mood="welcome" size={82} />
          <View style={styles.mascotHeroContent}>
            <View style={[styles.mascotPill, { backgroundColor: theme.primaryGlow }]}>
              <Sparkles size={11} color={theme.primary} />
              <Text style={[styles.mascotPillText, { color: theme.primary }]}>Pangly • Private Companion</Text>
            </View>
            <Text style={[styles.mascotHeroTitle, { color: theme.textPrimary }]}>
              {profile.fullName ? `Hello ${profile.fullName}! ` : 'Welcome! '}
              "Your information is safe on this phone. Tap me to ask anything."
            </Text>
            <Text style={[styles.mascotHeroSub, { color: theme.textMuted }]}>
              🔒 100% On-Device • Private & Protected
            </Text>
          </View>
        </TouchableOpacity>

        {/* Large Ask Pangly Input */}
        <View style={[styles.aiCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
          <View style={styles.aiInputRow}>
            <Sparkles size={20} color={theme.primary} />
            <TextInput
              style={[styles.aiInput, { color: theme.textPrimary }]}
              placeholder="Ask Pangly anything..."
              placeholderTextColor={theme.textMuted}
              value={quickInput}
              onChangeText={setQuickInput}
              onSubmitEditing={() => handleAskQuick()}
            />
            <TouchableOpacity
              style={[styles.askBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleAskQuick()}
            >
              <ArrowRight size={16} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Suggested Prompt Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {suggestedQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => handleAskQuick(q)}
                style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }]}>"{q}"</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Action Shortcuts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionScroll}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('vault');
            }}
            style={[styles.actionPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <FileText size={16} color={theme.primary} />
            <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>Documents ({documents.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('vault');
            }}
            style={[styles.actionPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <KeyRound size={16} color={theme.accentAmber} />
            <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>Passwords ({credentials.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('vault');
            }}
            style={[styles.actionPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Car size={16} color={theme.accentCyan} />
            <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>Vehicles ({vehicles.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('reminders')}
            style={[styles.actionPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Bell size={16} color={theme.primary} />
            <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>Reminders ({reminders.length})</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Upcoming Expiries & Deadlines Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Upcoming Deadlines & Expiries</Text>
          <TouchableOpacity onPress={() => setActiveTab('reminders')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>View All ({reminders.length})</Text>
          </TouchableOpacity>
        </View>

        {upcomingReminders.length > 0 ? (
          <View style={styles.remindersList}>
            {upcomingReminders.map((rem) => (
              <View
                key={rem.id}
                style={[styles.reminderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={[styles.reminderIconBox, { backgroundColor: theme.primaryGlow }]}>
                  <Calendar size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reminderTitle, { color: theme.textPrimary }]}>{rem.title}</Text>
                  <Text style={[styles.reminderDue, { color: theme.textMuted }]}>Due: {rem.dueDate}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: theme.surfaceElevated }]}>
                  <Text style={[styles.priorityText, { color: theme.primary }]}>{rem.category}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <CheckCircle2 size={28} color={theme.primary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>All Clear & Up to Date</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Add a document, vehicle, or reminder to automatically track upcoming renewals.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setUniversalAddOpen(true)}
              style={[styles.emptyAddBtn, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}
            >
              <Plus size={14} color={theme.primary} />
              <Text style={[styles.emptyAddBtnText, { color: theme.primary }]}>Add Information</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Private Vault Summary Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Private Vault Summary</Text>
          <TouchableOpacity onPress={() => setActiveTab('vault')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>Open Vault</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridSummary}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('vault')}
            style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <FileText size={22} color={theme.primary} />
            <Text style={[styles.summaryCount, { color: theme.textPrimary }]}>{documents.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Documents & IDs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('vault')}
            style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <KeyRound size={22} color={theme.accentAmber} />
            <Text style={[styles.summaryCount, { color: theme.textPrimary }]}>{credentials.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Logins & Pins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('vault')}
            style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Car size={22} color={theme.accentCyan} />
            <Text style={[styles.summaryCount, { color: theme.textPrimary }]}>{vehicles.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Vehicles</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 36,
    gap: 16,
  },
  mascotHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mascotHeroContent: {
    flex: 1,
    gap: 4,
  },
  mascotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  mascotPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  mascotHeroTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  mascotHeroSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  aiCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
  },
  askBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScroll: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionScroll: {
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  remindersList: {
    gap: 10,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  reminderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reminderDue: {
    fontSize: 11,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridSummary: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
