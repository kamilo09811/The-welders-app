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

1. [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth client IDs:
   - **Web** → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - **iOS** Bundle ID `com.theweldersworld.app` → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - **Android** package `com.theweldersworld.app` + SHA-1 → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
2. Firebase Authentication → włącz **Google** (Web Client ID / Secret).
3. Lokalnie `.env` + **EAS Secrets** (ważne — poprzedni build bez sekretów = „brak Client ID”):

```powershell
eas secret:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
eas secret:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
eas secret:create --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
```

4. Nowy build (Client ID jest wklejany w czasie buildu):

```powershell
git pull
npm install
npx eas-cli build --platform ios --profile production
```

SHA-1 Android (release): [expo.dev](https://expo.dev) → Credentials → Android.

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
