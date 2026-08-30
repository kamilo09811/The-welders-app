import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';

import type { TranslationKey } from '@/lib/i18n';
import {
  nearestPlCity,
  PL_CITIES,
  resolvePlCity,
  type PlCity,
} from '@/lib/pl-cities';
import type { AppColors } from '@/lib/theme';

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

type Props = {
  value: string;
  onChange: (cityName: string) => void;
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

/**
 * Wybór miejsca realizacji zlecenia — mapka + snap do miasta PL.
 */
export function ListingLocationPicker({ value, onChange, colors, t, emphasize }: Props) {
  const city: PlCity | null = useMemo(() => resolvePlCity(value), [value]);
  const center = city ?? resolvePlCity('Katowice') ?? PL_CITIES[0];

  const region = {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: 0.35,
    longitudeDelta: 0.35,
  };

  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const nearest = nearestPlCity(latitude, longitude);
    onChange(nearest.name);
  };

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
      </View>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t('listing.pickPlaceHint')}</Text>

      <View style={styles.mapBox}>
        {Platform.OS === 'web' ? (
          <Pressable
            onPress={() => {
              /* web: wybór przez chipy */
            }}
            style={styles.map}>
            <Image
              source={{ uri: staticMapUri(center.lat, center.lng) }}
              style={styles.map}
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <MapView style={styles.map} region={region} onPress={onMapPress}>
            {city ? (
              <Marker
                coordinate={{ latitude: city.lat, longitude: city.lng }}
                title={city.name}
                description={t('listing.pickPlaceMarker')}
              />
            ) : null}
          </MapView>
        )}
      </View>

      <Text style={[styles.selected, { color: colors.primary }]}>
        {city ? t('listing.pickPlaceSelected', { place: city.name }) : t('listing.pickPlaceEmpty')}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {SUGGESTIONS.map((c) => {
          const active = city?.name === c.name;
          return (
            <Pressable
              key={c.name}
              onPress={() => onChange(c.name)}
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
  mapBox: {
    height: 168,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 2,
  },
  map: { width: '100%', height: '100%' },
  selected: { fontSize: 13, fontWeight: '700' },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
});
