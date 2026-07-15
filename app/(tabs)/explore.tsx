import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ustawienia</Text>
          <Text style={styles.headerSub}>
            Preferencje aplikacji: powiadomienia, filtry i sposób wyświetlania stawek.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lokalizacja i zasięg</Text>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Powiadomienia</Text>
          <Text style={styles.cardHint}>
            Push wymaga zbudowanej aplikacji (nie Expo Go), uprawnień systemu oraz w .env zmiennej
            EXPO_PUBLIC_EAS_PROJECT_ID (projekt EAS). W Firebase włącz szablon „Weryfikacja adresu e-mail”.
          </Text>
          <SettingRow
            icon="work-outline"
            title="Nowe oferty i zlecenia"
            subtitle="Powiadomienie, gdy pojawi się pasujące ogłoszenie"
            value={notifNewJobs}
            onChange={(v) => {
              setIsEditing(true);
              setNotifNewJobs(v);
            }}
          />
          <SettingRow
            icon="chat-bubble-outline"
            title="Wiadomości i odpowiedzi"
            subtitle="Informacja o nowych rozmowach"
            value={notifMessages}
            onChange={(v) => {
              setIsEditing(true);
              setNotifMessages(v);
            }}
          />
          <SettingRow
            icon="verified"
            title="Tylko zweryfikowane konta"
            subtitle="Pokazuj ogłoszenia od zweryfikowanych użytkowników"
            value={onlyVerified}
            onChange={(v) => {
              setIsEditing(true);
              setOnlyVerified(v);
            }}
          />
          <SettingRow
            icon="payments"
            title="Pokazuj stawki brutto"
            subtitle="Spójny widok wynagrodzeń"
            value={showGrossRate}
            onChange={(v) => {
              setIsEditing(true);
              setShowGrossRate(v);
            }}
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
  headerSub: { color: '#DCEBFF', marginTop: 6 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 10,
  },
  cardTitle: { color: '#10233E', fontSize: 15, fontWeight: '700' },
  cardHint: { color: '#64748B', fontSize: 11, lineHeight: 16, marginBottom: 4 },
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
