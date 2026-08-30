# Wdrozenie TheWeldersWorld

Instrukcja krok po kroku: Firebase, Google OAuth, zmienne srodowiskowe i buildy EAS.

**Nie umieszczaj sekretow ani pelnych kluczy API w repozytorium.** Uzyj pliku `.env` (lokalnie) i zmiennych w EAS Secrets.

---

## 1. Wymagania lokalne

- Node.js 18+
- `npm install` w katalogu glownym projektu
- `npm install` w katalogu `functions` (przed deployem Cloud Functions)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

---

## 2. Firebase — konsola i projekt

1. Otworz [Firebase Console](https://console.firebase.google.com/) i wybierz projekt **theweldersworld-92857** (lub utworz zgodny z `lib/firebaseConfig.ts`).
2. Wlacz **Authentication** (Email/Password, Google).
3. Utworz baze **Firestore** i **Storage** (region zgodny z regulaminem; funkcja push jest w `europe-west1`).
4. Plan **Blaze** jest wymagany do wdrozenia Cloud Functions (wywolania do `api.expo.dev`).

W repozytorium:

- `firebase.json` — reguly Firestore, indeksy, Storage, Functions
- `firebase/firestore.rules`, `firebase/storage.rules`, `firebase/firestore.indexes.json`
- `.firebaserc` — domyslny projekt: `theweldersworld-92857`

---

## 3. Deploy Firebase (reguly, indeksy, storage, funkcje)

Zaloguj sie i wybierz projekt (jednorazowo):

```powershell
cd C:\Users\Damian\my-app
firebase login
firebase use theweldersworld-92857
```

Deploy (z katalogu glownego):

```powershell
cd C:\Users\Damian\my-app\functions
npm install
cd ..
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

Po sukcesie:

- Reguly Firestore i Storage beda aktywne w projekcie.
- Indeksy zostana utworzone lub zaktualizowane (duze indeksy moga budowac sie kilka minut).
- Funkcje w `europe-west1`:
  - `onApplicationCreatedNotify` / `onApplicationStatusNotify` / `onChatMessageNotify` — tworzą powiadomienia in-app
  - `onInAppNotificationPush` — Expo Push po utworzeniu in-app notification
  - `onUserReviewWrite` — przelicza `ratingAverage` / `ratingCount` na profilu po opinii
  - `boostListing` — wykup boostera ogłoszenia (MVP: `mockPurchase`; klient nie może pisać pól boost)
- Klient nie może tworzyć dokumentów w `users/.../notifications` (tylko Cloud Functions).
- Pola `boostedUntil` / `boostTier` / `boostedAt` / `boostProductId` na `listings`:
  - preferowany zapis przez Cloud Function `boostListing`
  - MVP fallback: autor może zapisać te pola sam (reguła `validListingBoostSelfUpdate`) gdy CF nie jest wdrożona
  - po podłączeniu IAP usuń fallback i zostaw tylko CF

Jesli pojawi sie **401 / invalid authentication**: uruchom ponownie `firebase login` i sprobuj deploy jeszcze raz.

---

## 4. Zmienne srodowiskowe (`.env`)

Skopiuj szablon:

```powershell
copy .env.example .env
```

Uzupelnij wartosci (opis w `.env.example`). Wszystkie uzywane prefiksy:

| Zmienna | Opis |
|---------|------|
| `EXPO_PUBLIC_FIREBASE_*` | Opcjonalne nadpisanie konfiguracji z `lib/firebaseConfig.ts` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth 2 — klient typu Web application |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth 2 — klient iOS (Bundle ID) |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | OAuth 2 — klient Android (package + SHA-1) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | UUID projektu Expo (push); w `app.json` jest juz `extra.eas.projectId` |

Dla buildow produkcyjnych ustaw te same zmienne w [EAS Secrets](https://docs.expo.dev/build-reference/variables/).

---

## 5. Google Cloud — OAuth 2.0

1. [Google Cloud Console](https://console.cloud.google.com/) — ten sam projekt co Firebase (lub polaczony).
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Skonfiguruj ekran zgody OAuth (OAuth consent screen), jesli jeszcze nie jest gotowy.

### Klienty (zgodnie z `lib/googleOAuthConfig.ts`)

| Typ | Ustawienia |
|-----|------------|
| **Web application** | Client ID → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`; w Firebase Auth → Google wlacz i podaj ten sam Web Client ID / Secret wedlug dokumentacji Firebase. |
| **iOS** | Bundle ID: **`com.theweldersworld.app`** (z `app.config.js`) → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` |
| **Android** | Package name: **`com.theweldersworld.app`** + **SHA-1** certyfikatu → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` |

### SHA-1 (Android)

**Debug** (lokalny dev):

```powershell
cd C:\Users\Damian\my-app
npx expo prebuild --platform android
# lub keytool dla domyslnego debug keystore Android Studio
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Release** (EAS): po pierwszym buildzie produkcyjnym wez SHA-1 z [expo.dev](https://expo.dev) → Credentials → Android i dodaj w Google Cloud do klienta Android.

Blad `invalid_client` na urzadzeniu zwykle oznacza zly SHA-1, zly package lub brak osobnego klienta Android/iOS.

---

## 6. Identyfikatory aplikacji (EAS / sklepy)

W `app.config.js` (nadpisuje `app.json`):

- **iOS** `bundleIdentifier`: `com.theweldersworld.app`
- **Android** `package`: `com.theweldersworld.app`
- Plugin **expo-notifications** (ikona, kolor `#0E4AA4`, tryb production)

EAS Project ID w `app.json`: `extra.eas.projectId` — mozna tez ustawic `EXPO_PUBLIC_EAS_PROJECT_ID`.

---

## 7. Buildy EAS

Zainstaluj CLI i zaloguj sie:

```powershell
npm install -g eas-cli
eas login
```

Profil **preview** (dystrybucja wewnetrzna, APK/IPA do testow):

```powershell
cd C:\Users\Damian\my-app
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

Profil **production** (autoIncrement wersji, pod sklepy):

```powershell
eas build --profile production --platform android
eas build --profile production --platform ios
```

Wysylka do sklepow (po udanym buildzie):

```powershell
eas submit --profile production --platform android
eas submit --profile production --platform ios
```

Upewnij sie, ze zmienne `EXPO_PUBLIC_*` sa ustawione w EAS dla profilu production/preview.

---

## 8. Weryfikacja lokalna (bez urzadzenia)

```powershell
cd C:\Users\Damian\my-app
npm install
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

Eksport web trafia do katalogu `dist`. Ostatni udany eksport obejmowal m.in. trasy: `/`, `/login`, `/register`, `/explore`, `/account`, `/listing/new`, `/listing/[id]`, `/messages`, `/notifications`, `/applications/*`, `/verify-email`, `/user/[id]`.

---

## 9. Kolejnosc dla nowego srodowiska

1. Firebase Console (Auth, Firestore, Storage, Blaze)
2. `firebase login` + deploy reguly/indeksy/storage/functions
3. Google OAuth (Web + iOS + Android + SHA-1)
4. `.env` lokalnie + EAS Secrets (`EXPO_PUBLIC_GOOGLE_*`)
5. `eas build --profile preview` / `production`
6. Test logowania Google i push na fizycznym urzadzeniu

Po udanym buildzie iOS zobacz tez **`docs/POST_BUILD.md`** (checklista Functions + Google Secrets + test push).

### EAS Secrets (Google) — wymagane przed buildem z logowaniem Google

```powershell
eas secret:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
eas secret:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
eas secret:create --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
```

Bez tych zmiennych w buildzie przycisk Google pokaze „brak Client ID”.
