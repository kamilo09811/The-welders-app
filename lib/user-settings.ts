import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import { isAppLocale, translate, type AppLocale } from '@/lib/i18n';
import type { ListingIntent, WorkMode } from '@/lib/market-listings';
import type { AppThemeMode } from '@/lib/theme';
import { useCurrentUserProfile } from '@/lib/user-profile';

export type SettingsRadius = '25 km' | '50 km' | '100 km' | 'Cała Polska';
export type SettingsSort = 'rateDesc' | 'rateAsc' | 'newest';
export type SettingsIntentPref = 'all' | ListingIntent;
export type TabTipId = 'market' | 'chats' | 'account' | 'settings';

export const TAB_TIP_IDS: TabTipId[] = ['market', 'chats', 'account', 'settings'];

/**
 * Podbij przy nowej rundzie tipów — użytkownicy zobaczą wskazówki ponownie
 * (stare dismissedTabTips obowiązują tylko przy tej samej generacji).
 */
export const TAB_TIPS_GENERATION = 1;

export type UserSettings = {
  /** Preferowane miasto bazowe do filtrów rynku. */
  baseCity: string;
  /** Ostatnio wybrana lokalizacja przy dodawaniu ogłoszenia. */
  lastListingLocation: string;
  radius: SettingsRadius;
  notifNewJobs: boolean;
  notifMessages: boolean;
  /** Nowe zgłoszenia (autor) i zmiany statusu (kandydat). */
  notifApplications: boolean;
  onlyVerified: boolean;
  showGrossRate: boolean;
  /** Domyślne sortowanie rynku po wejściu. */
  defaultSort: SettingsSort;
  /** Domyślny filtr intencji na rynku. */
  preferredIntent: SettingsIntentPref;
  /** Minimalna stawka max (PLN/h); 0 = bez limitu. */
  minRate: number;
  /** Preferowane tryby pracy; pusta lista = wszystkie. */
  preferredModes: WorkMode[];
  /** Ukryj własne ogłoszenia w domyślnym widoku rynku. */
  hideOwnInFeed: boolean;
  /** Motyw aplikacji (jasny / ciemny). */
  theme: AppThemeMode;
  /** Język UI: pl / en / de / da. */
  locale: AppLocale;
  /** Jednorazowe tipy zakładek już zamknięte przez użytkownika. */
  dismissedTabTips: TabTipId[];
  /** Generacja tipów, przy której użytkownik zamykał wskazówki. */
  tabTipsGeneration: number;
};

export const DEFAULT_SETTINGS: UserSettings = {
  baseCity: '',
  lastListingLocation: '',
  radius: '50 km',
  notifNewJobs: true,
  notifMessages: true,
  notifApplications: true,
  onlyVerified: false,
  showGrossRate: true,
  defaultSort: 'newest',
  preferredIntent: 'all',
  minRate: 0,
  preferredModes: [],
  hideOwnInFeed: false,
  theme: 'light',
  locale: 'pl',
  dismissedTabTips: [],
  tabTipsGeneration: 0,
};

const WORK_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];

function settingsDoc(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'meta', 'settings');
}

function normalizeModes(raw: unknown): WorkMode[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is WorkMode => WORK_MODES.includes(v as WorkMode));
}

export function normalizeUserSettings(data: Record<string, unknown>): UserSettings {
  const sort =
    data.defaultSort === 'rateAsc' || data.defaultSort === 'rateDesc' || data.defaultSort === 'newest'
      ? data.defaultSort
      : DEFAULT_SETTINGS.defaultSort;
  const preferredIntent =
    data.preferredIntent === 'offer' || data.preferredIntent === 'seek' || data.preferredIntent === 'all'
      ? data.preferredIntent
      : 'all';
  const minRate = typeof data.minRate === 'number' && Number.isFinite(data.minRate) ? Math.max(0, data.minRate) : 0;

  const theme: AppThemeMode = data.theme === 'dark' ? 'dark' : 'light';
  const locale: AppLocale = isAppLocale(data.locale) ? data.locale : DEFAULT_SETTINGS.locale;
  const dismissedTabTips = Array.isArray(data.dismissedTabTips)
    ? data.dismissedTabTips.filter((v): v is TabTipId =>
        typeof v === 'string' && TAB_TIP_IDS.includes(v as TabTipId)
      )
    : [];
  const tabTipsGeneration =
    typeof data.tabTipsGeneration === 'number' && Number.isFinite(data.tabTipsGeneration)
      ? Math.max(0, Math.floor(data.tabTipsGeneration))
      : 0;

  return {
    baseCity: typeof data.baseCity === 'string' ? data.baseCity : '',
    lastListingLocation:
      typeof data.lastListingLocation === 'string' ? data.lastListingLocation.trim() : '',
    radius:
      data.radius === '25 km' ||
      data.radius === '50 km' ||
      data.radius === '100 km' ||
      data.radius === 'Cała Polska'
        ? data.radius
        : '50 km',
    notifNewJobs: data.notifNewJobs !== false,
    notifMessages: data.notifMessages !== false,
    notifApplications: data.notifApplications !== false,
    onlyVerified: data.onlyVerified === true,
    showGrossRate: data.showGrossRate !== false,
    defaultSort: sort,
    preferredIntent,
    minRate,
    preferredModes: normalizeModes(data.preferredModes),
    hideOwnInFeed: data.hideOwnInFeed === true,
    theme,
    locale,
    dismissedTabTips,
    tabTipsGeneration,
  };
}

export async function saveUserSettings(uid: string, settings: UserSettings) {
  await setDoc(
    settingsDoc(uid),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Dopisz wybrane pola bez nadpisywania reszty dokumentu domyślnymi wartościami. */
export async function patchUserSettings(uid: string, patch: Partial<UserSettings>) {
  await setDoc(
    settingsDoc(uid),
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserSettings(uid: string): Promise<UserSettings> {
  const snap = await getDoc(settingsDoc(uid));
  if (!snap.exists()) return { ...DEFAULT_SETTINGS };
  return normalizeUserSettings(snap.data() as Record<string, unknown>);
}

/** Czy użytkownik chce push / in-app danego rodzaju. */
export function wantsNotification(
  settings: UserSettings,
  kind: 'listing_new' | 'application_new' | 'application_status' | 'chat_message'
): boolean {
  if (kind === 'listing_new') return settings.notifNewJobs;
  if (kind === 'chat_message') return settings.notifMessages;
  return settings.notifApplications;
}

export function wantsAnyPush(settings: UserSettings): boolean {
  return settings.notifNewJobs || settings.notifMessages || settings.notifApplications;
}

export function formatRateLabel(
  rateMin: number,
  rateMax: number,
  showGrossRate: boolean,
  locale: AppLocale = 'pl'
): string {
  const suffix = showGrossRate
    ? translate(locale, 'common.rateGross')
    : translate(locale, 'common.rateNet');
  const min = Number.isFinite(rateMin) ? rateMin : 0;
  const max = Number.isFinite(rateMax) ? rateMax : 0;
  if (min <= 0 && max <= 0) return translate(locale, 'common.rateNegotiable');
  if (min > 0 && max > 0 && min !== max) return `${min}-${max} ${suffix}`;
  const single = min > 0 ? min : max;
  return `${single} ${suffix}`;
}

export function useUserSettings() {
  const { uid } = useCurrentUserProfile();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [remoteMeta, setRemoteMeta] = useState({ hasTheme: false, hasLocale: false });

  useEffect(() => {
    if (!uid) {
      setSettings(DEFAULT_SETTINGS);
      setRemoteMeta({ hasTheme: false, hasLocale: false });
      setLoading(false);
      return;
    }
    // Ważne: trzymaj loading=true do pierwszego snapshota, inaczej migracja
    // motywu/języka może nadpisać preferencje rynku domyślnymi wartościami.
    setLoading(true);
    const unsub = onSnapshot(
      settingsDoc(uid),
      (snap) => {
        if (snap.exists()) {
          const raw = snap.data() as Record<string, unknown>;
          setSettings(normalizeUserSettings(raw));
          setRemoteMeta({
            hasTheme: raw.theme === 'light' || raw.theme === 'dark',
            hasLocale: isAppLocale(raw.locale),
          });
        } else {
          setSettings(DEFAULT_SETTINGS);
          setRemoteMeta({ hasTheme: false, hasLocale: false });
        }
        setLoading(false);
      },
      () => {
        setSettings(DEFAULT_SETTINGS);
        setRemoteMeta({ hasTheme: false, hasLocale: false });
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { uid, settings, loading, setSettings, remoteMeta };
}
