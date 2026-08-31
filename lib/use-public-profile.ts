import { useEffect, useState } from 'react';

import {
  fetchPublicUserProfile,
  subscribePublicUserProfile,
  subscribeUserReviews,
  type PublicUserProfile,
  type UserReview,
} from '@/lib/public-profile';
import { useAuthReady } from '@/lib/use-auth-ready';

export function usePublicProfile(uid?: string) {
  const { ready, user } = useAuthReady();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setReviews([]);
      setLoading(false);
      return;
    }
    if (!ready) {
      setLoading(true);
      return;
    }
    if (!user) {
      setProfile(null);
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubProfile = subscribePublicUserProfile(
      uid,
      (p) => {
        setProfile(p);
        setLoading(false);
      },
      () => {
        setProfile(null);
        setLoading(false);
      }
    );
    const unsubReviews = subscribeUserReviews(uid, setReviews, () => setReviews([]));
    return () => {
      unsubProfile();
      unsubReviews();
    };
  }, [ready, uid, user?.uid]);

  return { profile, reviews, loading };
}

export function usePublicProfileOnce(uid?: string) {
  const { ready, user } = useAuthReady();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (!ready) {
      setLoading(true);
      return;
    }
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetchPublicUserProfile(uid).then((p) => {
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready, uid, user?.uid]);

  return { profile, loading };
}
