function isAuthLikeError(e: unknown): e is { code: string; message?: string } {
  return typeof e === 'object' && e !== null && 'code' in e && typeof (e as { code: unknown }).code === 'string';
}

/** Czytelny komunikat po polsku na podstawie kodu Firebase Auth. */
export function mapAuthError(e: unknown): string {
  if (!isAuthLikeError(e)) {
    return 'Coś poszło nie tak. Spróbuj ponownie.';
  }
  switch (e.code) {
    case 'auth/invalid-email':
      return 'Nieprawidłowy adres e-mail.';
    case 'auth/user-disabled':
      return 'To konto zostało wyłączone.';
    case 'auth/user-not-found':
      return 'Nie znaleziono konta z tym adresem e-mail.';
    case 'auth/wrong-password':
      return 'Nieprawidłowe hasło.';
    case 'auth/invalid-credential':
      return 'Błędny e-mail lub hasło.';
    case 'auth/email-already-in-use':
      return 'Ten adres e-mail jest już zarejestrowany.';
    case 'auth/weak-password':
      return 'Hasło jest za słabe (Firebase wymaga min. 6 znaków — w konsoli możesz ustawić silniejszą politykę).';
    case 'auth/too-many-requests':
      return 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.';
    case 'auth/network-request-failed':
      return 'Brak połączenia z siecią. Sprawdź internet.';
    case 'auth/operation-not-allowed':
      return 'Ta metoda logowania jest wyłączona w Firebase (włącz ją w konsoli).';
    case 'auth/missing-email':
      return 'Podaj adres e-mail.';
    case 'auth/account-exists-with-different-credential':
      return 'To konto jest już powiązane z inną metodą logowania (np. e-mail). Zaloguj się tą metodą.';
    default:
      return e.message || 'Nie udało się wykonać operacji.';
  }
}
