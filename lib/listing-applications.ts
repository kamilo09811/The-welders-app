import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebaseFirestore';
import { pushInAppNotification } from '@/lib/in-app-notifications';
import type { AccountRole, UserProfile } from '@/lib/user-profile';

export type ListingApplication = {
  id: string;
  listingId: string;
  listingTitle: string;
  authorId: string;
  applicantId: string;
  applicantRole: AccountRole;
  applicantName: string;
  applicantPhone: string;
  message: string;
  status: 'new' | 'in_progress' | 'accepted' | 'rejected';
  createdAt: Date | null;
};

type FirestoreApplication = Omit<ListingApplication, 'id' | 'createdAt'> & {
  createdAt?: Timestamp;
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
    applicantPhone: data.applicantPhone || '',
    message: data.message || '',
    status,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

export async function createApplication(input: CreateApplicationInput) {
  const docRef = await addDoc(collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION), {
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    authorId: input.authorId,
    applicantId: input.applicantId,
    applicantRole: input.applicantRole,
    applicantName: input.applicantProfile.fullName || 'Użytkownik',
    applicantPhone: input.applicantProfile.phone || '',
    message: input.message.trim(),
    status: 'new',
    createdAt: serverTimestamp(),
  });
  const who = input.applicantProfile.fullName || 'Użytkownik';
  void pushInAppNotification({
    recipientUid: input.authorId,
    actorUid: input.applicantId,
    kind: 'application_new',
    title: 'Nowe zgłoszenie',
    body: `${who} — ${input.listingTitle}`,
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    applicationId: docRef.id,
  });
}

const STATUS_NOTIFY_LABEL: Record<ListingApplication['status'], string> = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  accepted: 'Zaakceptowane',
  rejected: 'Odrzucone',
};

export async function updateApplicationStatus(
  applicationId: string,
  status: ListingApplication['status']
) {
  const ref = doc(getFirebaseFirestore(), APPLICATIONS_COLLECTION, applicationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const prev = normalizeApplication(applicationId, snap.data() as FirestoreApplication);
  await setDoc(ref, { status, updatedAt: serverTimestamp() }, { merge: true });
  if (prev.status === status) return;
  void pushInAppNotification({
    recipientUid: prev.applicantId,
    actorUid: prev.authorId,
    kind: 'application_status',
    title: 'Zmiana statusu zgłoszenia',
    body: `„${prev.listingTitle}” — ${STATUS_NOTIFY_LABEL[status]}`,
    listingId: prev.listingId,
    listingTitle: prev.listingTitle,
    applicationId,
  });
}

export function subscribeApplicationsForListing(
  listingId: string,
  cb: (items: ListingApplication[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(
    collection(getFirebaseFirestore(), APPLICATIONS_COLLECTION),
    where('listingId', '==', listingId),
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
