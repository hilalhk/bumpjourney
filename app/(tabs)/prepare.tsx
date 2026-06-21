import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../../components/Card';
import { Icon, IconName } from '../../components/Icons';
import ScreenGlow from '../../components/ScreenGlow';
import { usePregnancy } from '../../hooks/usePregnancy';
import { colors, fonts, gradient, radius, shadow } from '../../lib/theme';

const TOOLS: { route: string; icon: IconName; title: string; sub: string }[] = [
  { route: '/baby-names', icon: 'heart', title: 'Baby names', sub: 'Browse & build your shortlist' },
  { route: '/hospital-bag', icon: 'bag', title: 'Hospital bag', sub: 'Checklist for the big day' },
  { route: '/birth-plan', icon: 'document', title: 'Birth plan', sub: 'Note your preferences' },
];

export default function Prepare() {
  const router = useRouter();
  const info = usePregnancy();
  const dueLabel = info ? info.dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Prepare</Text>
        <Text style={styles.subtitle}>Get ready for the big day, one step at a time.</Text>

        {info && (
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.banner, shadow.accent]}>
            <View style={styles.bannerBadge}><Text style={styles.bannerBadgeNum}>{info.daysToGo}</Text></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.bannerTitle}>{info.daysToGo} days to go</Text>
              <Text style={styles.bannerSub}>Due {dueLabel} · plenty of time to plan</Text>
            </View>
          </LinearGradient>
        )}

        <Text style={styles.sectionLabel}>Planning tools</Text>
        {TOOLS.map((t) => (
          <TouchableOpacity key={t.route} style={styles.row} activeOpacity={0.85} onPress={() => router.push(t.route as any)}>
            <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rowIcon}>
              <Icon name={t.icon} size={22} color={colors.white} />
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowTitle}>{t.title}</Text>
              <Text style={styles.rowSub}>{t.sub}</Text>
            </View>
            <Icon name="chevron-right" size={17} color={colors.faint} strokeWidth={2.2} />
          </TouchableOpacity>
        ))}

        <View style={styles.tip}>
          <View style={{ marginTop: 1 }}><Icon name="bulb" size={17} color={colors.accentDeep} /></View>
          <Text style={styles.tipText}>
            Most people pack their hospital bag by around week 36 — but starting your lists early takes the pressure off.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { padding: 20, paddingTop: 14, paddingBottom: 140 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginTop: 12 },
  subtitle: { fontFamily: fonts.body5, fontSize: 13, color: colors.muted, marginTop: 6 },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: radius.tile, padding: 16, marginTop: 18 },
  bannerBadge: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bannerBadgeNum: { fontFamily: fonts.display, fontSize: 19, color: colors.white },
  bannerTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.white },
  bannerSub: { fontFamily: fonts.body5, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted, marginTop: 24, marginBottom: 12, marginHorizontal: 2 },
  row: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, marginBottom: 10 },
  rowIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 3 },

  tip: { flexDirection: 'row', gap: 10, backgroundColor: colors.accentSoft, borderRadius: radius.tile, padding: 14, marginTop: 14 },
  tipText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: colors.accentDeep },
});
