import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuickSlotsAvatars } from '@/components/quick-slots-avatars';
import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { createOrGetConversation } from '@/lib/chat';
import {
  createApplication,
  selectQuickJobWinner,
  updateApplicationStatus,
  type ListingApplication,
} from '@/lib/listing-applications';
import {
  deleteListing,
  isQuickListing,
  quickSlotsRemaining,
} from '@/lib/market-listings';
import { useListingApplications, useMyListingApplication } from '@/lib/use-listing-applications';
import { getPublicUserInfo, useCurrentUserProfile } from '@/lib/user-profile';
import { formatRateLabel, useUserSettings } from '@/lib/user-settings';
import { useMarketListing } from '@/lib/use-market-listings';

const STATUS_LABEL: Record<ListingApplication['status'], string> = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  accepted: 'Zaakceptowane',
  rejected: 'Odrzucone',
};

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = typeof idParam === 'string' ? idParam : undefined;
  const { uid, profile } = useCurrentUserProfile();
  const { settings } = useUserSettings();
  const { listing, loading: loadingListing } = useMarketListing(id);

  const isAuthor = Boolean(uid && listing && listing.authorId === uid);
  const quick = isQuickListing(listing);
  const [applyMessage, setApplyMessage] = useState('');
  const [busyApply, setBusyApply] = useState(false);
  const [busySelect, setBusySelect] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
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

  const slotsLeft = listing ? quickSlotsRemaining(listing) : 0;
  const canJoinQuick =
    quick &&
    !isAuthor &&
    !myApplication &&
    listing?.quickStatus !== 'awarded' &&
    listing?.quickStatus !== 'closed' &&
    slotsLeft > 0;

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
      setFeedback(
        quick
          ? 'Dołączyłeś do szybkiego zlecenia. Czekaj na wybór zleceniodawcy.'
          : 'Zgłoszenie zostało wysłane.'
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setFeedback(msg || 'Nie udało się wysłać zgłoszenia.');
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
      setFeedback('Wybrano wykonawcę — pozostałe zgłoszenia odrzucone.');
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Nie udało się wybrać wykonawcy.');
    } finally {
      setBusySelect(null);
    }
  };

  const userLabel = (role: 'welder' | 'employer') => (role === 'employer' ? 'Pracodawca' : 'Spawacz');

  const openChat = async (otherId: string, otherName: string) => {
    if (!listing || !uid || !otherId) {
      setFeedback('Nie można otworzyć czatu dla tego ogłoszenia.');
      return;
    }
    try {
      const otherUser = await getPublicUserInfo(otherId);
      const conversationId = await createOrGetConversation({
        listingId: listing.id,
        listingTitle: listing.title,
        meId: uid,
        meName: profile.fullName || userLabel(profile.role),
        meAvatarUrl: profile.avatarUrl || '',
        otherId,
        otherName: otherUser.fullName || otherName || 'Użytkownik',
        otherAvatarUrl: otherUser.avatarUrl || '',
      });
      router.push({ pathname: '/messages/[id]', params: { id: conversationId } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setFeedback(msg || 'Nie udało się otworzyć rozmowy.');
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
              {quick ? 'Szybkie zlecenie' : 'Szczegóły ogłoszenia'}
            </Text>
          </View>

          {!listing ? (
            <View style={styles.emptyCard}>
              {loadingListing ? (
                <ActivityIndicator color="#0E4AA4" />
              ) : (
                <>
                  <Text style={styles.emptyTitle}>Nie znaleziono ogłoszenia</Text>
                  <Text style={styles.emptySub}>To ogłoszenie mogło zostać usunięte.</Text>
                </>
              )}
            </View>
          ) : (
            <>
              <View style={[styles.card, quick && styles.cardQuick]}>
                <View style={styles.typeRow}>
                  {quick ? (
                    <Text style={[styles.type, styles.quickType]}>Szybkie zlecenie</Text>
                  ) : (
                    <Text style={styles.type}>{listing.type}</Text>
                  )}
                  <Text style={[styles.type, styles.intentType]}>
                    {listing.intent === 'offer' ? 'Oferuję' : 'Poszukuję'}
                  </Text>
                  {quick && listing.durationHint ? (
                    <Text style={[styles.type, styles.durationType]}>{listing.durationHint}</Text>
                  ) : null}
                </View>
                <Text style={styles.title}>{listing.title}</Text>
                <Text style={styles.company}>{listing.company || 'Ogłoszenie prywatne'}</Text>

                <View style={styles.metaRow}>
                  <MaterialIcons name="place" size={16} color="#64748B" />
                  <Text style={styles.metaText}>{listing.location}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.metaText}>{listing.mode}</Text>
                </View>

                <Text style={styles.rateLabel}>
                  {quick ? 'Budżet / stawka: ' : 'Stawka: '}
                  {formatRateLabel(listing.rateMin, listing.rateMax, settings.showGrossRate)}
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
              </View>

              {quick ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Miejsca w mikrolicytacji</Text>
                  <Text style={styles.description}>
                    {listing.quickStatus === 'awarded'
                      ? 'Zleceniodawca wybrał wykonawcę.'
                      : listing.quickStatus === 'full'
                        ? 'Komplet 5 najszybszych — czekamy na wybór.'
                        : `Wolne miejsca: ${slotsLeft}. Pierwsze 5 osób wchodzi do gry.`}
                  </Text>
                  <QuickSlotsAvatars applicants={listing.quickSlots?.applicants || []} />
                </View>
              ) : null}

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Opis</Text>
                <Text style={styles.description}>{listing.description}</Text>
              </View>

              {!isAuthor ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{quick ? 'Dołącz do zlecenia' : 'Aplikacja'}</Text>
                  {myApplication ? (
                    <Text style={styles.successText}>
                      {quick
                        ? `Jesteś w gronie zgłoszonych. Status: ${STATUS_LABEL[myApplication.status]}.`
                        : `Masz już wysłane zgłoszenie. Status: ${STATUS_LABEL[myApplication.status]}.`}
                    </Text>
                  ) : canJoinQuick || !quick ? (
                    <>
                      <TextInput
                        style={styles.messageInput}
                        value={applyMessage}
                        onChangeText={setApplyMessage}
                        multiline
                        placeholder={
                          quick
                            ? 'Krótko: dostępność, dojazd, sprzęt…'
                            : 'Napisz krótką wiadomość do autora ogłoszenia...'
                        }
                        placeholderTextColor="#94A3B8"
                      />
                      <Pressable
                        style={[styles.ctaBtn, quick && styles.ctaBtnQuick]}
                        onPress={() => void onApply()}
                        disabled={busyApply}>
                        <Text style={styles.ctaText}>
                          {busyApply
                            ? 'Wysyłanie...'
                            : quick
                              ? 'Dołącz (zajmij miejsce)'
                              : 'Wyślij zgłoszenie'}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <Text style={styles.description}>
                      Brak wolnych miejsc albo zlecenie jest już rozstrzygnięte.
                    </Text>
                  )}
                  {feedback ? <Text style={styles.successText}>{feedback}</Text> : null}
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      void openChat(listing.authorId, listing.company || 'Autor ogłoszenia');
                    }}>
                    <Text style={styles.secondaryBtnText}>Napisz do zleceniodawcy</Text>
                  </Pressable>
                </View>
              ) : null}

              {isAuthor ? (
                <View style={styles.ownerActions}>
                  {!quick ? (
                    <Pressable
                      style={styles.editBtn}
                      onPress={() =>
                        router.push({ pathname: '/listing/edit/[id]', params: { id: listing.id } })
                      }>
                      <MaterialIcons name="edit" size={16} color="#0E4AA4" />
                      <Text style={styles.editBtnText}>Edytuj ogłoszenie</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.deleteBtn} onPress={() => void onDelete()}>
                    <MaterialIcons name="delete-outline" size={16} color="#B91C1C" />
                    <Text style={styles.deleteBtnText}>Usuń ogłoszenie</Text>
                  </Pressable>
                </View>
              ) : null}

              {isAuthor ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    {quick
                      ? `Kandydaci (${sortedApps.length}/5)`
                      : `Zgłoszenia (${applications.length})`}
                  </Text>
                  {quick ? (
                    <Text style={styles.description}>
                      Wybierz jedną osobę — pozostałe zgłoszenia zostaną odrzucone. Możesz też
                      otworzyć czat przed decyzją.
                    </Text>
                  ) : null}
                  {loadingApplications ? (
                    <Text style={styles.description}>Ładowanie zgłoszeń...</Text>
                  ) : sortedApps.length === 0 ? (
                    <Text style={styles.description}>
                      {quick ? 'Nikt jeszcze nie zajął miejsca.' : 'Brak zgłoszeń do tego ogłoszenia.'}
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
                              {app.applicantName || 'Użytkownik'}
                            </Text>
                            <Text style={styles.applicationMeta}>
                              {app.applicantRole === 'employer' ? 'Pracodawca' : 'Spawacz'}
                              {app.applicantPhone ? ` • tel: ${app.applicantPhone}` : ''}
                              {app.createdAt
                                ? ` • ${app.createdAt.toLocaleTimeString('pl-PL', {
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
                                  {STATUS_LABEL[status]}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.applicationMeta}>Status: {STATUS_LABEL[app.status]}</Text>
                        )}
                        <View style={styles.appActions}>
                          <Pressable
                            style={styles.secondaryBtn}
                            onPress={() => {
                              void openChat(app.applicantId, app.applicantName || 'Użytkownik');
                            }}>
                            <Text style={styles.secondaryBtnText}>Otwórz czat</Text>
                          </Pressable>
                          {quick &&
                          listing.quickStatus !== 'awarded' &&
                          app.status !== 'rejected' ? (
                            <Pressable
                              style={[styles.pickBtn, busySelect === app.id && { opacity: 0.6 }]}
                              disabled={Boolean(busySelect)}
                              onPress={() => void onSelectWinner(app.id)}>
                              <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                              <Text style={styles.pickBtnText}>
                                {busySelect === app.id ? 'Wybieranie…' : 'Wybierz tego'}
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
