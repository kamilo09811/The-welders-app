import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { sendPasswordResetEmail } from 'firebase/auth';
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

import { authColors as C } from '@/constants/auth-ui';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { isFirebaseConfigured } from '@/lib/firebaseConfig';
import { getFirebaseProjectHint } from '@/lib/firebase-project-hint';
import { mapAuthError } from '@/lib/mapAuthError';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof emailParam === 'string' ? emailParam : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fb = getFirebaseProjectHint();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }, [router]);

  const onSubmit = useCallback(async () => {
    setError(null);
    setSent(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Podaj adres e-mail.');
      return;
    }
    if (!isFirebaseConfigured()) {
      setError('Brak konfiguracji Firebase.');
      return;
    }
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), trimmed);
      setSent(true);
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      setError(mapAuthError(e));
    } finally {
      setBusy(false);
    }
  }, [email]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={[styles.root, { backgroundColor: C.bg }]}>
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}>
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
                <Text style={styles.topTitle}>Reset hasła</Text>
                <View style={styles.topSpacer} />
              </View>

              <Text style={styles.lead}>
                Wyślemy link do ustawienia nowego hasła na podany adres (sprawdź też folder spam).
              </Text>

              <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={styles.label}>E-mail</Text>
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

                {sent ? (
                  <View style={styles.sentBlock}>
                    <Text style={[styles.success, { color: C.success }]} accessibilityLiveRegion="polite">
                      Firebase przyjął żądanie. Jeśli konto było założone e-mailem i hasłem (nie tylko Google), sprawdź
                      skrzynkę — także Spam. Nadawca często: {fb.mailFrom}
                    </Text>
                    <Text style={styles.sentSub}>
                      Nic nie ma? W konsoli Firebase otwórz projekt „{fb.projectId}” → Authentication → Users — czy ten
                      e-mail tam jest? Konto tylko z Google nie dostaje resetu hasła — zaloguj się przez Google.
                    </Text>
                  </View>
                ) : null}

                {error ? (
                  <Text style={[styles.error, { color: C.error }]} accessibilityLiveRegion="polite">
                    {error}
                  </Text>
                ) : null}

                <Pressable
                  onPress={onSubmit}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: pressed ? C.primaryPressed : C.primary },
                    busy && styles.btnDisabled,
                  ]}>
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Wyślij link</Text>
                  )}
                </Pressable>
              </View>

              <Pressable onPress={() => router.replace('/login')} style={styles.backLogin}>
                <Text style={[styles.backLoginText, { color: C.primary }]}>Wróć do logowania</Text>
              </Pressable>

              <Text style={styles.projectHint}>
                Aktywny projekt Firebase w tej aplikacji: {fb.projectId}
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 4 },
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
  topSpacer: { width: 40 },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: C.muted,
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
  },
  sentBlock: { marginTop: 14, gap: 8 },
  success: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentSub: { fontSize: 12, lineHeight: 18, color: C.muted },
  projectHint: {
    marginTop: 20,
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 16,
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
  btnDisabled: { opacity: 0.7 },
  backLogin: { marginTop: 24, alignSelf: 'center', padding: 8 },
  backLoginText: { fontSize: 15, fontWeight: '700' },
});
