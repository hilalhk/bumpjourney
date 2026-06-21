import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { BabyName, Gender, ORIGINS, searchNames } from '../lib/babyNames';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../lib/theme';

type Tab = 'browse' | 'favorites';

const TONE: Record<string, { bg: string; color: string }> = {
  girl: { bg: colors.accentSoft, color: colors.accent },
  boy: { bg: '#E7ECF5', color: '#5A78A8' },
  unisex: { bg: '#EEE7F2', color: '#8A77B8' },
};

export default function BabyNames() {
  const [tab, setTab] = useState<Tab>('browse');
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [origin, setOrigin] = useState<string | 'all'>('all');
  const [showOrigins, setShowOrigins] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favList, setFavList] = useState<BabyName[]>([]);

  const keyOf = (n: BabyName) => `${n.name}|${n.gender}`;

  const loadFavorites = useCallback(async () => {
    const { data } = await supabase
      .from('name_favorites')
      .select('name, gender, meaning, origin')
      .order('created_at', { ascending: false });
    const rows = (data ?? []) as BabyName[];
    setFavList(rows);
    setFavorites(new Set(rows.map((r) => `${r.name}|${r.gender}`)));
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  async function toggleFav(n: BabyName) {
    const k = keyOf(n);
    const { data: { user } } = await supabase.auth.getUser();
    if (favorites.has(k)) {
      await supabase.from('name_favorites').delete().eq('name', n.name).eq('gender', n.gender);
    } else {
      await supabase.from('name_favorites').insert({
        user_id: user!.id, name: n.name, gender: n.gender, meaning: n.meaning, origin: n.origin,
      });
    }
    loadFavorites();
  }

  const results = searchNames(query, gender, origin);
  const list = tab === 'browse' ? results : favList;

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Baby names" />

      <View style={styles.fixed}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'browse' && styles.tabOn]} onPress={() => setTab('browse')}>
            <Text style={[styles.tabText, tab === 'browse' && styles.tabTextOn]}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'favorites' && styles.tabOn]} onPress={() => setTab('favorites')}>
            <Text style={[styles.tabText, tab === 'favorites' && styles.tabTextOn]}>Shortlist{favList.length > 0 ? ` (${favList.length})` : ''}</Text>
          </TouchableOpacity>
        </View>

        {tab === 'browse' && (
          <>
            <View style={styles.searchWrap}>
              <Icon name="search" size={16} color={colors.muted} />
              <TextInput style={styles.search} placeholder="Search names or meanings" placeholderTextColor={colors.faint} value={query} onChangeText={setQuery} autoCorrect={false} />
              {query ? <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}><Icon name="x-circle" size={16} color={colors.faint} /></TouchableOpacity> : null}
            </View>
            <View style={styles.filterRow}>
              {(['all', 'girl', 'boy', 'unisex'] as const).map((g) => (
                <TouchableOpacity key={g} style={[styles.gChip, gender === g && styles.gChipOn]} onPress={() => setGender(g)}>
                  <Text style={[styles.gChipText, gender === g && styles.gChipTextOn]}>{g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.gChip, origin !== 'all' && styles.gChipOn]} onPress={() => setShowOrigins(!showOrigins)}>
                <Icon name="globe" size={13} color={origin !== 'all' ? colors.white : colors.muted} />
                <Text style={[styles.gChipText, origin !== 'all' && styles.gChipTextOn]}>{origin === 'all' ? 'Origin' : origin}</Text>
              </TouchableOpacity>
            </View>
            {showOrigins && (
              <View style={styles.originPanel}>
                <TouchableOpacity style={[styles.oChip, origin === 'all' && styles.oChipOn]} onPress={() => { setOrigin('all'); setShowOrigins(false); }}>
                  <Text style={[styles.oChipText, origin === 'all' && styles.oChipTextOn]}>All origins</Text>
                </TouchableOpacity>
                {ORIGINS.map((o) => (
                  <TouchableOpacity key={o} style={[styles.oChip, origin === o && styles.oChipOn]} onPress={() => { setOrigin(o); setShowOrigins(false); }}>
                    <Text style={[styles.oChipText, origin === o && styles.oChipTextOn]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={keyOf}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={tab === 'browse' ? <Text style={styles.count}>{list.length} name{list.length !== 1 ? 's' : ''}</Text> : null}
        ListEmptyComponent={
          tab === 'favorites' ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}><Icon name="heart" size={26} color={colors.accent} /></View>
              <Text style={styles.emptyText}>No favourites yet. Tap the heart on any name to add it to your shortlist.</Text>
            </View>
          ) : (
            <Text style={styles.noMatch}>No names match. Try a different search or filter.</Text>
          )
        }
        ListFooterComponent={<Text style={styles.note}>Name meanings and origins are a guide and may vary by source and culture.</Text>}
        renderItem={({ item: n }) => {
          const fav = favorites.has(keyOf(n));
          const t = TONE[n.gender] ?? TONE.unisex;
          return (
            <View style={styles.card}>
              <View style={[styles.genderDot, { backgroundColor: t.bg }]}>
                <Icon name={n.gender === 'girl' ? 'gender-girl' : n.gender === 'boy' ? 'gender-boy' : 'gender-unisex'} size={17} color={t.color} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name}>{n.name}</Text>
                <Text style={styles.meaning}>{n.meaning}</Text>
                <Text style={styles.origin}>{n.origin}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFav(n)} style={styles.heartBtn} hitSlop={6}>
                <Icon name="heart" size={22} color={fav ? colors.accent : '#D8CDD4'} fill={fav} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  fixed: { paddingHorizontal: 18 },
  tabs: { flexDirection: 'row', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabOn: { backgroundColor: colors.accent },
  tabText: { fontFamily: fonts.body6, fontSize: 12, color: colors.muted },
  tabTextOn: { color: colors.white },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, height: 44, marginTop: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14 },
  search: { flex: 1, fontFamily: fonts.body5, fontSize: 14, color: colors.ink },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  gChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  gChipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  gChipText: { fontFamily: fonts.body6, fontSize: 12, color: '#6E5560' },
  gChipTextOn: { color: colors.white },
  originPanel: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  oChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 100, backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.cardBorder },
  oChipOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  oChipText: { fontFamily: fonts.body5, fontSize: 12, color: '#6E5560' },
  oChipTextOn: { color: colors.accentDeep, fontFamily: fonts.body6 },
  count: { fontFamily: fonts.body5, fontSize: 11, color: colors.muted, marginTop: 12, marginBottom: 10 },
  card: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 14, marginBottom: 9 },
  genderDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.displaySemi, fontSize: 17, color: colors.ink },
  meaning: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 16, color: '#6E5560', marginTop: 2 },
  origin: { fontFamily: fonts.body6, fontSize: 10, color: colors.muted, marginTop: 4 },
  heartBtn: { padding: 5 },
  emptyBox: { alignItems: 'center', marginTop: 44, gap: 14 },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center', paddingHorizontal: 32 },
  noMatch: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 24 },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, textAlign: 'center', marginTop: 16, paddingHorizontal: 14 },
});
