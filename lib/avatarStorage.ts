import * as Crypto from 'expo-crypto';
import * as ImageManipulator from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { getFirebaseStorage } from '@/lib/firebaseStorage';

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}

/** Wgrywa awatar użytkownika pod `avatars/{uid}/{fileKey}.jpg`. */
export async function uploadUserAvatar(input: {
  uid: string;
  localUri: string;
}): Promise<string> {
  const fileKey = Crypto.randomUUID();
  const storage = getFirebaseStorage();
  const path = `avatars/${input.uid}/${fileKey}.jpg`;

  const result = await ImageManipulator.manipulateAsync(
    input.localUri,
    [{ resize: { width: 512 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
  );

  const blob = await uriToBlob(result.uri);
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(fileRef);
}
