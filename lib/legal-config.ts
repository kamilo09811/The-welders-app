/**
 * Dane prawne / URL polityki — zaktualizuj przed publikacją u klienta
 * (nazwa administratora, e-mail, NIP jeśli dotyczy).
 */
export const LEGAL_CONFIG = {
  appName: 'TheWeldersWorld',
  /** Administrator danych — docelowo pełna nazwa firmy klienta. */
  controllerName: 'TheWeldersWorld',
  contactEmail: 'privacy@theweldersworld.app',
  /**
   * Publiczny URL po: firebase deploy --only hosting
   * App Store Connect → Privacy Policy URL
   */
  privacyPolicyUrl: 'https://theweldersworld-92857.web.app/privacy',
  lastUpdatedIso: '2026-08-30',
  lastUpdatedPl: '30 sierpnia 2026',
  lastUpdatedEn: '30 August 2026',
} as const;
