import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authColors as C } from '@/constants/auth-ui';
import { APP_LOCALES } from '@/lib/i18n';
import { usePreferences } from '@/lib/preferences-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, locale, setLocale } = usePreferences();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.circleBig} />
        <View style={styles.circleSmall} />

        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.heroCard}>
            <View style={styles.langRow}>
              {APP_LOCALES.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => void setLocale(opt.value)}
                  style={[styles.langPill, locale === opt.value && styles.langPillActive]}>
                  <Text style={[styles.langPillText, locale === opt.value && styles.langPillTextActive]}>
                    {opt.nativeLabel}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.brand}>TheWeldersWorld</Text>
            <Text style={styles.title}>{t('welcome.title')}</Text>
            <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stripsColumn}>
              <View style={[styles.strip, styles.stripBlue]}>
                <View style={styles.stripIconCol}>
                  <View style={[styles.stripIconCircle, styles.stripIconCircleBlue]}>
                    <MaterialIcons name="engineering" size={18} color="#1D4ED8" />
                  </View>
                </View>
                <View style={styles.stripTextCol}>
                  <Text style={styles.stripTitle}>{t('welcome.forWelders')}</Text>
                  <Text style={styles.stripText}>{t('welcome.forWeldersText')}</Text>
                </View>
              </View>

              <View style={[styles.strip, styles.stripGreen]}>
                <View style={styles.stripIconCol}>
                  <View style={[styles.stripIconCircle, styles.stripIconCircleGreen]}>
                    <MaterialIcons name="business-center" size={18} color="#059669" />
                  </View>
                </View>
                <View style={styles.stripTextCol}>
                  <Text style={styles.stripTitle}>{t('welcome.forCompanies')}</Text>
                  <Text style={styles.stripText}>{t('welcome.forCompaniesText')}</Text>
                </View>
              </View>

              <View style={[styles.strip, styles.stripOrange]}>
                <View style={styles.stripIconCol}>
                  <View style={[styles.stripIconCircle, styles.stripIconCircleOrange]}>
                    <MaterialIcons name="home-repair-service" size={18} color="#EA580C" />
                  </View>
                </View>
                <View style={styles.stripTextCol}>
                  <Text style={styles.stripTitle}>{t('welcome.forPrivate')}</Text>
                  <Text style={styles.stripText}>{t('welcome.forPrivateText')}</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          <View style={styles.actionsCard}>
            <Text style={styles.sectionLabel}>{t('welcome.chooseAccount')}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: pressed ? '#f97316' : '#fb923c' },
              ]}
              onPress={() => router.push({ pathname: '/login', params: { role: 'welder' } })}>
              <MaterialIcons name="engineering" size={22} color="#FFFFFF" />
              <View style={styles.primaryTextCol}>
                <Text style={styles.primaryBtnText}>{t('welcome.imWelder')}</Text>
                <Text style={styles.primaryBtnSub}>{t('welcome.imWelderSub')}</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: pressed ? '#f97316' : '#fb923c' },
              ]}
              onPress={() => router.push({ pathname: '/login', params: { role: 'employer' } })}>
              <MaterialIcons name="business" size={22} color="#FFFFFF" />
              <View style={styles.primaryTextCol}>
                <Text style={styles.primaryBtnText}>{t('welcome.imEmployer')}</Text>
                <Text style={styles.primaryBtnSub}>{t('welcome.imEmployerSub')}</Text>
              </View>
            </Pressable>

            <View style={styles.secondaryRow}>
              <Text style={[styles.secondaryText, { color: C.muted }]}>{t('welcome.noAccount')} </Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text style={[styles.link, { color: C.primary }]}>{t('welcome.register')}</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  circleBig: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(56, 189, 248, 0.13)',
    top: -80,
    right: -60,
  },
  circleSmall: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(251, 146, 60, 0.18)',
    bottom: -40,
    left: -40,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 18,
  },

  heroCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.35)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  langPillActive: { backgroundColor: '#0E4AA4', borderColor: '#0E4AA4' },
  langPillText: { color: '#CBD5E1', fontSize: 11, fontWeight: '700' },
  langPillTextActive: { color: '#FFFFFF' },

  brand: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, color: '#E5EDFF', marginTop: 2 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  subtitle: { fontSize: 14, color: '#E2E8F0', lineHeight: 20, marginTop: 6 },

  stripsColumn: {
    paddingTop: 14,
    paddingBottom: 2,
    rowGap: 8,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  stripBlue: { borderColor: 'rgba(59, 130, 246, 0.4)', borderLeftWidth: 4 },
  stripGreen: { borderColor: 'rgba(16, 185, 129, 0.4)', borderLeftWidth: 4 },
  stripOrange: { borderColor: 'rgba(249, 115, 22, 0.4)', borderLeftWidth: 4 },
  stripIconCol: {
    paddingTop: 2,
    paddingRight: 8,
  },
  stripIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  stripIconCircleBlue: { backgroundColor: 'rgba(219, 234, 254, 0.9)' },
  stripIconCircleGreen: { backgroundColor: 'rgba(220, 252, 231, 0.9)' },
  stripIconCircleOrange: { backgroundColor: 'rgba(255, 237, 213, 0.9)' },
  stripTextCol: {
    flex: 1,
  },
  stripTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  stripText: { fontSize: 12, color: '#4B5563', marginTop: 2 },

  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  primaryTextCol: { flex: 1, gap: 2 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  primaryBtnSub: { color: '#FFFBEB', fontSize: 12 },

  secondaryRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  secondaryText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
});
