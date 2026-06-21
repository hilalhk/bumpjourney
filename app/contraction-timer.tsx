import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import DateTimeModal from '../components/DateTimeModal';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { dayKeyOf, formatMs, labelOf } from '../lib/dates';
import { saveSession } from '../lib/healthSync';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

type Contraction = { start: number; end: number | null };
type RawContraction = { start: string; end: string };
type Session = { id: string; started_at: string; ended_at: string | null; contractions: RawContraction[] };
type DayGroup = { key: string; label: string; sessions: Session[]; totalContractions: number };
type SortMode = 'recent' | 'most' | 'least';

const HELP_TEXT =
  "Tap when a contraction starts, tap again when it ends. The 5-1-1 guide: contractions 5 minutes apart, lasting 1 minute, for 1 hour — but always follow your provider's instructions.";

function avgDuration(list: RawContraction[]) {
  if (list.length === 0) return '—';
  const total = list.reduce((sum, c) => sum + (new Date(c.end).getTime() - new Date(c.start).getTime()), 0);
  const s = Math.round(total / list.length / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')} avg`;
}

export default function ContractionTimer() {
  const router = useRouter();
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [now, setNow] = useState(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [days, setDays] = useState<DayGroup[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('recent');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const active = contractions.length > 0 && contractions[contractions.length - 1].end === null;

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('contraction_sessions')
      .select('id, started_at, ended_at, contractions')
      .order('started_at', { ascending: false });
    const groups: Record<string, DayGroup> = {};
    (data ?? []).forEach((s) => {
      const key = dayKeyOf(s.started_at);
      if (!groups[key]) groups[key] = { key, label: labelOf(key), sessions: [], totalContractions: 0 };
      groups[key].sessions.push(s);
      groups[key].totalContractions += (s.contractions ?? []).length;
    });
    setDays(Object.values(groups));
    setHistoryLoading(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    if (active && !tickRef.current) tickRef.current = setInterval(() => setNow(Date.now()), 500);
    if (!active && tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  }, [active]);

  function toggleContraction() {
    if (!sessionStart) setSessionStart(new Date());
    setContractions((prev) => {
      const next = [...prev];
      if (active) next[next.length - 1] = { ...next[next.length - 1], end: Date.now() };
      else next.push({ start: Date.now(), end: null });
      return next;
    });
  }

  async function endSession() {
    if (!sessionStart) { router.back(); return; }
    const finished = contractions.map((c) => ({
      start: new Date(c.start).toISOString(),
      end: c.end ? new Date(c.end).toISOString() : new Date().toISOString(),
    }));
    await saveSession({
      table: 'contraction_sessions',
      payload: { started_at: sessionStart.toISOString(), ended_at: new Date().toISOString(), contractions: finished },
    });
    Alert.alert('Session saved', `${finished.length} contractions recorded.`);
    setSessionStart(null);
    setContractions([]);
    loadHistory();
  }

  const liveRows = [...contractions].reverse();

  let shown = [...days];
  if (filterDate) shown = shown.filter((d) => d.key === filterDate);
  if (sort === 'recent') shown.sort((a, b) => b.key.localeCompare(a.key));
  if (sort === 'most') shown.sort((a, b) => b.totalContractions - a.totalContractions);
  if (sort === 'least') shown.sort((a, b) => a.totalContractions - b.totalContractions);

  const liveTimer = active ? formatMs(now - contractions[contractions.length - 1].start) : '0:00';

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Contraction Timer" rightGlyph="help" onRightPress={() => setHelpOpen((h) => !h)} />

      <FlatList
        data={shown}
        keyExtractor={(day) => day.key}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {helpOpen && (
              <View style={styles.help}>
                <View style={{ marginTop: 1 }}><Icon name="info" size={16} color={colors.accentDeep} /></View>
                <Text style={styles.helpText}>{HELP_TEXT}</Text>
              </View>
            )}

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity activeOpacity={0.9} onPress={toggleContraction} style={styles.tapShadow}>
                <LinearGradient colors={['#E5588A', '#B83E66']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tapCircle}>
                  <View style={styles.tapInner} />
                  <Text style={styles.tapTimer}>{liveTimer}</Text>
                  <Text style={styles.tapLabel}>{active ? 'TAP WHEN IT ENDS' : 'TAP WHEN IT STARTS'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {liveRows.length > 0 && (
              <View style={styles.liveList}>
                {liveRows.map((c, i) => {
                  const idx = liveRows.length - i;
                  const duration = c.end ? formatMs(c.end - c.start) : formatMs(now - c.start);
                  const originalIndex = contractions.length - 1 - i;
                  const prev = originalIndex > 0 ? contractions[originalIndex - 1] : null;
                  const gap = prev ? formatMs(c.start - prev.start) : '—';
                  return (
                    <View key={c.start} style={[styles.liveRow, i === liveRows.length - 1 && styles.liveRowLast]}>
                      <Text style={styles.liveNum}>#{idx}</Text>
                      <View style={styles.liveCol}>
                        <Text style={styles.liveLabel}>Duration</Text>
                        <Text style={styles.liveValue}>{duration}</Text>
                      </View>
                      <View style={styles.liveCol}>
                        <Text style={styles.liveLabel}>Frequency</Text>
                        <Text style={styles.liveValue}>{gap}</Text>
                      </View>
                      <Text style={styles.liveTime}>{new Date(c.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {sessionStart && (
              <TouchableOpacity style={styles.endBtn} onPress={endSession} activeOpacity={0.85}>
                <Text style={styles.endText}>End & save session</Text>
              </TouchableOpacity>
            )}

            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Contraction history</Text>
              <TouchableOpacity style={styles.filtersBtn} onPress={() => setFiltersOpen(!filtersOpen)}>
                <Text style={styles.filtersText}>Filters</Text>
                <Icon name="funnel" size={15} color={colors.accentDeep} />
                {(sort !== 'recent' || filterDate) && <View style={styles.filterBadge} />}
              </TouchableOpacity>
            </View>

            {filtersOpen && (
              <View style={styles.filterPanel}>
                <Text style={styles.filterLabel}>Sort by</Text>
                <View style={styles.controls}>
                  {(['recent', 'most', 'least'] as SortMode[]).map((m) => (
                    <TouchableOpacity key={m} style={[styles.chip, sort === m && styles.chipOn]} onPress={() => setSort(m)}>
                      <Text style={[styles.chipText, sort === m && styles.chipTextOn]}>
                        {m === 'recent' ? 'Newest' : m === 'most' ? 'Most' : 'Fewest'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.filterLabel}>Date</Text>
                <View style={styles.controls}>
                  <TouchableOpacity style={[styles.chip, filterDate ? styles.chipOn : null]} onPress={() => setShowPicker(true)}>
                    <Icon name="calendar" size={13} color={filterDate ? colors.white : colors.muted} />
                    <Text style={[styles.chipText, filterDate ? styles.chipTextOn : null]}>{filterDate ? labelOf(filterDate) : 'Pick date'}</Text>
                  </TouchableOpacity>
                  {filterDate && (
                    <TouchableOpacity style={styles.chip} onPress={() => setFilterDate(null)}>
                      <Icon name="close" size={13} color={colors.muted} />
                      <Text style={styles.chipText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <DateTimeModal
              visible={showPicker}
              value={filterDate ? new Date(filterDate + 'T00:00:00') : new Date()}
              mode="date"
              onConfirm={(selected) => { setShowPicker(false); setFilterDate(dayKeyOf(selected.toISOString())); }}
              onCancel={() => setShowPicker(false)}
            />

            {historyLoading && <Text style={styles.empty}>Loading…</Text>}
            {!historyLoading && shown.length === 0 && (
              <Text style={styles.empty}>{filterDate ? 'No sessions on this date.' : 'No sessions yet — your history will appear here.'}</Text>
            )}
          </>
        }
        renderItem={({ item: day }) => (
          <View style={styles.dayCard}>
            <TouchableOpacity style={styles.dayHeader} onPress={() => setExpanded(expanded === day.key ? null : day.key)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.daySummary}>{day.sessions.length} session{day.sessions.length > 1 ? 's' : ''} · {day.totalContractions} contractions</Text>
              </View>
              <Icon name={expanded === day.key ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} strokeWidth={2.2} />
            </TouchableOpacity>
            {expanded === day.key && day.sessions.map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <Text style={styles.sessionTime}>{new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.sessionCount}>{(s.contractions ?? []).length} contractions</Text>
                <Text style={styles.sessionDur}>{avgDuration(s.contractions ?? [])}</Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  help: { flexDirection: 'row', gap: 9, backgroundColor: colors.accentSoft, borderRadius: radius.tile, padding: 13, marginBottom: 16 },
  helpText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: colors.accentDeep },

  tapShadow: { marginTop: 6, borderRadius: 118, shadowColor: colors.accent, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.34, shadowRadius: 40, elevation: 8 },
  tapCircle: { width: 236, height: 236, borderRadius: 118, alignItems: 'center', justifyContent: 'center' },
  tapInner: { position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 104, borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)' },
  tapTimer: { fontFamily: fonts.display, fontSize: 56, color: colors.white },
  tapLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.6, color: 'rgba(255,255,255,0.9)', marginTop: 8 },

  liveList: { ...cardStyle, paddingHorizontal: 16, paddingVertical: 6, marginTop: 14 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  liveRowLast: { borderBottomWidth: 0 },
  liveNum: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accent, width: 28 },
  liveCol: { flex: 1 },
  liveLabel: { fontFamily: fonts.body6, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  liveValue: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink, marginTop: 4 },
  liveTime: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },
  endBtn: { backgroundColor: colors.accentSoft, borderRadius: radius.cta, padding: 16, alignItems: 'center', marginTop: 14 },
  endText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.accentDeep },

  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 14, paddingHorizontal: 2 },
  historyTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  filtersBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filtersText: { fontFamily: fonts.body5, fontSize: 13, color: colors.accentDeep },
  filterBadge: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, position: 'absolute', top: -2, right: -6 },
  filterPanel: { ...cardStyle, padding: 14, marginBottom: 14 },
  filterLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, marginBottom: 10 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
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
  sessionCount: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accentDeep },
  sessionDur: { fontFamily: fonts.body5, fontSize: 13, color: colors.muted },
  empty: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted, textAlign: 'center', marginVertical: 24 },
});
