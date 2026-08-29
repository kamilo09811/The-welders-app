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

const light: AppColors = {
  bg: '#F4F1EA',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1917',
  textMuted: '#57534E',
  textSoft: '#78716C',
  border: '#E7E5E4',
  borderStrong: '#D6D3D1',
  primary: '#C2410C',
  primaryMuted: '#FFF7ED',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  success: '#15803D',
  successSoft: '#ECFDF5',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  chip: '#F5F5F4',
  chipText: '#44403C',
  inputBg: '#FAFAF9',
  overlay: 'rgba(28,25,23,0.45)',
  tabInactive: '#78716C',
  heroOverlay: 'rgba(28,25,23,0.55)',
};

const dark: AppColors = {
  bg: '#0C0A09',
  bgElevated: '#1C1917',
  card: '#1C1917',
  text: '#FAFAF9',
  textMuted: '#A8A29E',
  textSoft: '#78716C',
  border: '#292524',
  borderStrong: '#44403C',
  primary: '#FB923C',
  primaryMuted: '#431407',
  danger: '#F87171',
  dangerSoft: '#450A0A',
  success: '#4ADE80',
  successSoft: '#052E16',
  warning: '#FBBF24',
  warningSoft: '#422006',
  chip: '#292524',
  chipText: '#E7E5E4',
  inputBg: '#292524',
  overlay: 'rgba(0,0,0,0.55)',
  tabInactive: '#A8A29E',
  heroOverlay: 'rgba(0,0,0,0.65)',
};

export function getAppColors(mode: AppThemeMode): AppColors {
  return mode === 'dark' ? dark : light;
}
