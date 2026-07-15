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
    // Brak indeksu złożonego — statystyki 0 do czasu utworzenia indeksu w konsoli Firebase.
  }
  return { completedAsApplicant, completedAsAuthor };
}

function reviewsToRating(reviews: UserReview[]) {
  if (reviews.length === 0) return { ratingAverage: 0, ratingCount: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { ratingAverage: sum / reviews.length, ratingCount: reviews.length };
}

export async function fetchPublicUserProfile(uid: string): Promise<PublicUserProfile | null> {
  const snap = await getDoc(usersDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  const reviews = await fetchUserReviews(uid, 50);
  const { ratingAverage, ratingCount } = reviewsToRating(reviews);
  const completed = await countCompletedApplications(uid);
  return {
    uid,
    role: normalizeRole(data.role),
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    city: typeof data.city === 'string' ? data.city : '',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
    publicBio: typeof data.publicBio === 'string' ? data.publicBio : '',
    ratingAverage,
    ratingCount,
    ...completed,
  };
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
      const data = snap.data() as Record<string, unknown>;
      try {
        const reviews = await fetchUserReviews(uid, 50);
        const { ratingAverage, ratingCount } = reviewsToRating(reviews);
        const completed = await countCompletedApplications(uid);
        cb({
          uid,
          role: normalizeRole(data.role),
          fullName: typeof data.fullName === 'string' ? data.fullName : '',
          city: typeof data.city === 'string' ? data.city : '',
          avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
          publicBio: typeof data.publicBio === 'string' ? data.publicBio : '',
          ratingAverage,
          ratingCount,
          ...completed,
        });
      } catch (e) {
        onError?.(e);
        cb(null);
      }
    },
    (e) => onError?.(e)
  );
}

export async function fetchUserReviews(targetUid: string, max = 20): Promise<UserReview[]> {
  const q = query(reviewsCol(targetUid), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const createdAt =
      data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function'
        ? (data.createdAt as { toDate: () => Date }).toDate()
        : null;
    return {
      id: d.id,
      reviewerId: typeof data.reviewerId === 'string' ? data.reviewerId : '',
      reviewerName: typeof data.reviewerName === 'string' ? data.reviewerName : 'Użytkownik',
      rating: typeof data.rating === 'number' ? Math.min(5, Math.max(1, data.rating)) : 5,
      text: typeof data.text === 'string' ? data.text : '',
      createdAt,
    };
  });
}

export function subscribeUserReviews(
  targetUid: string,
  cb: (items: UserReview[]) => void,
  onError?: (e: unknown) => void
) {
  const q = query(reviewsCol(targetUid), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            reviewerId: typeof data.reviewerId === 'string' ? data.reviewerId : '',
            reviewerName: typeof data.reviewerName === 'string' ? data.reviewerName : 'Użytkownik',
            rating: typeof data.rating === 'number' ? Math.min(5, Math.max(1, data.rating)) : 5,
            text: typeof data.text === 'string' ? data.text : '',
            createdAt:
              data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function'
                ? (data.createdAt as { toDate: () => Date }).toDate()
                : null,
          };
        })
      );
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
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const ref = doc(getFirebaseFirestore(), 'users', input.targetUid, 'reviews', input.reviewerId);
  await setDoc(ref, {
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName.trim() || 'Użytkownik',
    rating,
    text: input.text.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function updatePublicBio(uid: string, publicBio: string) {
  await setDoc(
    usersDoc(uid),
    { publicBio: publicBio.trim(), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getMyReviewForUser(targetUid: string, reviewerId: string): Promise<UserReview | null> {
  const snap = await getDoc(doc(getFirebaseFirestore(), 'users', targetUid, 'reviews', reviewerId));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    id: snap.id,
    reviewerId: typeof data.reviewerId === 'string' ? data.reviewerId : '',
    reviewerName: typeof data.reviewerName === 'string' ? data.reviewerName : '',
    rating: typeof data.rating === 'number' ? data.rating : 5,
    text: typeof data.text === 'string' ? data.text : '',
    createdAt:
      data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function'
        ? (data.createdAt as { toDate: () => Date }).toDate()
        : null,
  };
}
