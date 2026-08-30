import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatarPressable } from '@/components/user-avatar-pressable';
import { localeToBcp47, type TranslationKey } from '@/lib/i18n';
import { applicationStatusLabel, roleLabel } from '@/lib/i18n/labels';
import type { ListingApplication } from '@/lib/listing-applications';
import type { AppLocale } from '@/lib/i18n';
import type { AppColors } from '@/lib/theme';

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

function statusTone(
  status: ListingApplication['status'],
  colors: AppColors
): { bg: string; fg: string } {
  if (status === 'accepted') return { bg: colors.successSoft, fg: colors.success };
  if (status === 'rejected') return { bg: colors.dangerSoft, fg: colors.danger };
  if (status === 'in_progress') return { bg: colors.warningSoft, fg: colors.warning };
  return { bg: colors.primaryMuted, fg: colors.primary };
}

function formatWhen(d: Date | null, locale: AppLocale): string {
  if (!d) return '';
  try {
    return d.toLocaleString(localeToBcp47(locale), { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '';
  }
}

type Props = {
  app: ListingApplication;
  variant: 'sent' | 'incoming';
  colors: AppColors;
  locale: AppLocale;
  t: TFn;
  compact?: boolean;
  onPress: () => void;
};

export function ApplicationListItem({
  app,
  variant,
  colors,
  locale,
  t,
  compact = false,
  onPress,
}: Props) {
  const tone = statusTone(app.status, colors);
  const when = formatWhen(app.createdAt, locale);
  const subtitle =
    variant === 'incoming'
      ? [app.applicantName || t('common.userFallback'), roleLabel(app.applicantRole, t)]
          .filter(Boolean)
          .join(' · ')
      : when;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
        compact && styles.rowCompact,
      ]}>
      {variant === 'incoming' ? (
        <UserAvatarPressable
          userId={app.applicantId}
          avatarUrl={app.applicantAvatarUrl}
          size={compact ? 40 : 46}
        />
      ) : (
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
          <MaterialIcons name="description" size={compact ? 20 : 22} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {app.listingTitle}
          </Text>
          <View style={[styles.status, { backgroundColor: tone.bg }]}>
            <Text style={[styles.statusText, { color: tone.fg }]}>
              {applicationStatusLabel(app.status, t)}
            </Text>
          </View>
        </View>

        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        {app.message.trim() ? (
          <Text style={[styles.message, { color: colors.textSoft }]} numberOfLines={compact ? 1 : 2}>
            {app.message.trim()}
          </Text>
        ) : null}

        {variant === 'incoming' && when ? (
          <Text style={[styles.time, { color: colors.textSoft }]}>{when}</Text>
        ) : null}
      </View>

      <MaterialIcons name="chevron-right" size={22} color={colors.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowCompact: {
    paddingVertical: 10,
    borderRadius: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3, minWidth: 0 },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { flex: 1, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  subtitle: { fontSize: 12, fontWeight: '600' },
  message: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});
