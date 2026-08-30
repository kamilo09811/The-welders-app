import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listingIntentForRole,
  listingTypeLabel,
  workModeLabel,
} from '@/lib/i18n/labels';
import { type ListingIntent, type ListingType, type WorkMode, updateListing } from '@/lib/market-listings';
import { usePreferences } from '@/lib/preferences-context';
import { useMarketListing } from '@/lib/use-market-listings';
import { getListingPublisherName, useCurrentUserProfile } from '@/lib/user-profile';

const LISTING_TYPES: ListingType[] = ['Umowa o pracę', 'B2B', 'Umowa zlecenie'];
const WORK_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const LISTING_INTENTS: ListingIntent[] = ['offer', 'seek'];

function SelectChip({
  active,
  label,
  onPress,
  colors,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  colors: { card: string; border: string; primary: string; textMuted: string };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: colors.card, borderColor: colors.border },
        active && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}>
      <Text style={[styles.chipText, { color: colors.textMuted }, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function EditListingScreen() {
  const router = useRouter();
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = typeof idParam === 'string' ? idParam : undefined;
  const { uid, profile } = useCurrentUserProfile();
  const { t, colors } = usePreferences();
  const { listing, loading: loadingListing } = useMarketListing(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [rateMin, setRateMin] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<ListingType>('Umowa zlecenie');
  const [mode, setMode] = useState<WorkMode>('Na hali');
  const [intent, setIntent] = useState<ListingIntent>('offer');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formHydrated, setFormHydrated] = useState(false);
  const isEmployer = profile.role === 'employer';
  const publisherName = getListingPublisherName(profile);
  const publisherReady = isEmployer
    ? Boolean(profile.companyName.trim())
    : Boolean(profile.fullName.trim());

  useEffect(() => {
    if (!listing || formHydrated) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setLocation(listing.location);
    setRateMin(listing.rateMin > 0 ? String(listing.rateMin) : '');
    setRateMax(listing.rateMax > 0 ? String(listing.rateMax) : '');
    setTags(listing.tags.join(', '));
    setType(listing.type);
    setMode(listing.mode);
    setIntent(listing.intent);
    setFormHydrated(true);
  }, [listing, formHydrated]);

  useEffect(() => {
    setFormHydrated(false);
  }, [id]);

  const canSave = Boolean(
    publisherReady && title.trim() && description.trim() && location.trim() && (() => {
      const minRaw = rateMin.trim();
      const maxRaw = rateMax.trim();
      if (!minRaw && !maxRaw) return true;
      const min = Number(minRaw.replace(',', '.'));
      const max = Number(maxRaw.replace(',', '.'));
      if (minRaw && maxRaw) return Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min;
      if (minRaw) return Number.isFinite(min) && min > 0;
      return Number.isFinite(max) && max > 0;
    })()
  );

  const onSubmit = async () => {
    if (!uid || !listing || listing.authorId !== uid) {
      setMessage(t('listing.noEditPerm'));
      return;
    }
    if (!publisherReady) {
      setMessage(isEmployer ? t('listing.needCompanyShort') : t('listing.needNameShort'));
      return;
    }
    if (!canSave) {
      setMessage(t('listing.fillRequired'));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const parseRate = (v: string) => {
        const n = Number(v.trim().replace(',', '.'));
        return Number.isFinite(n) && n > 0 ? n : 0;
      };
      let min = parseRate(rateMin);
      let max = parseRate(rateMax);
      if (min > 0 && max <= 0) max = min;
      if (max > 0 && min <= 0) min = max;
      await updateListing(listing.id, {
        title: title.trim(),
        description: description.trim(),
        company: publisherName,
        location: location.trim(),
        mode,
        type,
        intent,
        rateMin: min,
        rateMax: max,
        tags: tags
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        targetRole: listing.targetRole,
      });
      router.replace({ pathname: '/listing/[id]', params: { id: listing.id } });
    } catch {
      setMessage(t('listing.saveEditFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('listing.editTitle')}</Text>
          </View>

          {loadingListing ? (
            <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : !listing ? (
            <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>{t('listing.notFound')}</Text>
              <Text style={[styles.statusSub, { color: colors.textSoft }]}>{t('listing.notFoundSub')}</Text>
            </View>
          ) : listing.authorId !== uid ? (
            <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>{t('listing.noEditPerm')}</Text>
              <Text style={[styles.statusSub, { color: colors.textSoft }]}>{t('listing.editOnlyOwn')}</Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.publisherRow}>
                <MaterialIcons name={isEmployer ? 'business' : 'person'} size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.publisherLabel, { color: colors.textSoft }]}>
                    {isEmployer ? t('listing.companyOnListing') : t('listing.publisher')}
                  </Text>
                  <Text style={[styles.publisherValue, { color: colors.text }]}>{publisherName}</Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/account' as never)}>
                  <Text style={[styles.publisherEdit, { color: colors.primary }]}>
                    {t('listing.editInAccount')}
                  </Text>
                </Pressable>
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.titleField')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.textSoft}
              />
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.descriptionField')}</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
                ]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholderTextColor={colors.textSoft}
              />
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.locationField')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
                ]}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={colors.textSoft}
              />
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.workMode')}</Text>
              <View style={styles.chipsWrap}>
                {WORK_MODES.map((v) => (
                  <SelectChip
                    key={v}
                    label={workModeLabel(v, t)}
                    active={mode === v}
                    onPress={() => setMode(v)}
                          colors={colors}
                        />
                ))}
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.intentType')}</Text>
              <View style={styles.chipsWrap}>
                {LISTING_INTENTS.map((v) => (
                  <SelectChip
                    key={v}
                    label={listingIntentForRole(profile.role, v, t)}
                    active={intent === v}
                    onPress={() => setIntent(v)}
                          colors={colors}
                        />
                ))}
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.collabType')}</Text>
              <View style={styles.chipsWrap}>
                {LISTING_TYPES.map((v) => (
                  <SelectChip
                    key={v}
                    label={listingTypeLabel(v, t)}
                    active={type === v}
                    onPress={() => setType(v)}
                          colors={colors}
                        />
                ))}
              </View>
              <View style={styles.rateRow}>
                <View style={styles.rateCol}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.rateFrom')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                    value={rateMin}
                    onChangeText={setRateMin}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSoft}
                  />
                </View>
                <View style={styles.rateCol}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.rateTo')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                    value={rateMax}
                    onChangeText={setRateMax}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSoft}
                  />
                </View>
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t('listing.tagsComma')}</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]} value={tags} onChangeText={setTags} placeholderTextColor={colors.textSoft} />
              {message ? <Text style={[styles.message, { color: colors.danger }]}>{message}</Text> : null}
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }, (!canSave || busy) && styles.saveBtnDisabled]}
                onPress={onSubmit}
                disabled={!canSave || busy}>
                <Text style={styles.saveBtnText}>
                  {busy ? t('listing.saving') : t('listing.saveChanges')}
                </Text>
              </Pressable>
            </View>
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  statusSub: { color: '#64748B', fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 8,
  },
  publisherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    marginBottom: 4,
  },
  publisherLabel: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  publisherValue: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  publisherEdit: { color: '#0E4AA4', fontSize: 12, fontWeight: '700' },
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
  textarea: { minHeight: 100, textAlignVertical: 'top' },
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
  message: { color: '#B91C1C', marginTop: 4 },
  saveBtn: {
    marginTop: 12,
    borderRadius: 11,
    backgroundColor: '#0E4AA4',
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
