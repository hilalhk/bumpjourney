import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { displayTime, todayStr } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient, shadow } from '../lib/theme';

type Med = {
  id: string; name: string; dosage: string | null; frequency: string;
  times: string[]; notes: string | null; start_date: string; notify_ids: string[] | null;
};
type MedView = Med & { todayTimes: string[]; takenCount: number; allTaken: boolean };

export default function Medications() {
  const router = useRouter();
  const [meds, setMeds] = useState<MedView[]>([]);
  const [loading, setLoading] = useState(true);
  const [doseTotal, setDoseTotal] = useState(0);
  const [doseTaken, setDoseTaken] = useState(0);
  const [nextDose, setNextDose] = useState<{ name: string; time: string } | null>(null);

  const load = useCallback(async () => {
    const today = todayStr();
    const [{ data: medRows }, { data: logs }] = await Promise.all([
      supabase.from('medications').select('id, name, dosage, frequency, times, notes, start_date, notify_ids')
        .eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('medication_logs').select('medication_id, scheduled_time').eq('log_date', today),
    ]);
    const taken = new Set((logs ?? []).map((l) => `${l.medication_id}|${l.scheduled_time}`));

    let total = 0, takenN = 0;
    let next: { name: string; time: string } | null = null;
    const views: MedView[] = (medRows ?? []).map((m: Med) => {
      const active = !m.start_date || m.start_date <= today;
      const todayTimes = active ? (m.times ?? []) : [];
      const takenCount = todayTimes.filter((t) => taken.has(`${m.id}|${t}`)).length;
      total += todayTimes.length;
      takenN += takenCount;
      todayTimes.forEach((t) => {
        if (!taken.has(`${m.id}|${t}`) && (!next || t < next.time)) next = { name: m.name, time: t };
      });
      return { ...m, todayTimes, takenCount, allTaken: todayTimes.length > 0 && takenCount === todayTimes.length };
    });
    setMeds(views);
    setDoseTotal(total);
    setDoseTaken(takenN);
    setNextDose(next);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pct = doseTotal > 0 ? Math.round((doseTaken / doseTotal) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar
        title="Medications"
        right={
          <TouchableOpacity onPress={() => router.push('/medication-edit')} activeOpacity={0.85} style={shadow.accent}>
            <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
              <Icon name="plus" size={20} color={colors.white} strokeWidth={2.4} />
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {loading && <Text style={styles.empty}>Loading…</Text>}
        {!loading && meds.length === 0 && (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}><Icon name="pill" size={28} color={colors.accent} strokeWidth={1.8} /></View>
            <Text style={styles.empty}>No medications yet. Tap + to add your supplements or prescriptions.</Text>
          </View>
        )}

        {!loading && doseTotal > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressTitle}>Today&apos;s doses</Text>
              <Text style={styles.progressCount}>{doseTaken} of {doseTotal} taken</Text>
            </View>
            <View style={styles.track}>
              <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${pct}%` }]} />
            </View>
            {nextDose && (
              <View style={styles.nextRow}>
                <Icon name="clock" size={14} color={colors.accent} />
                <Text style={styles.nextText}>Next: {nextDose.name} at {displayTime(nextDose.time)}</Text>
              </View>
            )}
          </View>
        )}

        {meds.length > 0 && <Text style={styles.sectionLabel}>Active</Text>}
        {meds.map((m) => (
          <TouchableOpacity key={m.id} style={styles.card} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/medication-detail', params: { id: m.id } })}>
            <View style={styles.iconBox}><Icon name="pill" size={20} color={colors.accent} strokeWidth={1.8} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.medName}>{m.name}</Text>
              <Text style={styles.medMeta}>{m.dosage ? `${m.dosage} · ` : ''}{(m.times ?? []).map(displayTime).join(', ')}</Text>
            </View>
            {m.allTaken ? (
              <View style={styles.takenPill}>
                <Icon name="check" size={12} color={colors.accentDeep} strokeWidth={3} />
                <Text style={styles.takenText}>Taken</Text>
              </View>
            ) : (
              <View style={styles.dueRadio} />
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.note}>For tracking only. Always follow your healthcare provider{"'"}s instructions.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 48, gap: 16 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },

  progressCard: { ...cardStyle, padding: 16 },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  progressCount: { fontFamily: fonts.body6, fontSize: 12, color: colors.accentDeep },
  track: { height: 8, borderRadius: 100, backgroundColor: colors.cardBorder, marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 100 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  nextText: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },

  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted, marginTop: 22, marginBottom: 12, marginHorizontal: 2 },
  card: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  medName: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  medMeta: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 4 },
  takenPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentSoft, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 10 },
  takenText: { fontFamily: fonts.body6, fontSize: 10, color: colors.accentDeep },
  dueRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E3D2DA' },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, textAlign: 'center', marginTop: 16 },
});
