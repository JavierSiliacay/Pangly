// src/screens/Onboarding/OnboardingFlow.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Fingerprint,
  KeyRound,
  ArrowRight,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react-native';

const MASCOT_AWAKE = require('../../../assets/pangolin/mascot_awake.jpg');

interface OnboardingFlowProps {
  onComplete: () => void;
  onRestoreExisting: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onRestoreExisting }) => {
  const { completeOnboarding, settings, copyToClipboardWithTimeout } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [step, setStep] = useState<'welcome' | 'privacy' | 'pin' | 'biometrics' | 'recovery'>('welcome');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enableBio, setEnableBio] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generatedKey = 'PANGLY-98F2-A814-72D9-5BE1-9130-C7FA-3304';

  const handleCreatePin = () => {
    if (pin.length < 4) {
      setErrorMsg('Please enter a 4-digit PIN');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('PIN numbers do not match');
      return;
    }
    setErrorMsg('');
    setStep('biometrics');
  };

  const handleCopyKey = () => {
    copyToClipboardWithTimeout(generatedKey, 'Recovery Key');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleFinish = () => {
    completeOnboarding(enableBio ? 'device_biometrics' : 'device_passcode');
    onComplete();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      {/* STEP 1: WELCOME */}
      {step === 'welcome' && (
        <View style={styles.stepBox}>
          <View style={[styles.mascotWrapper, { borderColor: theme.primary }]}>
            <Image source={MASCOT_AWAKE} style={styles.mascotImg} />
          </View>

          <Text style={[styles.appName, { color: theme.textPrimary }]}>Pangly</Text>
          <Text style={[styles.tagline, { color: theme.primary }]}>Your private second brain.</Text>
          <Text style={[styles.subTagline, { color: theme.textSecondary }]}>
            Store it. Ask it. Own it.{'\n'}Everything stays on your device.
          </Text>

          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => setStep('privacy')}
            >
              <Text style={styles.primaryBtnText}>Create My Vault</Text>
              <ArrowRight size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={onRestoreExisting}>
              <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
                Restore Existing Vault
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 2: PRIVACY INTRODUCTION */}
      {step === 'privacy' && (
        <View style={styles.stepBox}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryGlow }]}>
            <ShieldCheck size={36} color={theme.primary} />
          </View>

          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Your data belongs to you.</Text>
          <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
            Pangly is built strictly local-first. We do not maintain any cloud databases or servers for your personal information.
          </Text>

          <View style={styles.featureList}>
            <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>📴</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featTitle, { color: theme.textPrimary }]}>100% Offline by Design</Text>
                <Text style={[styles.featSub, { color: theme.textMuted }]}>
                  All records, IDs, notes, and photos stay on your phone.
                </Text>
              </View>
            </View>

            <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featTitle, { color: theme.textPrimary }]}>On-Device AI Assistant</Text>
                <Text style={[styles.featSub, { color: theme.textMuted }]}>
                  Ask natural questions locally. Zero queries sent to external clouds.
                </Text>
              </View>
            </View>

            <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>🔐</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featTitle, { color: theme.textPrimary }]}>Hardware Encryption</Text>
                <Text style={[styles.featSub, { color: theme.textMuted }]}>
                  Protected by biometric authentication and your personal key.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setStep('pin')}
          >
            <Text style={styles.primaryBtnText}>Continue to Security Setup</Text>
            <ArrowRight size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: CREATE PIN */}
      {step === 'pin' && (
        <View style={styles.stepBox}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryGlow }]}>
            <Lock size={36} color={theme.primary} />
          </View>

          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Secure Your Vault</Text>
          <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
            Choose a 4-digit PIN to protect the local encryption key for your vault.
          </Text>

          {errorMsg ? <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text> : null}

          <View style={styles.inputStack}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CREATE 4-DIGIT PIN</Text>
            <TextInput
              style={[styles.pinInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              value={pin}
              onChangeText={setPin}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CONFIRM PIN</Text>
            <TextInput
              style={[styles.pinInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              value={confirmPin}
              onChangeText={setConfirmPin}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleCreatePin}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
            <ArrowRight size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 4: BIOMETRICS */}
      {step === 'biometrics' && (
        <View style={styles.stepBox}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryGlow }]}>
            <Fingerprint size={42} color={theme.primary} />
          </View>

          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Unlock Faster</Text>
          <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
            Use Fingerprint or Face authentication to unlock Pangly securely and seamlessly.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setEnableBio(!enableBio)}
            style={[
              styles.toggleCard,
              { backgroundColor: theme.surface, borderColor: enableBio ? theme.primary : theme.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>Enable Biometrics</Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                FaceID / TouchID for quick reveals and unlocks
              </Text>
            </View>
            <View
              style={[
                styles.checkbox,
                { backgroundColor: enableBio ? theme.primary : 'transparent', borderColor: theme.primary },
              ]}
            >
              {enableBio && <Check size={14} color="#000" />}
            </View>
          </TouchableOpacity>

          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => setStep('recovery')}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
              <ArrowRight size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('recovery')}>
              <Text style={[styles.secondaryBtnText, { color: theme.textMuted }]}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 5: RECOVERY KEY */}
      {step === 'recovery' && (
        <View style={styles.stepBox}>
          <View style={[styles.iconCircle, { backgroundColor: theme.accentAmber + '22' }]}>
            <KeyRound size={36} color={theme.accentAmber} />
          </View>

          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Protect Your Vault</Text>
          <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
            Your master recovery key is required if you ever forget your PIN. Store it in a safe place.
          </Text>

          <View style={[styles.keyBox, { backgroundColor: theme.surface, borderColor: theme.accentAmber }]}>
            <Text style={[styles.keyText, { color: theme.accentAmber }]}>{generatedKey}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyKey}>
              {copiedKey ? <Check size={16} color={theme.primary} /> : <Copy size={16} color={theme.textSecondary} />}
              <Text style={[styles.copyBtnText, { color: copiedKey ? theme.primary : theme.textSecondary }]}>
                {copiedKey ? 'Copied' : 'Copy Key'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.warningBox, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={[styles.warningTitle, { color: theme.warning }]}>⚠️ Critical Reminder</Text>
            <Text style={[styles.warningBody, { color: theme.textMuted }]}>
              Pangly developers have zero access to your vault. If you lose your recovery key and PIN, your data cannot be restored.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleFinish}
          >
            <CheckCircle size={18} color="#000" />
            <Text style={styles.primaryBtnText}>I've Stored My Key — Enter Vault</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBox: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 16,
  },
  mascotWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImg: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '700',
  },
  subTagline: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  btnGroup: {
    width: '100%',
    gap: 10,
    marginTop: 18,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  featureList: {
    width: '100%',
    gap: 10,
    marginVertical: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    fontSize: 24,
  },
  featTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  featSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  inputStack: {
    width: '100%',
    gap: 10,
    marginVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pinInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    width: '100%',
    marginVertical: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBox: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  keyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    padding: 12,
    borderRadius: 12,
    width: '100%',
    gap: 4,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  warningBody: {
    fontSize: 11,
    lineHeight: 16,
  },
});
