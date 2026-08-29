import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { authColors as C } from '@/constants/auth-ui';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import {
  getGoogleOAuthConfig,
  isGoogleOAuthConfiguredForCurrentPlatform,
} from '@/lib/googleOAuthConfig';
import { mapAuthError } from '@/lib/mapAuthError';
import { usePreferences } from '@/lib/preferences-context';
import { ensureUserProfileForOAuth, type AccountRole } from '@/lib/user-profile';

type Props = {
  /** np. zajęte logowaniem e-mail / rejestracją */
  disabled?: boolean;
  onFirebaseError: (message: string) => void;
  /** Rola przy pierwszym utworzeniu profilu (Google); bez dokumentu w Firestore — domyślnie spawacz. */
  oauthRole?: AccountRole;
};

function GoogleSignInInner({ disabled, onFirebaseError, oauthRole }: Props) {
  const router = useRouter();
  const { t, locale } = usePreferences();
  const config = getGoogleOAuthConfig();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: config.webClientId || undefined,
    iosClientId: config.iosClientId || undefined,
    androidClientId: config.androidClientId || undefined,
  });
  const [pending, setPending] = useState(false);
  const lastIdTokenHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!response) {
      return;
    }
    if (response.type === 'error') {
      const p = response.params as { error_description?: string; error?: string };
      onFirebaseError(p.error_description || p.error || t('auth.err.default'));
      setPending(false);
      return;
    }
    if (response.type === 'cancel' || response.type === 'dismiss') {
      setPending(false);
      return;
    }
    if (response.type !== 'success') {
      return;
    }
    const idToken = response.params.id_token;
    if (!idToken || lastIdTokenHandled.current === idToken) {
      return;
    }
    lastIdTokenHandled.current = idToken;

    let cancelled = false;
    setPending(true);
    void signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken))
      .then(async (cred) => {
        if (!cancelled) {
          await ensureUserProfileForOAuth(cred.user.uid, oauthRole, cred.user.emailVerified);
          router.replace('/(tabs)');
        }
      })
      .catch((e) => {
        if (!cancelled) {
          onFirebaseError(mapAuthError(e, locale));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPending(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [response, onFirebaseError, oauthRole, router, locale, t]);

  const onPress = useCallback(async () => {
    if (!request) {
      return;
    }
    lastIdTokenHandled.current = null;
    try {
      setPending(true);
      const r = await promptAsync();
      if (r.type !== 'success') {
        setPending(false);
      }
    } catch {
      setPending(false);
    }
  }, [promptAsync, request]);

  const blocked = Boolean(disabled) || pending || !request;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.googleBtn,
        { borderColor: C.googleBorder, backgroundColor: pressed ? C.fieldBg : C.card },
        blocked && styles.btnDisabled,
      ]}>
      {pending ? (
        <ActivityIndicator color={C.primary} />
      ) : (
        <>
          <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
          <Text style={[styles.googleBtnText, { color: C.text }]}>{t('auth.continueGoogle')}</Text>
        </>
      )}
    </Pressable>
  );
}

/** Przycisk logowania Google → Firebase Auth (`signInWithCredential`). */
export function GoogleFirebaseSignInButton({ disabled, onFirebaseError, oauthRole }: Props) {
  const { t } = usePreferences();
  const isExpoGo = Constants.appOwnership === 'expo';
  const configured = isGoogleOAuthConfiguredForCurrentPlatform();

  const showExpoGoHint = useCallback(() => {
    Alert.alert(t('auth.googleNeedsBuildTitle'), t('auth.googleNeedsBuildBody'));
  }, [t]);

  const showConfigHint = useCallback(() => {
    Alert.alert(t('auth.googleMissingTitle'), t('auth.googleMissingBody'));
  }, [t]);

  if (isExpoGo) {
    return (
      <Pressable
        onPress={showExpoGoHint}
        style={({ pressed }) => [
          styles.googleBtn,
          { borderColor: C.googleBorder, backgroundColor: pressed ? C.fieldBg : C.card },
        ]}>
        <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
        <View style={styles.labelCol}>
          <Text style={[styles.googleBtnText, { color: C.text }]}>{t('auth.continueGoogle')}</Text>
          <Text style={[styles.subHint, { color: C.muted }]}>{t('auth.googleNeedsBuild')}</Text>
        </View>
      </Pressable>
    );
  }

  if (!configured) {
    return (
      <Pressable
        onPress={showConfigHint}
        style={({ pressed }) => [
          styles.googleBtn,
          { borderColor: C.googleBorder, backgroundColor: pressed ? C.fieldBg : C.card },
        ]}>
        <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
        <View style={styles.labelCol}>
          <Text style={[styles.googleBtnText, { color: C.text }]}>{t('auth.continueGoogle')}</Text>
          <Text style={[styles.subHint, { color: C.muted }]}>{t('auth.googleMissingClient')}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <GoogleSignInInner disabled={disabled} onFirebaseError={onFirebaseError} oauthRole={oauthRole} />
  );
}

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.65,
  },
  labelCol: {
    alignItems: 'flex-start',
    gap: 2,
  },
  subHint: {
    fontSize: 11,
    fontWeight: '500',
  },
});
