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

/** Niebiesko-biały jasny motyw (oryginalny look aplikacji). */
const light: AppColors = {
  bg: '#E8EEF7',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#475569',
  textSoft: '#64748B',
  border: '#D5DEEA',
  borderStrong: '#CBD5E1',
  primary: '#0E4AA4',
  primaryMuted: '#EFF6FF',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  success: '#15803D',
  successSoft: '#ECFDF5',
  warning: '#C2410C',
  warningSoft: '#FFF7ED',
  chip: '#F1F5F9',
  chipText: '#334155',
  inputBg: '#F8FAFC',
  overlay: 'rgba(15,23,42,0.45)',
  tabInactive: '#64748B',
  heroOverlay: 'rgba(10,47,107,0.55)',
};

const dark: AppColors = {
  bg: '#0B1220',
  bgElevated: '#111827',
  card: '#111827',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSoft: '#64748B',
  border: '#1E293B',
  borderStrong: '#334155',
  primary: '#60A5FA',
  primaryMuted: '#0F2744',
  danger: '#F87171',
  dangerSoft: '#450A0A',
  success: '#4ADE80',
  successSoft: '#052E16',
  warning: '#FB923C',
  warningSoft: '#431407',
  chip: '#1E293B',
  chipText: '#E2E8F0',
  inputBg: '#1E293B',
  overlay: 'rgba(0,0,0,0.55)',
  tabInactive: '#94A3B8',
  heroOverlay: 'rgba(0,0,0,0.65)',
};

export function getAppColors(mode: AppThemeMode): AppColors {
  return mode === 'dark' ? dark : light;
}

/** Gradient hero na głównych ekranach (nie welcome). */
export function getHeroGradient(mode: AppThemeMode): readonly [string, string, string] {
  return mode === 'dark'
    ? (['#0B1A33', '#0E3A6B', '#0B1220'] as const)
    : (['#0A2F6B', '#0E4AA4', '#E8EEF7'] as const);
}

export function getHeaderGradient(mode: AppThemeMode): readonly [string, string] {
  return mode === 'dark' ? (['#0B1A33', '#0B1220'] as const) : (['#0A2F6B', '#E8EEF7'] as const);
}

export function getChatsGradient(mode: AppThemeMode): readonly [string, string, string] {
  return mode === 'dark'
    ? (['#0B1A33', '#0E3A6B', '#111827'] as const)
    : (['#0B3A82', '#0E4AA4', '#1A6AD4'] as const);
}
