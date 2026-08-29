import { APP_LOCALES, DICTIONARIES, type AppLocale, type TranslationKey } from './dictionaries';

export type { AppLocale, TranslationKey } from './dictionaries';
export { APP_LOCALES };

export function translate(locale: AppLocale, key: TranslationKey, vars?: Record<string, string | number>): string {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES.pl;
  let text = dict[key] ?? DICTIONARIES.pl[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'pl' || value === 'en' || value === 'de' || value === 'da';
}

export function localeToBcp47(locale: AppLocale): string {
  if (locale === 'pl') return 'pl-PL';
  if (locale === 'de') return 'de-DE';
  if (locale === 'da') return 'da-DK';
  return 'en-GB';
}
