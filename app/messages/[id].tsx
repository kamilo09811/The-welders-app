import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import {
  markConversationRead,
  sendConversationImageMessage,
  sendConversationMessage,
  type ChatMessage,
} from '@/lib/chat';
import { uploadChatImagePair } from '@/lib/chatMedia';
import { useConversation, useConversationMessagesPaged } from '@/lib/use-chat';
import { useCurrentUserProfile } from '@/lib/user-profile';

function formatMsgTime(d: Date | null): string {
  if (!d) return '';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return time;
  return `${d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}, ${time}`;
}

export default function ConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = typeof idParam === 'string' ? idParam : undefined;
  const { uid, profile } = useCurrentUserProfile();
  const { conversation } = useConversation(id);
  const { messages, loading, loadingOlder, hasMoreOlder, loadOlder } = useConversationMessagesPaged(id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const composerBottomPad = Math.max(insets.bottom, 8) + 10;

  const otherId = useMemo(() => {
    if (!uid || !conversation) return '';
    return conversation.participantIds.find((p) => p !== uid) || conversation.participantIds[0] || '';
  }, [conversation, uid]);
  const otherName = (otherId && conversation?.participantNames[otherId]) || 'Użytkownik';
  const otherAvatar = (otherId && conversation?.participantAvatars[otherId]) || '';
  const myAvatar = uid ? conversation?.participantAvatars[uid] || profile.avatarUrl || '' : '';

  const flatData = useMemo(() => [...messages].reverse(), [messages]);

  const tailId = messages.length ? messages[messages.length - 1]!.id : '';
  const tailSender = messages.length ? messages[messages.length - 1]!.senderId : '';

  useEffect(() => {
    if (!uid || !id) return;
    if (!tailId) {
      void markConversationRead(id, uid);
      return;
    }
    if (tailSender !== uid) void markConversationRead(id, uid);
  }, [id, uid, tailId, tailSender]);

  const onSend = async () => {
    if (!uid || !id || !text.trim() || sending || uploadingImage) return;
    setSending(true);
    setFeedback(null);
    try {
      await sendConversationMessage(id, uid, text);
      setText('');
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Nie udało się wysłać wiadomości.');
    } finally {
      setSending(false);
    }
  };

  const uploadAndSendImage = useCallback(
    async (localUri: string) => {
      if (!uid || !id) return;
      setUploadingImage(true);
      setFeedback(null);
      try {
        const { imageUrl, thumbUrl } = await uploadChatImagePair({
          conversationId: id,
          uid,
          localUri,
        });
        await sendConversationImageMessage(id, uid, text.trim(), imageUrl, thumbUrl);
        setText('');
      } catch (e) {
        setFeedback(e instanceof Error ? e.message : 'Nie udało się wysłać zdjęcia.');
      } finally {
        setUploadingImage(false);
      }
    },
    [id, uid, text]
  );

  const onAttachPress = useCallback(() => {
    if (!uid || !id || uploadingImage || sending) return;
    Alert.alert('Załącznik', 'Wybierz źródło zdjęcia', [
      {
        text: 'Galeria',
        onPress: () => {
          void (async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              setFeedback('Brak dostępu do galerii.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.85,
              allowsEditing: false,
            });
            if (result.canceled || !result.assets?.[0]?.uri) return;
            await uploadAndSendImage(result.assets[0].uri);
          })();
        },
      },
      {
        text: 'Aparat',
        onPress: () => {
          void (async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              setFeedback('Brak dostępu do aparatu.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.85,
              allowsEditing: false,
            });
            if (result.canceled || !result.assets?.[0]?.uri) return;
            await uploadAndSendImage(result.assets[0].uri);
          })();
        },
      },
      { text: 'Anuluj', style: 'cancel' },
    ]);
  }, [id, uid, uploadingImage, sending, uploadAndSendImage]);

  const renderItem = useCallback(
    ({ item: m }: { item: ChatMessage }) => {
      const mine = m.senderId === uid;
      const isImage = m.kind === 'image' && (m.imageUrl || m.imageThumbUrl);
      const avatarUrl = mine ? myAvatar : otherAvatar;
      const senderId = mine ? uid || '' : otherId;
      return (
        <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
          {!mine ? (
            <UserAvatarPressable userId={senderId} avatarUrl={avatarUrl} size={28} style={styles.msgAvatar} />
          ) : (
            <View style={styles.msgAvatarSpacer} />
          )}
          <View style={[styles.msgCol, mine && styles.msgColMine]}>
            <View style={[styles.msgBubble, mine ? styles.msgMine : styles.msgOther]}>
              {isImage ? (
                <Pressable onPress={() => setPreviewUri(m.imageUrl || m.imageThumbUrl || null)}>
                  <Image
                    source={{ uri: m.imageThumbUrl || m.imageUrl }}
                    style={styles.msgImage}
                    contentFit="cover"
                  />
                </Pressable>
              ) : null}
              {m.text ? (
                <Text style={[styles.msgText, mine && styles.msgTextMine, isImage && styles.msgCaption]}>
                  {m.text}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>{formatMsgTime(m.createdAt)}</Text>
          </View>
          {mine ? (
            <UserAvatarPressable userId={senderId} avatarUrl={avatarUrl} size={28} style={styles.msgAvatar} />
          ) : (
            <View style={styles.msgAvatarSpacer} />
          )}
        </View>
      );
    },
    [uid, myAvatar, otherAvatar, otherId]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
          </Pressable>
          {otherId ? (
            <UserAvatarPressable userId={otherId} avatarUrl={otherAvatar} size={40} />
          ) : (
            <View style={styles.avatarWrap}>
              <MaterialIcons name="person" size={18} color="#64748B" />
            </View>
          )}
          <Pressable
            style={styles.headerTextWrap}
            disabled={!otherId}
            onPress={() => otherId && router.push({ pathname: '/user/[id]', params: { id: otherId } })}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {otherName}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {conversation?.listingTitle || 'Rozmowa o ogłoszeniu'}
            </Text>
          </Pressable>
          {otherId ? (
            <Pressable
              style={styles.profileBtn}
              onPress={() => router.push({ pathname: '/user/[id]', params: { id: otherId } })}>
              <MaterialIcons name="person-outline" size={20} color="#0E4AA4" />
            </Pressable>
          ) : null}
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {loading ? (
            <View style={styles.centerNote}>
              <ActivityIndicator color="#0E4AA4" />
              <Text style={styles.note}>Ładowanie wiadomości…</Text>
            </View>
          ) : (
            <FlatList
              data={flatData}
              inverted
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onEndReached={() => {
                void loadOlder();
              }}
              onEndReachedThreshold={0.25}
              ListFooterComponent={
                loadingOlder ? (
                  <View style={styles.olderLoading}>
                    <ActivityIndicator color="#0E4AA4" />
                    <Text style={styles.olderLoadingText}>Starsze wiadomości…</Text>
                  </View>
                ) : hasMoreOlder && messages.length > 0 ? (
                  <Text style={styles.hintTop}>Przewiń wyżej, by wczytać historię</Text>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIcon}>
                    <MaterialIcons name="chat-bubble-outline" size={28} color="#0E4AA4" />
                  </View>
                  <Text style={styles.emptyTitle}>Zacznij rozmowę</Text>
                  <Text style={styles.note}>
                    Napisz wiadomość albo dołącz zdjęcie z galerii / aparatu.
                  </Text>
                </View>
              }
            />
          )}

          {feedback ? (
            <Pressable style={styles.feedbackBar} onPress={() => setFeedback(null)}>
              <MaterialIcons name="error-outline" size={16} color="#B91C1C" />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </Pressable>
          ) : null}

          <View style={[styles.composer, { paddingBottom: composerBottomPad }]}>
            <Pressable
              style={[styles.iconBtn, (uploadingImage || sending) && styles.iconBtnDisabled]}
              onPress={onAttachPress}
              disabled={uploadingImage || sending}
              accessibilityLabel="Dodaj załącznik">
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#0E4AA4" />
              ) : (
                <MaterialIcons name="attach-file" size={22} color="#0E4AA4" />
              )}
            </Pressable>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={uploadingImage ? 'Wysyłanie zdjęcia…' : 'Napisz wiadomość…'}
              placeholderTextColor="#94A3B8"
              editable={!uploadingImage}
              multiline
              maxLength={4000}
            />
            <Pressable
              style={[styles.sendBtn, (sending || uploadingImage || !text.trim()) && styles.sendBtnDisabled]}
              onPress={() => void onSend()}
              disabled={sending || uploadingImage || !text.trim()}>
              <MaterialIcons name="send" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={Boolean(previewUri)} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPreviewUri(null)}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.modalImage} contentFit="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EEF6' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6F2',
    backgroundColor: '#FFFFFF',
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
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#64748B', fontSize: 12, marginTop: 1 },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DFE6F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 10, flexGrow: 1 },
  centerNote: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  note: { color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  emptyWrap: { padding: 28, alignItems: 'center', gap: 8 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { color: '#0F172A', fontWeight: '800', fontSize: 15 },
  olderLoading: { paddingVertical: 12, alignItems: 'center', gap: 6 },
  olderLoadingText: { color: '#64748B', fontSize: 11 },
  hintTop: { color: '#94A3B8', fontSize: 11, textAlign: 'center', paddingBottom: 8 },
  msgRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: { marginBottom: 16 },
  msgAvatarSpacer: { width: 28 },
  msgCol: { maxWidth: '72%', gap: 3 },
  msgColMine: { alignItems: 'flex-end' },
  msgBubble: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8 },
  msgMine: { backgroundColor: '#0E4AA4', borderBottomRightRadius: 4 },
  msgOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6F2',
    borderBottomLeftRadius: 4,
  },
  msgImage: { width: 200, height: 150, borderRadius: 10, backgroundColor: '#E2E8F0' },
  msgText: { color: '#334155', fontSize: 14, lineHeight: 20 },
  msgCaption: { marginTop: 6 },
  msgTextMine: { color: '#FFFFFF' },
  msgTime: { color: '#94A3B8', fontSize: 10, paddingHorizontal: 4 },
  msgTimeMine: { textAlign: 'right' },
  feedbackBar: {
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackText: { color: '#B91C1C', fontSize: 12, flex: 1 },
  composer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#DFE6F2',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: { opacity: 0.5 },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 12,
    backgroundColor: '#F8FAFD',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0E4AA4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.45 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalImage: { width: '100%', height: '88%' },
});
