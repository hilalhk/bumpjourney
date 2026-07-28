import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeCardStyle } from '../components/Card';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { displayTime, todayStr } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts } from '../lib/theme';

type Appt = { id: string; title: string; appt_at: string; location: string | null };
type RawMed = { id: string; name: string; dosage: string | null; times: string[]; start_date: string };
type Med = { id: string; name: string; dosage: string | null; pendingTimes: string[] };

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

type CardProps = { icon: IconName; title: string; when: string; note?: string | null; onPress: () => void };

// Module scope: a component declared inside another is a new type each render,
// so React remounts the whole subtree instead of updating it.
function Card({ icon, title, when, note, onPress }: CardProps) {
  const { colors, gradient } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
        <Icon name={icon} size={20} color={colors.onAccent} strokeWidth={icon === 'pill' ? 1.8 : 2} />
      </LinearGradient>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardWhen}>{when}</Text>
        {note ? <Text style={styles.cardNote}>{note}</Text> : null}
      </View>
      <Icon name="chevron-right" size={18} color={colors.accentDeep} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

export default function Notifications() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const nowIso = new Date().toISOString();
    const today = todayStr();
    const [{ data: apptData }, { data: medData }, { data: logData }] = await Promise.all([
      supabase.from('appointments').select('id, title, appt_at, location').gte('appt_at', nowIso).order('appt_at', { ascending: true }),
      supabase.from('medications').select('id, name, dosage, times, start_date').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('medication_logs').select('medication_id, scheduled_time').eq('log_date', today),
    ]);
    const takenToday = new Set((logData ?? []).map((l) => `${l.medication_id}|${l.scheduled_time}`));
    const pendingMeds: Med[] = (medData ?? [])
      .filter((m: RawMed) => m.times?.length > 0 && (!m.start_date || m.start_date <= today))
      .map((m: RawMed) => ({ id: m.id, name: m.name, dosage: m.dosage, pendingTimes: m.times.filter((t) => !takenToday.has(`${m.id}|${t}`)) }))
      .filter((m) => m.pendingTimes.length > 0);
    setAppts(apptData ?? []);
    setMeds(pendingMeds);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isEmpty = !loading && appts.length === 0 && meds.length === 0;

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Notifications" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {loading && <Text style={styles.empty}>Loading…</Text>}
        {isEmpty && (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}><Icon name="bell" size={28} color={colors.accent} strokeWidth={1.8} /></View>
            <Text style={styles.empty}>You{"'"}re all caught up. Appointment and medication reminders will appear here.</Text>
          </View>
        )}

        {appts.length > 0 && <Text style={styles.sectionLabel}>Upcoming appointments</Text>}
        {appts.map((a) => (
          <Card key={a.id} icon="calendar" title={a.title} when={fmtDateTime(a.appt_at)} note="Reminder 24 hours before" onPress={() => router.push('/appointments')} />
        ))}

        {meds.length > 0 && <Text style={styles.sectionLabel}>Medications due today</Text>}
        {meds.map((m) => (
          <Card key={m.id} icon="pill" title={m.name} when={`Due today at ${m.pendingTimes.map(displayTime).join(', ')}`} note={m.dosage} onPress={() => router.push('/medications')} />
        ))}

        {!isEmpty && !loading && (
          <Text style={styles.note}>Reminders are delivered as device notifications. Manage them from the appointment or medication screens.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: c.muted, marginTop: 16, marginBottom: 12, marginHorizontal: 2 },
  emptyBox: { alignItems: 'center', marginTop: 48, gap: 16 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 20, color: c.muted, textAlign: 'center', paddingHorizontal: 24 },
  card: { ...makeCardStyle(c), flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.display, fontSize: 15, color: c.ink },
  cardWhen: { fontFamily: fonts.body5, fontSize: 12, color: c.accentDeep, marginTop: 2 },
  cardNote: { fontFamily: fonts.body5, fontSize: 11, color: c.muted, marginTop: 2 },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: c.faint, textAlign: 'center', marginTop: 16 },
});
