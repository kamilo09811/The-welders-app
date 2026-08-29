import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isAppLocale, translate, type AppLocale, type TranslationKey } from '@/lib/i18n';
import { getAppColors, type AppColors, type AppThemeMode } from '@/lib/theme';
import {
  DEFAULT_SETTINGS,
  saveUserSettings,
  useUserSettings,
  type UserSettings,
} from '@/lib/user-settings';

const THEME_KEY = 'tww.theme';
const LOCALE_KEY = 'tww.locale';

type PreferencesContextValue = {
  settings: UserSettings;
  loading: boolean;
  theme: AppThemeMode;
  locale: AppLocale;
  colors: AppColors;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  setTheme: (theme: AppThemeMode) => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
  saveSettings: (next: UserSettings) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

async function readCachedPrefs(): Promise<{ theme: AppThemeMode; locale: AppLocale }> {
  try {
    const [themeRaw, localeRaw] = await Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(LOCALE_KEY),
    ]);
    const theme: AppThemeMode = themeRaw === 'dark' ? 'dark' : 'light';
    const locale: AppLocale = isAppLocale(localeRaw) ? localeRaw : 'pl';
    return { theme, locale };
  } catch {
    return { theme: 'light', locale: 'pl' };
  }
}

async function cachePrefs(theme: AppThemeMode, locale: AppLocale) {
  try {
    await Promise.all([AsyncStorage.setItem(THEME_KEY, theme), AsyncStorage.setItem(LOCALE_KEY, locale)]);
  } catch {
    // ignore cache failures
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { uid, settings, loading } = useUserSettings();
  const [localTheme, setLocalTheme] = useState<AppThemeMode>('light');
  const [localLocale, setLocalLocale] = useState<AppLocale>('pl');
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readCachedPrefs().then((cached) => {
      if (cancelled) return;
      setLocalTheme(cached.theme);
      setLocalLocale(cached.locale);
      setCacheReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cacheReady || loading) return;
    setLocalTheme(settings.theme);
    setLocalLocale(settings.locale);
    void cachePrefs(settings.theme, settings.locale);
  }, [cacheReady, loading, settings.locale, settings.theme]);

  const theme = localTheme;
  const locale = localLocale;
  const colors = useMemo(() => getAppColors(theme), [theme]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const persistPatch = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next: UserSettings = { ...settings, ...patch };
      if (uid) {
        await saveUserSettings(uid, next);
      }
      await cachePrefs(next.theme, next.locale);
    },
    [settings, uid]
  );

  const setTheme = useCallback(
    async (nextTheme: AppThemeMode) => {
      setLocalTheme(nextTheme);
      await persistPatch({ theme: nextTheme });
    },
    [persistPatch]
  );

  const setLocale = useCallback(
    async (nextLocale: AppLocale) => {
      setLocalLocale(nextLocale);
      await persistPatch({ locale: nextLocale });
    },
    [persistPatch]
  );

  const saveSettings = useCallback(
    async (next: UserSettings) => {
      setLocalTheme(next.theme);
      setLocalLocale(next.locale);
      if (uid) {
        await saveUserSettings(uid, next);
      }
      await cachePrefs(next.theme, next.locale);
    },
    [uid]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings,
        theme,
        locale,
      },
      loading: loading || !cacheReady,
      theme,
      locale,
      colors,
      t,
      setTheme,
      setLocale,
      saveSettings,
    }),
    [cacheReady, colors, loading, locale, saveSettings, setLocale, setTheme, settings, t, theme]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

/** Safe hook for screens that may render before provider (should not happen after root wrap). */
export function usePreferencesOptional(): PreferencesContextValue | null {
  return useContext(PreferencesContext);
}
