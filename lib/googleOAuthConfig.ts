import { Platform } from 'react-native';

/**
 * OAuth 2 Client IDs z Google Cloud Console (APIs & Services → Credentials).
 * Muszą być w tym samym projekcie co Firebase / ten sam „Google” w Authentication.
 *
 * - **androidClientId** — typ „Android”, nazwa pakietu jak `applicationId` z buildu (np. po `expo prebuild`) + SHA-1 debug/release.
 * - **iosClientId** — typ „iOS”, Bundle ID jak w Xcode / app.json.
 * - **webClientId** — typ „Web application”; przydatny też przy weryfikacji tokenu w Firebase.
 *
 * Możesz nadpisać przez `EXPO_PUBLIC_GOOGLE_*` w `.env`.
 * Jeśli ustawisz tylko WEB, Android/iOS użyją go jako zapas — czasem wystarczy na dev;
 * przy błędzie „invalid_client” utwórz osobne klienty natywne w Google Cloud.
 */
const DEFAULT = {
  webClientId: '',
  iosClientId: '',
  androidClientId: '',
} as const;

function pick<K extends keyof typeof DEFAULT>(key: K): string {
  const envKey =
    key === 'webClientId'
      ? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
      : key === 'iosClientId'
        ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const v = envKey?.trim();
  return v || DEFAULT[key];
}

export function getGoogleOAuthConfig() {
  const web = pick('webClientId');
  const ios = pick('iosClientId') || web;
  const android = pick('androidClientId') || web;
  return {
    webClientId: web,
    iosClientId: ios,
    androidClientId: android,
  };
}

/** Czy jest skonfigurowany choć jeden Client ID (po uwzględnieniu fallbacku web → native). */
export function isGoogleOAuthConfiguredForCurrentPlatform(): boolean {
  const c = getGoogleOAuthConfig();
  if (Platform.OS === 'ios') {
    return Boolean(c.iosClientId);
  }
  if (Platform.OS === 'android') {
    return Boolean(c.androidClientId);
  }
  return Boolean(c.webClientId);
}
