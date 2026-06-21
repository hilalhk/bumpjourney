import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { dayKeyOf, labelOf } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../lib/theme';

type Session = { id: string; started_at: string; ended_at: string | null; kick_count: number };
type DayGroup = { key: string; label: string; sessions: Session[]; totalKicks: number };
type SortMode = 'recent' | 'most' | 'least';

export default function KickHistory() {
  const [days, setDays] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('recent');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('kick_sessions')
        .select('id, started_at, ended_at, kick_count')
        .order('started_at', { ascending: false });
      const groups: Record<string, DayGroup> = {};
      (data ?? []).forEach((s) => {
        const key = dayKeyOf(s.started_at);
        if (!groups[key]) groups[key] = { key, label: labelOf(key), sessions: [], totalKicks: 0 };
        groups[key].sessions.push(s);
        groups[key].totalKicks += s.kick_count;
      });
      setDays(Object.values(groups));
      setLoading(false);
    })();
  }, []);

  let shown = [...days];
  if (filterDate) shown = shown.filter((d) => d.key === filterDate);
  if (sort === 'recent') shown.sort((a, b) => b.key.localeCompare(a.key));
  if (sort === 'most') shown.sort((a, b) => b.totalKicks - a.totalKicks);
  if (sort === 'least') shown.sort((a, b) => a.totalKicks - b.totalKicks);

  function sessionDuration(s: Session) {
    if (!s.ended_at) return '—';
    const mins = Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000);
    return mins < 1 ? '<1 min' : `${mins} min`;
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Kick history" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.controls}>
          {(['recent', 'most', 'least'] as SortMode[]).map((m) => (
            <TouchableOpacity key={m} style={[styles.chip, sort === m && styles.chipOn]} onPress={() => setSort(m)}>
              <Text style={[styles.chipText, sort === m && styles.chipTextOn]}>
                {m === 'recent' ? 'Newest' : m === 'most' ? 'Most kicks' : 'Least kicks'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.chip, filterDate ? styles.chipOn : null]} onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={13} color={filterDate ? colors.white : colors.muted} />
            <Text style={[styles.chipText, filterDate ? styles.chipTextOn : null]}>{filterDate ? labelOf(filterDate) : 'Pick date'}</Text>
          </TouchableOpacity>
          {filterDate && (
            <TouchableOpacity style={styles.chip} onPress={() => setFilterDate(null)}>
              <Icon name="close" size={13} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {showPicker && (
          <DateTimePicker
            value={filterDate ? new Date(filterDate + 'T00:00:00') : new Date()}
            mode="date" display="default"
            onChange={(_, selected) => { setShowPicker(false); if (selected) setFilterDate(dayKeyOf(selected.toISOString())); }}
          />
        )}

        {loading && <Text style={styles.empty}>Loading…</Text>}
        {!loading && shown.length === 0 && (
          <Text style={styles.empty}>{filterDate ? 'No sessions on this date.' : 'No sessions yet — start one from the kick counter.'}</Text>
        )}
        {shown.map((day) => (
          <View key={day.key} style={styles.dayCard}>
            <TouchableOpacity style={styles.dayHeader} onPress={() => setExpanded(expanded === day.key ? null : day.key)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.daySummary}>{day.sessions.length} session{day.sessions.length > 1 ? 's' : ''} · {day.totalKicks} kicks</Text>
              </View>
              <Icon name={expanded === day.key ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} strokeWidth={2.2} />
            </TouchableOpacity>
            {expanded === day.key && day.sessions.map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <Text style={styles.sessionTime}>{new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.sessionKicks}>{s.kick_count} kicks</Text>
                <Text style={styles.sessionDur}>{sessionDuration(s)}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.note}>Movement varies day to day — what matters most is your baby{"'"}s usual pattern.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 100, backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.cardBorder },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.body6, fontSize: 12, color: '#6E5560' },
  chipTextOn: { color: colors.white },
  dayCard: { ...cardStyle, padding: 14, paddingHorizontal: 16, marginBottom: 10 },
  dayHeader: { flexDirection: 'row', alignItems: 'center' },
  dayLabel: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  daySummary: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 4 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 11, marginTop: 11, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  sessionTime: { fontFamily: fonts.body5, fontSize: 13, color: '#6E5560' },
  sessionKicks: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accentDeep },
  sessionDur: { fontFamily: fonts.body5, fontSize: 13, color: colors.muted },
  empty: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 32 },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, textAlign: 'center', marginVertical: 16 },
});
