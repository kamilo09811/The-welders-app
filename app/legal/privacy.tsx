import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LEGAL_CONFIG } from '@/lib/legal-config';
import { getPrivacySectionsEn, getPrivacySectionsPl } from '@/lib/privacy-policy';
import { usePreferences } from '@/lib/preferences-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { t, locale, colors } = usePreferences();
  const sections = locale === 'en' ? getPrivacySectionsEn() : getPrivacySectionsPl();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('legal.privacyTitle')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.brand, { color: colors.primary }]}>{LEGAL_CONFIG.appName}</Text>
          <Text style={[styles.updated, { color: colors.textSoft }]}>
            {t('legal.updated', {
              date: locale === 'en' ? LEGAL_CONFIG.lastUpdatedEn : LEGAL_CONFIG.lastUpdatedPl,
            })}
          </Text>

          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              {section.paragraphs.map((p) => (
                <Text key={p.slice(0, 48)} style={[styles.para, { color: colors.textMuted }]}>
                  {p}
                </Text>
              ))}
            </View>
          ))}

          <Pressable
            style={[styles.webBtn, { backgroundColor: colors.primary }]}
            onPress={() => void WebBrowser.openBrowserAsync(LEGAL_CONFIG.privacyPolicyUrl)}>
            <MaterialIcons name="open-in-browser" size={18} color="#FFFFFF" />
            <Text style={styles.webBtnText}>{t('legal.openWeb')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  updated: { fontSize: 12, marginBottom: 6 },
  section: { gap: 6, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  para: { fontSize: 14, lineHeight: 21 },
  webBtn: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
