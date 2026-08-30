/** Przybliżone współrzędne większych miast PL — do filtra zasięgu bez GPS. */

export type PlCity = {
  name: string;
  lat: number;
  lng: number;
};

/** Posortowane od najdłuższych nazw — lepsze dopasowanie substringów (np. „Bielsko-Biała” przed „Biała”). */
export const PL_CITIES: PlCity[] = [
  { name: 'Bielsko-Biała', lat: 49.8225, lng: 19.0444 },
  { name: 'Jastrzębie-Zdrój', lat: 49.9554, lng: 18.5748 },
  { name: 'Gorzów Wielkopolski', lat: 52.7368, lng: 15.2288 },
  { name: 'Dąbrowa Górnicza', lat: 50.3217, lng: 19.1876 },
  { name: 'Zielona Góra', lat: 51.9356, lng: 15.5062 },
  { name: 'Wałbrzych', lat: 50.784, lng: 16.284 },
  { name: 'Rzeszów', lat: 50.0413, lng: 21.999 },
  { name: 'Białystok', lat: 53.1325, lng: 23.1688 },
  { name: 'Częstochowa', lat: 50.7969, lng: 19.1241 },
  { name: 'Katowice', lat: 50.2649, lng: 19.0238 },
  { name: 'Sosnowiec', lat: 50.2863, lng: 19.1041 },
  { name: 'Gliwice', lat: 50.2945, lng: 18.6714 },
  { name: 'Zabrze', lat: 50.3249, lng: 18.7857 },
  { name: 'Bytom', lat: 50.3484, lng: 18.9157 },
  { name: 'Ruda Śląska', lat: 50.2558, lng: 18.8556 },
  { name: 'Tychy', lat: 50.1372, lng: 18.9665 },
  { name: 'Rybnik', lat: 50.0971, lng: 18.5418 },
  { name: 'Chorzów', lat: 50.2976, lng: 18.9548 },
  { name: 'Warszawa', lat: 52.2297, lng: 21.0122 },
  { name: 'Kraków', lat: 50.0647, lng: 19.945 },
  { name: 'Łódź', lat: 51.7592, lng: 19.456 },
  { name: 'Wrocław', lat: 51.1079, lng: 17.0385 },
  { name: 'Poznań', lat: 52.4064, lng: 16.9252 },
  { name: 'Gdańsk', lat: 54.352, lng: 18.6466 },
  { name: 'Szczecin', lat: 53.4285, lng: 14.5528 },
  { name: 'Bydgoszcz', lat: 53.1235, lng: 18.0084 },
  { name: 'Lublin', lat: 51.2465, lng: 22.5684 },
  { name: 'Gdynia', lat: 54.5189, lng: 18.5305 },
  { name: 'Radom', lat: 51.4027, lng: 21.1471 },
  { name: 'Toruń', lat: 53.0138, lng: 18.5984 },
  { name: 'Kielce', lat: 50.8661, lng: 20.6286 },
  { name: 'Olsztyn', lat: 53.7784, lng: 20.4801 },
  { name: 'Opole', lat: 50.6751, lng: 17.9213 },
  { name: 'Płock', lat: 52.5463, lng: 19.706 },
  { name: 'Elbląg', lat: 54.1561, lng: 19.4045 },
  { name: 'Koszalin', lat: 54.1943, lng: 16.1715 },
  { name: 'Słupsk', lat: 54.4641, lng: 17.0285 },
  { name: 'Legnica', lat: 51.207, lng: 16.1619 },
  { name: 'Grudziądz', lat: 53.4839, lng: 18.7537 },
  { name: 'Jaworzno', lat: 50.205, lng: 19.274 },
  { name: 'Jelenia Góra', lat: 50.9044, lng: 15.7344 },
  { name: 'Nowy Sącz', lat: 49.621, lng: 20.697 },
  { name: 'Tarnów', lat: 50.012, lng: 20.985 },
  { name: 'Kalisz', lat: 51.761, lng: 18.091 },
].sort((a, b) => b.name.length - a.name.length);

const CITY_BY_LOWER = new Map(PL_CITIES.map((c) => [c.name.toLowerCase(), c]));

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Wyciąga znane miasto z wolnego tekstu lokalizacji (np. „Katowice / Śląsk”). */
export function resolvePlCity(locationText: string): PlCity | null {
  const raw = locationText.trim().toLowerCase();
  if (!raw) return null;
  const exact = CITY_BY_LOWER.get(raw);
  if (exact) return exact;
  for (const city of PL_CITIES) {
    const n = city.name.toLowerCase();
    if (raw.includes(n)) return city;
  }
  return null;
}

/** Najbliższe miasto z listy do punktu na mapie. */
export function nearestPlCity(lat: number, lng: number): PlCity {
  let best = PL_CITIES[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const city of PL_CITIES) {
    const d = haversineKm({ lat, lng }, city);
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  return best;
}

export type RadiusSetting = '25 km' | '50 km' | '100 km' | 'Cała Polska';

export function radiusToKm(radius: RadiusSetting): number | null {
  if (radius === 'Cała Polska') return null;
  if (radius === '25 km') return 25;
  if (radius === '50 km') return 50;
  if (radius === '100 km') return 100;
  return null;
}

/**
 * Filtr lokalizacji z ustawień.
 * - brak miasta bazowego lub „Cała Polska” → przepuszczamy wszystko
 * - obie lokalizacje rozpoznane → dystans ≤ radius
 * - nierozpoznane → fallback: substring miasta bazowego w tekście lokalizacji
 */
export function matchesLocationPreference(
  listingLocation: string,
  baseCity: string,
  radius: RadiusSetting
): boolean {
  const city = baseCity.trim();
  if (!city) return true;
  const maxKm = radiusToKm(radius);
  if (maxKm == null) return true;

  const base = resolvePlCity(city) ?? resolvePlCity(city.split(/[/,–-]/)[0] ?? city);
  const listing = resolvePlCity(listingLocation);

  if (base && listing) {
    return haversineKm(base, listing) <= maxKm;
  }

  return listingLocation.toLowerCase().includes(city.toLowerCase());
}
