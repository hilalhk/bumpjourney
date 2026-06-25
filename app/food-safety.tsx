import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { FOODS, FOOD_CATEGORIES, FoodItem, Verdict, searchFood } from '../lib/foodSafety';
import { colors, fonts, radius } from '../lib/theme';

const VERDICT_META: Record<Verdict, { label: string; color: string; bg: string; icon: IconName }> = {
  safe: { label: 'Safe', color: '#3E8E62', bg: '#E7F3EC', icon: 'verdict-safe' },
  caution: { label: 'With caution', color: '#A9761B', bg: '#F7EEDB', icon: 'verdict-caution' },
  avoid: { label: 'Avoid', color: '#C0504A', bg: '#F7E4E2', icon: 'verdict-avoid' },
};

export default function FoodSafety() {
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {results.length === 0 && (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}><Icon name="search" size={28} color={colors.accent} /></View>
            <Text style={styles.empty}>No match for &quot;{query}&quot;. Try a simpler word, and always check with your provider if unsure.</Text>
          </View>
        )}
        {results.map((f) => {
          const m = VERDICT_META[f.verdict];
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    marginHorizontal: 18, paddingHorizontal: 13, height: 46,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14,
  },
  search: { flex: 1, fontFamily: fonts.body5, fontSize: 14, color: colors.ink },
  catScroll: { marginTop: 12, flexGrow: 0, height: 44 },
  catRow: { paddingHorizontal: 18, gap: 8, alignItems: 'center' },
  cat: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  catOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  catText: { fontFamily: fonts.body6, fontSize: 12, lineHeight: 16, color: '#6E5560' },
  catTextOn: { color: colors.white },

  card: { ...cardStyle, padding: 14, marginBottom: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  foodName: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 100 },
  badgeText: { fontFamily: fonts.body6, fontSize: 10 },
  reason: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: '#6E5560', marginTop: 8 },

  emptyWrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 16 },
  help: { flexDirection: 'row', gap: 9, backgroundColor: colors.accentSoft, borderRadius: radius.tile, paddingVertical: 13, paddingHorizontal: 15, marginHorizontal: 18, marginTop: 12 },
  helpText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: colors.accentDeep },
});
