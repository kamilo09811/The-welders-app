#!/usr/bin/env node
/**
 * Generuje hosting/public/privacy/index.html z lib/privacy-policy.ts
 * (uruchamia się przez node --experimental-strip-types lub uproszczoną kopię).
 * Tu: treść wbudowana — trzymaj zsynchronizowaną z lib/privacy-policy.ts.
 */
const fs = require('fs');
const path = require('path');

const LEGAL = {
  appName: 'TheWeldersWorld',
  controllerName: 'TheWeldersWorld',
  contactEmail: 'privacy@theweldersworld.app',
  lastUpdatedPl: '30 sierpnia 2026',
  lastUpdatedEn: '30 August 2026',
};

const pl = [
  {
    title: '1. Administrator danych',
    paragraphs: [
      `Administratorem danych osobowych użytkowników aplikacji ${LEGAL.appName} („Aplikacja”) jest ${LEGAL.controllerName} („Administrator”).`,
      `Kontakt w sprawach prywatności: ${LEGAL.contactEmail}.`,
      `Niniejsza Polityka prywatności obowiązuje od ${LEGAL.lastUpdatedPl}.`,
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
      `Aby skorzystać z praw, napisz na ${LEGAL.contactEmail}. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO).`,
    ],
  },
  {
    title: '8. Usunięcie konta',
    paragraphs: [
      `Możesz poprosić o usunięcie konta, kontaktując się na ${LEGAL.contactEmail} (lub korzystając z funkcji w Aplikacji, gdy będzie dostępna). Usuniemy dane zgodnie z sekcją o okresie przechowywania.`,
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

const en = [
  {
    title: '1. Data controller',
    paragraphs: [
      `The controller of personal data for the ${LEGAL.appName} app (“App”) is ${LEGAL.controllerName} (“Controller”).`,
      `Privacy contact: ${LEGAL.contactEmail}.`,
      `This Privacy Policy is effective as of ${LEGAL.lastUpdatedEn}.`,
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
      `Contact ${LEGAL.contactEmail}. You may also lodge a complaint with your supervisory authority (in Poland: UODO).`,
    ],
  },
  {
    title: '8. Account deletion',
    paragraphs: [
      `Request account deletion via ${LEGAL.contactEmail} (or in-App controls when available). We will handle data as described in the retention section.`,
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

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function block(sections) {
  return sections
    .map(
      (s) =>
        `<section class="sec"><h2>${esc(s.title)}</h2>${s.paragraphs
          .map((p) => `<p>${esc(p)}</p>`)
          .join('')}</section>`
    )
    .join('\n');
}

const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Polityka prywatności — ${esc(LEGAL.appName)}</title>
  <meta name="description" content="Polityka prywatności aplikacji ${esc(LEGAL.appName)}" />
  <style>
    :root {
      --bg: #e8eef7;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --primary: #0e4aa4;
      --warn: #c2410c;
      --border: #d5deea;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background:
        radial-gradient(ellipse 80% 50% at 10% -10%, rgba(14,74,164,0.18), transparent),
        radial-gradient(ellipse 60% 40% at 100% 0%, rgba(194,65,12,0.12), transparent),
        var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    .wrap { max-width: 720px; margin: 0 auto; padding: 28px 18px 64px; }
    header {
      background: linear-gradient(135deg, #0a2f6b 0%, #0e4aa4 55%, #1d4ed8 100%);
      color: #fff;
      border-radius: 18px;
      padding: 28px 24px;
      margin-bottom: 22px;
    }
    header .brand { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; font-weight: 700; }
    header h1 { margin: 8px 0 6px; font-size: 1.75rem; letter-spacing: -0.02em; }
    header p { margin: 0; opacity: 0.9; font-size: 0.95rem; }
    nav { display: flex; gap: 10px; margin: 16px 0 8px; flex-wrap: wrap; }
    nav a {
      color: #fff; text-decoration: none; font-weight: 700; font-size: 13px;
      background: rgba(255,255,255,0.15); padding: 8px 12px; border-radius: 999px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 8px 20px 20px;
      margin-bottom: 18px;
    }
    .sec { padding: 14px 0; border-bottom: 1px solid var(--border); }
    .sec:last-child { border-bottom: 0; }
    h2 { font-size: 1.05rem; margin: 0 0 8px; color: var(--primary); }
    p { margin: 0 0 8px; color: var(--muted); font-size: 0.95rem; }
    p:last-child { margin-bottom: 0; }
    footer { margin-top: 8px; font-size: 13px; color: var(--muted); text-align: center; }
    a.mail { color: var(--primary); font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">${esc(LEGAL.appName)}</div>
      <h1>Polityka prywatności</h1>
      <p>Privacy Policy · aktualizacja: ${esc(LEGAL.lastUpdatedPl)}</p>
      <nav>
        <a href="#pl">Polski</a>
        <a href="#en">English</a>
      </nav>
    </header>

    <div class="card" id="pl" lang="pl">
      <h2 style="padding-top:12px;color:var(--warn);border:0;margin:0 0 4px;">Wersja polska</h2>
      ${block(pl)}
    </div>

    <div class="card" id="en" lang="en">
      <h2 style="padding-top:12px;color:var(--warn);border:0;margin:0 0 4px;">English version</h2>
      ${block(en)}
    </div>

    <footer>
      Kontakt: <a class="mail" href="mailto:${esc(LEGAL.contactEmail)}">${esc(LEGAL.contactEmail)}</a>
    </footer>
  </div>
</body>
</html>
`;

const outDir = path.join(__dirname, '..', 'hosting', 'public', 'privacy');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

const root = path.join(__dirname, '..', 'hosting', 'public', 'index.html');
fs.writeFileSync(
  root,
  `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/privacy/"/><title>${LEGAL.appName}</title></head><body><p><a href="/privacy/">Polityka prywatności</a></p></body></html>\n`,
  'utf8'
);

console.log('Wrote hosting/public/privacy/index.html');
