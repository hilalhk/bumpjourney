import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { showAlert } from '../components/ConfirmDialog';
import GradientButton from '../components/GradientButton';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient, radius, shadow } from '../lib/theme';

type Info = {
  doctor_name: string; doctor_phone: string; hospital_name: string; hospital_address: string;
  blood_group: string; emergency_name: string; emergency_phone: string; allergies: string; medications: string;
};

const EMPTY: Info = {
  doctor_name: '', doctor_phone: '', hospital_name: '', hospital_address: '',
  blood_group: '', emergency_name: '', emergency_phone: '', allergies: '', medications: '',
};

export default function EmergencyInfo() {
  const router = useRouter();
  const [info, setInfo] = useState<Info>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasData, setHasData] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('emergency_info').select('*').maybeSingle();
    if (data) {
      setInfo({
        doctor_name: data.doctor_name ?? '', doctor_phone: data.doctor_phone ?? '',
        hospital_name: data.hospital_name ?? '', hospital_address: data.hospital_address ?? '',
        blood_group: data.blood_group ?? '', emergency_name: data.emergency_name ?? '',
        emergency_phone: data.emergency_phone ?? '', allergies: data.allergies ?? '', medications: data.medications ?? '',
      });
      setHasData(true);
    } else {
      setEditing(true);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function set<K extends keyof Info>(key: K, value: string) {
    setInfo((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('emergency_info').upsert(
      { user_id: user!.id, ...info, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    if (error) { showAlert({ title: 'Error', message: error.message, tone: 'error' }); return; }
    setHasData(true);
    setEditing(false);
  }

  function call(phone: string) {
    const clean = phone.replace(/[^0-9+]/g, '');
    if (clean) Linking.openURL(`tel:${clean}`);
  }
  function openMap(address: string) {
    const q = encodeURIComponent(address);
    Linking.openURL(Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `geo:0,0?q=${q}`);
  }

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.muted}>Loading…</Text></View>;
  }

  // ── EDIT ──
  if (editing) {
    const field = (label: string, key: keyof Info, placeholder: string, keyboard?: any) => (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={colors.faint}
          value={info[key]} onChangeText={(v) => set(key, v)} keyboardType={keyboard} />
      </View>
    );
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenGlow />
        <TopBar
          title="Emergency info"
          onBack={() => (hasData ? setEditing(false) : router.back())}
          right={<TouchableOpacity onPress={save} disabled={saving} hitSlop={8}><Text style={styles.saveTop}>{saving ? '…' : 'Save'}</Text></TouchableOpacity>}
        />
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHead}>Doctor / midwife</Text>
          {field('Name', 'doctor_name', 'Dr. …')}
          {field('Phone', 'doctor_phone', 'Phone number', 'phone-pad')}
          <Text style={styles.sectionHead}>Hospital</Text>
          {field('Hospital name', 'hospital_name', 'Where you plan to deliver')}
          {field('Address', 'hospital_address', 'Full address')}
          <Text style={styles.sectionHead}>Medical</Text>
          <View style={styles.twoCol}>
            <View style={{ width: 96 }}>
              <Text style={styles.fieldLabel}>Blood group</Text>
              <TextInput style={styles.input} placeholder="O+" placeholderTextColor={colors.faint} value={info.blood_group} onChangeText={(v) => set('blood_group', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Allergies</Text>
              <TextInput style={styles.input} placeholder="Any known allergies" placeholderTextColor={colors.faint} value={info.allergies} onChangeText={(v) => set('allergies', v)} />
            </View>
          </View>
          {field('Current medications', 'medications', 'Any medications you take')}
          <Text style={styles.sectionHead}>Emergency contact</Text>
          {field('Name', 'emergency_name', 'Who to call')}
          {field('Phone', 'emergency_phone', 'Phone number', 'phone-pad')}
          <GradientButton label={saving ? 'Saving…' : 'Save emergency info'} onPress={save} disabled={saving} style={{ marginTop: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── VIEW ──
  const Row = ({ icon, label, value, onPress, actionIcon, last }: { icon: IconName; label: string; value: string; onPress?: () => void; actionIcon?: IconName; last?: boolean }) => {
    if (!value) return null;
    return (
      <TouchableOpacity style={[styles.row, !last && styles.rowBorder]} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
        <View style={styles.rowIcon}><Icon name={icon} size={18} color={colors.accent} strokeWidth={1.9} /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
        {onPress && actionIcon && (
          <View style={styles.action}><Icon name={actionIcon} size={15} color={colors.accentDeep} /></View>
        )}
      </TouchableOpacity>
    );
  };

  // build rows so borders land correctly (skip empties)
  const rows = [
    { icon: 'medical' as IconName, label: 'Doctor / midwife', value: info.doctor_name },
    { icon: 'phone' as IconName, label: 'Call doctor', value: info.doctor_phone, onPress: () => call(info.doctor_phone), actionIcon: 'phone' as IconName },
    { icon: 'hospital' as IconName, label: 'Hospital', value: info.hospital_name },
    { icon: 'pin' as IconName, label: info.hospital_address || '', value: info.hospital_address ? 'Open in maps' : '', onPress: () => openMap(info.hospital_address), actionIcon: 'navigate' as IconName },
    { icon: 'blood' as IconName, label: 'Blood group', value: info.blood_group },
    { icon: 'alert' as IconName, label: 'Allergies', value: info.allergies },
    { icon: 'bandage' as IconName, label: 'Medications', value: info.medications },
    { icon: 'person' as IconName, label: 'Emergency contact', value: info.emergency_name },
    { icon: 'phone' as IconName, label: 'Call contact', value: info.emergency_phone, onPress: () => call(info.emergency_phone), actionIcon: 'phone' as IconName },
  ].filter((r) => r.value);

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar
        title="Emergency info"
        right={<TouchableOpacity style={styles.circle} onPress={() => setEditing(true)} activeOpacity={0.85}><Icon name="pencil" size={17} color={colors.accent} /></TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* emergency-services call banner */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => Linking.openURL('tel:911')} style={shadow.accent}>
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
            <View style={styles.bannerIcon}><Icon name="phone" size={24} color={colors.white} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.bannerTitle}>Emergency services</Text>
              <Text style={styles.bannerSub}>Tap to call 911 right away</Text>
            </View>
            <View style={styles.bannerCall}><Text style={styles.bannerCallText}>Call</Text></View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.card}>
          {rows.map((r, i) => (
            <Row key={r.label + i} icon={r.icon} label={r.label} value={r.value} onPress={r.onPress} actionIcon={r.actionIcon} last={i === rows.length - 1} />
          ))}
        </View>

        <Text style={styles.note}>Tap a phone number to call, or the hospital address to open directions. Keep this up to date.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  muted: { fontFamily: fonts.body5, color: colors.muted },
  saveTop: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.accent, paddingHorizontal: 6 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center' },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: radius.tile, padding: 16 },
  bannerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.white },
  bannerSub: { fontFamily: fonts.body5, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  bannerCall: { backgroundColor: colors.white, borderRadius: 100, paddingVertical: 9, paddingHorizontal: 16 },
  bannerCallText: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accentDeep },

  card: { ...cardStyle, paddingHorizontal: 16, paddingVertical: 4, marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  rowIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.body5, fontSize: 11, color: colors.muted },
  rowValue: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink, marginTop: 3 },
  action: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },

  sectionHead: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accentDeep, marginTop: 22, marginBottom: 11 },
  fieldLabel: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 13, fontFamily: fonts.body5, fontSize: 14, color: colors.ink },
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, textAlign: 'center', marginTop: 16 },
});
