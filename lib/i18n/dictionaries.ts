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
  | 'welcome.language'
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
  | 'auth.firebaseMissing'
  | 'auth.passwordMinPlaceholder'
  | 'auth.confirmPasswordPlaceholder'
  | 'auth.companyPlaceholder'
  | 'auth.namePlaceholder'
  | 'auth.continueGoogle'
  | 'auth.googleNeedsBuild'
  | 'auth.googleNeedsBuildTitle'
  | 'auth.googleNeedsBuildBody'
  | 'auth.googleMissingClient'
  | 'auth.googleMissingTitle'
  | 'auth.googleMissingBody'
  | 'settings.notifDevice'
  | 'settings.notifDeviceSub'
  | 'settings.notifDeviceGranted'
  | 'settings.notifDeviceDenied'
  | 'settings.notifDeviceUnavailable'
  | 'settings.notifEnable'
  | 'settings.notifEnableBusy'
  | 'settings.notifEnableOk'
  | 'settings.notifEnableFail'
  | 'auth.err.generic'
  | 'auth.err.invalidEmail'
  | 'auth.err.userDisabled'
  | 'auth.err.userNotFound'
  | 'auth.err.wrongPassword'
  | 'auth.err.invalidCredential'
  | 'auth.err.emailInUse'
  | 'auth.err.weakPassword'
  | 'auth.err.tooManyRequests'
  | 'auth.err.network'
  | 'auth.err.notAllowed'
  | 'auth.err.missingEmail'
  | 'auth.err.differentCredential'
  | 'auth.err.default'
  | 'chats.aboutListing'
  | 'chats.sendFailed'
  | 'chats.imageSendFailed'
  | 'chats.attachment'
  | 'chats.pickSource'
  | 'chats.gallery'
  | 'chats.camera'
  | 'chats.noGalleryAccess'
  | 'chats.noCameraAccess'
  | 'chats.loadingMessages'
  | 'chats.olderMessages'
  | 'chats.scrollForHistory'
  | 'chats.startConversation'
  | 'chats.startHint'
  | 'chats.writeMessage'
  | 'chats.uploadingImage'
  | 'chats.addAttachment'
  | 'chats.youPrefix'
  | 'auth.login'
  | 'auth.register'
  | 'mode.hall'
  | 'mode.hybrid'
  | 'mode.mobile'
  | 'intent.offer'
  | 'intent.seek'
  | 'market.allFilter'
  | 'market.minRateStrip'
  | 'market.clearFilters'
  | 'market.applyFilters'
  | 'market.filterLocation'
  | 'market.filterLocationPh'
  | 'market.filterRadius'
  | 'market.filterKind'
  | 'market.kindAll'
  | 'market.kindStandard'
  | 'market.kindQuick'
  | 'market.filterMinRate'
  | 'market.popularCities'
  | 'listing.detailTitle'
  | 'listing.quickDetailTitle'
  | 'listing.notFound'
  | 'listing.notFoundSub'
  | 'listing.privateListing'
  | 'listing.rateLabel'
  | 'listing.budgetLabel'
  | 'listing.description'
  | 'listing.mapTitle'
  | 'listing.mapFrom'
  | 'listing.mapOpen'
  | 'listing.pickPlaceTitle'
  | 'listing.pickPlaceHint'
  | 'listing.pickPlaceAny'
  | 'listing.pickPlaceShortcuts'
  | 'listing.pickPlaceSelected'
  | 'listing.pickPlaceEmpty'
  | 'listing.pickPlaceMarker'
  | 'listing.applySection'
  | 'listing.joinSection'
  | 'listing.alreadyApplied'
  | 'listing.alreadyJoined'
  | 'listing.applyPlaceholder'
  | 'listing.joinPlaceholder'
  | 'listing.sending'
  | 'listing.sendApply'
  | 'listing.joinSeat'
  | 'listing.noSlots'
  | 'listing.messageAuthor'
  | 'listing.editListing'
  | 'listing.deleteListing'
  | 'listing.candidates'
  | 'listing.applicationsCount'
  | 'listing.pickWinnerHint'
  | 'listing.loadingApps'
  | 'listing.noApps'
  | 'listing.noSeatsYet'
  | 'listing.openChat'
  | 'listing.pickThis'
  | 'listing.picking'
  | 'listing.you'
  | 'listing.joinedQuick'
  | 'listing.appliedOk'
  | 'listing.applyFailed'
  | 'listing.winnerPicked'
  | 'listing.pickFailed'
  | 'listing.chatUnavailable'
  | 'listing.chatFailed'
  | 'listing.phone'
  | 'listing.statusPrefix'
  | 'listing.slotsTitle'
  | 'listing.slotsAwarded'
  | 'listing.slotsFull'
  | 'listing.slotsFree'
  | 'listing.editTitle'
  | 'listing.editOnlyOwn'
  | 'listing.saving'
  | 'listing.saveChanges'
  | 'listing.saveEditFailed'
  | 'listing.noEditPerm'
  | 'listing.needCompanyShort'
  | 'listing.needNameShort'
  | 'listing.loginToAdd'
  | 'listing.phLocation'
  | 'listing.phLocationAny'
  | 'listing.phDesc'
  | 'listing.phBudget'
  | 'listing.phTags'
  | 'listing.phQuickTitle'
  | 'listing.tagsComma'
  | 'duration.hours'
  | 'duration.day'
  | 'duration.days'
  | 'duration.week'
  | 'duration.tbd'
  | 'notif.title'
  | 'notif.markRead'
  | 'notif.empty'
  | 'apps.sentTitle'
  | 'apps.sentEmpty'
  | 'apps.incomingTitle'
  | 'apps.incomingEmpty'
  | 'verify.title'
  | 'verify.lead'
  | 'verify.tipsTitle'
  | 'verify.tip1'
  | 'verify.tip2'
  | 'verify.tip3'
  | 'verify.tip4'
  | 'verify.tip5'
  | 'verify.tip6'
  | 'verify.openMail'
  | 'verify.checked'
  | 'verify.resend'
  | 'verify.logoutOther'
  | 'verify.infoInitial'
  | 'verify.notYet'
  | 'verify.noEmail'
  | 'verify.resent'
  | 'profile.title'
  | 'profile.notFound'
  | 'profile.about'
  | 'profile.noBio'
  | 'profile.rateUser'
  | 'profile.reviewPlaceholder'
  | 'profile.saveReview'
  | 'profile.reviews'
  | 'profile.noReviews'
  | 'profile.editInAccount'
  | 'profile.completedApplicant'
  | 'profile.completedAuthor'
  | 'profile.reviewSaved'
  | 'profile.reviewFailed'
  | 'profile.reviewOne'
  | 'profile.reviewFew'
  | 'profile.reviewMany'
  | 'account.noSession'
  | 'account.needCompanyMsg'
  | 'account.needNameMsg'
  | 'account.saved'
  | 'account.loginForPhoto'
  | 'account.noGallery'
  | 'account.photoSaved'
  | 'account.photoFailed'
  | 'chats.goToMarket'
  | 'chats.newBadge'
  | 'common.userFallback'
  | 'profile.rateLocked'
  | 'profile.updateReview'
  | 'profile.deleteReview'
  | 'profile.reviewDeleted'
  | 'profile.yourReview'
  | 'profile.noEligibility'
  | 'profile.trustTitle'
  | 'account.yourRating'
  | 'boost.title'
  | 'boost.subtitle'
  | 'boost.days'
  | 'boost.popular'
  | 'boost.tierHint'
  | 'boost.buy'
  | 'boost.mockNote'
  | 'boost.failed'
  | 'boost.denied'
  | 'boost.success'
  | 'boost.cta'
  | 'boost.badge'
  | 'boost.activeUntil'
  | 'boost.extend'
  | 'legal.privacyTitle'
  | 'legal.privacyLink'
  | 'legal.privacyAccept'
  | 'legal.openWeb'
  | 'legal.updated'
  | 'legal.section'
  | 'tip.gotIt'
  | 'tip.market.title'
  | 'tip.market.body'
  | 'tip.chats.title'
  | 'tip.chats.body'
  | 'tip.account.title'
  | 'tip.account.body'
  | 'tip.settings.title'
  | 'tip.settings.body'
  | 'tip.reset'
  | 'tip.resetDone'
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
  'settings.notifDevice': 'Powiadomienia systemowe',
  'settings.notifDeviceSub': 'Uprawnienie iOS/Android + token Expo Push',
  'settings.notifDeviceGranted': 'Włączone — token zapisany przy zalogowaniu',
  'settings.notifDeviceDenied': 'Odrzucone — włącz w ustawieniach telefonu',
  'settings.notifDeviceUnavailable': 'Niedostępne (symulator / web)',
  'settings.notifEnable': 'Włącz powiadomienia na tym urządzeniu',
  'settings.notifEnableBusy': 'Rejestracja…',
  'settings.notifEnableOk': 'Gotowe — push aktywny na tym urządzeniu.',
  'settings.notifEnableFail': 'Nie udało się. Sprawdź uprawnienia w ustawieniach systemu.',
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
  'welcome.language': 'Język',
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
  'auth.firebaseMissing': 'Brak konfiguracji Firebase.',
  'auth.passwordMinPlaceholder': 'min. {n} znaków',
  'auth.confirmPasswordPlaceholder': 'powtórz hasło',
  'auth.companyPlaceholder': 'np. WeldPro Sp. z o.o.',
  'auth.namePlaceholder': 'np. Jan Kowalski',
  'auth.continueGoogle': 'Kontynuuj z Google',
  'auth.googleNeedsBuild': 'wymaga buildu, nie Expo Go',
  'auth.googleNeedsBuildTitle': 'Wymagany build',
  'auth.googleNeedsBuildBody':
    'Logowanie Google nie działa w Expo Go. Zainstaluj build EAS (IPA/APK) na telefonie.',
  'auth.googleMissingClient': 'brak Client ID — dotknij po instrukcję',
  'auth.googleMissingTitle': 'Brak Google Client ID',
  'auth.googleMissingBody':
    'Ustaw EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (oraz iOS/Android) w .env i w EAS Secrets, potem zbuduj aplikację ponownie. Bundle ID: com.theweldersworld.app',
  'auth.err.generic': 'Coś poszło nie tak. Spróbuj ponownie.',
  'auth.err.invalidEmail': 'Nieprawidłowy adres e-mail.',
  'auth.err.userDisabled': 'To konto zostało wyłączone.',
  'auth.err.userNotFound': 'Nie znaleziono konta z tym adresem e-mail.',
  'auth.err.wrongPassword': 'Nieprawidłowe hasło.',
  'auth.err.invalidCredential': 'Błędny e-mail lub hasło.',
  'auth.err.emailInUse': 'Ten adres e-mail jest już zarejestrowany.',
  'auth.err.weakPassword': 'Hasło jest za słabe.',
  'auth.err.tooManyRequests': 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.',
  'auth.err.network': 'Brak połączenia z siecią. Sprawdź internet.',
  'auth.err.notAllowed': 'Ta metoda logowania jest wyłączona w Firebase.',
  'auth.err.missingEmail': 'Podaj adres e-mail.',
  'auth.err.differentCredential': 'To konto jest już powiązane z inną metodą logowania.',
  'auth.err.default': 'Nie udało się wykonać operacji.',
  'chats.aboutListing': 'Rozmowa o ogłoszeniu',
  'chats.sendFailed': 'Nie udało się wysłać wiadomości.',
  'chats.imageSendFailed': 'Nie udało się wysłać zdjęcia.',
  'chats.attachment': 'Załącznik',
  'chats.pickSource': 'Wybierz źródło zdjęcia',
  'chats.gallery': 'Galeria',
  'chats.camera': 'Aparat',
  'chats.noGalleryAccess': 'Brak dostępu do galerii.',
  'chats.noCameraAccess': 'Brak dostępu do aparatu.',
  'chats.loadingMessages': 'Ładowanie wiadomości…',
  'chats.olderMessages': 'Starsze wiadomości…',
  'chats.scrollForHistory': 'Przewiń wyżej, by wczytać historię',
  'chats.startConversation': 'Zacznij rozmowę',
  'chats.startHint': 'Napisz wiadomość albo dołącz zdjęcie z galerii / aparatu.',
  'chats.writeMessage': 'Napisz wiadomość…',
  'chats.uploadingImage': 'Wysyłanie zdjęcia…',
  'chats.addAttachment': 'Dodaj załącznik',
  'chats.youPrefix': 'Ty:',
  'auth.login': 'Zaloguj się',
  'auth.register': 'Zarejestruj się',
  'mode.hall': "Na hali",
  'mode.hybrid': "Hybryda",
  'mode.mobile': "Mobilnie",
  'intent.offer': "Oferuję",
  'intent.seek': "Poszukuję",
  'market.allFilter': "Wszystkie",
  'market.minRateStrip': "min. {n} PLN/h",
  'market.clearFilters': 'Wyczyść filtry',
  'market.applyFilters': 'Zastosuj',
  'market.filterLocation': 'Lokalizacja',
  'market.filterLocationPh': 'Miasto lub miejscowość…',
  'market.filterRadius': 'Promień',
  'market.filterKind': 'Typ ogłoszenia',
  'market.kindAll': 'Wszystkie',
  'market.kindStandard': 'Standardowe',
  'market.kindQuick': 'Szybkie zlecenia',
  'market.filterMinRate': 'Min. stawka',
  'market.popularCities': 'Popularne miasta',
  'listing.detailTitle': "Szczegóły ogłoszenia",
  'listing.quickDetailTitle': "Szybkie zlecenie",
  'listing.notFound': "Nie znaleziono ogłoszenia",
  'listing.notFoundSub': "To ogłoszenie mogło zostać usunięte.",
  'listing.privateListing': "Ogłoszenie prywatne",
  'listing.rateLabel': "Stawka: ",
  'listing.budgetLabel': "Budżet / stawka: ",
  'listing.description': "Opis",
  'listing.mapTitle': "Skąd zlecenie",
  'listing.mapFrom': "Opublikowano z okolicy: {place}",
  'listing.mapOpen': "Otwórz mapę",
  'listing.pickPlaceTitle': "Miejsce realizacji",
  'listing.pickPlaceHint':
    "Wybierz miejsce realizacji zlecenia — tapnij mapę (wieś, małe miasto, zagranica) albo wpisz poniżej.",
  'listing.pickPlaceAny':
    "Skróty to duże miasta PL. Dowolną miejscowość wpisz w polu tekstowym.",
  'listing.pickPlaceShortcuts': "Szybki wybór (duże miasta)",
  'listing.pickPlaceSelected': "Wybrane: {place}",
  'listing.pickPlaceEmpty': "Dotknij mapy lub wpisz lokalizację poniżej",
  'listing.pickPlaceMarker': "Tu realizujesz zlecenie",
  'listing.applySection': "Aplikacja",
  'listing.joinSection': "Dołącz do zlecenia",
  'listing.alreadyApplied': "Masz już wysłane zgłoszenie. Status: {status}.",
  'listing.alreadyJoined': "Jesteś w gronie zgłoszonych. Status: {status}.",
  'listing.applyPlaceholder': "Napisz krótką wiadomość do autora ogłoszenia...",
  'listing.joinPlaceholder': "Krótko: dostępność, dojazd, sprzęt…",
  'listing.sending': "Wysyłanie...",
  'listing.sendApply': "Wyślij zgłoszenie",
  'listing.joinSeat': "Dołącz (zajmij miejsce)",
  'listing.noSlots': "Brak wolnych miejsc albo zlecenie jest już rozstrzygnięte.",
  'listing.messageAuthor': "Napisz do zleceniodawcy",
  'listing.editListing': "Edytuj ogłoszenie",
  'listing.deleteListing': "Usuń ogłoszenie",
  'listing.candidates': "Kandydaci ({count}/5)",
  'listing.applicationsCount': "Zgłoszenia ({count})",
  'listing.pickWinnerHint': "Wybierz jedną osobę — pozostałe zgłoszenia zostaną odrzucone. Możesz też otworzyć czat przed decyzją.",
  'listing.loadingApps': "Ładowanie zgłoszeń...",
  'listing.noApps': "Brak zgłoszeń do tego ogłoszenia.",
  'listing.noSeatsYet': "Nikt jeszcze nie zajął miejsca.",
  'listing.openChat': "Otwórz czat",
  'listing.pickThis': "Wybierz tego",
  'listing.picking': "Wybieranie…",
  'listing.you': "Ty",
  'listing.joinedQuick': "Dołączyłeś do szybkiego zlecenia. Czekaj na wybór zleceniodawcy.",
  'listing.appliedOk': "Zgłoszenie zostało wysłane.",
  'listing.applyFailed': "Nie udało się wysłać zgłoszenia.",
  'listing.winnerPicked': "Wybrano wykonawcę — pozostałe zgłoszenia odrzucone.",
  'listing.pickFailed': "Nie udało się wybrać wykonawcy.",
  'listing.chatUnavailable': "Nie można otworzyć czatu dla tego ogłoszenia.",
  'listing.chatFailed': "Nie udało się otworzyć rozmowy.",
  'listing.phone': "tel: {phone}",
  'listing.statusPrefix': "Status: {status}",
  'listing.slotsTitle': "Miejsca w mikrolicytacji",
  'listing.slotsAwarded': "Zleceniodawca wybrał wykonawcę.",
  'listing.slotsFull': "Komplet 5 najszybszych — czekamy na wybór.",
  'listing.slotsFree': "Wolne miejsca: {n}. Pierwsze 5 osób wchodzi do gry.",
  'listing.editTitle': "Edytuj ogłoszenie",
  'listing.editOnlyOwn': "Możesz edytować tylko własne ogłoszenia.",
  'listing.saving': "Zapisywanie...",
  'listing.saveChanges': "Zapisz zmiany",
  'listing.saveEditFailed': "Nie udało się zapisać zmian.",
  'listing.noEditPerm': "Brak uprawnień do edycji tego ogłoszenia.",
  'listing.needCompanyShort': "Uzupełnij nazwę firmy w Koncie.",
  'listing.needNameShort': "Uzupełnij imię i nazwisko w Koncie.",
  'listing.loginToAdd': "Zaloguj się, aby dodać ogłoszenie.",
  'listing.phLocation': "np. Katowice / Śląsk",
  'listing.phLocationAny': "np. Żory, Cieszyn, Ostrava, Berlin…",
  'listing.phDesc': "Zakres prac, wymagania, termin, lokalizacja szczegółowa…",
  'listing.phBudget': "np. 400 — możesz pominąć",
  'listing.phTags': "TIG 141, Inox, Start od zaraz",
  'listing.phQuickTitle': "np. Spawanie bramy — dziś wieczór",
  'listing.tagsComma': "Tagi (oddziel przecinkiem)",
  'duration.hours': "Kilka godzin",
  'duration.day': "1 dzień",
  'duration.days': "Kilka dni",
  'duration.week': "Tydzień",
  'duration.tbd': "Do uzgodnienia",
  'notif.title': "Powiadomienia",
  'notif.markRead': "Oznacz przeczytane",
  'notif.empty': "Brak powiadomień. Pojawią się przy zgłoszeniach, zmianie statusu i nowych wiadomościach.",
  'apps.sentTitle': "Wszystkie moje zgłoszenia",
  'apps.sentEmpty': "Nie wysłałeś jeszcze żadnego zgłoszenia.",
  'apps.incomingTitle': "Wszystkie przychodzące zgłoszenia",
  'apps.incomingEmpty': "Brak zgłoszeń do Twoich ogłoszeń.",
  'verify.title': "Potwierdź e-mail",
  'verify.lead': "Link aktywacyjny wysyła Firebase na adres:",
  'verify.tipsTitle': "Nie widzisz maila?",
  'verify.tip1': "• Sprawdź Spam, Oferty i Wszystkie wiadomości (Gmail).",
  'verify.tip2': "• Szukaj nadawcy podobnego do:",
  'verify.tip3': "• Upewnij się, że przy rejestracji nie pomyliłeś liter w adresie.",
  'verify.tip4': "• Odczekaj 2–5 minut — czasem mail przychodzi z opóźnieniem.",
  'verify.tip5': "• Naciśnij „Wyślij e-mail ponownie” (nie częściej niż co kilka minut).",
  'verify.tip6': "• Konto przez Google zwykle nie wymaga tego kroku — wyloguj się i zaloguj przez Google.",
  'verify.openMail': "Otwórz aplikację e-mail",
  'verify.checked': "Sprawdziłem — przejdź dalej",
  'verify.resend': "Wyślij e-mail ponownie",
  'verify.logoutOther': "Wyloguj i użyj innego konta",
  'verify.infoInitial': "Po rejestracji wysłaliśmy link — sprawdź skrzynkę (także Spam).",
  'verify.notYet': "Link jeszcze nie został użyty. Otwórz mail, kliknij link, wróć tutaj i naciśnij ponownie „Sprawdziłem”.",
  'verify.noEmail': "Brak adresu e-mail na koncie.",
  'verify.resent': "Wysłano ponownie na {email}. Poczekaj 1–2 minuty i sprawdź Spam / Oferty.",
  'profile.title': "Profil",
  'profile.notFound': "Nie znaleziono profilu użytkownika.",
  'profile.about': "O mnie",
  'profile.noBio': "Brak opisu publicznego.",
  'profile.rateUser': "Oceń użytkownika",
  'profile.reviewPlaceholder': "Krótka opinia (opcjonalnie)",
  'profile.saveReview': "Zapisz opinię",
  'profile.reviews': "Opinie",
  'profile.noReviews': "Brak opinii.",
  'profile.editInAccount': "Edytuj profil w Koncie",
  'profile.completedApplicant': "Zakończone jako wykonawca",
  'profile.completedAuthor': "Zrealizowane jako zleceniodawca",
  'profile.reviewSaved': "Opinia zapisana. Dziękujemy!",
  'profile.reviewFailed': "Nie udało się zapisać opinii.",
  'profile.reviewOne': "opinia",
  'profile.reviewFew': "opinie",
  'profile.reviewMany': "opinii",
  'account.noSession': "Brak aktywnej sesji.",
  'account.needCompanyMsg': "Nazwa firmy jest wymagana — pojawia się na Twoich ogłoszeniach.",
  'account.needNameMsg': "Imię i nazwisko jest wymagane — pojawia się na Twoich ogłoszeniach.",
  'account.saved': "Profil zapisany.",
  'account.loginForPhoto': "Zaloguj się, aby zmienić zdjęcie.",
  'account.noGallery': "Brak uprawnień do galerii.",
  'account.photoSaved': "Zdjęcie profilowe zapisane.",
  'account.photoFailed': "Nie udało się wgrać zdjęcia.",
  'chats.goToMarket': "Przejdź do Rynku",
  'chats.newBadge': "Nowe",
  'common.userFallback': "Użytkownik",
  'profile.rateLocked': "Możesz ocenić dopiero po zaakceptowanej współpracy (zgłoszenie).",
  'profile.updateReview': "Zaktualizuj opinię",
  'profile.deleteReview': "Usuń opinię",
  'profile.reviewDeleted': "Opinia usunięta.",
  'profile.yourReview': "Twoja opinia",
  'profile.noEligibility': "Brak wspólnej współpracy — ocena niedostępna.",
  'profile.trustTitle': "Zaufanie",
  'account.yourRating': "Twoja ocena publiczna",
  'boost.title': "Wypromuj ogłoszenie",
  'boost.subtitle': "Booster wypycha Twoje ogłoszenie na górę rynku na wybrany czas.",
  'boost.days': "{n} dni",
  'boost.popular': "Popularne",
  'boost.tierHint': "Więcej wyświetleń · badge „Wyróżnione”",
  'boost.buy': "Wykup booster",
  'boost.mockNote': "MVP: bezpłatny mock (działa od razu). Docelowo IAP / RevenueCat.",
  'boost.failed': "Nie udało się aktywować boostera. Sprawdź połączenie.",
  'boost.denied': "Brak uprawnień do promocji tego ogłoszenia. Wdróż zaktualizowane reguły Firestore.",
  'boost.success': "Booster aktywny na {days} dni.",
  'boost.cta': "Wypromuj",
  'boost.badge': "Wyróżnione",
  'boost.activeUntil': "Wyróżnione do {date}",
  'boost.extend': "Przedłuż booster",
  'legal.privacyTitle': 'Polityka prywatności',
  'legal.privacyLink': 'Polityka prywatności',
  'legal.privacyAccept': 'Rejestrując się, akceptujesz politykę prywatności.',
  'legal.openWeb': 'Otwórz w przeglądarce',
  'legal.updated': 'Aktualizacja: {date}',
  'legal.section': 'Informacje prawne',
  'tip.gotIt': 'Rozumiem',
  'tip.market.title': 'Rynek w pigułce',
  'tip.market.body':
    'Tu kręci się cała giełda: oferty pracy, szukanie ludzi i szybkie zlecenia. Filtruj, sortuj — wyróżnione w miedzianej ramce lecą na górę.',
  'tip.chats.title': 'Tu dogadujesz robotę',
  'tip.chats.body':
    'Po zgłoszeniu albo z ogłoszenia otwierasz czat. Wątki, powiadomienia i historia rozmów — bez gubienia kontekstu.',
  'tip.account.title': 'Twoja wizytówka',
  'tip.account.body':
    'Zdjęcie, bio, zgłoszenia i oceny. To widzą inni, zanim napiszą — zadbaj, żeby wyglądało solidnie.',
  'tip.settings.title': 'Dopasuj pod siebie',
  'tip.settings.body':
    'Miasto, promień, stawki, język i powiadomienia. Ustaw raz — rynek i alerty grają pod Twoje reguły.',
  'tip.reset': 'Pokaż wskazówki zakładek ponownie',
  'tip.resetDone': 'Wskazówki znów pojawią się na zakładkach.',
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
  'settings.notifDevice': 'System notifications',
  'settings.notifDeviceSub': 'iOS/Android permission + Expo Push token',
  'settings.notifDeviceGranted': 'Enabled — token saved when signed in',
  'settings.notifDeviceDenied': 'Denied — enable in phone settings',
  'settings.notifDeviceUnavailable': 'Unavailable (simulator / web)',
  'settings.notifEnable': 'Enable notifications on this device',
  'settings.notifEnableBusy': 'Registering…',
  'settings.notifEnableOk': 'Done — push is active on this device.',
  'settings.notifEnableFail': 'Failed. Check system notification permissions.',
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
  'welcome.language': 'Language',
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
  'auth.firebaseMissing': 'Firebase is not configured.',
  'auth.passwordMinPlaceholder': 'min. {n} characters',
  'auth.confirmPasswordPlaceholder': 'repeat password',
  'auth.companyPlaceholder': 'e.g. WeldPro Ltd.',
  'auth.namePlaceholder': 'e.g. John Smith',
  'auth.continueGoogle': 'Continue with Google',
  'auth.googleNeedsBuild': 'requires a build, not Expo Go',
  'auth.googleNeedsBuildTitle': 'Build required',
  'auth.googleNeedsBuildBody':
    'Google Sign-In does not work in Expo Go. Install an EAS build (IPA/APK) on your phone.',
  'auth.googleMissingClient': 'missing Client ID — tap for instructions',
  'auth.googleMissingTitle': 'Missing Google Client ID',
  'auth.googleMissingBody':
    'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (and iOS/Android) in .env and EAS Secrets, then rebuild. Bundle ID: com.theweldersworld.app',
  'auth.err.generic': 'Something went wrong. Please try again.',
  'auth.err.invalidEmail': 'Invalid email address.',
  'auth.err.userDisabled': 'This account has been disabled.',
  'auth.err.userNotFound': 'No account found with this email.',
  'auth.err.wrongPassword': 'Incorrect password.',
  'auth.err.invalidCredential': 'Wrong email or password.',
  'auth.err.emailInUse': 'This email is already registered.',
  'auth.err.weakPassword': 'Password is too weak.',
  'auth.err.tooManyRequests': 'Too many attempts. Wait a moment and try again.',
  'auth.err.network': 'No network connection. Check your internet.',
  'auth.err.notAllowed': 'This sign-in method is disabled in Firebase.',
  'auth.err.missingEmail': 'Enter an email address.',
  'auth.err.differentCredential': 'This account is linked to a different sign-in method.',
  'auth.err.default': 'Could not complete the operation.',
  'chats.aboutListing': 'Listing conversation',
  'chats.sendFailed': 'Could not send the message.',
  'chats.imageSendFailed': 'Could not send the photo.',
  'chats.attachment': 'Attachment',
  'chats.pickSource': 'Choose a photo source',
  'chats.gallery': 'Gallery',
  'chats.camera': 'Camera',
  'chats.noGalleryAccess': 'No gallery access.',
  'chats.noCameraAccess': 'No camera access.',
  'chats.loadingMessages': 'Loading messages…',
  'chats.olderMessages': 'Older messages…',
  'chats.scrollForHistory': 'Scroll up to load history',
  'chats.startConversation': 'Start the conversation',
  'chats.startHint': 'Write a message or attach a photo from gallery / camera.',
  'chats.writeMessage': 'Write a message…',
  'chats.uploadingImage': 'Uploading photo…',
  'chats.addAttachment': 'Add attachment',
  'chats.youPrefix': 'You:',
  'auth.login': 'Sign in',
  'auth.register': 'Sign up',
  'mode.hall': "On site",
  'mode.hybrid': "Hybrid",
  'mode.mobile': "Mobile",
  'intent.offer': "Offering",
  'intent.seek': "Looking for",
  'market.allFilter': "All",
  'market.minRateStrip': "min. {n} PLN/h",
  'market.clearFilters': 'Clear filters',
  'market.applyFilters': 'Apply',
  'market.filterLocation': 'Location',
  'market.filterLocationPh': 'City or place…',
  'market.filterRadius': 'Radius',
  'market.filterKind': 'Listing type',
  'market.kindAll': 'All',
  'market.kindStandard': 'Standard',
  'market.kindQuick': 'Quick jobs',
  'market.filterMinRate': 'Min. rate',
  'market.popularCities': 'Popular cities',
  'listing.detailTitle': "Listing details",
  'listing.quickDetailTitle': "Quick job",
  'listing.notFound': "Listing not found",
  'listing.notFoundSub': "This listing may have been deleted.",
  'listing.privateListing': "Private listing",
  'listing.rateLabel': "Rate: ",
  'listing.budgetLabel': "Budget / rate: ",
  'listing.description': "Description",
  'listing.mapTitle': "Where it's from",
  'listing.mapFrom': "Posted around: {place}",
  'listing.mapOpen': "Open map",
  'listing.pickPlaceTitle': "Job location",
  'listing.pickPlaceHint':
    "Pick the job location — tap the map (village, small town, abroad) or type below.",
  'listing.pickPlaceAny':
    "Shortcuts are major PL cities. Type any place in the text field.",
  'listing.pickPlaceShortcuts': "Quick pick (major cities)",
  'listing.pickPlaceSelected': "Selected: {place}",
  'listing.pickPlaceEmpty': "Tap the map or type a location below",
  'listing.pickPlaceMarker': "Job location",
  'listing.applySection': "Application",
  'listing.joinSection': "Join the job",
  'listing.alreadyApplied': "You already applied. Status: {status}.",
  'listing.alreadyJoined': "You are among the applicants. Status: {status}.",
  'listing.applyPlaceholder': "Write a short message to the listing author...",
  'listing.joinPlaceholder': "Briefly: availability, travel, gear…",
  'listing.sending': "Sending...",
  'listing.sendApply': "Send application",
  'listing.joinSeat': "Join (take a seat)",
  'listing.noSlots': "No seats left or the job is already decided.",
  'listing.messageAuthor': "Message the client",
  'listing.editListing': "Edit listing",
  'listing.deleteListing': "Delete listing",
  'listing.candidates': "Candidates ({count}/5)",
  'listing.applicationsCount': "Applications ({count})",
  'listing.pickWinnerHint': "Pick one person — other applications will be rejected. You can open chat before deciding.",
  'listing.loadingApps': "Loading applications...",
  'listing.noApps': "No applications for this listing.",
  'listing.noSeatsYet': "Nobody has taken a seat yet.",
  'listing.openChat': "Open chat",
  'listing.pickThis': "Pick this one",
  'listing.picking': "Selecting…",
  'listing.you': "You",
  'listing.joinedQuick': "You joined the quick job. Wait for the client’s choice.",
  'listing.appliedOk': "Application sent.",
  'listing.applyFailed': "Could not send the application.",
  'listing.winnerPicked': "Worker selected — other applications rejected.",
  'listing.pickFailed': "Could not select the worker.",
  'listing.chatUnavailable': "Cannot open chat for this listing.",
  'listing.chatFailed': "Could not open the conversation.",
  'listing.phone': "tel: {phone}",
  'listing.statusPrefix': "Status: {status}",
  'listing.slotsTitle': "Micro-auction seats",
  'listing.slotsAwarded': "The client picked a worker.",
  'listing.slotsFull': "5 fastest are in — waiting for the choice.",
  'listing.slotsFree': "Seats left: {n}. First 5 people enter.",
  'listing.editTitle': "Edit listing",
  'listing.editOnlyOwn': "You can only edit your own listings.",
  'listing.saving': "Saving...",
  'listing.saveChanges': "Save changes",
  'listing.saveEditFailed': "Could not save changes.",
  'listing.noEditPerm': "No permission to edit this listing.",
  'listing.needCompanyShort': "Add a company name in Account.",
  'listing.needNameShort': "Add your full name in Account.",
  'listing.loginToAdd': "Sign in to add a listing.",
  'listing.phLocation': "e.g. Katowice / Silesia",
  'listing.phLocationAny': "e.g. Żory, Cieszyn, Ostrava, Berlin…",
  'listing.phDesc': "Scope, requirements, timing, detailed location…",
  'listing.phBudget': "e.g. 400 — optional",
  'listing.phTags': "TIG 141, Inox, Start ASAP",
  'listing.phQuickTitle': "e.g. Gate welding — tonight",
  'listing.tagsComma': "Tags (comma-separated)",
  'duration.hours': "A few hours",
  'duration.day': "1 day",
  'duration.days': "A few days",
  'duration.week': "A week",
  'duration.tbd': "To be agreed",
  'notif.title': "Notifications",
  'notif.markRead': "Mark as read",
  'notif.empty': "No notifications yet. They appear for applications, status changes and new messages.",
  'apps.sentTitle': "All my applications",
  'apps.sentEmpty': "You have not sent any applications yet.",
  'apps.incomingTitle': "All incoming applications",
  'apps.incomingEmpty': "No applications to your listings.",
  'verify.title': "Confirm email",
  'verify.lead': "Firebase sends the activation link to:",
  'verify.tipsTitle': "Don’t see the email?",
  'verify.tip1': "• Check Spam, Promotions and All mail (Gmail).",
  'verify.tip2': "• Look for a sender similar to:",
  'verify.tip3': "• Make sure you typed the address correctly at sign-up.",
  'verify.tip4': "• Wait 2–5 minutes — delivery can be delayed.",
  'verify.tip5': "• Tap “Resend email” (not more than every few minutes).",
  'verify.tip6': "• Google accounts usually skip this — sign out and sign in with Google.",
  'verify.openMail': "Open email app",
  'verify.checked': "I checked — continue",
  'verify.resend': "Resend email",
  'verify.logoutOther': "Sign out and use another account",
  'verify.infoInitial': "We sent a link after registration — check your inbox (and Spam).",
  'verify.notYet': "The link has not been used yet. Open the email, tap the link, return here and press again.",
  'verify.noEmail': "No email address on this account.",
  'verify.resent': "Resent to {email}. Wait 1–2 minutes and check Spam / Promotions.",
  'profile.title': "Profile",
  'profile.notFound': "User profile not found.",
  'profile.about': "About",
  'profile.noBio': "No public bio.",
  'profile.rateUser': "Rate this user",
  'profile.reviewPlaceholder': "Short review (optional)",
  'profile.saveReview': "Save review",
  'profile.reviews': "Reviews",
  'profile.noReviews': "No reviews.",
  'profile.editInAccount': "Edit profile in Account",
  'profile.completedApplicant': "Completed as worker",
  'profile.completedAuthor': "Completed as client",
  'profile.reviewSaved': "Review saved. Thank you!",
  'profile.reviewFailed': "Could not save the review.",
  'profile.reviewOne': "review",
  'profile.reviewFew': "reviews",
  'profile.reviewMany': "reviews",
  'account.noSession': "No active session.",
  'account.needCompanyMsg': "Company name is required — it appears on your listings.",
  'account.needNameMsg': "Full name is required — it appears on your listings.",
  'account.saved': "Profile saved.",
  'account.loginForPhoto': "Sign in to change your photo.",
  'account.noGallery': "No gallery permission.",
  'account.photoSaved': "Profile photo saved.",
  'account.photoFailed': "Could not upload the photo.",
  'chats.goToMarket': "Go to Market",
  'chats.newBadge': "New",
  'common.userFallback': "User",
  'profile.rateLocked': "You can rate only after an accepted collaboration (application).",
  'profile.updateReview': "Update review",
  'profile.deleteReview': "Delete review",
  'profile.reviewDeleted': "Review deleted.",
  'profile.yourReview': "Your review",
  'profile.noEligibility': "No shared collaboration — rating unavailable.",
  'profile.trustTitle': "Trust",
  'account.yourRating': "Your public rating",
  'boost.title': "Promote listing",
  'boost.subtitle': "A booster pushes your listing to the top of the market for a set time.",
  'boost.days': "{n} days",
  'boost.popular': "Popular",
  'boost.tierHint': "More views · “Featured” badge",
  'boost.buy': "Buy booster",
  'boost.mockNote': "MVP: free mock (works immediately). Later: IAP / RevenueCat.",
  'boost.failed': "Could not activate the booster. Check your connection.",
  'boost.denied': "No permission to promote this listing. Deploy updated Firestore rules.",
  'boost.success': "Booster active for {days} days.",
  'boost.cta': "Promote",
  'boost.badge': "Featured",
  'boost.activeUntil': "Featured until {date}",
  'boost.extend': "Extend booster",
  'legal.privacyTitle': 'Privacy Policy',
  'legal.privacyLink': 'Privacy Policy',
  'legal.privacyAccept': 'By signing up, you accept the privacy policy.',
  'legal.openWeb': 'Open in browser',
  'legal.updated': 'Updated: {date}',
  'legal.section': 'Legal',
  'tip.gotIt': 'Got it',
  'tip.market.title': 'Market in a nutshell',
  'tip.market.body':
    'Jobs, seeking talent, and quick gigs live here. Filter, sort — featured listings in the copper frame rise to the top.',
  'tip.chats.title': 'Where deals get talked through',
  'tip.chats.body':
    'Open a chat from an application or listing. Threads, alerts, and history stay in one place.',
  'tip.account.title': 'Your trade card',
  'tip.account.body':
    'Photo, bio, applications, and ratings. Others see this before they message — make it look solid.',
  'tip.settings.title': 'Tune it your way',
  'tip.settings.body':
    'City, radius, rates, language, and notifications. Set once — the market follows your rules.',
  'tip.reset': 'Show tab tips again',
  'tip.resetDone': 'Tips will show again on each tab.',
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
  'settings.notifDevice': 'Systembenachrichtigungen',
  'settings.notifDeviceSub': 'iOS/Android-Berechtigung + Expo-Push-Token',
  'settings.notifDeviceGranted': 'Aktiv — Token beim Login gespeichert',
  'settings.notifDeviceDenied': 'Abgelehnt — in den Telefoneinstellungen aktivieren',
  'settings.notifDeviceUnavailable': 'Nicht verfügbar (Simulator / Web)',
  'settings.notifEnable': 'Benachrichtigungen auf diesem Gerät aktivieren',
  'settings.notifEnableBusy': 'Registrierung…',
  'settings.notifEnableOk': 'Fertig — Push ist auf diesem Gerät aktiv.',
  'settings.notifEnableFail': 'Fehlgeschlagen. Prüfe die Systemberechtigungen.',
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
  'welcome.language': 'Sprache',
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
  'auth.firebaseMissing': 'Firebase ist nicht konfiguriert.',
  'auth.passwordMinPlaceholder': 'min. {n} Zeichen',
  'auth.confirmPasswordPlaceholder': 'Passwort wiederholen',
  'auth.companyPlaceholder': 'z. B. WeldPro GmbH',
  'auth.namePlaceholder': 'z. B. Max Mustermann',
  'auth.continueGoogle': 'Mit Google fortfahren',
  'auth.googleNeedsBuild': 'benötigt Build, nicht Expo Go',
  'auth.googleNeedsBuildTitle': 'Build erforderlich',
  'auth.googleNeedsBuildBody':
    'Google-Anmeldung funktioniert nicht in Expo Go. Installiere einen EAS-Build (IPA/APK).',
  'auth.googleMissingClient': 'Client ID fehlt — tippen für Anleitung',
  'auth.googleMissingTitle': 'Google Client ID fehlt',
  'auth.googleMissingBody':
    'Setze EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (und iOS/Android) in .env und EAS Secrets, dann neu bauen. Bundle-ID: com.theweldersworld.app',
  'auth.err.generic': 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
  'auth.err.invalidEmail': 'Ungültige E-Mail-Adresse.',
  'auth.err.userDisabled': 'Dieses Konto wurde deaktiviert.',
  'auth.err.userNotFound': 'Kein Konto mit dieser E-Mail gefunden.',
  'auth.err.wrongPassword': 'Falsches Passwort.',
  'auth.err.invalidCredential': 'Falsche E-Mail oder Passwort.',
  'auth.err.emailInUse': 'Diese E-Mail ist bereits registriert.',
  'auth.err.weakPassword': 'Passwort ist zu schwach.',
  'auth.err.tooManyRequests': 'Zu viele Versuche. Bitte kurz warten.',
  'auth.err.network': 'Keine Netzwerkverbindung.',
  'auth.err.notAllowed': 'Diese Anmeldemethode ist in Firebase deaktiviert.',
  'auth.err.missingEmail': 'E-Mail-Adresse eingeben.',
  'auth.err.differentCredential': 'Konto ist mit einer anderen Anmeldemethode verknüpft.',
  'auth.err.default': 'Vorgang konnte nicht abgeschlossen werden.',
  'chats.aboutListing': 'Gespräch zur Anzeige',
  'chats.sendFailed': 'Nachricht konnte nicht gesendet werden.',
  'chats.imageSendFailed': 'Foto konnte nicht gesendet werden.',
  'chats.attachment': 'Anhang',
  'chats.pickSource': 'Fotoquelle wählen',
  'chats.gallery': 'Galerie',
  'chats.camera': 'Kamera',
  'chats.noGalleryAccess': 'Kein Galeriezugriff.',
  'chats.noCameraAccess': 'Kein Kamerazugriff.',
  'chats.loadingMessages': 'Nachrichten werden geladen…',
  'chats.olderMessages': 'Ältere Nachrichten…',
  'chats.scrollForHistory': 'Nach oben scrollen für Verlauf',
  'chats.startConversation': 'Gespräch starten',
  'chats.startHint': 'Nachricht schreiben oder Foto anhängen.',
  'chats.writeMessage': 'Nachricht schreiben…',
  'chats.uploadingImage': 'Foto wird hochgeladen…',
  'chats.addAttachment': 'Anhang hinzufügen',
  'chats.youPrefix': 'Du:',
  'auth.login': 'Anmelden',
  'auth.register': 'Registrieren',
  'mode.hall': "Vor Ort",
  'mode.hybrid': "Hybrid",
  'mode.mobile': "Mobil",
  'intent.offer': "Biete",
  'intent.seek': "Suche",
  'market.allFilter': "Alle",
  'market.minRateStrip': "min. {n} PLN/h",
  'market.clearFilters': 'Filter löschen',
  'market.applyFilters': 'Anwenden',
  'market.filterLocation': 'Standort',
  'market.filterLocationPh': 'Stadt oder Ort…',
  'market.filterRadius': 'Radius',
  'market.filterKind': 'Anzeigentyp',
  'market.kindAll': 'Alle',
  'market.kindStandard': 'Standard',
  'market.kindQuick': 'Schnellaufträge',
  'market.filterMinRate': 'Min. Satz',
  'market.popularCities': 'Beliebte Städte',
  'listing.detailTitle': "Anzeigendetails",
  'listing.quickDetailTitle': "Schnellauftrag",
  'listing.notFound': "Anzeige nicht gefunden",
  'listing.notFoundSub': "Diese Anzeige wurde möglicherweise gelöscht.",
  'listing.privateListing': "Private Anzeige",
  'listing.rateLabel': "Satz: ",
  'listing.budgetLabel': "Budget / Satz: ",
  'listing.description': "Beschreibung",
  'listing.mapTitle': "Herkunft des Auftrags",
  'listing.mapFrom': "Veröffentlicht bei: {place}",
  'listing.mapOpen': "Karte öffnen",
  'listing.pickPlaceTitle': "Einsatzort",
  'listing.pickPlaceHint':
    "Wähle den Einsatzort — tippe auf die Karte (Dorf, Kleinstadt, Ausland) oder tippe unten.",
  'listing.pickPlaceAny':
    "Shortcuts sind große PL-Städte. Beliebigen Ort im Textfeld eingeben.",
  'listing.pickPlaceShortcuts': "Schnellwahl (große Städte)",
  'listing.pickPlaceSelected': "Gewählt: {place}",
  'listing.pickPlaceEmpty': "Karte tippen oder Ort unten eingeben",
  'listing.pickPlaceMarker': "Einsatzort",
  'listing.applySection': "Bewerbung",
  'listing.joinSection': "Auftrag beitreten",
  'listing.alreadyApplied': "Du hast bereits beworben. Status: {status}.",
  'listing.alreadyJoined': "Du bist unter den Bewerbern. Status: {status}.",
  'listing.applyPlaceholder': "Kurze Nachricht an den Autor...",
  'listing.joinPlaceholder': "Kurz: Verfügbarkeit, Anfahrt, Ausrüstung…",
  'listing.sending': "Senden...",
  'listing.sendApply': "Bewerbung senden",
  'listing.joinSeat': "Beitreten (Platz nehmen)",
  'listing.noSlots': "Keine Plätze oder Auftrag bereits vergeben.",
  'listing.messageAuthor': "Auftraggeber schreiben",
  'listing.editListing': "Anzeige bearbeiten",
  'listing.deleteListing': "Anzeige löschen",
  'listing.candidates': "Kandidaten ({count}/5)",
  'listing.applicationsCount': "Bewerbungen ({count})",
  'listing.pickWinnerHint': "Wähle eine Person — andere Bewerbungen werden abgelehnt. Chat vor der Entscheidung möglich.",
  'listing.loadingApps': "Bewerbungen werden geladen...",
  'listing.noApps': "Keine Bewerbungen für diese Anzeige.",
  'listing.noSeatsYet': "Noch niemand hat einen Platz.",
  'listing.openChat': "Chat öffnen",
  'listing.pickThis': "Diesen wählen",
  'listing.picking': "Auswählen…",
  'listing.you': "Du",
  'listing.joinedQuick': "Du bist dem Schnellauftrag beigetreten. Warte auf die Wahl.",
  'listing.appliedOk': "Bewerbung gesendet.",
  'listing.applyFailed': "Bewerbung konnte nicht gesendet werden.",
  'listing.winnerPicked': "Ausführender gewählt — andere abgelehnt.",
  'listing.pickFailed': "Auswahl fehlgeschlagen.",
  'listing.chatUnavailable': "Chat für diese Anzeige nicht möglich.",
  'listing.chatFailed': "Unterhaltung konnte nicht geöffnet werden.",
  'listing.phone': "Tel.: {phone}",
  'listing.statusPrefix': "Status: {status}",
  'listing.slotsTitle': "Plätze in der Mikroauktion",
  'listing.slotsAwarded': "Auftraggeber hat gewählt.",
  'listing.slotsFull': "5 Schnellste drin — warte auf Auswahl.",
  'listing.slotsFree': "Freie Plätze: {n}. Die ersten 5 kommen rein.",
  'listing.editTitle': "Anzeige bearbeiten",
  'listing.editOnlyOwn': "Nur eigene Anzeigen bearbeiten.",
  'listing.saving': "Speichern...",
  'listing.saveChanges': "Änderungen speichern",
  'listing.saveEditFailed': "Speichern fehlgeschlagen.",
  'listing.noEditPerm': "Keine Berechtigung.",
  'listing.needCompanyShort': "Firmenname im Konto ergänzen.",
  'listing.needNameShort': "Namen im Konto ergänzen.",
  'listing.loginToAdd': "Melde dich an, um eine Anzeige zu erstellen.",
  'listing.phLocation': "z. B. Katowice / Schlesien",
  'listing.phLocationAny': "z. B. Żory, Cieszyn, Ostrava, Berlin…",
  'listing.phDesc': "Umfang, Anforderungen, Termin, Ort…",
  'listing.phBudget': "z. B. 400 — optional",
  'listing.phTags': "TIG 141, Inox, Sofortstart",
  'listing.phQuickTitle': "z. B. Tor schweißen — heute Abend",
  'listing.tagsComma': "Tags (kommagetrennt)",
  'duration.hours': "Einige Stunden",
  'duration.day': "1 Tag",
  'duration.days': "Einige Tage",
  'duration.week': "Eine Woche",
  'duration.tbd': "Nach Absprache",
  'notif.title': "Benachrichtigungen",
  'notif.markRead': "Als gelesen markieren",
  'notif.empty': "Keine Benachrichtigungen. Sie erscheinen bei Bewerbungen, Status und Nachrichten.",
  'apps.sentTitle': "Alle meine Bewerbungen",
  'apps.sentEmpty': "Noch keine Bewerbungen gesendet.",
  'apps.incomingTitle': "Alle eingehenden Bewerbungen",
  'apps.incomingEmpty': "Keine Bewerbungen auf deine Anzeigen.",
  'verify.title': "E-Mail bestätigen",
  'verify.lead': "Firebase sendet den Aktivierungslink an:",
  'verify.tipsTitle': "Keine E-Mail?",
  'verify.tip1': "• Prüfe Spam, Angebote und Alle Nachrichten (Gmail).",
  'verify.tip2': "• Suche Absender ähnlich:",
  'verify.tip3': "• Tippfehler bei der Registrierung prüfen.",
  'verify.tip4': "• 2–5 Minuten warten — Zustellung kann verzögert sein.",
  'verify.tip5': "• „E-Mail erneut senden“ (nicht öfter als alle paar Minuten).",
  'verify.tip6': "• Google-Konto braucht das meist nicht — abmelden und mit Google anmelden.",
  'verify.openMail': "E-Mail-App öffnen",
  'verify.checked': "Geprüft — weiter",
  'verify.resend': "E-Mail erneut senden",
  'verify.logoutOther': "Abmelden und anderes Konto",
  'verify.infoInitial': "Nach der Registrierung haben wir einen Link gesendet — Posteingang (und Spam) prüfen.",
  'verify.notYet': "Link noch nicht genutzt. Mail öffnen, Link tippen, hier erneut prüfen.",
  'verify.noEmail': "Keine E-Mail-Adresse am Konto.",
  'verify.resent': "Erneut an {email} gesendet. 1–2 Min. warten und Spam prüfen.",
  'profile.title': "Profil",
  'profile.notFound': "Profil nicht gefunden.",
  'profile.about': "Über mich",
  'profile.noBio': "Keine öffentliche Beschreibung.",
  'profile.rateUser': "Nutzer bewerten",
  'profile.reviewPlaceholder': "Kurze Meinung (optional)",
  'profile.saveReview': "Bewertung speichern",
  'profile.reviews': "Bewertungen",
  'profile.noReviews': "Keine Bewertungen.",
  'profile.editInAccount': "Profil im Konto bearbeiten",
  'profile.completedApplicant': "Abgeschlossen als Ausführender",
  'profile.completedAuthor': "Abgeschlossen als Auftraggeber",
  'profile.reviewSaved': "Bewertung gespeichert. Danke!",
  'profile.reviewFailed': "Bewertung konnte nicht gespeichert werden.",
  'profile.reviewOne': "Bewertung",
  'profile.reviewFew': "Bewertungen",
  'profile.reviewMany': "Bewertungen",
  'account.noSession': "Keine aktive Sitzung.",
  'account.needCompanyMsg': "Firmenname ist erforderlich — erscheint auf Anzeigen.",
  'account.needNameMsg': "Name ist erforderlich — erscheint auf Anzeigen.",
  'account.saved': "Profil gespeichert.",
  'account.loginForPhoto': "Anmelden, um Foto zu ändern.",
  'account.noGallery': "Keine Galerieberechtigung.",
  'account.photoSaved': "Profilfoto gespeichert.",
  'account.photoFailed': "Foto-Upload fehlgeschlagen.",
  'chats.goToMarket': "Zum Markt",
  'chats.newBadge': "Neu",
  'common.userFallback': "Benutzer",
  'profile.rateLocked': "Bewertung erst nach akzeptierter Zusammenarbeit möglich.",
  'profile.updateReview': "Bewertung aktualisieren",
  'profile.deleteReview': "Bewertung löschen",
  'profile.reviewDeleted': "Bewertung gelöscht.",
  'profile.yourReview': "Deine Bewertung",
  'profile.noEligibility': "Keine gemeinsame Zusammenarbeit — Bewertung nicht möglich.",
  'profile.trustTitle': "Vertrauen",
  'account.yourRating': "Deine öffentliche Bewertung",
  'boost.title': "Anzeige boosten",
  'boost.subtitle': "Ein Booster setzt deine Anzeige für begrenzte Zeit nach oben.",
  'boost.days': "{n} Tage",
  'boost.popular': "Beliebt",
  'boost.tierHint': "Mehr Aufrufe · Badge „Hervorgehoben“",
  'boost.buy': "Booster kaufen",
  'boost.mockNote': "MVP: kostenloser Mock (sofort). Später: IAP / RevenueCat.",
  'boost.failed': "Booster konnte nicht aktiviert werden.",
  'boost.denied': "Keine Berechtigung. Bitte Firestore-Regeln deployen.",
  'boost.success': "Booster aktiv für {days} Tage.",
  'boost.cta': "Boosten",
  'boost.badge': "Hervorgehoben",
  'boost.activeUntil': "Hervorgehoben bis {date}",
  'boost.extend': "Booster verlängern",
  'legal.privacyTitle': 'Datenschutzerklärung',
  'legal.privacyLink': 'Datenschutzerklärung',
  'legal.privacyAccept': 'Mit der Registrierung akzeptierst du die Datenschutzerklärung.',
  'legal.openWeb': 'Im Browser öffnen',
  'legal.updated': 'Aktualisiert: {date}',
  'legal.section': 'Rechtliches',
  'tip.gotIt': 'Verstanden',
  'tip.market.title': 'Markt kurz erklärt',
  'tip.market.body':
    'Jobs, Gesuche und Schnellaufträge. Filtern, sortieren — hervorgehobene Anzeigen im Kupferrahmen nach oben.',
  'tip.chats.title': 'Hier klärt ihr die Details',
  'tip.chats.body':
    'Chat aus Bewerbung oder Anzeige. Threads, Hinweise und Verlauf an einem Ort.',
  'tip.account.title': 'Deine Visitenkarte',
  'tip.account.body':
    'Foto, Bio, Bewerbungen und Bewertungen — das sehen andere, bevor sie schreiben.',
  'tip.settings.title': 'Pass es an',
  'tip.settings.body':
    'Stadt, Radius, Sätze, Sprache und Benachrichtigungen. Einmal setzen — der Markt folgt.',
  'tip.reset': 'Tab-Hinweise erneut anzeigen',
  'tip.resetDone': 'Hinweise erscheinen wieder auf den Tabs.',
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
  'settings.notifDevice': 'Systemnotifikationer',
  'settings.notifDeviceSub': 'iOS/Android-tilladelse + Expo Push-token',
  'settings.notifDeviceGranted': 'Aktiveret — token gemt ved login',
  'settings.notifDeviceDenied': 'Afvist — slå til i telefonindstillinger',
  'settings.notifDeviceUnavailable': 'Ikke tilgængelig (simulator / web)',
  'settings.notifEnable': 'Aktiver notifikationer på denne enhed',
  'settings.notifEnableBusy': 'Registrerer…',
  'settings.notifEnableOk': 'Færdig — push er aktiv på denne enhed.',
  'settings.notifEnableFail': 'Mislykkedes. Tjek systemtilladelser.',
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
  'welcome.language': 'Sprog',
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
  'auth.firebaseMissing': 'Firebase er ikke konfigureret.',
  'auth.passwordMinPlaceholder': 'min. {n} tegn',
  'auth.confirmPasswordPlaceholder': 'gentag adgangskode',
  'auth.companyPlaceholder': 'f.eks. WeldPro ApS',
  'auth.namePlaceholder': 'f.eks. Jens Hansen',
  'auth.continueGoogle': 'Fortsæt med Google',
  'auth.googleNeedsBuild': 'kræver build, ikke Expo Go',
  'auth.googleNeedsBuildTitle': 'Build påkrævet',
  'auth.googleNeedsBuildBody':
    'Google-login virker ikke i Expo Go. Installer et EAS-build (IPA/APK) på telefonen.',
  'auth.googleMissingClient': 'mangler Client ID — tryk for vejledning',
  'auth.googleMissingTitle': 'Mangler Google Client ID',
  'auth.googleMissingBody':
    'Sæt EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (og iOS/Android) i .env og EAS Secrets, og byg igen. Bundle-ID: com.theweldersworld.app',
  'auth.err.generic': 'Noget gik galt. Prøv igen.',
  'auth.err.invalidEmail': 'Ugyldig e-mailadresse.',
  'auth.err.userDisabled': 'Denne konto er deaktiveret.',
  'auth.err.userNotFound': 'Ingen konto med denne e-mail.',
  'auth.err.wrongPassword': 'Forkert adgangskode.',
  'auth.err.invalidCredential': 'Forkert e-mail eller adgangskode.',
  'auth.err.emailInUse': 'Denne e-mail er allerede registreret.',
  'auth.err.weakPassword': 'Adgangskoden er for svag.',
  'auth.err.tooManyRequests': 'For mange forsøg. Vent lidt og prøv igen.',
  'auth.err.network': 'Ingen netværksforbindelse.',
  'auth.err.notAllowed': 'Denne loginmetode er deaktiveret i Firebase.',
  'auth.err.missingEmail': 'Angiv en e-mailadresse.',
  'auth.err.differentCredential': 'Kontoen er knyttet til en anden loginmetode.',
  'auth.err.default': 'Handlingen kunne ikke fuldføres.',
  'chats.aboutListing': 'Samtale om opslag',
  'chats.sendFailed': 'Kunne ikke sende beskeden.',
  'chats.imageSendFailed': 'Kunne ikke sende billedet.',
  'chats.attachment': 'Vedhæftning',
  'chats.pickSource': 'Vælg billedkilde',
  'chats.gallery': 'Galleri',
  'chats.camera': 'Kamera',
  'chats.noGalleryAccess': 'Ingen adgang til galleri.',
  'chats.noCameraAccess': 'Ingen adgang til kamera.',
  'chats.loadingMessages': 'Indlæser beskeder…',
  'chats.olderMessages': 'Ældre beskeder…',
  'chats.scrollForHistory': 'Rul op for at hente historik',
  'chats.startConversation': 'Start samtalen',
  'chats.startHint': 'Skriv en besked eller vedhæft et billede.',
  'chats.writeMessage': 'Skriv en besked…',
  'chats.uploadingImage': 'Uploader billede…',
  'chats.addAttachment': 'Tilføj vedhæftning',
  'chats.youPrefix': 'Dig:',
  'auth.login': 'Log ind',
  'auth.register': 'Opret konto',
  'mode.hall': "På stedet",
  'mode.hybrid': "Hybrid",
  'mode.mobile': "Mobil",
  'intent.offer': "Tilbyder",
  'intent.seek': "Søger",
  'market.allFilter': "Alle",
  'market.minRateStrip': "min. {n} PLN/t",
  'market.clearFilters': 'Ryd filtre',
  'market.applyFilters': 'Anvend',
  'market.filterLocation': 'Lokation',
  'market.filterLocationPh': 'By eller sted…',
  'market.filterRadius': 'Radius',
  'market.filterKind': 'Opslagstype',
  'market.kindAll': 'Alle',
  'market.kindStandard': 'Standard',
  'market.kindQuick': 'Hurtige opgaver',
  'market.filterMinRate': 'Min. sats',
  'market.popularCities': 'Populære byer',
  'listing.detailTitle': "Opslagsdetaljer",
  'listing.quickDetailTitle': "Hurtig opgave",
  'listing.notFound': "Opslag ikke fundet",
  'listing.notFoundSub': "Opslaget kan være slettet.",
  'listing.privateListing': "Privat opslag",
  'listing.rateLabel': "Sats: ",
  'listing.budgetLabel': "Budget / sats: ",
  'listing.description': "Beskrivelse",
  'listing.mapTitle': "Hvor opgaven er fra",
  'listing.mapFrom': "Offentliggjort omkring: {place}",
  'listing.mapOpen': "Åbn kort",
  'listing.pickPlaceTitle': "Arbejdssted",
  'listing.pickPlaceHint':
    "Vælg arbejdssted — tryk på kortet (landsby, mindre by, udland) eller skriv nedenfor.",
  'listing.pickPlaceAny':
    "Genveje er større PL-byer. Skriv et hvilket som helst sted i tekstfeltet.",
  'listing.pickPlaceShortcuts': "Hurtigvalg (store byer)",
  'listing.pickPlaceSelected': "Valgt: {place}",
  'listing.pickPlaceEmpty': "Tryk på kortet eller skriv lokation nedenfor",
  'listing.pickPlaceMarker': "Arbejdssted",
  'listing.applySection': "Ansøgning",
  'listing.joinSection': "Deltag i opgaven",
  'listing.alreadyApplied': "Du har allerede ansøgt. Status: {status}.",
  'listing.alreadyJoined': "Du er blandt ansøgerne. Status: {status}.",
  'listing.applyPlaceholder': "Skriv en kort besked til forfatteren...",
  'listing.joinPlaceholder': "Kort: tilgængelighed, kørsel, udstyr…",
  'listing.sending': "Sender...",
  'listing.sendApply': "Send ansøgning",
  'listing.joinSeat': "Deltag (tag plads)",
  'listing.noSlots': "Ingen pladser eller opgaven er afgjort.",
  'listing.messageAuthor': "Skriv til opdragsgiver",
  'listing.editListing': "Rediger opslag",
  'listing.deleteListing': "Slet opslag",
  'listing.candidates': "Kandidater ({count}/5)",
  'listing.applicationsCount': "Ansøgninger ({count})",
  'listing.pickWinnerHint': "Vælg én person — øvrige afvises. Du kan åbne chat før beslutning.",
  'listing.loadingApps': "Indlæser ansøgninger...",
  'listing.noApps': "Ingen ansøgninger til dette opslag.",
  'listing.noSeatsYet': "Ingen har taget plads endnu.",
  'listing.openChat': "Åbn chat",
  'listing.pickThis': "Vælg denne",
  'listing.picking': "Vælger…",
  'listing.you': "Dig",
  'listing.joinedQuick': "Du er med i den hurtige opgave. Vent på valg.",
  'listing.appliedOk': "Ansøgning sendt.",
  'listing.applyFailed': "Kunne ikke sende ansøgningen.",
  'listing.winnerPicked': "Udfører valgt — øvrige afvist.",
  'listing.pickFailed': "Kunne ikke vælge udfører.",
  'listing.chatUnavailable': "Kan ikke åbne chat for dette opslag.",
  'listing.chatFailed': "Kunne ikke åbne samtalen.",
  'listing.phone': "tlf: {phone}",
  'listing.statusPrefix': "Status: {status}",
  'listing.slotsTitle': "Pladser i mikroauktion",
  'listing.slotsAwarded': "Opdragsgiver har valgt.",
  'listing.slotsFull': "5 hurtigste er inde — venter på valg.",
  'listing.slotsFree': "Ledige pladser: {n}. De første 5 kommer ind.",
  'listing.editTitle': "Rediger opslag",
  'listing.editOnlyOwn': "Du kan kun redigere egne opslag.",
  'listing.saving': "Gemmer...",
  'listing.saveChanges': "Gem ændringer",
  'listing.saveEditFailed': "Kunne ikke gemme.",
  'listing.noEditPerm': "Ingen rettighed til at redigere.",
  'listing.needCompanyShort': "Tilføj firmanavn under Konto.",
  'listing.needNameShort': "Tilføj navn under Konto.",
  'listing.loginToAdd': "Log ind for at oprette opslag.",
  'listing.phLocation': "fx Katowice / Schlesien",
  'listing.phLocationAny': "fx Żory, Cieszyn, Ostrava, Berlin…",
  'listing.phDesc': "Omfang, krav, tid, detaljeret sted…",
  'listing.phBudget': "fx 400 — valgfrit",
  'listing.phTags': "TIG 141, Inox, Start snart",
  'listing.phQuickTitle': "fx Svejsning af port — i aften",
  'listing.tagsComma': "Tags (kommasepareret)",
  'duration.hours': "Et par timer",
  'duration.day': "1 dag",
  'duration.days': "Et par dage",
  'duration.week': "En uge",
  'duration.tbd': "Efter aftale",
  'notif.title': "Notifikationer",
  'notif.markRead': "Markér som læst",
  'notif.empty': "Ingen notifikationer. De kommer ved ansøgninger, status og beskeder.",
  'apps.sentTitle': "Alle mine ansøgninger",
  'apps.sentEmpty': "Du har ikke sendt nogen ansøgninger endnu.",
  'apps.incomingTitle': "Alle indkommende ansøgninger",
  'apps.incomingEmpty': "Ingen ansøgninger til dine opslag.",
  'verify.title': "Bekræft e-mail",
  'verify.lead': "Firebase sender aktiveringslinket til:",
  'verify.tipsTitle': "Ser du ikke mailen?",
  'verify.tip1': "• Tjek Spam, Tilbud og Alle mails (Gmail).",
  'verify.tip2': "• Søg afsender lignende:",
  'verify.tip3': "• Tjek stavefejl ved tilmelding.",
  'verify.tip4': "• Vent 2–5 minutter — levering kan forsinkes.",
  'verify.tip5': "• Tryk “Send e-mail igen” (højst hvert par minutter).",
  'verify.tip6': "• Google-konto springer ofte dette over — log ud og ind med Google.",
  'verify.openMail': "Åbn e-mail-app",
  'verify.checked': "Jeg har tjekket — fortsæt",
  'verify.resend': "Send e-mail igen",
  'verify.logoutOther': "Log ud og brug en anden konto",
  'verify.infoInitial': "Efter tilmelding sendte vi et link — tjek indbakke (og Spam).",
  'verify.notYet': "Linket er ikke brugt endnu. Åbn mail, tryk link, vend tilbage og tryk igen.",
  'verify.noEmail': "Ingen e-mail på kontoen.",
  'verify.resent': "Sendt igen til {email}. Vent 1–2 min. og tjek Spam.",
  'profile.title': "Profil",
  'profile.notFound': "Brugerprofil ikke fundet.",
  'profile.about': "Om mig",
  'profile.noBio': "Ingen offentlig beskrivelse.",
  'profile.rateUser': "Bedøm bruger",
  'profile.reviewPlaceholder': "Kort anmeldelse (valgfrit)",
  'profile.saveReview': "Gem anmeldelse",
  'profile.reviews': "Anmeldelser",
  'profile.noReviews': "Ingen anmeldelser.",
  'profile.editInAccount': "Rediger profil under Konto",
  'profile.completedApplicant': "Afsluttet som udfører",
  'profile.completedAuthor': "Afsluttet som opdragsgiver",
  'profile.reviewSaved': "Anmeldelse gemt. Tak!",
  'profile.reviewFailed': "Kunne ikke gemme anmeldelsen.",
  'profile.reviewOne': "anmeldelse",
  'profile.reviewFew': "anmeldelser",
  'profile.reviewMany': "anmeldelser",
  'account.noSession': "Ingen aktiv session.",
  'account.needCompanyMsg': "Firmanavn er påkrævet — vises på dine opslag.",
  'account.needNameMsg': "Fulde navn er påkrævet — vises på dine opslag.",
  'account.saved': "Profil gemt.",
  'account.loginForPhoto': "Log ind for at skifte foto.",
  'account.noGallery': "Ingen galleritilladelse.",
  'account.photoSaved': "Profilfoto gemt.",
  'account.photoFailed': "Kunne ikke uploade foto.",
  'chats.goToMarket': "Gå til Marked",
  'chats.newBadge': "Ny",
  'common.userFallback': "Bruger",
  'profile.rateLocked': "Du kan kun bedømme efter accepteret samarbejde (ansøgning).",
  'profile.updateReview': "Opdater anmeldelse",
  'profile.deleteReview': "Slet anmeldelse",
  'profile.reviewDeleted': "Anmeldelse slettet.",
  'profile.yourReview': "Din anmeldelse",
  'profile.noEligibility': "Intet fælles samarbejde — bedømmelse utilgængelig.",
  'profile.trustTitle': "Tillid",
  'account.yourRating': "Din offentlige bedømmelse",
  'boost.title': "Promovér opslag",
  'boost.subtitle': "En booster flytter dit opslag øverst på markedet i en periode.",
  'boost.days': "{n} dage",
  'boost.popular': "Populær",
  'boost.tierHint': "Flere visninger · “Fremhævet”-badge",
  'boost.buy': "Køb booster",
  'boost.mockNote': "MVP: gratis mock (virker med det samme). Senere: IAP / RevenueCat.",
  'boost.failed': "Kunne ikke aktivere booster.",
  'boost.denied': "Ingen tilladelse. Deploy opdaterede Firestore-regler.",
  'boost.success': "Booster aktiv i {days} dage.",
  'boost.cta': "Promovér",
  'boost.badge': "Fremhævet",
  'boost.activeUntil': "Fremhævet til {date}",
  'boost.extend': "Forlæng booster",
  'legal.privacyTitle': 'Privatlivspolitik',
  'legal.privacyLink': 'Privatlivspolitik',
  'legal.privacyAccept': 'Ved at oprette en konto accepterer du privatlivspolitikken.',
  'legal.openWeb': 'Åbn i browser',
  'legal.updated': 'Opdateret: {date}',
  'legal.section': 'Juridisk',
  'tip.gotIt': 'Forstået',
  'tip.market.title': 'Marked i kort form',
  'tip.market.body':
    'Job, søgning og hurtige opgaver. Filtrer, sorter — fremhævede opslag i kobberramme ligger øverst.',
  'tip.chats.title': 'Her aftaler I detaljerne',
  'tip.chats.body':
    'Åbn chat fra ansøgning eller opslag. Tråde, notifikationer og historik samlet.',
  'tip.account.title': 'Dit visitkort',
  'tip.account.body':
    'Foto, bio, ansøgninger og bedømmelser — det ser andre, før de skriver.',
  'tip.settings.title': 'Tilpas til dig',
  'tip.settings.body':
    'By, radius, satser, sprog og notifikationer. Sæt én gang — markedet følger med.',
  'tip.reset': 'Vis faneblade-tips igen',
  'tip.resetDone': 'Tips vises igen på fanerne.',
  'auth.logout': 'Log ud',
};

export const DICTIONARIES: Record<AppLocale, Dict> = { pl, en, de, da };

export function translate(locale: AppLocale, key: TranslationKey): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.pl[key] ?? key;
}
