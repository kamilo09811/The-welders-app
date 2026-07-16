import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
      setMessage('Ustawienia zapisane — rynek i powiadomienia używają ich od razu.');
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
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ustawienia</Text>
          <Text style={styles.headerSub}>
            Preferencje rynku, powiadomień i wyświetlania — synchronizowane w całej aplikacji.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lokalizacja i zasięg</Text>
          <Text style={styles.cardHint}>
            Filtruje rynek po mieście bazowym. Zasięg liczymy po znanych miastach PL (bez GPS).
          </Text>
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
            <View style={styles.hintsWrap}>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferencje rynku</Text>
          <Text style={styles.cardHint}>Domyślne filtry przy wejściu na Rynek (możesz je zmienić lokalnie na liście).</Text>
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
            subtitle="Na rynku nie pokazuj swoich ofert w widoku domyślnym"
            value={draft.hideOwnInFeed}
            onChange={(v) => patch('hideOwnInFeed', v)}
          />
          <SettingRow
            icon="verified"
            title="Tylko zweryfikowane konta"
            subtitle="Pokazuj ogłoszenia od użytkowników z potwierdzonym e-mailem"
            value={draft.onlyVerified}
            onChange={(v) => patch('onlyVerified', v)}
          />
          <SettingRow
            icon="payments"
            title="Pokazuj stawki brutto"
            subtitle="Etykieta brutto/netto na rynku i w szczegółach ogłoszenia"
            value={draft.showGrossRate}
            onChange={(v) => patch('showGrossRate', v)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Powiadomienia</Text>
          <Text style={styles.cardHint}>
            Push wymaga buildu EAS (nie Expo Go) oraz EXPO_PUBLIC_EAS_PROJECT_ID. In-app w aplikacji działa
            zawsze, gdy przełącznik jest włączony.
          </Text>
          <SettingRow
            icon="work-outline"
            title="Nowe oferty i zlecenia"
            subtitle="Alert, gdy pojawi się ogłoszenie pasujące do Twojej roli i lokalizacji"
            value={draft.notifNewJobs}
            onChange={(v) => patch('notifNewJobs', v)}
          />
          <SettingRow
            icon="assignment"
            title="Zgłoszenia i statusy"
            subtitle="Nowe aplikacje do Twoich ofert oraz zmiany statusu Twoich zgłoszeń"
            value={draft.notifApplications}
            onChange={(v) => patch('notifApplications', v)}
          />
          <SettingRow
            icon="chat-bubble-outline"
            title="Wiadomości"
            subtitle="Nowe wiadomości w rozmowach (z uwzględnieniem wyciszenia wątku)"
            value={draft.notifMessages}
            onChange={(v) => patch('notifMessages', v)}
          />
        </View>

        <View style={styles.card}>
          {loading ? <Text style={styles.cardNote}>Ładowanie ustawień...</Text> : null}
          {message ? <Text style={styles.cardNote}>{message}</Text> : null}
          <Pressable
            style={[styles.saveBtn, busy && styles.saveBtnDisabled]}
            disabled={busy}
            onPress={onSave}>
            <MaterialIcons name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{busy ? 'Zapisywanie...' : 'Zapisz ustawienia'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: { backgroundColor: '#0E4AA4', borderRadius: 18, padding: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#DCEBFF', marginTop: 6, lineHeight: 20 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 10,
  },
  cardTitle: { color: '#10233E', fontSize: 15, fontWeight: '700' },
  cardHint: { color: '#64748B', fontSize: 11, lineHeight: 16 },
  fieldLabel: { color: '#334155', fontSize: 12, fontWeight: '700', marginTop: 4 },
  linkHint: { color: '#0E4AA4', fontSize: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 11,
    backgroundColor: '#F8FAFD',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  hintsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D5DEEA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillActive: { backgroundColor: '#0E4AA4', borderColor: '#0E4AA4' },
  pillText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextWrap: { flex: 1 },
  settingTitle: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  settingSub: { color: '#64748B', fontSize: 12 },
  cardNote: { color: '#64748B', fontSize: 12 },
  saveBtn: {
    borderRadius: 11,
    backgroundColor: '#0E4AA4',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
