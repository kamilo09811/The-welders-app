import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import type { ListingIntent, WorkMode } from '@/lib/market-listings';
import { useCurrentUserProfile } from '@/lib/user-profile';

export type SettingsRadius = '25 km' | '50 km' | '100 km' | 'Cała Polska';
export type SettingsSort = 'rateDesc' | 'rateAsc' | 'newest';
export type SettingsIntentPref = 'all' | ListingIntent;

export type UserSettings = {
  baseCity: string;
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
};

export const DEFAULT_SETTINGS: UserSettings = {
  baseCity: '',
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

  return {
    baseCity: typeof data.baseCity === 'string' ? data.baseCity : '',
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

export function formatRateLabel(rateMin: number, rateMax: number, showGrossRate: boolean): string {
  const suffix = showGrossRate ? 'PLN/h brutto' : 'PLN/h netto';
  return `${rateMin}-${rateMax} ${suffix}`;
}

export function useUserSettings() {
  const { uid } = useCurrentUserProfile();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      settingsDoc(uid),
      (snap) => {
        if (snap.exists()) {
          setSettings(normalizeUserSettings(snap.data() as Record<string, unknown>));
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      () => {
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { uid, settings, loading, setSettings };
}
