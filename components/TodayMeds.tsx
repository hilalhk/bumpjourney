import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { displayTime, todayStr } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius, shadowFor } from '../lib/theme';
import { BellIcon } from './Icons';

type Med = { id: string; name: string; dosage: string | null; times: string[]; start_date: string };
type Dose = { medId: string; name: string; dosage: string | null; time: string; taken: boolean };

function relativeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const due = new Date();
  due.setHours(h, m, 0, 0);
  const diffMin = Math.round((due.getTime() - Date.now()) / 60000);
  if (diffMin <= 0 && diffMin > -60) return 'due now';
  if (diffMin <= -60) return `${Math.round(-diffMin / 60)}h overdue`;
  if (diffMin < 60) return `in ${diffMin} min`;
  return `in ${Math.round(diffMin / 60)} hours`;
}

export default function TodayMeds() {
  const router = useRouter();
  const { colors, gradient } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [doses, setDoses] = useState<Dose[]>([]);

  const load = useCallback(async () => {
    const today = todayStr();
    const { data: meds } = await supabase
      .from('medications')
      .select('id, name, dosage, times, start_date')
      .eq('is_active', true);

    const active = (meds ?? []).filter((m: Med) => m.start_date <= today);
    if (active.length === 0) { setDoses([]); return; }

    const { data: logs } = await supabase
      .from('medication_logs')
      .select('medication_id, scheduled_time')
      .eq('log_date', today);
    const takenSet = new Set((logs ?? []).map((l) => `${l.medication_id}|${l.scheduled_time}`));

    const all: Dose[] = [];
    active.forEach((m: Med) => {
      (m.times ?? []).forEach((t) => {
        all.push({ medId: m.id, name: m.name, dosage: m.dosage, time: t, taken: takenSet.has(`${m.id}|${t}`) });
      });
    });
    all.sort((a, b) => a.time.localeCompare(b.time));
    setDoses(all);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const next = doses.find((d) => !d.taken);
  if (!next) return null;

  async function take(d: Dose) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('medication_logs').insert({
      user_id: user!.id, medication_id: d.medId, log_date: todayStr(),
      scheduled_time: d.time, taken_at: new Date().toISOString(),
    });
    load();
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/medications')} style={styles.shadow}>
      <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.iconBox}>
          <BellIcon size={22} color={colors.onAccent} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.label}>Next reminder · {displayTime(next.time)}</Text>
          <Text style={styles.name} numberOfLines={1}>{next.name}</Text>
          <Text style={styles.meta}>{next.dosage ? `${next.dosage} · ` : ''}{relativeLabel(next.time)}</Text>
        </View>
        <TouchableOpacity style={styles.takeBtn} onPress={() => take(next)} activeOpacity={0.85}>
          <Text style={styles.takeText}>Take</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// This whole card is the accent gradient, which is identical in both schemes —
// so every color here is fixed against that gradient, not against the canvas.
const makeStyles = (c: Colors) => StyleSheet.create({
  shadow: { marginTop: 18, ...shadowFor(c.scheme).accent },
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: radius.tile, padding: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.body6, fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.7, textTransform: 'uppercase' },
  name: { fontFamily: fonts.display, fontSize: 16, color: c.onAccent, marginTop: 6 },
  meta: { fontFamily: fonts.body5, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  takeBtn: { backgroundColor: c.onAccent, borderRadius: 100, paddingVertical: 9, paddingHorizontal: 15 },
  // Sits on the always-white pill above, so it keeps the light-scheme deep rose;
  // the dark palette's lifted accentDeep would only reach ~3.6:1 here.
  takeText: { fontFamily: fonts.displaySemi, fontSize: 12, color: '#B83E66' },
});
