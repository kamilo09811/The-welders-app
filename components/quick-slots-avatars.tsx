import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuickSlotApplicant } from '@/lib/market-listings';
import { QUICK_SLOT_MAX } from '@/lib/market-listings';

type Props = {
  applicants: QuickSlotApplicant[];
  max?: number;
  size?: number;
  onPressSlot?: (applicant: QuickSlotApplicant | null, index: number) => void;
};

/** Pasek 5 slotów awatarów — zapełnione + puste miejsca. */
export function QuickSlotsAvatars({ applicants, max = QUICK_SLOT_MAX, size = 40, onPressSlot }: Props) {
  const slots = Array.from({ length: max }, (_, i) => applicants[i] ?? null);

  return (
    <View style={styles.row}>
      {slots.map((slot, index) => {
        const inner = (
          <View
            key={slot?.uid || `empty-${index}`}
            style={[
              styles.slot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                marginLeft: index === 0 ? 0 : -size * 0.22,
                zIndex: max - index,
              },
              !slot && styles.slotEmpty,
            ]}>
            {slot?.avatarUrl ? (
              <Image source={{ uri: slot.avatarUrl }} style={styles.fill} contentFit="cover" />
            ) : slot ? (
              <MaterialIcons name="person" size={size * 0.45} color="#0E4AA4" />
            ) : (
              <Text style={[styles.emptyIndex, { fontSize: size * 0.28 }]}>{index + 1}</Text>
            )}
          </View>
        );
        if (!onPressSlot) return inner;
        return (
          <Pressable key={slot?.uid || `empty-${index}`} onPress={() => onPressSlot(slot, index)}>
            {inner}
          </Pressable>
        );
      })}
      <Text style={styles.count}>
        {Math.min(applicants.length, max)}/{max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  slot: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slotEmpty: {
    backgroundColor: '#F1F5F9',
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  fill: { width: '100%', height: '100%' },
  emptyIndex: { color: '#94A3B8', fontWeight: '700' },
  count: { marginLeft: 10, color: '#64748B', fontSize: 12, fontWeight: '700' },
});
