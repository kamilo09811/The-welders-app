import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps';

import type { TranslationKey } from '@/lib/i18n';
import {
  nearestPlCity,
  PL_CITIES,
  resolvePlCity,
} from '@/lib/pl-cities';
import type { AppColors } from '@/lib/theme';

export type LocationPick = {
  label: string;
  lat: number | null;
  lng: number | null;
};

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

type Props = {
  value: string;
  coords: { lat: number; lng: number } | null;
  onChange: (next: LocationPick) => void;
  colors: AppColors;
  t: TFn;
  emphasize?: boolean;
};

const SUGGESTIONS = [...PL_CITIES]
  .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
  .slice(0, 16);

function staticMapUri(lat: number, lng: number) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=11&size=640x320&maptype=mapnik&markers=${lat},${lng},lightblue1`;
}

function formatGeocodeLabel(place: Location.LocationGeocodedAddress): string {
  const locality =
    place.city ||
    place.subregion ||
    place.name ||
    place.street ||
    '';
  const region = place.region && place.region !== locality ? place.region : '';
  const country = place.country || '';
  const parts = [locality, region, country].map((p) => p.trim()).filter(Boolean);
  // Unikaj duplikatów typu „Śląskie, Śląskie”
  return [...new Set(parts)].join(', ') || [place.postalCode, country].filter(Boolean).join(', ');
}

/**
 * Wybór dowolnego miejsca realizacji — mapka (geokodowanie) + wolny tekst + skróty miast.
 */
export function ListingLocationPicker({
  value,
  coords,
  onChange,
  colors,
  t,
  emphasize,
}: Props) {
  const [busy, setBusy] = useState(false);
  const knownCity = useMemo(() => resolvePlCity(value), [value]);

  const pin = useMemo(() => {
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      return { lat: coords.lat, lng: coords.lng };
    }
    if (knownCity) return { lat: knownCity.lat, lng: knownCity.lng };
    const fallback = resolvePlCity('Katowice') ?? PL_CITIES[0];
    return { lat: fallback.lat, lng: fallback.lng };
  }, [coords, knownCity]);

  const [region, setRegion] = useState<Region>({
    latitude: pin.lat,
    longitude: pin.lng,
    latitudeDelta: 0.45,
    longitudeDelta: 0.45,
  });

  useEffect(() => {
    setRegion((prev) => ({
      ...prev,
      latitude: pin.lat,
      longitude: pin.lng,
    }));
  }, [pin.lat, pin.lng]);

  const applyCoords = useCallback(
    async (lat: number, lng: number) => {
      setBusy(true);
      try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const place = results[0];
        const label = place ? formatGeocodeLabel(place) : '';
        if (label) {
          onChange({ label, lat, lng });
          return;
        }
      } catch {
        // fallback poniżej
      } finally {
        setBusy(false);
      }
      const nearest = nearestPlCity(lat, lng);
      onChange({ label: nearest.name, lat: nearest.lat, lng: nearest.lng });
    },
    [onChange]
  );

  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    void applyCoords(latitude, longitude);
  };

  const hasPin = Boolean(coords || knownCity);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.card,
          borderColor: emphasize ? colors.warning : colors.border,
        },
      ]}>
      <View style={styles.head}>
        <MaterialIcons
          name="place"
          size={16}
          color={emphasize ? colors.warning : colors.primary}
        />
        <Text style={[styles.title, { color: colors.text }]}>{t('listing.pickPlaceTitle')}</Text>
        {busy ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t('listing.pickPlaceHint')}</Text>
      <Text style={[styles.subSoft, { color: colors.textSoft }]}>{t('listing.pickPlaceAny')}</Text>

      <View style={styles.mapBox}>
        {Platform.OS === 'web' ? (
          <Image
            source={{ uri: staticMapUri(pin.lat, pin.lng) }}
            style={styles.map}
            resizeMode="cover"
          />
        ) : (
          <MapView style={styles.map} region={region} onPress={onMapPress}>
            {hasPin ? (
              <Marker
                coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                title={value || t('listing.pickPlaceMarker')}
                description={t('listing.pickPlaceMarker')}
              />
            ) : null}
          </MapView>
        )}
      </View>

      <Text style={[styles.selected, { color: colors.primary }]}>
        {value.trim()
          ? t('listing.pickPlaceSelected', { place: value.trim() })
          : t('listing.pickPlaceEmpty')}
      </Text>

      <Text style={[styles.chipsLabel, { color: colors.textSoft }]}>
        {t('listing.pickPlaceShortcuts')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {SUGGESTIONS.map((c) => {
          const active = knownCity?.name === c.name && value.trim() === c.name;
          return (
            <Pressable
              key={c.name}
              onPress={() => onChange({ label: c.name, lat: c.lat, lng: c.lng })}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primaryMuted : colors.inputBg,
                },
              ]}>
              <Text style={[styles.chipText, { color: active ? colors.primary : colors.textMuted }]}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '800', flex: 1 },
  sub: { fontSize: 13, lineHeight: 18 },
  subSoft: { fontSize: 12, lineHeight: 17, marginTop: -4 },
  mapBox: {
    height: 168,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 2,
  },
  map: { width: '100%', height: '100%' },
  selected: { fontSize: 13, fontWeight: '700' },
  chipsLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
});
