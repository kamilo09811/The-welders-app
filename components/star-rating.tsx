import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  /** Dla średniej — pokazuje półgwiazdki (tylko tryb odczytu). */
  allowHalf?: boolean;
};

export function StarRating({ value, onChange, size = 28, allowHalf = true }: Props) {
  const interactive = Boolean(onChange);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        let iconName: 'star' | 'star-half' | 'star-border' = 'star-border';
        if (interactive || !allowHalf) {
          iconName = star <= Math.round(value) ? 'star' : 'star-border';
        } else if (value >= star) {
          iconName = 'star';
        } else if (value >= star - 0.5) {
          iconName = 'star-half';
        }

        const icon = (
          <MaterialIcons name={iconName} size={size} color={iconName === 'star-border' ? '#CBD5E1' : '#F59E0B'} />
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
