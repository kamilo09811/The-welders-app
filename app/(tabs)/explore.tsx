import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getPushPermissionStatus,
  saveExpoPushToken,
  type PushPermissionStatus,
} from '@/lib/expo-push';
import { APP_LOCALES } from '@/lib/i18n';
import { workModeLabel } from '@/lib/i18n/labels';
import type { WorkMode } from '@/lib/market-listings';
import { PL_CITIES } from '@/lib/pl-cities';
import { usePreferences } from '@/lib/preferences-context';
import type { AppColors } from '@/lib/theme';
import { getHeaderGradient } from '@/lib/theme';
import { useCurrentUserProfile } from '@/lib/user-profile';
import {
  type SettingsIntentPref,
  type SettingsRadius,
  type SettingsSort,
  type UserSettings,
} from '@/lib/user-settings';

const RADIUS_VALUES: SettingsRadius[] = ['25 km', '50 km', '100 km', 'Cała Polska'];
const MODE_OPTIONS: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const CITY_SUGGESTIONS = [...new Set(PL_CITIES.map((c) => c.name))].sort((a, b) =>
  a.localeCompare(b, 'pl')
);

function Pill({
  active,
  label,
  onPress,
  colors,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  colors: AppColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: colors.border, backgroundColor: colors.card },
        active && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}>
      <Text style={[styles.pillText, { color: colors.textMuted }, active && { color: '#FFFFFF' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
  colors,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
  colors: AppColors;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: colors.primaryMuted }]}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSub, { color: colors.textSoft }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.borderStrong }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { uid, profile } = useCurrentUserProfile();
  const { settings, loading, colors, t, theme, locale, saveSettings, setTheme, setLocale } =
    usePreferences();
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCityHints, setShowCityHints] = useState(false);
  const [pushStatus, setPushStatus] = useState<PushPermissionStatus>('undetermined');
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    setDraft(settings);
  }, [isEditing, settings]);

  useEffect(() => {
    void getPushPermissionStatus().then(setPushStatus);
  }, []);

  const pushStatusLabel = useMemo(() => {
    if (pushStatus === 'granted') return t('settings.notifDeviceGranted');
    if (pushStatus === 'denied') return t('settings.notifDeviceDenied');
    if (pushStatus === 'unavailable') return t('settings.notifDeviceUnavailable');
    return t('settings.notifDeviceSub');
  }, [pushStatus, t]);

  const onEnablePush = useCallback(async () => {
    if (!uid || pushBusy) return;
    setPushBusy(true);
    setMessage(null);
    try {
      const ok = await saveExpoPushToken(uid);
      const status = await getPushPermissionStatus();
      setPushStatus(status);
      setMessage(ok ? t('settings.notifEnableOk') : t('settings.notifEnableFail'));
    } finally {
      setPushBusy(false);
    }
  }, [uid, pushBusy, t]);

  const patch = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setIsEditing(true);
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMode = (mode: WorkMode) => {
    setIsEditing(true);
    setDraft((prev) => {
      const has = prev.preferredModes.includes(mode);
      return {
        ...prev,
        preferredModes: has
          ? prev.preferredModes.filter((m) => m !== mode)
          : [...prev.preferredModes, mode],
      };
    });
  };

  const sortOptions = useMemo(
    () =>
      [
        { value: 'newest' as SettingsSort, label: t('settings.sortNewest') },
        { value: 'rateDesc' as SettingsSort, label: t('settings.sortRateDesc') },
        { value: 'rateAsc' as SettingsSort, label: t('settings.sortRateAsc') },
      ] as const,
    [t]
  );

  const intentOptions = useMemo(
    () =>
      [
        { value: 'all' as SettingsIntentPref, label: t('settings.intentAll') },
        { value: 'offer' as SettingsIntentPref, label: t('settings.intentOffer') },
        { value: 'seek' as SettingsIntentPref, label: t('settings.intentSeek') },
      ] as const,
    [t]
  );

  const radiusLabel = (r: SettingsRadius) => (r === 'Cała Polska' ? t('settings.radiusPoland') : r);

  const onSave = async () => {
    if (!uid) {
      setMessage(t('settings.loginRequired'));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const next: UserSettings = {
        ...draft,
        baseCity: draft.baseCity.trim(),
        minRate: Number.isFinite(draft.minRate) ? Math.max(0, Math.round(draft.minRate)) : 0,
        theme,
        locale,
      };
      await saveSettings(next);
      setIsEditing(false);
      setMessage(t('settings.saved'));
    } catch {
      setMessage(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const cityHints = CITY_SUGGESTIONS.filter((c) =>
    draft.baseCity.trim()
      ? c.toLowerCase().includes(draft.baseCity.trim().toLowerCase())
      : true
  ).slice(0, 8);

  const headerGradient = getHeaderGradient(theme);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={[...headerGradient]} locations={[0, 0.42]} style={styles.bgGlow} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
            <Text style={styles.headerSub}>{t('settings.subtitle')}</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.section.appearance')}</Text>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('settings.theme')}</Text>
          <View style={styles.segmentWrap}>
            <Pill
              active={theme === 'light'}
              label={t('settings.themeLight')}
              colors={colors}
              onPress={() => void setTheme('light')}
            />
            <Pill
              active={theme === 'dark'}
              label={t('settings.themeDark')}
              colors={colors}
              onPress={() => void setTheme('dark')}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.section.language')}</Text>
          <Text style={[styles.hint, { color: colors.textSoft }]}>{t('settings.languageHint')}</Text>
          <View style={styles.segmentWrap}>
            {APP_LOCALES.map((opt) => (
              <Pill
                key={opt.value}
                active={locale === opt.value}
                label={`${opt.flag} ${opt.nativeLabel}`}
                colors={colors}
                onPress={() => void setLocale(opt.value)}
              />
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.section.location')}</Text>
          <Text style={[styles.hint, { color: colors.textSoft }]}>{t('settings.baseCity')}</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.text },
            ]}
            value={draft.baseCity}
            onChangeText={(v) => {
              patch('baseCity', v);
              setShowCityHints(true);
            }}
            onFocus={() => setShowCityHints(true)}
            placeholder={t('settings.baseCity')}
            placeholderTextColor={colors.textSoft}
          />
          {!draft.baseCity.trim() && profile.city.trim() ? (
            <Pressable
              onPress={() => {
                patch('baseCity', profile.city.trim());
                setShowCityHints(false);
              }}>
              <Text style={[styles.linkHint, { color: colors.primary }]}>
                {profile.city.trim()}
              </Text>
            </Pressable>
          ) : null}
          {showCityHints && cityHints.length > 0 ? (
            <View style={styles.segmentWrap}>
              {cityHints.map((c) => (
                <Pill
                  key={c}
                  active={draft.baseCity.trim().toLowerCase() === c.toLowerCase()}
                  label={c}
                  colors={colors}
                  onPress={() => {
                    patch('baseCity', c);
                    setShowCityHints(false);
                  }}
                />
              ))}
            </View>
          ) : null}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('settings.radius')}</Text>
          <View style={styles.segmentWrap}>
            {RADIUS_VALUES.map((r) => (
              <Pill
                key={r}
                active={draft.radius === r}
                label={radiusLabel(r)}
                colors={colors}
                onPress={() => patch('radius', r)}
              />
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.section.market')}</Text>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('settings.defaultSort')}</Text>
          <View style={styles.segmentWrap}>
            {sortOptions.map((o) => (
              <Pill
                key={o.value}
                active={draft.defaultSort === o.value}
                label={o.label}
                colors={colors}
                onPress={() => patch('defaultSort', o.value)}
              />
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('settings.preferredIntent')}</Text>
          <View style={styles.segmentWrap}>
            {intentOptions.map((o) => (
              <Pill
                key={o.value}
                active={draft.preferredIntent === o.value}
                label={o.label}
                colors={colors}
                onPress={() => patch('preferredIntent', o.value)}
              />
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('settings.preferredModes')}</Text>
          <View style={styles.segmentWrap}>
            {MODE_OPTIONS.map((m) => (
              <Pill
                key={m}
                active={draft.preferredModes.includes(m)}
                label={workModeLabel(m, t)}
                colors={colors}
                onPress={() => toggleMode(m)}
              />
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('settings.minRate')}</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.text },
            ]}
            value={draft.minRate === 0 ? '' : String(draft.minRate)}
            onChangeText={(v) => {
              const n = Number(v.replace(/[^\d]/g, ''));
              patch('minRate', Number.isFinite(n) ? n : 0);
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textSoft}
          />
          <SettingRow
            icon="visibility-off"
            title={t('settings.hideOwn')}
            subtitle={t('settings.hideOwnSub')}
            value={draft.hideOwnInFeed}
            onChange={(v) => patch('hideOwnInFeed', v)}
            colors={colors}
          />
          <SettingRow
            icon="verified"
            title={t('settings.onlyVerified')}
            subtitle={t('settings.onlyVerifiedSub')}
            value={draft.onlyVerified}
            onChange={(v) => patch('onlyVerified', v)}
            colors={colors}
          />
          <SettingRow
            icon="payments"
            title={t('settings.showGross')}
            subtitle={t('settings.showGrossSub')}
            value={draft.showGrossRate}
            onChange={(v) => patch('showGrossRate', v)}
            colors={colors}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('settings.section.notifications')}
          </Text>
          <SettingRow
            icon="work-outline"
            title={t('settings.notifJobs')}
            subtitle={t('settings.notifJobsSub')}
            value={draft.notifNewJobs}
            onChange={(v) => patch('notifNewJobs', v)}
            colors={colors}
          />
          <SettingRow
            icon="assignment"
            title={t('settings.notifApps')}
            subtitle={t('settings.notifAppsSub')}
            value={draft.notifApplications}
            onChange={(v) => patch('notifApplications', v)}
            colors={colors}
          />
          <SettingRow
            icon="chat-bubble-outline"
            title={t('settings.notifMsgs')}
            subtitle={t('settings.notifMsgsSub')}
            value={draft.notifMessages}
            onChange={(v) => patch('notifMessages', v)}
            colors={colors}
          />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primaryMuted }]}>
              <MaterialIcons name="phonelink-ring" size={18} color={colors.primary} />
            </View>
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {t('settings.notifDevice')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSoft }]}>{pushStatusLabel}</Text>
            </View>
          </View>
          {uid && pushStatus !== 'unavailable' ? (
            <Pressable
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary, marginTop: 4 },
                pushBusy && styles.saveBtnDisabled,
              ]}
              disabled={pushBusy}
              onPress={onEnablePush}>
              <MaterialIcons name="notifications-active" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {pushBusy ? t('settings.notifEnableBusy') : t('settings.notifEnable')}
              </Text>
            </Pressable>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('legal.section')}</Text>
          <Pressable
            onPress={() => router.push('/legal/privacy')}
            style={[styles.legalRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <MaterialIcons name="policy" size={18} color={colors.primary} />
            <Text style={[styles.legalRowText, { color: colors.text }]}>{t('legal.privacyLink')}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSoft} />
          </Pressable>

          {loading ? (
            <Text style={[styles.note, { color: colors.textMuted }]}>{t('common.loading')}</Text>
          ) : null}
          {message ? <Text style={[styles.note, { color: colors.textMuted }]}>{message}</Text> : null}
          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary }, busy && styles.saveBtnDisabled]}
            disabled={busy}
            onPress={onSave}>
            <MaterialIcons name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{busy ? t('common.loading') : t('common.save')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgGlow: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 36 },
  header: { paddingTop: 4, paddingBottom: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 20 },

  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  hint: { fontSize: 11, lineHeight: 16, marginTop: -4 },
  linkHint: { fontSize: 12, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { fontSize: 12, fontWeight: '600' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextWrap: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600' },
  settingSub: { fontSize: 12 },
  note: { fontSize: 12 },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  legalRowText: { flex: 1, fontSize: 14, fontWeight: '700' },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
