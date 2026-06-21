import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient, radius } from '../lib/theme';

type Sex = 'girl' | 'boy' | 'surprise';

const OPTIONS: { key: Sex; label: string; icon: IconName }[] = [
  { key: 'girl', label: 'Girl', icon: 'gender-girl' },
  { key: 'boy', label: 'Boy', icon: 'gender-boy' },
  { key: 'surprise', label: 'Team surprise', icon: 'gift' },
];

export default function EditBabySex() {
  const router = useRouter();
  const [sex, setSex] = useState<Sex | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('prep_data').select('payload').eq('kind', 'pregnancy_details').maybeSingle();
      if (data?.payload?.sex) setSex(data.payload.sex);
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: existing } = await supabase.from('prep_data').select('payload').eq('kind', 'pregnancy_details').maybeSingle();
    const payload = { ...(existing?.payload ?? {}), sex };
    const { error } = await supabase.from('prep_data').upsert(
      { user_id: user!.id, kind: 'pregnancy_details', payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,kind' }
    );
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    router.back();
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Baby's sex" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>If you{"'"}ve found out (or are keeping it a surprise), set it here. You can change it anytime.</Text>

        {loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : (
          OPTIONS.map((o) => {
            const on = sex === o.key;
            return (
              <TouchableOpacity key={o.key} style={[styles.option, on && styles.optionOn]} onPress={() => setSex(o.key)} activeOpacity={0.85}>
                {on ? (
                  <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.optionIcon}>
                    <Icon name={o.icon} size={20} color={colors.white} />
                  </LinearGradient>
                ) : (
                  <View style={[styles.optionIcon, styles.optionIconOff]}>
                    <Icon name={o.icon} size={20} color={colors.accent} />
                  </View>
                )}
                <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{o.label}</Text>
                {on && <Icon name="check" size={20} color={colors.accent} strokeWidth={2.6} />}
              </TouchableOpacity>
            );
          })
        )}

        <GradientButton label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={saving || loading} style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  intro: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 19, color: colors.muted, marginBottom: 16 },
  muted: { fontFamily: fonts.body5, color: colors.muted },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.tile, padding: 14, marginBottom: 10 },
  optionOn: { borderWidth: 2, borderColor: colors.accent },
  optionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  optionIconOff: { backgroundColor: colors.accentSoft },
  optionLabel: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  optionLabelOn: { color: colors.accentDeep },
});
