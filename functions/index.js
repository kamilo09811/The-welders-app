/**
 * Po utworzeniu dokumentu in-app wysyła powiadomienie Expo Push (token z users/{uid}/meta/push).
 *
 * Wdrożenie: npm install w katalogu functions, potem z katalogu głównego:
 *   firebase login
 *   firebase use --add   # wybierz projekt theweldersworld-92857
 *   firebase deploy --only functions
 *
 * Wymaga planu Blaze (wywołania sieciowe do api.expo.dev).
 */
const admin = require('firebase-admin');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { Expo } = require('expo-server-sdk');

admin.initializeApp();
const expo = new Expo();

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
    const pushSnap = await admin.firestore().doc(`users/${userId}/meta/push`).get();
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
