import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ListingIntent, type ListingType, type WorkMode, updateListing } from '@/lib/market-listings';
import { useMarketListings } from '@/lib/use-market-listings';
import { useCurrentUserProfile } from '@/lib/user-profile';

const LISTING_TYPES: ListingType[] = ['Umowa o pracę', 'B2B', 'Umowa zlecenie'];
const WORK_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const LISTING_INTENTS: { value: ListingIntent; label: string }[] = [
  { value: 'offer', label: 'Oferuję' },
  { value: 'seek', label: 'Poszukuję' },
];

function getIntentLabel(role: 'welder' | 'employer', intent: ListingIntent) {
  if (role === 'employer') {
    return intent === 'offer' ? 'Oferuję zlecenie' : 'Poszukuję spawacza';
  }
  return intent === 'offer' ? 'Oferuję usługi' : 'Poszukuję pracy';
}

function SelectChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { uid, profile } = useCurrentUserProfile();
  const { listings } = useMarketListings();
  const listing = useMemo(() => listings.find((item) => item.id === id), [id, listings]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [rateMin, setRateMin] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<ListingType>('Umowa zlecenie');
  const [mode, setMode] = useState<WorkMode>('Na hali');
  const [intent, setIntent] = useState<ListingIntent>('offer');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isEmployer = profile.role === 'employer';

  useEffect(() => {
    if (!listing) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setCompany(listing.company);
    setLocation(listing.location);
    setRateMin(String(listing.rateMin));
    setRateMax(String(listing.rateMax));
    setTags(listing.tags.join(', '));
    setType(listing.type);
    setMode(listing.mode);
    setIntent(listing.intent);
  }, [listing]);

  const canSave = Boolean(
    title.trim() &&
      description.trim() &&
      location.trim() &&
      Number(rateMin) > 0 &&
      Number(rateMax) >= Number(rateMin)
  );

  const onSubmit = async () => {
    if (!uid || !listing || listing.authorId !== uid) {
      setMessage('Brak uprawnień do edycji tego ogłoszenia.');
      return;
    }
    if (!canSave) {
      setMessage('Uzupełnij poprawnie wszystkie wymagane pola.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await updateListing(listing.id, {
        title: title.trim(),
        description: description.trim(),
        company: company.trim() || (isEmployer ? '' : 'Spawacz indywidualny'),
        location: location.trim(),
        mode,
        type,
        intent,
        rateMin: Number(rateMin),
        rateMax: Number(rateMax),
        tags: tags
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        targetRole: listing.targetRole,
      });
      router.replace({ pathname: '/listing/[id]', params: { id: listing.id } });
    } catch {
      setMessage('Nie udało się zapisać zmian.');
    } finally {
      setBusy(false);
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
            <Text style={styles.headerTitle}>Edytuj ogłoszenie</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Tytuł</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor="#94A3B8" />
            <Text style={styles.label}>Opis</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.label}>
              {isEmployer ? 'Firma / zleceniodawca' : 'Nazwa działalności (opcjonalnie)'}
            </Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder={isEmployer ? 'Nazwa firmy' : 'Np. TIG Damian Welding'}
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.label}>Lokalizacja</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor="#94A3B8" />
            <Text style={styles.label}>Tryb pracy</Text>
            <View style={styles.chipsWrap}>
              {WORK_MODES.map((v) => (
                <SelectChip key={v} label={v} active={mode === v} onPress={() => setMode(v)} />
              ))}
            </View>
            <Text style={styles.label}>Typ ogłoszenia</Text>
            <View style={styles.chipsWrap}>
              {LISTING_INTENTS.map((v) => (
                <SelectChip
                  key={v.value}
                  label={getIntentLabel(profile.role, v.value)}
                  active={intent === v.value}
                  onPress={() => setIntent(v.value)}
                />
              ))}
            </View>
            <Text style={styles.label}>Typ współpracy</Text>
            <View style={styles.chipsWrap}>
              {LISTING_TYPES.map((v) => (
                <SelectChip key={v} label={v} active={type === v} onPress={() => setType(v)} />
              ))}
            </View>
            <View style={styles.rateRow}>
              <View style={styles.rateCol}>
                <Text style={styles.label}>Stawka od</Text>
                <TextInput
                  style={styles.input}
                  value={rateMin}
                  onChangeText={setRateMin}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.rateCol}>
                <Text style={styles.label}>Stawka do</Text>
                <TextInput
                  style={styles.input}
                  value={rateMax}
                  onChangeText={setRateMax}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            <Text style={styles.label}>Tagi (oddziel przecinkiem)</Text>
            <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholderTextColor="#94A3B8" />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <Pressable
              style={[styles.saveBtn, (!canSave || busy) && styles.saveBtnDisabled]}
              onPress={onSubmit}
              disabled={!canSave || busy}>
              <Text style={styles.saveBtnText}>{busy ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5DEEA', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#DFE6F2', padding: 14, gap: 8 },
  label: { color: '#10233E', fontSize: 13, fontWeight: '700', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#D5DEEA', borderRadius: 11, backgroundColor: '#F8FAFD', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#D5DEEA', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#0E4AA4', borderColor: '#0E4AA4' },
  chipText: { color: '#334155', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#FFFFFF' },
  rateRow: { flexDirection: 'row', gap: 8 },
  rateCol: { flex: 1 },
  message: { color: '#B91C1C', marginTop: 4 },
  saveBtn: { marginTop: 12, borderRadius: 11, backgroundColor: '#0E4AA4', paddingVertical: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
