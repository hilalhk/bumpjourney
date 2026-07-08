import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../components/ConfirmDialog';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import { MOODS } from '../lib/journalPrompts';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

export default function JournalEntry() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; prompt?: string; week?: string }>();
  const editing = !!params.id;
  const [body, setBody] = useState('');
  const [moods, setMoods] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string | null>(params.prompt ?? null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      const { data } = await supabase.from('journal_entries').select('body, moods, prompt').eq('id', params.id).maybeSingle();
      if (data) { setBody(data.body ?? ''); setMoods(data.moods ?? []); setPrompt(data.prompt ?? null); }
      setLoading(false);
    })();
  }, [params.id]);

  function toggleMood(m: string) {
    setMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function save() {
    if (!body.trim()) { showAlert({ title: 'Nothing to save yet', message: 'Write a little something first.', tone: 'info' }); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = editing
      ? await supabase.from('journal_entries').update({ body: body.trim(), moods }).eq('id', params.id)
      : await supabase.from('journal_entries').insert({
          user_id: user!.id, week_number: params.week ? parseInt(params.week, 10) : null,
          prompt: params.prompt ?? null, body: body.trim(), moods,
        });
    setSaving(false);
    if (error) showAlert({ title: 'Error', message: error.message, tone: 'error' });
    else router.back();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenGlow />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.circle} onPress={() => router.back()} activeOpacity={0.85}>
          <Icon name="close" size={20} color={colors.body} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Edit entry' : 'New entry'}</Text>
        <TouchableOpacity onPress={save} disabled={saving || loading} hitSlop={8}>
          <Text style={styles.saveText}>{saving ? '…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {prompt ? (
          <View style={styles.promptCard}>
            <Icon name="star" size={16} color={colors.accent} />
            <Text style={styles.promptText}>{prompt}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Write what's on your mind…"
          placeholderTextColor={colors.faint}
          multiline
          autoFocus={!editing}
          value={body}
          onChangeText={setBody}
          textAlignVertical="top"
        />

        <Text style={styles.moodLabel}>How are you feeling?</Text>
        <View style={styles.moods}>
          {MOODS.map((m) => {
            const on = moods.includes(m);
            return (
              <TouchableOpacity key={m} style={[styles.mood, on && styles.moodOn]} onPress={() => toggleMood(m)} activeOpacity={0.85}>
                <Text style={[styles.moodText, on && styles.moodTextOn]}>{m}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fonts.display, fontSize: 19, color: c.ink },
  saveText: { fontFamily: fonts.displaySemi, fontSize: 14, color: c.accent, paddingHorizontal: 6 },
  promptCard: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: c.accentSoft, borderRadius: radius.tile, padding: 13, marginBottom: 14 },
  promptText: { flex: 1, fontFamily: fonts.body5, fontSize: 13, lineHeight: 18, color: c.accentDeep },
  input: { fontFamily: fonts.body5, fontSize: 15, lineHeight: 24, color: c.ink, minHeight: 180 },
  moodLabel: { fontFamily: fonts.display, fontSize: 15, color: c.ink, marginTop: 8, marginBottom: 13 },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mood: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 100, backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder },
  moodOn: { backgroundColor: c.accentFill, borderColor: c.accentFill },
  moodText: { fontFamily: fonts.body6, fontSize: 12, color: c.subtleText },
  moodTextOn: { color: c.onAccent },
});
