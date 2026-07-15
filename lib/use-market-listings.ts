import { useEffect, useState } from 'react';

import { subscribeListings, type MarketListing } from '@/lib/market-listings';

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
