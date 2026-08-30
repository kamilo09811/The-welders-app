import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoostListingSheet } from '@/components/boost-listing-sheet';
import { BoostedFrame } from '@/components/boosted-frame';
import { ListingLocationMap } from '@/components/listing-location-map';
import { QuickSlotsAvatars } from '@/components/quick-slots-avatars';
import { TrustBadge } from '@/components/trust-badge';
import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { createOrGetConversation } from '@/lib/chat';
import { localeToBcp47 } from '@/lib/i18n';
import {
  applicationStatusLabel,
  listingIntentShort,
  listingTypeLabel,
  quickDurationLabel,
  roleLabel,
  workModeLabel,
} from '@/lib/i18n/labels';
import {
  createApplication,
  repairOwnQuickSlot,
  selectQuickJobWinner,
  updateApplicationStatus,
  type ListingApplication,
} from '@/lib/listing-applications';
import {
  deleteListing,
  isListingBoosted,
  isQuickListing,
} from '@/lib/market-listings';
import { useListingApplications, useMyListingApplication } from '@/lib/use-listing-applications';
import { getPublicUserInfo, useCurrentUserProfile } from '@/lib/user-profile';
import { formatRateLabel } from '@/lib/user-settings';
import { usePreferences } from '@/lib/preferences-context';
import { useMarketListing } from '@/lib/use-market-listings';
import { usePublicProfileOnce } from '@/lib/use-public-profile';

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id: idParam, boost: boostParam } = useLocalSearchParams<{ id?: string; boost?: string }>();
  const id = typeof idParam === 'string' ? idParam : undefined;
  const { uid, profile } = useCurrentUserProfile();
  const { settings, locale, t, colors } = usePreferences();
  const localeTag = localeToBcp47(locale);
  const { listing, loading: loadingListing } = useMarketListing(id);
  const { profile: authorProfile } = usePublicProfileOnce(listing?.authorId);

  const isAuthor = Boolean(uid && listing && listing.authorId === uid);
  const quick = isQuickListing(listing);
  const boosted = isListingBoosted(listing);
  const [applyMessage, setApplyMessage] = useState('');
  const [busyApply, setBusyApply] = useState(false);
  const [busySelect, setBusySelect] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [boostOpen, setBoostOpen] = useState(false);

  useEffect(() => {
    if (boostParam === '1' && isAuthor && listing) {
      setBoostOpen(true);
    }
  }, [boostParam, isAuthor, listing?.id]);
  const { applications, loading: loadingApplications } = useListingApplications(
    listing?.id,
    listing?.authorId,
    isAuthor
  );
  const { application: myApplication } = useMyListingApplication(
    listing?.id,
    uid ?? undefined,
    Boolean(uid && listing && !isAuthor)
  );

  const sortedApps = useMemo(() => {
    const list = [...applications];
    if (quick) {
      list.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
    }
    return list;
  }, [applications, quick]);

  /** Sloty z listing + natychmiast własny awatar po dołączeniu (zanim dojdzie snapshot). */
  const displaySlotApplicants = useMemo(() => {
    const fromListing = listing?.quickSlots?.applicants || [];
    if (!uid || !quick) return fromListing;
    if (fromListing.some((a) => a.uid === uid)) return fromListing;
    if (!myApplication) return fromListing;
    return [
      ...fromListing,
      {
        uid,
        name: myApplication.applicantName || profile.fullName || t('listing.you'),
        avatarUrl: myApplication.applicantAvatarUrl || profile.avatarUrl || '',
        applicationId: myApplication.id,
        joinedAt: myApplication.createdAt,
      },
    ].slice(0, 5);
  }, [
    listing?.quickSlots?.applicants,
    uid,
    quick,
    myApplication,
    profile.avatarUrl,
    profile.fullName,
    t,
  ]);

  const slotsLeft = Math.max(0, 5 - displaySlotApplicants.length);
  const canJoinQuick =
    quick &&
    !isAuthor &&
    !myApplication &&
    listing?.quickStatus !== 'awarded' &&
    listing?.quickStatus !== 'closed' &&
    slotsLeft > 0;

  useEffect(() => {
    if (!quick || !uid || !listing?.id || !myApplication) return;
    const already = (listing.quickSlots?.applicants || []).some((a) => a.uid === uid);
    if (already) return;
    void repairOwnQuickSlot({
      listingId: listing.id,
      applicantId: uid,
      applicantName: myApplication.applicantName || profile.fullName || t('common.userFallback'),
      applicantAvatarUrl: myApplication.applicantAvatarUrl || profile.avatarUrl || '',
      applicationId: myApplication.id,
    }).catch(() => {
      // Reguły / pełne sloty — UI i tak pokazuje optymistycznie.
    });
  }, [
    quick,
    uid,
    listing?.id,
    listing?.quickSlots?.applicants,
    myApplication,
    profile.avatarUrl,
    profile.fullName,
    t,
  ]);

  const onDelete = async () => {
    if (!listing || !isAuthor) return;
    await deleteListing(listing.id);
    router.replace('/(tabs)');
  };

  const onApply = async () => {
    if (!listing || !uid || isAuthor) return;
    setBusyApply(true);
    setFeedback(null);
    try {
      await createApplication({
        listingId: listing.id,
        listingTitle: listing.title,
        authorId: listing.authorId,
        applicantId: uid,
        applicantRole: profile.role,
        applicantProfile: profile,
        message: applyMessage.trim() || '',
      });
      setApplyMessage('');
      setFeedback(quick ? t('listing.joinedQuick') : t('listing.appliedOk'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setFeedback(msg || t('listing.applyFailed'));
    } finally {
      setBusyApply(false);
    }
  };

  const onStatusChange = async (applicationId: string, status: ListingApplication['status']) => {
    await updateApplicationStatus(applicationId, status);
  };

  const onSelectWinner = async (applicationId: string) => {
    if (!listing || !isAuthor) return;
    setBusySelect(applicationId);
    setFeedback(null);
    try {
      await selectQuickJobWinner(listing, applicationId);
      setFeedback(t('listing.winnerPicked'));
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : t('listing.pickFailed'));
    } finally {
      setBusySelect(null);
    }
  };

  const openChat = async (otherId: string, otherName: string) => {
    if (!listing || !uid || !otherId) {
      setFeedback(t('listing.chatUnavailable'));
      return;
    }
    try {
      const otherUser = await getPublicUserInfo(otherId);
      const conversationId = await createOrGetConversation({
        listingId: listing.id,
        listingTitle: listing.title,
        meId: uid,
        meName: profile.fullName || roleLabel(profile.role, t),
        meAvatarUrl: profile.avatarUrl || '',
        otherId,
        otherName: otherUser.fullName || otherName || t('common.userFallback'),
        otherAvatarUrl: otherUser.avatarUrl || '',
      });
      router.push({ pathname: '/messages/[id]', params: { id: conversationId } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setFeedback(msg || t('listing.chatFailed'));
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
            </Pressable>
            <Text style={styles.headerTitle}>
              {quick ? t('listing.quickDetailTitle') : t('listing.detailTitle')}
            </Text>
          </View>

          {!listing ? (
            <View style={styles.emptyCard}>
              {loadingListing ? (
                <ActivityIndicator color="#0E4AA4" />
              ) : (
                <>
                  <Text style={styles.emptyTitle}>{t('listing.notFound')}</Text>
                  <Text style={styles.emptySub}>{t('listing.notFoundSub')}</Text>
                </>
              )}
            </View>
          ) : (
            <>
              {(() => {
                const header = (
                  <>
                    {boosted && listing.boostedUntil ? (
                      <Text style={[styles.boostUntil, { color: colors.warning }]}>
                        {t('boost.activeUntil', {
                          date: listing.boostedUntil.toLocaleDateString(localeTag, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }),
                        })}
                      </Text>
                    ) : null}
                    <View style={styles.typeRow}>
                      {quick ? (
                        <Text style={[styles.type, styles.quickType]}>{t('listing.quickDetailTitle')}</Text>
                      ) : (
                        <Text style={styles.type}>{listingTypeLabel(listing.type, t)}</Text>
                      )}
                      <Text style={[styles.type, styles.intentType]}>
                        {listingIntentShort(listing.intent, t)}
                      </Text>
                      {quick && listing.durationHint ? (
                        <Text style={[styles.type, styles.durationType]}>
                          {quickDurationLabel(listing.durationHint, t)}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.title}>{listing.title}</Text>
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: '/user/[id]', params: { id: listing.authorId } })
                      }>
                      <Text style={styles.company}>{listing.company || t('listing.privateListing')}</Text>
                      {authorProfile ? (
                        <View style={{ marginTop: 6 }}>
                          <TrustBadge
                            average={authorProfile.ratingAverage}
                            count={authorProfile.ratingCount}
                            locale={locale}
                            colors={colors}
                            size={14}
                            compact
                          />
                        </View>
                      ) : null}
                    </Pressable>

                    <View style={styles.metaRow}>
                      <MaterialIcons name="place" size={16} color="#64748B" />
                      <Text style={styles.metaText}>{listing.location}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.metaText}>{workModeLabel(listing.mode, t)}</Text>
                    </View>

                    <Text style={styles.rateLabel}>
                      {quick ? t('listing.budgetLabel') : t('listing.rateLabel')}
                      {formatRateLabel(listing.rateMin, listing.rateMax, settings.showGrossRate, locale)}
                    </Text>

                    {listing.tags.length > 0 ? (
                      <View style={styles.tagsWrap}>
                        {listing.tags.map((tag) => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </>
                );

                if (boosted) {
                  return (
                    <BoostedFrame colors={colors} label={t('boost.badge')}>
                      <View style={styles.boostInner}>{header}</View>
                    </BoostedFrame>
                  );
                }

                return <View style={[styles.card, quick && styles.cardQuick]}>{header}</View>;
              })()}

              <ListingLocationMap
                locationText={listing.location}
                colors={colors}
                t={t}
                emphasize={quick}
              />

              {quick ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t('listing.slotsTitle')}</Text>
                  <Text style={styles.description}>
                    {listing.quickStatus === 'awarded'
                      ? t('listing.slotsAwarded')
                      : listing.quickStatus === 'full'
                        ? t('listing.slotsFull')
                        : t('listing.slotsFree', { n: slotsLeft })}
                  </Text>
                  <QuickSlotsAvatars applicants={displaySlotApplicants} />
                </View>
              ) : null}

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>{t('listing.description')}</Text>
                <Text style={styles.description}>{listing.description}</Text>
              </View>

              {!isAuthor ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    {quick ? t('listing.joinSection') : t('listing.applySection')}
                  </Text>
                  {myApplication ? (
                    <Text style={styles.successText}>
                      {quick
                        ? t('listing.alreadyJoined', {
                            status: applicationStatusLabel(myApplication.status, t),
                          })
                        : t('listing.alreadyApplied', {
                            status: applicationStatusLabel(myApplication.status, t),
                          })}
                    </Text>
                  ) : canJoinQuick || !quick ? (
                    <>
                      <TextInput
                        style={styles.messageInput}
                        value={applyMessage}
                        onChangeText={setApplyMessage}
                        multiline
                        placeholder={
                          quick ? t('listing.joinPlaceholder') : t('listing.applyPlaceholder')
                        }
                        placeholderTextColor="#94A3B8"
                      />
                      <Pressable
                        style={[styles.ctaBtn, quick && styles.ctaBtnQuick]}
                        onPress={() => void onApply()}
                        disabled={busyApply}>
                        <Text style={styles.ctaText}>
                          {busyApply
                            ? t('listing.sending')
                            : quick
                              ? t('listing.joinSeat')
                              : t('listing.sendApply')}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <Text style={styles.description}>{t('listing.noSlots')}</Text>
                  )}
                  {feedback ? <Text style={styles.successText}>{feedback}</Text> : null}
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      void openChat(listing.authorId, listing.company || t('listing.publisher'));
                    }}>
                    <Text style={styles.secondaryBtnText}>{t('listing.messageAuthor')}</Text>
                  </Pressable>
                </View>
              ) : null}

              {isAuthor ? (
                <View style={styles.ownerActions}>
                  <Pressable style={styles.boostBtn} onPress={() => setBoostOpen(true)}>
                    <MaterialIcons name="rocket-launch" size={16} color="#FFFFFF" />
                    <Text style={styles.boostBtnText}>
                      {boosted ? t('boost.extend') : t('boost.cta')}
                    </Text>
                  </Pressable>
                  {!quick ? (
                    <Pressable
                      style={styles.editBtn}
                      onPress={() =>
                        router.push({ pathname: '/listing/edit/[id]', params: { id: listing.id } })
                      }>
                      <MaterialIcons name="edit" size={16} color="#0E4AA4" />
                      <Text style={styles.editBtnText}>{t('listing.editListing')}</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.deleteBtn} onPress={() => void onDelete()}>
                    <MaterialIcons name="delete-outline" size={16} color="#B91C1C" />
                    <Text style={styles.deleteBtnText}>{t('listing.deleteListing')}</Text>
                  </Pressable>
                  {feedback ? <Text style={styles.successText}>{feedback}</Text> : null}
                </View>
              ) : null}

              {isAuthor ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    {quick
                      ? t('listing.candidates', { count: sortedApps.length })
                      : t('listing.applicationsCount', { count: applications.length })}
                  </Text>
                  {quick ? (
                    <Text style={styles.description}>{t('listing.pickWinnerHint')}</Text>
                  ) : null}
                  {loadingApplications ? (
                    <Text style={styles.description}>{t('listing.loadingApps')}</Text>
                  ) : sortedApps.length === 0 ? (
                    <Text style={styles.description}>
                      {quick ? t('listing.noSeatsYet') : t('listing.noApps')}
                    </Text>
                  ) : (
                    sortedApps.map((app, index) => (
                      <View key={app.id} style={styles.applicationItem}>
                        <View style={styles.appHead}>
                          <UserAvatarPressable
                            userId={app.applicantId}
                            avatarUrl={app.applicantAvatarUrl}
                            size={40}
                          />
                          <View style={styles.appHeadText}>
                            <Text style={styles.applicationTitle}>
                              {quick ? `#${index + 1} · ` : ''}
                              {app.applicantName || t('common.userFallback')}
                            </Text>
                            <Text style={styles.applicationMeta}>
                              {roleLabel(app.applicantRole, t)}
                              {app.applicantPhone
                                ? ` • ${t('listing.phone', { phone: app.applicantPhone })}`
                                : ''}
                              {app.createdAt
                                ? ` • ${app.createdAt.toLocaleTimeString(localeTag, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`
                                : ''}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.description}>{app.message}</Text>
                        {!quick ? (
                          <View style={styles.statusWrap}>
                            {(['new', 'in_progress', 'accepted', 'rejected'] as const).map((status) => (
                              <Pressable
                                key={status}
                                onPress={() => void onStatusChange(app.id, status)}
                                style={[
                                  styles.statusChip,
                                  app.status === status && styles.statusChipActive,
                                ]}>
                                <Text
                                  style={[
                                    styles.statusChipText,
                                    app.status === status && styles.statusChipTextActive,
                                  ]}>
                                  {applicationStatusLabel(status, t)}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.applicationMeta}>
                            {t('listing.statusPrefix', {
                              status: applicationStatusLabel(app.status, t),
                            })}
                          </Text>
                        )}
                        <View style={styles.appActions}>
                          <Pressable
                            style={styles.secondaryBtn}
                            onPress={() => {
                              void openChat(
                                app.applicantId,
                                app.applicantName || t('common.userFallback')
                              );
                            }}>
                            <Text style={styles.secondaryBtnText}>{t('listing.openChat')}</Text>
                          </Pressable>
                          {app.status === 'accepted' ? (
                            <Pressable
                              style={styles.secondaryBtn}
                              onPress={() =>
                                router.push({
                                  pathname: '/user/[id]',
                                  params: { id: app.applicantId },
                                })
                              }>
                              <Text style={styles.secondaryBtnText}>{t('profile.rateUser')}</Text>
                            </Pressable>
                          ) : null}
                          {quick &&
                          listing.quickStatus !== 'awarded' &&
                          app.status !== 'rejected' ? (
                            <Pressable
                              style={[styles.pickBtn, busySelect === app.id && { opacity: 0.6 }]}
                              disabled={Boolean(busySelect)}
                              onPress={() => void onSelectWinner(app.id)}>
                              <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                              <Text style={styles.pickBtnText}>
                                {busySelect === app.id ? t('listing.picking') : t('listing.pickThis')}
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    ))
                  )}
                  {feedback && isAuthor ? <Text style={styles.successText}>{feedback}</Text> : null}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      {listing ? (
        <BoostListingSheet
          visible={boostOpen}
          listingId={listing.id}
          colors={colors}
          t={t}
          onClose={() => setBoostOpen(false)}
          onSuccess={(message) => setFeedback(message)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 8,
  },
  emptyTitle: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  emptySub: { color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 8,
  },
  cardQuick: { borderColor: '#FDBA74' },
  boostInner: { gap: 8 },
  type: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5FB',
    color: '#294267',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  typeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  intentType: { backgroundColor: '#FFF7ED', color: '#C2410C' },
  quickType: { backgroundColor: '#FFEDD5', color: '#C2410C' },
  durationType: { backgroundColor: '#ECFDF5', color: '#047857' },
  boostUntil: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  company: { fontSize: 15, color: '#334155' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#64748B', fontSize: 12 },
  dot: { color: '#94A3B8', marginHorizontal: 2 },
  rateLabel: { fontSize: 16, color: '#0E4AA4', fontWeight: '800' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F8FAFD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  tagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  sectionTitle: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  description: { color: '#334155', lineHeight: 21 },
  messageInput: {
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 11,
    backgroundColor: '#F8FAFD',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  ctaBtn: {
    marginTop: 6,
    backgroundColor: '#0E4AA4',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  ctaBtnQuick: { backgroundColor: '#C2410C' },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  successText: { color: '#047857', fontWeight: '600' },
  secondaryBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    flex: 1,
  },
  secondaryBtnText: { color: '#0E4AA4', fontWeight: '700' },
  ownerActions: { gap: 8 },
  boostBtn: {
    backgroundColor: '#0E4AA4',
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  boostBtnText: { color: '#FFFFFF', fontWeight: '800' },
  editBtn: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  editBtnText: { color: '#0E4AA4', fontWeight: '700' },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  deleteBtnText: { color: '#B91C1C', fontWeight: '700' },
  applicationItem: {
    borderWidth: 1,
    borderColor: '#DDE5F2',
    borderRadius: 12,
    backgroundColor: '#F8FAFD',
    padding: 12,
    gap: 8,
  },
  appHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appHeadText: { flex: 1, gap: 2 },
  applicationTitle: { color: '#0F172A', fontWeight: '700' },
  applicationMeta: { color: '#64748B', fontSize: 12 },
  appActions: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  pickBtn: {
    flex: 1,
    marginTop: 4,
    backgroundColor: '#047857',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pickBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusChipActive: {
    borderColor: '#0E4AA4',
    backgroundColor: '#DBEAFE',
  },
  statusChipText: { color: '#475569', fontSize: 11, fontWeight: '600' },
  statusChipTextActive: { color: '#1E3A8A' },
});
