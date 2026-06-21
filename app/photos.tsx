import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Modal, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { cardStyle } from '../components/Card';
import GradientButton from '../components/GradientButton';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { deletePhoto, pickImage, signedUrl, uploadPhoto } from '../lib/photoUpload';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, shadow } from '../lib/theme';

type Photo = {
  id: string; storage_path: string; kind: string;
  week_number: number | null; caption: string | null; taken_on: string; url?: string;
};

export default function Photos() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const [kind, setKind] = useState<'bump' | 'ultrasound'>(params.kind === 'ultrasound' ? 'ultrasound' : 'bump');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);

  const [pending, setPending] = useState<{ uri: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<any>(null);

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase.from('photos').select('id, storage_path, kind, week_number, caption, taken_on').eq('kind', kind).order('taken_on', { ascending: true });
    const withUrls = await Promise.all((data ?? []).map(async (p) => ({ ...p, url: (await signedUrl(p.storage_path)) ?? undefined })));
    setPhotos(withUrls);
    setLoading(false);
  }, [kind]);

  useFocusEffect(useCallback(() => { setLoading(true); loadPhotos(); }, [loadPhotos]));

  useEffect(() => {
    (async () => {
      const { data: preg } = await supabase.from('pregnancies').select('due_date').eq('is_active', true).order('created_at', { ascending: false }).limit(1);
      if (preg && preg.length > 0) {
        const due = new Date(preg[0].due_date + 'T00:00:00');
        const daysToGo = Math.round((due.getTime() - Date.now()) / 86400000);
        setCurrentWeek(Math.max(0, Math.floor((280 - daysToGo) / 7)));
      }
    })();
  }, []);

  async function onAdd() {
    const asset = await pickImage();
    if (!asset) return;
    setPendingAsset(asset); setPending({ uri: asset.uri }); setCaption('');
  }

  async function confirmUpload() {
    if (!pendingAsset) return;
    setUploading(true);
    const { error } = await uploadPhoto(pendingAsset, kind, currentWeek, caption);
    setUploading(false);
    if (error) { Alert.alert('Upload failed', error); return; }
    setPending(null); setPendingAsset(null); setCaption(''); setLoading(true); loadPhotos();
  }

  function confirmDelete(p: Photo) {
    Alert.alert('Delete photo', 'Remove this photo permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePhoto(p.id, p.storage_path); setLoading(true); loadPhotos(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar
        title="Photos"
        right={
          <TouchableOpacity onPress={onAdd} activeOpacity={0.85} style={shadow.accent}>
            <LinearGradient colors={['#E5588A', '#B83E66']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
              <Icon name="plus" size={20} color={colors.white} strokeWidth={2.4} />
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      <View style={styles.toggle}>
        <TouchableOpacity style={[styles.toggleBtn, kind === 'bump' && styles.toggleOn]} onPress={() => setKind('bump')}>
          <Text style={[styles.toggleText, kind === 'bump' && styles.toggleTextOn]}>Bump timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, kind === 'ultrasound' && styles.toggleOn]} onPress={() => setKind('ultrasound')}>
          <Text style={[styles.toggleText, kind === 'ultrasound' && styles.toggleTextOn]}>Ultrasound vault</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />}
        {!loading && photos.length === 0 && (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}><Icon name="images" size={28} color={colors.accent} /></View>
            <Text style={styles.emptyText}>{kind === 'bump' ? 'No bump photos yet. Tap + to add your first.' : 'No ultrasound photos yet. Tap + to add one.'}</Text>
          </View>
        )}
        {!loading && photos.map((p) => (
          <View key={p.id} style={styles.photoCard}>
            {p.url ? (
              <Image source={{ uri: p.url }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}><ActivityIndicator color={colors.accent} /></View>
            )}
            <View style={styles.photoMeta}>
              <View style={{ flex: 1, minWidth: 0 }}>
                {p.week_number != null && <Text style={styles.photoWeek}>Week {p.week_number}</Text>}
                <Text style={styles.photoDate}>{new Date(p.taken_on + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                {p.caption ? <Text style={styles.photoCaption}>{p.caption}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => confirmDelete(p)} hitSlop={6}><Icon name="trash" size={18} color={colors.faint} /></TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={styles.note}>Your photos are private and stored securely. Only you can see them.</Text>
      </ScrollView>

      <Modal visible={!!pending} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add a caption</Text>
            {pending && <Image source={{ uri: pending.uri }} style={styles.preview} resizeMode="cover" />}
            <TextInput style={styles.captionInput} placeholder="Optional caption…" placeholderTextColor={colors.faint} value={caption} onChangeText={setCaption} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setPending(null); setPendingAsset(null); }} disabled={uploading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <GradientButton label={uploading ? 'Uploading…' : 'Save photo'} onPress={confirmUpload} disabled={uploading} style={{ flex: 2 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  toggle: { flexDirection: 'row', gap: 6, marginHorizontal: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleOn: { backgroundColor: colors.accent },
  toggleText: { fontFamily: fonts.body6, fontSize: 12, color: colors.muted },
  toggleTextOn: { color: colors.white },
  emptyBox: { alignItems: 'center', marginTop: 48, gap: 16 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  photoCard: { ...cardStyle, overflow: 'hidden', marginBottom: 12, padding: 0 },
  photo: { width: '100%', height: 280, backgroundColor: '#EEE' },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  photoMeta: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 8 },
  photoWeek: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accentDeep },
  photoDate: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 2 },
  photoCaption: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 18, color: '#6E5560', marginTop: 4 },
  note: { fontFamily: fonts.body5, fontSize: 11, color: colors.faint, textAlign: 'center', marginVertical: 16 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(58,22,38,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  modalTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink, marginBottom: 12 },
  preview: { width: '100%', height: 200, borderRadius: radius.card, marginBottom: 12, backgroundColor: '#EEE' },
  captionInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 13, fontFamily: fonts.body5, fontSize: 14, color: colors.ink },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'center' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: radius.cta, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  cancelText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.bodyGrey },
});
