import { useEffect, useState } from 'react';

import {
  fetchPublicUserProfile,
  subscribePublicUserProfile,
  subscribeUserReviews,
  type PublicUserProfile,
  type UserReview,
} from '@/lib/public-profile';

export function usePublicProfile(uid?: string) {
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
  }, [uid]);

  return { profile, reviews, loading };
}

export function usePublicProfileOnce(uid?: string) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchPublicUserProfile(uid).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [uid]);

  return { profile, loading };
}
