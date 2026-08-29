import type { ListingApplication } from '@/lib/listing-applications';
import type { ListingIntent, ListingType, WorkMode } from '@/lib/market-listings';
import { translate, type AppLocale, type TranslationKey } from '@/lib/i18n';

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function workModeLabel(mode: WorkMode, t: TFn): string {
  if (mode === 'Na hali') return t('mode.hall');
  if (mode === 'Hybryda') return t('mode.hybrid');
  return t('mode.mobile');
}

export function listingTypeLabel(type: ListingType, t: TFn): string {
  if (type === 'Umowa o pracę') return t('market.typeEmployment');
  if (type === 'B2B') return t('market.typeB2B');
  return t('market.typeContract');
}

export function listingIntentShort(intent: ListingIntent, t: TFn): string {
  return intent === 'offer' ? t('intent.offer') : t('intent.seek');
}

export function listingIntentForRole(
  role: 'welder' | 'employer',
  intent: ListingIntent,
  t: TFn
): string {
  if (role === 'employer') {
    return intent === 'offer' ? t('listing.intentOfferJob') : t('listing.intentSeekWelder');
  }
  return intent === 'offer' ? t('listing.intentOfferService') : t('listing.intentSeekJob');
}

export function applicationStatusLabel(
  status: ListingApplication['status'],
  t: TFn
): string {
  if (status === 'new') return t('status.new');
  if (status === 'in_progress') return t('status.inProgress');
  if (status === 'accepted') return t('status.accepted');
  return t('status.rejected');
}

export function roleLabel(role: 'welder' | 'employer', t: TFn): string {
  return role === 'employer' ? t('market.roleEmployer') : t('market.roleWelder');
}

export function quickDurationLabel(value: string, t: TFn): string {
  const map: Record<string, TranslationKey> = {
    'Kilka godzin': 'duration.hours',
    '1 dzień': 'duration.day',
    'Kilka dni': 'duration.days',
    Tydzień: 'duration.week',
    'Do uzgodnienia': 'duration.tbd',
  };
  const key = map[value];
  return key ? t(key) : value;
}

export const QUICK_DURATION_VALUES = [
  'Kilka godzin',
  '1 dzień',
  'Kilka dni',
  'Tydzień',
  'Do uzgodnienia',
] as const;

export function reviewCountLabel(count: number, locale: AppLocale): string {
  if (count === 1) return translate(locale, 'profile.reviewOne');
  if (locale === 'pl' && count >= 2 && count <= 4) return translate(locale, 'profile.reviewFew');
  return translate(locale, 'profile.reviewMany');
}
