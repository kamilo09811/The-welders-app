import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { TranslationKey } from '@/lib/i18n';
import { resolvePlCity } from '@/lib/pl-cities';
import type { AppColors } from '@/lib/theme';

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

type Props = {
  locationText: string;
  colors: AppColors;
  t: TFn;
  /** Podkreślenie dla szybkiego zlecenia / mikrolicytacji. */
  emphasize?: boolean;
};

function staticMapUri(lat: number, lng: number) {
  // Publiczny static map OSM — fallback (web / gdy MapView niedostępny).
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=11&size=640x320&maptype=mapnik&markers=${lat},${lng},lightblue1`;
}

function mapsUrl(lat: number, lng: number, label: string) {
  const q = encodeURIComponent(label);
  if (Platform.OS === 'ios') {
    return `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Mała mapka lokalizacji ogłoszenia — miasto z PL_CITIES (przybliżone współrzędne).
 */
export function ListingLocationMap({ locationText, colors, t, emphasize }: Props) {
  const city = useMemo(() => resolvePlCity(locationText), [locationText]);

  if (!city) return null;

  const region = {
    latitude: city.lat,
    longitude: city.lng,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
  };

  const openExternal = () => {
    void Linking.openURL(mapsUrl(city.lat, city.lng, city.name));
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
        <Text style={[styles.title, { color: colors.text }]}>{t('listing.mapTitle')}</Text>
      </View>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        {t('listing.mapFrom', { place: city.name })}
      </Text>

      <Pressable onPress={openExternal} style={styles.mapPress}>
        {Platform.OS === 'web' ? (
          <Image
            source={{ uri: staticMapUri(city.lat, city.lng) }}
            style={styles.map}
            resizeMode="cover"
          />
        ) : (
          <MapView
            style={styles.map}
            region={region}
            pointerEvents="none"
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}>
            <Marker
              coordinate={{ latitude: city.lat, longitude: city.lng }}
              title={city.name}
              description={locationText}
            />
          </MapView>
        )}
        <View style={[styles.mapHint, { backgroundColor: colors.overlay }]}>
          <MaterialIcons name="open-in-new" size={14} color="#FFFFFF" />
          <Text style={styles.mapHintText}>{t('listing.mapOpen')}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 12, lineHeight: 17 },
  mapPress: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
    height: 148,
  },
  map: { width: '100%', height: '100%' },
  mapHint: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapHintText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
