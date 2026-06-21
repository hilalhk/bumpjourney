import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { cardStyle } from '../../components/Card';
import DayStrip from '../../components/DayStrip';
import { MilestoneGlyph } from '../../components/Glyphs';
import { Icon, IconName } from '../../components/Icons';
import ScreenGlow from '../../components/ScreenGlow';
import SymptomTracker from '../../components/SymptomTracker';
import TabHeader from '../../components/TabHeader';
import TodayMeds from '../../components/TodayMeds';
import { getBabySize } from '../../lib/babySizes';
import { dayKey } from '../../lib/dates';
import { getMilestones } from '../../lib/milestones';
import { supabase } from '../../lib/supabase';
import { colors, fonts, gradient } from '../../lib/theme';
import { firstName } from '../../lib/user';
import { getWeekContent } from '../../lib/weeklyContent';

type RawContraction = { start: string; end: string };

function ProgressRing({ progress, week, day }: { progress: number; week: number; day: number }) {
  const size = 150;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(1, Math.max(0, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accent} />
            <Stop offset="1" stopColor={colors.accentDeep} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.petal} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke="url(#ring)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.ringNum}>{week}</Text>
        <Text style={styles.ringLabel}>WEEKS</Text>
        <Text style={styles.ringDays}>+ {day} {day === 1 ? 'day' : 'days'}</Text>
      </View>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(dayKey(new Date()));

  // today's quick-tool stats
  const [kicksToday, setKicksToday] = useState(0);
  const [water, setWater] = useState({ glasses: 0, goal: 8 });
  const [nextAppt, setNextAppt] = useState<{ date: string; title: string } | null>(null);

  // past-day review
  const [kickStats, setKickStats] = useState({ sessions: 0, kicks: 0, avgMin: 0 });
  const [conStats, setConStats] = useState({ sessions: 0, count: 0, avgSec: 0 });

  const todayKey = dayKey(new Date());
  const isToday = selectedDay === todayKey;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setName(firstName(user));
        const { data } = await supabase
          .from('pregnancies').select('due_date').eq('is_active', true)
          .order('created_at', { ascending: false }).limit(1);
        if (!data || data.length === 0) { router.replace('/onboarding'); return; }
        setDueDate(new Date(data[0].due_date + 'T00:00:00'));
        setLoading(false);

        const today = dayKey(new Date());
        const [{ data: kt }, { data: w }, { data: appt }] = await Promise.all([
          supabase.from('kick_sessions').select('kick_count')
            .gte('started_at', today + 'T00:00:00').lte('started_at', today + 'T23:59:59'),
          supabase.from('water_logs').select('glasses, goal').eq('log_date', today).maybeSingle(),
          supabase.from('appointments').select('appt_at, title')
            .gte('appt_at', new Date().toISOString()).order('appt_at', { ascending: true }).limit(1),
        ]);
        setKicksToday((kt ?? []).reduce((s, k) => s + (k.kick_count ?? 0), 0));
        if (w) setWater({ glasses: w.glasses ?? 0, goal: w.goal ?? 8 });
        if (appt && appt.length > 0) {
          setNextAppt({
            date: new Date(appt[0].appt_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            title: appt[0].title ?? 'Appointment',
          });
        } else setNextAppt(null);
      })();
    }, [])
  );

  useEffect(() => {
    if (isToday) return;
    (async () => {
      const dayStart = new Date(selectedDay + 'T00:00:00');
      const dayEnd = new Date(selectedDay + 'T23:59:59.999');
      const [{ data: kicks }, { data: cons }] = await Promise.all([
        supabase.from('kick_sessions').select('started_at, ended_at, kick_count')
          .gte('started_at', dayStart.toISOString()).lte('started_at', dayEnd.toISOString()),
        supabase.from('contraction_sessions').select('started_at, contractions')
          .gte('started_at', dayStart.toISOString()).lte('started_at', dayEnd.toISOString()),
      ]);
      const ks = kicks ?? [];
      const totalKicks = ks.reduce((s, k) => s + k.kick_count, 0);
      const durations = ks.filter((k) => k.ended_at)
        .map((k) => (new Date(k.ended_at!).getTime() - new Date(k.started_at).getTime()) / 60000);
      const avgMin = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
      setKickStats({ sessions: ks.length, kicks: totalKicks, avgMin });

      const cs = cons ?? [];
      const all: RawContraction[] = cs.flatMap((c) => c.contractions ?? []);
      const avgSec = all.length
        ? Math.round(all.reduce((s, c) => s + (new Date(c.end).getTime() - new Date(c.start).getTime()) / 1000, 0) / all.length)
        : 0;
      setConStats({ sessions: cs.length, count: all.length, avgSec });
    })();
  }, [selectedDay, isToday]);

  if (loading || !dueDate) {
    return <View style={styles.centerBox}><Text style={styles.muted}>Loading…</Text></View>;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  function weekInfoFor(dateKey: string) {
    const d = new Date(dateKey + 'T00:00:00');
    const daysToGo = Math.round((dueDate!.getTime() - d.getTime()) / msPerDay);
    const daysAlong = 280 - daysToGo;
    return { week: Math.max(0, Math.floor(daysAlong / 7)), day: Math.max(0, daysAlong % 7),
      daysToGo: Math.max(0, daysToGo), daysAlong };
  }

  const todayInfo = weekInfoFor(todayKey);
  const selInfo = weekInfoFor(selectedDay);
  const trimester = todayInfo.week <= 13 ? 1 : todayInfo.week <= 27 ? 2 : 3;
  const progress = Math.min(1, Math.max(0, todayInfo.daysAlong / 280));
  const size = getBabySize(todayInfo.week);
  const milestones = getMilestones(trimester);
  const insight = getWeekContent(todayInfo.week);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const fmtAvgSec = `${Math.floor(conStats.avgSec / 60)}:${(conStats.avgSec % 60).toString().padStart(2, '0')}`;
  const selLabel = new Date(selectedDay + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const dueLabel = dueDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 14, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <TabHeader name={name} subtitle={greeting} />

        <View style={{ marginTop: 20 }}>
          <DayStrip selected={selectedDay} onSelect={setSelectedDay} />
        </View>

        {isToday ? (
          <>
            {/* hero ring */}
            <View style={styles.heroWrap}>
              <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.triPill}>
                <Text style={styles.triText}>Trimester {trimester}</Text>
              </LinearGradient>
              <ProgressRing progress={progress} week={todayInfo.week} day={todayInfo.day} />
              <Text style={styles.daysToGo}>{todayInfo.daysToGo} days to go</Text>

              {/* baby size card */}
              <View style={styles.sizeCard}>
                <View style={styles.sizeEmojiBox}><Text style={styles.sizeEmoji}>{size.emoji}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.sizeLabel}>{"Baby's size"}</Text>
                  <Text style={styles.sizeItem}>{capitalize(size.item)}</Text>
                  <Text style={styles.sizeMeta}>~{size.length} · {size.weight}</Text>
                </View>
                <View style={styles.dueBox}>
                  <Text style={styles.dueLabel}>Due</Text>
                  <Text style={styles.dueValue}>{dueLabel}</Text>
                </View>
              </View>
            </View>

            {/* quick tools grid */}
            <View style={styles.grid}>
              <ToolTile icon="footprint" big={String(kicksToday)} sub="Kicks logged today" onPress={() => router.push('/kick-counter')} />
              <ToolTile icon="clock" big="Time" sub="Tap to time contractions" onPress={() => router.push('/contraction-timer')} />
              <ToolTile icon="water" big={`${water.glasses}/${water.goal}`} sub="Glasses of water today" onPress={() => router.push('/water-tracker')} />
              <ToolTile icon="calendar" big={nextAppt?.date ?? '—'} sub={nextAppt ? `Next · ${nextAppt.title}` : 'No upcoming appointments'} onPress={() => router.push('/appointments')} />
            </View>

            {/* daily insight */}
            <View style={styles.insight}>
              <View style={styles.insightHead}>
                <Icon name="bulb" size={16} color={colors.accentDeep} />
                <Text style={styles.insightLabel}>Daily insight</Text>
              </View>
              <Text style={styles.insightText}>{insight.babyDetail}</Text>
            </View>

            {/* milestones */}
            <Text style={styles.sectionTitle}>{"This week's milestones"}</Text>
            <View style={{ gap: 10 }}>
              {milestones.map((m) => (
                <View key={m.title} style={styles.mileRow}>
                  <View style={styles.mileIcon}>
                    <MilestoneGlyph icon={m.icon} size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.mileTitle}>{m.title}</Text>
                    <Text style={styles.mileDesc}>{m.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TodayMeds />
            <SymptomTracker />
          </>
        ) : (
          <>
            <View style={styles.dayHead}>
              <Icon name="calendar" size={16} color={colors.accentDeep} />
              <Text style={styles.dayHeadDate}>{selLabel}</Text>
              <Text style={styles.dayHeadWeek}>Week {selInfo.week} + {selInfo.day} {selInfo.day === 1 ? 'day' : 'days'}</Text>
            </View>
            <SymptomTracker date={selectedDay} readOnly />
            <View style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <Icon name="footprint" size={16} color={colors.accentDeep} strokeWidth={1.6} />
                <Text style={styles.reviewTitle}>Kick counter</Text>
                <TouchableOpacity onPress={() => router.push('/kick-counter')}><Text style={styles.viewAll}>View all ›</Text></TouchableOpacity>
              </View>
              {kickStats.sessions === 0 ? <Text style={styles.emptyText}>No kick sessions this day.</Text> : (
                <View style={styles.statsRow}>
                  <Stat v={String(kickStats.sessions)} k="SESSIONS" />
                  <Stat v={String(kickStats.kicks)} k="KICKS" />
                  <Stat v={`${kickStats.avgMin} min`} k="AVG" />
                </View>
              )}
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <Icon name="timer" size={16} color={colors.accentDeep} />
                <Text style={styles.reviewTitle}>Contraction timer</Text>
                <TouchableOpacity onPress={() => router.push('/contraction-timer')}><Text style={styles.viewAll}>View all ›</Text></TouchableOpacity>
              </View>
              {conStats.sessions === 0 ? <Text style={styles.emptyText}>No contraction sessions this day.</Text> : (
                <View style={styles.statsRow}>
                  <Stat v={String(conStats.sessions)} k="SESSIONS" />
                  <Stat v={String(conStats.count)} k="TOTAL" />
                  <Stat v={fmtAvgSec} k="AVG LEN" />
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => setSelectedDay(todayKey)}><Text style={styles.backToday}>↩ Back to today</Text></TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function ToolTile({ icon, big, sub, onPress }: { icon: IconName; big: string; sub: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tile} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.tileIcon}><Icon name={icon} size={20} color={colors.accent} /></View>
      <Text style={styles.tileBig} numberOfLines={1}>{big}</Text>
      <Text style={styles.tileSub} numberOfLines={2}>{sub}</Text>
    </TouchableOpacity>
  );
}

function Stat({ v, k }: { v: string; k: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statV}>{v}</Text>
      <Text style={styles.statK}>{k}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  container: { flex: 1 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.canvas },
  muted: { color: colors.muted, fontFamily: fonts.body5 },

  heroWrap: { alignItems: 'center', marginTop: 24 },
  triPill: { borderRadius: 100, paddingVertical: 9, paddingHorizontal: 18, marginBottom: 18 },
  triText: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.white, letterSpacing: 0.3 },
  ringNum: { fontFamily: fonts.display, fontSize: 50, lineHeight: 52, color: colors.ink },
  ringLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.6, color: colors.muted, marginTop: 4 },
  ringDays: { fontFamily: fonts.display, fontSize: 12, color: colors.accent, marginTop: 6 },
  daysToGo: { fontFamily: fonts.display, fontSize: 16, color: colors.accent, marginTop: 16 },

  sizeCard: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, marginTop: 16, width: '100%' },
  sizeEmojiBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sizeEmoji: { fontSize: 26 },
  sizeLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accent },
  sizeItem: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, marginTop: 5 },
  sizeMeta: { fontFamily: fonts.body5, fontSize: 11, color: colors.muted, marginTop: 4 },
  dueBox: { alignItems: 'flex-end', paddingLeft: 10, marginLeft: 2, borderLeftWidth: 1, borderLeftColor: colors.cardBorder },
  dueLabel: { fontFamily: fonts.body6, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  dueValue: { fontFamily: fonts.display, fontSize: 14, color: colors.ink, marginTop: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 26 },
  tile: { ...cardStyle, width: '47.8%', flexGrow: 1, padding: 15 },
  tileIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  tileBig: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  tileSub: { fontFamily: fonts.body5, fontSize: 11, color: colors.muted, marginTop: 5, lineHeight: 15 },

  insight: { backgroundColor: colors.accentSoft, borderRadius: 18, padding: 16, marginTop: 14 },
  insightHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.accentDeep },
  insightText: { fontFamily: fonts.display, fontSize: 15, lineHeight: 21, color: colors.ink, marginTop: 10 },

  sectionTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, marginTop: 24, marginBottom: 13 },
  mileRow: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13 },
  mileIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  mileTitle: { fontFamily: fonts.display, fontSize: 14, color: colors.ink },
  mileDesc: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 3 },

  dayHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, marginBottom: 4 },
  dayHeadDate: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  dayHeadWeek: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },
  reviewCard: { ...cardStyle, padding: 14, marginTop: 10 },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  reviewTitle: { fontFamily: fonts.display, fontSize: 14, color: colors.ink, flex: 1 },
  viewAll: { fontFamily: fonts.displaySemi, fontSize: 12, color: colors.accent },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1 },
  statV: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  statK: { fontFamily: fonts.body6, fontSize: 9, color: colors.muted, marginTop: 2, letterSpacing: 0.5 },
  emptyText: { fontFamily: fonts.body5, fontSize: 13, color: colors.muted },
  backToday: { textAlign: 'center', color: colors.accent, fontFamily: fonts.displaySemi, fontSize: 14, paddingVertical: 14 },
});
