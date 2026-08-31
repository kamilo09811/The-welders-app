import { getStorage } from 'firebase/storage';

import { getFirebaseApp, getFirebaseStorageBucketGs } from '@/lib/firebaseApp';

let storage: ReturnType<typeof getStorage> | null = null;

/** Firebase Storage — w konsoli włącz Storage i wgraj reguły z `firebase/storage.rules`. */
export function getFirebaseStorage() {
  if (!storage) {
    const app = getFirebaseApp();
    const gs = getFirebaseStorageBucketGs();
    storage = gs ? getStorage(app, gs) : getStorage(app);
  }
  return storage;
}
