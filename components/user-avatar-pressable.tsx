import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  userId: string;
  avatarUrl?: string;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
};

/** Awatar otwierający publiczny profil użytkownika. */
export function UserAvatarPressable({ userId, avatarUrl, size = 42, style, disabled }: Props) {
  const router = useRouter();
  if (!userId || disabled) {
    return (
      <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }, style]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.fill} contentFit="cover" />
        ) : (
          <MaterialIcons name="person" size={size * 0.45} color="#64748B" />
        )}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Otwórz profil użytkownika"
      onPress={() => router.push({ pathname: '/user/[id]', params: { id: userId } })}
      style={({ pressed }) => [
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, opacity: pressed ? 0.85 : 1 },
        style,
      ]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.fill} contentFit="cover" />
      ) : (
        <MaterialIcons name="person" size={size * 0.45} color="#64748B" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DFE6F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: { width: '100%', height: '100%' },
});
