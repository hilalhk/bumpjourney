import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeCardStyle } from '../components/Card';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { FOODS, FOOD_CATEGORIES, FoodItem, Verdict, searchFood } from '../lib/foodSafety';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

type VerdictMeta = { label: string; color: string; bg: string; icon: IconName };

// Light keeps the exact comp values. Dark uses the palette's status tokens, whose
// tinted backgrounds and lifted labels are held at >=4.5:1 (see lib/theme.ts).
const verdictFor = (c: Colors): Record<Verdict, VerdictMeta> =>
  c.scheme === 'light'
    ? {
        safe: { label: 'Safe', color: '#3E8E62', bg: '#E7F3EC', icon: 'verdict-safe' },
        caution: { label: 'With caution', color: '#A9761B', bg: '#F7EEDB', icon: 'verdict-caution' },
        avoid: { label: 'Avoid', color: c.danger, bg: '#F7E4E2', icon: 'verdict-avoid' },
      }
    : {
        safe: { label: 'Safe', color: c.safeText, bg: c.safeBg, icon: 'verdict-safe' },
        caution: { label: 'With caution', color: c.cautionText, bg: c.cautionBg, icon: 'verdict-caution' },
        avoid: { label: 'Avoid', color: c.avoidText, bg: c.avoidBg, icon: 'verdict-avoid' },
      };

export default function FoodSafety() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const verdict = verdictFor(colors);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  let results: FoodItem[];
  if (query.trim()) results = searchFood(query);
  else if (category) results = FOODS.filter((f) => f.category === category);
  else results = FOODS;

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Food Safety" rightGlyph="help" onRightPress={() => setHelpOpen((h) => !h)} />

      <View style={styles.searchWrap}>
        <Icon name="search" size={17} color={colors.muted} />
        <TextInput
          style={styles.search}
          placeholder="Search a food (e.g. sushi, brie, coffee)"
          placeholderTextColor={colors.faint}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Icon name="x-circle" size={17} color={colors.faint} />
          </TouchableOpacity>
        ) : null}
      </View>

      {!query.trim() && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
          <TouchableOpacity style={[styles.cat, category === null && styles.catOn]} onPress={() => setCategory(null)}>
            <Text style={[styles.catText, category === null && styles.catTextOn]}>All</Text>
          </TouchableOpacity>
          {FOOD_CATEGORIES.map((c) => {
            const on = category === c;
            return (
              <TouchableOpacity key={c} style={[styles.cat, on && styles.catOn]} onPress={() => setCategory(on ? null : c)}>
                <Text style={[styles.catText, on && styles.catTextOn]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {helpOpen && (
        <View style={styles.help}>
          <View style={{ marginTop: 1 }}><Icon name="info" size={16} color={colors.accentDeep} /></View>
          <Text style={styles.helpText}>
            General guidance only, not medical advice. Recommendations vary by country and situation — always confirm
            with your healthcare provider.
          </Text>
        </View>
      )}

      {/* flex:1 gives the list a definite basis so it absorbs the remaining height
          instead of overflowing the column and forcing siblings to shrink. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 40 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {results.length === 0 && (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}><Icon name="search" size={28} color={colors.accent} /></View>
            <Text style={styles.empty}>No match for &quot;{query}&quot;. Try a simpler word, and always check with your provider if unsure.</Text>
          </View>
        )}
        {results.map((f) => {
          const m = verdict[f.verdict];
          return (
            <View key={f.name} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.foodName}>{f.name}</Text>
                <View style={[styles.badge, { backgroundColor: m.bg }]}>
                  <Icon name={m.icon} size={13} color={m.color} strokeWidth={2.4} />
                  <Text style={[styles.badgeText, { color: m.color }]}>{m.label}</Text>
                </View>
              </View>
              <Text style={styles.reason}>{f.reason}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    marginHorizontal: 18, paddingHorizontal: 13, height: 46,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: 14,
  },
  search: { flex: 1, fontFamily: fonts.body5, fontSize: 14, color: c.ink },
  // flexShrink must be pinned to 0: ScrollView's own `baseHorizontal` style sets
  // flexShrink:1, so this fixed-height strip is shrinkable by default. When the
  // help panel opens, the column overflows and Yoga squeezes the strip, clipping
  // the chips. flexGrow:0 alone does not prevent that.
  catScroll: { marginTop: 12, flexGrow: 0, flexShrink: 0, height: 44 },
  catRow: { paddingHorizontal: 18, gap: 8, alignItems: 'center' },
  cat: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 100, backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder },
  catOn: { backgroundColor: c.accentFill, borderColor: c.accentFill },
  catText: { fontFamily: fonts.body6, fontSize: 12, lineHeight: 16, color: c.subtleText },
  catTextOn: { color: c.onAccent },

  card: { ...makeCardStyle(c), padding: 14, marginBottom: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  foodName: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: c.ink },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 100 },
  badgeText: { fontFamily: fonts.body6, fontSize: 10 },
  reason: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: c.subtleText, marginTop: 8 },

  emptyWrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 21, color: c.muted, textAlign: 'center', marginTop: 16 },
  help: { flexDirection: 'row', gap: 9, backgroundColor: c.accentSoft, borderRadius: radius.tile, paddingVertical: 13, paddingHorizontal: 15, marginHorizontal: 18, marginTop: 12 },
  helpText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: c.accentDeep },
});
