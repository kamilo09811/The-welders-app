import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 28 }: Props) {
  const interactive = Boolean(onChange);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const icon = (
          <MaterialIcons
            name={filled ? 'star' : 'star-border'}
            size={size}
            color={filled ? '#F59E0B' : '#CBD5E1'}
          />
        );
        if (!interactive) return <View key={star}>{icon}</View>;
        return (
          <Pressable key={star} onPress={() => onChange?.(star)} hitSlop={6}>
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
});
