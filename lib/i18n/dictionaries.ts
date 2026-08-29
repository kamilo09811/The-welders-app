export type AppLocale = 'pl' | 'en' | 'de' | 'da';

export const APP_LOCALES: { value: AppLocale; label: string; nativeLabel: string }[] = [
  { value: 'pl', label: 'Polish', nativeLabel: 'Polski' },
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { value: 'da', label: 'Danish', nativeLabel: 'Dansk' },
];

export type TranslationKey =
  | 'tabs.market'
  | 'tabs.chats'
  | 'tabs.account'
  | 'tabs.settings'
  | 'common.save'
  | 'common.cancel'
  | 'common.loading'
  | 'common.search'
  | 'common.edit'
  | 'common.back'
  | 'common.error'
  | 'common.rateNegotiable'
  | 'common.rateGross'
  | 'common.rateNet'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.saved'
  | 'settings.loginRequired'
  | 'settings.section.location'
  | 'settings.section.market'
  | 'settings.section.notifications'
  | 'settings.section.appearance'
  | 'settings.section.language'
  | 'settings.baseCity'
  | 'settings.radius'
  | 'settings.defaultSort'
  | 'settings.preferredIntent'
  | 'settings.preferredModes'
  | 'settings.minRate'
  | 'settings.hideOwn'
  | 'settings.hideOwnSub'
  | 'settings.onlyVerified'
  | 'settings.onlyVerifiedSub'
  | 'settings.showGross'
  | 'settings.showGrossSub'
  | 'settings.notifJobs'
  | 'settings.notifJobsSub'
  | 'settings.notifApps'
  | 'settings.notifAppsSub'
  | 'settings.notifMsgs'
  | 'settings.notifMsgsSub'
  | 'settings.theme'
  | 'settings.themeLight'
  | 'settings.themeDark'
  | 'settings.languageHint'
  | 'settings.radiusPoland'
  | 'settings.sortNewest'
  | 'settings.sortRateDesc'
  | 'settings.sortRateAsc'
  | 'settings.intentAll'
  | 'settings.intentOffer'
  | 'settings.intentSeek'
  | 'market.titleWelder'
  | 'market.titleEmployer'
  | 'market.subtitle'
  | 'market.addListing'
  | 'market.searchPlaceholder'
  | 'market.filters'
  | 'market.results'
  | 'market.empty'
  | 'market.goToSettings'
  | 'market.quickJob'
  | 'market.applyCta'
  | 'market.detailsCta'
  | 'market.joinQuick'
  | 'market.awarded'
  | 'market.myListings'
  | 'chats.title'
  | 'chats.empty'
  | 'chats.search'
  | 'chats.unread'
  | 'chats.noneActive'
  | 'account.title'
  | 'account.profile'
  | 'account.shortcuts'
  | 'account.messages'
  | 'account.notifications'
  | 'account.publicProfile'
  | 'account.saveProfile'
  | 'account.companyName'
  | 'account.fullName'
  | 'account.phone'
  | 'account.city'
  | 'account.bio'
  | 'account.logout'
  | 'account.myApplications'
  | 'account.incomingApplications'
  | 'account.seeAll'
  | 'account.noSentApps'
  | 'account.noIncomingApps'
  | 'account.user'
  | 'account.hintEmployer'
  | 'account.hintWelder'
  | 'account.roleWelder'
  | 'account.roleEmployer'
  | 'status.new'
  | 'status.inProgress'
  | 'status.accepted'
  | 'status.rejected'
  | 'market.roleWelder'
  | 'market.roleEmployer'
  | 'market.hoursAgo'
  | 'market.justNow'
  | 'market.typeEmployment'
  | 'market.typeB2B'
  | 'market.typeContract'
  | 'listing.newTitle'
  | 'listing.chooserLead'
  | 'listing.standardTitle'
  | 'listing.standardSub'
  | 'listing.quickTitle'
  | 'listing.quickSub'
  | 'listing.publish'
  | 'listing.publisher'
  | 'listing.companyOnListing'
  | 'auth.login'
  | 'auth.register'
  | 'auth.logout';

type Dict = Record<TranslationKey, string>;

const pl: Dict = {
  'tabs.market': 'Rynek',
  'tabs.chats': 'Czaty',
  'tabs.account': 'Konto',
  'tabs.settings': 'Ustawienia',
  'common.save': 'Zapisz',
  'common.cancel': 'Anuluj',
  'common.loading': 'Ładowanie…',
  'common.search': 'Szukaj',
  'common.edit': 'Edytuj',
  'common.back': 'Wstecz',
  'common.error': 'Coś poszło nie tak',
  'common.rateNegotiable': 'Stawka do uzgodnienia',
  'common.rateGross': 'PLN/h brutto',
  'common.rateNet': 'PLN/h netto',
  'settings.title': 'Ustawienia',
  'settings.subtitle': 'Preferencje rynku, wygląd i język — działają w całej aplikacji.',
  'settings.saved': 'Ustawienia zapisane.',
  'settings.loginRequired': 'Zaloguj się, aby zapisać ustawienia.',
  'settings.section.location': 'Lokalizacja',
  'settings.section.market': 'Preferencje rynku',
  'settings.section.notifications': 'Powiadomienia',
  'settings.section.appearance': 'Wygląd',
  'settings.section.language': 'Język',
  'settings.baseCity': 'Miasto bazowe',
  'settings.radius': 'Promień wyszukiwania',
  'settings.defaultSort': 'Domyślne sortowanie',
  'settings.preferredIntent': 'Domyślna intencja',
  'settings.preferredModes': 'Preferowane tryby',
  'settings.minRate': 'Minimalna stawka (PLN/h)',
  'settings.hideOwn': 'Ukryj własne ogłoszenia',
  'settings.hideOwnSub': 'Nie pokazuj Twoich ofert na głównej liście rynku',
  'settings.onlyVerified': 'Tylko zweryfikowane konta',
  'settings.onlyVerifiedSub': 'Filtruj ogłoszenia autorów z potwierdzonym e-mailem',
  'settings.showGross': 'Pokazuj stawki brutto',
  'settings.showGrossSub': 'Etykieta brutto/netto przy stawkach na rynku',
  'settings.notifJobs': 'Nowe oferty w okolicy',
  'settings.notifJobsSub': 'Alerty o ogłoszeniach pasujących do lokalizacji',
  'settings.notifApps': 'Zgłoszenia i statusy',
  'settings.notifAppsSub': 'Nowe aplikacje i zmiany statusu',
  'settings.notifMsgs': 'Wiadomości czatu',
  'settings.notifMsgsSub': 'Powiadomienia o nowych wiadomościach',
  'settings.theme': 'Motyw',
  'settings.themeLight': 'Jasny',
  'settings.themeDark': 'Ciemny',
  'settings.languageHint': 'Zmiana języka odświeża etykiety w aplikacji.',
  'settings.radiusPoland': 'Cała Polska',
  'settings.sortNewest': 'Najnowsze',
  'settings.sortRateDesc': 'Stawka ↓',
  'settings.sortRateAsc': 'Stawka ↑',
  'settings.intentAll': 'Wszystkie',
  'settings.intentOffer': 'Oferuję',
  'settings.intentSeek': 'Poszukuję',
  'market.titleWelder': 'Oferty dla spawaczy',
  'market.titleEmployer': 'Zlecenia i kandydaci',
  'market.subtitle': 'Szukaj po tytule, mieście lub tagu — reszta filtrów w jednym miejscu.',
  'market.addListing': 'Dodaj ogłoszenie',
  'market.searchPlaceholder': 'Szukaj ofert…',
  'market.filters': 'Filtry',
  'market.results': 'wyników',
  'market.empty': 'Brak ogłoszeń dla wybranych filtrów.',
  'market.goToSettings': 'Ustawienia preferencji',
  'market.quickJob': 'Szybkie zlecenie',
  'market.applyCta': 'Zobacz i aplikuj →',
  'market.detailsCta': 'Zobacz szczegóły →',
  'market.joinQuick': 'Dołącz do mikrolicytacji →',
  'market.awarded': 'Rozstrzygnięte — zobacz →',
  'market.myListings': 'Moje ogłoszenia',
  'chats.title': 'Czaty',
  'chats.empty': 'Tu pojawią się Twoje rozmowy',
  'chats.search': 'Szukaj rozmów…',
  'chats.unread': 'nieprzeczytanych',
  'chats.noneActive': 'Brak aktywnych rozmów',
  'account.title': 'Konto',
  'account.profile': 'Profil',
  'account.shortcuts': 'Skróty',
  'account.messages': 'Wiadomości',
  'account.notifications': 'Centrum powiadomień',
  'account.publicProfile': 'Profil publiczny',
  'account.saveProfile': 'Zapisz profil',
  'account.companyName': 'Nazwa firmy',
  'account.fullName': 'Imię i nazwisko',
  'account.phone': 'Telefon',
  'account.city': 'Miasto',
  'account.bio': 'Krótki opis',
  'account.logout': 'Wyloguj',
  'account.myApplications': 'Moje zgłoszenia',
  'account.incomingApplications': 'Zgłoszenia do moich ogłoszeń',
  'account.seeAll': 'Wszystkie',
  'account.noSentApps': 'Nie wysłałeś jeszcze żadnego zgłoszenia.',
  'account.noIncomingApps': 'Brak zgłoszeń do Twoich ogłoszeń.',
  'account.user': 'Użytkownik',
  'account.hintEmployer': 'Nazwa firmy trafia automatycznie na Twoje ogłoszenia. Możesz ją zmienić tutaj.',
  'account.hintWelder': 'Imię i nazwisko trafia automatycznie na Twoje ogłoszenia.',
  'account.roleWelder': 'Spawacz',
  'account.roleEmployer': 'Pracodawca / zleceniodawca',
  'status.new': 'Nowe',
  'status.inProgress': 'W trakcie',
  'status.accepted': 'Zaakceptowane',
  'status.rejected': 'Odrzucone',
  'market.roleWelder': 'Konto spawacza',
  'market.roleEmployer': 'Konto pracodawcy',
  'market.hoursAgo': '{hours} h temu',
  'market.justNow': 'przed chwilą',
  'market.typeEmployment': 'Umowa o pracę',
  'market.typeB2B': 'B2B',
  'market.typeContract': 'Umowa zlecenie',
  'listing.newTitle': 'Nowe ogłoszenie',
  'listing.chooserLead': 'Co chcesz opublikować?',
  'listing.standardTitle': 'Ogłoszenie',
  'listing.standardSub': 'Klasyczne ogłoszenie o pracę / zlecenie — bez limitu zgłoszeń.',
  'listing.quickTitle': 'Szybkie zlecenie',
  'listing.quickSub': 'Mikrolicytacja: max 5 najszybszych. Idealne na bramę, awarię, tydzień na hali.',
  'listing.publish': 'Opublikuj ogłoszenie',
  'listing.publisher': 'Autor ogłoszenia',
  'listing.companyOnListing': 'Firma na ogłoszeniu',
  'auth.login': 'Zaloguj się',
  'auth.register': 'Zarejestruj się',
  'auth.logout': 'Wyloguj',
};

const en: Dict = {
  ...pl,
  'tabs.market': 'Market',
  'tabs.chats': 'Chats',
  'tabs.account': 'Account',
  'tabs.settings': 'Settings',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading…',
  'common.search': 'Search',
  'common.edit': 'Edit',
  'common.back': 'Back',
  'common.error': 'Something went wrong',
  'common.rateNegotiable': 'Rate negotiable',
  'common.rateGross': 'PLN/h gross',
  'common.rateNet': 'PLN/h net',
  'settings.title': 'Settings',
  'settings.subtitle': 'Market preferences, appearance and language — applied across the app.',
  'settings.saved': 'Settings saved.',
  'settings.loginRequired': 'Sign in to save settings.',
  'settings.section.location': 'Location',
  'settings.section.market': 'Market preferences',
  'settings.section.notifications': 'Notifications',
  'settings.section.appearance': 'Appearance',
  'settings.section.language': 'Language',
  'settings.baseCity': 'Base city',
  'settings.radius': 'Search radius',
  'settings.defaultSort': 'Default sort',
  'settings.preferredIntent': 'Default intent',
  'settings.preferredModes': 'Preferred modes',
  'settings.minRate': 'Minimum rate (PLN/h)',
  'settings.hideOwn': 'Hide own listings',
  'settings.hideOwnSub': 'Do not show your listings on the main market feed',
  'settings.onlyVerified': 'Verified accounts only',
  'settings.onlyVerifiedSub': 'Filter listings by authors with verified email',
  'settings.showGross': 'Show gross rates',
  'settings.showGrossSub': 'Gross/net label on market rates',
  'settings.notifJobs': 'Nearby new jobs',
  'settings.notifJobsSub': 'Alerts for listings matching your location',
  'settings.notifApps': 'Applications & status',
  'settings.notifAppsSub': 'New applications and status changes',
  'settings.notifMsgs': 'Chat messages',
  'settings.notifMsgsSub': 'Notifications for new chat messages',
  'settings.theme': 'Theme',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.languageHint': 'Language change updates labels across the app.',
  'settings.radiusPoland': 'All of Poland',
  'settings.sortNewest': 'Newest',
  'settings.sortRateDesc': 'Rate ↓',
  'settings.sortRateAsc': 'Rate ↑',
  'settings.intentAll': 'All',
  'settings.intentOffer': 'Offering',
  'settings.intentSeek': 'Looking for',
  'market.titleWelder': 'Jobs for welders',
  'market.titleEmployer': 'Jobs & candidates',
  'market.subtitle': 'Search by title, city or tag — more filters in one place.',
  'market.addListing': 'Add listing',
  'market.searchPlaceholder': 'Search listings…',
  'market.filters': 'Filters',
  'market.results': 'results',
  'market.empty': 'No listings for the selected filters.',
  'market.goToSettings': 'Preference settings',
  'market.quickJob': 'Quick job',
  'market.applyCta': 'View & apply →',
  'market.detailsCta': 'View details →',
  'market.joinQuick': 'Join micro-auction →',
  'market.awarded': 'Awarded — view →',
  'market.myListings': 'My listings',
  'chats.title': 'Chats',
  'chats.empty': 'Your conversations will appear here',
  'chats.search': 'Search chats…',
  'chats.unread': 'unread',
  'chats.noneActive': 'No active chats',
  'account.title': 'Account',
  'account.profile': 'Profile',
  'account.shortcuts': 'Shortcuts',
  'account.messages': 'Messages',
  'account.notifications': 'Notification center',
  'account.publicProfile': 'Public profile',
  'account.saveProfile': 'Save profile',
  'account.companyName': 'Company name',
  'account.fullName': 'Full name',
  'account.phone': 'Phone',
  'account.city': 'City',
  'account.bio': 'Short bio',
  'account.logout': 'Log out',
  'account.myApplications': 'My applications',
  'account.incomingApplications': 'Applications to my listings',
  'account.seeAll': 'See all',
  'account.noSentApps': 'You have not sent any applications yet.',
  'account.noIncomingApps': 'No applications to your listings yet.',
  'account.user': 'User',
  'account.hintEmployer': 'Your company name is used automatically on listings. You can change it here.',
  'account.hintWelder': 'Your full name is used automatically on your listings.',
  'account.roleWelder': 'Welder',
  'account.roleEmployer': 'Employer / client',
  'status.new': 'New',
  'status.inProgress': 'In progress',
  'status.accepted': 'Accepted',
  'status.rejected': 'Rejected',
  'market.roleWelder': 'Welder account',
  'market.roleEmployer': 'Employer account',
  'market.hoursAgo': '{hours} h ago',
  'market.justNow': 'just now',
  'market.typeEmployment': 'Employment contract',
  'market.typeB2B': 'B2B',
  'market.typeContract': 'Service contract',
  'listing.newTitle': 'New listing',
  'listing.chooserLead': 'What do you want to publish?',
  'listing.standardTitle': 'Listing',
  'listing.standardSub': 'Classic job / assignment listing — unlimited applications.',
  'listing.quickTitle': 'Quick job',
  'listing.quickSub': 'Micro-auction: max 5 fastest. Great for gates, emergencies, a week on site.',
  'listing.publish': 'Publish listing',
  'listing.publisher': 'Listing author',
  'listing.companyOnListing': 'Company on listing',
  'auth.login': 'Sign in',
  'auth.register': 'Sign up',
  'auth.logout': 'Sign out',
};

const de: Dict = {
  ...en,
  'tabs.market': 'Markt',
  'tabs.chats': 'Chats',
  'tabs.account': 'Konto',
  'tabs.settings': 'Einstellungen',
  'common.save': 'Speichern',
  'common.cancel': 'Abbrechen',
  'common.loading': 'Laden…',
  'common.search': 'Suchen',
  'common.edit': 'Bearbeiten',
  'common.back': 'Zurück',
  'common.error': 'Etwas ist schiefgelaufen',
  'common.rateNegotiable': 'Satz nach Vereinbarung',
  'common.rateGross': 'PLN/h brutto',
  'common.rateNet': 'PLN/h netto',
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'Marktpräferenzen, Erscheinungsbild und Sprache — gelten in der ganzen App.',
  'settings.saved': 'Einstellungen gespeichert.',
  'settings.loginRequired': 'Melden Sie sich an, um Einstellungen zu speichern.',
  'settings.section.location': 'Standort',
  'settings.section.market': 'Marktpräferenzen',
  'settings.section.notifications': 'Benachrichtigungen',
  'settings.section.appearance': 'Erscheinungsbild',
  'settings.section.language': 'Sprache',
  'settings.baseCity': 'Basisstadt',
  'settings.radius': 'Suchradius',
  'settings.defaultSort': 'Standardsortierung',
  'settings.preferredIntent': 'Standardabsicht',
  'settings.preferredModes': 'Bevorzugte Modi',
  'settings.minRate': 'Mindestsatz (PLN/h)',
  'settings.hideOwn': 'Eigene Anzeigen ausblenden',
  'settings.hideOwnSub': 'Ihre Anzeigen nicht in der Hauptliste zeigen',
  'settings.onlyVerified': 'Nur verifizierte Konten',
  'settings.onlyVerifiedSub': 'Nach Autoren mit bestätigter E-Mail filtern',
  'settings.showGross': 'Bruttosätze anzeigen',
  'settings.showGrossSub': 'Brutto/Netto-Label bei Marktsätzen',
  'settings.notifJobs': 'Neue Jobs in der Nähe',
  'settings.notifJobsSub': 'Alerts für passende Anzeigen',
  'settings.notifApps': 'Bewerbungen & Status',
  'settings.notifAppsSub': 'Neue Bewerbungen und Statusänderungen',
  'settings.notifMsgs': 'Chat-Nachrichten',
  'settings.notifMsgsSub': 'Benachrichtigungen über neue Nachrichten',
  'settings.theme': 'Design',
  'settings.themeLight': 'Hell',
  'settings.themeDark': 'Dunkel',
  'settings.languageHint': 'Die Sprache aktualisiert die Beschriftungen in der App.',
  'settings.radiusPoland': 'Ganz Polen',
  'settings.sortNewest': 'Neueste',
  'settings.sortRateDesc': 'Satz ↓',
  'settings.sortRateAsc': 'Satz ↑',
  'settings.intentAll': 'Alle',
  'settings.intentOffer': 'Biete an',
  'settings.intentSeek': 'Suche',
  'market.titleWelder': 'Angebote für Schweißer',
  'market.titleEmployer': 'Aufträge & Kandidaten',
  'market.subtitle': 'Suche nach Titel, Stadt oder Tag — weitere Filter an einem Ort.',
  'market.addListing': 'Anzeige hinzufügen',
  'market.searchPlaceholder': 'Anzeigen suchen…',
  'market.filters': 'Filter',
  'market.results': 'Ergebnisse',
  'market.empty': 'Keine Anzeigen für die gewählten Filter.',
  'market.goToSettings': 'Präferenzen',
  'market.quickJob': 'Schnellauftrag',
  'market.applyCta': 'Ansehen & bewerben →',
  'market.detailsCta': 'Details ansehen →',
  'market.joinQuick': 'Zur Mikroauktion →',
  'market.awarded': 'Verggeben — ansehen →',
  'market.myListings': 'Meine Anzeigen',
  'chats.title': 'Chats',
  'chats.empty': 'Ihre Gespräche erscheinen hier',
  'chats.search': 'Chats suchen…',
  'chats.unread': 'ungelesen',
  'chats.noneActive': 'Keine aktiven Chats',
  'account.title': 'Konto',
  'account.profile': 'Profil',
  'account.shortcuts': 'Kurzbefehle',
  'account.messages': 'Nachrichten',
  'account.notifications': 'Benachrichtigungszentrum',
  'account.publicProfile': 'Öffentliches Profil',
  'account.saveProfile': 'Profil speichern',
  'account.companyName': 'Firmenname',
  'account.fullName': 'Vollständiger Name',
  'account.phone': 'Telefon',
  'account.city': 'Stadt',
  'account.bio': 'Kurzbeschreibung',
  'account.logout': 'Abmelden',
  'account.myApplications': 'Meine Bewerbungen',
  'account.incomingApplications': 'Bewerbungen auf meine Anzeigen',
  'account.seeAll': 'Alle',
  'account.noSentApps': 'Du hast noch keine Bewerbung gesendet.',
  'account.noIncomingApps': 'Keine Bewerbungen auf deine Anzeigen.',
  'account.user': 'Benutzer',
  'account.hintEmployer': 'Der Firmenname erscheint automatisch auf deinen Anzeigen. Hier kannst du ihn ändern.',
  'account.hintWelder': 'Dein Name erscheint automatisch auf deinen Anzeigen.',
  'account.roleWelder': 'Schweißer',
  'account.roleEmployer': 'Arbeitgeber / Auftraggeber',
  'status.new': 'Neu',
  'status.inProgress': 'In Bearbeitung',
  'status.accepted': 'Angenommen',
  'status.rejected': 'Abgelehnt',
  'market.roleWelder': 'Schweißer-Konto',
  'market.roleEmployer': 'Arbeitgeber-Konto',
  'market.hoursAgo': 'vor {hours} Std.',
  'market.justNow': 'gerade eben',
  'market.typeEmployment': 'Arbeitsvertrag',
  'market.typeB2B': 'B2B',
  'market.typeContract': 'Werkvertrag',
  'listing.newTitle': 'Neue Anzeige',
  'listing.chooserLead': 'Was möchten Sie veröffentlichen?',
  'listing.standardTitle': 'Anzeige',
  'listing.standardSub': 'Klassische Stellen-/Auftragsanzeige — ohne Bewerbungslimit.',
  'listing.quickTitle': 'Schnellauftrag',
  'listing.quickSub': 'Mikroauktion: max. 5 Schnellste. Ideal für Tore, Notfälle, eine Woche vor Ort.',
  'listing.publish': 'Anzeige veröffentlichen',
  'listing.publisher': 'Anzeigenautor',
  'listing.companyOnListing': 'Firma auf der Anzeige',
  'auth.login': 'Anmelden',
  'auth.register': 'Registrieren',
  'auth.logout': 'Abmelden',
};

const da: Dict = {
  ...en,
  'tabs.market': 'Marked',
  'tabs.chats': 'Chats',
  'tabs.account': 'Konto',
  'tabs.settings': 'Indstillinger',
  'common.save': 'Gem',
  'common.cancel': 'Annuller',
  'common.loading': 'Indlæser…',
  'common.search': 'Søg',
  'common.edit': 'Rediger',
  'common.back': 'Tilbage',
  'common.error': 'Noget gik galt',
  'common.rateNegotiable': 'Pris efter aftale',
  'common.rateGross': 'PLN/t brutto',
  'common.rateNet': 'PLN/t netto',
  'settings.title': 'Indstillinger',
  'settings.subtitle': 'Markedspræferencer, udseende og sprog — gælder i hele appen.',
  'settings.saved': 'Indstillinger gemt.',
  'settings.loginRequired': 'Log ind for at gemme indstillinger.',
  'settings.section.location': 'Placering',
  'settings.section.market': 'Markedspræferencer',
  'settings.section.notifications': 'Notifikationer',
  'settings.section.appearance': 'Udseende',
  'settings.section.language': 'Sprog',
  'settings.baseCity': 'Basisby',
  'settings.radius': 'Søgeradius',
  'settings.defaultSort': 'Standardsortering',
  'settings.preferredIntent': 'Standardhensigt',
  'settings.preferredModes': 'Foretrukne tilstande',
  'settings.minRate': 'Mindste sats (PLN/t)',
  'settings.hideOwn': 'Skjul egne opslag',
  'settings.hideOwnSub': 'Vis ikke dine opslag på hovedlisten',
  'settings.onlyVerified': 'Kun verificerede konti',
  'settings.onlyVerifiedSub': 'Filtrer efter forfattere med bekræftet e-mail',
  'settings.showGross': 'Vis bruttosatser',
  'settings.showGrossSub': 'Brutto/netto-etiket ved markedssatser',
  'settings.notifJobs': 'Nye jobs i nærheden',
  'settings.notifJobsSub': 'Alarmer for matchende opslag',
  'settings.notifApps': 'Ansøgninger & status',
  'settings.notifAppsSub': 'Nye ansøgninger og statusændringer',
  'settings.notifMsgs': 'Chatbeskeder',
  'settings.notifMsgsSub': 'Notifikationer om nye beskeder',
  'settings.theme': 'Tema',
  'settings.themeLight': 'Lyst',
  'settings.themeDark': 'Mørkt',
  'settings.languageHint': 'Sprogskift opdaterer etiketter i appen.',
  'settings.radiusPoland': 'Hele Polen',
  'settings.sortNewest': 'Nyeste',
  'settings.sortRateDesc': 'Sats ↓',
  'settings.sortRateAsc': 'Sats ↑',
  'settings.intentAll': 'Alle',
  'settings.intentOffer': 'Tilbyder',
  'settings.intentSeek': 'Søger',
  'market.titleWelder': 'Jobs til svejsere',
  'market.titleEmployer': 'Opgaver & kandidater',
  'market.subtitle': 'Søg efter titel, by eller tag — flere filtre samlet.',
  'market.addListing': 'Tilføj opslag',
  'market.searchPlaceholder': 'Søg opslag…',
  'market.filters': 'Filtre',
  'market.results': 'resultater',
  'market.empty': 'Ingen opslag for valgte filtre.',
  'market.goToSettings': 'Præferenceindstillinger',
  'market.quickJob': 'Hurtig opgave',
  'market.applyCta': 'Se & ansøg →',
  'market.detailsCta': 'Se detaljer →',
  'market.joinQuick': 'Deltag i mikroauktion →',
  'market.awarded': 'Tildelt — se →',
  'market.myListings': 'Mine opslag',
  'chats.title': 'Chats',
  'chats.empty': 'Dine samtaler vises her',
  'chats.search': 'Søg chats…',
  'chats.unread': 'ulæste',
  'chats.noneActive': 'Ingen aktive chats',
  'account.title': 'Konto',
  'account.profile': 'Profil',
  'account.shortcuts': 'Genveje',
  'account.messages': 'Beskeder',
  'account.notifications': 'Notifikationscenter',
  'account.publicProfile': 'Offentlig profil',
  'account.saveProfile': 'Gem profil',
  'account.companyName': 'Firmanavn',
  'account.fullName': 'Fulde navn',
  'account.phone': 'Telefon',
  'account.city': 'By',
  'account.bio': 'Kort beskrivelse',
  'account.logout': 'Log ud',
  'account.myApplications': 'Mine ansøgninger',
  'account.incomingApplications': 'Ansøgninger til mine opslag',
  'account.seeAll': 'Alle',
  'account.noSentApps': 'Du har ikke sendt nogen ansøgninger endnu.',
  'account.noIncomingApps': 'Ingen ansøgninger til dine opslag.',
  'account.user': 'Bruger',
  'account.hintEmployer': 'Firmanavnet bruges automatisk på dine opslag. Du kan ændre det her.',
  'account.hintWelder': 'Dit fulde navn bruges automatisk på dine opslag.',
  'account.roleWelder': 'Svejser',
  'account.roleEmployer': 'Arbejdsgiver / opdragsgiver',
  'status.new': 'Ny',
  'status.inProgress': 'I gang',
  'status.accepted': 'Accepteret',
  'status.rejected': 'Afvist',
  'market.roleWelder': 'Svejserkonto',
  'market.roleEmployer': 'Arbejdsgiverkonto',
  'market.hoursAgo': 'for {hours} t. siden',
  'market.justNow': 'lige nu',
  'market.typeEmployment': 'Ansættelseskontrakt',
  'market.typeB2B': 'B2B',
  'market.typeContract': 'Servicekontrakt',
  'listing.newTitle': 'Nyt opslag',
  'listing.chooserLead': 'Hvad vil du offentliggøre?',
  'listing.standardTitle': 'Opslag',
  'listing.standardSub': 'Klassisk job-/opgaveopslag — uden ansøgningsloft.',
  'listing.quickTitle': 'Hurtig opgave',
  'listing.quickSub': 'Mikroauktion: max 5 hurtigste. Ideelt til porte, akutte sager, en uge på stedet.',
  'listing.publish': 'Offentliggør opslag',
  'listing.publisher': 'Opslagsforfatter',
  'listing.companyOnListing': 'Firma på opslaget',
  'auth.login': 'Log ind',
  'auth.register': 'Opret konto',
  'auth.logout': 'Log ud',
};

export const DICTIONARIES: Record<AppLocale, Dict> = { pl, en, de, da };

export function translate(locale: AppLocale, key: TranslationKey): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.pl[key] ?? key;
}
