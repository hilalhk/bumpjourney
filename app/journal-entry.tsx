import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import { MOODS } from '../lib/journalPrompts';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

export default function JournalEntry() {
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
    if (!body.trim()) { Alert.alert('Nothing to save yet', 'Write a little something first.'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = editing
      ? await supabase.from('journal_entries').update({ body: body.trim(), moods }).eq('id', params.id)
      : await supabase.from('journal_entries').insert({
          user_id: user!.id, week_number: params.week ? parseInt(params.week, 10) : null,
          prompt: params.prompt ?? null, body: body.trim(), moods,
        });
    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else router.back();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenGlow />
      <View style={styles.header}>
        <TouchableOpacity style={styles.circle} onPress={() => router.back()} activeOpacity={0.85}>
          <Icon name="close" size={20} color={colors.bodyGrey} strokeWidth={2.2} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  saveText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.accent, paddingHorizontal: 6 },
  promptCard: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.accentSoft, borderRadius: radius.tile, padding: 13, marginBottom: 14 },
  promptText: { flex: 1, fontFamily: fonts.body5, fontSize: 13, lineHeight: 18, color: colors.accentDeep },
  input: { fontFamily: fonts.body5, fontSize: 15, lineHeight: 24, color: colors.ink, minHeight: 180 },
  moodLabel: { fontFamily: fonts.display, fontSize: 15, color: colors.ink, marginTop: 8, marginBottom: 13 },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mood: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  moodOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  moodText: { fontFamily: fonts.body6, fontSize: 12, color: '#6E5560' },
  moodTextOn: { color: colors.white },
});
