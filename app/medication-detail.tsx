import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { makeCardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { displayTime } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

type Med = {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string;
  times: string[];
  start_date: string;
  notes: string | null;
};

function dateKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export default function MedicationDetail() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [med, setMed] = useState<Med | null>(null);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [takenByDay, setTakenByDay] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadMed = useCallback(async () => {
    const { data } = await supabase.from('medications').select('*').eq('id', params.id).maybeSingle();
    setMed(data);
    setLoading(false);
  }, [params.id]);

  const loadLogs = useCallback(async () => {
    if (!med) return;
    const base = new Date();
    base.setMonth(base.getMonth() + monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const { data } = await supabase
      .from('medication_logs')
      .select('log_date')
      .eq('medication_id', params.id)
      .gte('log_date', dateKey(first))
      .lte('log_date', dateKey(last));

    const counts: Record<string, number> = {};
    (data ?? []).forEach((r) => {
      counts[r.log_date] = (counts[r.log_date] ?? 0) + 1;
    });
    setTakenByDay(counts);
  }, [med, monthOffset, params.id]);

  useFocusEffect(useCallback(() => { loadMed(); }, [loadMed]));
  useEffect(() => { loadLogs(); }, [loadLogs]);

  if (loading || !med) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  const dosesPerDay = med.times.length;
  const base = new Date();
  base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear();
  const month = base.getMonth();
  const monthName = base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const startDate = new Date(med.start_date + 'T00:00:00');
  const today = new Date();
  const todayKey = dateKey(today);

  // Build adherence: count days from start_date (or month start) up to today (or month end)
  let takenDoses = 0;
  let scheduledDoses = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const key = dateKey(cellDate);
    if (cellDate < startDate) continue;        // before they started
    if (cellDate > today) continue;            // future
    scheduledDoses += dosesPerDay;
    takenDoses += Math.min(takenByDay[key] ?? 0, dosesPerDay);
  }
  const adherence = scheduledDoses > 0 ? Math.round((takenDoses / scheduledDoses) * 100) : null;

  // Calendar cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function cellState(day: number): 'none' | 'full' | 'partial' | 'missed' | 'future' | 'pre' {
    const cellDate = new Date(year, month, day);
    const key = dateKey(cellDate);
    if (cellDate < startDate) return 'pre';
    if (cellDate > today) return 'future';
    const taken = takenByDay[key] ?? 0;
    if (taken === 0) return 'missed';
    if (taken >= dosesPerDay) return 'full';
    return 'partial';
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar
        title={med.name}
        rightGlyph="pencil"
        onRightPress={() => router.push({ pathname: '/medication-edit', params: { id: med.id } })}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.infoCard}>
          {med.dosage ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Dose</Text><Text style={styles.infoValue}>{med.dosage}</Text></View> : null}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time{med.times.length > 1 ? 's' : ''}</Text>
            <Text style={styles.infoValue}>{med.times.map(displayTime).join(', ')}</Text>
          </View>
          {med.notes ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Notes</Text><Text style={styles.infoValue}>{med.notes}</Text></View> : null}
        </View>

        <View style={styles.monthHead}>
          <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)} style={styles.monthBtn}>
            <Icon name="chevron-left" size={18} color={colors.accentDeep} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity
            onPress={() => setMonthOffset(Math.min(0, monthOffset + 1))}
            style={[styles.monthBtn, monthOffset >= 0 && { opacity: 0.3 }]}
            disabled={monthOffset >= 0}
          >
            <Icon name="chevron-right" size={18} color={colors.accentDeep} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdays}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.weekday}>{d}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (day === null) return <View key={`e${i}`} style={styles.cell} />;
            const state = cellState(day);
            const key = dateKey(new Date(year, month, day));
            const isToday = key === todayKey;
            return (
              <View key={day} style={styles.cell}>
                <View style={[
                  styles.dayDot,
                  state === 'full' && styles.dayFull,
                  state === 'partial' && styles.dayPartial,
                  state === 'missed' && styles.dayMissed,
                  isToday && styles.dayToday,
                ]}>
                  <Text style={[
                    styles.dayNum,
                    (state === 'full') && styles.dayNumLight,
                  ]}>{day}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, styles.dayFull]} /><Text style={styles.legendText}>Taken</Text></View>
          {dosesPerDay > 1 && <View style={styles.legendItem}><View style={[styles.legendDot, styles.dayPartial]} /><Text style={styles.legendText}>Partial</Text></View>}
          <View style={styles.legendItem}><View style={[styles.legendDot, styles.dayMissed]} /><Text style={styles.legendText}>Missed</Text></View>
        </View>

        {adherence !== null && (
          <View style={styles.adherenceCard}>
            <Text style={styles.adherenceLabel}>Adherence this month</Text>
            <Text style={styles.adherenceValue}>{adherence}%</Text>
            <Text style={styles.adherenceSub}>{takenDoses} of {scheduledDoses} doses taken</Text>
          </View>
        )}

        <Text style={styles.note}>
          Mark doses as taken from the home screen. This log is for tracking only — always follow the dose and schedule
          your healthcare provider gives you.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  muted: { color: c.muted, fontFamily: fonts.body4 },
  infoCard: { ...makeCardStyle(c), padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  infoLabel: { fontSize: 13, color: c.muted, fontFamily: fonts.body4 },
  infoValue: { fontSize: 13, color: c.ink, fontFamily: fonts.body5, flex: 1, textAlign: 'right' },
  monthHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 16, fontFamily: fonts.displaySemi, color: c.ink },
  weekdays: { flexDirection: 'row', marginBottom: 6 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, color: c.faint, fontFamily: fonts.displaySemi },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 3 },
  dayDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  dayFull: { backgroundColor: c.accentFill },
  dayPartial: { backgroundColor: c.petal },
  dayMissed: { backgroundColor: c.subtleBg },
  dayToday: { borderWidth: 2, borderColor: c.accentDeep },
  dayNum: { fontSize: 13, color: c.ink, fontFamily: fonts.body4 },
  dayNumLight: { color: c.onAccent, fontFamily: fonts.displaySemi },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 11, color: c.muted, fontFamily: fonts.body4 },
  adherenceCard: { backgroundColor: c.accentSoft, borderRadius: radius.card, padding: 18, alignItems: 'center', marginTop: 20 },
  adherenceLabel: { fontSize: 12, color: c.accentDeep, fontFamily: fonts.displaySemi, letterSpacing: 0.4 },
  adherenceValue: { fontSize: 36, color: c.accentDeep, fontFamily: fonts.displaySemi, marginVertical: 2 },
  adherenceSub: { fontSize: 12, color: c.accentDeep, fontFamily: fonts.body4 },
  note: { fontSize: 11, color: c.faint, textAlign: 'center', marginTop: 16, lineHeight: 16, fontFamily: fonts.body4 },
});