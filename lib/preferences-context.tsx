import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { isAppLocale, translate, type AppLocale, type TranslationKey } from '@/lib/i18n';
import { getAppColors, type AppColors, type AppThemeMode } from '@/lib/theme';
import {
  DEFAULT_SETTINGS,
  patchUserSettings,
  saveUserSettings,
  useUserSettings,
  type TabTipId,
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
  /** Zamknij tip zakładki — zapis per użytkownik (raz). */
  dismissTabTip: (tipId: TabTipId) => Promise<void>;
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
  const { uid, settings, loading, remoteMeta } = useUserSettings();
  const [localTheme, setLocalTheme] = useState<AppThemeMode>('light');
  const [localLocale, setLocalLocale] = useState<AppLocale>('pl');
  const [cacheReady, setCacheReady] = useState(false);
  const [localDismissedTips, setLocalDismissedTips] = useState<TabTipId[]>([]);
  const migratedRef = useRef<string | null>(null);
  const localThemeRef = useRef(localTheme);
  const localLocaleRef = useRef(localLocale);
  localThemeRef.current = localTheme;
  localLocaleRef.current = localLocale;

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
    if (uid) return;
    migratedRef.current = null;
    setLocalDismissedTips([]);
  }, [uid]);

  // Sync z konta tylko gdy Firestore ma jawnie zapisane pola (nie domyślne PL z braku pola).
  useEffect(() => {
    if (!cacheReady || loading) return;

    if (remoteMeta.hasTheme) {
      setLocalTheme(settings.theme);
    }
    if (remoteMeta.hasLocale) {
      setLocalLocale(settings.locale);
    }

    const nextTheme = remoteMeta.hasTheme ? settings.theme : localThemeRef.current;
    const nextLocale = remoteMeta.hasLocale ? settings.locale : localLocaleRef.current;
    void cachePrefs(nextTheme, nextLocale);
  }, [
    cacheReady,
    loading,
    remoteMeta.hasLocale,
    remoteMeta.hasTheme,
    settings.locale,
    settings.theme,
  ]);

  // Migracja: po logowaniu dopisz TYLKO brakujący motyw/język — nigdy nie nadpisuj
  // preferencji rynku (sort, intencja, tryby, hideOwn itd.) pełnym dumpem DEFAULT.
  useEffect(() => {
    if (!cacheReady || loading || !uid) return;
    if (remoteMeta.hasTheme && remoteMeta.hasLocale) return;
    if (migratedRef.current === uid) return;
    migratedRef.current = uid;
    const patch: Partial<UserSettings> = {};
    if (!remoteMeta.hasTheme) patch.theme = localThemeRef.current;
    if (!remoteMeta.hasLocale) patch.locale = localLocaleRef.current;
    if (Object.keys(patch).length === 0) return;
    void patchUserSettings(uid, patch);
  }, [
    cacheReady,
    loading,
    remoteMeta.hasLocale,
    remoteMeta.hasTheme,
    uid,
  ]);

  const theme = localTheme;
  const locale = localLocale;
  const colors = useMemo(() => getAppColors(theme), [theme]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const persistPatch = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next: UserSettings = { ...settings, theme, locale, ...patch };
      setLocalTheme(next.theme);
      setLocalLocale(next.locale);
      await cachePrefs(next.theme, next.locale);
      if (uid) {
        await saveUserSettings(uid, next);
      }
    },
    [locale, settings, theme, uid]
  );

  const setTheme = useCallback(
    async (nextTheme: AppThemeMode) => {
      await persistPatch({ theme: nextTheme });
    },
    [persistPatch]
  );

  const setLocale = useCallback(
    async (nextLocale: AppLocale) => {
      await persistPatch({ locale: nextLocale });
    },
    [persistPatch]
  );

  const saveSettings = useCallback(
    async (next: UserSettings) => {
      setLocalTheme(next.theme);
      setLocalLocale(next.locale);
      await cachePrefs(next.theme, next.locale);
      if (uid) {
        await saveUserSettings(uid, next);
      }
    },
    [uid]
  );

  const dismissTabTip = useCallback(
    async (tipId: TabTipId) => {
      setLocalDismissedTips((prev) => (prev.includes(tipId) ? prev : [...prev, tipId]));
      if (!uid) return;
      const merged = Array.from(new Set([...(settings.dismissedTabTips || []), tipId]));
      await patchUserSettings(uid, { dismissedTabTips: merged });
    },
    [settings.dismissedTabTips, uid]
  );

  const mergedDismissed = useMemo(
    () => Array.from(new Set([...(settings.dismissedTabTips || []), ...localDismissedTips])),
    [localDismissedTips, settings.dismissedTabTips]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings,
        theme,
        locale,
        dismissedTabTips: mergedDismissed,
      },
      loading: loading || !cacheReady,
      theme,
      locale,
      colors,
      t,
      setTheme,
      setLocale,
      saveSettings,
      dismissTabTip,
    }),
    [
      cacheReady,
      colors,
      dismissTabTip,
      loading,
      locale,
      mergedDismissed,
      saveSettings,
      setLocale,
      setTheme,
      settings,
      t,
      theme,
    ]
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
