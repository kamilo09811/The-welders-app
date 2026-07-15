import * as Crypto from 'expo-crypto';
import * as ImageManipulator from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { getFirebaseStorage } from '@/lib/firebaseStorage';

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}

/** Wgrywa zdjęcie czatu (wersja pełna + miniatura) pod `chat_media/{conversationId}/{uid}/…`. */
export async function uploadChatImagePair(input: {
  conversationId: string;
  uid: string;
  localUri: string;
}): Promise<{ imageUrl: string; thumbUrl: string }> {
  const fileKey = Crypto.randomUUID();
  const storage = getFirebaseStorage();
  const base = `chat_media/${input.conversationId}/${input.uid}/${fileKey}`;

  const thumbResult = await ImageManipulator.manipulateAsync(
    input.localUri,
    [{ resize: { width: 360 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
  );
  const fullResult = await ImageManipulator.manipulateAsync(
    input.localUri,
    [{ resize: { width: 1400 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
  );

  const thumbBlob = await uriToBlob(thumbResult.uri);
  const fullBlob = await uriToBlob(fullResult.uri);

  const thumbRef = ref(storage, `${base}_thumb.jpg`);
  const fullRef = ref(storage, `${base}.jpg`);

  await uploadBytes(thumbRef, thumbBlob, { contentType: 'image/jpeg' });
  await uploadBytes(fullRef, fullBlob, { contentType: 'image/jpeg' });

  const thumbUrl = await getDownloadURL(thumbRef);
  const imageUrl = await getDownloadURL(fullRef);
  return { imageUrl, thumbUrl };
}
