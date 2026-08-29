import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-reanimated';

import { AuthGuardEffect } from '@/components/auth-guard-effect';
import { PushNotificationBootstrap } from '@/components/push-notification-bootstrap';
import { PushRegistrationEffect } from '@/components/push-registration-effect';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PreferencesProvider, usePreferencesOptional } from '@/lib/preferences-context';

WebBrowser.maybeCompleteAuthSession();

// Domyślny start na ekranie powitalnym; po zalogowaniu ekrany logowania
// nawigują do stosu zakładek (/(tabs)).
export const unstable_settings = {
  anchor: 'welcome',
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const prefs = usePreferencesOptional();
  const navTheme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: prefs?.colors.primary ?? '#FB923C',
            background: prefs?.colors.bg ?? DarkTheme.colors.background,
            card: prefs?.colors.card ?? DarkTheme.colors.card,
            text: prefs?.colors.text ?? DarkTheme.colors.text,
            border: prefs?.colors.border ?? DarkTheme.colors.border,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: prefs?.colors.primary ?? '#C2410C',
            background: prefs?.colors.bg ?? DefaultTheme.colors.background,
            card: prefs?.colors.card ?? DefaultTheme.colors.card,
            text: prefs?.colors.text ?? DefaultTheme.colors.text,
            border: prefs?.colors.border ?? DefaultTheme.colors.border,
          },
        };

  return (
    <ThemeProvider value={navTheme}>
      <AuthGuardEffect />
      <PushNotificationBootstrap />
      <PushRegistrationEffect />
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/new" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="listing/edit/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="applications/sent" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="applications/incoming" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="messages/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="messages/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="user/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <RootNavigation />
    </PreferencesProvider>
  );
}
