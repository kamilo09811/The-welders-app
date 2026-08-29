import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApplicationListItem } from '@/components/application-list-item';
import { usePreferences } from '@/lib/preferences-context';
import { getHeaderGradient } from '@/lib/theme';
import { useApplicationsByAuthor } from '@/lib/use-listing-applications';
import { useCurrentUserProfile } from '@/lib/user-profile';

export default function IncomingApplicationsScreen() {
  const router = useRouter();
  const { uid } = useCurrentUserProfile();
  const { t, colors, locale, theme } = usePreferences();
  const { applications, loading } = useApplicationsByAuthor(uid ?? undefined);
  const headerGradient = getHeaderGradient(theme);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={[...headerGradient]} locations={[0, 0.55]} style={styles.bgGlow} />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{t('apps.incomingTitle')}</Text>
              {!loading ? (
                <Text style={styles.headerSub}>
                  {applications.length} {t('market.results')}
                </Text>
              ) : null}
            </View>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.note, { color: colors.textMuted }]}>{t('common.loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={applications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.list,
                applications.length === 0 && styles.listEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              ListEmptyComponent={
                <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}>
                    <MaterialIcons name="inbox" size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {t('apps.incomingEmpty')}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <ApplicationListItem
                  app={item}
                  variant="incoming"
                  colors={colors}
                  locale={locale}
                  t={t}
                  onPress={() =>
                    router.push({ pathname: '/listing/[id]', params: { id: item.listingId } })
                  }
                />
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgGlow: { position: 'absolute', left: 0, right: 0, top: 0, height: 160 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  note: { fontSize: 13 },
  empty: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
});
