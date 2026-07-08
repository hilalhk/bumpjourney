import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { makeCardStyle } from '../../components/Card';
import { Icon, IconName } from '../../components/Icons';
import ScreenGlow from '../../components/ScreenGlow';
import TabHeader from '../../components/TabHeader';
import { usePregnancy, weekSubtitle } from '../../hooks/usePregnancy';
import { pendingCount, trySyncAll } from '../../lib/healthSync';
import { useTheme, useThemedStyles } from '../../lib/ThemeContext';
import { Colors, fonts, radius } from '../../lib/theme';

const TOOLS: { route: string; icon: IconName; title: string; sub: string }[] = [
  { route: '/kick-counter', icon: 'footprint', title: 'Kick Counter', sub: "Track baby's daily movements" },
  { route: '/contraction-timer', icon: 'timer', title: 'Contraction Timer', sub: 'Time length and frequency' },
  { route: '/appointments', icon: 'calendar', title: 'Appointments', sub: 'Visits, scans and tests' },
  { route: '/medications', icon: 'pill', title: 'Medications', sub: 'Supplements & prescriptions' },
  { route: '/food-safety', icon: 'celery', title: 'Food Safety', sub: "Check what's safe to eat" },
  { route: '/water-tracker', icon: 'water', title: 'Water Tracker', sub: 'Stay hydrated each day' },
];

export default function Health() {
  const { colors, gradient, shadow } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const info = usePregnancy();
  const [pending, setPending] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await trySyncAll();
        setPending(await pendingCount());
      })();
    }, [])
  );

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TabHeader subtitle={weekSubtitle(info)} />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Health</Text>
          <Text style={styles.subtitle}>Your tracking tools and care info, all in one place.</Text>
        </View>

        <View style={styles.syncPill}>
          <Icon name="sync" size={16} color={colors.accentDeep} />
          <Text style={styles.syncText}>
            {pending > 0
              ? `${pending} session${pending > 1 ? 's' : ''} waiting to sync — will upload automatically.`
              : 'All your data is synced and up to date.'}
          </Text>
        </View>

        <View style={styles.grid}>
          {TOOLS.map((t) => (
            <TouchableOpacity key={t.route} style={styles.tile} activeOpacity={0.85} onPress={() => router.push(t.route as any)}>
              <View style={styles.tileIcon}><Icon name={t.icon} size={22} color={colors.accent} /></View>
              <Text style={styles.tileTitle}>{t.title}</Text>
              <Text style={styles.tileSub}>{t.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/emergency-info')} style={shadow.accent}>
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emergency}>
            <View style={styles.emergencyIcon}><Icon name="medkit" size={24} color={colors.onAccent} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.emergencyTitle}>Emergency Information</Text>
              <Text style={styles.emergencySub}>Doctor, hospital, blood group & contacts</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.onAccent} strokeWidth={2.4} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.disclaimerRow}>
          <View style={{ marginTop: 1 }}><Icon name="info" size={15} color={colors.faint} /></View>
          <Text style={styles.disclaimer}>
            These tools are for tracking only and are not medical advice. If you notice reduced movement or have any
            concerns, contact your healthcare provider right away.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.canvas },
  scroll: { padding: 20, paddingTop: 14, paddingBottom: 140 },
  titleBlock: { marginTop: 26 },
  title: { fontFamily: fonts.display, fontSize: 30, color: c.ink },
  subtitle: { fontFamily: fonts.body5, fontSize: 13, color: c.muted, marginTop: 6 },

  syncPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: c.accentSoft, borderRadius: radius.tile, padding: 12, marginTop: 18,
  },
  syncText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 16, color: c.accentDeep },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  tile: { ...makeCardStyle(c), width: '47.8%', flexGrow: 1, padding: 16 },
  tileIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  tileTitle: { fontFamily: fonts.display, fontSize: 16, color: c.ink },
  tileSub: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 15, color: c.muted, marginTop: 5 },

  emergency: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: radius.tile, padding: 16, marginTop: 14 },
  emergencyIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  emergencyTitle: { fontFamily: fonts.display, fontSize: 16, color: c.onAccent },
  emergencySub: { fontFamily: fonts.body5, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  disclaimerRow: { flexDirection: 'row', gap: 9, marginTop: 18, paddingHorizontal: 2 },
  disclaimer: { flex: 1, fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: c.faint },
});
