import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TranslationKey } from '@/lib/i18n';
import { usePreferences } from '@/lib/preferences-context';
import type { TabTipId } from '@/lib/user-settings';

const TIP_COPY: Record<TabTipId, { title: TranslationKey; body: TranslationKey; icon: keyof typeof MaterialIcons.glyphMap }> = {
  market: { title: 'tip.market.title', body: 'tip.market.body', icon: 'work-outline' },
  chats: { title: 'tip.chats.title', body: 'tip.chats.body', icon: 'forum' },
  account: { title: 'tip.account.title', body: 'tip.account.body', icon: 'badge' },
  settings: { title: 'tip.settings.title', body: 'tip.settings.body', icon: 'tune' },
};

type Props = {
  tipId: TabTipId;
};

/**
 * Jednorazowa podpowiedź na zakładce — znika po „OK” i zapisuje się w settings użytkownika.
 */
export function TabTipCard({ tipId }: Props) {
  const { settings, loading, colors, t, dismissTabTip } = usePreferences();

  if (loading) return null;
  if (settings.dismissedTabTips.includes(tipId)) return null;

  const copy = TIP_COPY[tipId];

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.border,
        },
      ]}>
      <View style={[styles.rail, { backgroundColor: colors.primary }]} />
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={[styles.iconWrap, { backgroundColor: colors.card }]}>
            <MaterialIcons name={copy.icon} size={18} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t(copy.title)}</Text>
          <Pressable
            onPress={() => void dismissTabTip(tipId)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('tip.gotIt')}>
            <MaterialIcons name="close" size={18} color={colors.textSoft} />
          </Pressable>
        </View>
        <Text style={[styles.text, { color: colors.textMuted }]}>{t(copy.body)}</Text>
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => void dismissTabTip(tipId)}>
          <Text style={styles.btnText}>{t('tip.gotIt')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },
  rail: { width: 4 },
  body: { flex: 1, padding: 12, gap: 8 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 14, fontWeight: '800' },
  text: { fontSize: 13, lineHeight: 19 },
  btn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 2,
  },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
});
