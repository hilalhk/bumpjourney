import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import GradientButton from '../components/GradientButton';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import { colors, fonts, gradient } from '../lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  { title: 'Track Every Beautiful Moment', sub: 'Follow your pregnancy week by week and never miss a milestone along the way.' },
  { title: "Understand Your Baby's Growth", sub: 'See how your baby develops every single week, from tiny seed to fully grown.' },
  { title: 'Stay Healthy & Prepared', sub: 'Kick counts, contraction timing, appointments and more — all in one calm place.' },
  { title: 'Capture Your Journey Forever', sub: 'Keep a private journal and photo timeline of your bump, to treasure forever.' },
];

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: 'clock', label: 'Weekly tracking' },
  { icon: 'medical', label: 'Baby growth' },
  { icon: 'heart', label: 'Health tools' },
  { icon: 'clipboard', label: 'Journal & photos' },
];

export default function Intro() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const totalPages = SLIDES.length + 1;

  async function finish() {
    await AsyncStorage.setItem('intro_seen', '1');
    router.replace('/login');
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const p = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (p !== page) setPage(p);
  }

  function next() {
    if (page >= totalPages - 1) { finish(); return; }
    scrollRef.current?.scrollTo({ x: (page + 1) * SCREEN_W, animated: true });
    setPage(page + 1);
  }

  return (
    <View style={styles.root}>
      <ScreenGlow intensity={0.2} />

      {page < totalPages - 1 && (
        <TouchableOpacity style={styles.skip} onPress={finish} hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {/* Slides 1–4 */}
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.page, { width: SCREEN_W }]}>
            <View style={styles.art}>{renderArt(i)}</View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.sub}>{s.sub}</Text>
          </View>
        ))}

        {/* Slide 5 — companion */}
        <View style={[styles.page, { width: SCREEN_W }]}>
          <View style={styles.logoBox}>
            <Image source={require('../assets/images/bumpjourney-logo.png')} style={styles.logoImg} contentFit="cover" />
          </View>
          <Text style={[styles.title, { marginTop: 22 }]}>Everything You Need In One Pregnancy Companion</Text>
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.feature}>
                <View style={styles.featureIcon}><Icon name={f.icon} size={17} color={colors.accent} /></View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* footer */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
          ))}
        </View>
        <GradientButton
          label={page >= totalPages - 1 ? 'Get Started' : 'Next'}
          onPress={next}
          icon={page < totalPages - 1 ? <Icon name="arrow-right" size={17} color={colors.white} strokeWidth={2.4} /> : undefined}
        />
        {page >= totalPages - 1 && (
          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={finish} hitSlop={8}><Text style={styles.signinLink}>Sign in</Text></TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function renderArt(i: number) {
  if (i === 0) {
    return (
      <View style={styles.artCircleWrap}>
        <View style={styles.artHalo} />
        <Image source={require('../assets/images/illus-mother-1.png')} style={styles.artMother} contentFit="cover" />
        <FloatChip style={{ left: 0, top: 30 }} dot label="Week 24" />
        <FloatChip style={{ right: 0, top: 60 }} icon="timer" label="Contractions" />
        <FloatChip style={{ left: 10, bottom: 24 }} icon="footprint" label="10 kicks" />
        <FloatChip style={{ right: 4, bottom: 50 }} icon="calendar" label="Due Oct 14" />
      </View>
    );
  }
  if (i === 1) {
    const sizes = [{ w: 34, l: 'Wk 8' }, { w: 50, l: 'Wk 16' }, { w: 72, l: 'Wk 24', now: true }, { w: 84, l: 'Wk 32' }, { w: 98, l: 'Wk 40' }];
    return (
      <View style={styles.growthRow}>
        {sizes.map((s) => (
          <View key={s.l} style={styles.growthCol}>
            {s.now ? (
              <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.growthDot, { width: s.w, height: s.w, borderRadius: s.w / 2 }]}>
                <Text style={styles.growthNow}>Now</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.growthDot, { width: s.w, height: s.w, borderRadius: s.w / 2, backgroundColor: colors.accentSoft }]} />
            )}
            <Text style={[styles.growthLabel, s.now && { color: colors.accentDeep }]}>{s.l}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (i === 2) {
    const tools: IconName[] = ['footprint', 'timer', 'pill', 'water', 'calendar'];
    return (
      <View style={styles.orbit}>
        <View style={styles.orbitRing} />
        <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orbitCore}>
          <Icon name="heart" size={46} color={colors.white} fill />
        </LinearGradient>
        {tools.map((t, idx) => {
          const angle = (idx / tools.length) * 2 * Math.PI - Math.PI / 2;
          const R = 120;
          return (
            <View key={t} style={[styles.orbitChip, { left: 130 + R * Math.cos(angle) - 23, top: 130 + R * Math.sin(angle) - 23 }]}>
              <Icon name={t} size={20} color={colors.accent} strokeWidth={t === 'footprint' || t === 'pill' ? 1.6 : 2} />
            </View>
          );
        })}
      </View>
    );
  }
  // i === 3
  return (
    <View style={styles.photoWrap}>
      <Image source={require('../assets/images/illus-photo-1.png')} style={[styles.photo, { transform: [{ rotate: '-7deg' }], left: 20, top: 20 }]} contentFit="cover" />
      <Image source={require('../assets/images/illus-scan-2.png')} style={[styles.photo, { transform: [{ rotate: '6deg' }], right: 14, top: 8, width: 120, height: 144 }]} contentFit="cover" />
      <View style={styles.noteCard}>
        <View style={styles.noteHead}>
          <View style={styles.noteIcon}><Icon name="heart" size={13} color={colors.accent} fill /></View>
          <Text style={styles.noteText}>Week 24 · felt the first kicks today</Text>
        </View>
        <View style={styles.noteBar} />
        <View style={[styles.noteBar, { width: '70%' }]} />
      </View>
    </View>
  );
}

function FloatChip({ style, label, icon, dot }: { style: any; label: string; icon?: IconName; dot?: boolean }) {
  return (
    <View style={[styles.floatChip, style]}>
      {dot && <View style={styles.floatDot} />}
      {icon && <Icon name={icon} size={13} color={colors.accent} strokeWidth={icon === 'footprint' ? 1.6 : 2} />}
      <Text style={styles.floatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  skip: { position: 'absolute', top: 14, right: 22, zIndex: 10 },
  skipText: { fontFamily: fonts.body6, fontSize: 13, color: colors.muted },

  page: { flex: 1, paddingHorizontal: 30, paddingTop: 60, alignItems: 'center' },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  title: { fontFamily: fonts.display, fontSize: 27, lineHeight: 32, color: colors.ink, textAlign: 'center' },
  sub: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 11, marginBottom: 20 },

  // slide 1
  artCircleWrap: { width: 300, height: 330, alignItems: 'center', justifyContent: 'center' },
  artHalo: { position: 'absolute', width: 212, height: 212, borderRadius: 106, backgroundColor: colors.accentSoft },
  artMother: { width: 188, height: 188, borderRadius: 94 },
  floatChip: {
    position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 100,
    paddingVertical: 8, paddingHorizontal: 13,
    shadowColor: '#3A1626', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 5,
  },
  floatDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  floatLabel: { fontFamily: fonts.displaySemi, fontSize: 12, color: colors.ink },

  // slide 2
  growthRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  growthCol: { alignItems: 'center', gap: 9 },
  growthDot: { alignItems: 'center', justifyContent: 'center' },
  growthNow: { fontFamily: fonts.displaySemi, fontSize: 12, color: colors.white },
  growthLabel: { fontFamily: fonts.body6, fontSize: 10, color: colors.muted },

  // slide 3
  orbit: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  orbitRing: { position: 'absolute', width: 252, height: 252, borderRadius: 126, borderWidth: 2, borderColor: '#E6D4DC', borderStyle: 'dashed' },
  orbitCore: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', ...{ shadowColor: colors.accent, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.32, shadowRadius: 32, elevation: 8 } },
  orbitChip: { position: 'absolute', width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center', ...{ shadowColor: '#3A1626', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 22, elevation: 5 } },

  // slide 4
  photoWrap: { width: 290, height: 300, alignItems: 'center', justifyContent: 'center' },
  photo: { position: 'absolute', width: 140, height: 170, borderRadius: 18, borderWidth: 5, borderColor: colors.white },
  noteCard: { ...cardStyle, position: 'absolute', left: 30, right: 24, bottom: 0, padding: 14, transform: [{ rotate: '-2deg' }] },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  noteText: { fontFamily: fonts.body6, fontSize: 11, color: colors.accentDeep, flex: 1 },
  noteBar: { height: 6, borderRadius: 100, backgroundColor: '#F4ECEF', marginTop: 11 },

  // slide 5
  logoBox: { width: 72, height: 72, borderRadius: 21, overflow: 'hidden', marginTop: 'auto', ...{ shadowColor: colors.accent, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.32, shadowRadius: 36, elevation: 8 } },
  logoImg: { width: '100%', height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 26, marginBottom: 'auto' },
  feature: { ...cardStyle, width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 16 },
  featureIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontFamily: fonts.displaySemi, fontSize: 12, color: colors.ink, flexShrink: 1 },

  // footer
  footer: { paddingHorizontal: 30, paddingBottom: 40 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 22 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EAD9E0' },
  dotOn: { width: 26, backgroundColor: colors.accent },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  signinText: { fontFamily: fonts.body5, fontSize: 13, color: colors.muted },
  signinLink: { fontFamily: fonts.body6, fontSize: 13, color: colors.accentDeep },
});
