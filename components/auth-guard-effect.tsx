import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { needsEmailVerification } from '@/lib/auth-email';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { syncEmailVerified } from '@/lib/user-profile';

const AUTH_SCREENS = new Set([
  'welcome',
  'login',
  'register',
  'forgot-password',
  'verify-email',
  'legal',
]);

function isProtectedRoute(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return false;
  if (root === '(tabs)') return true;
  return ['listing', 'applications', 'messages', 'notifications', 'user'].includes(root);
}

function isAuthScreen(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return true;
  return AUTH_SCREENS.has(root);
}

function resolveRedirect(user: User | null, segments: string[]): string | null {
  const protectedRoute = isProtectedRoute(segments);
  const authScreen = isAuthScreen(segments);
  const onVerifyEmail = segments[0] === 'verify-email';

  if (!user) {
    if (protectedRoute || onVerifyEmail) return '/welcome';
    return null;
  }

  if (needsEmailVerification(user)) {
    if (!onVerifyEmail) return '/verify-email';
    return null;
  }

  if (authScreen) return '/(tabs)';
  return null;
}

/** Centralny strażnik sesji — przekierowania na podstawie Firebase Auth i trasy. */
export function AuthGuardEffect() {
  const router = useRouter();
  const segments = useSegments();
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      if (nextUser) {
        void syncEmailVerified(nextUser.uid, nextUser.emailVerified);
      }
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const target = resolveRedirect(user, segments as string[]);
    if (target) {
      router.replace(target as never);
    }
  }, [authReady, user, segments, router]);

  return null;
}
