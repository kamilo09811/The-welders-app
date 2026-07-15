import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { signOut } from 'firebase/auth';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authColors as C } from '@/constants/auth-ui';
import { needsEmailVerification } from '@/lib/auth-email';
import { sendAccountVerificationEmail } from '@/lib/auth-verification';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { mapAuthError } from '@/lib/mapAuthError';
import { firebaseConfig } from '@/lib/firebaseConfig';
import { syncEmailVerified } from '@/lib/user-profile';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { sendError } = useLocalSearchParams<{ sendError?: string }>();
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    typeof sendError === 'string' && sendError ? sendError : null
  );
  const [info, setInfo] = useState<string | null>(
    typeof sendError === 'string' && sendError ? null : 'Po rejestracji wysłaliśmy link — sprawdź skrzynkę (także Spam).'
  );
  const senderHint = `noreply@${firebaseConfig.projectId}.firebaseapp.com`;

  const onCheckAgain = useCallback(async () => {
    setError(null);
    setInfo(null);
    const u = auth.currentUser;
    if (!u) {
      router.replace('/welcome');
      return;
    }
    setBusy(true);
    try {
      await u.reload();
      const verified = auth.currentUser;
      if (verified && !needsEmailVerification(verified)) {
        await syncEmailVerified(verified.uid, verified.emailVerified);
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.replace('/(tabs)');
        return;
      }
      setInfo('Link jeszcze nie został użyty. Otwórz mail, kliknij link, wróć tutaj i naciśnij ponownie „Sprawdziłem”.');
    } catch (e) {
      setError(mapAuthError(e));
    } finally {
      setBusy(false);
    }
  }, [auth, router]);

  const onResend = useCallback(async () => {
    setError(null);
    setInfo(null);
    const u = auth.currentUser;
    if (!u?.email) {
      setError('Brak adresu e-mail na koncie.');
      return;
    }
    setBusy(true);
    const r = await sendAccountVerificationEmail(u);
    setBusy(false);
    if (r.ok) {
      setInfo(`Wysłano ponownie na ${u.email}. Poczekaj 1–2 minuty i sprawdź Spam / Oferty.`);
    } else {
      setError(r.message);
    }
  }, [auth]);

  const onOpenMail = useCallback(() => {
    void Linking.openURL('mailto:');
  }, []);

  const onLogout = useCallback(async () => {
    await signOut(auth);
    router.replace('/welcome');
  }, [auth, router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={[styles.root, { backgroundColor: C.bg }]}>
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Potwierdź e-mail</Text>
            <Text style={styles.lead}>
              Link aktywacyjny wysyła <Text style={styles.bold}>Firebase</Text> na adres:
            </Text>
            <Text style={styles.emailBig}>{user?.email ?? '—'}</Text>

            <View style={[styles.tipsCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={styles.tipsTitle}>Nie widzisz maila?</Text>
              <Text style={styles.tip}>• Sprawdź <Text style={styles.bold}>Spam</Text>, <Text style={styles.bold}>Oferty</Text> i <Text style={styles.bold}>Wszystkie wiadomości</Text> (Gmail).</Text>
              <Text style={styles.tip}>• Szukaj nadawcy podobnego do:{'\n'}  <Text style={styles.mono}>{senderHint}</Text></Text>
              <Text style={styles.tip}>• Upewnij się, że przy rejestracji nie pomyliłeś liter w adresie.</Text>
              <Text style={styles.tip}>• Odczekaj 2–5 minut — czasem mail przychodzi z opóźnieniem.</Text>
              <Text style={styles.tip}>• Naciśnij „Wyślij e-mail ponownie” (nie częściej niż co kilka minut).</Text>
              <Text style={styles.tip}>• Konto przez <Text style={styles.bold}>Google</Text> zwykle nie wymaga tego kroku — wyloguj się i zaloguj przez Google.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
              <Pressable
                style={[styles.rowBtn, { borderColor: C.border }]}
                onPress={onOpenMail}
                disabled={busy}>
                <MaterialIcons name="mail-outline" size={22} color={C.primary} />
                <Text style={[styles.rowBtnText, { color: C.text }]}>Otwórz aplikację e-mail</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, { backgroundColor: C.primary }, busy && styles.btnDisabled]}
                onPress={onCheckAgain}
                disabled={busy}>
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sprawdziłem — przejdź dalej</Text>
                )}
              </Pressable>

              <Pressable style={styles.linkBtn} onPress={onResend} disabled={busy}>
                <Text style={[styles.linkText, { color: C.primary }]}>Wyślij e-mail ponownie</Text>
              </Pressable>

              {error ? <Text style={[styles.msg, { color: C.error }]}>{error}</Text> : null}
              {info ? <Text style={[styles.msg, { color: C.muted }]}>{info}</Text> : null}
            </View>

            <Pressable onPress={onLogout} style={styles.logoutWrap}>
              <Text style={[styles.logout, { color: C.muted }]}>Wyloguj i użyj innego konta</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 32, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8 },
  lead: { fontSize: 14, lineHeight: 20, color: C.muted },
  bold: { fontWeight: '700', color: C.text },
  emailBig: {
    fontSize: 17,
    fontWeight: '800',
    color: C.primary,
    marginTop: 6,
    marginBottom: 16,
  },
  tipsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  tipsTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 4 },
  tip: { fontSize: 13, lineHeight: 19, color: C.muted },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: '#475569' },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 14 },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  rowBtnText: { fontSize: 15, fontWeight: '700' },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
  linkBtn: { alignSelf: 'center', paddingVertical: 6 },
  linkText: { fontSize: 15, fontWeight: '700' },
  msg: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  logoutWrap: { marginTop: 28, alignItems: 'center' },
  logout: { fontSize: 14, fontWeight: '600' },
});
