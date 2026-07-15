import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ListingApplication } from '@/lib/listing-applications';
import { useApplicationsByAuthor } from '@/lib/use-listing-applications';
import { useCurrentUserProfile } from '@/lib/user-profile';

const STATUS_LABEL: Record<ListingApplication['status'], string> = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  accepted: 'Zaakceptowane',
  rejected: 'Odrzucone',
};

export default function IncomingApplicationsScreen() {
  const router = useRouter();
  const { uid } = useCurrentUserProfile();
  const { applications, loading } = useApplicationsByAuthor(uid ?? undefined);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
            </Pressable>
            <Text style={styles.headerTitle}>Wszystkie przychodzące zgłoszenia</Text>
          </View>

          {loading ? (
            <View style={styles.card}>
              <Text style={styles.note}>Ładowanie...</Text>
            </View>
          ) : applications.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.note}>Brak zgłoszeń do Twoich ogłoszeń.</Text>
            </View>
          ) : (
            applications.map((app) => (
              <Pressable
                key={app.id}
                style={styles.applicationRow}
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: app.listingId } })}>
                <View style={styles.applicationHead}>
                  <Text style={styles.applicationTitle}>{app.listingTitle}</Text>
                  <Text style={styles.applicationStatus}>{STATUS_LABEL[app.status]}</Text>
                </View>
                <Text style={styles.applicationMeta}>
                  {app.applicantName || 'Użytkownik'} • {app.message}
                </Text>
              </Pressable>
            ))
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#DFE6F2', padding: 14 },
  note: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  applicationRow: {
    borderWidth: 1,
    borderColor: '#DFE6F2',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  applicationHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  applicationTitle: { color: '#0F172A', fontWeight: '700', flex: 1 },
  applicationStatus: {
    color: '#1E3A8A',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  applicationMeta: { color: '#64748B', fontSize: 12 },
});
