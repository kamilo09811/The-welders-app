import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { TabTipCard } from '@/components/tab-tip-card';
import {
  isConversationMutedForUser,
  isConversationUnreadForUser,
  setConversationMuted,
  type ChatConversation,
} from '@/lib/chat';
import { localeToBcp47 } from '@/lib/i18n';
import { usePreferences } from '@/lib/preferences-context';
import { getChatsGradient } from '@/lib/theme';
import { useUserConversations } from '@/lib/use-chat';
import { getPublicUserInfo, useCurrentUserProfile } from '@/lib/user-profile';

function formatListTime(d: Date | null, localeTag: string): string {
  if (!d) return '';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return '—';
  }
  return d.toLocaleDateString(localeTag, { day: 'numeric', month: 'short' });
}

function previewLabel(
  text: string,
  uid: string | undefined,
  senderId: string,
  emptyLabel: string,
  youPrefix: string
): string {
  const raw = text.trim();
  if (!raw) return emptyLabel;
  const mine = Boolean(uid && senderId && senderId === uid);
  const body = raw.startsWith('📷') ? raw : raw;
  return mine ? `${youPrefix} ${body}` : body;
}

type Props = {
  showBack?: boolean;
};

export function MessagesInbox({ showBack = false }: Props) {
  const router = useRouter();
  const { uid } = useCurrentUserProfile();
  const { colors, t, locale, theme } = usePreferences();
  const localeTag = localeToBcp47(locale);
  const { conversations, loading, unreadCount } = useUserConversations(uid ?? undefined);
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});
  const [resolvedAvatars, setResolvedAvatars] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherParticipantId = useCallback(
    (participantIds: string[]) => {
      if (!uid) return '';
      return participantIds.find((p) => p && p !== uid) || '';
    },
    [uid]
  );

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

  const resolveOtherName = useCallback(
    (c: ChatConversation, otherId: string) => {
      const fromMap = otherId ? c.participantNames?.[otherId] : '';
      const fallback =
        Object.entries(c.participantNames || {}).find(([key]) => key !== uid)?.[1] || '';
      return fromMap || fallback || resolvedNames[otherId] || c.listingTitle || t('chats.user');
    },
    [resolvedNames, uid]
  );

  const visibleConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const otherId = getOtherParticipantId(c.participantIds);
      const otherName = resolveOtherName(c, otherId);
      const hay = `${otherName} ${c.listingTitle || ''} ${c.lastMessageText || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, getOtherParticipantId, resolveOtherName, searchQuery]);

  const onLongPressRow = useCallback(
    (c: ChatConversation, otherName: string) => {
      if (!uid) return;
      const muted = isConversationMutedForUser(c, uid);
      Alert.alert(
        otherName,
        muted ? t('chats.unmuteTitle') : t('chats.muteTitle'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: muted ? t('chats.unmute') : t('chats.mute'),
            style: muted ? 'default' : 'destructive',
            onPress: () => void setConversationMuted(c.id, uid, !muted),
          },
        ]
      );
    },
    [uid, t]
  );

  const renderItem = useCallback(
    ({ item: c, index }: { item: ChatConversation; index: number }) => {
      const unread = uid ? isConversationUnreadForUser(c, uid) : false;
      const muted = uid ? isConversationMutedForUser(c, uid) : false;
      const otherId = getOtherParticipantId(c.participantIds);
      const otherAvatar = c.participantAvatars?.[otherId] || resolvedAvatars[otherId] || '';
      const otherName = resolveOtherName(c, otherId);
      const preview = previewLabel(
        c.lastMessageText || '',
        uid ?? undefined,
        c.lastMessageSenderId,
        t('chats.writeFirst'),
        t('chats.youPrefix')
      );
      const isFirst = index === 0;
      const isLast = index === visibleConversations.length - 1;

      return (
        <Pressable
          onPress={() => router.push({ pathname: '/messages/[id]', params: { id: c.id } })}
          onLongPress={() => onLongPressRow(c, otherName)}
          delayLongPress={450}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: unread ? colors.primaryMuted : colors.card,
            },
            muted && styles.rowMuted,
            pressed && { backgroundColor: colors.chip },
            isFirst && styles.rowFirst,
            isLast && styles.rowLast,
          ]}>
          <View style={styles.avatarOuter}>
            {otherId ? (
              <UserAvatarPressable userId={otherId} avatarUrl={otherAvatar} size={52} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.chip }]}>
                <MaterialIcons name="person" size={22} color={colors.textSoft} />
              </View>
            )}
            {unread ? (
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: colors.primary, borderColor: colors.card },
                ]}
              />
            ) : null}
          </View>

          <View style={styles.textCol}>
            <View style={styles.rowTop}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.text },
                  unread && styles.rowTitleUnread,
                ]}
                numberOfLines={1}>
                {otherName}
              </Text>
              <Text
                style={[
                  styles.rowTime,
                  { color: colors.textSoft },
                  unread && { color: colors.primary, fontWeight: '700' },
                ]}>
                {formatListTime(c.lastMessageAt, localeTag)}
              </Text>
            </View>

            {c.listingTitle ? (
              <View style={[styles.listingChip, { backgroundColor: colors.primaryMuted }]}>
                <MaterialIcons name="work-outline" size={12} color={colors.primary} />
                <Text style={[styles.listingChipText, { color: colors.primary }]} numberOfLines={1}>
                  {c.listingTitle}
                </Text>
              </View>
            ) : null}

            <View style={styles.previewRow}>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.textSoft },
                  unread && { color: colors.textMuted, fontWeight: '600' },
                ]}
                numberOfLines={2}>
                {preview}
              </Text>
              <View style={styles.previewMeta}>
                {muted ? (
                  <MaterialIcons name="notifications-off" size={15} color={colors.textSoft} />
                ) : null}
                {unread ? (
                  <View style={[styles.unreadPill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadPillText}>{t('chats.newBadge')}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [
      uid,
      getOtherParticipantId,
      resolvedAvatars,
      resolveOtherName,
      router,
      onLongPressRow,
      visibleConversations.length,
      localeTag,
      colors,
      t,
    ]
  );

  const listHeader = (
    <View style={styles.topBlock}>
      <LinearGradient colors={[...getChatsGradient(theme)]} style={styles.hero}>
        <View style={styles.heroRow}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>{t('chats.title')}</Text>
            <Text style={styles.heroSub}>
              {loading
                ? t('common.loading')
                : unreadCount > 0
                  ? `${unreadCount} ${t('chats.unread')}`
                  : conversations.length === 0
                    ? t('chats.noneActive')
                    : `${conversations.length} ${conversations.length === 1 ? t('chats.conversation') : t('chats.conversations')}`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.textSoft} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('chats.search')}
          placeholderTextColor={colors.textSoft}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={colors.textSoft} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <TabTipCard tipId="chats" />
      </View>
    </View>
  );

  const empty = (
    <View
      style={[
        styles.empty,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}>
      {loading ? (
        <>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chats.loadingChats')}</Text>
        </>
      ) : searchQuery.trim() ? (
        <>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}>
            <MaterialIcons name="search-off" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chats.noneFound')}</Text>
          <Text style={[styles.emptySub, { color: colors.textSoft }]}>{t('chats.noneFoundSub')}</Text>
        </>
      ) : (
        <>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}>
            <MaterialIcons name="forum" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chats.empty')}</Text>
          <Text style={[styles.emptySub, { color: colors.textSoft }]}>{t('chats.emptySub')}</Text>
          <Pressable
            style={[styles.emptyCta, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)' as never)}>
            <Text style={styles.emptyCtaText}>{t('chats.goToMarket')}</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
          </Pressable>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
      <FlatList
        data={loading ? [] : visibleConversations}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 28, flexGrow: 1 },
  topBlock: { marginBottom: 8 },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: { flex: 1, gap: 2 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  heroSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: '500' },
  searchWrap: {
    marginTop: -14,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  row: {
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  rowMuted: { opacity: 0.72 },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
    marginRight: 24,
  },
  avatarOuter: {
    width: 52,
    height: 52,
    position: 'relative',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  textCol: { flex: 1, gap: 4, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { fontWeight: '700', fontSize: 16, flex: 1 },
  rowTitleUnread: { fontWeight: '800' },
  rowTime: { fontSize: 12, fontWeight: '500' },
  listingChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  listingChipText: { fontSize: 11, fontWeight: '600', flexShrink: 1 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rowSub: { fontSize: 13, lineHeight: 18, flex: 1 },
  previewMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 1 },
  unreadPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  empty: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptySub: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
  emptyCta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
