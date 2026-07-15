import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useRef } from 'react';

import { needsEmailVerification } from '@/lib/auth-email';
import { clearExpoPushToken, saveExpoPushToken } from '@/lib/expo-push';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { getFirebaseFirestore } from '@/lib/firebaseFirestore';

/**
 * Po zalogowaniu (i zweryfikowanym e-mailu) zapisuje token push, gdy w Firestore
 * `users/{uid}/meta/settings` ma `notifMessages: true`.
 */
export function PushRegistrationEffect() {
  const auth = getFirebaseAuth();
  const unsubFirestore = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user: User | null) => {
      unsubFirestore.current?.();
      unsubFirestore.current = null;
      if (!user?.uid || needsEmailVerification(user)) {
        return;
      }
      const settingsRef = doc(getFirebaseFirestore(), 'users', user.uid, 'meta', 'settings');
      unsubFirestore.current = onSnapshot(
        settingsRef,
        (snap) => {
          const data = snap.data() as { notifMessages?: boolean } | undefined;
          const want = data?.notifMessages !== false;
          if (want) {
            void saveExpoPushToken(user.uid);
          } else {
            void clearExpoPushToken(user.uid);
          }
        },
        () => {
          void saveExpoPushToken(user.uid);
        }
      );
    });
    return () => {
      unsubAuth();
      unsubFirestore.current?.();
      unsubFirestore.current = null;
    };
  }, [auth]);

  return null;
}
