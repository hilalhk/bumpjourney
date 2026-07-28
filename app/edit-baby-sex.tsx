import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeCardStyle } from '../components/Card';
import { showAlert } from '../components/ConfirmDialog';
import GradientButton from '../components/GradientButton';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { Baby, BabySex, babiesPayload, readBabies, resizeBabies } from '../lib/babies';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

const SEX_OPTIONS: { key: BabySex; label: string; icon: IconName }[] = [
  { key: 'girl', label: 'Girl', icon: 'gender-girl' },
  { key: 'boy', label: 'Boy', icon: 'gender-boy' },
  { key: 'surprise', label: 'Surprise', icon: 'gift' },
];

const COUNT_OPTIONS = [1, 2, 3, 4];
const COUNT_CHIP: Record<number, string> = { 1: 'Just one', 2: 'Twins', 3: 'Triplets', 4: 'Quads' };

export default function EditBabies() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [babies, setBabies] = useState<Baby[]>([{ sex: null, name: '' }]);
  const [existing, setExisting] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Keyboard-aware scrolling: on Android (edge-to-edge) the keyboard covers
  // lower name fields, so we track its height (to pad the scroll) and scroll the
  // focused baby's card into view.
  const scrollRef = useRef<ScrollView>(null);
  const cardY = useRef<number[]>([]);
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const scrollToCard = (i: number) =>
    setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, (cardY.current[i] ?? 0) - 40), animated: true }), 50);

  useEffect(() => {
    (async () => {
      const [{ data }, { data: favs }] = await Promise.all([
        supabase.from('prep_data').select('payload').eq('kind', 'pregnancy_details').maybeSingle(),
        supabase.from('name_favorites').select('name').order('created_at', { ascending: false }),
      ]);
      const info = readBabies(data?.payload);
      setCount(info.count);
      setBabies(info.babies);
      setExisting(data?.payload ?? {});
      setFavorites([...new Set((favs ?? []).map((f) => f.name as string))]);
      setLoading(false);
    })();
  }, []);

  function changeCount(n: number) {
    setCount(n);
    setBabies((prev) => resizeBabies(prev, n));
  }
  function setSex(i: number, sex: BabySex) {
    setBabies((prev) => prev.map((b, idx) => (idx === i ? { ...b, sex } : b)));
  }
  function setName(i: number, name: string) {
    setBabies((prev) => prev.map((b, idx) => (idx === i ? { ...b, name } : b)));
  }

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    // Drop the legacy single `sex` key; persist the new count + babies shape.
    const { sex: _legacy, ...rest } = existing;
    const payload = { ...rest, ...babiesPayload({ count, babies }) };
    const { error } = await supabase.from('prep_data').upsert(
      { user_id: user!.id, kind: 'pregnancy_details', payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,kind' }
    );
    setSaving(false);
    if (error) { showAlert({ title: 'Error', message: error.message, tone: 'error' }); return; }
    router.back();
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Your babies" />

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 + insets.bottom + kbHeight }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Expecting more than one? Set how many babies you{"'"}re expecting, then add each one{"'"}s gender and name. You can change this anytime.</Text>

        {loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : (
          <>
            <Text style={styles.sectionLabel}>How many babies?</Text>
            <View style={styles.countRow}>
              {COUNT_OPTIONS.map((n) => {
                const on = count === n;
                return (
                  <TouchableOpacity key={n} style={[styles.countChip, on && styles.countChipOn]} onPress={() => changeCount(n)} activeOpacity={0.85}>
                    <Text style={[styles.countChipText, on && styles.countChipTextOn]}>{COUNT_CHIP[n]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {babies.map((baby, i) => (
              <View key={i} style={styles.babyCard} onLayout={(e) => { cardY.current[i] = e.nativeEvent.layout.y; }}>
                {count > 1 && <Text style={styles.babyHead}>Baby {i + 1}</Text>}
                <View style={styles.sexRow}>
                  {SEX_OPTIONS.map((o) => {
                    const on = baby.sex === o.key;
                    return (
                      <TouchableOpacity key={o.key} style={[styles.sexPill, on && styles.sexPillOn]} onPress={() => setSex(i, o.key)} activeOpacity={0.85}>
                        <Icon name={o.icon} size={17} color={on ? colors.onAccent : colors.accent} />
                        <Text style={[styles.sexText, on && styles.sexTextOn]}>{o.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.nameInput}
                  placeholder={count > 1 ? `Baby ${i + 1} name or nickname (optional)` : 'Name or nickname (optional)'}
                  placeholderTextColor={colors.faint}
                  value={baby.name}
                  onChangeText={(t) => setName(i, t)}
                  onFocus={() => scrollToCard(i)}
                  autoCapitalize="words"
                />
                {favorites.length > 0 && (
                  <View style={styles.suggestWrap}>
                    <Text style={styles.suggestLabel}>From your shortlist</Text>
                    <View style={styles.suggestChips}>
                      {favorites.map((nm) => {
                        const on = baby.name.trim() === nm;
                        return (
                          <TouchableOpacity key={nm} style={[styles.suggestChip, on && styles.suggestChipOn]} onPress={() => setName(i, on ? '' : nm)} activeOpacity={0.85}>
                            <Text style={[styles.suggestChipText, on && styles.suggestChipTextOn]}>{nm}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            ))}

            <GradientButton label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={saving || loading} style={{ marginTop: 16 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  intro: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 19, color: c.muted, marginBottom: 20 },
  muted: { fontFamily: fonts.body5, color: c.muted },
  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: c.muted, marginBottom: 12 },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  countChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder },
  countChipOn: { backgroundColor: c.accentFill, borderColor: c.accentFill },
  countChipText: { fontFamily: fonts.body6, fontSize: 13, color: c.subtleText },
  countChipTextOn: { color: c.onAccent },
  babyCard: { ...makeCardStyle(c), padding: 14, marginBottom: 12 },
  babyHead: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.accentDeep, marginBottom: 12 },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder },
  sexPillOn: { backgroundColor: c.accentFill, borderColor: c.accentFill },
  sexText: { fontFamily: fonts.body6, fontSize: 13, color: c.ink },
  sexTextOn: { color: c.onAccent },
  nameInput: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: 14, padding: 13, marginTop: 10, fontFamily: fonts.body5, fontSize: 14, color: c.ink },
  suggestWrap: { marginTop: 12 },
  suggestLabel: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: c.muted, marginBottom: 8 },
  suggestChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  suggestChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 100, backgroundColor: c.accentSoft },
  suggestChipOn: { backgroundColor: c.accentFill },
  suggestChipText: { fontFamily: fonts.body6, fontSize: 12, color: c.accentDeep },
  suggestChipTextOn: { color: c.onAccent },
});
