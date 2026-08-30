import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listingIntentForRole,
  listingTypeLabel,
  quickDurationLabel,
  QUICK_DURATION_VALUES,
  workModeLabel,
} from '@/lib/i18n/labels';
import {
  createListing,
  type ListingIntent,
  type ListingKind,
  type ListingType,
  type WorkMode,
} from '@/lib/market-listings';
import { usePreferences } from '@/lib/preferences-context';
import { getListingPublisherName, useCurrentUserProfile } from '@/lib/user-profile';

const LISTING_TYPES: ListingType[] = ['Umowa o pracę', 'B2B', 'Umowa zlecenie'];
const WORK_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const LISTING_INTENTS: ListingIntent[] = ['offer', 'seek'];

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
  const { t, colors } = usePreferences();
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
    const minRaw = rateMin.trim();
    const maxRaw = rateMax.trim();
    const min = Number(minRaw.replace(',', '.'));
    const max = Number(maxRaw.replace(',', '.'));
    // Stawki opcjonalne; jeśli podane — muszą być sensowne.
    let rateOk = true;
    if (isQuick) {
      if (minRaw) rateOk = Number.isFinite(min) && min > 0;
    } else if (minRaw || maxRaw) {
      if (minRaw && maxRaw) {
        rateOk = Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min;
      } else if (minRaw) {
        rateOk = Number.isFinite(min) && min > 0;
      } else {
        rateOk = Number.isFinite(max) && max > 0;
      }
    }
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
      setMessage(t('listing.loginToAdd'));
      return;
    }
    if (!publisherReady) {
      setMessage(isEmployer ? t('listing.needCompany') : t('listing.needName'));
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
      let max = isQuick ? min : parseRate(rateMax);
      if (!isQuick) {
        if (min > 0 && max <= 0) max = min;
        if (max > 0 && min <= 0) min = max;
      }
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
      router.replace({ pathname: '/listing/[id]', params: { id: listingId, boost: '1' } });
    } catch {
      setMessage(t('listing.saveFailed'));
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
              onPress={() => {
                if (kind) {
                  setKind(null);
                  setMessage(null);
                } else {
                  router.back();
                }
              }}
              style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>
            <View style={styles.headerTextCol}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t('listing.newTitle')}</Text>
              <Text style={[styles.headerSub, { color: colors.textSoft }]}>
                {isEmployer ? t('listing.roleEmployer') : t('listing.roleWelder')}
              </Text>
            </View>
          </View>

          {!kind ? (
            <View style={styles.chooser}>
              <Text style={[styles.chooserLead, { color: colors.textMuted }]}>{t('listing.chooserLead')}</Text>
              <Pressable style={styles.choiceCard} onPress={() => setKind('standard')}>
                <View style={styles.choiceIcon}>
                  <MaterialIcons name="description" size={26} color={colors.primary} />
                </View>
                <View style={styles.choiceTextCol}>
                  <Text style={styles.choiceTitle}>{t('listing.standardTitle')}</Text>
                  <Text style={styles.choiceSub}>{t('listing.standardSub')}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
              </Pressable>
              <Pressable style={[styles.choiceCard, styles.choiceCardQuick]} onPress={() => setKind('quick')}>
                <View style={[styles.choiceIcon, styles.choiceIconQuick]}>
                  <MaterialIcons name="bolt" size={26} color="#C2410C" />
                </View>
                <View style={styles.choiceTextCol}>
                  <Text style={styles.choiceTitle}>{t('listing.quickTitle')}</Text>
                  <Text style={styles.choiceSub}>{t('listing.quickSub')}</Text>
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
                    color={colors.primary}
                  />
                </View>
                <View style={styles.publisherTextCol}>
                  <Text style={styles.publisherLabel}>
                    {isEmployer ? t('listing.companyOnListing') : t('listing.publisher')}
                  </Text>
                  <Text style={styles.publisherValue} numberOfLines={1}>
                    {publisherReady
                      ? publisherName
                      : isEmployer
                        ? t('listing.missingCompany')
                        : t('listing.missingName')}
                  </Text>
                  <Text style={styles.publisherHint}>{t('listing.publisherHint')}</Text>
                </View>
                <Pressable
                  style={styles.publisherEdit}
                  onPress={() => router.push('/(tabs)/account' as never)}>
                  <Text style={styles.publisherEditText}>{t('listing.editInAccount')}</Text>
                </Pressable>
              </View>

              {isQuick ? (
                <View style={styles.quickBanner}>
                  <MaterialIcons name="bolt" size={18} color="#C2410C" />
                  <Text style={styles.quickBannerText}>{t('listing.quickBanner')}</Text>
                </View>
              ) : null}

              <View style={styles.card}>
                <Text style={styles.sectionLabel}>{isQuick ? t('listing.quickTitle') : t('listing.basics')}</Text>

                <Text style={styles.label}>{t('listing.titleField')}</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('listing.phQuickTitle')}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.label}>{t('listing.descriptionField')}</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder={t('listing.phDesc')}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.label}>{t('listing.locationField')}</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t('listing.phLocation')}
                  placeholderTextColor="#94A3B8"
                />

                {isQuick ? (
                  <>
                    <Text style={styles.label}>{t('listing.duration')}</Text>
                    <View style={styles.chipsWrap}>
                      {QUICK_DURATION_VALUES.map((v) => (
                        <SelectChip
                          key={v}
                          label={quickDurationLabel(v, t)}
                          active={durationHint === v}
                          onPress={() => setDurationHint(v)}
                        />
                      ))}
                    </View>
                    <Text style={styles.label}>{t('listing.budgetOptional')}</Text>
                    <TextInput
                      style={styles.input}
                      value={rateMin}
                      onChangeText={setRateMin}
                      keyboardType="numeric"
                      placeholder={t('listing.phBudget')}
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.sectionLabel}>{t('listing.details')}</Text>
                    <Text style={styles.label}>{t('listing.workMode')}</Text>
                    <View style={styles.chipsWrap}>
                      {WORK_MODES.map((v) => (
                        <SelectChip
                          key={v}
                          label={workModeLabel(v, t)}
                          active={mode === v}
                          onPress={() => setMode(v)}
                        />
                      ))}
                    </View>
                    <Text style={styles.label}>{t('listing.intentType')}</Text>
                    <View style={styles.chipsWrap}>
                      {LISTING_INTENTS.map((v) => (
                        <SelectChip
                          key={v}
                          label={listingIntentForRole(profile.role, v, t)}
                          active={intent === v}
                          onPress={() => setIntent(v)}
                        />
                      ))}
                    </View>
                    <Text style={styles.label}>{t('listing.collabType')}</Text>
                    <View style={styles.chipsWrap}>
                      {LISTING_TYPES.map((v) => (
                        <SelectChip
                          key={v}
                          label={listingTypeLabel(v, t)}
                          active={type === v}
                          onPress={() => setType(v)}
                        />
                      ))}
                    </View>
                    <View style={styles.rateRow}>
                      <View style={styles.rateCol}>
                        <Text style={styles.label}>{t('listing.rateFrom')}</Text>
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
                        <Text style={styles.label}>{t('listing.rateTo')}</Text>
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
                    <Text style={styles.label}>{t('listing.tags')}</Text>
                    <TextInput
                      style={styles.input}
                      value={tags}
                      onChangeText={setTags}
                      placeholder={t('listing.phTags')}
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>{t('listing.mode')}</Text>
                    <View style={styles.chipsWrap}>
                      {WORK_MODES.map((v) => (
                        <SelectChip
                          key={v}
                          label={workModeLabel(v, t)}
                          active={mode === v}
                          onPress={() => setMode(v)}
                        />
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
                    {busy ? t('listing.publishing') : isQuick ? t('listing.publishQuick') : t('listing.publish')}
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
  root: { flex: 1, backgroundColor: '#E8EEF7' },
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
