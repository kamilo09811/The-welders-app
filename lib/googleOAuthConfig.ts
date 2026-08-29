import { Platform } from 'react-native';

/**
 * OAuth 2 Client IDs z Google Cloud Console (APIs & Services → Credentials).
 * Muszą być w tym samym projekcie co Firebase / ten sam „Google” w Authentication.
 *
 * - **androidClientId** — typ „Android”, package `com.theweldersworld.app` + SHA-1.
 * - **iosClientId** — typ „iOS”, Bundle ID `com.theweldersworld.app`.
 * - **webClientId** — typ „Web application”; wymagany przez Firebase / id_token.
 *
 * Ustaw przez `EXPO_PUBLIC_GOOGLE_*` w `.env` **oraz** EAS Secrets (inaczej
 * produkcyjny IPA/APK nie ma Client ID i przycisk Google pokaże „brak Client ID”).
 *
 * Jeśli ustawisz tylko WEB, Android/iOS użyją go jako zapas — czasem wystarczy;
 * przy `invalid_client` utwórz osobne klienty natywne.
 */
/** Web OAuth Client ID (publiczny — trafia do binariów). Nadpisz przez EXPO_PUBLIC_GOOGLE_*. */
const DEFAULT = {
  webClientId: '893817844292-bl2sjnatles76gj9nmf0vo7si5pbqcm5.apps.googleusercontent.com',
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

/**
 * Odwrócony iOS Client ID → schemat URL (CFBundleURLSchemes), np.
 * `123-abc.apps.googleusercontent.com` → `com.googleusercontent.apps.123-abc`
 */
export function getGoogleIosUrlScheme(): string | null {
  const ios = getGoogleOAuthConfig().iosClientId;
  if (!ios || !ios.endsWith('.apps.googleusercontent.com')) return null;
  const prefix = ios.replace(/\.apps\.googleusercontent\.com$/, '');
  return prefix ? `com.googleusercontent.apps.${prefix}` : null;
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

/** Krótki status do UI (bez ujawniania pełnych Client ID). */
export function getGoogleOAuthSetupHint(): {
  configured: boolean;
  hasWeb: boolean;
  hasIos: boolean;
  hasAndroid: boolean;
} {
  return {
    configured: isGoogleOAuthConfiguredForCurrentPlatform(),
    hasWeb: Boolean(pick('webClientId')),
    hasIos: Boolean(pick('iosClientId')),
    hasAndroid: Boolean(pick('androidClientId')),
  };
}
