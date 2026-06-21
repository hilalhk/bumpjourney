import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

export async function uploadPhoto(
  asset: ImagePicker.ImagePickerAsset,
  kind: 'bump' | 'ultrasound',
  weekNumber: number | null,
  caption: string
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const ext = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${user.id}/${kind}_${Date.now()}.${ext}`;

  const res = await fetch(asset.uri);
  const arrayBuffer = await res.arrayBuffer();

  const { error: upErr } = await supabase.storage
    .from('photos')
    .upload(path, arrayBuffer, {
      contentType: asset.mimeType ?? `image/${ext}`,
      upsert: false,
    });
  if (upErr) return { error: upErr.message };

  const { error: dbErr } = await supabase.from('photos').insert({
    user_id: user.id,
    storage_path: path,
    kind,
    week_number: weekNumber,
    caption: caption.trim() || null,
  });
  if (dbErr) return { error: dbErr.message };

  return { error: null };
}

export async function signedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('photos').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function deletePhoto(id: string, path: string): Promise<void> {
  await supabase.storage.from('photos').remove([path]);
  await supabase.from('photos').delete().eq('id', id);
}