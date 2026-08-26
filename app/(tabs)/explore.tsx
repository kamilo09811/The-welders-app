import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { WorkMode } from '@/lib/market-listings';
import { PL_CITIES } from '@/lib/pl-cities';
import { useCurrentUserProfile } from '@/lib/user-profile';
import {
  saveUserSettings,
  useUserSettings,
  type SettingsIntentPref,
  type SettingsRadius,
  type SettingsSort,
  type UserSettings,
} from '@/lib/user-settings';

const RADIUS_OPTIONS: SettingsRadius[] = ['25 km', '50 km', '100 km', 'Cała Polska'];
const SORT_OPTIONS: { value: SettingsSort; label: string }[] = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'rateDesc', label: 'Stawka ↓' },
  { value: 'rateAsc', label: 'Stawka ↑' },
];
const INTENT_OPTIONS: { value: SettingsIntentPref; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'offer', label: 'Oferuję' },
  { value: 'seek', label: 'Poszukuję' },
];
const MODE_OPTIONS: WorkMode[] = ['Na hali', 'Hybryda', 'Mobilnie'];
const CITY_SUGGESTIONS = [...new Set(PL_CITIES.map((c) => c.name))].sort((a, b) =>
  a.localeCompare(b, 'pl')
);

function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon} size={18} color="#0E4AA4" />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSub}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#8BB6FF', false: '#CBD5E1' }} />
    </View>
  );
}

export default function SettingsScreen() {
  const { profile } = useCurrentUserProfile();
  const { uid, settings, loading } = useUserSettings();
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCityHints, setShowCityHints] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    setDraft(settings);
  }, [isEditing, settings]);

  useEffect(() => {
    setIsEditing(false);
  }, [uid]);

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

  const onSave = async () => {
    if (!uid) {
      setMessage('Zaloguj się, aby zapisać ustawienia.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const next: UserSettings = {
        ...draft,
        baseCity: draft.baseCity.trim(),
        minRate: Number.isFinite(draft.minRate) ? Math.max(0, Math.round(draft.minRate)) : 0,
      };
      await saveUserSettings(uid, next);
      setIsEditing(false);
      setMessage('Ustawienia zapisane — rynek używa ich od razu.');
    } catch {
      setMessage('Nie udało się zapisać ustawień.');
    } finally {
      setBusy(false);
    }
  };

  const cityHints = CITY_SUGGESTIONS.filter((c) =>
    draft.baseCity.trim()
      ? c.toLowerCase().includes(draft.baseCity.trim().toLowerCase())
      : true
  ).slice(0, 8);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A2F6B', '#E8EEF7']} locations={[0, 0.38]} style={styles.bgGlow} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ustawienia</Text>
            <Text style={styles.headerSub}>Preferencje rynku, powiadomień i wyświetlania.</Text>
          </View>

          <Text style={styles.sectionTitle}>Lokalizacja i zasięg</Text>
          <Text style={styles.hint}>Filtr rynku po mieście + radius (miasta PL, bez GPS).</Text>
          <TextInput
            style={styles.input}
            value={draft.baseCity}
            onChangeText={(v) => {
              patch('baseCity', v);
              setShowCityHints(true);
            }}
            onFocus={() => setShowCityHints(true)}
            placeholder="Miasto bazowe (np. Katowice)"
            placeholderTextColor="#94A3B8"
          />
          {!draft.baseCity.trim() && profile.city.trim() ? (
            <Pressable
              onPress={() => {
                patch('baseCity', profile.city.trim());
                setShowCityHints(false);
              }}>
              <Text style={styles.linkHint}>Użyj miasta z profilu: {profile.city.trim()}</Text>
            </Pressable>
          ) : null}
          {showCityHints && cityHints.length > 0 ? (
            <View style={styles.segmentWrap}>
              {cityHints.map((c) => (
                <Pill
                  key={c}
                  active={draft.baseCity.trim().toLowerCase() === c.toLowerCase()}
                  label={c}
                  onPress={() => {
                    patch('baseCity', c);
                    setShowCityHints(false);
                  }}
                />
              ))}
            </View>
          ) : null}
          <View style={styles.segmentWrap}>
            {RADIUS_OPTIONS.map((r) => (
              <Pill key={r} active={draft.radius === r} label={r} onPress={() => patch('radius', r)} />
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Preferencje rynku</Text>
          <Text style={styles.fieldLabel}>Domyślne sortowanie</Text>
          <View style={styles.segmentWrap}>
            {SORT_OPTIONS.map((o) => (
              <Pill
                key={o.value}
                active={draft.defaultSort === o.value}
                label={o.label}
                onPress={() => patch('defaultSort', o.value)}
              />
            ))}
          </View>
          <Text style={styles.fieldLabel}>Domyślna intencja</Text>
          <View style={styles.segmentWrap}>
            {INTENT_OPTIONS.map((o) => (
              <Pill
                key={o.value}
                active={draft.preferredIntent === o.value}
                label={o.label}
                onPress={() => patch('preferredIntent', o.value)}
              />
            ))}
          </View>
          <Text style={styles.fieldLabel}>Preferowany tryb pracy</Text>
          <View style={styles.segmentWrap}>
            {MODE_OPTIONS.map((m) => (
              <Pill
                key={m}
                active={draft.preferredModes.includes(m)}
                label={m}
                onPress={() => toggleMode(m)}
              />
            ))}
          </View>
          <Text style={styles.fieldLabel}>Minimalna stawka (PLN/h, 0 = bez limitu)</Text>
          <TextInput
            style={styles.input}
            value={draft.minRate === 0 ? '' : String(draft.minRate)}
            onChangeText={(v) => {
              const n = Number(v.replace(/[^\d]/g, ''));
              patch('minRate', Number.isFinite(n) ? n : 0);
            }}
            keyboardType="numeric"
            placeholder="np. 40"
            placeholderTextColor="#94A3B8"
          />
          <SettingRow
            icon="visibility-off"
            title="Ukryj własne ogłoszenia"
            subtitle="Nie pokazuj swoich ofert w widoku domyślnym"
            value={draft.hideOwnInFeed}
            onChange={(v) => patch('hideOwnInFeed', v)}
          />
          <SettingRow
            icon="verified"
            title="Tylko zweryfikowane konta"
            subtitle="Filtruj rynek po potwierdzonym e-mailu"
            value={draft.onlyVerified}
            onChange={(v) => patch('onlyVerified', v)}
          />
          <SettingRow
            icon="payments"
            title="Pokazuj stawki brutto"
            subtitle="Etykieta brutto / netto na liście i w szczegółach"
            value={draft.showGrossRate}
            onChange={(v) => patch('showGrossRate', v)}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Powiadomienia</Text>
          <Text style={styles.hint}>Push wymaga buildu EAS (nie Expo Go) oraz EXPO_PUBLIC_EAS_PROJECT_ID.</Text>
          <SettingRow
            icon="work-outline"
            title="Nowe oferty i zlecenia"
            subtitle="Alert o ogłoszeniu pasującym do roli i lokalizacji"
            value={draft.notifNewJobs}
            onChange={(v) => patch('notifNewJobs', v)}
          />
          <SettingRow
            icon="assignment"
            title="Zgłoszenia i statusy"
            subtitle="Nowe aplikacje oraz zmiany statusu"
            value={draft.notifApplications}
            onChange={(v) => patch('notifApplications', v)}
          />
          <SettingRow
            icon="chat-bubble-outline"
            title="Wiadomości"
            subtitle="Nowe wiadomości w rozmowach"
            value={draft.notifMessages}
            onChange={(v) => patch('notifMessages', v)}
          />

          <View style={styles.divider} />

          {loading ? <Text style={styles.note}>Ładowanie ustawień…</Text> : null}
          {message ? <Text style={styles.note}>{message}</Text> : null}
          <Pressable
            style={[styles.saveBtn, busy && styles.saveBtnDisabled]}
            disabled={busy}
            onPress={onSave}>
            <MaterialIcons name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{busy ? 'Zapisywanie...' : 'Zapisz ustawienia'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EEF7' },
  bgGlow: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 36 },
  header: { paddingTop: 4, paddingBottom: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: '#D7E6FF', marginTop: 6, lineHeight: 20 },

  sectionTitle: { color: '#10233E', fontSize: 15, fontWeight: '800', marginTop: 8 },
  fieldLabel: { color: '#334155', fontSize: 12, fontWeight: '700', marginTop: 2 },
  hint: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: -4 },
  linkHint: { color: '#0E4AA4', fontSize: 12, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(100,116,139,0.35)',
    marginVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(213,222,234,0.95)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DEEA',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillActive: { backgroundColor: '#0E4AA4', borderColor: '#0E4AA4' },
  pillText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(239,246,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextWrap: { flex: 1 },
  settingTitle: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  settingSub: { color: '#64748B', fontSize: 12 },
  note: { color: '#475569', fontSize: 12 },
  saveBtn: {
    borderRadius: 12,
    backgroundColor: '#0E4AA4',
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
