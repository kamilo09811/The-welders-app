import { sendEmailVerification, type User } from 'firebase/auth';

import { mapAuthError } from '@/lib/mapAuthError';

/**
 * Wysyła mail weryfikacyjny Firebase Auth.
 * Nadawca domyślnie: noreply@<project>.firebaseapp.com — często ląduje w Spam / Oferty.
 */
export async function sendAccountVerificationEmail(user: User): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await sendEmailVerification(user);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: mapAuthError(e) };
  }
}
