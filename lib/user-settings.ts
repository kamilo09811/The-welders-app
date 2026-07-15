import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import { useCurrentUserProfile } from '@/lib/user-profile';

export type UserSettings = {
  baseCity: string;
  radius: '25 km' | '50 km' | '100 km' | 'Cała Polska';
  notifNewJobs: boolean;
  notifMessages: boolean;
  onlyVerified: boolean;
  showGrossRate: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  baseCity: '',
  radius: '50 km',
  notifNewJobs: true,
  notifMessages: true,
  onlyVerified: false,
  showGrossRate: true,
};

function settingsDoc(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'meta', 'settings');
}

function normalize(data: Record<string, unknown>): UserSettings {
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
    onlyVerified: data.onlyVerified === true,
    showGrossRate: data.showGrossRate !== false,
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
          setSettings(normalize(snap.data() as Record<string, unknown>));
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
