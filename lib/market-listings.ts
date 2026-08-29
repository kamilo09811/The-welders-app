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
/** standard = zwykłe ogłoszenie; quick = mikrolicytacja (max 5 najszybszych). */
export type ListingKind = 'standard' | 'quick';
export type QuickListingStatus = 'open' | 'full' | 'awarded' | 'closed';

export const QUICK_SLOT_MAX = 5;

export type QuickSlotApplicant = {
  uid: string;
  name: string;
  avatarUrl: string;
  applicationId: string;
  joinedAt: Date | null;
};

export type QuickSlots = {
  max: number;
  filled: number;
  applicants: QuickSlotApplicant[];
};

export type MarketListing = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  mode: WorkMode;
  type: ListingType;
  intent: ListingIntent;
  kind: ListingKind;
  rateMin: number;
  rateMax: number;
  tags: string[];
  targetRole: AccountRole;
  authorId: string;
  createdAt: Date | null;
  /** Tylko kind=quick */
  quickStatus?: QuickListingStatus;
  quickSlots?: QuickSlots;
  selectedApplicantId?: string;
  /** Np. „1 dzień”, „tydzień” — podpowiedź czasu dla szybkiego zlecenia. */
  durationHint?: string;
};

type FirestoreListing = Omit<
  MarketListing,
  'id' | 'createdAt' | 'quickSlots' | 'kind' | 'quickStatus' | 'selectedApplicantId' | 'durationHint'
> & {
  createdAt?: Timestamp;
  kind?: ListingKind | string;
  quickStatus?: QuickListingStatus | string;
  selectedApplicantId?: string;
  durationHint?: string;
  quickSlots?: {
    max?: number;
    filled?: number;
    applicants?: Array<{
      uid?: string;
      name?: string;
      avatarUrl?: string;
      applicationId?: string;
      joinedAt?: Timestamp | Date | null;
    }>;
  };
};

export type CreateListingInput = {
  title: string;
  description: string;
  company: string;
  location: string;
  mode: WorkMode;
  type: ListingType;
  intent: ListingIntent;
  kind?: ListingKind;
  rateMin: number;
  rateMax: number;
  tags: string[];
  targetRole: AccountRole;
  authorId: string;
  durationHint?: string;
};

export type UpdateListingInput = Omit<CreateListingInput, 'authorId' | 'kind'> & {
  kind?: ListingKind;
};

const LISTINGS_COLLECTION = 'listings';

function normalizeQuickSlots(raw: FirestoreListing['quickSlots']): QuickSlots {
  const applicants = Array.isArray(raw?.applicants)
    ? raw!.applicants
        .filter((a) => a && typeof a.uid === 'string' && a.uid)
        .slice(0, QUICK_SLOT_MAX)
        .map((a) => ({
          uid: String(a.uid),
          name: typeof a.name === 'string' ? a.name : 'Użytkownik',
          avatarUrl: typeof a.avatarUrl === 'string' ? a.avatarUrl : '',
          applicationId: typeof a.applicationId === 'string' ? a.applicationId : '',
          joinedAt:
            a.joinedAt && typeof (a.joinedAt as Timestamp).toDate === 'function'
              ? (a.joinedAt as Timestamp).toDate()
              : a.joinedAt instanceof Date
                ? a.joinedAt
                : null,
        }))
    : [];
  const max = typeof raw?.max === 'number' && raw.max > 0 ? raw.max : QUICK_SLOT_MAX;
  return {
    max,
    filled: Math.min(typeof raw?.filled === 'number' ? raw.filled : applicants.length, max),
    applicants,
  };
}

function normalizeListing(id: string, data: FirestoreListing): MarketListing {
  const kind: ListingKind = data.kind === 'quick' ? 'quick' : 'standard';
  const listing: MarketListing = {
    id,
    title: data.title || '',
    description: data.description || '',
    company: data.company || '',
    location: data.location || '',
    mode: data.mode || 'Na hali',
    type: data.type || 'Umowa zlecenie',
    intent: data.intent === 'seek' ? 'seek' : 'offer',
    kind,
    rateMin: Number.isFinite(data.rateMin) ? data.rateMin : 0,
    rateMax: Number.isFinite(data.rateMax) ? data.rateMax : 0,
    tags: Array.isArray(data.tags) ? data.tags.filter((v): v is string => typeof v === 'string') : [],
    targetRole: data.targetRole === 'employer' ? 'employer' : 'welder',
    authorId: data.authorId || '',
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
  if (kind === 'quick') {
    listing.quickSlots = normalizeQuickSlots(data.quickSlots);
    listing.quickStatus =
      data.quickStatus === 'full' ||
      data.quickStatus === 'awarded' ||
      data.quickStatus === 'closed'
        ? data.quickStatus
        : listing.quickSlots.filled >= listing.quickSlots.max
          ? 'full'
          : 'open';
    if (typeof data.selectedApplicantId === 'string' && data.selectedApplicantId) {
      listing.selectedApplicantId = data.selectedApplicantId;
    }
    if (typeof data.durationHint === 'string' && data.durationHint.trim()) {
      listing.durationHint = data.durationHint.trim();
    }
  }
  return listing;
}

function listingRef(id: string) {
  return doc(getFirebaseFirestore(), LISTINGS_COLLECTION, id);
}

export function isQuickListing(listing: Pick<MarketListing, 'kind'> | null | undefined): boolean {
  return listing?.kind === 'quick';
}

export function quickSlotsRemaining(listing: MarketListing): number {
  if (!isQuickListing(listing) || !listing.quickSlots) return 0;
  if (listing.quickStatus === 'awarded' || listing.quickStatus === 'closed') return 0;
  return Math.max(0, listing.quickSlots.max - listing.quickSlots.filled);
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

export async function getListing(id: string): Promise<MarketListing | null> {
  if (!id) return null;
  const snap = await getDoc(listingRef(id));
  if (!snap.exists()) return null;
  return normalizeListing(snap.id, snap.data() as FirestoreListing);
}

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
  const kind: ListingKind = input.kind === 'quick' ? 'quick' : 'standard';
  const payload: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    company: input.company,
    location: input.location,
    mode: input.mode,
    type: input.type,
    intent: input.intent,
    kind,
    rateMin: input.rateMin,
    rateMax: input.rateMax,
    tags: input.tags,
    targetRole: input.targetRole,
    authorId: input.authorId,
    createdAt: serverTimestamp(),
  };
  if (kind === 'quick') {
    payload.quickStatus = 'open';
    payload.quickSlots = { max: QUICK_SLOT_MAX, filled: 0, applicants: [] };
    if (input.durationHint?.trim()) payload.durationHint = input.durationHint.trim();
  }
  const ref = await addDoc(collection(getFirebaseFirestore(), LISTINGS_COLLECTION), payload);
  return ref.id;
}

export async function updateListing(id: string, input: UpdateListingInput) {
  const payload: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    company: input.company,
    location: input.location,
    mode: input.mode,
    type: input.type,
    intent: input.intent,
    rateMin: input.rateMin,
    rateMax: input.rateMax,
    tags: input.tags,
    targetRole: input.targetRole,
    updatedAt: serverTimestamp(),
  };
  if (input.durationHint !== undefined) {
    payload.durationHint = input.durationHint.trim();
  }
  await setDoc(listingRef(id), payload, { merge: true });
}

export async function markQuickListingAwarded(listingId: string, selectedApplicantId: string) {
  await setDoc(
    listingRef(listingId),
    {
      quickStatus: 'awarded',
      selectedApplicantId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteListing(id: string) {
  await deleteDoc(listingRef(id));
}
