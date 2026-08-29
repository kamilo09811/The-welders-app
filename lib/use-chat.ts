import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CHAT_MESSAGE_PAGE_SIZE,
  countUnreadConversations,
  docToChatMessage,
  fetchOlderConversationMessageDocs,
  subscribeConversation,
  subscribeConversationMessages,
  subscribeConversationRecentWindow,
  subscribeUserConversations,
  type ChatConversation,
  type ChatMessage,
} from '@/lib/chat';

export function useUserConversations(uid?: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeUserConversations(
      uid,
      (items) => {
        const sorted = [...items].sort(
          (a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0)
        );
        setConversations(sorted);
        setLoading(false);
      },
      () => {
        setConversations([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  const unreadCount = useMemo(() => countUnreadConversations(conversations, uid ?? ''), [conversations, uid]);

  return { conversations, loading, unreadCount };
}

/** Pojedyncza rozmowa po ID — działa od razu po create (bez czekania na listę). */
export function useConversation(conversationId?: string) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(Boolean(conversationId));

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeConversation(
      conversationId,
      (item) => {
        setConversation(item);
        setLoading(false);
      },
      () => {
        setConversation(null);
        setLoading(false);
      }
    );
    return unsub;
  }, [conversationId]);

  return { conversation, loading };
}

/** Łączy nasłuch na ostatnie N wiadomości z jednorazowym dociąganiem starszych. */
export function useConversationMessagesPaged(conversationId?: string, pageSize = CHAT_MESSAGE_PAGE_SIZE) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(conversationId));
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const byIdRef = useRef(new Map<string, ChatMessage>());
  const docByIdRef = useRef(new Map<string, QueryDocumentSnapshot<DocumentData>>());

  const emitSorted = useCallback(() => {
    const list = Array.from(byIdRef.current.values()).sort(
      (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
    );
    setMessages(list);
  }, []);

  useEffect(() => {
    if (!conversationId) {
      byIdRef.current.clear();
      docByIdRef.current.clear();
      setMessages([]);
      setLoading(false);
      setHasMoreOlder(true);
      return;
    }
    byIdRef.current.clear();
    docByIdRef.current.clear();
    setLoading(true);
    setHasMoreOlder(true);
    const unsub = subscribeConversationRecentWindow(
      conversationId,
      pageSize,
      (docs) => {
        for (const d of docs) {
          const m = docToChatMessage(d);
          byIdRef.current.set(m.id, m);
          docByIdRef.current.set(m.id, d);
        }
        emitSorted();
        setLoading(false);
      },
      () => {
        byIdRef.current.clear();
        docByIdRef.current.clear();
        setMessages([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [conversationId, pageSize, emitSorted]);

  const loadOlder = useCallback(async () => {
    if (!conversationId || loadingOlder || !hasMoreOlder) return;
    const sorted = Array.from(byIdRef.current.values()).sort(
      (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
    );
    const oldest = sorted[0];
    if (!oldest) return;
    const cursor = docByIdRef.current.get(oldest.id);
    if (!cursor) return;
    setLoadingOlder(true);
    try {
      const { docs, hasMore } = await fetchOlderConversationMessageDocs(conversationId, cursor, pageSize);
      if (docs.length === 0) {
        setHasMoreOlder(false);
        return;
      }
      for (const d of docs) {
        const m = docToChatMessage(d);
        byIdRef.current.set(m.id, m);
        docByIdRef.current.set(m.id, d);
      }
      emitSorted();
      setHasMoreOlder(hasMore);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, loadingOlder, hasMoreOlder, pageSize, emitSorted]);

  return { messages, loading, loadingOlder, hasMoreOlder, loadOlder };
}

export function useConversationMessages(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(conversationId));

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeConversationMessages(
      conversationId,
      (items) => {
        setMessages(items);
        setLoading(false);
      },
      () => {
        setMessages([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [conversationId]);

  return { messages, loading };
}
