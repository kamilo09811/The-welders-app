import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { getFirebaseFirestore } from '@/lib/firebaseFirestore';

/** Reguły Firestore (przykład): `match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }` */

export type AccountRole = 'welder' | 'employer';

export type UserProfile = {
  role: AccountRole;
  fullName: string;
  phone: string;
  city: string;
  avatarUrl: string;
  /** Krótki opis widoczny na profilu publicznym. */
  publicBio: string;
  /** Zsynchronizowane z Firebase Auth (`user.emailVerified`). */
  emailVerified: boolean;
};

const DEFAULT_PROFILE: UserProfile = {
  role: 'welder',
  fullName: '',
  phone: '',
  city: '',
  avatarUrl: '',
  publicBio: '',
  emailVerified: false,
};

function usersDoc(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid);
}

export type PublicUserInfo = {
  fullName: string;
  avatarUrl: string;
  emailVerified: boolean;
};

function normalizeRole(v: unknown): AccountRole {
  return v === 'employer' ? 'employer' : 'welder';
}

function snapshotToProfile(data: Record<string, unknown>): UserProfile {
  return {
    role: normalizeRole(data.role),
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    city: typeof data.city === 'string' ? data.city : '',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
    publicBio: typeof data.publicBio === 'string' ? data.publicBio : '',
    emailVerified: data.emailVerified === true,
  };
}

/** Aktualizuje pole `emailVerified` w profilu na podstawie Firebase Auth. */
export async function syncEmailVerified(uid: string, emailVerified: boolean): Promise<void> {
  await setDoc(
    usersDoc(uid),
    {
      emailVerified: emailVerified === true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Tworzy dokument profilu z rolą (np. po rejestracji e-mail). */
export async function createUserProfile(
  uid: string,
  role: AccountRole,
  emailVerified = false
): Promise<void> {
  await setDoc(usersDoc(uid), {
    role,
    fullName: '',
    phone: '',
    city: '',
    avatarUrl: '',
    publicBio: '',
    emailVerified: emailVerified === true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Jeśli brak dokumentu (np. pierwsze logowanie Google), utwórz z podaną rolą lub domyślnie spawacz.
 * Nie nadpisuje istniejącego profilu.
 */
export async function ensureUserProfileForOAuth(
  uid: string,
  preferredRole?: AccountRole,
  emailVerified = false
): Promise<void> {
  const ref = usersDoc(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await syncEmailVerified(uid, emailVerified);
    return;
  }
  await setDoc(ref, {
    role: preferredRole ?? 'welder',
    fullName: '',
    phone: '',
    city: '',
    avatarUrl: '',
    publicBio: '',
    emailVerified: emailVerified === true,
    updatedAt: serverTimestamp(),
  });
}

export async function getPublicUserInfo(uid: string): Promise<PublicUserInfo> {
  const snap = await getDoc(usersDoc(uid));
  if (!snap.exists()) {
    return { fullName: '', avatarUrl: '', emailVerified: false };
  }
  const data = snap.data() as Record<string, unknown>;
  return {
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
    emailVerified: data.emailVerified === true,
  };
}

/** Mapa `authorId` → zweryfikowany e-mail (dla filtra marketplace). */
export async function getAuthorsEmailVerified(
  uids: string[]
): Promise<Record<string, boolean>> {
  const unique = [...new Set(uids.filter(Boolean))];
  const result: Record<string, boolean> = {};
  await Promise.all(
    unique.map(async (uid) => {
      const snap = await getDoc(usersDoc(uid));
      if (!snap.exists()) {
        result[uid] = false;
        return;
      }
      const data = snap.data() as Record<string, unknown>;
      result[uid] = data.emailVerified === true;
    })
  );
  return result;
}

/** Aktualizacja danych osobowych — rola pozostaje bez zmian (ustawiana tylko przy rejestracji / pierwszym OAuth). */
export async function updateUserPersonalFields(
  uid: string,
  fields: Omit<UserProfile, 'role' | 'emailVerified'>
): Promise<void> {
  await setDoc(
    usersDoc(uid),
    {
      ...fields,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function useCurrentUserProfile() {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(getFirebaseAuth(), (user) => {
      unsubDoc?.();
      unsubDoc = undefined;

      if (!user) {
        setUid(null);
        setProfile(DEFAULT_PROFILE);
        setLoading(false);
        return;
      }

      setUid(user.uid);
      setLoading(true);
      unsubDoc = onSnapshot(
        usersDoc(user.uid),
        (snap) => {
          if (snap.exists()) {
            setProfile(snapshotToProfile(snap.data() as Record<string, unknown>));
          } else {
            setProfile(DEFAULT_PROFILE);
          }
          setLoading(false);
        },
        () => {
          setProfile(DEFAULT_PROFILE);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubDoc?.();
      unsubAuth();
    };
  }, []);

  return { uid, loading, profile };
}

/** Pobiera status weryfikacji e-mail autorów ogłoszeń (tylko gdy filtr aktywny). */
export function useAuthorsEmailVerified(authorIds: string[], enabled: boolean) {
  const [verifiedByAuthor, setVerifiedByAuthor] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const authorKey = useMemo(() => {
    if (!enabled) return '';
    return [...new Set(authorIds.filter(Boolean))].sort().join(',');
  }, [authorIds, enabled]);

  useEffect(() => {
    if (!authorKey) {
      setVerifiedByAuthor({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getAuthorsEmailVerified(authorKey.split(',')).then((map) => {
      if (!cancelled) {
        setVerifiedByAuthor(map);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [authorKey]);

  return { verifiedByAuthor, loading };
}
