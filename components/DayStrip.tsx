import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { dayKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient } from '../lib/theme';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = { selected: string; onSelect: (key: string) => void };

function DayStrip({ selected, onSelect }: Props) {
  const [dataDays, setDataDays] = useState<Set<string>>(new Set());

  const today = new Date();
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const loadDots = useCallback(async () => {
    const start = dayKey(days[0]);
    const end = dayKey(days[days.length - 1]);
    const found = new Set<string>();

    const { data: sym } = await supabase
      .from('symptom_logs').select('log_date')
      .gte('log_date', start).lte('log_date', end);
    (sym ?? []).forEach((r) => found.add(r.log_date));

    const { data: kicks } = await supabase
      .from('kick_sessions').select('started_at')
      .gte('started_at', start + 'T00:00:00').lte('started_at', end + 'T23:59:59');
    (kicks ?? []).forEach((r) => found.add(dayKey(new Date(r.started_at))));

    const { data: cons } = await supabase
      .from('contraction_sessions').select('started_at')
      .gte('started_at', start + 'T00:00:00').lte('started_at', end + 'T23:59:59');
    (cons ?? []).forEach((r) => found.add(dayKey(new Date(r.started_at))));

    setDataDays(found);
  }, []);

  useFocusEffect(useCallback(() => { loadDots(); }, [loadDots]));

  return (
    <View style={styles.row}>
      {days.map((d) => {
        const key = dayKey(d);
        const isSelected = key === selected;
        const hasData = dataDays.has(key);
        if (isSelected) {
          return (
            <TouchableOpacity key={key} style={styles.col} onPress={() => onSelect(key)} activeOpacity={0.85}>
              <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pillActive}>
                <Text style={[styles.weekday, styles.weekdayOn]}>{WEEKDAY[d.getDay()]}</Text>
                <Text style={[styles.num, styles.numOn]}>{d.getDate()}</Text>
                <View style={[styles.dot, { backgroundColor: colors.white }]} />
              </LinearGradient>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={key} style={styles.col} onPress={() => onSelect(key)} activeOpacity={0.7}>
            <View style={styles.pill}>
              <Text style={styles.weekday}>{WEEKDAY[d.getDay()]}</Text>
              <Text style={styles.num}>{d.getDate()}</Text>
              <View style={[styles.dot, { backgroundColor: hasData ? colors.accent : 'transparent' }]} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default memo(DayStrip);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7 },
  col: { flex: 1 },
  pill: {
    alignItems: 'center', paddingVertical: 9, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
  },
  pillActive: {
    alignItems: 'center', paddingVertical: 9, borderRadius: 14,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 6,
  },
  weekday: { fontFamily: fonts.body6, fontSize: 10, color: colors.muted },
  weekdayOn: { color: 'rgba(255,255,255,0.85)' },
  num: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, marginTop: 6 },
  numOn: { color: colors.white },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
});
