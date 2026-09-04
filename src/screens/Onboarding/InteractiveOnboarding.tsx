// src/screens/Onboarding/InteractiveOnboarding.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { MascotController } from '../../components/mascot/MascotController';
import { MascotMood } from '../../engine/mascotStateMachine';
import {
  checkDeviceAuthCapabilities,
  authenticateWithDevice,
  DeviceAuthCapabilities,
} from '../../services/deviceAuthService';
import {
  ShieldCheck,
  Fingerprint,
  Check,
  ArrowRight,
  HardDrive,
  HeartHandshake,
  Smartphone,
  ScanFace,
  Lock,
  Calendar,
  FolderLock,
} from 'lucide-react-native';

interface InteractiveOnboardingProps {
  onComplete: () => void;
}

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({
  onComplete,
}) => {
  const { settings, updateProfile, completeOnboarding } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  // 4-Phase Flow:
  // Phase 1: Meet Pangly (Greeting)
  // Phase 2: Understand Pangly (Privacy & Everyday Use)
  // Phase 3: Keep Pangly Safe (Phone Built-In Security)
  // Phase 4: Enter Pangly (Setup Complete & Launch)
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);

  // User Profile (Empty by default)
  const [userName, setUserName] = useState('');

  // Device Hardware Capabilities
  const [deviceAuth, setDeviceAuth] = useState<DeviceAuthCapabilities | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'device_biometrics' | 'device_passcode'>('device_biometrics');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState('');

  // Phase transition animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    checkDeviceAuthCapabilities().then((caps) => {
      if (!isMounted) return;
      setDeviceAuth(caps);
      if (caps.supportsFingerprint || caps.supportsFaceRecognition) {
        setSelectedMethod('device_biometrics');
      } else {
        setSelectedMethod('device_passcode');
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const triggerPhaseTransition = (nextPhase: 1 | 2 | 3 | 4) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setPhase(nextPhase);
  };

  // Phase 1: Meet Pangly Greeting Dialogue
  const greetingDialogue = "Hey! I'm Pangly. Welcome to your private space. 🛡️\n\nI will protect your important documents, passwords, vehicle logs, and notes.";

  // Phase 2: Understand Pangly Dialogue
  const understandDialogue = "Everything stays strictly on this phone. No accounts, no cloud servers, and no tracking. I'm your private digital companion.";

  // Phase 3: Keep Pangly Safe Dialogue
  const secureDialogue = authVerified
    ? "Your phone security is linked and armed! Let's step into your private space."
    : "Use your phone's existing security to protect your private space. No separate passwords to create or remember!";

  // Phase 4: Vault Ready Dialogue
  const completionDialogue = "You're all set! Whenever you need to look up an ID, check vehicle service, or find a private note, I'm right here.";

  // Active Mascot Mood strictly synchronized with Setup Step:
  // Step 1 -> pangly_waving.gif
  // Step 2 -> pangly_thinking.gif
  // Step 3 -> pangly_shield.gif
  // Step 4 -> pangly_celebrate.gif
  const currentMood: MascotMood =
    phase === 1
      ? 'waving'
      : phase === 2
      ? 'thinking'
      : phase === 3
      ? 'shield_guard'
      : 'celebrate';

  // Handle Device Auth Verification
  const handleVerifyDeviceAuth = async () => {
    setIsVerifying(true);
    setAuthError('');

    const res = await authenticateWithDevice({
      promptMessage: 'Confirm your phone security to unlock Pangly',
      fallbackLabel: 'Use Phone Passcode',
    });

    setIsVerifying(false);

    if (res.success) {
      setAuthVerified(true);
    } else {
      setAuthError(res.error || 'Authentication cancelled. Please try again.');
    }
  };

  const handleFinish = () => {
    if (userName.trim()) {
      updateProfile({ fullName: userName.trim() });
    }
    completeOnboarding(selectedMethod);
    onComplete();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top 4-Phase Progress Bar */}
      <View style={styles.topProgressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressPill,
              {
                backgroundColor:
                  step === phase
                    ? theme.primary
                    : step < phase
                    ? theme.primaryDark
                    : theme.surfaceSubtle,
                flex: step === phase ? 2 : 1,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Animated Mascot Rig & Live Dialogue Box */}
        <MascotController
          mood={currentMood}
          dialogue={
            phase === 1
              ? greetingDialogue
              : phase === 2
              ? understandDialogue
              : phase === 3
              ? secureDialogue
              : completionDialogue
          }
          speakerName="Pangly • Your Private Companion 🛡️"
          size={140}
        />

        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          {/* ========================================================= */}
          {/* PHASE 1: MEET PANGLY */}
          {/* ========================================================= */}
          {phase === 1 && (
            <View style={styles.phaseContainer}>
              <View style={[styles.welcomeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.welcomeRow}>
                  <View style={[styles.welcomeIconBox, { backgroundColor: theme.primaryGlow }]}>
                    <HeartHandshake size={20} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Nice to meet you!</Text>
                    <Text style={[styles.welcomeSub, { color: theme.textSecondary }]}>
                      What should Pangly call you?
                    </Text>
                  </View>
                </View>

                <TextInput
                  style={[styles.nameInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="Enter your name or nickname"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => triggerPhaseTransition(2)}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.primaryBtnText}>Continue to Introduction</Text>
                <ArrowRight size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================= */}
          {/* PHASE 2: UNDERSTAND PANGLY */}
          {/* ========================================================= */}
          {phase === 2 && (
            <View style={styles.phaseContainer}>
              <View style={styles.pillarsGrid}>
                {/* Pillar 1: 100% On This Phone */}
                <View style={[styles.pillarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.pillarIcon, { backgroundColor: theme.primaryGlow }]}>
                    <HardDrive size={18} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>100% On This Phone</Text>
                    <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                      Your IDs, passwords, vehicle logs, and notes stay safely on your device. Nothing is sent to the internet.
                    </Text>
                  </View>
                </View>

                {/* Pillar 2: Organized & Ready */}
                <View style={[styles.pillarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.pillarIcon, { backgroundColor: theme.accentAmber + '22' }]}>
                    <FolderLock size={18} color={theme.accentAmber} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>Organized & Ready</Text>
                    <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                      Never worry about where you kept an ID, a password, or when your car needs maintenance.
                    </Text>
                  </View>
                </View>

                {/* Pillar 3: Expiry & Reminders */}
                <View style={[styles.pillarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.pillarIcon, { backgroundColor: theme.accentCyan + '22' }]}>
                    <Calendar size={18} color={theme.accentCyan} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>Smart Deadlines & Expiries</Text>
                    <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                      Pangly keeps track of Passport renewals, license expiries, and vehicle service dates automatically.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => triggerPhaseTransition(3)}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.primaryBtnText}>Keep Pangly Safe</Text>
                <ArrowRight size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================= */}
          {/* PHASE 3: KEEP PANGLY SAFE (DEVICE AUTHENTICATION) */}
          {/* ========================================================= */}
          {phase === 3 && (
            <View style={styles.phaseContainer}>
              <View style={[styles.securityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.securityHeader}>
                  <View style={[styles.securityIconCircle, { backgroundColor: theme.primaryGlow }]}>
                    <ShieldCheck size={24} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.securityTitle, { color: theme.textPrimary }]}>Keep Pangly Safe</Text>
                    <Text style={[styles.securitySub, { color: theme.textSecondary }]}>
                      Use your phone's existing security to protect your private space.
                    </Text>
                  </View>
                </View>

                {/* Available Hardware Methods */}
                <View style={styles.methodsList}>
                  {/* Option A: Biometrics (Fingerprint / Face ID) */}
                  {(deviceAuth?.supportsFingerprint || deviceAuth?.supportsFaceRecognition) && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedMethod('device_biometrics')}
                      style={[
                        styles.methodOption,
                        {
                          backgroundColor: selectedMethod === 'device_biometrics' ? theme.surfaceElevated : theme.surface,
                          borderColor: selectedMethod === 'device_biometrics' ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <View style={styles.methodLeft}>
                        {deviceAuth.supportsFaceRecognition ? (
                          <ScanFace size={22} color={theme.primary} />
                        ) : (
                          <Fingerprint size={22} color={theme.primary} />
                        )}
                        <View>
                          <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>
                            {deviceAuth.supportsFaceRecognition ? 'Face Recognition / Face ID' : 'Fingerprint'}
                          </Text>
                          <Text style={[styles.methodDesc, { color: theme.textMuted }]}>
                            Quick 1-touch phone lock
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: selectedMethod === 'device_biometrics' ? theme.primary : theme.border,
                            backgroundColor: selectedMethod === 'device_biometrics' ? theme.primary : 'transparent',
                          },
                        ]}
                      >
                        {selectedMethod === 'device_biometrics' && <Check size={12} color="#000" />}
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Option B: Device PIN / Passcode */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedMethod('device_passcode')}
                    style={[
                      styles.methodOption,
                      {
                        backgroundColor: selectedMethod === 'device_passcode' ? theme.surfaceElevated : theme.surface,
                        borderColor: selectedMethod === 'device_passcode' ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.methodLeft}>
                      <Smartphone size={22} color={theme.accentAmber} />
                      <View>
                        <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>Device PIN / Passcode</Text>
                        <Text style={[styles.methodDesc, { color: theme.textMuted }]}>
                          Your phone's lock screen code
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: selectedMethod === 'device_passcode' ? theme.primary : theme.border,
                          backgroundColor: selectedMethod === 'device_passcode' ? theme.primary : 'transparent',
                        },
                      ]}
                    >
                      {selectedMethod === 'device_passcode' && <Check size={12} color="#000" />}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Plain Privacy Note */}
                <View style={[styles.privacyCallout, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Lock size={14} color={theme.primary} />
                  <Text style={[styles.privacyCalloutText, { color: theme.textSecondary }]}>
                    Pangly never asks for or stores your phone password. It simply checks with your phone to confirm it's you.
                  </Text>
                </View>

                {authError ? <Text style={[styles.authErrorText, { color: theme.danger }]}>{authError}</Text> : null}

                {/* Action Button */}
                {!authVerified ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleVerifyDeviceAuth}
                    disabled={isVerifying}
                    style={[styles.primaryBtn, { backgroundColor: theme.primary, width: '100%', marginHorizontal: 0, marginTop: 14 }]}
                  >
                    {isVerifying ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <>
                        <ShieldCheck size={18} color="#000000" />
                        <Text style={styles.primaryBtnText}>Test & Enable Phone Security</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: '100%', marginTop: 14, gap: 12 }}>
                    <View style={[styles.verifiedPill, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}>
                      <Check size={16} color={theme.primary} />
                      <Text style={[styles.verifiedText, { color: theme.primary }]}>
                        Phone Security Confirmed & Ready!
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => triggerPhaseTransition(4)}
                      style={[styles.primaryBtn, { backgroundColor: theme.primary, width: '100%', marginHorizontal: 0 }]}
                    >
                      <Text style={styles.primaryBtnText}>Continue to Complete Setup</Text>
                      <ArrowRight size={18} color="#000000" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* PHASE 4: ENTER PANGLY */}
          {/* ========================================================= */}
          {phase === 4 && (
            <View style={styles.phaseContainer}>
              <View style={[styles.celebrationCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                <View style={[styles.celebrationIconBox, { backgroundColor: theme.primaryGlow }]}>
                  <ShieldCheck size={28} color={theme.primary} />
                </View>
                <Text style={[styles.celebrationTitle, { color: theme.textPrimary }]}>Your Private Space is Ready</Text>
                <Text style={[styles.celebrationSub, { color: theme.textSecondary }]}>
                  Protected by your phone's security. Everything stays 100% on this device.
                </Text>

                <View style={styles.summaryList}>
                  <View style={styles.summaryItem}>
                    <Check size={16} color={theme.primary} />
                    <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
                      Owner: <Text style={{ fontWeight: '700' }}>{userName || 'You'}</Text>
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Check size={16} color={theme.primary} />
                    <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
                      Security: <Text style={{ fontWeight: '700' }}>Phone Lock Screen</Text>
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Check size={16} color={theme.primary} />
                    <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
                      Storage: <Text style={{ fontWeight: '700' }}>100% On-Device</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleFinish}
                  style={[styles.primaryBtn, { backgroundColor: theme.primary, width: '100%', marginHorizontal: 0, marginTop: 16 }]}
                >
                  <Text style={styles.primaryBtnText}>Enter Pangly</Text>
                  <ArrowRight size={18} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topProgressBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  progressPill: {
    height: 4,
    borderRadius: 2,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  phaseContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  welcomeCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  welcomeSub: {
    fontSize: 13,
    marginTop: 2,
  },
  nameInput: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 50,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  pillarsGrid: {
    width: '100%',
    gap: 10,
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  pillarIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  pillarDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  securityCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  securitySub: {
    fontSize: 13,
    marginTop: 2,
  },
  methodsList: {
    gap: 10,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  methodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  privacyCalloutText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  authErrorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  celebrationCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  celebrationIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  celebrationSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  summaryList: {
    width: '100%',
    marginVertical: 10,
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 13,
  },
});
