import { getFunctions, httpsCallable } from 'firebase/functions';

import { getFirebaseApp } from '@/lib/firebaseApp';

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

/**
 * Wykup boostera ogłoszenia.
 * MVP: Cloud Function akceptuje mockPurchase (bez prawdziwego IAP).
 * Później: RevenueCat / StoreKit → ten sam callable po weryfikacji.
 */
export async function purchaseListingBoost(listingId: string, tier: BoostTierId) {
  const functions = getFunctions(getFirebaseApp(), 'europe-west1');
  const callable = httpsCallable(functions, 'boostListing');
  const result = await callable({
    listingId,
    tier,
    mockPurchase: true,
  });
  return result.data as { ok: boolean; boostedUntil?: string; tier?: string };
}
