import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeCardStyle } from '../components/Card';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

type Item = { id: string; label: string; checked: boolean; custom?: boolean };
type Section = { title: string; items: Item[] };

const DEFAULT_SECTIONS: Section[] = [
  { title: 'For you (labor)', items: ['Birth plan & maternity notes', 'Comfortable nightgown or t-shirt', 'Robe & slippers', 'Lip balm', 'Hair ties', 'Snacks & drinks', 'Phone charger (long cable)'].map((label, i) => ({ id: `you-${i}`, label, checked: false })) },
  { title: 'For you (after birth)', items: ['Maternity pads', 'Comfortable underwear', 'Nursing bras', 'Going-home outfit', 'Toiletries', 'Towel'].map((label, i) => ({ id: `after-${i}`, label, checked: false })) },
  { title: 'For baby', items: ['Bodysuits / onesies (newborn)', 'Footed pajamas', 'Hat, mittens & socks', 'Burp cloths', 'Diapers (newborn size)', 'Cotton balls / wipes', 'Blanket', 'Going-home outfit', 'Car seat'].map((label, i) => ({ id: `baby-${i}`, label, checked: false })) },
  { title: 'For your partner', items: ['Snacks & drinks', 'Change of clothes', 'Phone & charger', 'Cash / cards'].map((label, i) => ({ id: `partner-${i}`, label, checked: false })) },
];

export default function HospitalBag() {
  const { colors, gradient, shadow } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('prep_data').select('payload').eq('kind', 'hospital_bag').maybeSingle();
      if (data?.payload?.sections) setSections(mergeSaved(DEFAULT_SECTIONS, data.payload.sections));
      setLoading(false);
    })();
  }, []);

  function mergeSaved(defaults: Section[], saved: Section[]): Section[] {
    return defaults.map((def) => {
      const savedSec = saved.find((s) => s.title === def.title);
      if (!savedSec) return def;
      const items = def.items.map((it) => {
        const m = savedSec.items.find((x) => x.id === it.id);
        return m ? { ...it, checked: m.checked } : it;
      });
      const customs = savedSec.items.filter((x) => x.custom);
      return { ...def, items: [...items, ...customs] };
    });
  }

  const persist = useCallback(async (next: Section[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('prep_data').upsert(
      { user_id: user!.id, kind: 'hospital_bag', payload: { sections: next }, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,kind' }
    );
  }, []);

  function toggle(sectionTitle: string, itemId: string) {
    const next = sections.map((s) => s.title !== sectionTitle ? s : { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)) });
    setSections(next); persist(next);
  }
  function addCustom(sectionTitle: string) {
    if (!newLabel.trim()) { setAdding(null); return; }
    const next = sections.map((s) => s.title !== sectionTitle ? s : { ...s, items: [...s.items, { id: `custom-${Date.now()}`, label: newLabel.trim(), checked: false, custom: true }] });
    setSections(next); persist(next); setNewLabel(''); setAdding(null);
  }
  function removeCustom(sectionTitle: string, itemId: string) {
    const next = sections.map((s) => s.title !== sectionTitle ? s : { ...s, items: s.items.filter((it) => it.id !== itemId) });
    setSections(next); persist(next);
  }

  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const done = sections.reduce((n, s) => n + s.items.filter((i) => i.checked).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Hospital bag" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.progressCard, shadow.accent]}>
          <View style={styles.progressTop}>
            <Text style={styles.progressText}>{done} of {total} packed</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
        </LinearGradient>

        {loading && <Text style={styles.muted}>Loading…</Text>}
        {!loading && sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <View style={styles.sectionCard}>
              {s.items.map((it, i) => (
                <View key={it.id} style={[styles.row, i < s.items.length - 1 && styles.rowBorder]}>
                  <TouchableOpacity style={styles.rowMain} onPress={() => toggle(s.title, it.id)} activeOpacity={0.7}>
                    <View style={[styles.check, it.checked && styles.checkOn]}>
                      {it.checked && <Icon name="check" size={14} color={colors.onAccent} strokeWidth={3} />}
                    </View>
                    <Text style={[styles.rowLabel, it.checked && styles.rowLabelDone]}>{it.label}</Text>
                  </TouchableOpacity>
                  {it.custom && (
                    <TouchableOpacity onPress={() => removeCustom(s.title, it.id)} hitSlop={6}>
                      <Icon name="close" size={16} color={colors.faint} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {adding === s.title ? (
                <View style={styles.addRow}>
                  <TextInput style={styles.addInput} placeholder="Add an item…" placeholderTextColor={colors.faint} value={newLabel} onChangeText={setNewLabel} autoFocus onSubmitEditing={() => addCustom(s.title)} />
                  <TouchableOpacity onPress={() => addCustom(s.title)} hitSlop={6}><Icon name="check" size={20} color={colors.accent} strokeWidth={2.4} /></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBtn} onPress={() => { setAdding(s.title); setNewLabel(''); }}>
                  <Icon name="plus" size={16} color={colors.accent} strokeWidth={2.4} />
                  <Text style={styles.addText}>Add item</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  muted: { fontFamily: fonts.body5, color: c.muted, textAlign: 'center', marginTop: 16 },
  progressCard: { borderRadius: radius.tile, padding: 18 },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { fontFamily: fonts.display, fontSize: 15, color: c.onAccent },
  progressPct: { fontFamily: fonts.display, fontSize: 24, color: c.onAccent },
  track: { height: 8, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.28)', marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 100, backgroundColor: c.onAccent },
  section: { marginTop: 22 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 15, color: c.ink, marginBottom: 11 },
  sectionCard: { ...makeCardStyle(c), paddingHorizontal: 14, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: c.subtleBg },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: c.outline, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: c.accentFill, borderWidth: 0 },
  rowLabel: { flex: 1, fontFamily: fonts.body5, fontSize: 14, lineHeight: 18, color: c.ink },
  rowLabelDone: { color: c.faint, textDecorationLine: 'line-through' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  addInput: { flex: 1, fontFamily: fonts.body5, fontSize: 14, color: c.ink, paddingVertical: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 12 },
  addText: { fontFamily: fonts.body6, fontSize: 12, color: c.accentDeep },
});
