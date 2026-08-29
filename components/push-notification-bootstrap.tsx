import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

function navigateFromNotificationData(
  router: ReturnType<typeof useRouter>,
  data: Record<string, unknown> | undefined
) {
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
}

/**
 * Reaguje na tap w powiadomieniu systemowym (deep link), także po cold start.
 * Musi być wewnątrz nawigacji Expo Router (np. obok `<Stack>` w `_layout`).
 */
export function PushNotificationBootstrap() {
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const openResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handled.current === id) return;
      handled.current = id;
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      navigateFromNotificationData(router, data);
    };

    void Notifications.getLastNotificationResponseAsync().then(openResponse);

    const sub = Notifications.addNotificationResponseReceivedListener(openResponse);
    return () => sub.remove();
  }, [router]);

  return null;
}
