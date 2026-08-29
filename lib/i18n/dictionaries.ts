export type AppLocale = 'pl' | 'en' | 'de' | 'da';

export const APP_LOCALES: { value: AppLocale; label: string; nativeLabel: string; flag: string }[] = [
  { value: 'pl', label: 'Polish', nativeLabel: 'Polski', flag: '🇵🇱' },
  { value: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { value: 'da', label: 'Danish', nativeLabel: 'Dansk', flag: '🇩🇰' },
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
  | 'welcome.title'
  | 'welcome.subtitle'
  | 'welcome.forWelders'
  | 'welcome.forWeldersText'
  | 'welcome.forCompanies'
  | 'welcome.forCompaniesText'
  | 'welcome.forPrivate'
  | 'welcome.forPrivateText'
  | 'welcome.chooseAccount'
  | 'welcome.imWelder'
  | 'welcome.imWelderSub'
  | 'welcome.imEmployer'
  | 'welcome.imEmployerSub'
  | 'welcome.noAccount'
  | 'welcome.register'
  | 'auth.loginTitle'
  | 'auth.registerTitle'
  | 'auth.forgotTitle'
  | 'auth.email'
  | 'auth.password'
  | 'auth.confirmPassword'
  | 'auth.forgotPassword'
  | 'auth.or'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.loginHint'
  | 'auth.loginHintWelder'
  | 'auth.loginHintEmployer'
  | 'auth.registerHint'
  | 'auth.registerHintWelder'
  | 'auth.registerHintEmployer'
  | 'auth.fillEmailPassword'
  | 'auth.fillAll'
  | 'auth.passwordsMismatch'
  | 'auth.passwordMin'
  | 'auth.enterEmail'
  | 'auth.resetSent'
  | 'auth.sendReset'
  | 'auth.backToLogin'
  | 'listing.basics'
  | 'listing.details'
  | 'listing.titleField'
  | 'listing.descriptionField'
  | 'listing.locationField'
  | 'listing.duration'
  | 'listing.budgetOptional'
  | 'listing.workMode'
  | 'listing.intentType'
  | 'listing.collabType'
  | 'listing.rateFrom'
  | 'listing.rateTo'
  | 'listing.tags'
  | 'listing.mode'
  | 'listing.publishing'
  | 'listing.publishQuick'
  | 'listing.missingCompany'
  | 'listing.missingName'
  | 'listing.editInAccount'
  | 'listing.publisherHint'
  | 'listing.quickBanner'
  | 'listing.fillRequired'
  | 'listing.saveFailed'
  | 'listing.needCompany'
  | 'listing.needName'
  | 'listing.roleEmployer'
  | 'listing.roleWelder'
  | 'listing.intentOfferJob'
  | 'listing.intentSeekWelder'
  | 'listing.intentOfferService'
  | 'listing.intentSeekJob'
  | 'chats.writeFirst'
  | 'chats.user'
  | 'chats.muteTitle'
  | 'chats.unmuteTitle'
  | 'chats.mute'
  | 'chats.unmute'
  | 'chats.loadingChats'
  | 'chats.noneFound'
  | 'chats.noneFoundSub'
  | 'chats.emptySub'
  | 'chats.conversation'
  | 'chats.conversations'
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
  'welcome.title': 'Rynek pracy dla spawaczy',
  'welcome.subtitle': 'Miejsce, w którym spawacze znajdują dobre zlecenia, a pracodawcy sprawdzonych specjalistów.',
  'welcome.forWelders': 'Dla spawaczy',
  'welcome.forWeldersText': 'Przeglądaj oferty z jasną stawką, lokalizacją i trybem pracy dopasowanym do Ciebie.',
  'welcome.forCompanies': 'Dla firm',
  'welcome.forCompaniesText': 'Dodawaj zlecenia, filtruj kandydatów i buduj stały zespół spawalniczy.',
  'welcome.forPrivate': 'Dla osób prywatnych',
  'welcome.forPrivateText': 'Szukasz kogoś do bramy, ogrodzenia albo naprawy konstrukcji? Dodaj proste ogłoszenie.',
  'welcome.chooseAccount': 'Wybierz typ konta i przejdź do logowania',
  'welcome.imWelder': 'Jestem spawaczem',
  'welcome.imWelderSub': 'Chcę przeglądać oferty i aplikować',
  'welcome.imEmployer': 'Szukam spawaczy / zleceniodawca',
  'welcome.imEmployerSub': 'Chcę dodawać ogłoszenia i kontaktować się',
  'welcome.noAccount': 'Nie masz jeszcze konta?',
  'welcome.register': 'Zarejestruj się',
  'auth.loginTitle': 'Logowanie',
  'auth.registerTitle': 'Rejestracja',
  'auth.forgotTitle': 'Reset hasła',
  'auth.email': 'E-mail',
  'auth.password': 'Hasło',
  'auth.confirmPassword': 'Powtórz hasło',
  'auth.forgotPassword': 'Zapomniałeś hasła?',
  'auth.or': 'lub',
  'auth.noAccount': 'Nie masz konta?',
  'auth.hasAccount': 'Masz już konto?',
  'auth.loginHint': 'Zaloguj się do konta',
  'auth.loginHintWelder': 'Konto spawacza',
  'auth.loginHintEmployer': 'Konto pracodawcy / zleceniodawcy',
  'auth.registerHint': 'Załóż konto',
  'auth.registerHintWelder': 'Rejestracja — konto spawacza',
  'auth.registerHintEmployer': 'Rejestracja — firma / zlecenia',
  'auth.fillEmailPassword': 'Podaj e-mail i hasło.',
  'auth.fillAll': 'Wypełnij wszystkie pola.',
  'auth.passwordsMismatch': 'Hasła muszą być takie same.',
  'auth.passwordMin': 'Hasło musi mieć co najmniej {n} znaków.',
  'auth.enterEmail': 'Podaj adres e-mail.',
  'auth.resetSent': 'Jeśli konto istnieje, wysłaliśmy link do resetu hasła.',
  'auth.sendReset': 'Wyślij link resetujący',
  'auth.backToLogin': 'Wróć do logowania',
  'listing.basics': 'Podstawy',
  'listing.details': 'Szczegóły',
  'listing.titleField': 'Tytuł *',
  'listing.descriptionField': 'Opis *',
  'listing.locationField': 'Lokalizacja *',
  'listing.duration': 'Czas trwania',
  'listing.budgetOptional': 'Budżet / stawka (PLN, opcjonalnie)',
  'listing.workMode': 'Tryb pracy',
  'listing.intentType': 'Typ ogłoszenia',
  'listing.collabType': 'Typ współpracy',
  'listing.rateFrom': 'Stawka od (opcjonalnie)',
  'listing.rateTo': 'Stawka do (opcjonalnie)',
  'listing.tags': 'Tagi (opcjonalnie)',
  'listing.mode': 'Tryb',
  'listing.publishing': 'Publikowanie…',
  'listing.publishQuick': 'Opublikuj szybkie zlecenie',
  'listing.missingCompany': 'Brak nazwy firmy',
  'listing.missingName': 'Brak imienia i nazwiska',
  'listing.editInAccount': 'Edytuj',
  'listing.publisherHint': 'Zmień w Koncie — tu podstawiamy automatycznie.',
  'listing.quickBanner': 'Szybkie zlecenie · pierwsze 5 osób zajmuje miejsca · Ty wybierasz zwycięzcę',
  'listing.fillRequired': 'Uzupełnij poprawnie wszystkie wymagane pola.',
  'listing.saveFailed': 'Nie udało się zapisać ogłoszenia. Spróbuj ponownie.',
  'listing.needCompany': 'Uzupełnij nazwę firmy w Koncie — pojawia się na ogłoszeniu.',
  'listing.needName': 'Uzupełnij imię i nazwisko w Koncie — pojawia się na ogłoszeniu.',
  'listing.roleEmployer': 'Konto pracodawcy',
  'listing.roleWelder': 'Konto spawacza',
  'listing.intentOfferJob': 'Oferuję zlecenie',
  'listing.intentSeekWelder': 'Poszukuję spawacza',
  'listing.intentOfferService': 'Oferuję usługi',
  'listing.intentSeekJob': 'Poszukuję pracy',
  'chats.writeFirst': 'Napisz pierwszą wiadomość…',
  'chats.user': 'Użytkownik',
  'chats.muteTitle': 'Wyciszyć wątek? Nie zobaczysz czerwonego badge przy nowych wiadomościach z tej rozmowy.',
  'chats.unmuteTitle': 'Odciszyć ten wątek? Znowu będziesz widzieć licznik nieprzeczytanych.',
  'chats.mute': 'Wycisz',
  'chats.unmute': 'Odcisz',
  'chats.loadingChats': 'Ładowanie rozmów',
  'chats.noneFound': 'Nic nie znaleziono',
  'chats.noneFoundSub': 'Spróbuj innej frazy albo wyczyść wyszukiwanie.',
  'chats.emptySub': 'Otwórz ogłoszenie na Rynku i napisz do drugiej strony — wątek wpadnie na tę listę.',
  'chats.conversation': 'rozmowa',
  'chats.conversations': 'rozmów',
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
  'welcome.title': 'Job market for welders',
  'welcome.subtitle': 'Where welders find good jobs and employers find trusted specialists.',
  'welcome.forWelders': 'For welders',
  'welcome.forWeldersText': 'Browse listings with clear rates, location and work mode that fit you.',
  'welcome.forCompanies': 'For companies',
  'welcome.forCompaniesText': 'Post jobs, filter candidates and build a reliable welding team.',
  'welcome.forPrivate': 'For private clients',
  'welcome.forPrivateText': 'Need someone for a gate, fence or structure repair? Post a simple listing.',
  'welcome.chooseAccount': 'Choose an account type to sign in',
  'welcome.imWelder': 'I am a welder',
  'welcome.imWelderSub': 'I want to browse jobs and apply',
  'welcome.imEmployer': 'I need welders / hire',
  'welcome.imEmployerSub': 'I want to post listings and get in touch',
  'welcome.noAccount': 'Don\'t have an account yet?',
  'welcome.register': 'Sign up',
  'auth.loginTitle': 'Sign in',
  'auth.registerTitle': 'Sign up',
  'auth.forgotTitle': 'Reset password',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm password',
  'auth.forgotPassword': 'Forgot password?',
  'auth.or': 'or',
  'auth.noAccount': 'Don\'t have an account?',
  'auth.hasAccount': 'Already have an account?',
  'auth.loginHint': 'Sign in to your account',
  'auth.loginHintWelder': 'Welder account',
  'auth.loginHintEmployer': 'Employer / client account',
  'auth.registerHint': 'Create an account',
  'auth.registerHintWelder': 'Sign up — welder account',
  'auth.registerHintEmployer': 'Sign up — company / jobs',
  'auth.fillEmailPassword': 'Enter email and password.',
  'auth.fillAll': 'Fill in all fields.',
  'auth.passwordsMismatch': 'Passwords must match.',
  'auth.passwordMin': 'Password must be at least {n} characters.',
  'auth.enterEmail': 'Enter your email address.',
  'auth.resetSent': 'If an account exists, we sent a password reset link.',
  'auth.sendReset': 'Send reset link',
  'auth.backToLogin': 'Back to sign in',
  'listing.basics': 'Basics',
  'listing.details': 'Details',
  'listing.titleField': 'Title *',
  'listing.descriptionField': 'Description *',
  'listing.locationField': 'Location *',
  'listing.duration': 'Duration',
  'listing.budgetOptional': 'Budget / rate (PLN, optional)',
  'listing.workMode': 'Work mode',
  'listing.intentType': 'Listing intent',
  'listing.collabType': 'Contract type',
  'listing.rateFrom': 'Rate from (optional)',
  'listing.rateTo': 'Rate to (optional)',
  'listing.tags': 'Tags (optional)',
  'listing.mode': 'Mode',
  'listing.publishing': 'Publishing…',
  'listing.publishQuick': 'Publish quick job',
  'listing.missingCompany': 'Company name missing',
  'listing.missingName': 'Full name missing',
  'listing.editInAccount': 'Edit',
  'listing.publisherHint': 'Change it in Account — we fill it here automatically.',
  'listing.quickBanner': 'Quick job · first 5 people take seats · you pick the winner',
  'listing.fillRequired': 'Please fill in all required fields correctly.',
  'listing.saveFailed': 'Could not save the listing. Try again.',
  'listing.needCompany': 'Add a company name in Account — it appears on the listing.',
  'listing.needName': 'Add your full name in Account — it appears on the listing.',
  'listing.roleEmployer': 'Employer account',
  'listing.roleWelder': 'Welder account',
  'listing.intentOfferJob': 'Offering a job',
  'listing.intentSeekWelder': 'Looking for a welder',
  'listing.intentOfferService': 'Offering services',
  'listing.intentSeekJob': 'Looking for work',
  'chats.writeFirst': 'Write the first message…',
  'chats.user': 'User',
  'chats.muteTitle': 'Mute this thread? You will not see the red badge for new messages.',
  'chats.unmuteTitle': 'Unmute this thread? You will see the unread counter again.',
  'chats.mute': 'Mute',
  'chats.unmute': 'Unmute',
  'chats.loadingChats': 'Loading chats',
  'chats.noneFound': 'Nothing found',
  'chats.noneFoundSub': 'Try another phrase or clear the search.',
  'chats.emptySub': 'Open a listing on Market and message the other side — the thread will appear here.',
  'chats.conversation': 'conversation',
  'chats.conversations': 'conversations',
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
  'welcome.title': 'Arbeitsmarkt für Schweißer',
  'welcome.subtitle': 'Hier finden Schweißer gute Aufträge und Arbeitgeber geprüfte Fachkräfte.',
  'welcome.forWelders': 'Für Schweißer',
  'welcome.forWeldersText': 'Durchsuche Anzeigen mit klarer Rate, Ort und Arbeitsmodus.',
  'welcome.forCompanies': 'Für Firmen',
  'welcome.forCompaniesText': 'Veröffentliche Aufträge, filtere Kandidaten und baue ein Team auf.',
  'welcome.forPrivate': 'Für Privatpersonen',
  'welcome.forPrivateText': 'Braucht ihr jemanden für Tor, Zaun oder Reparatur? Einfache Anzeige erstellen.',
  'welcome.chooseAccount': 'Kontotyp wählen und anmelden',
  'welcome.imWelder': 'Ich bin Schweißer',
  'welcome.imWelderSub': 'Ich möchte Angebote sehen und mich bewerben',
  'welcome.imEmployer': 'Ich suche Schweißer',
  'welcome.imEmployerSub': 'Ich möchte Anzeigen schalten und kontaktieren',
  'welcome.noAccount': 'Noch kein Konto?',
  'welcome.register': 'Registrieren',
  'auth.loginTitle': 'Anmelden',
  'auth.registerTitle': 'Registrieren',
  'auth.forgotTitle': 'Passwort zurücksetzen',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.confirmPassword': 'Passwort wiederholen',
  'auth.forgotPassword': 'Passwort vergessen?',
  'auth.or': 'oder',
  'auth.noAccount': 'Noch kein Konto?',
  'auth.hasAccount': 'Bereits ein Konto?',
  'auth.loginHint': 'Melde dich in deinem Konto an',
  'auth.loginHintWelder': 'Schweißer-Konto',
  'auth.loginHintEmployer': 'Arbeitgeber- / Auftraggeber-Konto',
  'auth.registerHint': 'Konto erstellen',
  'auth.registerHintWelder': 'Registrierung — Schweißer',
  'auth.registerHintEmployer': 'Registrierung — Firma / Aufträge',
  'auth.fillEmailPassword': 'E-Mail und Passwort eingeben.',
  'auth.fillAll': 'Bitte alle Felder ausfüllen.',
  'auth.passwordsMismatch': 'Passwörter müssen übereinstimmen.',
  'auth.passwordMin': 'Passwort muss mindestens {n} Zeichen haben.',
  'auth.enterEmail': 'E-Mail-Adresse eingeben.',
  'auth.resetSent': 'Falls ein Konto existiert, haben wir einen Reset-Link gesendet.',
  'auth.sendReset': 'Reset-Link senden',
  'auth.backToLogin': 'Zurück zur Anmeldung',
  'listing.basics': 'Grundlagen',
  'listing.details': 'Details',
  'listing.titleField': 'Titel *',
  'listing.descriptionField': 'Beschreibung *',
  'listing.locationField': 'Ort *',
  'listing.duration': 'Dauer',
  'listing.budgetOptional': 'Budget / Satz (PLN, optional)',
  'listing.workMode': 'Arbeitsmodus',
  'listing.intentType': 'Anzeigentyp',
  'listing.collabType': 'Vertragsart',
  'listing.rateFrom': 'Satz ab (optional)',
  'listing.rateTo': 'Satz bis (optional)',
  'listing.tags': 'Tags (optional)',
  'listing.mode': 'Modus',
  'listing.publishing': 'Veröffentlichen…',
  'listing.publishQuick': 'Schnellauftrag veröffentlichen',
  'listing.missingCompany': 'Firmenname fehlt',
  'listing.missingName': 'Name fehlt',
  'listing.editInAccount': 'Bearbeiten',
  'listing.publisherHint': 'Im Konto ändern — hier wird es automatisch übernommen.',
  'listing.quickBanner': 'Schnellauftrag · erste 5 Personen · du wählst den Gewinner',
  'listing.fillRequired': 'Bitte alle Pflichtfelder korrekt ausfüllen.',
  'listing.saveFailed': 'Anzeige konnte nicht gespeichert werden.',
  'listing.needCompany': 'Firmennamen im Konto ergänzen — erscheint auf der Anzeige.',
  'listing.needName': 'Namen im Konto ergänzen — erscheint auf der Anzeige.',
  'listing.roleEmployer': 'Arbeitgeber-Konto',
  'listing.roleWelder': 'Schweißer-Konto',
  'listing.intentOfferJob': 'Biete Auftrag',
  'listing.intentSeekWelder': 'Suche Schweißer',
  'listing.intentOfferService': 'Biete Leistungen',
  'listing.intentSeekJob': 'Suche Arbeit',
  'chats.writeFirst': 'Erste Nachricht schreiben…',
  'chats.user': 'Benutzer',
  'chats.muteTitle': 'Thread stummschalten? Kein rotes Badge bei neuen Nachrichten.',
  'chats.unmuteTitle': 'Stummschaltung aufheben? Ungelesen-Zähler wieder sichtbar.',
  'chats.mute': 'Stumm',
  'chats.unmute': 'Laut',
  'chats.loadingChats': 'Chats werden geladen',
  'chats.noneFound': 'Nichts gefunden',
  'chats.noneFoundSub': 'Andere Suche versuchen oder Filter löschen.',
  'chats.emptySub': 'Öffne eine Anzeige und schreibe — der Chat erscheint hier.',
  'chats.conversation': 'Gespräch',
  'chats.conversations': 'Gespräche',
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
  'welcome.title': 'Jobmarked for svejsere',
  'welcome.subtitle': 'Her finder svejsere gode opgaver, og arbejdsgivere finder betroede specialister.',
  'welcome.forWelders': 'Til svejsere',
  'welcome.forWeldersText': 'Se opslag med klar rate, lokation og arbejdsform, der passer dig.',
  'welcome.forCompanies': 'Til virksomheder',
  'welcome.forCompaniesText': 'Opret opgaver, filtrér kandidater og byg et svejseteam.',
  'welcome.forPrivate': 'Til private',
  'welcome.forPrivateText': 'Brug for hjælp til port, hegn eller reparation? Opret et simpelt opslag.',
  'welcome.chooseAccount': 'Vælg kontotype og log ind',
  'welcome.imWelder': 'Jeg er svejser',
  'welcome.imWelderSub': 'Jeg vil se jobs og søge',
  'welcome.imEmployer': 'Jeg søger svejsere',
  'welcome.imEmployerSub': 'Jeg vil oprette opslag og kontakte',
  'welcome.noAccount': 'Har du ikke en konto endnu?',
  'welcome.register': 'Opret konto',
  'auth.loginTitle': 'Log ind',
  'auth.registerTitle': 'Opret konto',
  'auth.forgotTitle': 'Nulstil adgangskode',
  'auth.email': 'E-mail',
  'auth.password': 'Adgangskode',
  'auth.confirmPassword': 'Gentag adgangskode',
  'auth.forgotPassword': 'Glemt adgangskode?',
  'auth.or': 'eller',
  'auth.noAccount': 'Har du ikke en konto?',
  'auth.hasAccount': 'Har du allerede en konto?',
  'auth.loginHint': 'Log ind på din konto',
  'auth.loginHintWelder': 'Svejserkonto',
  'auth.loginHintEmployer': 'Arbejdsgiver- / opdragsgivkonto',
  'auth.registerHint': 'Opret en konto',
  'auth.registerHintWelder': 'Registrering — svejser',
  'auth.registerHintEmployer': 'Registrering — firma / jobs',
  'auth.fillEmailPassword': 'Angiv e-mail og adgangskode.',
  'auth.fillAll': 'Udfyld alle felter.',
  'auth.passwordsMismatch': 'Adgangskoderne skal være ens.',
  'auth.passwordMin': 'Adgangskoden skal være mindst {n} tegn.',
  'auth.enterEmail': 'Angiv din e-mailadresse.',
  'auth.resetSent': 'Hvis kontoen findes, har vi sendt et nulstillingslink.',
  'auth.sendReset': 'Send nulstillingslink',
  'auth.backToLogin': 'Tilbage til login',
  'listing.basics': 'Grundlæggende',
  'listing.details': 'Detaljer',
  'listing.titleField': 'Titel *',
  'listing.descriptionField': 'Beskrivelse *',
  'listing.locationField': 'Lokation *',
  'listing.duration': 'Varighed',
  'listing.budgetOptional': 'Budget / rate (PLN, valgfrit)',
  'listing.workMode': 'Arbejdsform',
  'listing.intentType': 'Opslagstype',
  'listing.collabType': 'Kontrakttype',
  'listing.rateFrom': 'Rate fra (valgfrit)',
  'listing.rateTo': 'Rate til (valgfrit)',
  'listing.tags': 'Tags (valgfrit)',
  'listing.mode': 'Tilstand',
  'listing.publishing': 'Offentliggør…',
  'listing.publishQuick': 'Offentliggør hurtig opgave',
  'listing.missingCompany': 'Firmanavn mangler',
  'listing.missingName': 'Navn mangler',
  'listing.editInAccount': 'Rediger',
  'listing.publisherHint': 'Skift det under Konto — vi udfylder det automatisk her.',
  'listing.quickBanner': 'Hurtig opgave · de første 5 · du vælger vinderen',
  'listing.fillRequired': 'Udfyld alle obligatoriske felter korrekt.',
  'listing.saveFailed': 'Kunne ikke gemme opslaget. Prøv igen.',
  'listing.needCompany': 'Tilføj firmanavn under Konto — det vises på opslaget.',
  'listing.needName': 'Tilføj fulde navn under Konto — det vises på opslaget.',
  'listing.roleEmployer': 'Arbejdsgiverkonto',
  'listing.roleWelder': 'Svejserkonto',
  'listing.intentOfferJob': 'Tilbyder opgave',
  'listing.intentSeekWelder': 'Søger svejser',
  'listing.intentOfferService': 'Tilbyder ydelser',
  'listing.intentSeekJob': 'Søger arbejde',
  'chats.writeFirst': 'Skriv den første besked…',
  'chats.user': 'Bruger',
  'chats.muteTitle': 'Mute denne tråd? Du ser ikke det røde badge ved nye beskeder.',
  'chats.unmuteTitle': 'Fjern mute? Ulæst-tælleren kommer tilbage.',
  'chats.mute': 'Mute',
  'chats.unmute': 'Unmute',
  'chats.loadingChats': 'Indlæser chats',
  'chats.noneFound': 'Intet fundet',
  'chats.noneFoundSub': 'Prøv en anden søgning eller ryd feltet.',
  'chats.emptySub': 'Åbn et opslag på Markedet og skriv — tråden vises her.',
  'chats.conversation': 'samtale',
  'chats.conversations': 'samtaler',
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
