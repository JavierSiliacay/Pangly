// src/screens/AskPangly/AskPanglyScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { MascotRig } from '../../components/mascot/MascotRig';
import {
  Send,
  Sparkles,
  Mic,
  ShieldCheck,
  Check,
  Lock,
  Plus,
  FileText,
  Car,
  FileEdit,
  KeyRound,
  Eye,
  ChevronRight,
} from 'lucide-react-native';

export const AskPanglyScreen: React.FC = () => {
  const {
    aiMessages,
    sendAiMessage,
    confirmAiAction,
    requestBiometricAuth,
    setActiveTab,
    setVoiceModalOpen,
    setUniversalAddOpen,
    profile,
    documents,
    vehicles,
    notes,
    credentials,
    settings,
  } = useVault();

  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const firstName = profile.fullName ? profile.fullName.split(' ')[0] : '';
  const greetingTitle = firstName ? `Welcome back, ${firstName}!` : 'Welcome back!';

  const suggestedPrompts = [
    { label: "What documents do I have?", icon: FileText },
    { label: "When is my next vehicle service?", icon: Car },
    { label: "Show my private notes", icon: FileEdit },
    { label: "What logins are saved?", icon: KeyRound },
    { label: "Show my emergency contacts", icon: ShieldCheck },
  ];

  const categoryShortcuts = [
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
    { id: 'notes', label: 'Notes', icon: FileEdit, count: notes.length },
    { id: 'credentials', label: 'Passwords', icon: KeyRound, count: credentials.length },
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [aiMessages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isThinking) return;

    setInputQuery('');
    setIsThinking(true);
    try {
      await sendAiMessage(q);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRevealSensitive = (msgId: string, sensitiveData: any) => {
    requestBiometricAuth({
      title: 'Reveal Secret Password',
      reason: `Authenticate with your phone to view ${sensitiveData.label || 'secret password'}.`,
      onSuccess: () => {
        setRevealedIds((prev) => ({ ...prev, [msgId]: true }));
      },
    });
  };

  const isInitialState = aiMessages.length <= 1;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Clean Minimal Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle, backgroundColor: theme.surface }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.privatePill, { backgroundColor: theme.primaryGlow }]}>
            <ShieldCheck size={14} color={theme.primary} />
            <Text style={[styles.privateText, { color: theme.primary }]}>100% On-Device & Private</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setUniversalAddOpen(true)}
          style={[styles.headerAddBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
        >
          <Plus size={16} color={theme.primary} />
          <Text style={[styles.headerAddText, { color: theme.textPrimary }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Main Conversational Body */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Living Mascot Hero Greeting (Visible at start) */}
        {isInitialState && (
          <View style={styles.heroSection}>
            <View style={styles.mascotHeroContainer}>
              <MascotRig mood="idle" size={130} />
            </View>

            <Text style={[styles.heroGreeting, { color: theme.textPrimary }]}>{greetingTitle}</Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              What should we take care of today?
            </Text>

            {/* Category Quick Shortcuts */}
            <View style={styles.shortcutsRow}>
              {categoryShortcuts.map((cat) => {
                const IconComp = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab('vault')}
                    style={[styles.shortcutCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <IconComp size={16} color={theme.primary} />
                    <Text style={[styles.shortcutLabel, { color: theme.textPrimary }]}>{cat.label}</Text>
                    {cat.count > 0 && (
                      <View style={[styles.shortcutCountBadge, { backgroundColor: theme.surfaceElevated }]}>
                        <Text style={[styles.shortcutCountText, { color: theme.textMuted }]}>{cat.count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Prompt Suggestion Pills */}
            <View style={styles.suggestedPromptsContainer}>
              <Text style={[styles.promptsHeading, { color: theme.textMuted }]}>
                Ask about your saved records:
              </Text>
              <View style={styles.promptsGrid}>
                {suggestedPrompts.map((p, idx) => {
                  const IconComp = p.icon;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.75}
                      onPress={() => handleSend(p.label)}
                      style={[styles.promptPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                      <IconComp size={13} color={theme.primary} />
                      <Text style={[styles.promptPillText, { color: theme.textPrimary }]}>
                        "{p.label}"
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Message Stream */}
        {!isInitialState && (
          <View style={styles.messagesList}>
            {aiMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isRevealed = revealedIds[msg.id] || false;

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userRow : styles.assistantRow,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.assistantAvatar}>
                      <MascotRig mood="idle" size={38} showOrb={false} />
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: theme.primary }]
                        : [styles.assistantBubble, { backgroundColor: theme.surface, borderColor: theme.border }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isUser ? '#000000' : theme.textPrimary, fontWeight: isUser ? '600' : '400' },
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* SENSITIVE DATA REVEAL */}
                    {msg.sensitiveData && (
                      <View style={[styles.sensitiveBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                        <View style={styles.sensitiveHeader}>
                          <Lock size={14} color={theme.accentAmber} />
                          <Text style={[styles.sensitiveLabel, { color: theme.accentAmber }]}>
                            {msg.sensitiveData.label}
                          </Text>
                        </View>

                        <Text style={[styles.sensitiveVal, { color: isRevealed ? theme.textPrimary : theme.textMuted }]}>
                          {isRevealed ? msg.sensitiveData.raw : '••••••••••••'}
                        </Text>

                        {!isRevealed ? (
                          <TouchableOpacity
                            style={[styles.revealBtn, { backgroundColor: theme.primary }]}
                            onPress={() => handleRevealSensitive(msg.id, msg.sensitiveData)}
                          >
                            <Eye size={14} color="#000000" />
                            <Text style={styles.revealBtnText}>Unlock with Phone Security</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.revealedBadge}>
                            <ShieldCheck size={12} color={theme.primary} />
                            <Text style={[styles.revealedText, { color: theme.primary }]}>Unlocked & Verified</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* ACTION CARDS (Confirm Reminder / Item) */}
                    {msg.actionCard && !msg.actionCard.confirmed && (
                      <View style={[styles.actionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
                        <Text style={[styles.actionCardTitle, { color: theme.textPrimary }]}>
                          {msg.actionCard.title}
                        </Text>
                        <View style={styles.actionCardBtns}>
                          <TouchableOpacity
                            style={[styles.actionBtnConfirm, { backgroundColor: theme.primary }]}
                            onPress={() => confirmAiAction(msg.actionCard!)}
                          >
                            <Check size={14} color="#000000" />
                            <Text style={styles.actionBtnText}>Save to Reminders</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {msg.actionCard?.confirmed && (
                      <View style={[styles.confirmedPill, { backgroundColor: theme.primaryGlow }]}>
                        <Check size={12} color={theme.primary} />
                        <Text style={[styles.confirmedText, { color: theme.primary }]}>Saved to your private reminders</Text>
                      </View>
                    )}

                    {/* LINKED ITEM SHORTCUT */}
                    {msg.linkedItem && (
                      <TouchableOpacity
                        style={[styles.linkedItemBtn, { borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                        onPress={() => {
                          if (msg.linkedItem?.type === 'reminder') setActiveTab('reminders');
                          else setActiveTab('vault');
                        }}
                      >
                        <Text style={[styles.linkedItemText, { color: theme.primary }]}>
                          View {msg.linkedItem.title} in Vault
                        </Text>
                        <ChevronRight size={14} color={theme.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {isThinking && (
              <View style={styles.thinkingWrapper}>
                <MascotRig mood="thinking" size={40} showOrb={false} />
                <View style={[styles.thinkingBubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.thinkingTitle, { color: theme.primary }]}>Pangly is looking up your records...</Text>
                  <Text style={[styles.thinkingSub, { color: theme.textSecondary }]}>
                    Searching your private space on this phone
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modern Conversational Input Bar */}
      <View style={[styles.inputBarWrapper, { backgroundColor: theme.surface, borderTopColor: theme.borderSubtle }]}>
        <View style={[styles.inputContainer, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setUniversalAddOpen(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color={theme.primary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.textInput, { color: theme.textPrimary }]}
            placeholder="Ask Pangly anything about your records..."
            placeholderTextColor={theme.textMuted}
            value={inputQuery}
            onChangeText={setInputQuery}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline={false}
          />

          <TouchableOpacity
            style={styles.micBtn}
            onPress={() => setVoiceModalOpen(true)}
            activeOpacity={0.7}
          >
            <Mic size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputQuery.trim() ? theme.primary : 'transparent',
              },
            ]}
            onPress={() => handleSend()}
            disabled={!inputQuery.trim() || isThinking}
            activeOpacity={0.8}
          >
            <Send
              size={17}
              color={inputQuery.trim() ? '#000000' : theme.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export const AskOwnlyScreen = AskPanglyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  privateText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerAddText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexGrow: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
  mascotHeroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  shortcutLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  shortcutCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shortcutCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  suggestedPromptsContainer: {
    width: '100%',
    marginTop: 22,
  },
  promptsHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptsGrid: {
    gap: 8,
  },
  promptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  promptPillText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  messagesList: {
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  sensitiveBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  sensitiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sensitiveLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sensitiveVal: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  revealBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  revealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revealedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionCardBtns: {
    flexDirection: 'row',
  },
  actionBtnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  confirmedText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  linkedItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  linkedItemText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  thinkingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  thinkingBubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
    flex: 1,
  },
  thinkingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  thinkingSub: {
    fontSize: 11.5,
  },
  inputBarWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  attachBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  micBtn: {
    padding: 6,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
