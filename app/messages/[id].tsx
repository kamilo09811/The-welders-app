import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { markConversationRead, sendConversationImageMessage, sendConversationMessage, type ChatMessage } from '@/lib/chat';
import { uploadChatImagePair } from '@/lib/chatMedia';
import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { useUserConversations, useConversationMessagesPaged } from '@/lib/use-chat';
import { useCurrentUserProfile } from '@/lib/user-profile';

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { uid } = useCurrentUserProfile();
  const { conversations } = useUserConversations(uid ?? undefined);
  const { messages, loading, loadingOlder, hasMoreOlder, loadOlder } = useConversationMessagesPaged(id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const conversation = useMemo(() => conversations.find((c) => c.id === id), [conversations, id]);
  const otherId = useMemo(() => {
    if (!uid || !conversation) return '';
    return conversation.participantIds.find((p) => p !== uid) || conversation.participantIds[0] || '';
  }, [conversation, uid]);
  const otherName = (otherId && conversation?.participantNames[otherId]) || 'Użytkownik';
  const otherAvatar = (otherId && conversation?.participantAvatars[otherId]) || '';

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
    if (!uid || !id || !text.trim()) return;
    setSending(true);
    try {
      await sendConversationMessage(id, uid, text);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const onPickImage = useCallback(async () => {
    if (!uid || !id || uploadingImage) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingImage(true);
    try {
      const { imageUrl, thumbUrl } = await uploadChatImagePair({
        conversationId: id,
        uid,
        localUri: result.assets[0].uri,
      });
      await sendConversationImageMessage(id, uid, text.trim(), imageUrl, thumbUrl);
      setText('');
    } finally {
      setUploadingImage(false);
    }
  }, [id, uid, text, uploadingImage]);

  const renderItem = useCallback(
    ({ item: m }: { item: ChatMessage }) => {
      const mine = m.senderId === uid;
      const isImage = m.kind === 'image' && (m.imageUrl || m.imageThumbUrl);
      return (
        <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
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
        </View>
      );
    },
    [uid]
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
            <UserAvatarPressable userId={otherId} avatarUrl={otherAvatar} size={36} />
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
              {conversation?.listingTitle || 'Rozmowa'}
            </Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {loading ? (
            <View style={styles.centerNote}>
              <Text style={styles.note}>Ładowanie wiadomości...</Text>
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
              ListEmptyComponent={<Text style={styles.note}>Brak wiadomości. Napisz pierwszą.</Text>}
            />
          )}

          <View style={styles.composer}>
            <Pressable
              style={[styles.iconBtn, (uploadingImage || sending) && styles.iconBtnDisabled]}
              onPress={() => void onPickImage()}
              disabled={uploadingImage || sending}>
              <MaterialIcons name="image" size={22} color="#0E4AA4" />
            </Pressable>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={uploadingImage ? 'Wysyłanie zdjęcia…' : 'Wiadomość lub podpis do zdjęcia…'}
              placeholderTextColor="#94A3B8"
              editable={!uploadingImage}
            />
            <Pressable
              style={[styles.sendBtn, (sending || uploadingImage) && styles.sendBtnDisabled]}
              onPress={onSend}
              disabled={sending || uploadingImage}>
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
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  headerTextWrap: { flex: 1 },
  headerTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#64748B', fontSize: 12, marginTop: 1 },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DFE6F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexGrow: 1 },
  centerNote: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  note: { color: '#64748B', fontSize: 12, textAlign: 'center', padding: 16 },
  olderLoading: { paddingVertical: 12, alignItems: 'center', gap: 6 },
  olderLoadingText: { color: '#64748B', fontSize: 11 },
  hintTop: { color: '#94A3B8', fontSize: 11, textAlign: 'center', paddingBottom: 8 },
  msgRow: { width: '100%', flexDirection: 'row' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '84%', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  msgMine: { backgroundColor: '#0E4AA4' },
  msgOther: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DFE6F2' },
  msgImage: { width: 220, height: 160, borderRadius: 8, backgroundColor: '#E2E8F0' },
  msgText: { color: '#334155', marginTop: 4 },
  msgCaption: { marginTop: 6 },
  msgTextMine: { color: '#FFFFFF' },
  composer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#DFE6F2',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: { opacity: 0.5 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 11,
    backgroundColor: '#F8FAFD',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#0E4AA4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.65 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalImage: { width: '100%', height: '88%' },
});
