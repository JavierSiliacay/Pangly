// src/engine/smartContextBuilder.ts
// Builds the vault context string injected into Pangly's AI brain.
//
// KEY RULES:
// 1. Passwords NEVER appear in context — ever.
// 2. Respects the user's aiPermissions toggles.
// 3. Stays within the token budget to prevent context overflow.
// 4. Truncates older/longer content first (notes, then reminders).

import {
  DocumentItem,
  CredentialItem,
  PersonalProfile,
  VehicleItem,
  MaintenanceItem,
  NoteItem,
  ReminderItem,
  VaultSettings,
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

// Rough token estimate: 4 characters ≈ 1 token (conservative)
const CHARS_PER_TOKEN = 4;
const TOKEN_BUDGET = 6000;
const CHAR_BUDGET = TOKEN_BUDGET * CHARS_PER_TOKEN;

// Max chars per field before truncating
const MAX_NOTE_CONTENT = 300;
const MAX_OCR_TEXT = 400;

function estimateChars(text: string): number {
  return text.length;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '…';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return dateStr;
}

// ─── Section builders ────────────────────────────────────────────────────────

function buildProfileSection(profile: PersonalProfile): string {
  const contacts = (profile.emergencyContacts || [])
    .map((c) => `  · ${c.name} (${c.relationship}): ${c.phone}`)
    .join('\n');

  return [
    'PERSONAL PROFILE:',
    `  Name: ${profile.fullName || 'Not set'}`,
    profile.phone ? `  Phone: ${profile.phone}` : null,
    profile.email ? `  Email: ${profile.email}` : null,
    profile.bloodType ? `  Blood Type: ${profile.bloodType}` : null,
    profile.birthday ? `  Birthday: ${profile.birthday}` : null,
    contacts ? `  Emergency Contacts:\n${contacts}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildDocumentsSection(docs: DocumentItem[]): string {
  if (docs.length === 0) return 'DOCUMENTS: None saved.';

  const lines = docs.map((d) => {
    const parts = [`  [${d.category}] ${d.title}`];
    if (d.provider) parts.push(`Provider: ${d.provider}`);
    if (d.documentNumber) parts.push(`Number: ${d.documentNumber}`);
    if (d.fullName) parts.push(`Name: ${d.fullName}`);
    if (d.issueDate) parts.push(`Issued: ${formatDate(d.issueDate)}`);
    if (d.expiryDate) parts.push(`Expires: ${formatDate(d.expiryDate)}`);
    if (d.ocrText) parts.push(`Scanned text: ${truncate(d.ocrText, MAX_OCR_TEXT)}`);
    if (d.imageUri) parts.push(`Photo: available`);
    parts.push(`Saved: ${formatDate(d.createdAt?.split('T')[0])}`);
    return parts.join(' | ');
  });

  return `DOCUMENTS (${docs.length}):\n${lines.join('\n')}`;
}

function buildCredentialsSection(creds: CredentialItem[]): string {
  if (creds.length === 0) return 'SAVED LOGINS: None saved.';

  // CRITICAL: passwords are NEVER included in context
  const lines = creds.map((c) => {
    const parts = [`  [${c.category}] ${c.service}`];
    if (c.username) parts.push(`Username: ${c.username}`);
    if (c.website) parts.push(`Website: ${c.website}`);
    parts.push('[password hidden for security]');
    return parts.join(' | ');
  });

  return `SAVED LOGINS (${creds.length}):\n${lines.join('\n')}`;
}

function buildVehiclesSection(
  vehicles: VehicleItem[],
  maintenance: MaintenanceItem[]
): string {
  if (vehicles.length === 0) return 'VEHICLES: None saved.';

  const lines = vehicles.map((v) => {
    const kmLeft = Math.max(0, (v.nextMaintenanceKm || 0) - (v.mileage || 0));
    const lastMaint = maintenance
      .filter((m) => m.vehicleId === v.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const parts = [
      `  ${v.year} ${v.make} ${v.model}${v.nickname ? ` (${v.nickname})` : ''}`,
      `Plate: ${v.plateNumber || 'N/A'}`,
      `Odometer: ${v.mileage?.toLocaleString() || '0'} km`,
      v.nextMaintenanceKm
        ? `Next service: ${v.nextMaintenanceKm.toLocaleString()} km (in ${kmLeft.toLocaleString()} km)`
        : 'Next service: not scheduled',
    ];
    if (lastMaint) {
      parts.push(`Last service: ${lastMaint.type} on ${lastMaint.date}`);
    }
    return parts.join(' | ');
  });

  return `VEHICLES (${vehicles.length}):\n${lines.join('\n')}`;
}

function buildNotesSection(notes: NoteItem[], charBudget: number): string {
  if (notes.length === 0) return 'NOTES: None saved.';

  // Sort by most recently updated first
  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const lines: string[] = [];
  let used = 0;

  for (const note of sorted) {
    const content = truncate(note.content, MAX_NOTE_CONTENT);
    const line = `  [${note.category || 'General'}] ${note.title}: ${content}`;
    if (used + line.length > charBudget) break; // Budget exhausted
    lines.push(line);
    used += line.length;
  }

  const truncated = sorted.length - lines.length;
  const footer = truncated > 0 ? `\n  (${truncated} older notes not shown)` : '';
  return `NOTES (${notes.length} total, showing ${lines.length}):\n${lines.join('\n')}${footer}`;
}

function buildRemindersSection(reminders: ReminderItem[]): string {
  const upcoming = reminders
    .filter((r) => !r.isCompleted)
    .filter((r) => {
      const dueDate = new Date(r.dueDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return dueDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (upcoming.length === 0) return 'REMINDERS: None due in the next 30 days.';

  const lines = upcoming.map(
    (r) => `  [${r.priority.toUpperCase()}] ${r.title} — Due: ${r.dueDate}`
  );

  return `UPCOMING REMINDERS (${upcoming.length}):\n${lines.join('\n')}`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Build the complete vault context string for injection into the AI system prompt.
 *
 * Respects aiPermissions and stays within the token budget.
 * Passwords are NEVER included regardless of any setting.
 */
export function buildVaultContext(vault: VaultStateSnapshot): string {
  const perms = vault.settings.aiPermissions;
  const sections: string[] = [];

  // Profile (always small — always include)
  if (perms.personalInfo) {
    sections.push(buildProfileSection(vault.profile));
  }

  // Documents
  if (perms.documents) {
    sections.push(buildDocumentsSection(vault.documents));
  }

  // Vehicles + Maintenance
  if (perms.vehicles) {
    sections.push(buildVehiclesSection(vault.vehicles, vault.maintenance));
  }

  // Credentials — username only, NEVER password
  if (perms.credentials) {
    sections.push(buildCredentialsSection(vault.credentials));
  }

  // Reminders (upcoming only)
  if (perms.reminders) {
    sections.push(buildRemindersSection(vault.reminders));
  }

  // Notes — with remaining budget after other sections
  if (perms.notes) {
    const usedSoFar = sections.join('\n').length;
    const remainingBudget = CHAR_BUDGET - usedSoFar - 200; // 200 char safety margin
    if (remainingBudget > 0) {
      sections.push(buildNotesSection(vault.notes, remainingBudget));
    }
  }

  return sections.join('\n\n');
}

import { AGENT_TOOLS } from './agentTools';

/**
 * Build the complete system prompt for Pangly's AI brain (Salesforce xLAM-2).
 * Injects vault context, agent tool capabilities, and personality instructions.
 */
export function buildSystemPrompt(vault: VaultStateSnapshot): string {
  const prefs = vault.settings.aiPreferences;
  const vaultContext = buildVaultContext(vault);

  // Personality tone instruction
  const toneMap = {
    friendly: 'Be warm, conversational, and encouraging. Use natural, human language.',
    professional: 'Be concise, factual, and professional. No filler words.',
    minimal: 'Be extremely brief. Give only the essential facts with no extra text.',
  };
  const tone = toneMap[prefs.personality] ?? toneMap.friendly;

  // Language instruction
  const langMap = {
    auto: 'Always respond in the same language the user writes in.',
    english: 'Always respond in English, regardless of the input language.',
    filipino: 'Always respond in Filipino (Tagalog), regardless of the input language.',
  };
  const lang = langMap[prefs.responseLanguage] ?? langMap.auto;

  const toolsJson = JSON.stringify(AGENT_TOOLS, null, 2);

  return `You are Pangly, a private on-device autonomous personal life assistant. You have full access to the user's private vault data and tools below to take actions on behalf of the user.

BEHAVIOR RULES:
- ${tone}
- ${lang}
- NEVER reveal, mention, or hint at passwords, PINs, or any credential values — they are always hidden for security.
- When the user asks you to take an action (e.g. save a document, set a reminder, record an expense or maintenance, write a note, update contact info), output the corresponding tool call in JSON format:
  [{"name": "tool_name", "arguments": {"param1": "value"}}]
- You may also provide a brief, friendly confirmation in your response.
- When you answer questions, cite facts directly from the vault data.
- If something is not in the vault, state so clearly and offer to help save it.
- Everything runs 100% on this device. Never mention cloud or external servers.

=== AVAILABLE TOOLS ===
${toolsJson}

=== VAULT DATA ===
${vaultContext}
=================`;
}
