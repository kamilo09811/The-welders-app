/**
 * Łączy app.json z pluginem powiadomień i EAS project id (getExpoPushTokenAsync).
 * Ustaw EXPO_PUBLIC_EAS_PROJECT_ID w .env albo uruchom `eas init` i wklej id do app.json → expo.extra.eas.projectId
 */
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
  return {
    ...config,
    plugins,
    ios: {
      ...config.ios,
      /** Unikalny identyfikator w App Store / urządzeniu — zmień, jeśli koliduje z inną aplikacją. */
      bundleIdentifier: 'com.theweldersworld.app',
    },
    android: {
      ...config.android,
      /** Pakiet aplikacji (Google Play) — zwykle ten sam „reverse DNS” co iOS. */
      package: 'com.theweldersworld.app',
    },
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || config.extra?.eas?.projectId || '',
      },
    },
  };
};
