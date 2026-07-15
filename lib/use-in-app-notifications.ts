import { useEffect, useMemo, useState } from 'react';

import {
  countUnreadInAppNotifications,
  subscribeInAppNotifications,
  type InAppNotification,
} from '@/lib/in-app-notifications';

export function useInAppNotifications(uid?: string) {
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeInAppNotifications(
      uid,
      (list) => {
        setItems(list);
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  const unreadCount = useMemo(() => countUnreadInAppNotifications(items), [items]);

  return { items, loading, unreadCount };
}
