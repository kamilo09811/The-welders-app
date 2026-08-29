import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleFirebaseSignInButton } from '@/components/google-firebase-sign-in-button';
import { authColors as C } from '@/constants/auth-ui';
import { needsEmailVerification } from '@/lib/auth-email';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { isFirebaseConfigured } from '@/lib/firebaseConfig';
import { mapAuthError } from '@/lib/mapAuthError';
import { usePreferences } from '@/lib/preferences-context';

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { t } = usePreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleHint =
    role === 'welder'
      ? t('auth.loginHintWelder')
      : role === 'employer'
        ? t('auth.loginHintEmployer')
        : t('auth.loginHint');

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  }, [router]);

  const onEmailLogin = useCallback(async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t('auth.fillEmailPassword'));
      return;
    }
    if (!isFirebaseConfigured()) {
      setError('Brak konfiguracji Firebase (lib/firebaseConfig).');
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      const u = getFirebaseAuth().currentUser;
      if (u && needsEmailVerification(u)) {
        router.replace('/verify-email');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(mapAuthError(e));
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setBusy(false);
    }
  }, [email, password, router, t]);

  const goForgotPassword = useCallback(() => {
    router.push({
      pathname: '/forgot-password',
      ...(email.trim() ? { params: { email: email.trim() } } : {}),
    });
  }, [router, email]);

  const goRegister = useCallback(() => {
    router.push({
      pathname: '/register',
      ...(role === 'welder' || role === 'employer' ? { params: { role } } : {}),
    });
  }, [router, role]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={[styles.root, { backgroundColor: C.bg }]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.topBar}>
                <Pressable
                  onPress={goBack}
                  hitSlop={12}
                  style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
                  <MaterialIcons name="arrow-back" size={22} color={C.text} />
                </Pressable>
                <Text style={styles.topTitle}>{t('auth.loginTitle')}</Text>
                <View style={styles.topSpacer} />
              </View>

              <Text style={styles.hint}>{roleHint}</Text>

              <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.fieldBg }]}
                  placeholder="twoj@email.pl"
                  placeholderTextColor={C.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={setEmail}
                  editable={!busy}
                />

                <Text style={[styles.label, styles.labelSpaced]}>{t('auth.password')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.fieldBg }]}
                  placeholder="••••••••"
                  placeholderTextColor={C.placeholder}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  value={password}
                  onChangeText={setPassword}
                  editable={!busy}
                />

                <Pressable onPress={goForgotPassword} style={styles.forgotWrap}>
                  <Text style={[styles.forgot, { color: C.primary }]}>{t('auth.forgotPassword')}</Text>
                </Pressable>

                {error ? (
                  <Text style={[styles.error, { color: C.error }]} accessibilityLiveRegion="polite">
                    {error}
                  </Text>
                ) : null}

                <Pressable
                  onPress={onEmailLogin}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: pressed ? C.primaryPressed : C.primary },
                    busy && styles.btnDisabled,
                  ]}>
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t('auth.login')}</Text>
                  )}
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
                  <Text style={[styles.dividerText, { color: C.muted }]}>{t('auth.or')}</Text>
                  <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
                </View>

                <GoogleFirebaseSignInButton
                  disabled={busy}
                  onFirebaseError={setError}
                  oauthRole={role === 'employer' ? 'employer' : role === 'welder' ? 'welder' : undefined}
                />
              </View>

              <View style={styles.registerRow}>
                <Text style={[styles.registerLead, { color: C.muted }]}>{t('auth.noAccount')} </Text>
                <Pressable onPress={goRegister}>
                  <Text style={[styles.registerLink, { color: C.primary }]}>{t('auth.register')}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
  },
  topSpacer: {
    width: 40,
  },
  hint: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 6,
  },
  labelSpaced: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 4,
  },
  forgot: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerLead: {
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
