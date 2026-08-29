# Po udanym buildzie iOS — checklista

Kod powiadomień i Google Sign-In jest w aplikacji. Żeby działały na telefonie,
trzeba dokończyć konfigurację w konsolach i (dla Google) **przebudować** IPA
z Client ID w EAS Secrets.

## 1. Firebase Cloud Functions (powiadomienia)

Bez tego: centrum powiadomień w aplikacji będzie puste, push nie wyjdzie.

```powershell
cd C:\Users\Damian\my-app\functions
npm install
cd ..
firebase login
firebase use theweldersworld-92857
firebase deploy --only functions,firestore:rules,firestore:indexes,storage
```

Wymaga planu **Blaze**. Funkcje: `onApplicationCreatedNotify`, `onApplicationStatusNotify`,
`onChatMessageNotify`, `onListingCreatedNotify`, `onInAppNotificationPush`.

## 2. Google Sign-In

**Web Client ID** jest już w repo (`eas.json` + `lib/googleOAuthConfig.ts`):
`893817844292-bl2sjnatles76gj9nmf0vo7si5pbqcm5.apps.googleusercontent.com`

1. Firebase Authentication → włącz **Google** i podaj ten sam Web Client ID (+ Secret z konsoli Google).
2. Zalecane: osobny klient **iOS** (Bundle ID `com.theweldersworld.app`) → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` w `.env` / EAS.
3. Android: klient z package `com.theweldersworld.app` + SHA-1.
4. Lokalnie w `.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=893817844292-bl2sjnatles76gj9nmf0vo7si5pbqcm5.apps.googleusercontent.com
```

5. Nowy build (poprzedni IPA nie miał Client ID):

```powershell
git pull
npm install
npx eas-cli build --platform ios --profile production
```

SHA-1 Android (release): [expo.dev](https://expo.dev) → Credentials → Android.
Przy błędzie `invalid_client` na iPhonie utwórz osobny OAuth client typu **iOS**.

## 3. Push na urządzeniu

1. Zainstaluj IPA (TestFlight / internal).
2. Zaloguj się, zaakceptuj uprawnienie powiadomień.
3. Ustawienia → „Włącz powiadomienia na tym urządzeniu”.
4. W Firestore sprawdź `users/{uid}/meta/push` → pole `expoPushToken` (`ExponentPushToken[...]`).
5. Wyślij wiadomość / zgłoszenie z drugiego konta — powinno pojawić się in-app + push.

## 4. Szybki test

| Funkcja | Jak sprawdzić |
|---------|----------------|
| Google | Przycisk bez podpowiedzi „brak Client ID”; logowanie otwiera Google i wraca do app |
| Push token | Dokument `meta/push` po zalogowaniu |
| In-app | `/notifications` po nowej wiadomości / zgłoszeniu |
| Deep link | Tap w push → czat lub ogłoszenie |

Szczegóły: `docs/DEPLOYMENT.md`, `firebase/PUSH_AND_EMAIL_SETUP.txt`.
