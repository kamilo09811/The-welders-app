import { useEffect, useState } from 'react';

import {
  subscribeListing,
  subscribeListings,
  type MarketListing,
} from '@/lib/market-listings';
import { useAuthReady } from '@/lib/use-auth-ready';

export function useMarketListings() {
  const { ready, user } = useAuthReady();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      setLoading(true);
      return;
    }
    if (!user) {
      setListings([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const unsub = subscribeListings(
      (items) => {
        setListings(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? String((err as { code?: string }).code || '')
            : '';
        console.warn('[useMarketListings]', code || err);
        // Nie czyść listy przy przejściowym błędzie — zostaw poprzednie dane.
        setLoading(false);
        setError(code || 'listings-error');
      }
    );

    return unsub;
  }, [ready, user?.uid]);

  return { listings, loading, error };
}

/** Subskrypcja jednego ogłoszenia po id (ekrany szczegółów i edycji). */
export function useMarketListing(id: string | undefined) {
  const { ready, user } = useAuthReady();
  const [listing, setListing] = useState<MarketListing | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setListing(null);
      setLoading(false);
      return;
    }
    if (!ready || !user) {
      setLoading(Boolean(ready ? false : true));
      if (ready && !user) setListing(null);
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
  }, [id, ready, user?.uid]);

  return { listing, loading };
}
