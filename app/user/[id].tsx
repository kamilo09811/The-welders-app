import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StarRating } from '@/components/star-rating';
import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { getMyReviewForUser, submitUserReview } from '@/lib/public-profile';
import { usePublicProfile } from '@/lib/use-public-profile';
import { useCurrentUserProfile } from '@/lib/user-profile';

const ROLE_LABEL: Record<'welder' | 'employer', string> = {
  welder: 'Spawacz',
  employer: 'Pracodawca / zleceniodawca',
};

function formatRating(avg: number) {
  if (!avg) return '—';
  return avg.toFixed(1).replace('.', ',');
}

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const targetId = typeof id === 'string' ? id : '';
  const { uid, profile: myProfile } = useCurrentUserProfile();
  const { profile, reviews, loading } = usePublicProfile(targetId || undefined);

  const isSelf = Boolean(uid && targetId && uid === targetId);
  const canReview = Boolean(uid && targetId && !isSelf);

  const [myRating, setMyRating] = useState(5);
  const [myReviewText, setMyReviewText] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!canReview || !uid || !targetId) return;
    void getMyReviewForUser(targetId, uid).then((r) => {
      if (r) {
        setMyRating(r.rating);
        setMyReviewText(r.text);
      }
    });
  }, [canReview, targetId, uid]);

  const displayRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((s, r) => s + r.rating, 0);
      return { avg: sum / reviews.length, count: reviews.length };
    }
    return { avg: profile?.ratingAverage ?? 0, count: profile?.ratingCount ?? 0 };
  }, [profile, reviews]);

  const onSubmitReview = useCallback(async () => {
    if (!uid || !targetId || isSelf) return;
    setReviewBusy(true);
    setReviewMsg(null);
    try {
      await submitUserReview({
        targetUid: targetId,
        reviewerId: uid,
        reviewerName: myProfile.fullName || 'Użytkownik',
        rating: myRating,
        text: myReviewText,
      });
      setReviewMsg('Opinia zapisana. Dziękujemy!');
    } catch {
      setReviewMsg('Nie udało się zapisać opinii.');
    } finally {
      setReviewBusy(false);
    }
  }, [isSelf, myProfile.fullName, myRating, myReviewText, targetId, uid]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
          </Pressable>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#0E4AA4" />
          </View>
        ) : !profile ? (
          <View style={styles.card}>
            <Text style={styles.note}>Nie znaleziono profilu użytkownika.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <UserAvatarPressable
                userId={profile.uid}
                avatarUrl={profile.avatarUrl}
                size={88}
                disabled
              />
              <Text style={styles.name}>{profile.fullName || 'Użytkownik'}</Text>
              <Text style={styles.role}>{ROLE_LABEL[profile.role]}</Text>
              {profile.city ? <Text style={styles.city}>{profile.city}</Text> : null}

              <View style={styles.trustRow}>
                <StarRating value={displayRating.avg || 0} size={22} />
                <Text style={styles.ratingText}>
                  {formatRating(displayRating.avg)} ({displayRating.count}{' '}
                  {displayRating.count === 1 ? 'opinia' : displayRating.count < 5 ? 'opinie' : 'opinii'})
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{profile.completedAsApplicant}</Text>
                  <Text style={styles.statLabel}>Zakończone jako wykonawca</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{profile.completedAsAuthor}</Text>
                  <Text style={styles.statLabel}>Zrealizowane jako zleceniodawca</Text>
                </View>
              </View>
            </View>

            {profile.publicBio ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>O mnie</Text>
                <Text style={styles.bio}>{profile.publicBio}</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.note}>Brak opisu publicznego.</Text>
              </View>
            )}

            {canReview ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Oceń użytkownika</Text>
                <StarRating value={myRating} onChange={setMyRating} />
                <TextInput
                  style={styles.input}
                  value={myReviewText}
                  onChangeText={setMyReviewText}
                  placeholder="Krótka opinia (opcjonalnie)"
                  placeholderTextColor="#94A3B8"
                  multiline
                />
                <Pressable
                  style={[styles.primaryBtn, reviewBusy && styles.btnDisabled]}
                  onPress={onSubmitReview}
                  disabled={reviewBusy}>
                  {reviewBusy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Zapisz opinię</Text>
                  )}
                </Pressable>
                {reviewMsg ? <Text style={styles.reviewMsg}>{reviewMsg}</Text> : null}
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Opinie</Text>
              {reviews.length === 0 ? (
                <Text style={styles.note}>Brak opinii.</Text>
              ) : (
                reviews.map((r) => (
                  <View key={r.id} style={styles.reviewRow}>
                    <View style={styles.reviewHead}>
                      <Text style={styles.reviewerName}>{r.reviewerName}</Text>
                      <StarRating value={r.rating} size={16} />
                    </View>
                    {r.text ? <Text style={styles.reviewText}>{r.text}</Text> : null}
                  </View>
                ))
              )}
            </View>

            {isSelf ? (
              <Pressable style={styles.linkBtn} onPress={() => router.push('/(tabs)/account' as never)}>
                <Text style={styles.linkBtnText}>Edytuj profil w Koncie</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DEEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSpacer: { width: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 8 },
  role: { fontSize: 13, fontWeight: '700', color: '#0E4AA4' },
  city: { fontSize: 13, color: '#64748B' },
  trustRow: { alignItems: 'center', marginTop: 10, gap: 6 },
  ratingText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0E4AA4' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 4, lineHeight: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#10233E' },
  bio: { fontSize: 14, lineHeight: 21, color: '#334155' },
  note: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 11,
    backgroundColor: '#F8FAFD',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    borderRadius: 11,
    backgroundColor: '#0E4AA4',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  btnDisabled: { opacity: 0.65 },
  reviewMsg: { fontSize: 13, color: '#0E4AA4', textAlign: 'center' },
  reviewRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F8',
    paddingTop: 10,
    gap: 4,
  },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  reviewText: { fontSize: 13, color: '#475569', lineHeight: 18 },
  linkBtn: { alignSelf: 'center', padding: 12 },
  linkBtnText: { color: '#0E4AA4', fontWeight: '700' },
});
