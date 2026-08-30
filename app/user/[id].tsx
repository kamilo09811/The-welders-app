import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { TrustBadge } from '@/components/trust-badge';
import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { localeToBcp47 } from '@/lib/i18n';
import { usePreferences } from '@/lib/preferences-context';
import {
  canRateUser,
  deleteUserReview,
  getMyReviewForUser,
  submitUserReview,
} from '@/lib/public-profile';
import { getHeaderGradient } from '@/lib/theme';
import { usePublicProfile } from '@/lib/use-public-profile';
import { useCurrentUserProfile } from '@/lib/user-profile';

export default function PublicProfileScreen() {
  const router = useRouter();
  const { t, locale, colors, theme } = usePreferences();
  const localeTag = localeToBcp47(locale);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const targetId = typeof id === 'string' ? id : '';
  const { uid, profile: myProfile } = useCurrentUserProfile();
  const { profile, reviews, loading } = usePublicProfile(targetId || undefined);
  const headerGradient = getHeaderGradient(theme);

  const isSelf = Boolean(uid && targetId && uid === targetId);

  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [hasMyReview, setHasMyReview] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myReviewText, setMyReviewText] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!uid || !targetId || isSelf) {
      setEligible(false);
      setEligibilityChecked(true);
      return;
    }
    setEligibilityChecked(false);
    void canRateUser(uid, targetId).then((ok) => {
      if (!cancelled) {
        setEligible(ok);
        setEligibilityChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [uid, targetId, isSelf]);

  useEffect(() => {
    if (!uid || !targetId || isSelf) return;
    void getMyReviewForUser(targetId, uid).then((r) => {
      if (r) {
        setHasMyReview(true);
        setMyRating(r.rating);
        setMyReviewText(r.text);
      } else {
        setHasMyReview(false);
        setMyRating(5);
        setMyReviewText('');
      }
    });
  }, [uid, targetId, isSelf]);

  const onSubmitReview = useCallback(async () => {
    if (!uid || !targetId || isSelf || !eligible) return;
    setReviewBusy(true);
    setReviewMsg(null);
    try {
      await submitUserReview({
        targetUid: targetId,
        reviewerId: uid,
        reviewerName: myProfile.fullName || t('common.userFallback'),
        rating: myRating,
        text: myReviewText,
      });
      setHasMyReview(true);
      setReviewMsg(t('profile.reviewSaved'));
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      if (code === 'NOT_ELIGIBLE') setReviewMsg(t('profile.noEligibility'));
      else setReviewMsg(t('profile.reviewFailed'));
    } finally {
      setReviewBusy(false);
    }
  }, [eligible, isSelf, myProfile.fullName, myRating, myReviewText, t, targetId, uid]);

  const onDeleteReview = useCallback(async () => {
    if (!uid || !targetId || !hasMyReview) return;
    setReviewBusy(true);
    setReviewMsg(null);
    try {
      await deleteUserReview(targetId, uid);
      setHasMyReview(false);
      setMyRating(5);
      setMyReviewText('');
      setReviewMsg(t('profile.reviewDeleted'));
    } catch {
      setReviewMsg(t('profile.reviewFailed'));
    } finally {
      setReviewBusy(false);
    }
  }, [hasMyReview, t, targetId, uid]);

  const roleText =
    profile?.role === 'employer' ? t('account.roleEmployer') : t('account.roleWelder');

  const formatReviewDate = (d: Date | null) => {
    if (!d) return '';
    try {
      return d.toLocaleDateString(localeTag, { dateStyle: 'medium' });
    } catch {
      return '';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={[...headerGradient]} locations={[0, 0.5]} style={styles.bgGlow} />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : !profile ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.note, { color: colors.textMuted }]}>{t('profile.notFound')}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <UserAvatarPressable
                  userId={profile.uid}
                  avatarUrl={profile.avatarUrl}
                  size={88}
                  disabled
                />
                <Text style={[styles.name, { color: colors.text }]}>
                  {profile.fullName || t('common.userFallback')}
                </Text>
                <Text style={[styles.role, { color: colors.primary }]}>{roleText}</Text>
                {profile.city ? (
                  <Text style={[styles.city, { color: colors.textSoft }]}>{profile.city}</Text>
                ) : null}

                <View style={styles.trustRow}>
                  <TrustBadge
                    average={profile.ratingAverage}
                    count={profile.ratingCount}
                    locale={locale}
                    colors={colors}
                    size={22}
                  />
                </View>

                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statBox,
                      { backgroundColor: colors.primaryMuted, borderColor: colors.border },
                    ]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {profile.completedAsApplicant}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                      {t('profile.completedApplicant')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statBox,
                      { backgroundColor: colors.primaryMuted, borderColor: colors.border },
                    ]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {profile.completedAsAuthor}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                      {t('profile.completedAuthor')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('profile.about')}</Text>
                {profile.publicBio ? (
                  <Text style={[styles.bio, { color: colors.textMuted }]}>{profile.publicBio}</Text>
                ) : (
                  <Text style={[styles.note, { color: colors.textSoft }]}>{t('profile.noBio')}</Text>
                )}
              </View>

              {!isSelf && eligibilityChecked ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {hasMyReview ? t('profile.yourReview') : t('profile.rateUser')}
                  </Text>
                  {eligible ? (
                    <>
                      <StarRating value={myRating} onChange={setMyRating} allowHalf={false} />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                          },
                        ]}
                        value={myReviewText}
                        onChangeText={setMyReviewText}
                        placeholder={t('profile.reviewPlaceholder')}
                        placeholderTextColor={colors.textSoft}
                        multiline
                        maxLength={2000}
                      />
                      <Pressable
                        style={[
                          styles.primaryBtn,
                          { backgroundColor: colors.primary },
                          reviewBusy && styles.btnDisabled,
                        ]}
                        onPress={onSubmitReview}
                        disabled={reviewBusy}>
                        {reviewBusy ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.primaryBtnText}>
                            {hasMyReview ? t('profile.updateReview') : t('profile.saveReview')}
                          </Text>
                        )}
                      </Pressable>
                      {hasMyReview ? (
                        <Pressable
                          style={styles.deleteBtn}
                          onPress={onDeleteReview}
                          disabled={reviewBusy}>
                          <Text style={[styles.deleteBtnText, { color: colors.danger }]}>
                            {t('profile.deleteReview')}
                          </Text>
                        </Pressable>
                      ) : null}
                    </>
                  ) : (
                    <Text style={[styles.note, { color: colors.textMuted }]}>
                      {t('profile.rateLocked')}
                    </Text>
                  )}
                  {reviewMsg ? (
                    <Text style={[styles.reviewMsg, { color: colors.primary }]}>{reviewMsg}</Text>
                  ) : null}
                </View>
              ) : null}

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('profile.reviews')}</Text>
                {reviews.length === 0 ? (
                  <Text style={[styles.note, { color: colors.textSoft }]}>{t('profile.noReviews')}</Text>
                ) : (
                  reviews.map((r, idx) => (
                    <View
                      key={r.id}
                      style={[
                        styles.reviewRow,
                        idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                      ]}>
                      <View style={styles.reviewHead}>
                        <Pressable
                          style={{ flex: 1 }}
                          onPress={() =>
                            r.reviewerId
                              ? router.push({ pathname: '/user/[id]', params: { id: r.reviewerId } })
                              : undefined
                          }>
                          <Text style={[styles.reviewerName, { color: colors.text }]} numberOfLines={1}>
                            {r.reviewerName || t('common.userFallback')}
                          </Text>
                        </Pressable>
                        <StarRating value={r.rating} size={16} allowHalf={false} />
                      </View>
                      {r.text ? (
                        <Text style={[styles.reviewText, { color: colors.textMuted }]}>{r.text}</Text>
                      ) : null}
                      {r.createdAt ? (
                        <Text style={[styles.reviewDate, { color: colors.textSoft }]}>
                          {formatReviewDate(r.createdAt)}
                        </Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>

              {isSelf ? (
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => router.push('/(tabs)/account' as never)}>
                  <Text style={[styles.linkBtnText, { color: colors.primary }]}>
                    {t('profile.editInAccount')}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgGlow: { position: 'absolute', left: 0, right: 0, top: 0, height: 140 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSpacer: { width: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  name: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  role: { fontSize: 13, fontWeight: '700' },
  city: { fontSize: 13 },
  trustRow: { alignItems: 'center', marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center', marginTop: 4, lineHeight: 13 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  bio: { fontSize: 14, lineHeight: 21 },
  note: { fontSize: 13, lineHeight: 18 },
  hint: { fontSize: 12, lineHeight: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  btnDisabled: { opacity: 0.65 },
  deleteBtn: { alignSelf: 'center', paddingVertical: 6 },
  deleteBtnText: { fontWeight: '700', fontSize: 13 },
  reviewMsg: { fontSize: 13, textAlign: 'center' },
  reviewRow: { paddingTop: 10, gap: 4 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  reviewerName: { fontWeight: '700', flex: 1 },
  reviewText: { fontSize: 13, lineHeight: 18 },
  reviewDate: { fontSize: 11, fontWeight: '500' },
  linkBtn: { alignSelf: 'center', padding: 12 },
  linkBtnText: { fontWeight: '700' },
});
