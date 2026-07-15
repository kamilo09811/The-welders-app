import { getFirestore } from 'firebase/firestore';

import { getFirebaseApp } from '@/lib/firebaseApp';

/** Firestore — w konsoli włącz moduł Firestore i ustaw reguły (np. tylko własny dokument `users/{uid}`). */
export function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp());
}
