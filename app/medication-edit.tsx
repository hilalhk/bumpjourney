import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { dayKey, displayTime } from '../lib/dates';
import { showAlert, useConfirm } from '../components/ConfirmDialog';
import DateTimeModal from '../components/DateTimeModal';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { cancelMedReminders, scheduleMedReminders } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

type Freq = 'daily' | 'twice' | 'custom';

const PRESETS = ['Prenatal vitamin', 'Iron', 'Calcium', 'Vitamin D'];

function fmtTime(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export default function MedicationEdit() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const confirm = useConfirm();
  const params = useLocalSearchParams<{ id?: string }>();
  const editing = !!params.id;

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Freq>('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [oldNotifyIds, setOldNotifyIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [showDate, setShowDate] = useState(false);
  const [timePickerIndex, setTimePickerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const { data } = await supabase.from('medications').select('*').eq('id', params.id).maybeSingle();
      if (data) {
        setName(data.name);
        setDosage(data.dosage ?? '');
        setFrequency(data.frequency);
        setTimes(data.times?.length ? data.times : ['08:00']);
        setStartDate(new Date(data.start_date + 'T00:00:00'));
        setNotes(data.notes ?? '');
        setOldNotifyIds(data.notify_ids ?? []);
      }
    })();
  }, [editing, params.id]);

  // Keep the times array length in sync with frequency
  function changeFrequency(f: Freq) {
    setFrequency(f);
    if (f === 'daily') setTimes((t) => [t[0] ?? '08:00']);
    else if (f === 'twice') setTimes((t) => [t[0] ?? '08:00', t[1] ?? '20:00']);
    // custom: leave as-is, user manages via add/remove
  }

  function setTimeAt(i: number, d: Date) {
    setTimes((prev) => prev.map((t, idx) => (idx === i ? fmtTime(d) : t)));
  }
  function addTime() { setTimes((prev) => [...prev, '12:00']); }
  function removeTime(i: number) { setTimes((prev) => prev.filter((_, idx) => idx !== i)); }

  async function save() {
    if (!name.trim()) { showAlert({ title: 'Add a name', message: 'What medication or supplement is this?', tone: 'info' }); return; }
    if (times.length === 0) { showAlert({ title: 'Add a time', message: 'Set at least one reminder time.', tone: 'info' }); return; }
    setSaving(true);

    // Cancel any existing reminders (editing) before scheduling fresh ones
    await cancelMedReminders(oldNotifyIds);
    const notifyIds = await scheduleMedReminders(name.trim(), times);

    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      user_id: user!.id,
      name: name.trim(),
      dosage: dosage.trim() || null,
      frequency,
      times,
      start_date: dayKey(startDate),
      notes: notes.trim() || null,
      notify_ids: notifyIds,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from('medications').update(payload).eq('id', params.id));
    } else {
      ({ error } = await supabase.from('medications').insert(payload));
    }
    setSaving(false);
    if (error) { showAlert({ title: 'Error', message: error.message, tone: 'error' }); return; }
    router.back();
  }

  async function confirmRemove() {
    const ok = await confirm({
      tone: 'danger', icon: 'trash', title: 'Remove medication',
      message: `Remove "${name || 'this medication'}"? This also removes its history.`,
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    await cancelMedReminders(oldNotifyIds);
    await supabase.from('medications').delete().eq('id', params.id);
    router.back();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenGlow />
      <TopBar
        title={editing ? 'Edit medication' : 'Add medication'}
        right={<TouchableOpacity onPress={save} disabled={saving} hitSlop={8}><Text style={styles.saveTop}>{saving ? '…' : 'Save'}</Text></TouchableOpacity>}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Prenatal vitamin"
          placeholderTextColor={colors.faint}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.chips}>
          {PRESETS.map((p) => (
            <TouchableOpacity key={p} style={styles.chip} onPress={() => setName(p)}>
              <Text style={styles.chipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Dosage</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1 tablet"
          placeholderTextColor={colors.faint}
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.freqRow}>
          {([['daily', 'Daily'], ['twice', 'Twice daily'], ['custom', 'Custom']] as [Freq, string][]).map(([f, lbl]) => (
            <TouchableOpacity
              key={f}
              style={[styles.freqBtn, frequency === f && styles.freqOn]}
              onPress={() => changeFrequency(f)}
            >
              <Text style={[styles.freqText, frequency === f && styles.freqTextOn]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Time{times.length > 1 ? 's' : ''}</Text>
        {times.map((t, i) => (
          <View key={i} style={styles.timeRow}>
            <TouchableOpacity style={styles.timeBtn} onPress={() => setTimePickerIndex(i)}>
              <Icon name="clock" size={16} color={colors.accent} />
              <Text style={styles.timeText}>{displayTime(t)}</Text>
            </TouchableOpacity>
            {frequency === 'custom' && times.length > 1 && (
              <TouchableOpacity onPress={() => removeTime(i)} style={styles.removeTime}>
                <Icon name="x-circle" size={20} color={colors.faint} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {frequency === 'custom' && (
          <TouchableOpacity style={styles.addTime} onPress={addTime}>
            <Icon name="plus" size={16} color={colors.accent} strokeWidth={2.4} />
            <Text style={styles.addTimeText}>Add another time</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Start date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          placeholder="e.g. Take after breakfast"
          placeholderTextColor={colors.faint}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.note}>
          For tracking only. Always follow the dose and schedule your healthcare provider gives you.
        </Text>

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save medication'}</Text>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity style={styles.removeBtn} onPress={confirmRemove}>
            <Text style={styles.removeText}>Remove medication</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <DateTimeModal
        visible={showDate}
        value={startDate}
        mode="date"
        onConfirm={(sel) => { setShowDate(false); setStartDate(sel); }}
        onCancel={() => setShowDate(false)}
      />
      <DateTimeModal
        visible={timePickerIndex !== null}
        value={timePickerIndex !== null ? parseTime(times[timePickerIndex]) : new Date()}
        mode="time"
        onConfirm={(sel) => {
          const i = timePickerIndex;
          setTimePickerIndex(null);
          if (i !== null) setTimeAt(i, sel);
        }}
        onCancel={() => setTimePickerIndex(null)}
      />
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  saveTop: { fontSize: 15, fontFamily: fonts.displaySemi, color: c.accent, paddingHorizontal: 6 },
  label: { fontSize: 13, fontFamily: fonts.displaySemi, color: c.ink, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.tile, padding: 13,
    fontSize: 15, color: c.ink, fontFamily: fonts.body4,
  },
  dateText: { fontSize: 15, color: c.ink, fontFamily: fonts.body4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 16, backgroundColor: c.accentSoft },
  chipText: { fontSize: 12, color: c.accentDeep, fontFamily: fonts.body4 },
  freqRow: { flexDirection: 'row', gap: 8 },
  freqBtn: {
    flex: 1, paddingVertical: 11, borderRadius: radius.tile, alignItems: 'center',
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder,
  },
  freqOn: { backgroundColor: c.accentSoft, borderColor: c.accent },
  freqText: { fontSize: 12, color: c.subtleText, fontFamily: fonts.body4 },
  freqTextOn: { color: c.accentDeep, fontFamily: fonts.displaySemi },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  timeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.tile, padding: 13,
  },
  timeText: { fontSize: 15, color: c.ink, fontFamily: fonts.body4 },
  removeTime: { padding: 4 },
  addTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  addTimeText: { fontSize: 13, color: c.accent, fontFamily: fonts.body5 },
  note: { fontSize: 11, color: c.faint, marginTop: 16, lineHeight: 16, fontFamily: fonts.body4 },
  saveBtn: { backgroundColor: c.accentFill, borderRadius: radius.button, padding: 16, alignItems: 'center', marginTop: 16 },
  saveText: { color: c.onAccent, fontSize: 16, fontFamily: fonts.displaySemi },
  removeBtn: { padding: 16, alignItems: 'center', marginTop: 4 },
  removeText: { color: c.danger, fontSize: 14, fontFamily: fonts.displaySemi },
});