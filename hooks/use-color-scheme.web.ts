import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { usePreferencesOptional } from '@/lib/preferences-context';
import type { AppThemeMode } from '@/lib/theme';

/**
 * Web: hydrate after mount; then prefer app settings theme.
 */
export function useColorScheme(): AppThemeMode {
  const [hasHydrated, setHasHydrated] = useState(false);
  const prefs = usePreferencesOptional();
  const system = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return 'light';
  if (prefs) return prefs.theme;
  return system === 'dark' ? 'dark' : 'light';
}
