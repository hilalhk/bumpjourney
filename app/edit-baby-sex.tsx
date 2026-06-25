import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { showAlert } from '../components/ConfirmDialog';
import GradientButton from '../components/GradientButton';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { Baby, BabySex, babiesPayload, readBabies, resizeBabies } from '../lib/babies';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

const SEX_OPTIONS: { key: BabySex; label: string; icon: IconName }[] = [
  { key: 'girl', label: 'Girl', icon: 'gender-girl' },
  { key: 'boy', label: 'Boy', icon: 'gender-boy' },
  { key: 'surprise', label: 'Surprise', icon: 'gift' },
];

const COUNT_OPTIONS = [1, 2, 3, 4];
const COUNT_CHIP: Record<number, string> = { 1: 'Just one', 2: 'Twins', 3: 'Triplets', 4: 'Quads' };

export default function EditBabies() {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [babies, setBabies] = useState<Baby[]>([{ sex: null, name: '' }]);
  const [existing, setExisting] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('prep_data').select('payload').eq('kind', 'pregnancy_details').maybeSingle();
      const info = readBabies(data?.payload);
      setCount(info.count);
      setBabies(info.babies);
      setExisting(data?.payload ?? {});
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
              <View key={i} style={styles.babyCard}>
                {count > 1 && <Text style={styles.babyHead}>Baby {i + 1}</Text>}
                <View style={styles.sexRow}>
                  {SEX_OPTIONS.map((o) => {
                    const on = baby.sex === o.key;
                    return (
                      <TouchableOpacity key={o.key} style={[styles.sexPill, on && styles.sexPillOn]} onPress={() => setSex(i, o.key)} activeOpacity={0.85}>
                        <Icon name={o.icon} size={17} color={on ? colors.white : colors.accent} />
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
                  autoCapitalize="words"
                />
              </View>
            ))}

            <GradientButton label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={saving || loading} style={{ marginTop: 16 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  intro: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 19, color: colors.muted, marginBottom: 20 },
  muted: { fontFamily: fonts.body5, color: colors.muted },
  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted, marginBottom: 12 },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  countChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  countChipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  countChipText: { fontFamily: fonts.body6, fontSize: 13, color: '#6E5560' },
  countChipTextOn: { color: colors.white },
  babyCard: { ...cardStyle, padding: 14, marginBottom: 12 },
  babyHead: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.accentDeep, marginBottom: 12 },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radius.tile, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  sexPillOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  sexText: { fontFamily: fonts.body6, fontSize: 13, color: colors.ink },
  sexTextOn: { color: colors.white },
  nameInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 13, marginTop: 10, fontFamily: fonts.body5, fontSize: 14, color: colors.ink },
});
