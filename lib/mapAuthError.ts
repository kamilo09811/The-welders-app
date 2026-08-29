import { translate, type AppLocale } from '@/lib/i18n';

function isAuthLikeError(e: unknown): e is { code: string; message?: string } {
  return typeof e === 'object' && e !== null && 'code' in e && typeof (e as { code: unknown }).code === 'string';
}

/** Czytelny komunikat Auth na podstawie kodu Firebase + locale UI. */
export function mapAuthError(e: unknown, locale: AppLocale = 'pl'): string {
  if (!isAuthLikeError(e)) {
    return translate(locale, 'auth.err.generic');
  }
  switch (e.code) {
    case 'auth/invalid-email':
      return translate(locale, 'auth.err.invalidEmail');
    case 'auth/user-disabled':
      return translate(locale, 'auth.err.userDisabled');
    case 'auth/user-not-found':
      return translate(locale, 'auth.err.userNotFound');
    case 'auth/wrong-password':
      return translate(locale, 'auth.err.wrongPassword');
    case 'auth/invalid-credential':
      return translate(locale, 'auth.err.invalidCredential');
    case 'auth/email-already-in-use':
      return translate(locale, 'auth.err.emailInUse');
    case 'auth/weak-password':
      return translate(locale, 'auth.err.weakPassword');
    case 'auth/too-many-requests':
      return translate(locale, 'auth.err.tooManyRequests');
    case 'auth/network-request-failed':
      return translate(locale, 'auth.err.network');
    case 'auth/operation-not-allowed':
      return translate(locale, 'auth.err.notAllowed');
    case 'auth/missing-email':
      return translate(locale, 'auth.err.missingEmail');
    case 'auth/account-exists-with-different-credential':
      return translate(locale, 'auth.err.differentCredential');
    default:
      return e.message || translate(locale, 'auth.err.default');
  }
}
