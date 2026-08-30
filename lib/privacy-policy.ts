import { LEGAL_CONFIG } from '@/lib/legal-config';

export type PrivacySection = {
  title: string;
  paragraphs: string[];
};

/** Treść polityki (PL) — ekran w aplikacji + źródło dla HTML. */
export function getPrivacySectionsPl(): PrivacySection[] {
  const { appName, controllerName, contactEmail, lastUpdatedPl } = LEGAL_CONFIG;
  return [
    {
      title: '1. Administrator danych',
      paragraphs: [
        `Administratorem danych osobowych użytkowników aplikacji ${appName} („Aplikacja”) jest ${controllerName} („Administrator”).`,
        `Kontakt w sprawach prywatności: ${contactEmail}.`,
        `Niniejsza Polityka prywatności obowiązuje od ${lastUpdatedPl}.`,
      ],
    },
    {
      title: '2. Jakie dane zbieramy',
      paragraphs: [
        'Konto: adres e-mail, hasło (przechowywane przez dostawcę uwierzytelniania w formie zabezpieczonej), imię / nazwa firmy, rola (spawacz / pracodawca), opcjonalnie miasto, bio, zdjęcie profilowe, numer telefonu (jeśli podasz).',
        'Logowanie Google: identyfikatory i podstawowe dane profilu udostępnione przez Google zgodnie z Twoją zgodą.',
        'Treści w Aplikacji: ogłoszenia, zgłoszenia do ofert, wiadomości czatu, opinie i oceny.',
        'Powiadomienia: token urządzenia (Expo Push Token) oraz preferencje powiadomień.',
        'Dane techniczne: identyfikatory sesji, logi błędów / diagnostyka w zakresie niezbędnym do działania i bezpieczeństwa (np. Firebase).',
        'Płatności (gdy włączone): informacje o zakupach w aplikacji (np. booster ogłoszenia) przetwarzane przez Apple / Google; Administrator nie przechowuje pełnych danych kart płatniczych.',
      ],
    },
    {
      title: '3. Cele i podstawy przetwarzania',
      paragraphs: [
        'Świadczenie usług marketplace (konto, ogłoszenia, zgłoszenia, czat, oceny) — wykonanie umowy / żądanie przed zawarciem umowy.',
        'Bezpieczeństwo, zapobieganie nadużyciom, weryfikacja e-mail — prawnie uzasadniony interes oraz obowiązki prawne w zakresie niezbędnym.',
        'Powiadomienia push — zgoda (możesz wyłączyć w ustawieniach systemu / Aplikacji).',
        'Ulepszanie Aplikacji i analityka techniczna w niezbędnym zakresie — prawnie uzasadniony interes.',
        'Rozliczenia zakupów cyfrowych (IAP) — wykonanie umowy oraz obowiązki rachunkowe / podatkowe.',
      ],
    },
    {
      title: '4. Odbiorcy i podmioty przetwarzające',
      paragraphs: [
        'Korzystamy z infrastruktury chmurowej, w szczególności Google Firebase (Authentication, Firestore, Storage, Cloud Functions, Hosting) oraz Expo (m.in. powiadomienia push).',
        'Przy logowaniu Google — Google Ireland Limited / Google LLC zgodnie z polityką Google.',
        'Przy zakupach w aplikacji — Apple i/lub Google jako operatorzy sklepów.',
        'Dane mogą być widoczne dla innych użytkowników w zakresie wynikającym z funkcji Aplikacji (np. profil publiczny, treść ogłoszenia, wiadomości w czacie).',
      ],
    },
    {
      title: '5. Przekazywanie poza EOG',
      paragraphs: [
        'Część dostawców może przetwarzać dane poza Europejskim Obszarem Gospodarczym. Stosowane są wówczas mechanizmy zgodne z RODO (m.in. standardowe klauzule umowne, decyzje o adekwatności), w zakresie zapewnianym przez tych dostawców.',
      ],
    },
    {
      title: '6. Okres przechowywania',
      paragraphs: [
        'Dane konta i treści — przez okres posiadania konta oraz przez czas niezbędny do rozliczeń, reklamacji i obowiązków prawnych.',
        'Po usunięciu konta usuwamy lub anonimizujemy dane, o ile nie musimy ich zachować dłużej na podstawie prawa lub w celu dochodzenia roszczeń.',
        'Tokeny push — do czasu wylogowania, wyłączenia powiadomień lub usunięcia konta.',
      ],
    },
    {
      title: '7. Twoje prawa (RODO)',
      paragraphs: [
        'Masz prawo dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, sprzeciwu oraz cofnięcia zgody (gdy przetwarzanie opiera się na zgodzie).',
        `Aby skorzystać z praw, napisz na ${contactEmail}. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO).`,
      ],
    },
    {
      title: '8. Usunięcie konta',
      paragraphs: [
        `Możesz poprosić o usunięcie konta, kontaktując się na ${contactEmail} (lub korzystając z funkcji w Aplikacji, gdy będzie dostępna). Usuniemy dane zgodnie z sekcją o okresie przechowywania.`,
      ],
    },
    {
      title: '9. Bezpieczeństwo',
      paragraphs: [
        'Stosujemy środki techniczne i organizacyjne odpowiednie do ryzyka (m.in. szyfrowanie połączeń HTTPS, kontrola dostępu, reguły bezpieczeństwa bazy). Żaden system nie gwarantuje pełnego bezpieczeństwa — zgłaszaj podejrzane działania na adres kontaktowy.',
      ],
    },
    {
      title: '10. Dzieci',
      paragraphs: [
        'Aplikacja jest przeznaczona dla osób pełnoletnich (18+). Nie świadczymy świadomie usług dzieciom.',
      ],
    },
    {
      title: '11. Zmiany polityki',
      paragraphs: [
        'Możemy aktualizować niniejszą Politykę. Nowa wersja będzie publikowana pod tym samym adresem URL oraz w Aplikacji z datą aktualizacji. Istotne zmiany możemy dodatkowo zakomunikować w Aplikacji.',
      ],
    },
  ];
}

export function getPrivacySectionsEn(): PrivacySection[] {
  const { appName, controllerName, contactEmail, lastUpdatedEn } = LEGAL_CONFIG;
  return [
    {
      title: '1. Data controller',
      paragraphs: [
        `The controller of personal data for the ${appName} app (“App”) is ${controllerName} (“Controller”).`,
        `Privacy contact: ${contactEmail}.`,
        `This Privacy Policy is effective as of ${lastUpdatedEn}.`,
      ],
    },
    {
      title: '2. Data we collect',
      paragraphs: [
        'Account: email, password (stored securely by the auth provider), name / company name, role (welder / employer), optional city, bio, profile photo, phone number (if provided).',
        'Google Sign-In: identifiers and basic profile data shared by Google with your consent.',
        'App content: listings, applications, chat messages, reviews and ratings.',
        'Notifications: device push token (Expo Push Token) and notification preferences.',
        'Technical data: session identifiers and diagnostics needed for operation and security (e.g. Firebase).',
        'Payments (when enabled): in-app purchase records processed by Apple / Google; we do not store full payment card details.',
      ],
    },
    {
      title: '3. Purposes and legal bases',
      paragraphs: [
        'Providing marketplace services (account, listings, applications, chat, ratings) — performance of a contract.',
        'Security, abuse prevention, email verification — legitimate interests and legal obligations where applicable.',
        'Push notifications — consent (you can disable them in system / App settings).',
        'Improving the App and necessary technical analytics — legitimate interests.',
        'Digital purchase settlement (IAP) — contract performance and accounting/tax duties.',
      ],
    },
    {
      title: '4. Recipients and processors',
      paragraphs: [
        'We use cloud providers, in particular Google Firebase (Authentication, Firestore, Storage, Cloud Functions, Hosting) and Expo (including push notifications).',
        'Google Sign-In involves Google as described in Google’s policies.',
        'In-app purchases involve Apple and/or Google as store operators.',
        'Other users may see data that is inherent to App features (e.g. public profile, listing content, chat messages).',
      ],
    },
    {
      title: '5. Transfers outside the EEA',
      paragraphs: [
        'Some providers may process data outside the European Economic Area. Where required, GDPR transfer mechanisms are used (e.g. SCCs, adequacy decisions) as provided by those vendors.',
      ],
    },
    {
      title: '6. Retention',
      paragraphs: [
        'Account and content data — for as long as you keep an account and as needed for complaints, disputes and legal duties.',
        'After account deletion we delete or anonymise data unless longer retention is required by law or for claims.',
        'Push tokens — until logout, disabling notifications, or account deletion.',
      ],
    },
    {
      title: '7. Your rights (GDPR)',
      paragraphs: [
        'You may request access, rectification, erasure, restriction, portability, objection, and withdrawal of consent where processing is based on consent.',
        `Contact ${contactEmail}. You may also lodge a complaint with your supervisory authority (in Poland: UODO).`,
      ],
    },
    {
      title: '8. Account deletion',
      paragraphs: [
        `Request account deletion via ${contactEmail} (or in-App controls when available). We will handle data as described in the retention section.`,
      ],
    },
    {
      title: '9. Security',
      paragraphs: [
        'We apply appropriate technical and organisational measures (including HTTPS, access control, database security rules). No system is perfectly secure — report suspicious activity to the contact email.',
      ],
    },
    {
      title: '10. Children',
      paragraphs: [
        'The App is intended for adults (18+). We do not knowingly provide services to children.',
      ],
    },
    {
      title: '11. Changes',
      paragraphs: [
        'We may update this Policy. The new version will be published at the same URL and in the App with an updated date. Material changes may also be announced in the App.',
      ],
    },
  ];
}
