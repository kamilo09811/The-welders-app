import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';

export type InAppNotificationKind =
  | 'application_new'
  | 'application_status'
  | 'chat_message'
  | 'listing_new';

export type InAppNotification = {
  id: string;
  kind: InAppNotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date | null;
  actorUid: string;
  recipientUid: string;
  listingId?: string;
  listingTitle?: string;
  applicationId?: string;
  conversationId?: string;
};

type FirestoreInAppNotification = Omit<InAppNotification, 'id' | 'createdAt'> & {
  createdAt?: Timestamp;
};

function notificationsCol(uid: string) {
  return collection(getFirebaseFirestore(), 'users', uid, 'notifications');
}

function normalizeNotification(id: string, data: FirestoreInAppNotification): InAppNotification {
  const kind = data.kind;
  const safeKind: InAppNotificationKind =
    kind === 'application_status' ||
    kind === 'chat_message' ||
    kind === 'application_new' ||
    kind === 'listing_new'
      ? kind
      : 'application_new';
  return {
    id,
    kind: safeKind,
    title: typeof data.title === 'string' ? data.title : '',
    body: typeof data.body === 'string' ? data.body : '',
    read: data.read === true,
    createdAt: data.createdAt?.toDate?.() ?? null,
    actorUid: typeof data.actorUid === 'string' ? data.actorUid : '',
    recipientUid: typeof data.recipientUid === 'string' ? data.recipientUid : '',
    listingId: typeof data.listingId === 'string' && data.listingId ? data.listingId : undefined,
    listingTitle: typeof data.listingTitle === 'string' && data.listingTitle ? data.listingTitle : undefined,
    applicationId: typeof data.applicationId === 'string' && data.applicationId ? data.applicationId : undefined,
    conversationId: typeof data.conversationId === 'string' && data.conversationId ? data.conversationId : undefined,
  };
}

/** Tworzenie powiadomień: wyłącznie Cloud Functions (patrz functions/index.js). */

export function subscribeInAppNotifications(
  uid: string,
  cb: (items: InAppNotification[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(notificationsCol(uid), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => normalizeNotification(d.id, d.data() as FirestoreInAppNotification))),
    (e) => onError?.(e)
  );
}

export async function markInAppNotificationRead(uid: string, notificationId: string) {
  await updateDoc(doc(getFirebaseFirestore(), 'users', uid, 'notifications', notificationId), {
    read: true,
    readAt: serverTimestamp(),
  });
}

export async function markAllInAppNotificationsRead(uid: string) {
  const q = query(notificationsCol(uid), where('read', '==', false), limit(50));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(getFirebaseFirestore());
  for (const d of snap.docs) {
    batch.update(d.ref, { read: true, readAt: serverTimestamp() });
  }
  await batch.commit();
}

export function countUnreadInAppNotifications(items: InAppNotification[]): number {
  return items.reduce((n, x) => n + (x.read ? 0 : 1), 0);
}
