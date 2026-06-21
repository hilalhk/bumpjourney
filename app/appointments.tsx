import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { cardStyle } from '../components/Card';
import DateTimeModal from '../components/DateTimeModal';
import GradientButton from '../components/GradientButton';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { cancelReminder, ensurePermission, scheduleApptReminder } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient, radius, shadow } from '../lib/theme';

type Appt = {
  id: string; title: string; appt_at: string;
  location: string | null; notes: string | null; notify_id: string | null;
};

const COMMON_TITLES = ['Prenatal checkup', 'Ultrasound scan', 'Blood test', 'Glucose test', 'Midwife visit'];

export default function Appointments() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState(new Date());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('appointments')
      .select('id, title, appt_at, location, notes, notify_id')
      .order('appt_at', { ascending: true });
    setAppts(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function openForm() {
    setTitle('');
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    setWhen(d); setLocation(''); setNotes(''); setShowForm(true);
  }

  async function save() {
    if (!title.trim()) { Alert.alert('Add a title', 'What is this appointment for?'); return; }
    setSaving(true);
    let notifyId: string | null = null;
    const granted = await ensurePermission();
    if (granted) notifyId = await scheduleApptReminder(title.trim(), when, 24);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('appointments').insert({
      user_id: user!.id, title: title.trim(), appt_at: when.toISOString(),
      location: location.trim() || null, notes: notes.trim() || null, notify_id: notifyId,
    });
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setShowForm(false);
    Alert.alert('Saved', granted ? "We'll remind you 24 hours before." : 'Appointment saved. Enable notifications in settings to get reminders.');
    load();
  }

  function confirmDelete(a: Appt) {
    Alert.alert('Delete appointment', `Remove "${a.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await cancelReminder(a.notify_id);
        await supabase.from('appointments').delete().eq('id', a.id);
        load();
      } },
    ]);
  }

  const now = new Date();
  const upcoming = appts.filter((a) => new Date(a.appt_at) >= now);
  const past = appts.filter((a) => new Date(a.appt_at) < now).reverse();
  const next = upcoming[0];

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const daysUntil = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / 86400000);

  function renderAppt(a: Appt, kind: 'next' | 'upcoming' | 'past') {
    const d = new Date(a.appt_at);
    return (
      <View key={a.id} style={[styles.card, kind === 'past' && styles.cardPast]}>
        {kind === 'next' ? (
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dateBox}>
            <Text style={styles.dateDayOn}>{d.getDate()}</Text>
            <Text style={styles.dateMonOn}>{d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.dateBox, kind === 'past' ? styles.dateBoxPast : styles.dateBoxSoft]}>
            <Text style={[styles.dateDay, kind === 'past' && styles.dateDayPast]}>{d.getDate()}</Text>
            <Text style={[styles.dateMon, kind === 'past' && styles.dateMonPast]}>{d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle}>{a.title}</Text>
          <Text style={styles.cardWhen}>{fmtDate(a.appt_at)} · {fmtTime(a.appt_at)}</Text>
          {a.location ? (
            <View style={styles.metaRow}>
              <Icon name="pin" size={12} color={colors.muted} />
              <Text style={styles.metaText}>{a.location}</Text>
            </View>
          ) : null}
          {a.notes ? <Text style={styles.notes}>{a.notes}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => confirmDelete(a)} style={styles.trash} hitSlop={6}>
          <Icon name="trash" size={16} color={colors.faint} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar
        title="Appointments"
        right={
          <TouchableOpacity onPress={openForm} activeOpacity={0.85} style={shadow.accent}>
            <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
              <Icon name="plus" size={20} color={colors.white} strokeWidth={2.4} />
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {loading && <Text style={styles.empty}>Loading…</Text>}
        {!loading && appts.length === 0 && (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}><Icon name="calendar" size={28} color={colors.accent} /></View>
            <Text style={styles.empty}>No appointments yet. Tap + to add one.</Text>
          </View>
        )}

        {next && (
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.banner, shadow.accent]}>
            <View style={styles.bannerIcon}><Icon name="calendar" size={24} color={colors.white} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.bannerLabel}>Next up · {daysUntil(next.appt_at) <= 0 ? 'today' : `in ${daysUntil(next.appt_at)} days`}</Text>
              <Text style={styles.bannerTitle} numberOfLines={1}>{next.title}</Text>
              <Text style={styles.bannerWhen}>{fmtDate(next.appt_at)} · {fmtTime(next.appt_at)}</Text>
            </View>
          </LinearGradient>
        )}

        {upcoming.length > 0 && <Text style={styles.sectionLabel}>Upcoming</Text>}
        {upcoming.map((a, i) => renderAppt(a, i === 0 ? 'next' : 'upcoming'))}

        {past.length > 0 && <Text style={styles.sectionLabel}>Past</Text>}
        {past.map((a) => renderAppt(a, 'past'))}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>New appointment</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} hitSlop={8}><Icon name="close" size={22} color={colors.muted} strokeWidth={2.2} /></TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput style={styles.input} placeholder="What's this appointment for?" placeholderTextColor={colors.faint} value={title} onChangeText={setTitle} />
              <View style={styles.chips}>
                {COMMON_TITLES.map((t) => {
                  const on = title === t;
                  return (
                    <TouchableOpacity key={t} style={[styles.chip, on && styles.chipOn]} onPress={() => setTitle(t)}>
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>When</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity style={styles.dtBtn} onPress={() => setShowDate(true)}>
                  <Icon name="calendar" size={16} color={colors.accent} />
                  <Text style={styles.dtText}>{when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dtBtn} onPress={() => setShowTime(true)}>
                  <Icon name="clock" size={16} color={colors.accent} />
                  <Text style={styles.dtText}>{fmtTime(when.toISOString())}</Text>
                </TouchableOpacity>
              </View>

              <DateTimeModal visible={showDate} value={when} mode="date"
                onConfirm={(sel) => { setShowDate(false); const d = new Date(when); d.setFullYear(sel.getFullYear(), sel.getMonth(), sel.getDate()); setWhen(d); }}
                onCancel={() => setShowDate(false)} />
              <DateTimeModal visible={showTime} value={when} mode="time"
                onConfirm={(sel) => { setShowTime(false); const d = new Date(when); d.setHours(sel.getHours(), sel.getMinutes(), 0, 0); setWhen(d); }}
                onCancel={() => setShowTime(false)} />

              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput style={styles.input} placeholder="Clinic or hospital (optional)" placeholderTextColor={colors.faint} value={location} onChangeText={setLocation} />

              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Anything to remember (optional)" placeholderTextColor={colors.faint} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />

              <View style={styles.reminderPill}>
                <Icon name="bell" size={16} color={colors.accentDeep} strokeWidth={1.8} />
                <Text style={styles.reminderText}>We{"'"}ll remind you 24 hours before.</Text>
              </View>

              <GradientButton label={saving ? 'Saving…' : 'Save appointment'} onPress={save} disabled={saving} style={{ marginTop: 18 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted, marginTop: 22, marginBottom: 12, marginHorizontal: 2 },
  emptyBox: { alignItems: 'center', marginTop: 48, gap: 16 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted, textAlign: 'center' },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: radius.tile, padding: 16, marginTop: 4 },
  bannerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bannerLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' },
  bannerTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.white, marginTop: 6 },
  bannerWhen: { fontFamily: fonts.body5, fontSize: 11, color: 'rgba(255,255,255,0.88)', marginTop: 4 },

  card: { ...cardStyle, flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 10 },
  cardPast: { opacity: 0.6 },
  dateBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dateBoxSoft: { backgroundColor: colors.accentSoft },
  dateBoxPast: { backgroundColor: '#EFE6EA' },
  dateDay: { fontFamily: fonts.display, fontSize: 19, color: colors.accentDeep },
  dateMon: { fontFamily: fonts.body6, fontSize: 9, letterSpacing: 0.6, color: colors.accent, marginTop: 2 },
  dateDayOn: { fontFamily: fonts.display, fontSize: 19, color: colors.white },
  dateMonOn: { fontFamily: fonts.body6, fontSize: 9, letterSpacing: 0.6, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  dateDayPast: { color: '#8A7680' },
  dateMonPast: { color: colors.muted },
  cardTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  cardWhen: { fontFamily: fonts.body5, fontSize: 12, color: colors.accentDeep, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  metaText: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },
  notes: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 6 },
  trash: { padding: 4 },

  modalWrap: { flex: 1, backgroundColor: 'rgba(58,22,38,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '90%' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  fieldLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted, marginBottom: 9, marginTop: 4 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 14, fontFamily: fonts.body5, fontSize: 15, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 100, backgroundColor: colors.accentSoft },
  chipOn: { backgroundColor: colors.accent },
  chipText: { fontFamily: fonts.body5, fontSize: 12, color: colors.accentDeep },
  chipTextOn: { color: colors.white },
  dateTimeRow: { flexDirection: 'row', gap: 10 },
  dtBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 13 },
  dtText: { fontFamily: fonts.body5, fontSize: 13, color: colors.ink },
  reminderPill: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.accentSoft, borderRadius: 14, padding: 12, marginTop: 18 },
  reminderText: { fontFamily: fonts.body5, fontSize: 12, color: colors.accentDeep },
});
