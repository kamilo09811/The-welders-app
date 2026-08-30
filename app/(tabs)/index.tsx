import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { ListingIntent, ListingType, MarketListing, WorkMode } from '@/lib/market-listings';
import { isListingBoosted, isQuickListing } from '@/lib/market-listings';
import { matchesLocationPreference } from '@/lib/pl-cities';
import { usePreferences } from '@/lib/preferences-context';
import { getHeroGradient } from '@/lib/theme';
import { useMarketListings } from '@/lib/use-market-listings';
import { useCurrentUserProfile, useAuthorsEmailVerified } from '@/lib/user-profile';
import { formatRateLabel, type SettingsSort } from '@/lib/user-settings';
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
import type { AppColors } from '@/lib/theme';
import type { TranslationKey } from '@/lib/i18n';

type Role = 'welder' | 'employer';

const ALL_MODES: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];

const chipsType: ('Wszystkie' | ListingType)[] = [
  'Wszystkie',
  'Umowa o pracę',
  'B2B',
  'Umowa zlecenie',
];
const chipsIntent: ('Wszystkie' | ListingIntent)[] = ['Wszystkie', 'offer', 'seek'];

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
  const { verifiedByAuthor, loading: verifiedLoading } = useAuthorsEmailVerified(
    authorIds,
    settings.onlyVerified
  );
  const role: Role = profile.role === 'employer' ? 'employer' : 'welder';

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [boostListingId, setBoostListingId] = useState<string | null>(null);
  const [boostFeedback, setBoostFeedback] = useState<string | null>(null);
  const [location, setLocation] = useState('Wszystkie');
  const [type, setType] = useState<'Wszystkie' | ListingType>('Wszystkie');
  const [intent, setIntent] = useState<'Wszystkie' | ListingIntent>('Wszystkie');
  const [sort, setSort] = useState<SettingsSort>('newest');
  const [modeFilter, setModeFilter] = useState<WorkMode[]>([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [hideOwn, setHideOwn] = useState(false);

  // Preferencje z Ustawień są źródłem prawdy — synchronizuj po każdym zapisie / załadowaniu.
  useEffect(() => {
    if (settingsLoading) return;
    setSort(settings.defaultSort);
    setIntent(settings.preferredIntent === 'all' ? 'Wszystkie' : settings.preferredIntent);
    setModeFilter([...settings.preferredModes]);
    setHideOwn(settings.hideOwnInFeed);
  }, [
    settings.defaultSort,
    settings.hideOwnInFeed,
    settings.preferredIntent,
    settings.preferredModes,
    settingsLoading,
  ]);

  const chipsLocation = useMemo(() => {
    const unique = Array.from(new Set(listings.map((i) => i.location))).sort((a, b) =>
      a.localeCompare(b, 'pl')
    );
    return ['Wszystkie', ...unique];
  }, [listings]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (location !== 'Wszystkie') n += 1;
    if (type !== 'Wszystkie') n += 1;
    if (intent !== 'Wszystkie') n += 1;
    if (modeFilter.length > 0) n += 1;
    if (sort !== settings.defaultSort) n += 1;
    if (hideOwn !== settings.hideOwnInFeed) n += 1;
    if (onlyMine) n += 1;
    return n;
  }, [
    hideOwn,
    intent,
    location,
    modeFilter.length,
    onlyMine,
    settings.defaultSort,
    settings.hideOwnInFeed,
    sort,
    type,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = listings.filter((i) => {
      // Zakończone szybkie zlecenia znikają z tablicy (zostają w „tylko moje”).
      if (
        i.kind === 'quick' &&
        (i.quickStatus === 'awarded' || i.quickStatus === 'closed') &&
        !onlyMine
      ) {
        return false;
      }
      if (!uid) return i.targetRole === role;
      if (onlyMine) return i.authorId === uid;
      if (hideOwn && i.authorId === uid) return false;
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
      modeFilter.length === 0
        ? afterIntent
        : afterIntent.filter((i) => modeFilter.includes(i.mode));
    const afterMinRate =
      settings.minRate > 0
        ? afterModes.filter((i) => {
            const top = effectiveRate(i);
            // Ogłoszenia bez stawki nie wypadają z feedu przy filtrze minRate.
            if (top <= 0) return true;
            return top >= settings.minRate;
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
    const afterVerified = settings.onlyVerified
      ? afterQuery.filter((i) => verifiedByAuthor[i.authorId] === true)
      : afterQuery;

    return [...afterVerified].sort((a, b) => {
      const aBoost = isListingBoosted(a) ? 1 : 0;
      const bBoost = isListingBoosted(b) ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      if (sort === 'rateAsc') return effectiveRate(a) - effectiveRate(b);
      if (sort === 'rateDesc') return effectiveRate(b) - effectiveRate(a);
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
  }, [
    hideOwn,
    intent,
    listings,
    location,
    modeFilter,
    onlyMine,
    query,
    role,
    settings.baseCity,
    settings.minRate,
    settings.onlyVerified,
    settings.radius,
    sort,
    type,
    uid,
    verifiedByAuthor,
  ]);

  const toggleModeFilter = (mode: WorkMode) => {
    setModeFilter((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const resetFilters = () => {
    setLocation('Wszystkie');
    setType('Wszystkie');
    setIntent(settings.preferredIntent === 'all' ? 'Wszystkie' : settings.preferredIntent);
    setSort(settings.defaultSort);
    setModeFilter([...settings.preferredModes]);
    setHideOwn(settings.hideOwnInFeed);
    setOnlyMine(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={[...getHeroGradient(theme)]} locations={[0, 0.28, 0.55]} style={styles.bgGlow} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroOrbA} />
            <View style={styles.heroOrbB} />
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
            <Pressable style={[styles.filtersBtn, { backgroundColor: colors.primary }]} onPress={() => setFiltersOpen(true)}>
              <MaterialIcons name="tune" size={18} color="#FFFFFF" />
              <Text style={styles.filtersBtnText}>{t('market.filters')}</Text>
              {activeFilterCount > 0 ? (
                <View style={styles.filtersCount}>
                  <Text style={styles.filtersCountText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {settings.baseCity.trim() ||
          settings.onlyVerified ||
          settings.minRate > 0 ||
          settings.preferredModes.length > 0 ||
          settings.preferredIntent !== 'all' ||
          settings.defaultSort !== 'newest' ||
          settings.hideOwnInFeed ? (
            <Pressable style={styles.prefsLine} onPress={() => router.push('/(tabs)/explore')}>
              <Text style={[styles.prefsLineText, { color: colors.textMuted }]} numberOfLines={2}>
                {[
                  settings.baseCity.trim()
                    ? settings.radius === 'Cała Polska'
                      ? settings.baseCity.trim()
                      : `${settings.baseCity.trim()} · ${settings.radius}`
                    : '',
                  settings.minRate > 0 ? t('market.minRateStrip', { n: settings.minRate }) : '',
                  settings.preferredIntent === 'offer'
                    ? t('settings.intentOffer')
                    : settings.preferredIntent === 'seek'
                      ? t('settings.intentSeek')
                      : '',
                  settings.preferredModes.length > 0
                    ? settings.preferredModes.map((m) => workModeLabel(m, t)).join(', ')
                    : '',
                  settings.defaultSort === 'rateDesc'
                    ? t('settings.sortRateDesc')
                    : settings.defaultSort === 'rateAsc'
                      ? t('settings.sortRateAsc')
                      : '',
                  settings.hideOwnInFeed ? t('settings.hideOwn') : '',
                  settings.onlyVerified ? t('settings.onlyVerified') : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.textSoft} />
            </Pressable>
          ) : null}

          <Text style={[styles.resultsLabel, { color: colors.text }]}>
            {filtered.length} {t('market.results')}
          </Text>

          {loading || (settings.onlyVerified && verifiedLoading) ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.loading')}</Text>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('market.empty')}</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text style={[styles.resetLink, { color: colors.primary }]}>{t('market.goToSettings')}</Text>
              </Pressable>
              {activeFilterCount > 0 ? (
                <Pressable onPress={resetFilters}>
                  <Text style={[styles.resetLink, { color: colors.primary }]}>{t('common.cancel')}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            filtered.map((item) => (
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
            ))
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

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={[styles.sheetBackdrop, { backgroundColor: colors.overlay }]} onPress={() => setFiltersOpen(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.bgElevated }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.borderStrong }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('market.filters')}</Text>
            <Pressable onPress={resetFilters}>
              <Text style={[styles.resetLink, { color: colors.primary }]}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('settings.section.location')}</Text>
            <View style={styles.chipWrap}>
              {chipsLocation.map((c) => (
                <Chip
                  key={c}
                  label={c === 'Wszystkie' ? t('market.allFilter') : c}
                  active={location === c}
                  onPress={() => setLocation(c)}
                  colors={colors}
                />
              ))}
            </View>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('listing.collabType')}</Text>
            <View style={styles.chipWrap}>
              {chipsType.map((c) => (
                <Chip
                  key={c}
                  label={
                    c === 'Wszystkie' ? t('market.allFilter') : listingTypeLabel(c, t)
                  }
                  active={type === c}
                  onPress={() => setType(c)}
                  colors={colors}
                />
              ))}
            </View>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('settings.preferredModes')}</Text>
            <View style={styles.chipWrap}>
              <Chip
                label={t('market.allFilter')}
                active={modeFilter.length === 0}
                onPress={() => setModeFilter([])}
                colors={colors}
              />
              {ALL_MODES.map((mode) => (
                <Chip
                  key={mode}
                  label={workModeLabel(mode, t)}
                  active={modeFilter.includes(mode)}
                  onPress={() => toggleModeFilter(mode)}
                  colors={colors}
                />
              ))}
            </View>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('settings.preferredIntent')}</Text>
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
                  active={intent === c}
                  onPress={() => setIntent(c)}
                  colors={colors}
                />
              ))}
            </View>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('settings.defaultSort')}</Text>
            <View style={styles.chipWrap}>
              <Chip
                label={t('settings.sortNewest')}
                active={sort === 'newest'}
                onPress={() => setSort('newest')}
                colors={colors}
              />
              <Chip
                label={t('settings.sortRateDesc')}
                active={sort === 'rateDesc'}
                onPress={() => setSort('rateDesc')}
                colors={colors}
              />
              <Chip
                label={t('settings.sortRateAsc')}
                active={sort === 'rateAsc'}
                onPress={() => setSort('rateAsc')}
                colors={colors}
              />
            </View>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('settings.hideOwn')}</Text>
            <View style={styles.chipWrap}>
              <Chip
                label={t('market.allFilter')}
                active={!hideOwn}
                onPress={() => setHideOwn(false)}
                colors={colors}
              />
              <Chip
                label={t('settings.hideOwn')}
                active={hideOwn}
                onPress={() => setHideOwn(true)}
                colors={colors}
              />
            </View>
            <Text style={[styles.sheetSection, { color: colors.text }]}>{t('market.myListings')}</Text>
            <View style={styles.chipWrap}>
              <Chip
                label={t('market.allFilter')}
                active={!onlyMine}
                onPress={() => setOnlyMine(false)}
                colors={colors}
              />
              <Chip
                label={t('market.myListings')}
                active={onlyMine}
                onPress={() => setOnlyMine(true)}
                colors={colors}
              />
            </View>
          </ScrollView>
          <Pressable
            style={[styles.sheetApply, { backgroundColor: colors.primary }]}
            onPress={() => setFiltersOpen(false)}>
            <Text style={styles.sheetApplyText}>
              {filtered.length} {t('market.results')}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EEF7' },
  bgGlow: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 36, gap: 12 },

  hero: {
    marginTop: 4,
    paddingTop: 8,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  heroOrbA: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  heroOrbB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(191,215,255,0.12)',
    top: 40,
    left: -50,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { color: '#0E4AA4', fontWeight: '700', fontSize: 13 },

  quickBar: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(213,222,234,0.9)',
  },
  searchInput: { flex: 1, color: '#0F172A', fontSize: 15, padding: 0 },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E4AA4',
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

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)' },
  sheet: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '78%',
    paddingBottom: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sheetTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  sheetBody: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  sheetSection: { color: '#10233E', fontSize: 13, fontWeight: '700', marginTop: 8 },
  sheetApply: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#0E4AA4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetApplyText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
