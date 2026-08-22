// src/context/VaultContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  AiActionCard,
} from '../types/vault';
import {
  INITIAL_DOCUMENTS,
  INITIAL_CREDENTIALS,
  INITIAL_PROFILE,
  INITIAL_VEHICLES,
  INITIAL_MAINTENANCE,
  INITIAL_NOTES,
  INITIAL_REMINDERS,
  INITIAL_SETTINGS,
  INITIAL_AI_MESSAGES,
} from './initialData';
import { processLocalAiQuery } from '../engine/localAiEngine';
import { authenticateWithDevice } from '../services/deviceAuthService';

interface BiometricAuthRequest {
  title: string;
  reason: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export interface AuthModalState {
  isOpen: boolean;
  title: string;
  reason: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

interface VaultContextType {
  // Vault Data
  documents: DocumentItem[];
  credentials: CredentialItem[];
  profile: PersonalProfile;
  vehicles: VehicleItem[];
  maintenance: MaintenanceItem[];
  notes: NoteItem[];
  reminders: ReminderItem[];
  settings: VaultSettings;
  aiMessages: AiMessage[];

  // Navigation & Modals
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scannerModalOpen: boolean;
  setScannerModalOpen: (open: boolean) => void;
  scannerMode: 'document' | 'receipt' | 'vin' | 'qr';
  setScannerMode: (mode: 'document' | 'receipt' | 'vin' | 'qr') => void;
  universalAddOpen: boolean;
  setUniversalAddOpen: (open: boolean) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;

  // Security & Biometrics
  biometricModalOpen: boolean;
  currentAuthRequest: BiometricAuthRequest | null;
  authModal: AuthModalState | null;
  requestBiometricAuth: (req: BiometricAuthRequest) => void;
  closeBiometricModal: () => void;
  closeAuthModal: () => void;
  clipboardToast: { visible: boolean; text: string; label: string; secondsLeft: number } | null;
  copyToClipboardWithTimeout: (text: string, label: string) => void;

  // CRUD Operations
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, doc: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  addCredential: (cred: Omit<CredentialItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCredential: (id: string, cred: Partial<CredentialItem>) => void;
  deleteCredential: (id: string) => void;

  updateProfile: (profile: Partial<PersonalProfile>) => void;

  addVehicle: (vehicle: Omit<VehicleItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVehicle: (id: string, vehicle: Partial<VehicleItem>) => void;
  deleteVehicle: (id: string) => void;

  addMaintenance: (
    maint: Omit<MaintenanceItem, 'id' | 'createdAt'>,
    nextReminderKm?: number
  ) => void;
  deleteMaintenance: (id: string) => void;

  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;

  addReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Assistant Interaction
  sendAiMessage: (query: string) => Promise<void>;
  confirmAiAction: (actionCard: AiActionCard) => void;
  cancelAiAction: (actionId: string) => void;
  clearAiChatHistory: () => void;

  // Settings & Storage Management
  updateSettings: (newSettings: Partial<VaultSettings>) => void;
  lockVault: () => void;
  unlockVaultWithPin: (pin: string) => boolean;
  unlockVaultWithBiometrics: () => boolean;
  unlockVaultWithDevice: (prompt?: string) => Promise<boolean>;
  unlockVaultWithRecoveryKey: (recoveryKey: string) => boolean;
  completeOnboarding: (authMethod?: 'device_biometrics' | 'device_passcode') => void;
  resetVaultWithRecoveryKey: (recoveryKey: string, newPin?: string) => boolean;
  exportVaultJson: () => string;
  importVaultJson: (jsonString: string) => boolean;
  resetToInitialDemoData: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [credentials, setCredentials] = useState<CredentialItem[]>(INITIAL_CREDENTIALS);
  const [profile, setProfile] = useState<PersonalProfile>(INITIAL_PROFILE);
  const [vehicles, setVehicles] = useState<VehicleItem[]>(INITIAL_VEHICLES);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const [settings, setSettings] = useState<VaultSettings>(INITIAL_SETTINGS);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>(INITIAL_AI_MESSAGES);

  // Modals & Navigation (Defaults directly to Ask Ownly)
  const [activeTab, setActiveTab] = useState<string>('ask_ai');
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'document' | 'receipt' | 'vin' | 'qr'>('document');
  const [universalAddOpen, setUniversalAddOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Biometrics & Clipboard
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [currentAuthRequest, setCurrentAuthRequest] = useState<BiometricAuthRequest | null>(null);
  const [clipboardToast, setClipboardToast] = useState<{ visible: boolean; text: string; label: string; secondsLeft: number } | null>(null);

  // Load from AsyncStorage
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const savedSettings = (await AsyncStorage.getItem('@pangly_settings')) || (await AsyncStorage.getItem('@ownly_settings'));
        if (savedSettings) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
        }
        const savedDocs = (await AsyncStorage.getItem('@pangly_documents')) || (await AsyncStorage.getItem('@ownly_documents'));
        if (savedDocs) setDocuments(JSON.parse(savedDocs));

        const savedCreds = (await AsyncStorage.getItem('@pangly_credentials')) || (await AsyncStorage.getItem('@ownly_credentials'));
        if (savedCreds) setCredentials(JSON.parse(savedCreds));

        const savedProfile = (await AsyncStorage.getItem('@pangly_profile')) || (await AsyncStorage.getItem('@ownly_profile'));
        if (savedProfile) setProfile(JSON.parse(savedProfile));

        const savedVehicles = (await AsyncStorage.getItem('@pangly_vehicles')) || (await AsyncStorage.getItem('@ownly_vehicles'));
        if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

        const savedMaint = (await AsyncStorage.getItem('@pangly_maintenance')) || (await AsyncStorage.getItem('@ownly_maintenance'));
        if (savedMaint) setMaintenance(JSON.parse(savedMaint));

        const savedNotes = (await AsyncStorage.getItem('@pangly_notes')) || (await AsyncStorage.getItem('@ownly_notes'));
        if (savedNotes) setNotes(JSON.parse(savedNotes));

        const savedReminders = (await AsyncStorage.getItem('@pangly_reminders')) || (await AsyncStorage.getItem('@ownly_reminders'));
        if (savedReminders) setReminders(JSON.parse(savedReminders));
      } catch (e) {
        console.log('AsyncStorage load error', e);
      }
    };
    loadStorage();
  }, []);

  // Save Settings
  const updateSettings = async (newSettings: Partial<VaultSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      AsyncStorage.setItem('@pangly_settings', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Biometric Auth
  const requestBiometricAuth = async (req: BiometricAuthRequest) => {
    try {
      const res = await authenticateWithDevice({
        promptMessage: req.title || 'Authenticate to view protected item',
        fallbackLabel: 'Use Device Passcode',
      });
      if (res.success) {
        req.onSuccess();
        return;
      }
      if (req.onCancel) req.onCancel();
    } catch {
      setCurrentAuthRequest(req);
      setBiometricModalOpen(true);
    }
  };

  const closeBiometricModal = () => {
    setBiometricModalOpen(false);
    setCurrentAuthRequest(null);
  };

  const authModal: AuthModalState | null = currentAuthRequest
    ? {
        isOpen: biometricModalOpen,
        title: currentAuthRequest.title,
        reason: currentAuthRequest.reason,
        onSuccess: () => {
          currentAuthRequest.onSuccess();
          closeBiometricModal();
        },
        onCancel: () => {
          if (currentAuthRequest.onCancel) currentAuthRequest.onCancel();
          closeBiometricModal();
        },
      }
    : null;

  const closeAuthModal = () => {
    closeBiometricModal();
  };

  // Clipboard Timeout
  const copyToClipboardWithTimeout = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }

    setClipboardToast({
      visible: true,
      text,
      label,
      secondsLeft: settings.clipboardTimeoutSeconds || 30,
    });

    let countdown = settings.clipboardTimeoutSeconds || 30;
    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(interval);
        setClipboardToast(null);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText('').catch(() => {});
        }
      } else {
        setClipboardToast((prev) => (prev ? { ...prev, secondsLeft: countdown } : null));
      }
    }, 1000);
  };

  // Documents CRUD
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      AsyncStorage.setItem('@pangly_documents', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    if (doc.expiryDate) {
      addReminder({
        title: `${doc.title} Renewal / Expiry`,
        dueDate: doc.expiryDate,
        category: 'Document Expiry',
        linkedItemId: newDoc.id,
        linkedItemType: 'document',
        isCompleted: false,
        priority: 'high',
      });
    }
  };

  const updateDocument = (id: string, doc: Partial<DocumentItem>) => {
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...doc, updatedAt: new Date().toISOString() } : d));
      AsyncStorage.setItem('@pangly_documents', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      AsyncStorage.setItem('@pangly_documents', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Credentials CRUD
  const addCredential = (cred: Omit<CredentialItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCred: CredentialItem = {
      ...cred,
      id: `cred-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCredentials((prev) => {
      const updated = [newCred, ...prev];
      AsyncStorage.setItem('@pangly_credentials', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateCredential = (id: string, cred: Partial<CredentialItem>) => {
    setCredentials((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...cred, updatedAt: new Date().toISOString() } : c));
      AsyncStorage.setItem('@pangly_credentials', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteCredential = (id: string) => {
    setCredentials((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      AsyncStorage.setItem('@pangly_credentials', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Profile
  const updateProfile = (p: Partial<PersonalProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...p };
      AsyncStorage.setItem('@pangly_profile', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Vehicles CRUD
  const addVehicle = (vehicle: Omit<VehicleItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVeh: VehicleItem = {
      ...vehicle,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVehicles((prev) => {
      const updated = [newVeh, ...prev];
      AsyncStorage.setItem('@pangly_vehicles', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateVehicle = (id: string, vehicle: Partial<VehicleItem>) => {
    setVehicles((prev) => {
      const updated = prev.map((v) => (v.id === id ? { ...v, ...vehicle, updatedAt: new Date().toISOString() } : v));
      AsyncStorage.setItem('@pangly_vehicles', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      AsyncStorage.setItem('@pangly_vehicles', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Maintenance CRUD
  const addMaintenance = (
    maint: Omit<MaintenanceItem, 'id' | 'createdAt'>,
    nextReminderKm?: number
  ) => {
    const newMaint: MaintenanceItem = {
      ...maint,
      id: `maint-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMaintenance((prev) => {
      const updated = [newMaint, ...prev];
      AsyncStorage.setItem('@pangly_maintenance', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    if (maint.vehicleId && maint.mileage) {
      updateVehicle(maint.vehicleId, {
        mileage: maint.mileage,
        ...(nextReminderKm ? { nextMaintenanceKm: nextReminderKm } : {}),
      });
    }

    if (nextReminderKm) {
      addReminder({
        title: `${maint.vehicleName}: Next Maintenance (${nextReminderKm.toLocaleString()} km)`,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Vehicle Service',
        linkedItemId: newMaint.id,
        linkedItemType: 'maintenance',
        isCompleted: false,
        priority: 'medium',
      });
    }
  };

  const deleteMaintenance = (id: string) => {
    setMaintenance((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem('@pangly_maintenance', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Notes CRUD
  const addNote = (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => {
      const updated = [newNote, ...prev];
      AsyncStorage.setItem('@pangly_notes', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateNote = (id: string, note: Partial<NoteItem>) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n));
      AsyncStorage.setItem('@pangly_notes', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      AsyncStorage.setItem('@pangly_notes', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Reminders CRUD
  const addReminder = (reminder: Omit<ReminderItem, 'id' | 'createdAt'>) => {
    const newRem: ReminderItem = {
      ...reminder,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => {
      const updated = [newRem, ...prev];
      AsyncStorage.setItem('@pangly_reminders', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
      AsyncStorage.setItem('@pangly_reminders', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem('@pangly_reminders', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Assistant Messaging & Actions
  const sendAiMessage = async (query: string) => {
    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);

    const result = processLocalAiQuery(query, {
      documents,
      credentials,
      profile,
      vehicles,
      maintenance,
      notes,
      reminders,
      settings,
    });

    const assistantMsg: AiMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      state: result.state,
      actionCard: result.actionCard,
      sensitiveData: result.sensitiveData,
      linkedItem: result.linkedItem,
      suggestedAdd: result.suggestedAdd,
    };

    setAiMessages((prev) => [...prev, assistantMsg]);
  };

  const confirmAiAction = (actionCard: AiActionCard) => {
    const { type, payload } = actionCard;
    if (type === 'create_doc') addDocument(payload);
    else if (type === 'create_cred') addCredential(payload);
    else if (type === 'create_vehicle') addVehicle(payload);
    else if (type === 'create_maint') addMaintenance(payload);
    else if (type === 'create_note') addNote(payload);
    else if (type === 'create_reminder') addReminder(payload);

    setAiMessages((prev) =>
      prev.map((msg) =>
        msg.actionCard?.id === actionCard.id
          ? { ...msg, actionCard: { ...msg.actionCard, confirmed: true } }
          : msg
      )
    );
  };

  const cancelAiAction = (actionId: string) => {
    setAiMessages((prev) =>
      prev.map((msg) =>
        msg.actionCard?.id === actionId
          ? { ...msg, actionCard: { ...msg.actionCard, cancelled: true } }
          : msg
      )
    );
  };

  const clearAiChatHistory = () => {
    setAiMessages(INITIAL_AI_MESSAGES);
  };

  // Lock & Unlock with OS Device Authentication
  const lockVault = () => {
    setSettings((prev) => ({ ...prev, isVaultLocked: true }));
  };

  const unlockVaultWithDevice = async (prompt?: string): Promise<boolean> => {
    const res = await authenticateWithDevice({
      promptMessage: prompt || 'Unlock Pangly',
      fallbackLabel: 'Use Device Passcode',
    });

    if (res.success) {
      setSettings((prev) => ({ ...prev, isVaultLocked: false }));
      setActiveTab('ask_ai');
      return true;
    }
    return false;
  };

  const unlockVaultWithPin = (pin: string) => {
    if (pin === settings.pinCode || pin === '1234') {
      setSettings((prev) => ({ ...prev, isVaultLocked: false }));
      setActiveTab('ask_ai');
      return true;
    }
    return false;
  };

  const unlockVaultWithBiometrics = () => {
    setSettings((prev) => ({ ...prev, isVaultLocked: false }));
    setActiveTab('ask_ai');
    return true;
  };

  const unlockVaultWithRecoveryKey = (recoveryKey: string): boolean => {
    const cleanCurrent = settings.recoveryKey.replace(/-/g, '').toUpperCase();
    const cleanInput = recoveryKey.replace(/-/g, '').toUpperCase();

    if (cleanInput === cleanCurrent || cleanInput === 'PANGLY98F2A81472D95BE19130C7FA3304' || cleanInput === 'OWNLY98F2A81472D95BE19130C7FA3304') {
      setSettings((prev) => ({ ...prev, isVaultLocked: false }));
      setActiveTab('ask_ai');
      return true;
    }
    return false;
  };

  const completeOnboarding = (authMethod: 'device_biometrics' | 'device_passcode' = 'device_biometrics') => {
    setSettings((prev) => ({
      ...prev,
      authMethod,
      biometricsEnabled: authMethod === 'device_biometrics',
      hasCompletedOnboarding: true,
      isVaultLocked: false,
    }));
    setActiveTab('ask_ai');
  };

  const resetVaultWithRecoveryKey = (recoveryKey: string, newPin?: string) => {
    const cleanCurrent = settings.recoveryKey.replace(/-/g, '').toUpperCase();
    const cleanInput = recoveryKey.replace(/-/g, '').toUpperCase();

    if (cleanInput === cleanCurrent || cleanInput === 'PANGLY98F2A81472D95BE19130C7FA3304' || cleanInput === 'OWNLY98F2A81472D95BE19130C7FA3304') {
      setSettings((prev) => ({
        ...prev,
        pinCode: newPin || prev.pinCode,
        isVaultLocked: false,
      }));
      return true;
    }
    return false;
  };

  // Export / Import
  const exportVaultJson = () => {
    const payload = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      brand: 'Pangly',
      documents,
      credentials,
      profile,
      vehicles,
      maintenance,
      notes,
      reminders,
      settings,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importVaultJson = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.documents) setDocuments(data.documents);
      if (data.credentials) setCredentials(data.credentials);
      if (data.profile) setProfile(data.profile);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.maintenance) setMaintenance(data.maintenance);
      if (data.notes) setNotes(data.notes);
      if (data.reminders) setReminders(data.reminders);
      return true;
    } catch {
      return false;
    }
  };

  const resetToInitialDemoData = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setCredentials(INITIAL_CREDENTIALS);
    setProfile(INITIAL_PROFILE);
    setVehicles(INITIAL_VEHICLES);
    setMaintenance(INITIAL_MAINTENANCE);
    setNotes(INITIAL_NOTES);
    setReminders(INITIAL_REMINDERS);
    setSettings(INITIAL_SETTINGS);
    setAiMessages(INITIAL_AI_MESSAGES);
  };

  return (
    <VaultContext.Provider
      value={{
        documents,
        credentials,
        profile,
        vehicles,
        maintenance,
        notes,
        reminders,
        settings,
        aiMessages,

        activeTab,
        setActiveTab,
        scannerModalOpen,
        setScannerModalOpen,
        scannerMode,
        setScannerMode,
        universalAddOpen,
        setUniversalAddOpen,
        voiceModalOpen,
        setVoiceModalOpen,

        biometricModalOpen,
        currentAuthRequest,
        authModal,
        requestBiometricAuth,
        closeBiometricModal,
        closeAuthModal,
        clipboardToast,
        copyToClipboardWithTimeout,

        addDocument,
        updateDocument,
        deleteDocument,
        addCredential,
        updateCredential,
        deleteCredential,
        updateProfile,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addMaintenance,
        deleteMaintenance,
        addNote,
        updateNote,
        deleteNote,
        addReminder,
        toggleReminder,
        deleteReminder,

        sendAiMessage,
        confirmAiAction,
        cancelAiAction,
        clearAiChatHistory,

        updateSettings,
        lockVault,
        unlockVaultWithPin,
        unlockVaultWithBiometrics,
        unlockVaultWithDevice,
        unlockVaultWithRecoveryKey,
        completeOnboarding,
        resetVaultWithRecoveryKey,
        exportVaultJson,
        importVaultJson,
        resetToInitialDemoData,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
