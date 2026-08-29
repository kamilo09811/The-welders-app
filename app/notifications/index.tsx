import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { localeToBcp47 } from '@/lib/i18n';
import type { InAppNotification } from '@/lib/in-app-notifications';
import { markAllInAppNotificationsRead, markInAppNotificationRead } from '@/lib/in-app-notifications';
import { usePreferences } from '@/lib/preferences-context';
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

function kindIcon(kind: InAppNotification['kind']): 'inbox' | 'flag' | 'chat' | 'work-outline' | 'notifications' {
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

export default function NotificationsCenterScreen() {
  const router = useRouter();
  const { t, locale } = usePreferences();
  const localeTag = localeToBcp47(locale);
  const { uid } = useCurrentUserProfile();
  const { items, loading, unreadCount } = useInAppNotifications(uid ?? undefined);

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

  const renderItem = useCallback(
    ({ item: n }: { item: InAppNotification }) => (
      <Pressable
        style={[styles.row, !n.read && styles.rowUnread]}
        onPress={() => onOpen(n)}>
        <View style={[styles.iconWrap, !n.read && styles.iconWrapUnread]}>
          <MaterialIcons name={kindIcon(n.kind)} size={22} color={n.read ? '#64748B' : '#0E4AA4'} />
        </View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !n.read && styles.titleUnread]} numberOfLines={1}>
              {n.title}
            </Text>
            <Text style={styles.time}>{formatWhen(n.createdAt, localeTag)}</Text>
          </View>
          <Text style={styles.body} numberOfLines={3}>
            {n.body}
          </Text>
        </View>
      </Pressable>
    ),
    [localeTag, onOpen]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('notif.title')}</Text>
          {unreadCount > 0 ? (
            <Pressable onPress={onMarkAll} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>{t('notif.markRead')}</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {loading ? (
          <View style={styles.card}>
            <Text style={styles.note}>{t('common.loading')}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.note}>{t('notif.empty')}</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(n) => n.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DEEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, color: '#0F172A', fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 72 },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  markAllText: { color: '#0E4AA4', fontWeight: '700', fontSize: 12 },
  list: { padding: 16, paddingBottom: 32, gap: 10 },
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
  },
  note: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 12,
  },
  rowUnread: { borderColor: '#BFDBFE', backgroundColor: '#F8FAFC' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: { backgroundColor: '#EFF6FF' },
  textCol: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: '#0F172A', fontWeight: '700', fontSize: 14 },
  titleUnread: { color: '#0E4AA4' },
  time: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  body: { color: '#475569', fontSize: 13, lineHeight: 18 },
});
