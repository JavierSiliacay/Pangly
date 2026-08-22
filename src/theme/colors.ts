// src/theme/colors.ts

export interface ColorScheme {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accents (Derived from Pangly Brand)
  primary: string;         // Sage Forest Green
  primaryGlow: string;     // Soft Sage Tint
  primaryDark: string;     // Deep Pine
  accentCyan: string;      // Soft Teal
  accentTeal: string;      // Mint Sage
  accentIndigo: string;    // Warm Slate Indigo
  accentAmber: string;     // Pangolin Warm Bronze / Chestnut
  accentRose: string;      // Terracotta Coral
  accentPurple: string;    // Warm Plum

  // Statuses
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Mask & Privacy
  maskBackground: string;
  privacyBadgeBg: string;
  privacyBadgeText: string;
}

// 🪵 OPTION 2: WARM EARTH & SAGE (Easy on the eyes, warm paper/linen, soft sage & caramel chestnut)
export const lightTheme: ColorScheme = {
  background: '#F5F1EB',         // Warm oat/parchment canvas — eliminates harsh blue glare
  surface: '#FFFFFF',            // Warm-tinted white card surface
  surfaceElevated: '#EDE7DE',    // Soft warm stone for inputs & elevated containers
  surfaceSubtle: '#E4DDD2',      // Warm sand pill/divider
  border: '#DDD5C7',             // Soft warm border
  borderSubtle: '#EAE4D9',       // Hairline inner border
  textPrimary: '#292524',        // Warm espresso stone — easy on the eyes, never harsh
  textSecondary: '#57534E',      // Warm taupe for descriptions & dates
  textMuted: '#8C857B',          // Soft warm stone placeholder

  primary: '#2D6A4F',            // Soothing forest sage green (Pangolin orb)
  primaryGlow: 'rgba(45, 106, 79, 0.12)', // Gentle sage aura
  primaryDark: '#1B4332',        // Deep pine green
  accentCyan: '#0E7490',         // Soft cyan-teal
  accentTeal: '#115E59',         // Deep sage teal
  accentIndigo: '#4338CA',       // Muted royal indigo
  accentAmber: '#B45309',        // Pangolin chestnut armor bronze
  accentRose: '#BE123C',         // Terracotta rose
  accentPurple: '#6B21A8',       // Warm royal plum

  success: '#2D6A4F',
  warning: '#B45309',
  danger: '#BE123C',
  info: '#1D4ED8',

  maskBackground: '#EDE7DE',
  privacyBadgeBg: 'rgba(45, 106, 79, 0.12)',
  privacyBadgeText: '#2D6A4F',
};

export const darkTheme: ColorScheme = {
  background: '#070C12',         // Deep obsidian slate
  surface: '#0E1722',            // Dark container
  surfaceElevated: '#152232',    // Elevated card
  surfaceSubtle: '#1C2D42',      // Subtle highlight
  border: '#1E2D3D',
  borderSubtle: '#14202C',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  primary: '#10B981',            // Emerald
  primaryGlow: 'rgba(16, 185, 129, 0.15)',
  primaryDark: '#059669',
  accentCyan: '#06B6D4',
  accentTeal: '#14B8A6',
  accentIndigo: '#6366F1',
  accentAmber: '#F59E0B',        // Pangolin scale amber
  accentRose: '#F43F5E',
  accentPurple: '#A855F7',

  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  maskBackground: '#16222F',
  privacyBadgeBg: 'rgba(16, 185, 129, 0.12)',
  privacyBadgeText: '#34D399',
};

export const slateTheme: ColorScheme = {
  background: '#0B131E',
  surface: '#121F2F',
  surfaceElevated: '#1B2C42',
  surfaceSubtle: '#243B55',
  border: '#273C54',
  borderSubtle: '#182737',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0B2C6',
  textMuted: '#6E859E',

  primary: '#00D09C',
  primaryGlow: 'rgba(0, 208, 156, 0.18)',
  primaryDark: '#00A37A',
  accentCyan: '#22D3EE',
  accentTeal: '#2DD4BF',
  accentIndigo: '#818CF8',
  accentAmber: '#FBBF24',
  accentRose: '#FB7185',
  accentPurple: '#C084FC',

  success: '#00D09C',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#60A5FA',

  maskBackground: '#1C2C3E',
  privacyBadgeBg: 'rgba(0, 208, 156, 0.14)',
  privacyBadgeText: '#2DD4BF',
};
