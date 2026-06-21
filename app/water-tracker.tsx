import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import GradientButton from '../components/GradientButton';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { todayStr } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

function WaterRing({ glasses, goal }: { glasses: number; goal: number }) {
  const size = 206, stroke = 12, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, glasses / goal);
  const litres = (glasses * 0.25).toFixed(2).replace(/\.?0+$/, '');
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.petal} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.accent} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.ringNum}>{glasses}<Text style={styles.ringGoal}> / {goal}</Text></Text>
        <Text style={styles.ringLabel}>GLASSES TODAY</Text>
        <Text style={styles.ringLitres}>{litres} L of ~2 L</Text>
      </View>
    </View>
  );
}

export default function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const [goal] = useState(8);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('water_logs').select('glasses').eq('log_date', todayStr()).maybeSingle();
      if (data) setGlasses(data.glasses);
    })();
  }, []);

  async function setCount(n: number) {
    const next = Math.max(0, Math.min(goal, n));
    setGlasses(next);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('water_logs').upsert(
      { user_id: user!.id, log_date: todayStr(), glasses: next, goal },
      { onConflict: 'user_id,log_date' }
    );
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Water Tracker" />
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 6 }}>
          <WaterRing glasses={glasses} goal={goal} />
        </View>

        <View style={styles.grid}>
          {Array.from({ length: goal }).map((_, i) => {
            const filled = i < glasses;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.glass, filled ? styles.glassOn : styles.glassOff]}
                onPress={() => setCount(i < glasses ? i : i + 1)}
                activeOpacity={0.8}
              >
                <Icon name="water" size={26} color={filled ? colors.accent : '#D8CDD4'} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.minusBtn} onPress={() => setCount(glasses - 1)} activeOpacity={0.85}>
            <Icon name="minus" size={22} color="#6E5560" strokeWidth={2.4} />
          </TouchableOpacity>
          <GradientButton
            label="Add a glass"
            onPress={() => setCount(glasses + 1)}
            icon={<Icon name="plus" size={20} color={colors.white} strokeWidth={2.6} />}
            style={{ borderRadius: 100 }}
          />
        </View>

        {glasses >= goal && (
          <View style={styles.celebrate}>
            <Text style={{ fontSize: 18 }}>🎉</Text>
            <Text style={styles.celebrateText}>You hit your goal today!</Text>
          </View>
        )}

        <Text style={styles.note}>
          Aim for around 8 glasses (1.5–2 litres) a day. Your needs may be higher in hot weather or later in
          pregnancy — listen to your body.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  ringNum: { fontFamily: fonts.display, fontSize: 60, lineHeight: 60, color: colors.ink },
  ringGoal: { fontSize: 26, color: colors.faint },
  ringLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1.8, color: colors.muted, marginTop: 8 },
  ringLitres: { fontFamily: fonts.body5, fontSize: 12, color: colors.accentDeep, marginTop: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 26, maxWidth: 300 },
  glass: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  glassOn: { backgroundColor: colors.accentSoft },
  glassOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28 },
  minusBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center' },

  celebrate: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.accentSoft, borderRadius: radius.tile, paddingVertical: 14, paddingHorizontal: 18, marginTop: 22 },
  celebrateText: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accentDeep },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 18, color: colors.faint, textAlign: 'center', marginTop: 24, paddingHorizontal: 18 },
});
