import { useColorScheme as useRNColorScheme } from 'react-native';

import { usePreferencesOptional } from '@/lib/preferences-context';
import type { AppThemeMode } from '@/lib/theme';

/**
 * Preferencja motywu z ustawień aplikacji; fallback na system.
 */
export function useColorScheme(): AppThemeMode {
  const prefs = usePreferencesOptional();
  const system = useRNColorScheme();
  if (prefs) return prefs.theme;
  return system === 'dark' ? 'dark' : 'light';
}
