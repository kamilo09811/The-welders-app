/**
 * Łączy app.json z pluginem powiadomień, EAS project id (getExpoPushTokenAsync)
 * oraz schematem URL Google Sign-In na iOS (odwrócony Client ID).
 *
 * EXPO_PUBLIC_* ustaw lokalnie w `.env` i w EAS Secrets przed kolejnym buildem.
 */
function googleIosUrlScheme(iosClientId) {
  const id = String(iosClientId || '').trim();
  if (!id || !id.endsWith('.apps.googleusercontent.com')) return null;
  const prefix = id.replace(/\.apps\.googleusercontent\.com$/, '');
  if (!prefix) return null;
  return `com.googleusercontent.apps.${prefix}`;
}

module.exports = ({ config }) => {
  const plugins = [...(config.plugins ?? [])];
  const hasNotif = plugins.some((p) =>
    Array.isArray(p) ? p[0] === 'expo-notifications' : p === 'expo-notifications'
  );
  if (!hasNotif) {
    plugins.push([
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#0E4AA4',
        sounds: [],
        mode: 'production',
      },
    ]);
  }

  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
    '';
  const googleScheme = googleIosUrlScheme(iosClientId);

  const existingUrlTypes = config.ios?.infoPlist?.CFBundleURLTypes ?? [];
  const hasGoogleScheme = existingUrlTypes.some(
    (t) => Array.isArray(t.CFBundleURLSchemes) && t.CFBundleURLSchemes.includes(googleScheme)
  );
  const urlTypes =
    googleScheme && !hasGoogleScheme
      ? [...existingUrlTypes, { CFBundleURLSchemes: [googleScheme] }]
      : existingUrlTypes;

  const backgroundModes = new Set([
    ...((config.ios?.infoPlist?.UIBackgroundModes) || []),
    'remote-notification',
  ]);

  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    config.extra?.eas?.projectId ||
    'c690c7ac-79b4-4060-83f3-ca9800f7a7cd';

  return {
    ...config,
    plugins,
    ios: {
      ...config.ios,
      /** Unikalny identyfikator w App Store / urządzeniu. */
      bundleIdentifier: 'com.theweldersworld.app',
      infoPlist: {
        ...config.ios?.infoPlist,
        UIBackgroundModes: [...backgroundModes],
        ...(urlTypes.length ? { CFBundleURLTypes: urlTypes } : {}),
      },
    },
    android: {
      ...config.android,
      package: 'com.theweldersworld.app',
      googleServicesFile: config.android?.googleServicesFile,
    },
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        projectId,
      },
    },
  };
};
