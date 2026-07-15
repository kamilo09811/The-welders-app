import type { User } from 'firebase/auth';

/** Konto e-mail/hasło bez potwierdzonego adresu — wymaga przejścia weryfikacji. */
export function needsEmailVerification(user: User | null): boolean {
  if (!user?.email) return false;
  if (user.emailVerified) return false;
  return user.providerData.some((p) => p.providerId === 'password');
}
