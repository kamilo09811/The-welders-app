import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { getFirebaseAuth } from '@/lib/firebaseAuth';

/**
 * Czeka na pierwszą odpowiedź Firebase Auth (persystencja AsyncStorage).
 * Subskrypcje Firestore z `allow read: if isSignedIn()` muszą startować
 * dopiero gdy `ready === true` — inaczej permission-denied zabija listener
 * (częsty objaw na TestFlight: puste ogłoszenia / awatary).
 */
export function useAuthReady(): { ready: boolean; user: User | null } {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (next) => {
      setUser(next);
      setReady(true);
    });
    return unsub;
  }, []);

  return { ready, user };
}
