import { useEffect, useState } from 'react';

import {
  subscribeApplicationsByApplicant,
  subscribeApplicationsByAuthor,
  subscribeApplicationsForListing,
  subscribeMyApplicationForListing,
  type ListingApplication,
} from '@/lib/listing-applications';

export function useListingApplications(listingId?: string, authorId?: string, enabled = true) {
  const [applications, setApplications] = useState<ListingApplication[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && listingId && authorId));

  useEffect(() => {
    if (!enabled || !listingId || !authorId) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeApplicationsForListing(
      listingId,
      authorId,
      (items) => {
        setApplications(items);
        setLoading(false);
      },
      () => {
        setApplications([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [authorId, enabled, listingId]);

  return { applications, loading };
}

export function useMyListingApplication(listingId?: string, applicantId?: string, enabled = true) {
  const [application, setApplication] = useState<ListingApplication | null>(null);
  const [loading, setLoading] = useState(Boolean(enabled && listingId && applicantId));

  useEffect(() => {
    if (!enabled || !listingId || !applicantId) {
      setApplication(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeMyApplicationForListing(
      listingId,
      applicantId,
      (item) => {
        setApplication(item);
        setLoading(false);
      },
      () => {
        setApplication(null);
        setLoading(false);
      }
    );
    return unsub;
  }, [applicantId, enabled, listingId]);

  return { application, loading };
}

export function useApplicationsByApplicant(applicantId?: string, enabled = true) {
  const [applications, setApplications] = useState<ListingApplication[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && applicantId));

  useEffect(() => {
    if (!enabled || !applicantId) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeApplicationsByApplicant(
      applicantId,
      (items) => {
        setApplications(items);
        setLoading(false);
      },
      () => {
        setApplications([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [applicantId, enabled]);

  return { applications, loading };
}

export function useApplicationsByAuthor(authorId?: string, enabled = true) {
  const [applications, setApplications] = useState<ListingApplication[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && authorId));

  useEffect(() => {
    if (!enabled || !authorId) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeApplicationsByAuthor(
      authorId,
      (items) => {
        setApplications(items);
        setLoading(false);
      },
      () => {
        setApplications([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [authorId, enabled]);

  return { applications, loading };
}
