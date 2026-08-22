// src/screens/Onboarding/DialogueScripts.ts

import { MascotMood } from '../../engine/mascotStateMachine';

export interface OnboardingStepScript {
  stepIndex: number;
  title: string;
  mood: MascotMood;
  dialogue: string;
  helperNote?: string;
  nextButtonLabel: string;
}

export const ONBOARDING_SCRIPTS: Record<number, OnboardingStepScript> = {
  1: {
    stepIndex: 1,
    title: 'Meet Pango 🐾',
    mood: 'welcome',
    dialogue: "Hi! I'm Pango, your private second brain guardian. 🛡️\n\nI live 100% inside this phone. No cloud databases, no trackers, and no subscription fees. Let's build your impenetrable fortress!",
    nextButtonLabel: "Let's Begin 🚀",
  },
  2: {
    stepIndex: 2,
    title: 'Your Identity 👤',
    mood: 'waiting',
    dialogue: "What should I call you? I'll personalize your second brain and your offline daily summaries.",
    helperNote: 'Your name is stored strictly in your local device vault.',
    nextButtonLabel: 'Continue',
  },
  3: {
    stepIndex: 3,
    title: 'Master PIN 🔒',
    mood: 'shield_guard',
    dialogue: 'Set your 4-digit Master PIN. I will curl into my armored shell and protect your sensitive data behind this code.',
    helperNote: 'Never share your PIN. It encrypts all passwords and documents.',
    nextButtonLabel: 'Confirm PIN',
  },
  4: {
    stepIndex: 4,
    title: 'Forging Recovery Key ⚡',
    mood: 'thinking',
    dialogue: 'Hold tight! I am spinning the emerald privacy crystal to generate your 256-bit Master Recovery Key...',
    helperNote: 'Write this key down or keep it in a safe place.',
    nextButtonLabel: 'I Saved My Key 🔑',
  },
  5: {
    stepIndex: 5,
    title: 'Fortress Activated! 🎉',
    mood: 'success',
    dialogue: "We are all set! You never have to worry about where you saved your IDs, car maintenance, or passwords again.\n\nJust tap my icon in the center anytime to ask me anything!",
    nextButtonLabel: 'Enter My Vault 🏰',
  },
};
