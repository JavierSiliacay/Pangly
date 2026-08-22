// src/engine/lipSyncEngine.ts

export type VisemeType = 'REST' | 'AA_AH' | 'EE_EH' | 'OH_OO' | 'SMILE' | 'SURPRISED';

export interface VisemeFrame {
  viseme: VisemeType;
  durationMs: number;
}

/**
 * Phonetic letter-to-viseme mapper for English dialogue.
 * Converts characters/words into timed viseme frames for smooth 60fps mouth animation.
 */
export function parseTextToVisemes(text: string, letterDelayMs: number = 32): VisemeFrame[] {
  const frames: VisemeFrame[] = [];
  const clean = text.trim();

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i].toLowerCase();
    const nextChar = (clean[i + 1] || '').toLowerCase();

    // Punctuation & Pauses
    if (['.', ',', ';', ':', '-', '—'].includes(char)) {
      frames.push({ viseme: 'REST', durationMs: letterDelayMs * 3 });
      continue;
    }

    if (char === '!' || (char === '?' && nextChar === '!')) {
      frames.push({ viseme: 'SMILE', durationMs: letterDelayMs * 4 });
      continue;
    }

    if (char === '?') {
      frames.push({ viseme: 'SURPRISED', durationMs: letterDelayMs * 4 });
      continue;
    }

    if (char === ' ') {
      frames.push({ viseme: 'REST', durationMs: letterDelayMs * 1.5 });
      continue;
    }

    // Vowels & Diphthongs
    if (char === 'o' || (char === 'u' && nextChar !== 'n') || char === 'w') {
      frames.push({ viseme: 'OH_OO', durationMs: letterDelayMs });
    } else if (char === 'a' || char === 'i') {
      frames.push({ viseme: 'AA_AH', durationMs: letterDelayMs });
    } else if (char === 'e' || char === 'y' || char === 's' || char === 'c' || char === 'r') {
      frames.push({ viseme: 'EE_EH', durationMs: letterDelayMs });
    } else if (char === 'm' || char === 'p' || char === 'b') {
      frames.push({ viseme: 'REST', durationMs: letterDelayMs });
    } else {
      // Default subtle mouth opening for other consonants
      frames.push({ viseme: (i % 2 === 0 ? 'EE_EH' : 'AA_AH'), durationMs: letterDelayMs });
    }
  }

  // End in smile / rest
  frames.push({ viseme: 'SMILE', durationMs: 400 });
  return frames;
}
