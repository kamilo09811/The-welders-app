import { sendEmailVerification, type User } from 'firebase/auth';

import { mapAuthError } from '@/lib/mapAuthError';
import type { AppLocale } from '@/lib/i18n';

/**
 * Wysyła mail weryfikacyjny Firebase Auth.
 * Nadawca domyślnie: noreply@<project>.firebaseapp.com — często ląduje w Spam / Oferty.
 */
export async function sendAccountVerificationEmail(
  user: User,
  locale: AppLocale = 'pl'
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await sendEmailVerification(user);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: mapAuthError(e, locale) };
  }
}
