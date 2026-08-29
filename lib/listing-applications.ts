import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import {
  getListing,
  isQuickListing,
  markQuickListingAwarded,
  QUICK_SLOT_MAX,
  quickSlotsRemaining,
  type MarketListing,
} from '@/lib/market-listings';
import { getListingPublisherName, type AccountRole, type UserProfile } from '@/lib/user-profile';

export type ListingApplication = {
  id: string;
  listingId: string;
  listingTitle: string;
  authorId: string;
  applicantId: string;
  applicantRole: AccountRole;
  applicantName: string;
  applicantAvatarUrl: string;
  applicantPhone: string;
  message: string;
  status: 'new' | 'in_progress' | 'accepted' | 'rejected';
  createdAt: Date | null;
};

type FirestoreApplication = Omit<ListingApplication, 'id' | 'createdAt'> & {
  createdAt?: Timestamp;
  applicantAvatarUrl?: string;
};

export type CreateApplicationInput = {
  listingId: string;
  listingTitle: string;
  authorId: string;
  applicantId: string;
  applicantRole: AccountRole;
  applicantProfile: UserProfile;
  message: string;
};

const APPLICATIONS_COLLECTION = 'applications';

/** Deterministyczne ID — max jedno zgłoszenie na parę ogłoszenie + kandydat. */
export function applicationDocId(listingId: string, applicantId: string): string {
  return `${listingId}__${applicantId}`;
}

function normalizeApplication(id: string, data: FirestoreApplication): ListingApplication {
  const status =
    data.status === 'in_progress' || data.status === 'accepted' || data.status === 'rejected'
      ? data.status
      : 'new';
  return {
    id,
    listingId: data.listingId || '',
    listingTitle: data.listingTitle || '',
    authorId: data.authorId || '',
    applicantId: data.applicantId || '',
    applicantRole: data.applicantRole === 'employer' ? 'employer' : 'welder',
    applicantName: data.applicantName || '',
    applicantAvatarUrl: typeof data.applicantAvatarUrl === 'string' ? data.applicantAvatarUrl : '',
    applicantPhone: data.applicantPhone || '',
    message: data.message || '',
    status,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'permission-denied'
  );
}

export async function createApplication(input: CreateApplicationInput) {
  if (!input.listingId || !input.applicantId) {
    throw new Error('Brak identyfikatorów zgłoszenia.');
  }

  const listing = await getListing(input.listingId);
  if (!listing) {
    throw new Error('Ogłoszenie nie istnieje lub zostało usunięte.');
  }
  if (!listing.authorId) {
    throw new Error('Ogłoszenie ma niekompletne dane autora — nie można aplikować.');
  }
  if (listing.authorId === input.applicantId) {
    throw new Error('Nie możesz aplikować na własne ogłoszenie.');
  }

  if (isQuickListing(listing)) {
    if (listing.quickStatus === 'awarded' || listing.quickStatus === 'closed') {
      throw new Error('To szybkie zlecenie jest już rozstrzygnięte.');
    }
    if (quickSlotsRemaining(listing) <= 0 || listing.quickStatus === 'full') {
      throw new Error('Limit 5 najszybszych zgłoszeń został wyczerpany.');
    }
  }

  const id = applicationDocId(input.listingId, input.applicantId);
  const ref = doc(getFirebaseFirestore(), APPLICATIONS_COLLECTION, id);
  try {
    const legacySnap = await getDocs(
      query(
        collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
        where('listingId', '==', input.listingId),
        where('applicantId', '==', input.applicantId),
        limit(1)
      )
    );
    if (!legacySnap.empty) {
      throw new Error('Już aplikowałeś na to ogłoszenie.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Już aplikowałeś')) {
      throw error;
    }
  }

  const applicantName =
    getListingPublisherName(input.applicantProfile) ||
    input.applicantProfile.fullName ||
    'Użytkownik';
  const applicantAvatarUrl = input.applicantProfile.avatarUrl || '';
  const message =
    input.message.trim() ||
    (isQuickListing(listing)
      ? 'Chcę dołączyć do szybkiego zlecenia — jestem gotowy/a od razu.'
      : 'Jestem zainteresowany/a tym ogłoszeniem.');

  const db = getFirebaseFirestore();
  const listingRef = doc(db, 'listings', input.listingId);

  try {
    if (isQuickListing(listing)) {
      // Transakcja: zgłoszenie + od razu awatar w slotach.
      // UWAGA: serverTimestamp() NIE działa wewnątrz tablic — używamy Timestamp.now().
      await runTransaction(db, async (tx) => {
        const listingSnap = await tx.get(listingRef);
        if (!listingSnap.exists()) {
          throw new Error('Ogłoszenie nie istnieje lub zostało usunięte.');
        }
        const live = listingSnap.data() as Record<string, unknown>;
        if (live.kind !== 'quick') {
          throw new Error('To nie jest szybkie zlecenie.');
        }
        if (live.quickStatus === 'awarded' || live.quickStatus === 'closed') {
          throw new Error('To szybkie zlecenie jest już rozstrzygnięte.');
        }
        const rawSlots =
          live.quickSlots && typeof live.quickSlots === 'object'
            ? (live.quickSlots as {
                max?: number;
                applicants?: Array<Record<string, unknown>>;
              })
            : {};
        const max =
          typeof rawSlots.max === 'number' && rawSlots.max > 0 ? rawSlots.max : QUICK_SLOT_MAX;
        const applicants = Array.isArray(rawSlots.applicants) ? [...rawSlots.applicants] : [];
        if (applicants.some((a) => a && a.uid === input.applicantId)) {
          throw new Error('Już aplikowałeś na to ogłoszenie.');
        }
        if (applicants.length >= max) {
          throw new Error('Limit 5 najszybszych zgłoszeń został wyczerpany.');
        }

        tx.set(ref, {
          listingId: input.listingId,
          listingTitle: listing.title || input.listingTitle,
          authorId: listing.authorId,
          applicantId: input.applicantId,
          applicantRole: input.applicantRole,
          applicantName,
          applicantAvatarUrl,
          applicantPhone: input.applicantProfile.phone || '',
          message,
          status: 'new',
          createdAt: serverTimestamp(),
        });

        const nextApplicants = [
          ...applicants,
          {
            uid: input.applicantId,
            name: applicantName,
            avatarUrl: applicantAvatarUrl,
            applicationId: id,
            joinedAt: Timestamp.now(),
          },
        ];
        const filled = nextApplicants.length;
        tx.update(listingRef, {
          quickSlots: { max, filled, applicants: nextApplicants },
          quickStatus: filled >= max ? 'full' : 'open',
          updatedAt: serverTimestamp(),
        });
      });
    } else {
      await setDoc(ref, {
        listingId: input.listingId,
        listingTitle: listing.title || input.listingTitle,
        authorId: listing.authorId,
        applicantId: input.applicantId,
        applicantRole: input.applicantRole,
        applicantName,
        applicantAvatarUrl,
        applicantPhone: input.applicantProfile.phone || '',
        message,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith('Już aplikowałeś') ||
      error.message.startsWith('Limit 5') ||
      error.message.startsWith('To szybkie') ||
      error.message.startsWith('Ogłoszenie nie istnieje')
    )) {
      throw error;
    }
    if (isPermissionDenied(error)) {
      throw new Error(
        'Brak uprawnień do wysłania zgłoszenia. Zdeployuj najnowsze reguły Firestore (firebase deploy --only firestore:rules).'
      );
    }
    throw error;
  }
  // Powiadomienie: Cloud Function onApplicationCreatedNotify
}

/** Dopina brakujący slot awatara, gdy zgłoszenie jest, a listing.quickSlots nie zdążyło się zaktualizować. */
export async function repairOwnQuickSlot(input: {
  listingId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatarUrl: string;
  applicationId: string;
}): Promise<void> {
  const db = getFirebaseFirestore();
  const listingRef = doc(db, 'listings', input.listingId);
  await runTransaction(db, async (tx) => {
    const listingSnap = await tx.get(listingRef);
    if (!listingSnap.exists()) return;
    const live = listingSnap.data() as Record<string, unknown>;
    if (live.kind !== 'quick') return;
    if (live.quickStatus === 'awarded' || live.quickStatus === 'closed') return;
    const rawSlots =
      live.quickSlots && typeof live.quickSlots === 'object'
        ? (live.quickSlots as { max?: number; applicants?: Array<Record<string, unknown>> })
        : {};
    const max = typeof rawSlots.max === 'number' && rawSlots.max > 0 ? rawSlots.max : QUICK_SLOT_MAX;
    const applicants = Array.isArray(rawSlots.applicants) ? [...rawSlots.applicants] : [];
    if (applicants.some((a) => a && a.uid === input.applicantId)) return;
    if (applicants.length >= max) return;
    const nextApplicants = [
      ...applicants,
      {
        uid: input.applicantId,
        name: input.applicantName,
        avatarUrl: input.applicantAvatarUrl,
        applicationId: input.applicationId,
        joinedAt: Timestamp.now(),
      },
    ];
    const filled = nextApplicants.length;
    tx.update(listingRef, {
      quickSlots: { max, filled, applicants: nextApplicants },
      quickStatus: filled >= max ? 'full' : 'open',
      updatedAt: serverTimestamp(),
    });
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ListingApplication['status']
) {
  const ref = doc(getFirebaseFirestore(), APPLICATIONS_COLLECTION, applicationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const prev = normalizeApplication(applicationId, snap.data() as FirestoreApplication);
  if (prev.status === status) return;
  await setDoc(ref, { status, updatedAt: serverTimestamp() }, { merge: true });
  // Powiadomienie in-app + push: Cloud Function onApplicationStatusNotify
}

/** Wybór zwycięzcy mikrolicytacji — akceptacja jednego, odrzucenie pozostałych. */
export async function selectQuickJobWinner(listing: MarketListing, winnerApplicationId: string) {
  if (!isQuickListing(listing)) {
    throw new Error('To nie jest szybkie zlecenie.');
  }
  const appsSnap = await getDocs(
    query(
      collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
      where('listingId', '==', listing.id),
      where('authorId', '==', listing.authorId)
    )
  );
  const apps = appsSnap.docs.map((d) => normalizeApplication(d.id, d.data() as FirestoreApplication));
  const winner = apps.find((a) => a.id === winnerApplicationId);
  if (!winner) {
    throw new Error('Nie znaleziono wybranego zgłoszenia.');
  }
  await Promise.all(
    apps.map((app) => {
      const next = app.id === winnerApplicationId ? 'accepted' : 'rejected';
      if (app.status === next) return Promise.resolve();
      return setDoc(
        doc(getFirebaseFirestore(), APPLICATIONS_COLLECTION, app.id),
        { status: next, updatedAt: serverTimestamp() },
        { merge: true }
      );
    })
  );
  await markQuickListingAwarded(listing.id, winner.applicantId);
}

export function subscribeApplicationsForListing(
  listingId: string,
  authorId: string,
  cb: (items: ListingApplication[]) => void,
  onError?: (error: unknown) => void
) {
  // authorId w query jest wymagany przez reguły (list bez dowodu ownership pada).
  const q = query(
    collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
    where('listingId', '==', listingId),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => normalizeApplication(d.id, d.data() as FirestoreApplication)));
    },
    (error) => onError?.(error)
  );
}

export function subscribeMyApplicationForListing(
  listingId: string,
  applicantId: string,
  cb: (item: ListingApplication | null) => void,
  onError?: (error: unknown) => void
) {
  // Query obejmuje zarówno nowe ID deterministyczne, jak i stare auto-id.
  const q = query(
    collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
    where('listingId', '==', listingId),
    where('applicantId', '==', applicantId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const first = snap.docs[0];
      cb(first ? normalizeApplication(first.id, first.data() as FirestoreApplication) : null);
    },
    (error) => onError?.(error)
  );
}

export function subscribeApplicationsByApplicant(
  applicantId: string,
  cb: (items: ListingApplication[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(
    collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
    where('applicantId', '==', applicantId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => normalizeApplication(d.id, d.data() as FirestoreApplication)));
    },
    (error) => onError?.(error)
  );
}

export function subscribeApplicationsByAuthor(
  authorId: string,
  cb: (items: ListingApplication[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(
    collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => normalizeApplication(d.id, d.data() as FirestoreApplication)));
    },
    (error) => onError?.(error)
  );
}
