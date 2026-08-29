import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { uploadUserAvatar } from '@/lib/avatarStorage';
import { clearExpoPushToken } from '@/lib/expo-push';
import { getFirebaseAuth } from '@/lib/firebaseAuth';
import type { ListingApplication } from '@/lib/listing-applications';
import { useUserConversations } from '@/lib/use-chat';
import { useInAppNotifications } from '@/lib/use-in-app-notifications';
import { useApplicationsByApplicant, useApplicationsByAuthor } from '@/lib/use-listing-applications';
import { updateUserPersonalFields, useCurrentUserProfile } from '@/lib/user-profile';

const ROLE_LABEL_PL: Record<'welder' | 'employer', string> = {
  welder: 'Spawacz',
  employer: 'Pracodawca / zleceniodawca',
};

const STATUS_LABEL: Record<ListingApplication['status'], string> = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  accepted: 'Zaakceptowane',
  rejected: 'Odrzucone',
};

function NavRow({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navRow} onPress={onPress}>
      <MaterialIcons name={icon} size={20} color="#0E4AA4" />
      <Text style={styles.navRowText}>{label}</Text>
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
      <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  const { uid, profile } = useCurrentUserProfile();
  const { unreadCount: messagesUnreadCount } = useUserConversations(uid ?? undefined);
  const { unreadCount: notifUnreadCount } = useInAppNotifications(uid ?? undefined);
  const { applications: myApplications, loading: loadingMyApplications } = useApplicationsByApplicant(
    uid ?? undefined
  );
  const { applications: incomingApplications, loading: loadingIncomingApplications } =
    useApplicationsByAuthor(uid ?? undefined);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [publicBio, setPublicBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const isEmployer = profile.role === 'employer';

  useEffect(() => {
    if (isEditing) return;
    setFullName(profile.fullName);
    setCompanyName(profile.companyName);
    setPhone(profile.phone);
    setCity(profile.city);
    setAvatarUrl(profile.avatarUrl);
    setPublicBio(profile.publicBio);
  }, [isEditing, profile]);

  useEffect(() => {
    setIsEditing(false);
  }, [uid]);

  const onSave = async () => {
    if (!uid) {
      setMessage('Brak aktywnej sesji.');
      return;
    }
    if (isEmployer && !companyName.trim()) {
      setMessage('Nazwa firmy jest wymagana — pojawia się na Twoich ogłoszeniach.');
      return;
    }
    if (!isEmployer && !fullName.trim()) {
      setMessage('Imię i nazwisko jest wymagane — pojawia się na Twoich ogłoszeniach.');
      return;
    }
    await updateUserPersonalFields(uid, {
      fullName,
      companyName: isEmployer ? companyName.trim() : '',
      phone,
      city,
      avatarUrl,
      publicBio,
    });
    setIsEditing(false);
    setMessage('Profil zapisany.');
  };

  const onPickAvatar = useCallback(async () => {
    if (!uid) {
      setMessage('Zaloguj się, aby zmienić zdjęcie.');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setMessage('Brak uprawnień do galerii.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.length) {
      return;
    }
    setAvatarUploading(true);
    setMessage(null);
    try {
      const downloadUrl = await uploadUserAvatar({ uid, localUri: result.assets[0].uri });
      setAvatarUrl(downloadUrl);
      await updateUserPersonalFields(uid, {
        fullName,
        companyName: isEmployer ? companyName.trim() : '',
        phone,
        city,
        avatarUrl: downloadUrl,
        publicBio,
      });
      setMessage('Zdjęcie profilowe zapisane.');
    } catch {
      setMessage('Nie udało się wgrać zdjęcia.');
    } finally {
      setAvatarUploading(false);
    }
  }, [city, companyName, fullName, isEmployer, phone, publicBio, uid]);

  const onLogout = async () => {
    if (uid) {
      await clearExpoPushToken(uid);
    }
    await signOut(getFirebaseAuth());
    router.replace('/welcome');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A2F6B', '#E8EEF7']} locations={[0, 0.36]} style={styles.bgGlow} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Konto</Text>
              <Text style={styles.headerSub}>{user?.email ?? 'Nie zalogowano'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{ROLE_LABEL_PL[profile.role]}</Text>
              </View>
            </View>
            <Pressable style={styles.avatarWrap} onPress={onPickAvatar} disabled={avatarUploading}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="photo-camera" size={20} color="#0F172A" />
                </View>
              )}
              {avatarUploading ? (
                <View style={styles.avatarUploadOverlay}>
                  <MaterialIcons name="hourglass-top" size={18} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Skróty</Text>
          <NavRow
            icon="notifications-none"
            label="Centrum powiadomień"
            badge={notifUnreadCount}
            onPress={() => router.push('/notifications' as never)}
          />
          <NavRow
            icon="chat-bubble-outline"
            label="Wiadomości"
            badge={messagesUnreadCount}
            onPress={() => router.push('/(tabs)/messages' as never)}
          />
          {uid ? (
            <NavRow
              icon="visibility"
              label="Profil publiczny"
              onPress={() => router.push({ pathname: '/user/[id]', params: { id: uid } })}
            />
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Profil</Text>
          <Text style={styles.hint}>
            {isEmployer
              ? 'Nazwa firmy trafia automatycznie na Twoje ogłoszenia. Możesz ją zmienić tutaj.'
              : 'Imię i nazwisko trafia automatycznie na Twoje ogłoszenia.'}
          </Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={publicBio}
            onChangeText={(v) => {
              setIsEditing(true);
              setPublicBio(v);
            }}
            placeholder="Krótki opis (doświadczenie, specjalizacja…)"
            placeholderTextColor="#94A3B8"
            multiline
          />
          {isEmployer ? (
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={(v) => {
                setIsEditing(true);
                setCompanyName(v);
              }}
              placeholder="Nazwa firmy *"
              placeholderTextColor="#94A3B8"
            />
          ) : null}
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={(v) => {
              setIsEditing(true);
              setFullName(v);
            }}
            placeholder={isEmployer ? 'Osoba kontaktowa (opcjonalnie)' : 'Imię i nazwisko *'}
            placeholderTextColor="#94A3B8"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(v) => {
              setIsEditing(true);
              setPhone(v);
            }}
            placeholder="Telefon"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={(v) => {
              setIsEditing(true);
              setCity(v);
            }}
            placeholder="Miasto"
            placeholderTextColor="#94A3B8"
          />
          {message ? <Text style={styles.hint}>{message}</Text> : null}
          <Pressable style={styles.saveBtn} onPress={onSave}>
            <MaterialIcons name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Zapisz profil</Text>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Moje zgłoszenia</Text>
            <Pressable onPress={() => router.push('/applications/sent' as never)}>
              <Text style={styles.seeAllLink}>Wszystkie</Text>
            </Pressable>
          </View>
          {loadingMyApplications ? (
            <Text style={styles.hint}>Ładowanie…</Text>
          ) : myApplications.length === 0 ? (
            <Text style={styles.hint}>Nie wysłałeś jeszcze żadnego zgłoszenia.</Text>
          ) : (
            myApplications.slice(0, 5).map((app) => (
              <Pressable
                key={app.id}
                style={styles.applicationRow}
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: app.listingId } })}>
                <View style={styles.applicationHead}>
                  <Text style={styles.applicationTitle} numberOfLines={1}>
                    {app.listingTitle}
                  </Text>
                  <Text style={styles.applicationStatus}>{STATUS_LABEL[app.status]}</Text>
                </View>
                <Text style={styles.applicationMeta} numberOfLines={2}>
                  {app.message}
                </Text>
              </Pressable>
            ))
          )}

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Zgłoszenia do moich ogłoszeń</Text>
            <Pressable onPress={() => router.push('/applications/incoming' as never)}>
              <Text style={styles.seeAllLink}>Wszystkie</Text>
            </Pressable>
          </View>
          {loadingIncomingApplications ? (
            <Text style={styles.hint}>Ładowanie…</Text>
          ) : incomingApplications.length === 0 ? (
            <Text style={styles.hint}>Brak zgłoszeń do Twoich ogłoszeń.</Text>
          ) : (
            incomingApplications.slice(0, 5).map((app) => (
              <Pressable
                key={app.id}
                style={styles.applicationRow}
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: app.listingId } })}>
                <View style={styles.applicationHead}>
                  <Text style={styles.applicationTitle} numberOfLines={1}>
                    {app.listingTitle}
                  </Text>
                  <Text style={styles.applicationStatus}>{STATUS_LABEL[app.status]}</Text>
                </View>
                <Text style={styles.applicationMeta} numberOfLines={2}>
                  {app.applicantName || 'Użytkownik'} · {app.message}
                </Text>
              </Pressable>
            ))
          )}

          <Pressable style={styles.logoutBtn} onPress={onLogout}>
            <MaterialIcons name="logout" size={18} color="#B91C1C" />
            <Text style={styles.logoutText}>Wyloguj</Text>
          </Pressable>

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EEF7' },
  bgGlow: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTextCol: { flex: 1, gap: 6 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: '#D7E6FF', fontSize: 13 },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roleBadgeText: { color: '#E8F0FF', fontSize: 11, fontWeight: '700' },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(248, 250, 252, 0.9)',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  avatarUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: { color: '#10233E', fontSize: 15, fontWeight: '800', marginTop: 8 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  seeAllLink: { color: '#0E4AA4', fontWeight: '700', fontSize: 12 },
  hint: { color: '#64748B', fontSize: 12, lineHeight: 17, marginTop: -2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(100,116,139,0.35)',
    marginVertical: 8,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.4)',
  },
  navRowText: { flex: 1, color: '#0F172A', fontSize: 15, fontWeight: '600' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

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
  bioInput: { minHeight: 88, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#0E4AA4',
    paddingVertical: 12,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },

  applicationRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.35)',
    gap: 4,
  },
  applicationHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  applicationTitle: { color: '#0F172A', fontWeight: '700', flex: 1 },
  applicationStatus: {
    color: '#1E3A8A',
    backgroundColor: 'rgba(219,234,254,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  applicationMeta: { color: '#64748B', fontSize: 12 },

  logoutBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    backgroundColor: 'rgba(255,245,245,0.95)',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#B91C1C', fontWeight: '700' },
  message: { textAlign: 'center', color: '#0E4AA4', fontWeight: '600', marginTop: 4 },
});
