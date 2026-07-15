import { firebaseConfig } from '@/lib/firebaseConfig';

/** Tekst do UI — upewnij się, że w konsoli Firebase otwierasz ten sam projekt. */
export function getFirebaseProjectHint() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    mailFrom: `noreply@${firebaseConfig.projectId}.firebaseapp.com`,
  };
}
