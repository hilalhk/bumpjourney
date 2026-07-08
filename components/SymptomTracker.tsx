import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { todayStr } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { quickSymptoms, SYMPTOM_LOOKUP, SymptomData } from '../lib/symptoms';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts } from '../lib/theme';
import { makeCardStyle } from './Card';
import GradientButton from './GradientButton';
import { Icon, PencilIcon } from './Icons';

type Props = { date?: string; readOnly?: boolean };

export default function SymptomTracker({ date, readOnly = false }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const logDate = date ?? todayStr();
  const [data, setData] = useState<SymptomData>({});

  const load = useCallback(async () => {
    const { data: row } = await supabase
      .from('symptom_logs')
      .select('symptom_data, symptoms')
      .eq('log_date', logDate)
      .maybeSingle();
    if (row?.symptom_data && Object.keys(row.symptom_data).length > 0) {
      setData(row.symptom_data);
    } else if (row?.symptoms && row.symptoms.length > 0) {
      const migrated: SymptomData = {};
      Object.entries(SYMPTOM_LOOKUP).forEach(([id, info]) => {
        if (row.symptoms.includes(info.label)) migrated[id] = 'moderate';
      });
      setData(migrated);
    } else {
      setData({});
    }
  }, [logDate]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const quick = quickSymptoms();
  const loggedCount = Object.keys(data).length;
  const loggedLabels = Object.keys(data).map((id) => SYMPTOM_LOOKUP[id]?.label).filter(Boolean);

  if (readOnly) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Symptoms logged</Text>
        {loggedCount === 0 ? (
          <Text style={styles.empty}>No symptoms logged this day.</Text>
        ) : (
          <View style={styles.chips}>
            {loggedLabels.map((label) => (
              <View key={label} style={[styles.chip, styles.chipOn]}>
                <Text style={[styles.chipText, styles.chipTextOn]}>{label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  function openFull() { router.push('/symptoms'); }

  async function quickToggle(id: string) {
    const next = { ...data };
    if (next[id]) delete next[id];
    else next[id] = 'moderate';
    setData(next);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('symptom_logs').upsert(
      { user_id: user!.id, log_date: logDate, symptom_data: next, symptoms: Object.keys(next).map((x) => SYMPTOM_LOOKUP[x]?.label).filter(Boolean) },
      { onConflict: 'user_id,log_date' }
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Any symptoms today?</Text>

      <View style={styles.chips}>
        {quick.map((s) => {
          const on = !!data[s.id];
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => quickToggle(s.id)}
              activeOpacity={0.8}
            >
              {on && <Icon name="check" size={13} color={colors.onAccent} strokeWidth={2.4} />}
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <GradientButton
        label="Log symptoms"
        onPress={openFull}
        icon={<PencilIcon size={16} color={colors.onAccent} />}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  card: { ...makeCardStyle(c), padding: 16, marginTop: 12 },
  title: { fontFamily: fonts.display, fontSize: 16, color: c.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.chipBg, borderWidth: 1, borderColor: c.cardBorder,
    borderRadius: 100, paddingVertical: 9, paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: c.accentFill, borderColor: c.accentFill },
  check: { color: c.onAccent, fontSize: 12, fontFamily: fonts.body7 },
  chipText: { fontFamily: fonts.body6, fontSize: 12, color: c.subtleText },
  chipTextOn: { color: c.onAccent },
  empty: { fontSize: 13, color: c.muted, fontFamily: fonts.body5, marginTop: 10 },
});
