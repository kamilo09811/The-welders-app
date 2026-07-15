import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFirebaseAuth } from '@/lib/firebaseAuth';
import { uploadUserAvatar } from '@/lib/avatarStorage';
import { clearExpoPushToken } from '@/lib/expo-push';
import type { ListingApplication } from '@/lib/listing-applications';
import { useApplicationsByApplicant, useApplicationsByAuthor } from '@/lib/use-listing-applications';
import { updateUserPersonalFields, useCurrentUserProfile } from '@/lib/user-profile';
import { useUserConversations } from '@/lib/use-chat';
import { useInAppNotifications } from '@/lib/use-in-app-notifications';

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

export default function AccountScreen() {
  const router = useRouter();
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  const { uid, profile } = useCurrentUserProfile();
  const { unreadCount: messagesUnreadCount } = useUserConversations(uid ?? undefined);
  const { unreadCount: notifUnreadCount } = useInAppNotifications(uid ?? undefined);
  const { applications: myApplications, loading: loadingMyApplications } = useApplicationsByApplicant(uid ?? undefined);
  const { applications: incomingApplications, loading: loadingIncomingApplications } = useApplicationsByAuthor(uid ?? undefined);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [publicBio, setPublicBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    setFullName(profile.fullName);
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
    await updateUserPersonalFields(uid, { fullName, phone, city, avatarUrl, publicBio });
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
  }, [city, fullName, phone, publicBio, uid]);

  const onLogout = async () => {
    if (uid) {
      await clearExpoPushToken(uid);
    }
    await signOut(getFirebaseAuth());
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Konto</Text>
            <Text style={styles.headerSub}>{user?.email ?? 'Nie zalogowano'}</Text>
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Powiadomienia</Text>
          <Text style={styles.note}>Nowe zgłoszenia, zmiany statusów i wiadomości z czatu.</Text>
          <View style={styles.messagesBtnWrap}>
            <Pressable
              style={styles.messagesBtn}
              onPress={() => router.push('/notifications' as never)}>
              <MaterialIcons name="notifications-none" size={18} color="#0E4AA4" />
              <Text style={styles.messagesBtnText}>Centrum powiadomień</Text>
            </Pressable>
            {notifUnreadCount > 0 ? (
              <View style={styles.messagesBadge}>
                <Text style={styles.messagesBadgeText}>
                  {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Typ konta</Text>
          <Text style={styles.roleReadonly}>{ROLE_LABEL_PL[profile.role]}</Text>
          <Text style={styles.note}>Rola jest wybierana tylko przy rejestracji i nie można jej tu zmienić.</Text>
          <View style={styles.messagesBtnWrap}>
            <Pressable
              style={styles.messagesBtn}
              onPress={() => router.push('/messages' as never)}>
              <MaterialIcons name="chat-bubble-outline" size={18} color="#0E4AA4" />
              <Text style={styles.messagesBtnText}>Wiadomości</Text>
            </Pressable>
            {messagesUnreadCount > 0 ? (
              <View style={styles.messagesBadge}>
                <Text style={styles.messagesBadgeText}>
                  {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profil publiczny</Text>
          <Text style={styles.note}>
            Opis, oceny i statystyki widzą inni użytkownicy (np. po kliknięciu Twojego zdjęcia w czacie).
          </Text>
          {uid ? (
            <Pressable
              style={styles.messagesBtn}
              onPress={() => router.push({ pathname: '/user/[id]', params: { id: uid } })}>
              <MaterialIcons name="visibility" size={18} color="#0E4AA4" />
              <Text style={styles.messagesBtnText}>Podgląd profilu publicznego</Text>
            </Pressable>
          ) : null}
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={publicBio}
            onChangeText={(v) => {
              setIsEditing(true);
              setPublicBio(v);
            }}
            placeholder="Krótki opis (doświadczenie, specjalizacja, obszar…)"
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dane osobowe</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={(v) => {
              setIsEditing(true);
              setFullName(v);
            }}
            placeholder="Imię i nazwisko"
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
          <Pressable style={styles.saveBtn} onPress={onSave}>
            <MaterialIcons name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Zapisz profil</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardTitle}>Moje zgłoszenia</Text>
            <Pressable onPress={() => router.push('/applications/sent' as never)}>
              <Text style={styles.seeAllLink}>Zobacz wszystkie</Text>
            </Pressable>
          </View>
          {loadingMyApplications ? (
            <Text style={styles.note}>Ładowanie...</Text>
          ) : myApplications.length === 0 ? (
            <Text style={styles.note}>Nie wysłałeś jeszcze żadnego zgłoszenia.</Text>
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
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardTitle}>Zgłoszenia do moich ogłoszeń</Text>
            <Pressable onPress={() => router.push('/applications/incoming' as never)}>
              <Text style={styles.seeAllLink}>Zobacz wszystkie</Text>
            </Pressable>
          </View>
          {loadingIncomingApplications ? (
            <Text style={styles.note}>Ładowanie...</Text>
          ) : incomingApplications.length === 0 ? (
            <Text style={styles.note}>Brak zgłoszeń do Twoich ogłoszeń.</Text>
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
                  {app.applicantName || 'Użytkownik'} • {app.message}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Pressable style={styles.logoutBtn} onPress={onLogout}>
            <MaterialIcons name="logout" size={18} color="#B91C1C" />
            <Text style={styles.logoutText}>Wyloguj</Text>
          </Pressable>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F8' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: {
    backgroundColor: '#0E4AA4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#DCEBFF', marginTop: 6 },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(248, 250, 252, 0.9)',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE6F2',
    padding: 14,
    gap: 10,
  },
  cardTitle: { color: '#10233E', fontSize: 15, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAllLink: { color: '#0E4AA4', fontWeight: '700', fontSize: 12 },
  roleReadonly: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  note: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  messagesBtnWrap: { marginTop: 4, position: 'relative', alignSelf: 'stretch' },
  messagesBtn: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  messagesBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messagesBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  messagesBtnText: { color: '#0E4AA4', fontWeight: '700' },
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
  bioInput: { minHeight: 88, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 11,
    backgroundColor: '#0E4AA4',
    paddingVertical: 11,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
  applicationRow: {
    borderWidth: 1,
    borderColor: '#DFE6F2',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F8FAFD',
    gap: 4,
  },
  applicationHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  applicationTitle: { color: '#0F172A', fontWeight: '700', flex: 1 },
  applicationStatus: {
    color: '#1E3A8A',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  applicationMeta: { color: '#64748B', fontSize: 12 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 11,
    backgroundColor: '#FFF5F5',
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#B91C1C', fontWeight: '700' },
  message: { textAlign: 'center', color: '#0E4AA4', fontWeight: '600' },
});
