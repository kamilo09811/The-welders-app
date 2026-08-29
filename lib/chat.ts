import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';

/** Liczba najnowszych wiadomości z nasłuchu na żywo + rozmiar strony przy dociąganiu historii. */
export const CHAT_MESSAGE_PAGE_SIZE = 35;

export type ChatConversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessageText: string;
  lastMessageAt: Date | null;
  lastMessageSenderId: string;
  readAt: Record<string, Date | null>;
  /** Wyciszenie wątku tylko dla danego użytkownika (badge / lista). */
  mutedBy: Record<string, boolean>;
};

export type ChatMessageKind = 'text' | 'image';

export type ChatMessage = {
  id: string;
  senderId: string;
  kind: ChatMessageKind;
  text: string;
  imageUrl?: string;
  imageThumbUrl?: string;
  createdAt: Date | null;
};

type FirestoreConversation = Omit<ChatConversation, 'id' | 'lastMessageAt' | 'readAt' | 'mutedBy'> & {
  pairKey: string;
  lastMessageAt?: Timestamp;
  readAt?: Record<string, Timestamp>;
  mutedBy?: Record<string, boolean>;
};

type FirestoreMessage = {
  senderId?: string;
  kind?: ChatMessageKind;
  text?: string;
  imageUrl?: string;
  imageThumbUrl?: string;
  createdAt?: Timestamp;
};

function conversationsCol() {
  return collection(getFirebaseFirestore(), 'conversations');
}

function messagesCol(conversationId: string) {
  return collection(getFirebaseFirestore(), 'conversations', conversationId, 'messages');
}

function normalizeReadAt(raw: unknown): Record<string, Date | null> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, Date | null> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v && typeof (v as Timestamp).toDate === 'function') {
      out[k] = (v as Timestamp).toDate();
    }
  }
  return out;
}

function normalizeMutedBy(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === true) out[k] = true;
  }
  return out;
}

function normalizeConversation(id: string, data: FirestoreConversation): ChatConversation {
  return {
    id,
    listingId: data.listingId || '',
    listingTitle: data.listingTitle || '',
    participantIds: Array.isArray(data.participantIds) ? data.participantIds.filter((v): v is string => typeof v === 'string') : [],
    participantNames: typeof data.participantNames === 'object' && data.participantNames ? data.participantNames : {},
    participantAvatars: typeof data.participantAvatars === 'object' && data.participantAvatars ? data.participantAvatars : {},
    lastMessageText: data.lastMessageText || '',
    lastMessageAt: data.lastMessageAt?.toDate?.() ?? null,
    lastMessageSenderId: typeof data.lastMessageSenderId === 'string' ? data.lastMessageSenderId : '',
    readAt: normalizeReadAt(data.readAt),
    mutedBy: normalizeMutedBy((data as { mutedBy?: unknown }).mutedBy),
  };
}

export function isConversationMutedForUser(c: ChatConversation, userId: string): boolean {
  return Boolean(userId && c.mutedBy?.[userId]);
}

export function isConversationUnreadForUser(c: ChatConversation, userId: string): boolean {
  if (isConversationMutedForUser(c, userId)) return false;
  if (!userId || !c.lastMessageAt) return false;
  if (!c.lastMessageText?.trim()) return false;
  if (!c.lastMessageSenderId || c.lastMessageSenderId === userId) return false;
  const myRead = c.readAt[userId];
  if (!myRead) return true;
  return myRead.getTime() < c.lastMessageAt.getTime();
}

export function countUnreadConversations(items: ChatConversation[], userId: string): number {
  if (!userId) return 0;
  return items.reduce((n, c) => n + (isConversationUnreadForUser(c, userId) ? 1 : 0), 0);
}

export function normalizeMessage(id: string, data: FirestoreMessage): ChatMessage {
  const kind: ChatMessageKind = data.kind === 'image' ? 'image' : 'text';
  return {
    id,
    senderId: data.senderId || '',
    kind,
    text: typeof data.text === 'string' ? data.text : '',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    imageThumbUrl: typeof data.imageThumbUrl === 'string' ? data.imageThumbUrl : undefined,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

export function docToChatMessage(d: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  return normalizeMessage(d.id, d.data() as FirestoreMessage);
}

function createPairKey(a: string, b: string) {
  return [a, b].sort().join('__');
}

export async function createOrGetConversation(input: {
  listingId: string;
  listingTitle: string;
  meId: string;
  meName: string;
  meAvatarUrl?: string;
  otherId: string;
  otherName: string;
  otherAvatarUrl?: string;
}) {
  if (!input.meId || !input.otherId || !input.listingId) {
    throw new Error('Brak danych do utworzenia rozmowy.');
  }
  if (input.meId === input.otherId) {
    throw new Error('Nie możesz rozpocząć rozmowy z samym sobą.');
  }

  const pairKey = createPairKey(input.meId, input.otherId);
  const conversationId = `${input.listingId}__${pairKey}`;
  const ref = doc(getFirebaseFirestore(), 'conversations', conversationId);

  // Stabilna kolejność UID — przy ponownym otwarciu nie zmieniaj participantIds
  // (reguły update pozwalają tylko na pola meta).
  const participantIds = [input.meId, input.otherId].sort();
  const participantNames = {
    [input.meId]: input.meName || 'Użytkownik',
    [input.otherId]: input.otherName || 'Użytkownik',
  };
  const participantAvatars = {
    [input.meId]: input.meAvatarUrl || '',
    [input.otherId]: input.otherAvatarUrl || '',
  };

  let existsAlready = false;
  try {
    const existing = await getDoc(ref);
    existsAlready = existing.exists();
  } catch {
    // get na nieistniejącym dokumencie mógł padać na starszych regułach
    existsAlready = false;
  }

  if (existsAlready) {
    await setDoc(
      ref,
      {
        listingTitle: input.listingTitle,
        participantNames,
        participantAvatars,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    try {
      await setDoc(ref, {
        listingId: input.listingId,
        listingTitle: input.listingTitle,
        pairKey,
        participantIds,
        participantNames,
        participantAvatars,
        lastMessageText: '',
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: '',
        readAt: {},
        mutedBy: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      // Wyścig: drugi klient zdążył utworzyć — dołóż tylko meta.
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      if (code !== 'permission-denied' && code !== 'already-exists') {
        throw error instanceof Error ? error : new Error('Nie udało się utworzyć rozmowy.');
      }
      await setDoc(
        ref,
        {
          listingTitle: input.listingTitle,
          participantNames,
          participantAvatars,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  return conversationId;
}

export async function getConversation(conversationId: string): Promise<ChatConversation | null> {
  if (!conversationId) return null;
  const snap = await getDoc(doc(getFirebaseFirestore(), 'conversations', conversationId));
  if (!snap.exists()) return null;
  return normalizeConversation(snap.id, snap.data() as FirestoreConversation);
}

export function subscribeConversation(
  conversationId: string,
  cb: (item: ChatConversation | null) => void,
  onError?: (error: unknown) => void
) {
  if (!conversationId) {
    cb(null);
    return () => {};
  }
  return onSnapshot(
    doc(getFirebaseFirestore(), 'conversations', conversationId),
    (snap) => {
      cb(snap.exists() ? normalizeConversation(snap.id, snap.data() as FirestoreConversation) : null);
    },
    (error) => onError?.(error)
  );
}

export async function sendConversationMessage(conversationId: string, senderId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  try {
    await addDoc(messagesCol(conversationId), {
      senderId,
      kind: 'text' as const,
      text: trimmed,
      createdAt: serverTimestamp(),
    });
    await setDoc(
      doc(getFirebaseFirestore(), 'conversations', conversationId),
      {
        lastMessageText: trimmed,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    const code =
      typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code === 'permission-denied') {
      throw new Error('Brak uprawnień do wysłania wiadomości. Zdeployuj reguły Firestore i spróbuj ponownie.');
    }
    throw error instanceof Error ? error : new Error('Nie udało się wysłać wiadomości.');
  }
  // Powiadomienie in-app + push: Cloud Function onChatMessageNotify
}

export async function sendConversationImageMessage(
  conversationId: string,
  senderId: string,
  caption: string,
  imageUrl: string,
  imageThumbUrl: string
) {
  const cap = caption.trim();
  try {
    await addDoc(messagesCol(conversationId), {
      senderId,
      kind: 'image' as const,
      text: cap,
      imageUrl,
      imageThumbUrl,
      createdAt: serverTimestamp(),
    });
    const preview = cap || '📷 Zdjęcie';
    await setDoc(
      doc(getFirebaseFirestore(), 'conversations', conversationId),
      {
        lastMessageText: preview,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    const code =
      typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code === 'permission-denied') {
      throw new Error('Brak uprawnień do wysłania zdjęcia. Sprawdź reguły Storage/Firestore.');
    }
    throw error instanceof Error ? error : new Error('Nie udało się wysłać zdjęcia.');
  }
  // Powiadomienie in-app + push: Cloud Function onChatMessageNotify
}

export async function markConversationRead(conversationId: string, userId: string) {
  await setDoc(
    doc(getFirebaseFirestore(), 'conversations', conversationId),
    {
      readAt: {
        [userId]: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function setConversationMuted(conversationId: string, userId: string, muted: boolean) {
  const cref = doc(getFirebaseFirestore(), 'conversations', conversationId);
  if (muted) {
    await updateDoc(cref, {
      [`mutedBy.${userId}`]: true,
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(cref, {
      [`mutedBy.${userId}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeUserConversations(
  uid: string,
  cb: (items: ChatConversation[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(conversationsCol(), where('participantIds', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => normalizeConversation(d.id, d.data() as FirestoreConversation))),
    (error) => onError?.(error)
  );
}

/** Nasłuch tylko na N najnowszych wiadomości (merge w kliencie z dociągniętą historią). */
export function subscribeConversationRecentWindow(
  conversationId: string,
  pageSize: number,
  cb: (docs: QueryDocumentSnapshot<DocumentData>[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(messagesCol(conversationId), orderBy('createdAt', 'desc'), limit(pageSize));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs),
    (error) => onError?.(error)
  );
}

export async function fetchOlderConversationMessageDocs(
  conversationId: string,
  startAfterDoc: QueryDocumentSnapshot<DocumentData>,
  pageSize: number
): Promise<{ docs: QueryDocumentSnapshot<DocumentData>[]; hasMore: boolean }> {
  const q = query(
    messagesCol(conversationId),
    orderBy('createdAt', 'desc'),
    startAfter(startAfterDoc),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  const docs = snap.docs;
  return { docs, hasMore: docs.length === pageSize };
}

export function subscribeConversationMessages(
  conversationId: string,
  cb: (items: ChatMessage[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(messagesCol(conversationId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => normalizeMessage(d.id, d.data() as FirestoreMessage))),
    (error) => onError?.(error)
  );
}
