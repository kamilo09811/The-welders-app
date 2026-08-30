import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { reviewCountLabel } from '@/lib/i18n/labels';
import type { AppLocale } from '@/lib/i18n';
import type { AppColors } from '@/lib/theme';

type Props = {
  average: number;
  count: number;
  locale: AppLocale;
  colors: AppColors;
  size?: number;
  compact?: boolean;
  onPress?: () => void;
};

function formatAverage(avg: number, locale: AppLocale): string {
  if (!avg) return '—';
  try {
    return avg.toLocaleString(locale === 'en' ? 'en-GB' : locale === 'de' ? 'de-DE' : locale === 'da' ? 'da-DK' : 'pl-PL', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  } catch {
    return avg.toFixed(1);
  }
}

export function TrustBadge({
  average,
  count,
  locale,
  colors,
  size = 16,
  compact = false,
  onPress,
}: Props) {
  const body = (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <StarRating value={average || 0} size={size} />
      <Text style={[styles.text, { color: colors.textMuted }]}>
        {formatAverage(average, locale)}
        {count > 0 ? ` · ${count} ${reviewCountLabel(count, locale)}` : ''}
      </Text>
      {onPress ? <MaterialIcons name="chevron-right" size={18} color={colors.textSoft} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowCompact: { gap: 6 },
  text: { fontSize: 13, fontWeight: '600' },
});
