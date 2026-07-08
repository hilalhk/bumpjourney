import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { dayEndIso, dayKey, dayStartIso } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts } from '../lib/theme';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// SVG circle so the log dot is always perfectly round — a tiny borderRadius
// View renders as a square on some Android devices.
function Dot({ color }: { color: string }) {
  return (
    <Svg width={6} height={6} style={{ marginTop: 6 }}>
      <Circle cx={3} cy={3} r={3} fill={color} />
    </Svg>
  );
}

type Props = { selected: string; onSelect: (key: string) => void };

function DayStrip({ selected, onSelect }: Props) {
  const { colors, gradient } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [dataDays, setDataDays] = useState<Set<string>>(new Set());

  // Keyed on the calendar day, so `days` (and therefore loadDots) is stable
  // within a day but rolls over if the app is left open past midnight. The old
  // useCallback([]) froze the query window at whatever day the strip mounted.
  const todayKey = dayKey(new Date());
  const days: Date[] = useMemo(() => {
    const base = new Date(todayKey + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - (6 - i));
      return d;
    });
  }, [todayKey]);

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
      .gte('started_at', dayStartIso(start)).lt('started_at', dayEndIso(end));
    (kicks ?? []).forEach((r) => found.add(dayKey(new Date(r.started_at))));

    const { data: cons } = await supabase
      .from('contraction_sessions').select('started_at')
      .gte('started_at', dayStartIso(start)).lt('started_at', dayEndIso(end));
    (cons ?? []).forEach((r) => found.add(dayKey(new Date(r.started_at))));

    setDataDays(found);
  }, [days]);

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
                <Dot color={colors.onAccent} />
              </LinearGradient>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={key} style={styles.col} onPress={() => onSelect(key)} activeOpacity={0.7}>
            <View style={styles.pill}>
              <Text style={styles.weekday}>{WEEKDAY[d.getDay()]}</Text>
              <Text style={styles.num}>{d.getDate()}</Text>
              <Dot color={hasData ? colors.accent : 'transparent'} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default memo(DayStrip);

const makeStyles = (c: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 7 },
  col: { flex: 1 },
  pill: {
    alignItems: 'center', paddingVertical: 9, borderRadius: 14,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder,
  },
  pillActive: {
    alignItems: 'center', paddingVertical: 9, borderRadius: 14,
    shadowColor: c.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 6,
  },
  weekday: { fontFamily: fonts.body6, fontSize: 10, color: c.muted },
  // Sits on the accent gradient pill, so it stays white in both schemes.
  weekdayOn: { color: 'rgba(255,255,255,0.85)' },
  num: { fontFamily: fonts.display, fontSize: 16, color: c.ink, marginTop: 6 },
  numOn: { color: c.onAccent },
});
