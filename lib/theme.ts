export type AppThemeMode = 'light' | 'dark';

export type AppColors = {
  bg: string;
  bgElevated: string;
  card: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryMuted: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  chip: string;
  chipText: string;
  inputBg: string;
  overlay: string;
  tabInactive: string;
  heroOverlay: string;
};

/** Jasny motyw — chłodny stalowo-niebieski, bez „papierowej” bieli na tle. */
const light: AppColors = {
  bg: '#E6EDF6',
  bgElevated: '#F4F7FC',
  card: '#FBFCFE',
  text: '#0F172A',
  textMuted: '#475569',
  textSoft: '#64748B',
  border: '#CDD8E8',
  borderStrong: '#B8C6D9',
  primary: '#0E4AA4',
  primaryMuted: '#E8F1FC',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  success: '#15803D',
  successSoft: '#ECFDF5',
  warning: '#C2410C',
  warningSoft: '#FFF7ED',
  chip: '#E8EEF6',
  chipText: '#334155',
  inputBg: '#F0F4FA',
  overlay: 'rgba(15,23,42,0.45)',
  tabInactive: '#64748B',
  heroOverlay: 'rgba(10,47,107,0.55)',
};

/** Ciemny motyw — karty i pola wyraźnie uniesione nad tłem, bez białych powierzchni. */
const dark: AppColors = {
  bg: '#070D18',
  bgElevated: '#0F172A',
  card: '#121C2E',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textSoft: '#7B8BA3',
  border: '#243247',
  borderStrong: '#334155',
  primary: '#60A5FA',
  primaryMuted: '#102A45',
  danger: '#F87171',
  dangerSoft: '#3F1212',
  success: '#4ADE80',
  successSoft: '#052E16',
  warning: '#FB923C',
  warningSoft: '#3A1A08',
  chip: '#1A2740',
  chipText: '#E2E8F0',
  inputBg: '#182338',
  overlay: 'rgba(0,0,0,0.6)',
  tabInactive: '#94A3B8',
  heroOverlay: 'rgba(0,0,0,0.65)',
};

export function getAppColors(mode: AppThemeMode): AppColors {
  return mode === 'dark' ? dark : light;
}

/** Gradient hero na głównych ekranach (nie welcome). */
export function getHeroGradient(mode: AppThemeMode): readonly [string, string, string] {
  return mode === 'dark'
    ? (['#0A1628', '#123A66', '#070D18'] as const)
    : (['#0A2F6B', '#1A5BB8', '#E6EDF6'] as const);
}

export function getHeaderGradient(mode: AppThemeMode): readonly [string, string] {
  return mode === 'dark' ? (['#0A1628', '#070D18'] as const) : (['#0A2F6B', '#E6EDF6'] as const);
}

export function getChatsGradient(mode: AppThemeMode): readonly [string, string, string] {
  return mode === 'dark'
    ? (['#0A1628', '#123A66', '#121C2E'] as const)
    : (['#0B3A82', '#0E4AA4', '#1A6AD4'] as const);
}

/** Delikatna poświata zamiast dekoracyjnych kółek — start/end pod LinearGradient. */
export function getHeroSheen(mode: AppThemeMode): {
  colors: readonly [string, string, string];
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  if (mode === 'dark') {
    return {
      colors: ['rgba(96,165,250,0.16)', 'rgba(96,165,250,0.04)', 'transparent'] as const,
      start: { x: 0.85, y: 0 },
      end: { x: 0.15, y: 0.7 },
    };
  }
  return {
    colors: ['rgba(255,255,255,0.22)', 'rgba(191,219,254,0.12)', 'transparent'] as const,
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0.85 },
  };
}
