import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { getFirebaseApp } from '@/lib/firebaseApp';
import { getFirebaseFirestore } from '@/lib/firebaseFirestore';

export type BoostTierId = '3d' | '7d' | '14d';

export type BoostTier = {
  id: BoostTierId;
  days: number;
  /** Etykieta ceny MVP (przed IAP / RevenueCat). */
  pricePln: string;
  /** Docelowy product id sklepu. */
  productId: string;
};

export const BOOST_TIERS: BoostTier[] = [
  { id: '3d', days: 3, pricePln: '9,99 zł', productId: 'boost_3d' },
  { id: '7d', days: 7, pricePln: '19,99 zł', productId: 'boost_7d' },
  { id: '14d', days: 14, pricePln: '34,99 zł', productId: 'boost_14d' },
];

export function getBoostTier(id: BoostTierId): BoostTier | undefined {
  return BOOST_TIERS.find((t) => t.id === id);
}

function callableErrorCode(err: unknown): string {
  if (!err || typeof err !== 'object') return '';
  const code = (err as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
}

/** Czy błąd callable wygląda na brak wdrożonej funkcji / niedostępność. */
function shouldFallbackToClientWrite(err: unknown): boolean {
  const code = callableErrorCode(err);
  return (
    code === 'functions/not-found' ||
    code === 'functions/unavailable' ||
    code === 'functions/internal' ||
    code === 'not-found' ||
    code === 'unavailable'
  );
}

/**
 * MVP bez Cloud Function: autor zapisuje boost na dokumencie (reguły to dopuszczają).
 * Po IAP / RevenueCat zostaje tylko ścieżka callable.
 */
async function applyListingBoostClient(listingId: string, tier: BoostTierId) {
  const tierDef = getBoostTier(tier);
  if (!tierDef) {
    throw new Error('Invalid boost tier');
  }

  const ref = doc(getFirebaseFirestore(), 'listings', listingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Listing not found');
  }

  const data = snap.data() as {
    boostedUntil?: { toDate?: () => Date };
  };
  const currentUntil = data.boostedUntil?.toDate?.()?.getTime?.() || 0;
  const baseMs = Math.max(Date.now(), currentUntil);
  const until = new Date(baseMs + tierDef.days * 24 * 60 * 60 * 1000);

  await setDoc(
    ref,
    {
      boostedUntil: Timestamp.fromDate(until),
      boostTier: tier,
      boostProductId: tierDef.productId,
      boostedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    ok: true as const,
    tier,
    boostedUntil: until.toISOString(),
    via: 'client' as const,
  };
}

/**
 * Wykup boostera ogłoszenia.
 * 1) Próbuje Cloud Function `boostListing` (docelowa ścieżka po IAP).
 * 2) Gdy CF nie jest wdrożona — fallback: zapis klienta (mock MVP).
 */
export async function purchaseListingBoost(listingId: string, tier: BoostTierId) {
  try {
    const functions = getFunctions(getFirebaseApp(), 'europe-west1');
    const callable = httpsCallable(functions, 'boostListing');
    const result = await callable({
      listingId,
      tier,
      mockPurchase: true,
    });
    return {
      ...(result.data as { ok: boolean; boostedUntil?: string; tier?: string }),
      via: 'callable' as const,
    };
  } catch (err) {
    if (shouldFallbackToClientWrite(err)) {
      return applyListingBoostClient(listingId, tier);
    }
    throw err;
  }
}
