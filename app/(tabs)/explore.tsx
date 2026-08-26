import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { saveUserSettings, useUserSettings } from '@/lib/user-settings';

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
  const { uid, settings, loading } = useUserSettings();
  const [baseCity, setBaseCity] = useState('');
  const [notifNewJobs, setNotifNewJobs] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [showGrossRate, setShowGrossRate] = useState(true);
  const [radius, setRadius] = useState<'25 km' | '50 km' | '100 km' | 'Cała Polska'>('50 km');
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) return;
    setBaseCity(settings.baseCity);
    setNotifNewJobs(settings.notifNewJobs);
    setNotifMessages(settings.notifMessages);
    setOnlyVerified(settings.onlyVerified);
    setShowGrossRate(settings.showGrossRate);
    setRadius(settings.radius);
  }, [isEditing, settings]);

  useEffect(() => {
    setIsEditing(false);
  }, [uid]);

  const onSave = async () => {
    if (!uid) {
      setMessage('Zaloguj się, aby zapisać ustawienia.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await saveUserSettings(uid, {
        baseCity: baseCity.trim(),
        notifNewJobs,
        notifMessages,
        onlyVerified,
        showGrossRate,
        radius,
      });
      setIsEditing(false);
      setMessage('Ustawienia zapisane.');
    } catch {
      setMessage('Nie udało się zapisać ustawień.');
    } finally {
      setBusy(false);
    }
  };

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
          <TextInput
            style={styles.input}
            value={baseCity}
            onChangeText={(v) => {
              setIsEditing(true);
              setBaseCity(v);
            }}
            placeholder="Miasto bazowe (np. Katowice)"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.segmentWrap}>
            {(['25 km', '50 km', '100 km', 'Cała Polska'] as const).map((r) => (
              <Pill
                key={r}
                active={radius === r}
                label={r}
                onPress={() => {
                  setIsEditing(true);
                  setRadius(r);
                }}
              />
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Powiadomienia i widok</Text>
          <Text style={styles.hint}>
            Push wymaga buildu EAS (nie Expo Go) oraz EXPO_PUBLIC_EAS_PROJECT_ID.
          </Text>
          <SettingRow
            icon="work-outline"
            title="Nowe oferty i zlecenia"
            subtitle="Gdy pojawi się pasujące ogłoszenie"
            value={notifNewJobs}
            onChange={(v) => {
              setIsEditing(true);
              setNotifNewJobs(v);
            }}
          />
          <SettingRow
            icon="chat-bubble-outline"
            title="Wiadomości i odpowiedzi"
            subtitle="Nowe rozmowy i wiadomości"
            value={notifMessages}
            onChange={(v) => {
              setIsEditing(true);
              setNotifMessages(v);
            }}
          />
          <SettingRow
            icon="verified"
            title="Tylko zweryfikowane konta"
            subtitle="Filtruj rynek po potwierdzonym e-mailu"
            value={onlyVerified}
            onChange={(v) => {
              setIsEditing(true);
              setOnlyVerified(v);
            }}
          />
          <SettingRow
            icon="payments"
            title="Pokazuj stawki brutto"
            subtitle="Etykieta brutto / netto na liście"
            value={showGrossRate}
            onChange={(v) => {
              setIsEditing(true);
              setShowGrossRate(v);
            }}
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
  hint: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: -4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(100,116,139,0.35)', marginVertical: 6 },
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
