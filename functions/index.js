/**
 * Cloud Functions — powiadomienia in-app + Expo Push.
 *
 * Tworzenie dokumentów w `users/{uid}/notifications` odbywa się wyłącznie tutaj
 * (Admin SDK omija reguły). Klient nie może tworzyć powiadomień (spam/abuse).
 *
 * Wdrożenie: npm install w katalogu functions, potem z katalogu głównego:
 *   firebase login
 *   firebase use theweldersworld-92857
 *   firebase deploy --only functions
 *
 * Wymaga planu Blaze (wywołania sieciowe do api.expo.dev).
 */
const admin = require('firebase-admin');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { Expo } = require('expo-server-sdk');

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

const STATUS_LABEL = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  accepted: 'Zaakceptowane',
  rejected: 'Odrzucone',
};

/**
 * @param {string} recipientUid
 * @param {{
 *   actorUid: string,
 *   kind: 'application_new' | 'application_status' | 'chat_message',
 *   title: string,
 *   body: string,
 *   listingId?: string,
 *   listingTitle?: string,
 *   applicationId?: string,
 *   conversationId?: string,
 * }} input
 */
async function createInAppNotification(recipientUid, input) {
  if (!recipientUid || !input.actorUid || recipientUid === input.actorUid) return;
  const payload = {
    recipientUid,
    actorUid: input.actorUid,
    kind: input.kind,
    title: String(input.title || '').slice(0, 200),
    body: String(input.body || '').slice(0, 500),
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (input.listingId) payload.listingId = input.listingId;
  if (input.listingTitle) payload.listingTitle = input.listingTitle;
  if (input.applicationId) payload.applicationId = input.applicationId;
  if (input.conversationId) payload.conversationId = input.conversationId;
  await db.collection('users').doc(recipientUid).collection('notifications').add(payload);
}

/** Nowe zgłoszenie → powiadomienie dla autora ogłoszenia. */
exports.onApplicationCreatedNotify = onDocumentCreated(
  {
    document: 'applications/{applicationId}',
    region: 'europe-west1',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    const authorId = data.authorId;
    const applicantId = data.applicantId;
    if (!authorId || !applicantId || authorId === applicantId) return;
    const who = (data.applicantName && String(data.applicantName).trim()) || 'Użytkownik';
    const listingTitle = (data.listingTitle && String(data.listingTitle).trim()) || 'Ogłoszenie';
    await createInAppNotification(authorId, {
      actorUid: applicantId,
      kind: 'application_new',
      title: 'Nowe zgłoszenie',
      body: `${who} — ${listingTitle}`,
      listingId: typeof data.listingId === 'string' ? data.listingId : undefined,
      listingTitle,
      applicationId: event.params.applicationId,
    });
  }
);

/** Zmiana statusu zgłoszenia → powiadomienie dla kandydata. */
exports.onApplicationStatusNotify = onDocumentUpdated(
  {
    document: 'applications/{applicationId}',
    region: 'europe-west1',
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;
    if (before.status === after.status) return;
    const status = after.status;
    if (!STATUS_LABEL[status]) return;
    const applicantId = after.applicantId;
    const authorId = after.authorId;
    if (!applicantId || !authorId || applicantId === authorId) return;
    const listingTitle = (after.listingTitle && String(after.listingTitle).trim()) || 'Ogłoszenie';
    await createInAppNotification(applicantId, {
      actorUid: authorId,
      kind: 'application_status',
      title: 'Zmiana statusu zgłoszenia',
      body: `„${listingTitle}” — ${STATUS_LABEL[status]}`,
      listingId: typeof after.listingId === 'string' ? after.listingId : undefined,
      listingTitle,
      applicationId: event.params.applicationId,
    });
  }
);

/** Nowa wiadomość w czacie → powiadomienie dla pozostałych uczestników (z uwzględnieniem mutedBy). */
exports.onChatMessageNotify = onDocumentCreated(
  {
    document: 'conversations/{conversationId}/messages/{messageId}',
    region: 'europe-west1',
  },
  async (event) => {
    const msgSnap = event.data;
    if (!msgSnap) return;
    const msg = msgSnap.data();
    const senderId = msg.senderId;
    if (!senderId || typeof senderId !== 'string') return;

    const conversationId = event.params.conversationId;
    const convSnap = await db.doc(`conversations/${conversationId}`).get();
    if (!convSnap.exists) return;
    const conv = convSnap.data();
    const participantIds = Array.isArray(conv.participantIds)
      ? conv.participantIds.filter((x) => typeof x === 'string')
      : [];
    const participantNames =
      conv.participantNames && typeof conv.participantNames === 'object' ? conv.participantNames : {};
    const mutedBy = conv.mutedBy && typeof conv.mutedBy === 'object' ? conv.mutedBy : {};
    const listingTitle =
      typeof conv.listingTitle === 'string' && conv.listingTitle.trim()
        ? conv.listingTitle.trim()
        : 'Rozmowa';
    const listingId = typeof conv.listingId === 'string' ? conv.listingId : undefined;
    const senderName =
      (participantNames[senderId] && String(participantNames[senderId]).trim()) || 'Użytkownik';
    const isImage = msg.kind === 'image';
    const textPreview = typeof msg.text === 'string' ? msg.text.trim() : '';
    const preview = isImage ? textPreview || 'Zdjęcie' : textPreview;
    if (!preview) return;
    const suffix = listingTitle ? ` · ${listingTitle}` : '';

    const recipients = participantIds.filter((pid) => pid && pid !== senderId && !mutedBy[pid]);
    await Promise.all(
      recipients.map((pid) =>
        createInAppNotification(pid, {
          actorUid: senderId,
          kind: 'chat_message',
          title: 'Nowa wiadomość',
          body: `${senderName}: ${preview}${suffix}`,
          listingId,
          listingTitle,
          conversationId,
        })
      )
    );
  }
);

/** Po utworzeniu powiadomienia in-app → Expo Push (token z users/{uid}/meta/push). */
exports.onInAppNotificationPush = onDocumentCreated(
  {
    document: 'users/{userId}/notifications/{notifId}',
    region: 'europe-west1',
  },
  async (event) => {
    const userId = event.params.userId;
    const snap = event.data;
    if (!snap) return;
    const n = snap.data();
    const pushSnap = await db.doc(`users/${userId}/meta/push`).get();
    const token = pushSnap.data()?.expoPushToken;
    if (!token || !Expo.isExpoPushToken(token)) {
      return;
    }
    const payload = {
      to: token,
      sound: 'default',
      title: n.title || 'Powiadomienie',
      body: String(n.body || '').slice(0, 400),
      data: {
        kind: n.kind || '',
        listingId: n.listingId || '',
        conversationId: n.conversationId || '',
      },
    };
    try {
      const tickets = await expo.sendPushNotificationsAsync([payload]);
      if (tickets[0]?.status === 'error') {
        console.error('Expo push error', tickets[0].message);
      }
    } catch (e) {
      console.error(e);
    }
  }
);
