import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createListing,
  type ListingIntent,
  type ListingKind,
  type ListingType,
  type WorkMode,
} from '@/lib/market-listings';
import { getListingPublisherName, useCurrentUserProfile } from '@/lib/user-profile';

const LISTING_TYPES: ListingType[] = ['Umowa o pracę', 'B2B', 'Umowa zlecenie'];
const WORK_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const LISTING_INTENTS: { value: ListingIntent; label: string }[] = [
  { value: 'offer', label: 'Oferuję' },
  { value: 'seek', label: 'Poszukuję' },
];
const QUICK_DURATIONS = ['Kilka godzin', '1 dzień', 'Kilka dni', 'Tydzień', 'Do uzgodnienia'];

function getIntentLabel(role: 'welder' | 'employer', intent: ListingIntent) {
  if (role === 'employer') {
    return intent === 'offer' ? 'Oferuję zlecenie' : 'Poszukuję spawacza';
  }
  return intent === 'offer' ? 'Oferuję usługi' : 'Poszukuję pracy';
}

function SelectChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function NewListingScreen() {
  const router = useRouter();
  const { uid, profile } = useCurrentUserProfile();
  const [kind, setKind] = useState<ListingKind | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [rateMin, setRateMin] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [tags, setTags] = useState('');
  const [durationHint, setDurationHint] = useState('1 dzień');
  const [type, setType] = useState<ListingType>('Umowa zlecenie');
  const [mode, setMode] = useState<WorkMode>('Mobilnie');
  const [intent, setIntent] = useState<ListingIntent>('seek');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [locationSeeded, setLocationSeeded] = useState(false);

  const isEmployer = profile.role === 'employer';
  const isQuick = kind === 'quick';
  const publisherName = getListingPublisherName(profile);
  const publisherReady = isEmployer
    ? Boolean(profile.companyName.trim())
    : Boolean(profile.fullName.trim());

  useEffect(() => {
    // Domyślny intent: pracodawca szuka, spawacz oferuje
    setIntent(isEmployer ? 'seek' : 'offer');
    setMode(isQuick ? 'Mobilnie' : 'Na hali');
  }, [isEmployer, isQuick]);

  useEffect(() => {
    if (locationSeeded) return;
    if (profile.city.trim()) {
      setLocation(profile.city.trim());
      setLocationSeeded(true);
    }
  }, [profile.city, locationSeeded]);

  const canSave = useMemo(() => {
    const rateOk = isQuick
      ? Number(rateMin) > 0
      : Number(rateMin) > 0 && Number(rateMax) >= Number(rateMin);
    return Boolean(
      kind &&
        publisherReady &&
        title.trim() &&
        description.trim() &&
        location.trim() &&
        rateOk
    );
  }, [description, isQuick, kind, location, publisherReady, rateMax, rateMin, title]);

  const onSubmit = async () => {
    if (!uid || !kind) {
      setMessage('Zaloguj się, aby dodać ogłoszenie.');
      return;
    }
    if (!publisherReady) {
      setMessage(
        isEmployer
          ? 'Uzupełnij nazwę firmy w Koncie — pojawia się na ogłoszeniu.'
          : 'Uzupełnij imię i nazwisko w Koncie — pojawia się na ogłoszeniu.'
      );
      return;
    }
    if (!canSave) {
      setMessage('Uzupełnij poprawnie wszystkie wymagane pola.');
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const min = Number(rateMin);
      const max = isQuick ? min : Number(rateMax);
      const listingId = await createListing({
        title: title.trim(),
        description: description.trim(),
        company: publisherName,
        location: location.trim(),
        mode,
        type: isQuick ? 'Umowa zlecenie' : type,
        intent,
        kind,
        rateMin: min,
        rateMax: max,
        tags: isQuick
          ? [durationHint, ...tags.split(',').map((v) => v.trim()).filter(Boolean)].filter(Boolean)
          : tags
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
        targetRole: isEmployer ? 'welder' : 'employer',
        authorId: uid,
        durationHint: isQuick ? durationHint : undefined,
      });
      router.replace({ pathname: '/listing/[id]', params: { id: listingId } });
    } catch {
      setMessage('Nie udało się zapisać ogłoszenia. Spróbuj ponownie.');
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
            <Pressable
              onPress={() => {
                if (kind) {
                  setKind(null);
                  setMessage(null);
                } else {
                  router.back();
                }
              }}
              style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#0E4AA4" />
            </Pressable>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Nowe ogłoszenie</Text>
              <Text style={styles.headerSub}>
                {isEmployer ? 'Konto pracodawcy' : 'Konto spawacza'}
              </Text>
            </View>
          </View>

          {!kind ? (
            <View style={styles.chooser}>
              <Text style={styles.chooserLead}>Co chcesz opublikować?</Text>
              <Pressable style={styles.choiceCard} onPress={() => setKind('standard')}>
                <View style={styles.choiceIcon}>
                  <MaterialIcons name="description" size={26} color="#0E4AA4" />
                </View>
                <View style={styles.choiceTextCol}>
                  <Text style={styles.choiceTitle}>Ogłoszenie</Text>
                  <Text style={styles.choiceSub}>
                    Klasyczne ogłoszenie o pracę / zlecenie — bez limitu zgłoszeń.
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
              </Pressable>
              <Pressable style={[styles.choiceCard, styles.choiceCardQuick]} onPress={() => setKind('quick')}>
                <View style={[styles.choiceIcon, styles.choiceIconQuick]}>
                  <MaterialIcons name="bolt" size={26} color="#C2410C" />
                </View>
                <View style={styles.choiceTextCol}>
                  <Text style={styles.choiceTitle}>Szybkie zlecenie</Text>
                  <Text style={styles.choiceSub}>
                    Mikrolicytacja: max 5 najszybszych. Idealne na bramę, awarię, tydzień na hali.
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={[styles.publisherCard, !publisherReady && styles.publisherCardWarn]}>
                <View style={styles.publisherIcon}>
                  <MaterialIcons
                    name={isEmployer ? 'business' : 'person'}
                    size={22}
                    color="#0E4AA4"
                  />
                </View>
                <View style={styles.publisherTextCol}>
                  <Text style={styles.publisherLabel}>
                    {isEmployer ? 'Firma na ogłoszeniu' : 'Autor ogłoszenia'}
                  </Text>
                  <Text style={styles.publisherValue} numberOfLines={1}>
                    {publisherReady
                      ? publisherName
                      : isEmployer
                        ? 'Brak nazwy firmy'
                        : 'Brak imienia i nazwiska'}
                  </Text>
                  <Text style={styles.publisherHint}>Zmień w Koncie — tu podstawiamy automatycznie.</Text>
                </View>
                <Pressable
                  style={styles.publisherEdit}
                  onPress={() => router.push('/(tabs)/account' as never)}>
                  <Text style={styles.publisherEditText}>Edytuj</Text>
                </Pressable>
              </View>

              {isQuick ? (
                <View style={styles.quickBanner}>
                  <MaterialIcons name="bolt" size={18} color="#C2410C" />
                  <Text style={styles.quickBannerText}>
                    Szybkie zlecenie · pierwsze 5 osób zajmuje miejsca · Ty wybierasz zwycięzcę
                  </Text>
                </View>
              ) : null}

              <View style={styles.card}>
                <Text style={styles.sectionLabel}>{isQuick ? 'Szybkie zlecenie' : 'Podstawy'}</Text>

                <Text style={styles.label}>Tytuł *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={
                    isQuick
                      ? isEmployer
                        ? 'np. Spawanie bramy — pilne, dziś/jutro'
                        : 'np. Dostępny na szybkie spawanie — mobilnie'
                      : isEmployer
                        ? 'np. Poszukujemy spawacza TIG 141'
                        : 'np. Spawacz TIG — dostępny od zaraz'
                  }
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.label}>Opis *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder={
                    isQuick
                      ? 'Co trzeba zrobić, gdzie, kiedy start, jaki sprzęt…'
                      : 'Zakres prac, wymagania, termin, lokalizacja szczegółowa…'
                  }
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.label}>Lokalizacja *</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="np. Katowice / Śląsk"
                  placeholderTextColor="#94A3B8"
                />

                {isQuick ? (
                  <>
                    <Text style={styles.label}>Czas trwania</Text>
                    <View style={styles.chipsWrap}>
                      {QUICK_DURATIONS.map((v) => (
                        <SelectChip
                          key={v}
                          label={v}
                          active={durationHint === v}
                          onPress={() => setDurationHint(v)}
                        />
                      ))}
                    </View>
                    <Text style={styles.label}>Budżet / stawka (PLN) *</Text>
                    <TextInput
                      style={styles.input}
                      value={rateMin}
                      onChangeText={setRateMin}
                      keyboardType="numeric"
                      placeholder="np. 400 (za całość) lub 60 (za godzinę)"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.sectionLabel}>Szczegóły</Text>
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
                        <Text style={styles.label}>Stawka od (PLN/h) *</Text>
                        <TextInput
                          style={styles.input}
                          value={rateMin}
                          onChangeText={setRateMin}
                          keyboardType="numeric"
                          placeholder="50"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                      <View style={styles.rateCol}>
                        <Text style={styles.label}>Stawka do (PLN/h) *</Text>
                        <TextInput
                          style={styles.input}
                          value={rateMax}
                          onChangeText={setRateMax}
                          keyboardType="numeric"
                          placeholder="75"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>
                  </>
                )}

                {!isQuick ? (
                  <>
                    <Text style={styles.label}>Tagi (opcjonalnie)</Text>
                    <TextInput
                      style={styles.input}
                      value={tags}
                      onChangeText={setTags}
                      placeholder="TIG 141, Inox, Start od zaraz"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Tryb</Text>
                    <View style={styles.chipsWrap}>
                      {WORK_MODES.map((v) => (
                        <SelectChip key={v} label={v} active={mode === v} onPress={() => setMode(v)} />
                      ))}
                    </View>
                  </>
                )}

                {message ? <Text style={styles.message}>{message}</Text> : null}

                <Pressable
                  style={[styles.saveBtn, (!canSave || busy) && styles.saveBtnDisabled]}
                  onPress={() => void onSubmit()}
                  disabled={!canSave || busy}>
                  <MaterialIcons name={isQuick ? 'bolt' : 'publish'} size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {busy ? 'Publikowanie…' : isQuick ? 'Opublikuj szybkie zlecenie' : 'Opublikuj ogłoszenie'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, gap: 12, paddingBottom: 36 },
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
  headerTextCol: { flex: 1, gap: 1 },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#64748B', fontSize: 12 },
  chooser: { gap: 12, marginTop: 8 },
  chooserLead: { color: '#334155', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  choiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceCardQuick: { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' },
  choiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconQuick: { backgroundColor: '#FFEDD5' },
  choiceTextCol: { flex: 1, gap: 4 },
  choiceTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  choiceSub: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  publisherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  publisherCardWarn: { borderColor: '#FECACA', backgroundColor: '#FFF7F7' },
  publisherIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publisherTextCol: { flex: 1, gap: 2, minWidth: 0 },
  publisherLabel: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  publisherValue: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  publisherHint: { color: '#94A3B8', fontSize: 11 },
  publisherEdit: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  publisherEditText: { color: '#0E4AA4', fontWeight: '700', fontSize: 12 },
  quickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickBannerText: { flex: 1, color: '#9A3412', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 8,
  },
  sectionLabel: {
    color: '#0E4AA4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  label: { color: '#10233E', fontSize: 13, fontWeight: '700', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 11,
    backgroundColor: '#F8FAFD',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D5DEEA',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: '#0E4AA4', borderColor: '#0E4AA4' },
  chipText: { color: '#334155', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#FFFFFF' },
  rateRow: { flexDirection: 'row', gap: 8 },
  rateCol: { flex: 1 },
  message: { color: '#B91C1C', marginTop: 4, fontSize: 13 },
  saveBtn: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#0E4AA4',
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
