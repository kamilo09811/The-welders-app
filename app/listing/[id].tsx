import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createApplication,
  updateApplicationStatus,
  type ListingApplication,
} from '@/lib/listing-applications';
import { createOrGetConversation } from '@/lib/chat';
import { deleteListing } from '@/lib/market-listings';
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
  const [applyMessage, setApplyMessage] = useState('');
  const [busyApply, setBusyApply] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { applications, loading: loadingApplications } = useListingApplications(listing?.id, isAuthor);
  const { application: myApplication } = useMyListingApplication(
    listing?.id,
    uid ?? undefined,
    Boolean(uid && listing && !isAuthor)
  );

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
        message: applyMessage.trim() || 'Jestem zainteresowany/a tym ogłoszeniem.',
      });
      setApplyMessage('');
      setFeedback('Zgłoszenie zostało wysłane.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setFeedback(msg || 'Nie udało się wysłać zgłoszenia.');
    } finally {
      setBusyApply(false);
    }
  };

  const onStatusChange = async (
    applicationId: string,
    status: ListingApplication['status']
  ) => {
    await updateApplicationStatus(applicationId, status);
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
    } catch {
      setFeedback('Nie udało się otworzyć rozmowy. Spróbuj ponownie.');
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
            <Text style={styles.headerTitle}>Szczegóły ogłoszenia</Text>
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
              <View style={styles.card}>
                <View style={styles.typeRow}>
                  <Text style={styles.type}>{listing.type}</Text>
                  <Text style={[styles.type, styles.intentType]}>
                    {listing.intent === 'offer' ? 'Oferuję' : 'Poszukuję'}
                  </Text>
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
                  Stawka: {formatRateLabel(listing.rateMin, listing.rateMax, settings.showGrossRate)}
                </Text>

                <View style={styles.tagsWrap}>
                  {listing.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Opis</Text>
                <Text style={styles.description}>{listing.description}</Text>
              </View>

              {!isAuthor ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Aplikacja</Text>
                  {myApplication ? (
                    <Text style={styles.successText}>
                      Masz już wysłane zgłoszenie do tego ogłoszenia. Status: {STATUS_LABEL[myApplication.status]}.
                    </Text>
                  ) : (
                    <>
                      <TextInput
                        style={styles.messageInput}
                        value={applyMessage}
                        onChangeText={setApplyMessage}
                        multiline
                        placeholder="Napisz krótką wiadomość do autora ogłoszenia..."
                        placeholderTextColor="#94A3B8"
                      />
                      <Pressable style={styles.ctaBtn} onPress={onApply} disabled={busyApply}>
                        <Text style={styles.ctaText}>{busyApply ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}</Text>
                      </Pressable>
                    </>
                  )}
                  {feedback ? <Text style={styles.successText}>{feedback}</Text> : null}
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      void openChat(listing.authorId, listing.company || 'Autor ogłoszenia');
                    }}>
                    <Text style={styles.secondaryBtnText}>Napisz wiadomość</Text>
                  </Pressable>
                </View>
              ) : null}

              {isAuthor ? (
                <View style={styles.ownerActions}>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: '/listing/edit/[id]', params: { id: listing.id } })}>
                    <MaterialIcons name="edit" size={16} color="#0E4AA4" />
                    <Text style={styles.editBtnText}>Edytuj ogłoszenie</Text>
                  </Pressable>
                  <Pressable style={styles.deleteBtn} onPress={onDelete}>
                    <MaterialIcons name="delete-outline" size={16} color="#B91C1C" />
                    <Text style={styles.deleteBtnText}>Usuń ogłoszenie</Text>
                  </Pressable>
                </View>
              ) : null}

              {isAuthor ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Zgłoszenia ({applications.length})</Text>
                  {loadingApplications ? (
                    <Text style={styles.description}>Ładowanie zgłoszeń...</Text>
                  ) : applications.length === 0 ? (
                    <Text style={styles.description}>Brak zgłoszeń do tego ogłoszenia.</Text>
                  ) : (
                    applications.map((app) => (
                      <View key={app.id} style={styles.applicationItem}>
                        <Text style={styles.applicationTitle}>{app.applicantName || 'Użytkownik'}</Text>
                        <Text style={styles.applicationMeta}>
                          {app.applicantRole === 'employer' ? 'Pracodawca' : 'Spawacz'}
                          {app.applicantPhone ? ` • tel: ${app.applicantPhone}` : ''}
                        </Text>
                        <View style={styles.statusWrap}>
                          {(['new', 'in_progress', 'accepted', 'rejected'] as const).map((status) => (
                            <Pressable
                              key={status}
                              onPress={() => onStatusChange(app.id, status)}
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
                        <Text style={styles.description}>{app.message}</Text>
                        <Pressable
                          style={styles.secondaryBtn}
                          onPress={() => {
                            void openChat(app.applicantId, app.applicantName || 'Użytkownik');
                          }}>
                          <Text style={styles.secondaryBtnText}>Otwórz czat</Text>
                        </Pressable>
                      </View>
                    ))
                  )}
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
  type: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5FB',
    color: '#294267',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  intentType: { backgroundColor: '#FFF7ED', color: '#C2410C' },
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
    borderRadius: 10,
    backgroundColor: '#F8FAFD',
    padding: 10,
    gap: 4,
  },
  applicationTitle: { color: '#0F172A', fontWeight: '700' },
  applicationMeta: { color: '#64748B', fontSize: 12 },
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
