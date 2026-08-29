import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BOOST_TIERS, purchaseListingBoost, type BoostTierId } from '@/lib/listing-boost';
import type { TranslationKey } from '@/lib/i18n';
import type { AppColors } from '@/lib/theme';

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

type Props = {
  visible: boolean;
  listingId: string;
  colors: AppColors;
  t: TFn;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function BoostListingSheet({ visible, listingId, colors, t, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<BoostTierId>('7d');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onBuy = useCallback(async () => {
    if (!listingId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const tier = BOOST_TIERS.find((x) => x.id === selected);
      await purchaseListingBoost(listingId, selected);
      onSuccess(t('boost.success', { days: tier?.days ?? 7 }));
      onClose();
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      if (code === 'permission-denied' || code === 'functions/permission-denied') {
        setError(t('boost.denied'));
      } else {
        setError(t('boost.failed'));
      }
    } finally {
      setBusy(false);
    }
  }, [busy, listingId, onClose, onSuccess, selected, t]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.bgElevated }]}>
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.title, { color: colors.text }]}>{t('boost.title')}</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>{t('boost.subtitle')}</Text>

          <View style={styles.tiers}>
            {BOOST_TIERS.map((tier) => {
              const active = selected === tier.id;
              return (
                <Pressable
                  key={tier.id}
                  onPress={() => setSelected(tier.id)}
                  style={[
                    styles.tier,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primaryMuted : colors.card,
                    },
                  ]}>
                  <View style={styles.tierTop}>
                    <Text style={[styles.tierDays, { color: colors.text }]}>
                      {t('boost.days', { n: tier.days })}
                    </Text>
                    {tier.id === '7d' ? (
                      <Text style={[styles.popular, { color: colors.primary }]}>{t('boost.popular')}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.tierPrice, { color: colors.primary }]}>{tier.pricePln}</Text>
                  <Text style={[styles.tierHint, { color: colors.textSoft }]}>{t('boost.tierHint')}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.mockNote, { color: colors.textSoft }]}>{t('boost.mockNote')}</Text>
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <Pressable
            style={[styles.buyBtn, { backgroundColor: colors.primary }, busy && styles.buyDisabled]}
            disabled={busy}
            onPress={() => void onBuy()}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="rocket-launch" size={18} color="#FFFFFF" />
                <Text style={styles.buyText}>{t('boost.buy')}</Text>
              </>
            )}
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 13, lineHeight: 19 },
  tiers: { gap: 8, marginTop: 6 },
  tier: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  tierTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tierDays: { fontSize: 16, fontWeight: '800' },
  popular: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tierPrice: { fontSize: 18, fontWeight: '800' },
  tierHint: { fontSize: 12 },
  mockNote: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  error: { fontSize: 13, textAlign: 'center' },
  buyBtn: {
    marginTop: 6,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyDisabled: { opacity: 0.7 },
  buyText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  cancelBtn: { alignSelf: 'center', paddingVertical: 8 },
  cancelText: { fontWeight: '600' },
});
