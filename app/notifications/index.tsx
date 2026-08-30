import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { localeToBcp47 } from '@/lib/i18n';
import type { InAppNotification } from '@/lib/in-app-notifications';
import { markAllInAppNotificationsRead, markInAppNotificationRead } from '@/lib/in-app-notifications';
import { usePreferences } from '@/lib/preferences-context';
import type { AppColors } from '@/lib/theme';
import { getHeaderGradient } from '@/lib/theme';
import { useInAppNotifications } from '@/lib/use-in-app-notifications';
import { useCurrentUserProfile } from '@/lib/user-profile';

function formatWhen(d: Date | null, localeTag: string): string {
  if (!d) return '';
  try {
    return d.toLocaleString(localeTag, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}

function kindIcon(
  kind: InAppNotification['kind']
): 'inbox' | 'flag' | 'chat' | 'work-outline' | 'notifications' {
  switch (kind) {
    case 'application_new':
      return 'inbox';
    case 'application_status':
      return 'flag';
    case 'chat_message':
      return 'chat';
    case 'listing_new':
      return 'work-outline';
    default:
      return 'notifications';
  }
}

function NotificationRow({
  n,
  colors,
  localeTag,
  onPress,
}: {
  n: InAppNotification;
  colors: AppColors;
  localeTag: string;
  onPress: () => void;
}) {
  const unread = !n.read;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: unread ? colors.primaryMuted : colors.card,
          borderColor: unread ? colors.primary : colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: unread ? colors.card : colors.chip },
        ]}>
        <MaterialIcons
          name={kindIcon(n.kind)}
          size={22}
          color={unread ? colors.primary : colors.textSoft}
        />
      </View>
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: unread ? colors.primary : colors.text }]}
            numberOfLines={1}>
            {n.title}
          </Text>
          <Text style={[styles.time, { color: colors.textSoft }]}>
            {formatWhen(n.createdAt, localeTag)}
          </Text>
        </View>
        <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={3}>
          {n.body}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.textSoft} />
    </Pressable>
  );
}

export default function NotificationsCenterScreen() {
  const router = useRouter();
  const { t, locale, colors, theme } = usePreferences();
  const localeTag = localeToBcp47(locale);
  const { uid } = useCurrentUserProfile();
  const { items, loading, unreadCount } = useInAppNotifications(uid ?? undefined);
  const headerGradient = getHeaderGradient(theme);

  const onOpen = useCallback(
    (n: InAppNotification) => {
      if (uid && !n.read) void markInAppNotificationRead(uid, n.id);
      if (n.kind === 'chat_message' && n.conversationId) {
        router.push({ pathname: '/messages/[id]', params: { id: n.conversationId } });
        return;
      }
      if (n.listingId) {
        router.push({ pathname: '/listing/[id]', params: { id: n.listingId } });
        return;
      }
      if (n.kind === 'application_status') {
        router.push('/applications/sent' as never);
        return;
      }
      router.push('/applications/incoming' as never);
    },
    [router, uid]
  );

  const onMarkAll = useCallback(() => {
    if (uid && unreadCount > 0) void markAllInAppNotificationsRead(uid);
  }, [uid, unreadCount]);

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
              <Text style={styles.headerTitle}>{t('notif.title')}</Text>
              {!loading ? (
                <Text style={styles.headerSub}>
                  {items.length} {t('market.results')}
                  {unreadCount > 0 ? ` · ${unreadCount}` : ''}
                </Text>
              ) : null}
            </View>
            {unreadCount > 0 ? (
              <Pressable onPress={onMarkAll} style={styles.markAllBtn}>
                <Text style={[styles.markAllText, { color: '#FFFFFF' }]}>{t('notif.markRead')}</Text>
              </Pressable>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.note, { color: colors.textMuted }]}>{t('common.loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(n) => n.id}
              contentContainerStyle={[styles.list, items.length === 0 && styles.listEmpty]}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View
                  style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}>
                    <MaterialIcons name="notifications-none" size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('notif.empty')}</Text>
                </View>
              }
              renderItem={({ item }) => (
                <NotificationRow
                  n={item}
                  colors={colors}
                  localeTag={localeTag}
                  onPress={() => onOpen(item)}
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
    gap: 10,
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
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  markAllText: { fontWeight: '700', fontSize: 12 },
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
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontWeight: '700', fontSize: 14 },
  time: { fontSize: 11, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 18 },
});
