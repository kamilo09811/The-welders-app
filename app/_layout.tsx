import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-reanimated';

import { AuthGuardEffect } from '@/components/auth-guard-effect';
import { PushNotificationBootstrap } from '@/components/push-notification-bootstrap';
import { PushRegistrationEffect } from '@/components/push-registration-effect';
import { useColorScheme } from '@/hooks/use-color-scheme';

WebBrowser.maybeCompleteAuthSession();

// Domyślny start na ekranie powitalnym; po zalogowaniu ekrany logowania
// nawigują do stosu zakładek (/(tabs)).
export const unstable_settings = {
  anchor: 'welcome',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
