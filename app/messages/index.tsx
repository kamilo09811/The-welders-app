import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { isConversationMutedForUser, isConversationUnreadForUser, setConversationMuted } from '@/lib/chat';
import { useUserConversations } from '@/lib/use-chat';
import { getPublicUserInfo, useCurrentUserProfile } from '@/lib/user-profile';

function formatListTime(d: Date | null): string {
  if (!d) return '';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

export default function MessagesScreen() {
  const router = useRouter();
  const { uid } = useCurrentUserProfile();
  const { conversations, loading, unreadCount } = useUserConversations(uid ?? undefined);
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});
  const [resolvedAvatars, setResolvedAvatars] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherParticipantId = useCallback((participantIds: string[]) => {
    if (!uid) return '';
    const direct = participantIds.find((p) => p && p !== uid);
    if (direct) return direct;
    return '';
  }, [uid]);

  useEffect(() => {
    let cancelled = false;
    if (!uid || conversations.length === 0) {
      setResolvedNames({});
      setResolvedAvatars({});
      return;
    }
    const run = async () => {
      const updatesName: Record<string, string> = {};
      const updatesAvatar: Record<string, string> = {};
      for (const c of conversations) {
        const otherId = getOtherParticipantId(c.participantIds);
        if (!otherId) continue;
        const hasName = Boolean(c.participantNames?.[otherId]);
        const hasAvatar = Boolean(c.participantAvatars?.[otherId]);
        if (hasName && hasAvatar) continue;
        const info = await getPublicUserInfo(otherId);
        updatesName[otherId] = info.fullName || '';
        updatesAvatar[otherId] = info.avatarUrl || '';
      }
      if (!cancelled) {
        setResolvedNames((prev) => ({ ...prev, ...updatesName }));
        setResolvedAvatars((prev) => ({ ...prev, ...updatesAvatar }));
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [conversations, getOtherParticipantId, uid]);

  const visibleConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const otherId = getOtherParticipantId(c.participantIds);
      const otherNameFromParticipants = otherId ? c.participantNames?.[otherId] : '';
      const otherNameFromMap =
        Object.entries(c.participantNames || {}).find(([key]) => key !== uid)?.[1] || '';
      const otherName =
        otherNameFromParticipants ||
        otherNameFromMap ||
        (otherId ? resolvedNames[otherId] : '') ||
        c.listingTitle ||
        'Użytkownik';
      const hay = `${otherName} ${c.listingTitle || ''} ${c.lastMessageText || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, getOtherParticipantId, resolvedNames, searchQuery, uid]);

  const onLongPressRow = useCallback(
    (c: (typeof conversations)[0], otherName: string) => {
      if (!uid) return;
      const muted = isConversationMutedForUser(c, uid);
      Alert.alert(
        otherName,
        muted
          ? 'Odciszyć ten wątek? Znowu będziesz widzieć licznik nieprzeczytanych.'
          : 'Wyciszyć wątek? Nie zobaczysz czerwonego badge przy nowych wiadomościach z tej rozmowy.',
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: muted ? 'Odcisz' : 'Wycisz',
            style: muted ? 'default' : 'destructive',
            onPress: () => void setConversationMuted(c.id, uid, !muted),
          },
        ]
      );
    },
    [uid]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
            </Pressable>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Wiadomości</Text>
              {unreadCount > 0 ? (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Szukaj po nazwie, ogłoszeniu lub treści…"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {loading ? (
            <View style={styles.card}>
              <Text style={styles.note}>Ładowanie rozmów...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.note}>Brak rozmów. Otwórz ogłoszenie i rozpocznij kontakt.</Text>
            </View>
          ) : visibleConversations.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.note}>Brak wyników dla „{searchQuery.trim()}”.</Text>
            </View>
          ) : (
            visibleConversations.map((c) => {
              const unread = uid ? isConversationUnreadForUser(c, uid) : false;
              const muted = uid ? isConversationMutedForUser(c, uid) : false;
              return (
              <Pressable
                key={c.id}
                style={[styles.row, unread && styles.rowUnread, muted && styles.rowMuted]}
                onPress={() => router.push({ pathname: '/messages/[id]', params: { id: c.id } })}
                onLongPress={() => {
                  const otherId = getOtherParticipantId(c.participantIds);
                  const otherNameFromParticipants = otherId ? c.participantNames?.[otherId] : '';
                  const otherNameFromMap =
                    Object.entries(c.participantNames || {}).find(([key]) => key !== uid)?.[1] || '';
                  const otherName =
                    otherNameFromParticipants ||
                    otherNameFromMap ||
                    resolvedNames[otherId] ||
                    c.listingTitle ||
                    'Użytkownik';
                  onLongPressRow(c, otherName);
                }}
                delayLongPress={450}>
                {(() => {
                  const otherId = getOtherParticipantId(c.participantIds);
                  const otherAvatar = c.participantAvatars?.[otherId] || resolvedAvatars[otherId] || '';
                  const otherNameFromParticipants = otherId ? c.participantNames?.[otherId] : '';
                  const otherNameFromMap =
                    Object.entries(c.participantNames || {}).find(([key]) => key !== uid)?.[1] || '';
                  const otherName =
                    otherNameFromParticipants ||
                    otherNameFromMap ||
                    resolvedNames[otherId] ||
                    c.listingTitle ||
                    'Użytkownik';
                  return (
                    <>
                <View style={styles.avatarOuter}>
                  {otherId ? (
                    <UserAvatarPressable userId={otherId} avatarUrl={otherAvatar} size={42} />
                  ) : (
                    <View style={styles.avatarInner}>
                      <MaterialIcons name="person" size={18} color="#64748B" />
                    </View>
                  )}
                  {unread ? <View style={styles.rowUnreadDot} /> : null}
                </View>
                <View style={styles.textCol}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowTitle, unread && styles.rowTitleUnread]} numberOfLines={1}>
                      {otherName}
                    </Text>
                    <View style={styles.rowIcons}>
                      <Text style={[styles.rowTime, unread && styles.rowTimeUnread]}>
                        {formatListTime(c.lastMessageAt)}
                      </Text>
                      {muted ? <MaterialIcons name="notifications-off" size={16} color="#94A3B8" /> : null}
                    </View>
                  </View>
                  <Text style={styles.rowListing} numberOfLines={1}>
                    {c.listingTitle || 'Ogłoszenie'}
                  </Text>
                  <Text style={[styles.rowSub, unread && styles.rowSubUnread]} numberOfLines={1}>
                    {c.lastMessageText || 'Brak wiadomości — napisz pierwszą'}
                  </Text>
                </View>
                    </>
                  );
                })()}
              </Pressable>
            );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#DFE6F2', padding: 14 },
  note: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 12,
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rowUnread: { borderColor: '#BFDBFE', backgroundColor: '#F8FAFC' },
  rowMuted: { opacity: 0.78 },
  avatarOuter: {
    width: 42,
    height: 42,
    marginRight: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DFE6F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowUnreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarImage: { width: '100%', height: '100%' },
  textCol: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  rowIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { color: '#0F172A', fontWeight: '700', flex: 1, marginRight: 8 },
  rowTitleUnread: { color: '#0E4AA4' },
  rowTime: { color: '#94A3B8', fontSize: 11 },
  rowTimeUnread: { color: '#0E4AA4', fontWeight: '700' },
  rowListing: { color: '#64748B', fontSize: 11 },
  rowSub: { color: '#64748B', fontSize: 12, flex: 1 },
  rowSubUnread: { color: '#334155', fontWeight: '600' },
});
