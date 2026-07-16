import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import type { AccountRole } from '@/lib/user-profile';

export type ListingType = 'Umowa o pracę' | 'B2B' | 'Umowa zlecenie';
export type WorkMode = 'Na hali' | 'Hybryda' | 'Mobilnie';
export type ListingIntent = 'offer' | 'seek';

export type MarketListing = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  mode: WorkMode;
  type: ListingType;
  intent: ListingIntent;
  rateMin: number;
  rateMax: number;
  tags: string[];
  targetRole: AccountRole;
  authorId: string;
  createdAt: Date | null;
};

type FirestoreListing = Omit<MarketListing, 'id' | 'createdAt'> & {
  createdAt?: Timestamp;
};

export type CreateListingInput = {
  title: string;
  description: string;
  company: string;
  location: string;
  mode: WorkMode;
  type: ListingType;
  intent: ListingIntent;
  rateMin: number;
  rateMax: number;
  tags: string[];
  targetRole: AccountRole;
  authorId: string;
};

export type UpdateListingInput = Omit<CreateListingInput, 'authorId'>;

const LISTINGS_COLLECTION = 'listings';

function normalizeListing(id: string, data: FirestoreListing): MarketListing {
  return {
    id,
    title: data.title || '',
    description: data.description || '',
    company: data.company || '',
    location: data.location || '',
    mode: data.mode || 'Na hali',
    type: data.type || 'Umowa zlecenie',
    intent: data.intent === 'seek' ? 'seek' : 'offer',
    rateMin: Number.isFinite(data.rateMin) ? data.rateMin : 0,
    rateMax: Number.isFinite(data.rateMax) ? data.rateMax : 0,
    tags: Array.isArray(data.tags) ? data.tags.filter((v): v is string => typeof v === 'string') : [],
    targetRole: data.targetRole === 'employer' ? 'employer' : 'welder',
    authorId: data.authorId || '',
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

function listingRef(id: string) {
  return doc(getFirebaseFirestore(), LISTINGS_COLLECTION, id);
}

/** Lista marketplace — pełna kolekcja (filtry po stronie klienta). */
export function subscribeListings(cb: (items: MarketListing[]) => void, onError?: (error: unknown) => void) {
  const q = query(collection(getFirebaseFirestore(), LISTINGS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => normalizeListing(d.id, d.data() as FirestoreListing)));
    },
    (error) => {
      onError?.(error);
    }
  );
}

/** Jednorazowy odczyt jednego ogłoszenia (szczegóły / edycja). */
export async function getListing(id: string): Promise<MarketListing | null> {
  if (!id) return null;
  const snap = await getDoc(listingRef(id));
  if (!snap.exists()) return null;
  return normalizeListing(snap.id, snap.data() as FirestoreListing);
}

/** Live-subskrypcja jednego dokumentu — zamiast całej kolekcji na ekranach detail/edit. */
export function subscribeListing(
  id: string,
  cb: (item: MarketListing | null) => void,
  onError?: (error: unknown) => void
) {
  if (!id) {
    cb(null);
    return () => {};
  }
  return onSnapshot(
    listingRef(id),
    (snap) => {
      cb(snap.exists() ? normalizeListing(snap.id, snap.data() as FirestoreListing) : null);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createListing(input: CreateListingInput) {
  const ref = await addDoc(collection(getFirebaseFirestore(), LISTINGS_COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateListing(id: string, input: UpdateListingInput) {
  await setDoc(
    listingRef(id),
    {
      ...input,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteListing(id: string) {
  await deleteDoc(listingRef(id));
}
