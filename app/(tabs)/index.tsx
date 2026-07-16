import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ListingIntent, ListingType, MarketListing } from '@/lib/market-listings';
import { matchesLocationPreference } from '@/lib/pl-cities';
import { useMarketListings } from '@/lib/use-market-listings';
import { useCurrentUserProfile, useAuthorsEmailVerified } from '@/lib/user-profile';
import {
  formatRateLabel,
  useUserSettings,
  type SettingsSort,
} from '@/lib/user-settings';

type Role = 'welder' | 'employer';

const ROLE_LABELS: Record<Role, string> = {
  welder: 'Konto spawacza',
  employer: 'Konto pracodawcy',
};

const chipsType: ('Wszystkie' | ListingType)[] = [
  'Wszystkie',
  'Umowa o pracę',
  'B2B',
  'Umowa zlecenie',
];
const chipsIntent: ('Wszystkie' | ListingIntent)[] = ['Wszystkie', 'offer', 'seek'];
const INTENT_LABEL: Record<ListingIntent, string> = {
  offer: 'Oferuję',
  seek: 'Poszukuję',
};

function wynikSlowo(n: number): string {
  const abs = Math.abs(n);
  if (abs === 1) return 'wynik';
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'wyniki';
  return 'wyników';
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function hoursAgoLabel(createdAt: Date | null) {
  if (!createdAt) return 'przed chwilą';
  const hours = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60)));
  return `${hours} h temu`;
}

function ListingCard({
  item,
  role,
  showGrossRate,
  onPress,
}: {
  item: MarketListing;
  role: Role;
  showGrossRate: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardBadges}>
          <Text style={styles.cardType}>{item.type}</Text>
          <Text style={[styles.cardType, styles.intentBadge]}>{INTENT_LABEL[item.intent]}</Text>
        </View>
        <Text style={styles.cardRate}>{formatRateLabel(item.rateMin, item.rateMax, showGrossRate)}</Text>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardCompany}>{item.company || 'Ogłoszenie prywatne'}</Text>

      <View style={styles.metaRow}>
        <MaterialIcons name="place" size={16} color="#64748B" />
        <Text style={styles.metaText}>{item.location}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{item.mode}</Text>
      </View>

      <View style={styles.tagsWrap}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={styles.posted}>Opublikowano {hoursAgoLabel(item.createdAt)}</Text>
        <Pressable style={styles.cardCta} onPress={onPress}>
          <Text style={styles.cardCtaText}>{role === 'welder' ? 'Aplikuj' : 'Szczegóły'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const filtersOffsetY = useRef(0);
  const { uid, profile } = useCurrentUserProfile();
  const { settings, loading: settingsLoading } = useUserSettings();
  const { listings, loading } = useMarketListings();
  const authorIds = useMemo(() => listings.map((i) => i.authorId), [listings]);
  const { verifiedByAuthor, loading: verifiedLoading } = useAuthorsEmailVerified(
    authorIds,
    settings.onlyVerified
  );
  const role: Role = profile.role === 'employer' ? 'employer' : 'welder';
  const [location, setLocation] = useState('Wszystkie');
  const [type, setType] = useState('Wszystkie');
  const [intent, setIntent] = useState<'Wszystkie' | ListingIntent>('Wszystkie');
  const [sort, setSort] = useState<SettingsSort>('newest');
  const [onlyMine, setOnlyMine] = useState(false);
  const prefsSeeded = useRef(false);

  useEffect(() => {
    if (settingsLoading || prefsSeeded.current) return;
    prefsSeeded.current = true;
    setSort(settings.defaultSort);
    setIntent(settings.preferredIntent === 'all' ? 'Wszystkie' : settings.preferredIntent);
  }, [settings.defaultSort, settings.preferredIntent, settingsLoading]);

  const chipsLocation = useMemo(() => {
    const unique = Array.from(new Set(listings.map((i) => i.location))).sort((a, b) => a.localeCompare(b, 'pl'));
    return ['Wszystkie', ...unique];
  }, [listings]);

  const activePrefsLabel = useMemo(() => {
    const parts: string[] = [];
    if (settings.baseCity.trim()) {
      parts.push(
        settings.radius === 'Cała Polska'
          ? settings.baseCity.trim()
          : `${settings.baseCity.trim()} · ${settings.radius}`
      );
    }
    if (settings.minRate > 0) parts.push(`min. ${settings.minRate} PLN/h`);
    if (settings.preferredModes.length) parts.push(settings.preferredModes.join(', '));
    if (settings.onlyVerified) parts.push('tylko zweryfikowani');
    return parts.join(' · ');
  }, [settings.baseCity, settings.minRate, settings.onlyVerified, settings.preferredModes, settings.radius]);

  const filtered = useMemo(() => {
    const data = listings.filter((i) => {
      if (!uid) return i.targetRole === role;
      if (onlyMine) return i.authorId === uid;
      if (settings.hideOwnInFeed && i.authorId === uid) return false;
      return i.targetRole === role || i.authorId === uid;
    });

    const afterSettingsLocation = data.filter((i) =>
      matchesLocationPreference(i.location, settings.baseCity, settings.radius)
    );
    const afterLocation =
      location === 'Wszystkie'
        ? afterSettingsLocation
        : afterSettingsLocation.filter((i) => i.location.toLowerCase() === location.toLowerCase());

    const afterType = type === 'Wszystkie' ? afterLocation : afterLocation.filter((i) => i.type === type);
    const afterIntent =
      intent === 'Wszystkie' ? afterType : afterType.filter((i) => i.intent === intent);

    const afterModes =
      settings.preferredModes.length === 0
        ? afterIntent
        : afterIntent.filter((i) => settings.preferredModes.includes(i.mode));

    const afterMinRate =
      settings.minRate > 0 ? afterModes.filter((i) => i.rateMax >= settings.minRate) : afterModes;

    const afterVerified = settings.onlyVerified
      ? afterMinRate.filter((i) => verifiedByAuthor[i.authorId] === true)
      : afterMinRate;

    return [...afterVerified].sort((a, b) => {
      if (sort === 'rateAsc') return a.rateMax - b.rateMax;
      if (sort === 'newest') return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
      return b.rateMax - a.rateMax;
    });
  }, [
    intent,
    listings,
    location,
    onlyMine,
    role,
    settings.baseCity,
    settings.hideOwnInFeed,
    settings.minRate,
    settings.onlyVerified,
    settings.preferredModes,
    settings.radius,
    sort,
    type,
    uid,
    verifiedByAuthor,
  ]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.brand}>TheWeldersWorld</Text>
          <Text style={styles.title}>
            {role === 'welder' ? 'Oferty dla spawaczy' : 'Zlecenia i kandydaci'}
          </Text>
          <Text style={styles.subtitle}>
            Lista ogłoszeń z filtrowaniem według lokalizacji, formy współpracy i sortowania po stawce.
          </Text>

          <View style={styles.roleSwitch}>
            <View style={[styles.roleBtn, styles.roleBtnActive]}>
              <Text style={[styles.roleBtnText, styles.roleBtnTextActive]}>{ROLE_LABELS[role]}</Text>
            </View>
          </View>

          <Pressable style={styles.addBtn} onPress={() => router.push('/listing/new')}>
            <MaterialIcons name="add-circle-outline" size={17} color="#0E4AA4" />
            <Text style={styles.addBtnText}>Dodaj ogłoszenie</Text>
          </Pressable>
        </View>

        {activePrefsLabel ? (
          <Pressable style={styles.prefsBanner} onPress={() => router.push('/(tabs)/explore')}>
            <MaterialIcons name="tune" size={18} color="#0E4AA4" />
            <View style={styles.prefsTextWrap}>
              <Text style={styles.prefsTitle}>Aktywne preferencje</Text>
              <Text style={styles.prefsSub} numberOfLines={2}>
                {activePrefsLabel}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#64748B" />
          </Pressable>
        ) : null}

        <View
          style={styles.section}
          onLayout={(e) => {
            filtersOffsetY.current = e.nativeEvent.layout.y;
          }}>
          <Text style={styles.sectionTitle}>Lokalizacja</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
            {chipsLocation.map((c) => (
              <Chip key={c} label={c} active={location === c} onPress={() => setLocation(c)} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma współpracy</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
            {chipsType.map((c) => (
              <Chip key={c} label={c} active={type === c} onPress={() => setType(c)} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intencja</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
            {chipsIntent.map((c) => (
              <Chip
                key={c}
                label={c === 'Wszystkie' ? 'Wszystkie' : INTENT_LABEL[c]}
                active={intent === c}
                onPress={() => setIntent(c)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sortowanie</Text>
          <View style={styles.sortWrap}>
            <Chip
              label="Stawka: od najwyższej"
              active={sort === 'rateDesc'}
              onPress={() => setSort('rateDesc')}
            />
            <Chip
              label="Stawka: od najniższej"
              active={sort === 'rateAsc'}
              onPress={() => setSort('rateAsc')}
            />
            <Chip label="Najnowsze" active={sort === 'newest'} onPress={() => setSort('newest')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Widok</Text>
          <View style={styles.sortWrap}>
            <Chip label="Wszystkie widoczne" active={!onlyMine} onPress={() => setOnlyMine(false)} />
            <Chip label="Moje ogłoszenia" active={onlyMine} onPress={() => setOnlyMine(true)} />
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            {filtered.length} {wynikSlowo(filtered.length)}
          </Text>
          <Pressable
            style={styles.filterBtn}
            onPress={() => scrollRef.current?.scrollTo({ y: filtersOffsetY.current, animated: true })}>
            <MaterialIcons name="tune" size={16} color="#0E4AA4" />
            <Text style={styles.filterBtnText}>Więcej filtrów</Text>
          </Pressable>
        </View>

        {loading || (settings.onlyVerified && verifiedLoading) ? (
          <View style={styles.card}>
            <Text style={styles.posted}>Ładowanie ogłoszeń...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Brak wyników dla wybranych filtrów.</Text>
            <Text style={styles.posted}>Zmień filtry w ustawieniach lub dodaj nowe ogłoszenie.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              role={role}
              showGrossRate={settings.showGrossRate}
              onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: {
    backgroundColor: '#0E4AA4',
    borderRadius: 18,
    padding: 16,
  },
  brand: { color: '#BFD7FF', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 23, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#DCEBFF', marginTop: 6, fontSize: 14, lineHeight: 20 },
  roleSwitch: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 6,
  },
  roleBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#FFFFFF' },
  roleBtnText: { color: '#E8F0FF', fontWeight: '700', fontSize: 13 },
  roleBtnTextActive: { color: '#0E4AA4' },
  addBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { color: '#0E4AA4', fontWeight: '700', fontSize: 12 },

  prefsBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefsTextWrap: { flex: 1, gap: 2 },
  prefsTitle: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  prefsSub: { color: '#64748B', fontSize: 12 },

  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#10233E' },
  rowChips: { gap: 8, paddingRight: 4 },
  sortWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

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

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterBtnText: { color: '#0E4AA4', fontWeight: '700', fontSize: 12 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 8,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBadges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardType: {
    backgroundColor: '#F1F5FB',
    color: '#294267',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  intentBadge: {
    backgroundColor: '#FFF7ED',
    color: '#C2410C',
  },
  cardRate: { fontSize: 13, color: '#0E4AA4', fontWeight: '800', maxWidth: '46%', textAlign: 'right' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cardCompany: { fontSize: 14, color: '#334155' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#64748B', fontSize: 12 },
  metaDot: { color: '#94A3B8', marginHorizontal: 2 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F8FAFD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  tagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  cardBottomRow: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  posted: { color: '#64748B', fontSize: 12 },
  cardCta: { backgroundColor: '#0E4AA4', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  cardCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
