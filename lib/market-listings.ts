import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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

export async function createListing(input: CreateListingInput) {
  const ref = await addDoc(collection(getFirebaseFirestore(), LISTINGS_COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateListing(id: string, input: UpdateListingInput) {
  await setDoc(
    doc(getFirebaseFirestore(), LISTINGS_COLLECTION, id),
    {
      ...input,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteListing(id: string) {
  await deleteDoc(doc(getFirebaseFirestore(), LISTINGS_COLLECTION, id));
}
