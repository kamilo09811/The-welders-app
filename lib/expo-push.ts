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

const ANDROID_CHANNEL_ID = 'default';

function easProjectId(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (fromExtra && fromExtra.trim()) return fromExtra.trim();
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return fromEnv || undefined;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'TheWeldersWorld',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0E4AA4',
    sound: 'default',
  });
}

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (Platform.OS === 'web') return 'unavailable';
  if (!Device.isDevice) return 'unavailable';
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!Device.isDevice) return false;
  await ensureAndroidChannel();
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
    if (__DEV__) {
      console.warn('[push] Brak EAS projectId — ustaw extra.eas.projectId lub EXPO_PUBLIC_EAS_PROJECT_ID');
    }
    return false;
  }
  const ok = await requestNotificationPermission();
  if (!ok) return false;
  try {
    await ensureAndroidChannel();
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
  } catch (e) {
    if (__DEV__) {
      console.warn('[push] saveExpoPushToken failed', e);
    }
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
