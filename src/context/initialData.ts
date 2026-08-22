// src/context/initialData.ts

import {
  DocumentItem,
  CredentialItem,
  PersonalProfile,
  VehicleItem,
  MaintenanceItem,
  NoteItem,
  ReminderItem,
  VaultSettings,
  AiMessage,
} from '../types/vault';

// Clean initial states — completely free of any real personal data
export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_CREDENTIALS: CredentialItem[] = [];

export const INITIAL_PROFILE: PersonalProfile = {
  fullName: '',
  birthday: '',
  phone: '',
  email: '',
  address: '',
  bloodType: '',
  emergencyContacts: [],
  customFields: [],
};

export const INITIAL_VEHICLES: VehicleItem[] = [];

export const INITIAL_MAINTENANCE: MaintenanceItem[] = [];

export const INITIAL_NOTES: NoteItem[] = [];

export const INITIAL_REMINDERS: ReminderItem[] = [];

export const INITIAL_SETTINGS: VaultSettings = {
  theme: 'light',
  autoLockTimeoutSeconds: 300,
  biometricsEnabled: true,
  screenshotProtection: true,
  clipboardTimeoutSeconds: 30,
  hideSensitiveByDefault: true,
  aiPermissions: {
    documents: true,
    credentials: true,
    personalInfo: true,
    vehicles: true,
    notes: true,
    reminders: true,
  },
  recoveryKey: 'OWNLY-98F2-A814-72D9-5BE1-9130-C7FA-3304',
  authMethod: 'device_biometrics',
  hasCompletedOnboarding: false,
  isVaultLocked: false,
};

export const INITIAL_AI_MESSAGES: AiMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: "Hello! I'm Pangly, your private helper. 🛡️\n\nI can help you look up your saved documents, vehicle maintenance dates, passwords, and private notes. Everything stays safely on this phone.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];
