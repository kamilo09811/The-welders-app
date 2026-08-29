import { useEffect, useState } from 'react';

import {
  subscribeListing,
  subscribeListings,
  type MarketListing,
} from '@/lib/market-listings';

export function useMarketListings() {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeListings(
      (items) => {
        setListings(items);
        setLoading(false);
      },
      () => {
        setListings([]);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  return { listings, loading };
}

/** Subskrypcja jednego ogłoszenia po id (ekrany szczegółów i edycji). */
export function useMarketListing(id: string | undefined) {
  const [listing, setListing] = useState<MarketListing | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setListing(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeListing(
      id,
      (item) => {
        setListing(item);
        setLoading(false);
      },
      () => {
        setListing(null);
        setLoading(false);
      }
    );
    return unsub;
  }, [id]);

  return { listing, loading };
}
