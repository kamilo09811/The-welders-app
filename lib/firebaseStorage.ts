import { getStorage } from 'firebase/storage';

import { getFirebaseApp } from '@/lib/firebaseApp';

let storage: ReturnType<typeof getStorage> | null = null;

/** Firebase Storage — w konsoli włącz Storage i wgraj reguły z `firebase/storage.rules`. */
export function getFirebaseStorage() {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}
