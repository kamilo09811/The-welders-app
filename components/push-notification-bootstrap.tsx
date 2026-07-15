import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * Reaguje na tap w powiadomieniu systemowym (deep link w aplikacji).
 * Musi być wewnątrz nawigacji Expo Router (np. obok `<Stack>` w `_layout`).
 */
export function PushNotificationBootstrap() {
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const id = response.notification.request.identifier;
      if (handled.current === id) return;
      handled.current = id;
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      const conversationId = typeof data?.conversationId === 'string' ? data.conversationId : '';
      const listingId = typeof data?.listingId === 'string' ? data.listingId : '';
      if (conversationId) {
        router.push({ pathname: '/messages/[id]', params: { id: conversationId } });
        return;
      }
      if (listingId) {
        router.push({ pathname: '/listing/[id]', params: { id: listingId } });
        return;
      }
      router.push('/notifications' as never);
    });
    return () => sub.remove();
  }, [router]);

  return null;
}
