import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import DateTimeModal from '../components/DateTimeModal';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { dayKeyOf, formatSeconds, labelOf } from '../lib/dates';
import { saveSession } from '../lib/healthSync';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

type Session = { id: string; started_at: string; ended_at: string | null; kick_count: number };
type DayGroup = { key: string; label: string; sessions: Session[]; totalKicks: number };
type SortMode = 'recent' | 'most' | 'least';

const HELP_TEXT =
  'Count 10 movements. Most providers suggest doing this at the same time daily, when your baby is usually active.';

export default function KickCounter() {
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [kicks, setKicks] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [days, setDays] = useState<DayGroup[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('recent');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const loadHistory = useCallback(async () => {
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
    setHistoryLoading(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Clear the running interval if the user leaves mid-session.
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function start() {
    setStartedAt(new Date());
    setKicks(0);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }
  function reset() { stopTimer(); setStartedAt(null); setKicks(0); setElapsed(0); }
  function recordKick() {
    if (!startedAt) return;
    const next = kicks + 1;
    setKicks(next);
    if (next === 10) finish(next);
  }
  async function finish(count = kicks) {
    if (!startedAt) return;
    stopTimer();
    await saveSession({
      table: 'kick_sessions',
      payload: { started_at: startedAt.toISOString(), ended_at: new Date().toISOString(), kick_count: count },
    });
    Alert.alert(count >= 10 ? '10 kicks! 🎉' : 'Session saved', `${count} kicks in ${formatSeconds(elapsed)}.`);
    setStartedAt(null); setKicks(0); setElapsed(0);
    loadHistory();
  }
  function sessionDuration(s: Session) {
    if (!s.ended_at) return '—';
    const mins = Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000);
    return mins < 1 ? '<1 min' : `${mins} min`;
  }

  let shown = [...days];
  if (filterDate) shown = shown.filter((d) => d.key === filterDate);
  if (sort === 'recent') shown.sort((a, b) => b.key.localeCompare(a.key));
  if (sort === 'most') shown.sort((a, b) => b.totalKicks - a.totalKicks);
  if (sort === 'least') shown.sort((a, b) => a.totalKicks - b.totalKicks);

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Kick Counter" rightGlyph="help" onRightPress={() => setHelpOpen((h) => !h)} />

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

            {!startedAt ? (
              <View style={styles.idleCard}>
                <View style={styles.idleIcon}><Icon name="footprint" size={34} color={colors.accent} strokeWidth={1.5} /></View>
                <Text style={styles.idleTitle}>Ready to count?</Text>
                <Text style={styles.idleSub}>Tap start, then tap the circle each time you feel baby move. We{"'"}ll log it after 10.</Text>
                <TouchableOpacity onPress={start} activeOpacity={0.9} style={styles.startBtn}>
                  <LinearGradient colors={['#E5588A', '#B83E66']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startGrad}>
                    <Text style={styles.startText}>Start session</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.activeCard}>
                <Text style={styles.elapsedLabel}>Elapsed</Text>
                <Text style={styles.elapsedTime}>{formatSeconds(elapsed)}</Text>
                <TouchableOpacity activeOpacity={0.9} onPress={recordKick} style={styles.tapShadow}>
                  <LinearGradient colors={['#E5588A', '#B83E66']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tapCircle}>
                    <View style={styles.tapInner} />
                    <Text style={styles.tapNum}>{kicks}</Text>
                    <Text style={styles.tapLabel}>TAP FOR EACH KICK</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.dots}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <View key={i} style={[styles.dot, i < kicks && styles.dotOn]} />
                  ))}
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.finishBtn} onPress={() => finish()} activeOpacity={0.9}>
                    <LinearGradient colors={['#E5588A', '#B83E66']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.finishGrad}>
                      <Text style={styles.finishText}>Finish</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Kick history</Text>
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
                        {m === 'recent' ? 'Newest' : m === 'most' ? 'Most kicks' : 'Least kicks'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.filterLabel, { marginTop: 16 }]}>Date</Text>
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
        ListFooterComponent={
          <Text style={styles.note}>Movement varies day to day — what matters most is your baby{"'"}s usual pattern.</Text>
        }
        renderItem={({ item: day }) => (
          <View style={styles.dayCard}>
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
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  help: { flexDirection: 'row', gap: 9, backgroundColor: colors.accentSoft, borderRadius: radius.tile, paddingVertical: 13, paddingHorizontal: 15, marginBottom: 16 },
  helpText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: colors.accentDeep },

  idleCard: { ...cardStyle, paddingVertical: 28, paddingHorizontal: 22, alignItems: 'center' },
  idleIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  idleTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 16 },
  idleSub: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 7, textAlign: 'center', maxWidth: 240 },
  startBtn: { marginTop: 20, alignSelf: 'stretch', borderRadius: radius.cta, shadowColor: colors.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 24, elevation: 6 },
  startGrad: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.cta, padding: 16 },
  startText: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.white },

  activeCard: { ...cardStyle, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  elapsedLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.muted },
  elapsedTime: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginTop: 8 },
  tapShadow: { marginTop: 22, borderRadius: 118, shadowColor: colors.accent, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.34, shadowRadius: 40, elevation: 8 },
  tapCircle: { width: 236, height: 236, borderRadius: 118, alignItems: 'center', justifyContent: 'center' },
  tapInner: { position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 104, borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)' },
  tapNum: { fontFamily: fonts.display, fontSize: 76, color: colors.white },
  tapLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 9, marginTop: 22 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.petal },
  dotOn: { backgroundColor: colors.accent },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' },
  resetBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.cta, padding: 15 },
  resetText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink },
  finishBtn: { flex: 1, borderRadius: radius.cta, shadowColor: colors.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 24, elevation: 6 },
  finishGrad: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.cta, padding: 15 },
  finishText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.white },

  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 14, paddingHorizontal: 2 },
  historyTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  filtersBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filtersText: { fontFamily: fonts.body5, fontSize: 13, color: colors.accentDeep },
  filterBadge: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, position: 'absolute', top: -2, right: -6 },
  filterPanel: { ...cardStyle, padding: 14, marginBottom: 14 },
  filterLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted, marginBottom: 10 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  empty: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted, textAlign: 'center', marginVertical: 24 },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, textAlign: 'center', marginTop: 18, paddingHorizontal: 16 },
});
