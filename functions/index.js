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
 *   kind: 'application_new' | 'application_status' | 'chat_message' | 'listing_new',
 *   title: string,
 *   body: string,
 *   listingId?: string,
 *   listingTitle?: string,
 *   applicationId?: string,
 *   conversationId?: string,
 * }} input
 */

/** Uproszczona lista miast PL (zgodna z lib/pl-cities.ts) — alerty o nowych ofertach. */
const PL_CITIES = [
  { name: 'Bielsko-Biała', lat: 49.8225, lng: 19.0444 },
  { name: 'Katowice', lat: 50.2649, lng: 19.0238 },
  { name: 'Sosnowiec', lat: 50.2863, lng: 19.1041 },
  { name: 'Gliwice', lat: 50.2945, lng: 18.6714 },
  { name: 'Zabrze', lat: 50.3249, lng: 18.7857 },
  { name: 'Bytom', lat: 50.3484, lng: 18.9157 },
  { name: 'Tychy', lat: 50.1372, lng: 18.9665 },
  { name: 'Rybnik', lat: 50.0971, lng: 18.5418 },
  { name: 'Chorzów', lat: 50.2976, lng: 18.9548 },
  { name: 'Warszawa', lat: 52.2297, lng: 21.0122 },
  { name: 'Kraków', lat: 50.0647, lng: 19.945 },
  { name: 'Łódź', lat: 51.7592, lng: 19.456 },
  { name: 'Wrocław', lat: 51.1079, lng: 17.0385 },
  { name: 'Poznań', lat: 52.4064, lng: 16.9252 },
  { name: 'Gdańsk', lat: 54.352, lng: 18.6466 },
  { name: 'Szczecin', lat: 53.4285, lng: 14.5528 },
  { name: 'Bydgoszcz', lat: 53.1235, lng: 18.0084 },
  { name: 'Lublin', lat: 51.2465, lng: 22.5684 },
  { name: 'Białystok', lat: 53.1325, lng: 23.1688 },
  { name: 'Częstochowa', lat: 50.7969, lng: 19.1241 },
  { name: 'Rzeszów', lat: 50.0413, lng: 21.999 },
  { name: 'Gdynia', lat: 54.5189, lng: 18.5305 },
  { name: 'Radom', lat: 51.4027, lng: 21.1471 },
  { name: 'Toruń', lat: 53.0138, lng: 18.5984 },
  { name: 'Kielce', lat: 50.8661, lng: 20.6286 },
  { name: 'Olsztyn', lat: 53.7784, lng: 20.4801 },
  { name: 'Opole', lat: 50.6751, lng: 17.9213 },
  { name: 'Zielona Góra', lat: 51.9356, lng: 15.5062 },
  { name: 'Gorzów Wielkopolski', lat: 52.7368, lng: 15.2288 },
  { name: 'Tarnów', lat: 50.012, lng: 20.985 },
  { name: 'Nowy Sącz', lat: 49.621, lng: 20.697 },
].sort((a, b) => b.name.length - a.name.length);

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function resolveCity(text) {
  const raw = String(text || '')
    .trim()
    .toLowerCase();
  if (!raw) return null;
  for (const city of PL_CITIES) {
    if (raw.includes(city.name.toLowerCase())) return city;
  }
  return null;
}

function radiusToKm(radius) {
  if (radius === '25 km') return 25;
  if (radius === '50 km') return 50;
  if (radius === '100 km') return 100;
  return null;
}

function matchesLocation(listingLocation, baseCity, radius) {
  const city = String(baseCity || '').trim();
  if (!city) return true;
  const maxKm = radiusToKm(radius);
  if (maxKm == null) return true;
  const base = resolveCity(city);
  const listing = resolveCity(listingLocation);
  if (base && listing) return haversineKm(base, listing) <= maxKm;
  return String(listingLocation || '')
    .toLowerCase()
    .includes(city.toLowerCase());
}

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

/** Nowe ogłoszenie → in-app dla użytkowników z notifNewJobs (rola + lokalizacja + preferencje). */
exports.onListingCreatedNotify = onDocumentCreated(
  {
    document: 'listings/{listingId}',
    region: 'europe-west1',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const listing = snap.data();
    const listingId = event.params.listingId;
    const authorId = listing.authorId;
    const title = (listing.title && String(listing.title).trim()) || 'Nowe ogłoszenie';
    const location = typeof listing.location === 'string' ? listing.location : '';
    const targetRole = listing.targetRole === 'employer' ? 'employer' : 'welder';
    const company = typeof listing.company === 'string' ? listing.company.trim() : '';

    let settingsSnap;
    try {
      settingsSnap = await db.collectionGroup('meta').where('notifNewJobs', '==', true).get();
    } catch (e) {
      console.error('collectionGroup meta query failed', e);
      return;
    }

    const tasks = [];
    for (const docSnap of settingsSnap.docs) {
      if (docSnap.id !== 'settings') continue;
      const userRef = docSnap.ref.parent.parent;
      if (!userRef) continue;
      const uid = userRef.id;
      if (!uid || uid === authorId) continue;

      const settings = docSnap.data() || {};
      const preferredIntent = settings.preferredIntent;
      if (preferredIntent === 'offer' || preferredIntent === 'seek') {
        if (listing.intent && listing.intent !== preferredIntent) continue;
      }
      const minRate = typeof settings.minRate === 'number' ? settings.minRate : 0;
      const rateMax = Number(listing.rateMax) || 0;
      if (minRate > 0 && rateMax < minRate) continue;

      const modes = Array.isArray(settings.preferredModes) ? settings.preferredModes : [];
      if (modes.length > 0 && listing.mode && !modes.includes(listing.mode)) continue;

      if (!matchesLocation(location, settings.baseCity || '', settings.radius || 'Cała Polska')) {
        continue;
      }

      tasks.push(
        (async () => {
          const profileSnap = await userRef.get();
          const role = profileSnap.data()?.role === 'employer' ? 'employer' : 'welder';
          if (role !== targetRole) return;
          const where = location ? ` · ${location}` : '';
          const who = company || 'Nowe ogłoszenie';
          await createInAppNotification(uid, {
            actorUid: authorId || 'system',
            kind: 'listing_new',
            title: 'Nowa oferta na rynku',
            body: `${title} — ${who}${where}`,
            listingId,
            listingTitle: title,
          });
        })()
      );
    }

    const BATCH = 25;
    for (let i = 0; i < tasks.length; i += BATCH) {
      await Promise.all(tasks.slice(i, i + BATCH));
    }
  }
);

/** Po utworzeniu powiadomienia in-app → Expo Push (z uwzględnieniem rodzaju + ustawień). */
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
    const kind = n.kind || '';

    const settingsSnap = await db.doc(`users/${userId}/meta/settings`).get();
    const settings = settingsSnap.data() || {};
    const allow =
      kind === 'listing_new'
        ? settings.notifNewJobs !== false
        : kind === 'chat_message'
          ? settings.notifMessages !== false
          : settings.notifApplications !== false;
    if (!allow) return;

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
        kind,
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
