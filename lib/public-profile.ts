import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import type { AccountRole } from '@/lib/user-profile';

export type PublicUserProfile = {
  uid: string;
  role: AccountRole;
  fullName: string;
  city: string;
  avatarUrl: string;
  publicBio: string;
  ratingAverage: number;
  ratingCount: number;
  completedAsApplicant: number;
  completedAsAuthor: number;
};

export type UserReview = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

function usersDoc(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid);
}

function reviewsCol(uid: string) {
  return collection(getFirebaseFirestore(), 'users', uid, 'reviews');
}

function normalizeRole(v: unknown): AccountRole {
  return v === 'employer' ? 'employer' : 'welder';
}

function toDate(v: unknown): Date | null {
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return null;
}

function normalizeReview(id: string, data: Record<string, unknown>, fallbackName: string): UserReview {
  return {
    id,
    reviewerId: typeof data.reviewerId === 'string' ? data.reviewerId : '',
    reviewerName:
      typeof data.reviewerName === 'string' && data.reviewerName.trim()
        ? data.reviewerName
        : fallbackName,
    rating: typeof data.rating === 'number' ? Math.min(5, Math.max(1, Math.round(data.rating))) : 5,
    text: typeof data.text === 'string' ? data.text : '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

async function countCompletedApplications(uid: string) {
  const db = getFirebaseFirestore();
  let completedAsApplicant = 0;
  let completedAsAuthor = 0;
  try {
    const asApplicant = query(
      collection(db, 'applications'),
      where('applicantId', '==', uid),
      where('status', '==', 'accepted')
    );
    const asAuthor = query(
      collection(db, 'applications'),
      where('authorId', '==', uid),
      where('status', '==', 'accepted')
    );
    const [snapA, snapB] = await Promise.all([
      getCountFromServer(asApplicant),
      getCountFromServer(asAuthor),
    ]);
    completedAsApplicant = snapA.data().count;
    completedAsAuthor = snapB.data().count;
  } catch {
    // Brak indeksu złożonego — 0 do czasu indeksu w konsoli Firebase.
  }
  return { completedAsApplicant, completedAsAuthor };
}

function ratingFromUserDoc(data: Record<string, unknown>): { ratingAverage: number; ratingCount: number } | null {
  const count = data.ratingCount;
  const avg = data.ratingAverage;
  if (typeof count === 'number' && count >= 0 && typeof avg === 'number' && avg >= 0) {
    return { ratingAverage: avg, ratingCount: count };
  }
  return null;
}

async function ratingFromReviewsFallback(uid: string) {
  const reviews = await fetchUserReviews(uid, 100);
  if (reviews.length === 0) return { ratingAverage: 0, ratingCount: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return {
    ratingAverage: Math.round((sum / reviews.length) * 10) / 10,
    ratingCount: reviews.length,
  };
}

async function buildPublicProfile(
  uid: string,
  data: Record<string, unknown>
): Promise<PublicUserProfile> {
  const denorm = ratingFromUserDoc(data);
  const rating = denorm ?? (await ratingFromReviewsFallback(uid));
  const completed = await countCompletedApplications(uid);
  return {
    uid,
    role: normalizeRole(data.role),
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    city: typeof data.city === 'string' ? data.city : '',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
    publicBio: typeof data.publicBio === 'string' ? data.publicBio : '',
    ...rating,
    ...completed,
  };
}

/**
 * Ocena tylko po wspólnej zaakceptowanej współpracy (zgłoszenie accepted
 * w którąkolwiek stronę). Używa istniejących indeksów applicantId+status / authorId+status.
 */
export async function canRateUser(meId: string, targetId: string): Promise<boolean> {
  if (!meId || !targetId || meId === targetId) return false;
  const db = getFirebaseFirestore();
  try {
    const asApplicant = query(
      collection(db, 'applications'),
      where('applicantId', '==', meId),
      where('status', '==', 'accepted'),
      limit(25)
    );
    const asAuthor = query(
      collection(db, 'applications'),
      where('authorId', '==', meId),
      where('status', '==', 'accepted'),
      limit(25)
    );
    const [snapA, snapB] = await Promise.all([getDocs(asApplicant), getDocs(asAuthor)]);
    if (snapA.docs.some((d) => d.data().authorId === targetId)) return true;
    if (snapB.docs.some((d) => d.data().applicantId === targetId)) return true;
    return false;
  } catch {
    return false;
  }
}

export async function fetchPublicUserProfile(uid: string): Promise<PublicUserProfile | null> {
  const snap = await getDoc(usersDoc(uid));
  if (!snap.exists()) return null;
  return buildPublicProfile(uid, snap.data() as Record<string, unknown>);
}

export function subscribePublicUserProfile(
  uid: string,
  cb: (profile: PublicUserProfile | null) => void,
  onError?: (e: unknown) => void
) {
  return onSnapshot(
    usersDoc(uid),
    async (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      try {
        cb(await buildPublicProfile(uid, snap.data() as Record<string, unknown>));
      } catch (e) {
        onError?.(e);
        cb(null);
      }
    },
    (e) => onError?.(e)
  );
}

export async function fetchUserReviews(targetUid: string, max = 30): Promise<UserReview[]> {
  const q = query(reviewsCol(targetUid), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeReview(d.id, d.data() as Record<string, unknown>, 'User'));
}

export function subscribeUserReviews(
  targetUid: string,
  cb: (items: UserReview[]) => void,
  onError?: (e: unknown) => void
) {
  const q = query(reviewsCol(targetUid), orderBy('createdAt', 'desc'), limit(40));
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => normalizeReview(d.id, d.data() as Record<string, unknown>, 'User')));
    },
    (e) => onError?.(e)
  );
}

/** Jedna opinia na parę (reviewer → target); dokument o id = reviewerId. */
export async function submitUserReview(input: {
  targetUid: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  text: string;
}) {
  if (input.targetUid === input.reviewerId) {
    throw new Error('SELF_REVIEW');
  }
  const allowed = await canRateUser(input.reviewerId, input.targetUid);
  if (!allowed) {
    throw new Error('NOT_ELIGIBLE');
  }
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const text = input.text.trim().slice(0, 2000);
  const ref = doc(getFirebaseFirestore(), 'users', input.targetUid, 'reviews', input.reviewerId);
  const existing = await getDoc(ref);
  const payload: Record<string, unknown> = {
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName.trim() || 'User',
    rating,
    text,
    updatedAt: serverTimestamp(),
  };
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(ref, payload, { merge: true });
}

export async function deleteUserReview(targetUid: string, reviewerId: string) {
  await deleteDoc(doc(getFirebaseFirestore(), 'users', targetUid, 'reviews', reviewerId));
}

export async function updatePublicBio(uid: string, publicBio: string) {
  await setDoc(
    usersDoc(uid),
    { publicBio: publicBio.trim(), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getMyReviewForUser(
  targetUid: string,
  reviewerId: string
): Promise<UserReview | null> {
  const snap = await getDoc(doc(getFirebaseFirestore(), 'users', targetUid, 'reviews', reviewerId));
  if (!snap.exists()) return null;
  return normalizeReview(snap.id, snap.data() as Record<string, unknown>, '');
}
