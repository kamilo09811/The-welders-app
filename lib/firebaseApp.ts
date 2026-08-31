import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

import { firebaseConfig } from '@/lib/firebaseConfig';

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return app;
}

/** gs:// bucket — spójny z `firebaseConfig.storageBucket` (avatary / chat media). */
export function getFirebaseStorageBucketGs(): string {
  const bucket = firebaseConfig.storageBucket?.trim();
  if (!bucket) return '';
  return bucket.startsWith('gs://') ? bucket : `gs://${bucket}`;
}
