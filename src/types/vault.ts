// src/types/vault.ts

export type DocumentCategory = 
  | 'Government'
  | 'Banking'
  | 'Insurance'
  | 'Work'
  | 'School'
  | 'Identification'
  | 'Vehicle'
  | 'Health'
  | 'Financial'
  | 'Legal'
  | 'Other';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  provider?: string;
  documentNumber?: string;
  fullName?: string;
  issueDate?: string;
  expiryDate?: string;
  imageUri?: string;
  notes?: string;
  isSensitive?: boolean;
  reminderCreated?: boolean;
  linkedVehicleId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CredentialCategory = 
  | 'Personal'
  | 'Work'
  | 'Banking'
  | 'Social'
  | 'Email'
  | 'Development'
  | 'Hosting'
  | 'Other';

export interface CredentialItem {
  id: string;
  service: string;
  category: CredentialCategory;
  username: string;
  password?: string;
  pin?: string;
  website?: string;
  notes?: string;
  iconName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  isSensitive?: boolean;
}

export interface PersonalProfile {
  fullName: string;
  birthday?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  emergencyContacts: EmergencyContact[];
  customFields: CustomField[];
}

export interface VehicleItem {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  mileage: number;
  nickname?: string;
  photoUri?: string;
  nextMaintenanceKm: number;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceType = 
  | 'Oil Change'
  | 'PMS'
  | 'Brake Service'
  | 'Battery Replacement'
  | 'Tire Replacement'
  | 'Repair'
  | 'Other';

export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  cost?: number;
  parts?: string;
  serviceProvider?: string;
  notes?: string;
  receiptUri?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category?: 'General' | 'Personal' | 'Work' | 'Medical' | 'Ideas';
  tags?: string[];
  isPinned?: boolean;
  isSensitive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReminderRelatedType = 'document' | 'vehicle' | 'maintenance' | 'note' | 'general' | 'none';

export interface ReminderItem {
  id: string;
  title: string;
  dueDate: string;
  category: 'Document Expiry' | 'Vehicle Service' | 'Bill / Renewal' | 'Personal' | 'Other';
  relatedType?: ReminderRelatedType;
  repeatRule?: string;
  linkedItemId?: string;
  linkedItemType?: 'document' | 'vehicle' | 'maintenance' | 'note';
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AiActionCard {
  id: string;
  type: 'create_doc' | 'create_cred' | 'create_vehicle' | 'create_maint' | 'create_note' | 'create_reminder';
  title: string;
  payload: any;
  confirmed?: boolean;
  cancelled?: boolean;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  state?: 'thinking' | 'searching' | 'found' | 'no_result';
  actionCard?: AiActionCard;
  sensitiveData?: {
    type: string;
    label: string;
    masked: string;
    raw: string;
    isRevealed: boolean;
  };
  linkedItem?: {
    type: 'document' | 'credential' | 'vehicle' | 'maintenance' | 'note' | 'reminder';
    id: string;
    title: string;
  };
  suggestedAdd?: {
    type: string;
    prompt: string;
  };
}

export interface VaultSettings {
  theme: 'dark' | 'slate' | 'light';
  autoLockTimeoutSeconds: number;
  biometricsEnabled: boolean;
  screenshotProtection: boolean;
  clipboardTimeoutSeconds: number;
  hideSensitiveByDefault: boolean;
  aiPermissions: {
    documents: boolean;
    credentials: boolean;
    personalInfo: boolean;
    vehicles: boolean;
    notes: boolean;
    reminders: boolean;
  };
  recoveryKey: string;
  pinCode?: string;
  authMethod?: 'device_biometrics' | 'device_passcode';
  hasCompletedOnboarding: boolean;
  isVaultLocked: boolean;
}
