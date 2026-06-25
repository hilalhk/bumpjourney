import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showAlert } from '../components/ConfirmDialog';
import DateTimeModal from '../components/DateTimeModal';
import GradientButton from '../components/GradientButton';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { dayKey } from '../lib/dates';
import { DueMethod, dueDateFromDate, dueDateFromTerm, FULL_TERM_DAYS } from '../lib/pregnancy';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

const METHOD_TABS: { key: DueMethod; label: string }[] = [
  { key: 'due', label: 'Due date' },
  { key: 'lmp', label: 'Last period' },
  { key: 'conception', label: 'Conception' },
  { key: 'term', label: 'Weeks along' },
];

const DATE_LABEL: Record<string, string> = {
  due: 'Your due date',
  lmp: 'First day of your last period',
  conception: 'Date of conception',
};

function weekFromDue(due: Date) {
  const daysToGo = Math.round((due.getTime() - Date.now()) / 86400000);
  return Math.max(0, Math.floor((FULL_TERM_DAYS - daysToGo) / 7));
}

export default function EditDueDate() {
  const router = useRouter();
  const [pregnancyId, setPregnancyId] = useState<string | null>(null);
  const [currentDue, setCurrentDue] = useState<Date | null>(null);
  const [method, setMethod] = useState<DueMethod>('due');
  const [date, setDate] = useState(new Date());
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('pregnancies').select('id, due_date').eq('is_active', true).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        setPregnancyId(data[0].id);
        const due = new Date(data[0].due_date + 'T00:00:00');
        setCurrentDue(due); setDate(due);
      }
      setLoading(false);
    })();
  }, []);

  const newDue = method === 'term'
    ? dueDateFromTerm(parseInt(weeks, 10) || 0, parseInt(days, 10) || 0)
    : dueDateFromDate(method, date);
  const currentWeek = currentDue ? weekFromDue(currentDue) : null;
  const newWeek = weekFromDue(newDue);
  const weekChanges = currentWeek !== null && currentWeek !== newWeek;

  async function save() {
    if (!pregnancyId) { router.back(); return; }
    setSaving(true);
    const { error } = await supabase.from('pregnancies').update({ due_date: dayKey(newDue) }).eq('id', pregnancyId);
    setSaving(false);
    if (error) { showAlert({ title: 'Error', message: error.message, tone: 'error' }); return; }
    router.back();
  }

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.muted}>Loading…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Edit due date" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>A dating scan or doctor{"'"}s confirmation can change your due date. Update it here and your week-by-week journey will adjust.</Text>

        <Text style={styles.label}>How would you like to set it?</Text>
        <View style={styles.methodRow}>
          {METHOD_TABS.map((m) => (
            <TouchableOpacity key={m.key} style={[styles.methodBtn, method === m.key && styles.methodOn]} onPress={() => setMethod(m.key)}>
              <Text style={[styles.methodText, method === m.key && styles.methodTextOn]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {method === 'term' ? (
          <>
            <Text style={styles.label}>How far along are you?</Text>
            <View style={styles.termRow}>
              <View style={styles.termField}>
                <TextInput style={styles.termInput} value={weeks} onChangeText={(t) => setWeeks(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.faint} maxLength={2} />
                <Text style={styles.termUnit}>weeks</Text>
              </View>
              <View style={styles.termField}>
                <TextInput style={styles.termInput} value={days} onChangeText={(t) => setDays(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.faint} maxLength={1} />
                <Text style={styles.termUnit}>days</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>{DATE_LABEL[method]}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
              <Icon name="calendar" size={18} color={colors.accent} />
              <Text style={styles.dateText}>{date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </TouchableOpacity>
            <DateTimeModal visible={showPicker} value={date} mode="date" onConfirm={(selected) => { setShowPicker(false); setDate(selected); }} onCancel={() => setShowPicker(false)} />
          </>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>New due date</Text>
          <Text style={styles.previewDate}>{newDue.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
          {weekChanges ? (
            <Text style={styles.previewChange}>This moves you from Week {currentWeek} to Week {newWeek}.</Text>
          ) : (
            <Text style={styles.previewChange}>You{"'"}re currently in Week {newWeek}.</Text>
          )}
        </View>

        <GradientButton label={saving ? 'Saving…' : 'Save due date'} onPress={save} disabled={saving} style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  muted: { fontFamily: fonts.body5, color: colors.muted },
  intro: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 19, color: colors.muted, marginBottom: 20 },
  label: { fontFamily: fonts.display, fontSize: 15, color: colors.ink, marginBottom: 10, marginTop: 6 },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  methodBtn: { flexGrow: 1, flexBasis: '46%', paddingVertical: 12, borderRadius: radius.tile, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  methodOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  methodText: { fontFamily: fonts.body6, fontSize: 13, color: '#6E5560' },
  methodTextOn: { color: colors.accentDeep },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.tile, padding: 16 },
  dateText: { fontFamily: fonts.body5, fontSize: 15, color: colors.ink },
  termRow: { flexDirection: 'row', gap: 12 },
  termField: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.tile, paddingHorizontal: 16, paddingVertical: 12 },
  termInput: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, minWidth: 36 },
  termUnit: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted },
  previewCard: { backgroundColor: colors.accentSoft, borderRadius: radius.card, padding: 16, marginTop: 20 },
  previewLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.accentDeep },
  previewDate: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, marginTop: 4 },
  previewChange: { fontFamily: fonts.body5, fontSize: 13, color: colors.accentDeep, marginTop: 8 },
});
