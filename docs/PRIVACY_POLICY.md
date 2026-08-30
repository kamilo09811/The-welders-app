# Polityka prywatności

## Publiczny URL (App Store Connect)

Po wdrożeniu Firebase Hosting:

**https://theweldersworld-92857.web.app/privacy**

W App Store Connect → App Privacy / Privacy Policy URL wklej ten adres.

## Deploy

```bash
# z katalogu głównego repo
node scripts/generate-privacy-html.js   # jeśli zmieniałeś treść
firebase login
firebase use theweldersworld-92857
firebase deploy --only hosting
```

## W aplikacji

- Ekran: `/legal/privacy`
- Linki: welcome, login, register, Ustawienia, Konto
- Konfiguracja: `lib/legal-config.ts` (nazwa administratora, e-mail, URL)

## Przed publikacją u klienta

Zaktualizuj w `lib/legal-config.ts` (i przegeneruj HTML):

- `controllerName` — pełna nazwa firmy
- `contactEmail` — prawdziwy adres privacy/support
- ewentualnie własną domenę zamiast `*.web.app`
