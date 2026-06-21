import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { cardStyle } from '../components/Card';
import GradientButton from '../components/GradientButton';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import { todayStr } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { CATEGORIES, Intensity, SYMPTOM_LOOKUP, SymptomData } from '../lib/symptoms';
import { colors, fonts } from '../lib/theme';

// Escalating intensity scale from the comp: amber → coral-pink → deep crimson.
const LV: Record<Intensity, { dot: string; bg: string; border: string; text: string }> = {
  mild: { dot: '#E0A33C', bg: '#FBF1DD', border: '#EAD3A0', text: '#9A6B1E' },
  moderate: { dot: '#E5588A', bg: '#FBE3EC', border: '#F2B8CE', text: '#B83E66' },
  severe: { dot: '#B3243F', bg: '#F7DBDF', border: '#E7A6B0', text: '#8E1B30' },
};
const LABEL: Record<Intensity, string> = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' };

function CatIcon({ d }: { d: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

export default function Symptoms() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const logDate = params.date ?? todayStr();
  const [data, setData] = useState<SymptomData>({});

  const load = useCallback(async () => {
    const { data: row } = await supabase.from('symptom_logs').select('symptom_data, symptoms').eq('log_date', logDate).maybeSingle();
    if (row?.symptom_data && Object.keys(row.symptom_data).length > 0) {
      setData(row.symptom_data);
    } else if (row?.symptoms && row.symptoms.length > 0) {
      const migrated: SymptomData = {};
      Object.entries(SYMPTOM_LOOKUP).forEach(([id, info]) => { if (row.symptoms.includes(info.label)) migrated[id] = 'moderate'; });
      setData(migrated);
    }
  }, [logDate]);

  useEffect(() => { load(); }, [load]);

  async function persist(next: SymptomData) {
    setData(next);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('symptom_logs').upsert(
      { user_id: user!.id, log_date: logDate, symptom_data: next, symptoms: Object.keys(next).map((id) => SYMPTOM_LOOKUP[id]?.label).filter(Boolean) },
      { onConflict: 'user_id,log_date' }
    );
  }

  // Tap cycles: (none) → mild → moderate → severe → (removed)
  function cycle(id: string) {
    const next = { ...data };
    const cur = next[id];
    if (cur === undefined) next[id] = 'mild';
    else if (cur === 'mild') next[id] = 'moderate';
    else if (cur === 'moderate') next[id] = 'severe';
    else delete next[id];
    persist(next);
  }

  const count = Object.keys(data).length;
  const d = new Date(logDate + 'T00:00:00');
  const isToday = logDate === todayStr();
  const dateLabel = `${isToday ? 'Today · ' : ''}${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <View style={styles.header}>
        <TouchableOpacity style={styles.circle} onPress={() => router.back()} activeOpacity={0.85}>
          <Icon name="chevron-left" size={18} color={colors.ink} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log symptoms</Text>
        {count > 0 ? <Text style={styles.countLabel}>{count} selected</Text> : <View style={{ width: 40 }} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* date */}
        <View style={styles.dateRow}>
          <Icon name="calendar" size={16} color={colors.accent} />
          <Text style={styles.dateText}>{dateLabel}</Text>
          <Icon name="chevron-right" size={16} color={colors.faint} strokeWidth={2.2} />
        </View>

        {/* intensity legend */}
        <View style={styles.legend}>
          <Text style={styles.legendCue}>Tap to cycle</Text>
          {(['mild', 'moderate', 'severe'] as Intensity[]).map((lvl) => (
            <View key={lvl} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: LV[lvl].dot }]} />
              <Text style={[styles.legendText, { color: LV[lvl].text }]}>{LABEL[lvl]}</Text>
            </View>
          ))}
        </View>

        {/* categories */}
        {CATEGORIES.map((cat) => (
          <View key={cat.title} style={styles.cat}>
            <View style={styles.catHead}>
              <View style={styles.catIcon}><CatIcon d={cat.iconPath} /></View>
              <Text style={styles.catTitle}>{cat.title}</Text>
            </View>
            <View style={styles.chips}>
              {cat.symptoms.map((s) => {
                const lvl = data[s.id];
                const on = !!lvl;
                const st = on ? LV[lvl] : null;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.chip, on ? { backgroundColor: st!.bg, borderColor: st!.border } : styles.chipOff]}
                    onPress={() => cycle(s.id)}
                    activeOpacity={0.85}
                  >
                    {on && <View style={[styles.chipDot, { backgroundColor: st!.dot }]} />}
                    <Text style={[styles.chipText, { color: on ? st!.text : '#6E5560' }]}>{s.label}</Text>
                    {on && <Text style={[styles.chipLevel, { color: st!.text }]}>{LABEL[lvl]}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* note */}
        <View style={styles.note}>
          <View style={{ marginTop: 1 }}><Icon name="info" size={14} color={colors.faint} /></View>
          <Text style={styles.noteText}>Tracking symptoms helps you spot patterns to share with your provider. It isn{"'"}t medical advice.</Text>
        </View>
      </ScrollView>

      {/* save bar */}
      <View style={styles.saveBar}>
        <GradientButton label={count > 0 ? `Save ${count} symptom${count === 1 ? '' : 's'}` : 'Save'} onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  countLabel: { fontFamily: fonts.body6, fontSize: 12, color: colors.accentDeep },

  dateRow: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, paddingHorizontal: 15 },
  dateText: { flex: 1, fontFamily: fonts.body5, fontSize: 14, color: colors.ink },

  legend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginTop: 16, marginHorizontal: 4, marginBottom: 2 },
  legendCue: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontFamily: fonts.body6, fontSize: 11 },

  cat: { marginTop: 20 },
  catHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  catIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 100, paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1 },
  chipOff: { backgroundColor: colors.surface, borderColor: colors.cardBorder },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: fonts.body6, fontSize: 12 },
  chipLevel: { fontFamily: fonts.body6, fontSize: 10, opacity: 0.9 },

  note: { flexDirection: 'row', gap: 9, marginTop: 24, paddingHorizontal: 2 },
  noteText: { flex: 1, fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint },

  saveBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 26, backgroundColor: colors.canvas },
});
