# Monetyzacja — od mocka do prawdziwych wpłat

Boostery ogłoszeń to **cyfrowe dobra w aplikacji**. Na iOS/Android **nie wolno** brać płatności za to Stripe’em / Przelewy24 w appce — trzeba **In‑App Purchase** (App Store / Google Play). Web może iść osobno (Stripe).

## Docelowy stack (rekomendacja)

1. **RevenueCat** — wspólna warstwa nad StoreKit + Google Play Billing  
2. Produkty consumable: `boost_3d`, `boost_7d`, `boost_14d` (już w `lib/listing-boost.ts`)  
3. Cloud Function `boostListing` — **jedyny** zapis `boostedUntil` po weryfikacji zakupu  
4. Firestore rules — **zablokować** client write pól boost (usunąć `validListingBoostSelfUpdate`)

## Kroki wdrożenia

### 1. Konta sklepów
- Apple Developer + App Store Connect → In‑App Purchases (Consumable)  
- Google Play Console → One-time products  
- Te same product ID co w kodzie: `boost_3d` / `boost_7d` / `boost_14d`

### 2. RevenueCat
- Projekt + apps iOS/Android  
- Podpiąć Shared Secret (Apple) i service account (Google)  
- Entitlements opcjonalnie; dla consumable wystarczą produkty + webhook / REST

### 3. Aplikacja (Expo)
```bash
npx expo install react-native-purchases
```
- Init SDK kluczem `EXPO_PUBLIC_REVENUECAT_*`  
- W `BoostListingSheet`: zamiast `mockPurchase` → `Purchases.purchaseProduct(productId)`  
- Po sukcesie: `purchaseListingBoost(listingId, tier, { receipt / customerInfo })` **bez** `mockPurchase`

### 4. Backend (Cloud Function)
W `boostListing`:
1. Wymagaj auth + `listingId` + `tier`  
2. **Nie** akceptuj `mockPurchase` na produkcji  
3. Zweryfikuj zakup przez RevenueCat REST (customer / transaction) albo webhook  
4. Dopiero wtedy ustaw `boostedUntil` / `boostTier` (Admin SDK)  
5. Zapisz `purchases/{id}` (uid, listingId, productId, storeTransactionId) — anty‑replay

### 5. Reguły Firestore
Po IAP:
- create listing: bez pól boost  
- update: `listingBoostFieldsUntouched()` zawsze  
- usunąć `validListingBoostSelfUpdate` i client fallback w `lib/listing-boost.ts`

### 6. Pieniądze
- Apple / Google pobierają prowizję (~15–30%)  
- Wypłaty: App Store Connect / Play Console → konto bankowe  
- RevenueCat nie trzyma Twoich pieniędzy — tylko orkiestruje IAP

## Czego unikać
- Stripe Checkout **w** aplikacji mobilnej za boost (ryzyko odrzucenia / ban)  
- Zaufanie samemu klientowi („zapłaciłem” → sam zapisuje boost)  
- Non‑consumable na booster (używaj **consumable** — można kupić wiele razy)

## MVP dziś vs produkcja

| | MVP (teraz) | Produkcja |
|---|---|---|
| Płatność | mock / client write | Store IAP via RevenueCat |
| Zapis boost | client lub CF | tylko CF po weryfikacji |
| Reguły | autor może ustawić boost | pola boost zablokowane |
