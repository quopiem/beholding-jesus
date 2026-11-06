import { KeyNotationInfo, MusicalKey } from '../types';

export const CHROMATIC_SCALE: KeyNotationInfo[] = [
  { key: 'C',  name: 'C Major',   alt: 'C Major',               semitone: 0 },
  { key: 'Db', name: 'Db Major',  alt: 'C# Major / Db Major',   semitone: 1 },
  { key: 'D',  name: 'D Major',   alt: 'D Major',               semitone: 2 },
  { key: 'Eb', name: 'Eb Major',  alt: 'D# Major / Eb Major',   semitone: 3 },
  { key: 'E',  name: 'E Major',   alt: 'E Major',               semitone: 4 },
  { key: 'F',  name: 'F Major',   alt: 'F Major',               semitone: 5 },
  { key: 'F#', name: 'F# Major',  alt: 'F# Major / Gb Major',   semitone: 6 },
  { key: 'G',  name: 'G Major',   alt: 'G Major',               semitone: 7 },
  { key: 'Ab', name: 'Ab Major',  alt: 'G# Major / Ab Major',   semitone: 8 },
  { key: 'A',  name: 'A Major',   alt: 'A Major',               semitone: 9 },
  { key: 'Bb', name: 'Bb Major',  alt: 'A# Major / Bb Major',   semitone: 10 },
  { key: 'B',  name: 'B Major',   alt: 'B Major',               semitone: 11 },
];

export const STANDARD_KEYS: MusicalKey[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const COMMON_VOCAL_RANGES = [
  'C3 – C5 (Baritone / Tenor standard)',
  'D3 – D5 (Tenor / Alto standard)',
  'D3 – F#4 (Male Lead comfortable)',
  'E3 – G#4 (Male Lead high energy)',
  'F3 – F5 (Soprano / Female Lead)',
  'G3 – B4 (Alto / Mezzo-Soprano)',
  'A3 – C5 (Female Lead comfortable)',
  'Bb3 – D5 (Female Lead high belt)',
  'C4 – C5 (Acoustic / Warm vocal)',
  'D4 – D5 (Female Lead soprano range)'
];

export const COMMON_GENRES = [
  'Worship / Contemporary',
  'Praise / High Energy',
  'Hymn / Traditional',
  'Gospel / Soul',
  'Acoustic / Intimate',
  'Ballad / Reflective',
  'Youth Praise'
];

export const SINGER_ROLES = [
  'Lead',
  'Backup',
  'Duet',
  'Acoustic Lead',
  'Choir / Ensemble'
];

// Frequencies for Web Audio pitch tone generator (A4 = 440Hz standard)
const NOTE_BASE_FREQS: Record<MusicalKey, number> = {
  'C': 261.63,  // C4
  'Db': 277.18, // Db4
  'D': 293.66,  // D4
  'Eb': 311.13, // Eb4
  'E': 329.63,  // E4
  'F': 349.23,  // F4
  'F#': 369.99, // F#4
  'G': 392.00,  // G4
  'Ab': 415.30, // Ab4
  'A': 440.00,  // A4
  'Bb': 466.16, // Bb4
  'B': 493.88   // B4
};

let audioCtx: AudioContext | null = null;

export function playKeyTone(key: MusicalKey | string, playChord: boolean = false) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const cleanKey = key.replace(/ Major| Minor|m/g, '') as MusicalKey;
    const baseFreq = NOTE_BASE_FREQS[cleanKey] || 440;

    const notesToPlay = playChord
      ? [baseFreq, baseFreq * 1.25, baseFreq * 1.5] // Major triad: Root, Major 3rd, Perfect 5th
      : [baseFreq];

    notesToPlay.forEach((freq) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    });
  } catch (err) {
    console.warn('Web Audio playback not available:', err);
  }
}

export function getKeyNotation(key: MusicalKey | string): string {
  const found = CHROMATIC_SCALE.find(k => k.key === key);
  return found ? found.alt : `${key} Major`;
}

export function calculateKeyDifference(originalKey: MusicalKey | string, singerKey: MusicalKey | string): {
  semitones: number;
  direction: 'up' | 'down' | 'same';
  description: string;
} {
  const origIdx = CHROMATIC_SCALE.findIndex(k => k.key === originalKey);
  const singIdx = CHROMATIC_SCALE.findIndex(k => k.key === singerKey);
  
  if (origIdx === -1 || singIdx === -1) {
    return { semitones: 0, direction: 'same', description: 'Original Key' };
  }

  const diff = singIdx - origIdx;
  if (diff === 0) {
    return { semitones: 0, direction: 'same', description: 'Original Key' };
  } else if (diff > 0) {
    return { semitones: diff, direction: 'up', description: `+${diff} semitones higher` };
  } else {
    return { semitones: Math.abs(diff), direction: 'down', description: `${Math.abs(diff)} semitones lower` };
  }
}
