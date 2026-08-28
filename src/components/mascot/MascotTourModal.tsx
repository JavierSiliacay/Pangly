// src/components/mascot/MascotTourModal.tsx
// Interactive First-Run Mascot Tour that guides users on how to use Pangly.
// Ends with the celebratory "You're all set!" screen.

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { MascotRig } from './MascotRig';
import {
  Sparkles,
  Mic,
  Camera,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react-native';

import { MascotMood } from '../../engine/mascotStateMachine';

const { width } = Dimensions.get('window');

interface MascotTourModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TourStep {
  mood: MascotMood;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  tipText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    mood: 'welcome',
    title: 'Meet Pangly',
    subtitle: 'Your Private Life Agent',
    description:
      'I live directly inside this phone. I help you remember deadlines, organize receipts, track bills, and protect your private documents.',
    icon: Sparkles,
    tipText: 'Everything stays strictly on this device — zero cloud tracking.',
  },
  {
    mood: 'waving',
    title: 'Speak or Text Anytime',
    subtitle: 'Ask Pangly Assistant',
    description:
      'Tap the microphone or type to tell me things like "Remind me to pay electric bill on Monday" or "Find my passport number".',
    icon: Mic,
    tipText: 'Try saying: "Log $35 fuel expense" or "When is my next oil change?"',
  },
  {
    mood: 'thinking',
    title: 'Snap & Auto-Organize',
    subtitle: 'Universal Camera & Vault',
    description:
      'Use the (+) button to scan driver’s licenses, receipts, ID cards, or warranties. I will automatically extract the dates and details for you.',
    icon: Camera,
    tipText: 'Photos stay in an encrypted sandbox, hidden from your public gallery.',
  },
  {
    mood: 'celebrate',
    title: "You're All Set! 🎉",
    subtitle: 'Your Private Space is Ready',
    description:
      'Your vault is armed with biometric protection and your on-device AI assistant is ready to help manage your life.',
    icon: CheckCircle2,
    tipText: 'Tap below to step into your private space!',
  },
];

export const MascotTourModal: React.FC<MascotTourModalProps> = ({
  visible,
  onClose,
}) => {
  const { settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStepIndex(0);
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStepIndex(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Top Bar with Skip */}
          <View style={styles.topBar}>
            <View style={styles.stepDotsRow}>
              {TOUR_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentStepIndex
                          ? theme.primary
                          : theme.borderSubtle,
                      width: i === currentStepIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>

            {!isLastStep && (
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Living Mascot Presentation */}
          <View style={styles.mascotContainer}>
            <MascotRig mood={step.mood} size={120} />
          </View>

          {/* Step Tag Header */}
          <View style={[styles.stepTag, { backgroundColor: theme.primaryGlow }]}>
            <StepIcon size={14} color={theme.primary} />
            <Text style={[styles.stepTagText, { color: theme.primary }]}>
              {step.subtitle}
            </Text>
          </View>

          {/* Content */}
          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>
            {step.title}
          </Text>

          <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
            {step.description}
          </Text>

          {/* Helpful Tip Box */}
          <View style={[styles.tipBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Sparkles size={14} color={theme.primary} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.textMuted }]}>
              {step.tipText}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>
              {isLastStep ? 'Start Using Pangly' : 'Next'}
            </Text>
            {isLastStep ? (
              <ShieldCheck size={18} color="#000000" />
            ) : (
              <ArrowRight size={18} color="#000000" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mascotContainer: {
    marginVertical: 10,
  },
  stepTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  stepTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  tipBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  tipIcon: {
    marginTop: 1,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  actionBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
