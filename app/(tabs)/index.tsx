import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { ListingIntent, ListingKind, ListingType, MarketListing, WorkMode } from '@/lib/market-listings';
import { isListingBoosted, isQuickListing } from '@/lib/market-listings';
import { matchesLocationPreference, PL_CITIES } from '@/lib/pl-cities';
import { usePreferences } from '@/lib/preferences-context';
import { getHeroGradient, getHeroSheen, type AppColors } from '@/lib/theme';
import { useMarketListings } from '@/lib/use-market-listings';
import { useCurrentUserProfile, useAuthorsEmailVerified } from '@/lib/user-profile';
import {
  formatRateLabel,
  type SettingsRadius,
  type SettingsSort,
} from '@/lib/user-settings';
import { BoostListingSheet } from '@/components/boost-listing-sheet';
import { BoostedFrame } from '@/components/boosted-frame';
import { QuickSlotsAvatars } from '@/components/quick-slots-avatars';
import { TabTipCard } from '@/components/tab-tip-card';
import type { AppLocale } from '@/lib/i18n';
import {
  listingIntentShort,
  listingTypeLabel,
  quickDurationLabel,
  workModeLabel,
} from '@/lib/i18n/labels';
import type { TranslationKey } from '@/lib/i18n';

type Role = 'welder' | 'employer';
type KindFilter = 'all' | ListingKind;

const ALL_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const RADIUS_VALUES: SettingsRadius[] = ['25 km', '50 km', '100 km', 'Cała Polska'];
const MIN_RATE_OPTIONS = [0, 40, 50, 60, 80] as const;
const POPULAR_CITIES = [
  'Warszawa',
  'Kraków',
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Katowice',
  'Łódź',
  'Lublin',
  'Szczecin',
  'Bydgoszcz',
];

const CITY_SUGGESTIONS = [...new Set(PL_CITIES.map((c) => c.name))].sort((a, b) =>
  a.localeCompare(b, 'pl')
);

const chipsType: ('Wszystkie' | ListingType)[] = [
  'Wszystkie',
  'Umowa o pracę',
  'B2B',
  'Umowa zlecenie',
];
const chipsIntent: ('Wszystkie' | ListingIntent)[] = ['Wszystkie', 'offer', 'seek'];

type MarketFilters = {
  locationCity: string;
  radius: SettingsRadius;
  type: 'Wszystkie' | ListingType;
  intent: 'Wszystkie' | ListingIntent;
  modeFilter: WorkMode[];
  sort: SettingsSort;
  onlyMine: boolean;
  hideOwn: boolean;
  kind: KindFilter;
  minRate: number;
  onlyVerified: boolean;
};

const OPEN_FILTERS: MarketFilters = {
  locationCity: '',
  radius: 'Cała Polska',
  type: 'Wszystkie',
  intent: 'Wszystkie',
  modeFilter: [],
  sort: 'newest',
  onlyMine: false,
  hideOwn: false,
  kind: 'all',
  minRate: 0,
  onlyVerified: false,
};

/** Ile ogłoszeń na jednej stronie rynku. */
const MARKET_PAGE_SIZE = 25;

function countActiveFilters(f: MarketFilters): number {
  let n = 0;
  if (f.locationCity.trim()) n += 1;
  if (f.locationCity.trim() && f.radius !== 'Cała Polska') n += 1;
  if (f.type !== 'Wszystkie') n += 1;
  if (f.intent !== 'Wszystkie') n += 1;
  if (f.modeFilter.length > 0) n += 1;
  if (f.sort !== 'newest') n += 1;
  if (f.hideOwn) n += 1;
  if (f.onlyMine) n += 1;
  if (f.kind !== 'all') n += 1;
  if (f.minRate > 0) n += 1;
  if (f.onlyVerified) n += 1;
  return n;
}

function effectiveRate(item: MarketListing): number {
  return Math.max(item.rateMin || 0, item.rateMax || 0);
}

function Chip({
  active,
  label,
  onPress,
  colors,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  colors: AppColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: colors.border, backgroundColor: colors.card },
        active && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}>
      <Text style={[styles.chipText, { color: colors.textMuted }, active && { color: '#FFFFFF' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function hoursAgoLabel(
  createdAt: Date | null,
  t: (key: 'market.justNow' | 'market.hoursAgo', vars?: Record<string, string | number>) => string
) {
  if (!createdAt) return t('market.justNow');
  const hours = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60)));
  return t('market.hoursAgo', { hours });
}

function ListingRow({
  item,
  role,
  showGrossRate,
  locale,
  colors,
  t,
  isOwn,
  onPress,
  onBoost,
}: {
  item: MarketListing;
  role: Role;
  showGrossRate: boolean;
  locale: AppLocale;
  colors: AppColors;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  isOwn?: boolean;
  onPress: () => void;
  onBoost?: () => void;
}) {
  const quick = isQuickListing(item);
  const boosted = isListingBoosted(item);
  const intentLabel = listingIntentShort(item.intent, t);

  const row = (
    <Pressable
      style={[
        styles.listingRow,
        { borderBottomColor: colors.border },
        quick && !boosted && {
          backgroundColor: colors.warningSoft,
          marginHorizontal: -8,
          paddingHorizontal: 8,
          borderRadius: 12,
          borderBottomWidth: 0,
        },
        boosted && styles.listingRowBoosted,
      ]}
      onPress={onPress}>
      <View style={styles.listingTop}>
        <View style={styles.listingBadges}>
          {quick ? (
            <Text style={[styles.metaBadge, { color: colors.warning, backgroundColor: colors.warningSoft }]}>
              {t('market.quickJob')}
            </Text>
          ) : (
            <Text style={[styles.metaBadge, { color: colors.chipText, backgroundColor: colors.chip }]}>
              {listingTypeLabel(item.type, t)}
            </Text>
          )}
          <Text style={[styles.metaBadge, { color: colors.warning, backgroundColor: colors.warningSoft }]}>
            {intentLabel}
          </Text>
          {quick && item.durationHint ? (
            <Text style={[styles.metaBadge, { color: colors.success, backgroundColor: colors.successSoft }]}>
              {quickDurationLabel(item.durationHint, t)}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.listingRate, { color: colors.primary }]}>
          {formatRateLabel(item.rateMin, item.rateMax, showGrossRate, locale)}
        </Text>
      </View>
      <Text style={[styles.listingTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.listingCompany, { color: colors.textMuted }]}>
        {item.company || t('listing.publisher')}
      </Text>
      <View style={styles.metaRow}>
        <MaterialIcons name="place" size={15} color={colors.textSoft} />
        <Text style={[styles.metaText, { color: colors.textSoft }]}>{item.location}</Text>
        <Text style={[styles.metaDot, { color: colors.textSoft }]}>·</Text>
        <Text style={[styles.metaText, { color: colors.textSoft }]}>{workModeLabel(item.mode, t)}</Text>
        <Text style={[styles.metaDot, { color: colors.textSoft }]}>·</Text>
        <Text style={[styles.metaText, { color: colors.textSoft }]}>{hoursAgoLabel(item.createdAt, t)}</Text>
      </View>
      {quick ? (
        <View style={styles.quickSlotsRow}>
          <QuickSlotsAvatars applicants={item.quickSlots?.applicants || []} size={32} />
        </View>
      ) : item.tags.length > 0 ? (
        <View style={styles.tagsWrap}>
          {item.tags.slice(0, 4).map((tag) => (
            <Text key={tag} style={[styles.tagText, { color: colors.textSoft }]}>
              {tag}
            </Text>
          ))}
        </View>
      ) : null}
      {isOwn && onBoost ? (
        <Pressable
          style={[styles.rowBoostBtn, { backgroundColor: colors.primary }]}
          onPress={(e) => {
            e.stopPropagation?.();
            onBoost();
          }}
          hitSlop={6}>
          <MaterialIcons name="rocket-launch" size={15} color="#FFFFFF" />
          <Text style={styles.rowBoostText}>
            {boosted ? t('boost.extend') : t('boost.cta')}
          </Text>
        </Pressable>
      ) : (
        <Text style={[styles.listingCta, { color: colors.primary }]}>
          {quick
            ? item.quickStatus === 'awarded'
              ? t('market.awarded')
              : t('market.joinQuick')
            : role === 'welder'
              ? t('market.applyCta')
              : t('market.detailsCta')}
        </Text>
      )}
    </Pressable>
  );

  if (boosted) {
    return (
      <BoostedFrame colors={colors} label={t('boost.badge')} compact>
        {row}
      </BoostedFrame>
    );
  }

  return row;
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const { uid, profile } = useCurrentUserProfile();
  const { settings, loading: settingsLoading, colors, t, locale, theme } = usePreferences();
  const { listings, loading } = useMarketListings();
  const authorIds = useMemo(() => listings.map((i) => i.authorId), [listings]);
  const role: Role = profile.role === 'employer' ? 'employer' : 'welder';
  const heroSheen = useMemo(() => getHeroSheen(theme), [theme]);

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [boostListingId, setBoostListingId] = useState<string | null>(null);
  const [boostFeedback, setBoostFeedback] = useState<string | null>(null);
  const [applied, setApplied] = useState<MarketFilters>(OPEN_FILTERS);
  const [draft, setDraft] = useState<MarketFilters>(OPEN_FILTERS);
  const [showCityHints, setShowCityHints] = useState(false);
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const listRef = useRef<ScrollViewType>(null);

  const { verifiedByAuthor, loading: verifiedLoading } = useAuthorsEmailVerified(
    authorIds,
    applied.onlyVerified || draft.onlyVerified
  );

  // Preferencje z Ustawień — startowe wartości filtrów (jednorazowo po załadowaniu).
  useEffect(() => {
    if (settingsLoading || prefsHydrated) return;
    const next: MarketFilters = {
      locationCity: settings.baseCity.trim(),
      radius: settings.radius,
      type: 'Wszystkie',
      intent: settings.preferredIntent === 'all' ? 'Wszystkie' : settings.preferredIntent,
      modeFilter: [...settings.preferredModes],
      sort: settings.defaultSort,
      onlyMine: false,
      hideOwn: settings.hideOwnInFeed,
      kind: 'all',
      minRate: settings.minRate,
      onlyVerified: settings.onlyVerified,
    };
    setApplied(next);
    setDraft(next);
    setPrefsHydrated(true);
  }, [
    prefsHydrated,
    settings.baseCity,
    settings.defaultSort,
    settings.hideOwnInFeed,
    settings.minRate,
    settings.onlyVerified,
    settings.preferredIntent,
    settings.preferredModes,
    settings.radius,
    settingsLoading,
  ]);

  const patchDraft = <K extends keyof MarketFilters>(key: K, value: MarketFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const openFilters = () => {
    setDraft(applied);
    setShowCityHints(false);
    setFiltersOpen(true);
  };

  const cancelFilters = () => {
    setFiltersOpen(false);
    setShowCityHints(false);
  };

  const clearDraftFilters = () => {
    setDraft({ ...OPEN_FILTERS });
    setShowCityHints(false);
  };

  const applyFilters = () => {
    setApplied({
      ...draft,
      locationCity: draft.locationCity.trim(),
      modeFilter: [...draft.modeFilter],
    });
    setFiltersOpen(false);
    setShowCityHints(false);
  };

  const clearAppliedFilters = () => {
    setApplied({ ...OPEN_FILTERS });
    setDraft({ ...OPEN_FILTERS });
  };

  const cityHints = useMemo(() => {
    const q = draft.locationCity.trim().toLowerCase();
    return CITY_SUGGESTIONS.filter((c) => (q ? c.toLowerCase().includes(q) : true)).slice(0, 10);
  }, [draft.locationCity]);

  const listingCities = useMemo(() => {
    const unique = Array.from(new Set(listings.map((i) => i.location.trim()).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b, 'pl')
    );
    return unique.slice(0, 12);
  }, [listings]);

  const activeFilterCount = useMemo(() => countActiveFilters(applied), [applied]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = listings.filter((i) => {
      if (
        i.kind === 'quick' &&
        (i.quickStatus === 'awarded' || i.quickStatus === 'closed') &&
        !applied.onlyMine
      ) {
        return false;
      }
      if (!uid) return i.targetRole === role;
      if (applied.onlyMine) return i.authorId === uid;
      if (applied.hideOwn && i.authorId === uid) return false;
      return i.targetRole === role || i.authorId === uid;
    });

    const afterKind =
      applied.kind === 'all'
        ? data
        : data.filter((i) => (applied.kind === 'quick' ? isQuickListing(i) : !isQuickListing(i)));

    const afterLocation = afterKind.filter((i) =>
      matchesLocationPreference(i.location, applied.locationCity, applied.radius)
    );
    const afterType =
      applied.type === 'Wszystkie'
        ? afterLocation
        : afterLocation.filter((i) => i.type === applied.type);
    const afterIntent =
      applied.intent === 'Wszystkie'
        ? afterType
        : afterType.filter((i) => i.intent === applied.intent);
    const afterModes =
      applied.modeFilter.length === 0
        ? afterIntent
        : afterIntent.filter((i) => applied.modeFilter.includes(i.mode));
    const afterMinRate =
      applied.minRate > 0
        ? afterModes.filter((i) => {
            const top = effectiveRate(i);
            if (top <= 0) return true;
            return top >= applied.minRate;
          })
        : afterModes;
    const afterQuery = !q
      ? afterMinRate
      : afterMinRate.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.company.toLowerCase().includes(q) ||
            i.location.toLowerCase().includes(q) ||
            i.tags.some((tag) => tag.toLowerCase().includes(q))
        );
    const afterVerified = applied.onlyVerified
      ? afterQuery.filter((i) => verifiedByAuthor[i.authorId] === true)
      : afterQuery;

    return [...afterVerified].sort((a, b) => {
      const aBoost = isListingBoosted(a) ? 1 : 0;
      const bBoost = isListingBoosted(b) ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      if (applied.sort === 'rateAsc') return effectiveRate(a) - effectiveRate(b);
      if (applied.sort === 'rateDesc') return effectiveRate(b) - effectiveRate(a);
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
  }, [applied, listings, query, role, uid, verifiedByAuthor]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / MARKET_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * MARKET_PAGE_SIZE;
    return filtered.slice(start, start + MARKET_PAGE_SIZE);
  }, [filtered, safePage]);

  // Po zmianie filtrów / wyszukiwania wracamy na 1. stronę.
  useEffect(() => {
    setPage(1);
  }, [applied, query]);

  useEffect(() => {
    listRef.current?.scrollTo({ y: 0, animated: true });
  }, [safePage]);

  const goToPage = (next: number) => {
    setPage(Math.min(totalPages, Math.max(1, next)));
  };

  const toggleModeFilter = (mode: WorkMode) => {
    setDraft((prev) => ({
      ...prev,
      modeFilter: prev.modeFilter.includes(mode)
        ? prev.modeFilter.filter((m) => m !== mode)
        : [...prev.modeFilter, mode],
    }));
  };

  const radiusLabel = (r: SettingsRadius) =>
    r === 'Cała Polska' ? t('settings.radiusPoland') : r;

  const draftResultCount = useMemo(() => {
    // Szybkie podglądowe liczenie przy otwartym arkuszu — te same reguły co `filtered`.
    if (!filtersOpen) return filtered.length;
    const probe = { ...draft, locationCity: draft.locationCity.trim() };
    return listings.filter((i) => {
      if (
        i.kind === 'quick' &&
        (i.quickStatus === 'awarded' || i.quickStatus === 'closed') &&
        !probe.onlyMine
      ) {
        return false;
      }
      if (!uid) {
        if (i.targetRole !== role) return false;
      } else if (probe.onlyMine) {
        if (i.authorId !== uid) return false;
      } else {
        if (probe.hideOwn && i.authorId === uid) return false;
        if (!(i.targetRole === role || i.authorId === uid)) return false;
      }
      if (probe.kind === 'quick' && !isQuickListing(i)) return false;
      if (probe.kind === 'standard' && isQuickListing(i)) return false;
      if (!matchesLocationPreference(i.location, probe.locationCity, probe.radius)) return false;
      if (probe.type !== 'Wszystkie' && i.type !== probe.type) return false;
      if (probe.intent !== 'Wszystkie' && i.intent !== probe.intent) return false;
      if (probe.modeFilter.length > 0 && !probe.modeFilter.includes(i.mode)) return false;
      if (probe.minRate > 0) {
        const top = effectiveRate(i);
        if (top > 0 && top < probe.minRate) return false;
      }
      const q = query.trim().toLowerCase();
      if (q) {
        const hay = `${i.title} ${i.company} ${i.location} ${i.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (probe.onlyVerified && verifiedByAuthor[i.authorId] !== true) return false;
      return true;
    }).length;
  }, [draft, filtered.length, filtersOpen, listings, query, role, uid, verifiedByAuthor]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={[...getHeroGradient(theme)]} locations={[0, 0.32, 0.62]} style={styles.bgGlow} />
      <LinearGradient
        colors={[...heroSheen.colors]}
        start={heroSheen.start}
        end={heroSheen.end}
        style={styles.bgSheen}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          ref={listRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <Text style={styles.brand}>TheWeldersWorld</Text>
              <View style={styles.roleBadge}>
                <MaterialIcons
                  name={role === 'welder' ? 'engineering' : 'business-center'}
                  size={14}
                  color="#DCEBFF"
                />
                <Text style={styles.roleBadgeText}>
                  {role === 'welder' ? t('market.roleWelder') : t('market.roleEmployer')}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>
              {role === 'welder' ? t('market.titleWelder') : t('market.titleEmployer')}
            </Text>
            <Text style={styles.subtitle}>{t('market.subtitle')}</Text>
            <Pressable style={[styles.addBtn, { backgroundColor: colors.card }]} onPress={() => router.push('/listing/new')}>
              <MaterialIcons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>{t('market.addListing')}</Text>
            </Pressable>
          </View>

          <TabTipCard tipId="market" />

          <View style={styles.quickBar}>
            <View style={[styles.searchField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="search" size={20} color={colors.textSoft} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={query}
                onChangeText={setQuery}
                placeholder={t('market.searchPlaceholder')}
                placeholderTextColor={colors.textSoft}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={colors.textSoft} />
                </Pressable>
              ) : null}
            </View>
            <Pressable style={[styles.filtersBtn, { backgroundColor: colors.primary }]} onPress={openFilters}>
              <MaterialIcons name="tune" size={18} color="#FFFFFF" />
              <Text style={styles.filtersBtnText}>{t('market.filters')}</Text>
              {activeFilterCount > 0 ? (
                <View style={styles.filtersCount}>
                  <Text style={styles.filtersCountText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {activeFilterCount > 0 ||
          settings.baseCity.trim() ||
          settings.onlyVerified ||
          settings.minRate > 0 ? (
            <Pressable style={styles.prefsLine} onPress={openFilters}>
              <Text style={[styles.prefsLineText, { color: colors.textMuted }]} numberOfLines={2}>
                {[
                  applied.locationCity.trim()
                    ? applied.radius === 'Cała Polska'
                      ? applied.locationCity.trim()
                      : `${applied.locationCity.trim()} · ${radiusLabel(applied.radius)}`
                    : '',
                  applied.minRate > 0 ? t('market.minRateStrip', { n: applied.minRate }) : '',
                  applied.kind === 'quick'
                    ? t('market.kindQuick')
                    : applied.kind === 'standard'
                      ? t('market.kindStandard')
                      : '',
                  applied.intent === 'offer'
                    ? t('settings.intentOffer')
                    : applied.intent === 'seek'
                      ? t('settings.intentSeek')
                      : '',
                  applied.modeFilter.length > 0
                    ? applied.modeFilter.map((m) => workModeLabel(m, t)).join(', ')
                    : '',
                  applied.onlyMine ? t('market.myListings') : '',
                  applied.hideOwn ? t('settings.hideOwn') : '',
                  applied.onlyVerified ? t('settings.onlyVerified') : '',
                ]
                  .filter(Boolean)
                  .join(' · ') || t('market.filters')}
              </Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.textSoft} />
            </Pressable>
          ) : null}

          <Text style={[styles.resultsLabel, { color: colors.text }]}>
            {filtered.length} {t('market.results')}
            {filtered.length > MARKET_PAGE_SIZE
              ? ` · ${t('market.pageOf', { page: safePage, pages: totalPages })}`
              : ''}
          </Text>

          {loading || (applied.onlyVerified && verifiedLoading) ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.loading')}</Text>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('market.empty')}</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text style={[styles.resetLink, { color: colors.primary }]}>{t('market.goToSettings')}</Text>
              </Pressable>
              {activeFilterCount > 0 ? (
                <Pressable onPress={clearAppliedFilters}>
                  <Text style={[styles.resetLink, { color: colors.primary }]}>
                    {t('market.clearFilters')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <>
              {paged.map((item) => (
                <ListingRow
                  key={item.id}
                  item={item}
                  role={role}
                  showGrossRate={settings.showGrossRate}
                  locale={locale}
                  colors={colors}
                  t={t}
                  isOwn={Boolean(uid && item.authorId === uid)}
                  onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                  onBoost={
                    uid && item.authorId === uid
                      ? () => setBoostListingId(item.id)
                      : undefined
                  }
                />
              ))}
              {totalPages > 1 ? (
                <View style={styles.pager}>
                  <Pressable
                    style={[
                      styles.pagerBtn,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        opacity: safePage <= 1 ? 0.45 : 1,
                      },
                    ]}
                    disabled={safePage <= 1}
                    onPress={() => goToPage(safePage - 1)}>
                    <MaterialIcons name="chevron-left" size={20} color={colors.primary} />
                    <Text style={[styles.pagerBtnText, { color: colors.primary }]}>
                      {t('market.prevPage')}
                    </Text>
                  </Pressable>
                  <Text style={[styles.pagerLabel, { color: colors.textMuted }]}>
                    {t('market.pageOf', { page: safePage, pages: totalPages })}
                  </Text>
                  <Pressable
                    style={[
                      styles.pagerBtn,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        opacity: safePage >= totalPages ? 0.45 : 1,
                      },
                    ]}
                    disabled={safePage >= totalPages}
                    onPress={() => goToPage(safePage + 1)}>
                    <Text style={[styles.pagerBtnText, { color: colors.primary }]}>
                      {t('market.nextPage')}
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
          {boostFeedback ? (
            <Text style={[styles.emptyText, { color: colors.success }]}>{boostFeedback}</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {boostListingId ? (
        <BoostListingSheet
          visible
          listingId={boostListingId}
          colors={colors}
          t={t}
          onClose={() => setBoostListingId(null)}
          onSuccess={(message) => {
            setBoostFeedback(message);
            setTimeout(() => setBoostFeedback(null), 4000);
          }}
        />
      ) : null}

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={cancelFilters}>
        <View style={styles.sheetRoot}>
          <Pressable
            style={[styles.sheetBackdrop, { backgroundColor: colors.overlay }]}
            onPress={cancelFilters}
          />
          <View style={[styles.sheet, { backgroundColor: colors.bgElevated }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.borderStrong }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('market.filters')}</Text>
              <View style={styles.sheetHeaderActions}>
                <Pressable onPress={clearDraftFilters} hitSlop={8}>
                  <Text style={[styles.resetLink, { color: colors.textMuted }]}>
                    {t('market.clearFilters')}
                  </Text>
                </Pressable>
                <Pressable onPress={cancelFilters} hitSlop={8}>
                  <Text style={[styles.resetLink, { color: colors.primary }]}>{t('common.cancel')}</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetBody}
              keyboardShouldPersistTaps="handled">
              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('market.filterLocation')}
              </Text>
              <View
                style={[
                  styles.locationField,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}>
                <MaterialIcons name="place" size={18} color={colors.textSoft} />
                <TextInput
                  style={[styles.locationInput, { color: colors.text }]}
                  value={draft.locationCity}
                  onChangeText={(v) => {
                    patchDraft('locationCity', v);
                    setShowCityHints(true);
                  }}
                  onFocus={() => setShowCityHints(true)}
                  placeholder={t('market.filterLocationPh')}
                  placeholderTextColor={colors.textSoft}
                  autoCorrect={false}
                />
                {draft.locationCity ? (
                  <Pressable
                    onPress={() => {
                      patchDraft('locationCity', '');
                      setShowCityHints(false);
                    }}
                    hitSlop={8}>
                    <MaterialIcons name="close" size={18} color={colors.textSoft} />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.chipWrap}>
                <Chip
                  label={t('market.allFilter')}
                  active={!draft.locationCity.trim()}
                  onPress={() => {
                    patchDraft('locationCity', '');
                    patchDraft('radius', 'Cała Polska');
                    setShowCityHints(false);
                  }}
                  colors={colors}
                />
                {profile.city.trim() ? (
                  <Chip
                    label={profile.city.trim()}
                    active={
                      draft.locationCity.trim().toLowerCase() === profile.city.trim().toLowerCase()
                    }
                    onPress={() => {
                      patchDraft('locationCity', profile.city.trim());
                      setShowCityHints(false);
                    }}
                    colors={colors}
                  />
                ) : null}
              </View>
              <Text style={[styles.sheetHint, { color: colors.textSoft }]}>
                {t('market.popularCities')}
              </Text>
              <View style={styles.chipWrap}>
                {POPULAR_CITIES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    active={draft.locationCity.trim().toLowerCase() === c.toLowerCase()}
                    onPress={() => {
                      patchDraft('locationCity', c);
                      if (draft.radius === 'Cała Polska') patchDraft('radius', '50 km');
                      setShowCityHints(false);
                    }}
                    colors={colors}
                  />
                ))}
              </View>
              {showCityHints && cityHints.length > 0 ? (
                <View style={styles.chipWrap}>
                  {cityHints.map((c) => (
                    <Chip
                      key={`hint-${c}`}
                      label={c}
                      active={draft.locationCity.trim().toLowerCase() === c.toLowerCase()}
                      onPress={() => {
                        patchDraft('locationCity', c);
                        if (draft.radius === 'Cała Polska') patchDraft('radius', '50 km');
                        setShowCityHints(false);
                      }}
                      colors={colors}
                    />
                  ))}
                </View>
              ) : null}
              {listingCities.length > 0 ? (
                <View style={styles.chipWrap}>
                  {listingCities.map((c) => (
                    <Chip
                      key={`listing-${c}`}
                      label={c}
                      active={draft.locationCity.trim().toLowerCase() === c.toLowerCase()}
                      onPress={() => {
                        patchDraft('locationCity', c);
                        setShowCityHints(false);
                      }}
                      colors={colors}
                    />
                  ))}
                </View>
              ) : null}

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('market.filterRadius')}
              </Text>
              <View style={styles.chipWrap}>
                {RADIUS_VALUES.map((r) => (
                  <Chip
                    key={r}
                    label={radiusLabel(r)}
                    active={draft.radius === r}
                    onPress={() => patchDraft('radius', r)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('market.filterKind')}
              </Text>
              <View style={styles.chipWrap}>
                {(
                  [
                    ['all', t('market.kindAll')],
                    ['standard', t('market.kindStandard')],
                    ['quick', t('market.kindQuick')],
                  ] as const
                ).map(([value, label]) => (
                  <Chip
                    key={value}
                    label={label}
                    active={draft.kind === value}
                    onPress={() => patchDraft('kind', value)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>{t('listing.collabType')}</Text>
              <View style={styles.chipWrap}>
                {chipsType.map((c) => (
                  <Chip
                    key={c}
                    label={c === 'Wszystkie' ? t('market.allFilter') : listingTypeLabel(c, t)}
                    active={draft.type === c}
                    onPress={() => patchDraft('type', c)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('settings.preferredModes')}
              </Text>
              <View style={styles.chipWrap}>
                <Chip
                  label={t('market.allFilter')}
                  active={draft.modeFilter.length === 0}
                  onPress={() => patchDraft('modeFilter', [])}
                  colors={colors}
                />
                {ALL_MODES.map((mode) => (
                  <Chip
                    key={mode}
                    label={workModeLabel(mode, t)}
                    active={draft.modeFilter.includes(mode)}
                    onPress={() => toggleModeFilter(mode)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('settings.preferredIntent')}
              </Text>
              <View style={styles.chipWrap}>
                {chipsIntent.map((c) => (
                  <Chip
                    key={c}
                    label={
                      c === 'Wszystkie'
                        ? t('market.allFilter')
                        : c === 'offer'
                          ? t('settings.intentOffer')
                          : t('settings.intentSeek')
                    }
                    active={draft.intent === c}
                    onPress={() => patchDraft('intent', c)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('market.filterMinRate')}
              </Text>
              <View style={styles.chipWrap}>
                {MIN_RATE_OPTIONS.map((n) => (
                  <Chip
                    key={n}
                    label={n === 0 ? t('market.allFilter') : `${n}+ PLN/h`}
                    active={draft.minRate === n}
                    onPress={() => patchDraft('minRate', n)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('settings.defaultSort')}
              </Text>
              <View style={styles.chipWrap}>
                <Chip
                  label={t('settings.sortNewest')}
                  active={draft.sort === 'newest'}
                  onPress={() => patchDraft('sort', 'newest')}
                  colors={colors}
                />
                <Chip
                  label={t('settings.sortRateDesc')}
                  active={draft.sort === 'rateDesc'}
                  onPress={() => patchDraft('sort', 'rateDesc')}
                  colors={colors}
                />
                <Chip
                  label={t('settings.sortRateAsc')}
                  active={draft.sort === 'rateAsc'}
                  onPress={() => patchDraft('sort', 'rateAsc')}
                  colors={colors}
                />
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>
                {t('settings.onlyVerified')}
              </Text>
              <View style={styles.chipWrap}>
                <Chip
                  label={t('market.allFilter')}
                  active={!draft.onlyVerified}
                  onPress={() => patchDraft('onlyVerified', false)}
                  colors={colors}
                />
                <Chip
                  label={t('settings.onlyVerified')}
                  active={draft.onlyVerified}
                  onPress={() => patchDraft('onlyVerified', true)}
                  colors={colors}
                />
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>{t('settings.hideOwn')}</Text>
              <View style={styles.chipWrap}>
                <Chip
                  label={t('market.allFilter')}
                  active={!draft.hideOwn}
                  onPress={() => patchDraft('hideOwn', false)}
                  colors={colors}
                />
                <Chip
                  label={t('settings.hideOwn')}
                  active={draft.hideOwn}
                  onPress={() => patchDraft('hideOwn', true)}
                  colors={colors}
                />
              </View>

              <Text style={[styles.sheetSection, { color: colors.text }]}>{t('market.myListings')}</Text>
              <View style={styles.chipWrap}>
                <Chip
                  label={t('market.allFilter')}
                  active={!draft.onlyMine}
                  onPress={() => patchDraft('onlyMine', false)}
                  colors={colors}
                />
                <Chip
                  label={t('market.myListings')}
                  active={draft.onlyMine}
                  onPress={() => patchDraft('onlyMine', true)}
                  colors={colors}
                />
              </View>
            </ScrollView>
            <Pressable
              style={[styles.sheetApply, { backgroundColor: colors.primary }]}
              onPress={applyFilters}>
              <Text style={styles.sheetApplyText}>
                {t('market.applyFilters')} · {draftResultCount} {t('market.results')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgGlow: { ...StyleSheet.absoluteFillObject },
  bgSheen: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 36, gap: 12 },

  hero: {
    marginTop: 4,
    paddingTop: 8,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: { color: '#BFD7FF', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  roleBadgeText: { color: '#E8F0FF', fontSize: 11, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 10, letterSpacing: -0.3 },
  subtitle: { color: '#D7E6FF', marginTop: 6, fontSize: 14, lineHeight: 20, maxWidth: 320 },
  addBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { fontWeight: '700', fontSize: 13 },

  quickBar: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filtersBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  filtersCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filtersCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  prefsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  prefsLineText: { flex: 1, color: '#475569', fontSize: 12 },

  resultsLabel: { color: '#10233E', fontSize: 15, fontWeight: '700', marginTop: 4 },

  listingRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.45)',
    gap: 5,
  },
  listingRowBoosted: {
    borderBottomWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  listingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  listingBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  metaBadge: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  intentBadge: { color: '#C2410C', backgroundColor: 'rgba(255,247,237,0.95)' },
  listingRowQuick: {
    backgroundColor: 'rgba(255,247,237,0.55)',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  quickBadge: { color: '#C2410C', backgroundColor: '#FFEDD5' },
  durationBadge: { color: '#047857', backgroundColor: '#ECFDF5' },
  quickSlotsRow: { marginTop: 4, marginBottom: 2 },
  listingRate: { color: '#0E4AA4', fontWeight: '800', fontSize: 13 },
  listingTitle: { color: '#0F172A', fontSize: 17, fontWeight: '700' },
  listingCompany: { color: '#475569', fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  metaText: { color: '#64748B', fontSize: 12 },
  metaDot: { color: '#94A3B8' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  tagText: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  listingCta: { color: '#0E4AA4', fontWeight: '700', fontSize: 12, marginTop: 4 },
  rowBoostBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rowBoostText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

  emptyBlock: { paddingVertical: 28, gap: 6 },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#64748B', fontSize: 13, lineHeight: 18 },
  resetLink: { color: '#0E4AA4', fontWeight: '700', fontSize: 13 },

  pager: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pagerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  pagerBtnText: { fontWeight: '700', fontSize: 12 },
  pagerLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', flexShrink: 1 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DEEA',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: '#0E4AA4', borderColor: '#0E4AA4' },
  chipText: { color: '#334155', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#FFFFFF' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '86%',
    paddingBottom: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  sheetHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', flexShrink: 1 },
  sheetBody: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  sheetSection: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  sheetHint: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  locationField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationInput: { flex: 1, fontSize: 15, padding: 0 },
  sheetApply: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetApplyText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
