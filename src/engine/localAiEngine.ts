// src/engine/localAiEngine.ts

import {
  DocumentItem,
  CredentialItem,
  PersonalProfile,
  VehicleItem,
  MaintenanceItem,
  NoteItem,
  ReminderItem,
  VaultSettings,
  AiActionCard,
} from '../types/vault';

export interface VaultStateSnapshot {
  documents: DocumentItem[];
  credentials: CredentialItem[];
  profile: PersonalProfile;
  vehicles: VehicleItem[];
  maintenance: MaintenanceItem[];
  notes: NoteItem[];
  reminders: ReminderItem[];
  settings: VaultSettings;
}

export interface LocalAiResponse {
  text: string;
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

export function processLocalAiQuery(
  userQuery: string,
  vault: VaultStateSnapshot
): LocalAiResponse {
  const q = userQuery.toLowerCase().trim();

  // 1. Reminders creation intent ("Remind me to X")
  if (q.startsWith('remind') || q.includes('set reminder') || q.includes('remind me')) {
    const titleMatch = userQuery.replace(/^(?:remind me to|remind me|set reminder for|set reminder)\s*/i, '').trim();
    const cleanTitle = titleMatch || 'Important Task';

    const actionCard: AiActionCard = {
      id: `act-rem-${Date.now()}`,
      type: 'create_reminder',
      title: `Create Reminder: "${cleanTitle}"`,
      payload: {
        title: cleanTitle,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Personal',
        isCompleted: false,
        priority: 'medium',
      },
    };

    return {
      text: `I've prepared a reminder for "${cleanTitle}". Would you like to save it to your reminders?`,
      state: 'found',
      actionCard,
    };
  }

  // 2. Query All Documents ("What documents do I have?" or specific doc)
  if (q.includes('document') || q.includes('passport') || q.includes('license') || q.includes('id') || q.includes('insurance') || q.includes('expire')) {
    if (vault.documents.length === 0) {
      return {
        text: "I couldn't find any saved documents in your vault yet. Would you like to add your first document now?",
        state: 'no_result',
        suggestedAdd: {
          type: 'document',
          prompt: 'Add your first document',
        },
      };
    }

    // Check specific match
    const specificDoc = vault.documents.find(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.category && d.category.toLowerCase().includes(q)) ||
        (d.provider && d.provider.toLowerCase().includes(q)) ||
        (d.documentNumber && d.documentNumber.toLowerCase().includes(q))
    );

    if (specificDoc) {
      return {
        text: `Here is what I found for **${specificDoc.title}**:\n\n• Provider: ${specificDoc.provider || 'N/A'}\n• ID Number: ${specificDoc.documentNumber || 'N/A'}\n• Expiration Date: ${specificDoc.expiryDate || 'No expiry date recorded'}`,
        state: 'found',
        linkedItem: {
          type: 'document',
          id: specificDoc.id,
          title: specificDoc.title,
        },
      };
    }

    // List overview of documents
    const docList = vault.documents.map((d) => `• **${d.title}** (${d.category})${d.expiryDate ? ` - Exp: ${d.expiryDate}` : ''}`).join('\n');
    return {
      text: `Here are the **${vault.documents.length} documents** saved in your private vault:\n\n${docList}`,
      state: 'found',
      linkedItem: {
        type: 'document',
        id: vault.documents[0].id,
        title: vault.documents[0].title,
      },
    };
  }

  // 3. Query Vehicles ("When is my car registration due?", "Check my car", "Toyota")
  if (q.includes('car') || q.includes('vehicle') || q.includes('toyota') || q.includes('motorcycle') || q.includes('oil') || q.includes('pms') || q.includes('service') || q.includes('mileage') || q.includes('registration')) {
    if (vault.vehicles.length === 0) {
      return {
        text: "I couldn't find any vehicles in your vault yet. Would you like to add your car or motorcycle?",
        state: 'no_result',
        suggestedAdd: {
          type: 'vehicle',
          prompt: 'Add your vehicle',
        },
      };
    }

    const veh = vault.vehicles.find(
      (v) =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
        (v.nickname && v.nickname.toLowerCase().includes(q))
    ) || vault.vehicles[0];

    const kmRemaining = Math.max(0, (veh.nextMaintenanceKm || 0) - (veh.mileage || 0));
    const vehMaint = vault.maintenance.filter((m) => m.vehicleId === veh.id);

    return {
      text: `Here is your vehicle summary for **${veh.make} ${veh.model}**:\n\n• Plate: ${veh.plateNumber || 'N/A'}\n• Odometer: ${veh.mileage?.toLocaleString() || '0'} km\n• Next Service Due: ${veh.nextMaintenanceKm ? `${veh.nextMaintenanceKm.toLocaleString()} km (in ${kmRemaining.toLocaleString()} km)` : 'Not scheduled'}\n\n${vehMaint.length > 0 ? `Latest Service: ${vehMaint[0].type} on ${vehMaint[0].date}` : 'No past maintenance recorded yet.'}`,
      state: 'found',
      linkedItem: {
        type: 'vehicle',
        id: veh.id,
        title: `${veh.make} ${veh.model}`,
      },
    };
  }

  // 4. Query Passwords & Logins
  if (q.includes('password') || q.includes('login') || q.includes('pin') || q.includes('wifi') || q.includes('account') || q.includes('credentials')) {
    if (vault.credentials.length === 0) {
      return {
        text: "I couldn't find any saved logins in your vault yet. Would you like to add one now?",
        state: 'no_result',
        suggestedAdd: {
          type: 'credential',
          prompt: 'Save a login',
        },
      };
    }

    const cred = vault.credentials.find(
      (c) =>
        c.service.toLowerCase().includes(q) ||
        (c.username && c.username.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
    );

    if (cred) {
      return {
        text: `I located your login for **${cred.service}**:\nUsername: ${cred.username}`,
        state: 'found',
        sensitiveData: {
          type: 'password',
          label: `${cred.service} Password`,
          masked: '••••••••••••',
          raw: cred.password || 'No password saved',
          isRevealed: false,
        },
        linkedItem: {
          type: 'credential',
          id: cred.id,
          title: cred.service,
        },
      };
    }

    const credList = vault.credentials.map((c) => `• **${c.service}** (${c.username})`).join('\n');
    return {
      text: `You have **${vault.credentials.length} logins** saved:\n\n${credList}\n\nAsk me for any specific service to reveal its password.`,
      state: 'found',
    };
  }

  // 5. Query Notes
  if (q.includes('note') || q.includes('list') || q.includes('idea') || q.includes('checklist')) {
    if (vault.notes.length === 0) {
      return {
        text: "You haven't saved any private notes yet. Would you like to write a note?",
        state: 'no_result',
        suggestedAdd: {
          type: 'note',
          prompt: 'Write a note',
        },
      };
    }

    const specificNote = vault.notes.find(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );

    if (specificNote) {
      return {
        text: `Here is your note **"${specificNote.title}"**:\n\n${specificNote.content}`,
        state: 'found',
        linkedItem: {
          type: 'note',
          id: specificNote.id,
          title: specificNote.title,
        },
      };
    }

    const noteList = vault.notes.map((n) => `• **${n.title}**`).join('\n');
    return {
      text: `Here are your saved notes:\n\n${noteList}`,
      state: 'found',
    };
  }

  // 6. Query Profile & Emergency Contacts
  if (q.includes('emergency') || q.includes('profile') || q.includes('blood') || q.includes('address') || q.includes('phone') || q.includes('contact')) {
    const contacts = vault.profile.emergencyContacts || [];
    const contactText = contacts.length > 0
      ? contacts.map((c) => `• **${c.name}** (${c.relationship}): ${c.phone}`).join('\n')
      : 'No emergency contacts saved yet.';

    return {
      text: `Here is your personal profile info:\n\n• Name: ${vault.profile.fullName || 'Not set'}\n• Emergency Contacts:\n${contactText}`,
      state: 'found',
      linkedItem: {
        type: 'note',
        id: 'profile',
        title: 'Personal Profile',
      },
    };
  }

  // 7. General search across all items
  const foundDocs = vault.documents.filter((d) => d.title.toLowerCase().includes(q));
  const foundVehs = vault.vehicles.filter((v) => v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));
  const foundNotes = vault.notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));

  if (foundDocs.length > 0 || foundVehs.length > 0 || foundNotes.length > 0) {
    const matches: string[] = [];
    if (foundDocs.length > 0) matches.push(`📄 Documents: ${foundDocs.map((d) => d.title).join(', ')}`);
    if (foundVehs.length > 0) matches.push(`🚗 Vehicles: ${foundVehs.map((v) => `${v.make} ${v.model}`).join(', ')}`);
    if (foundNotes.length > 0) matches.push(`📝 Notes: ${foundNotes.map((n) => n.title).join(', ')}`);

    return {
      text: `I found these records for "${userQuery}":\n\n${matches.join('\n')}`,
      state: 'found',
    };
  }

  // Default Honest No-Result Response
  return {
    text: `I couldn't find anything matching "${userQuery}" in your saved records.\n\nYou can ask me about your documents, vehicles, saved passwords, or private notes. Everything stays 100% on this phone.`,
    state: 'no_result',
  };
}
