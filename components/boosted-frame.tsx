import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AppColors } from '@/lib/theme';

type Props = {
  colors: AppColors;
  label: string;
  children: ReactNode;
  /** Kompaktowy wariant na wiersz listy. */
  compact?: boolean;
};

/**
 * Ramka wyróżniająca boosted listing — czytelna niezależnie od pozycji w sortowaniu.
 * Kolory: miedź / stal (atmosfera spawania), nie generyczny „glow”.
 */
export function BoostedFrame({ colors, label, children, compact }: Props) {
  return (
    <View
      style={[
        styles.outer,
        compact ? styles.outerCompact : styles.outerRoomy,
        {
          borderColor: colors.warning,
          backgroundColor: colors.warningSoft,
        },
      ]}>
      <View style={[styles.rail, { backgroundColor: colors.warning }]} />
      <View style={styles.body}>
        <View style={styles.ribbon}>
          <MaterialIcons name="bolt" size={compact ? 14 : 16} color={colors.warning} />
          <Text style={[styles.ribbonText, { color: colors.warning }]}>{label}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  outerCompact: {
    marginVertical: 4,
  },
  outerRoomy: {
    marginBottom: 2,
  },
  rail: {
    width: 5,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ribbonText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
