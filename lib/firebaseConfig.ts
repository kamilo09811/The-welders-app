/**
 * Konfiguracja Firebase (klient JS — React Native / Expo).
 *
 * Wartości domyślne są w kodzie (na Twoją prośbę). Nadal możesz nadpisać dowolne pole
 * przez `EXPO_PUBLIC_FIREBASE_*` w `.env` (np. inny projekt na dev / staging).
 *
 * Wpis „Web” w konsoli Firebase = źródło tego obiektu; apka nadal jest Android / iOS.
 * Do Google Sign-In dodaj też aplikacje natywne w konsoli (SHA-1, Bundle ID).
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC60QOVqTdW44vFbk9pSIvIM8EpuX_3tko',
  authDomain: 'theweldersworld-92857.firebaseapp.com',
  projectId: 'theweldersworld-92857',
  storageBucket: 'theweldersworld-92857.firebasestorage.app',
  messagingSenderId: '894157558895',
  appId: '1:894157558895:web:7b755d09c99f523056699a',
  measurementId: 'G-S0YJZ97FDS',
} as const;

function pick(key: keyof typeof DEFAULT_FIREBASE_CONFIG): string {
  const fromEnv = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }[key];
  const v = fromEnv?.trim();
  return v || DEFAULT_FIREBASE_CONFIG[key];
}

export const firebaseConfig = {
  apiKey: pick('apiKey'),
  authDomain: pick('authDomain'),
  projectId: pick('projectId'),
  storageBucket: pick('storageBucket'),
  messagingSenderId: pick('messagingSenderId'),
  appId: pick('appId'),
  measurementId: pick('measurementId'),
} as const;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}
