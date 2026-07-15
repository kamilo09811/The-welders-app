import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function easProjectId(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (fromExtra && fromExtra.trim()) return fromExtra.trim();
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return fromEnv || undefined;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Zapisuje token Expo Push w `users/{uid}/meta/push` (reguły: meta/{docId}). */
export async function saveExpoPushToken(uid: string): Promise<boolean> {
  if (Platform.OS === 'web' || !Device.isDevice) return false;
  const projectId = easProjectId();
  if (!projectId) {
    return false;
  }
  const ok = await requestNotificationPermission();
  if (!ok) return false;
  try {
    const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenRes.data;
    if (!token) return false;
    await setDoc(
      doc(getFirebaseFirestore(), 'users', uid, 'meta', 'push'),
      {
        expoPushToken: token,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function clearExpoPushToken(uid: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await setDoc(
      doc(getFirebaseFirestore(), 'users', uid, 'meta', 'push'),
      {
        expoPushToken: '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // ignoruj
  }
}
