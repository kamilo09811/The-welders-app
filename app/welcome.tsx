import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authColors as C } from '@/constants/auth-ui';
import { APP_LOCALES } from '@/lib/i18n';
import { usePreferences } from '@/lib/preferences-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, locale, setLocale } = usePreferences();
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = useMemo(
    () => APP_LOCALES.find((l) => l.value === locale) ?? APP_LOCALES[0],
    [locale]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.circleBig} />
        <View style={styles.circleSmall} />

        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => setLangOpen(true)}
              style={({ pressed }) => [styles.langBtn, pressed && { opacity: 0.85 }]}>
              <MaterialIcons name="language" size={18} color="#E5EDFF" />
              <Text style={styles.langBtnText}>
                {currentLang.flag} {t('welcome.language')}
              </Text>
              <MaterialIcons name="expand-more" size={18} color="#94A3B8" />
            </Pressable>
          </View>

          <View style={styles.heroCard}>
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

        <Modal
          visible={langOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setLangOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setLangOpen(false)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{t('welcome.language')}</Text>
              {APP_LOCALES.map((opt) => {
                const active = locale === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      void setLocale(opt.value);
                      setLangOpen(false);
                    }}
                    style={[styles.langOption, active && styles.langOptionActive]}>
                    <Text style={styles.langOptionFlag}>{opt.flag}</Text>
                    <View style={styles.langOptionTextCol}>
                      <Text style={[styles.langOptionLabel, active && styles.langOptionLabelActive]}>
                        {opt.nativeLabel}
                      </Text>
                      <Text style={styles.langOptionSub}>{opt.label}</Text>
                    </View>
                    {active ? <MaterialIcons name="check" size={20} color="#0E4AA4" /> : null}
                  </Pressable>
                );
              })}
            </Pressable>
          </Pressable>
        </Modal>
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
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.28)',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  langBtnText: {
    color: '#E5EDFF',
    fontSize: 13,
    fontWeight: '700',
  },

  heroCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 10,
    gap: 6,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  langOptionActive: {
    borderColor: '#0E4AA4',
    backgroundColor: '#EFF6FF',
  },
  langOptionFlag: { fontSize: 22 },
  langOptionTextCol: { flex: 1 },
  langOptionLabel: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  langOptionLabelActive: { color: '#0E4AA4' },
  langOptionSub: { color: '#64748B', fontSize: 12, marginTop: 1 },
});
