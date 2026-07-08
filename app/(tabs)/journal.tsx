import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { makeCardStyle } from '../../components/Card';
import { useConfirm } from '../../components/ConfirmDialog';
import { Icon } from '../../components/Icons';
import ScreenGlow from '../../components/ScreenGlow';
import TabHeader from '../../components/TabHeader';
import { usePregnancy, weekSubtitle } from '../../hooks/usePregnancy';
import { getPrompts } from '../../lib/journalPrompts';
import { progressFor } from '../../lib/pregnancy';
import { supabase } from '../../lib/supabase';
import { useTheme, useThemedStyles } from '../../lib/ThemeContext';
import { Colors, fonts, radius } from '../../lib/theme';

type Entry = {
  id: string;
  entry_date: string;
  week_number: number | null;
  prompt: string | null;
  body: string;
  moods: string[];
};

export default function Journal() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const confirm = useConfirm();
  const info = usePregnancy();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [week, setWeek] = useState<number>(4);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: preg } = await supabase
      .from('pregnancies').select('due_date').eq('is_active', true)
      .order('created_at', { ascending: false }).limit(1);
    if (preg && preg.length > 0) {
      const due = new Date(preg[0].due_date + 'T00:00:00');
      setWeek(Math.max(4, progressFor(due).week));
    }
    const { data } = await supabase
      .from('journal_entries')
      .select('id, entry_date, week_number, prompt, body, moods')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });
    setEntries(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function confirmDelete(entry: Entry) {
    const ok = await confirm({
      tone: 'danger', icon: 'trash', title: 'Delete entry',
      message: 'Remove this journal entry? This cannot be undone.', confirmLabel: 'Delete',
    });
    if (!ok) return;
    await supabase.from('journal_entries').delete().eq('id', entry.id);
    load();
  }

  const prompts = getPrompts(week);

  const header = (
    <>
      <TabHeader subtitle={weekSubtitle(info)} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Journal</Text>
        <TouchableOpacity style={styles.photosBtn} onPress={() => router.push('/photos')} activeOpacity={0.85}>
          <Icon name="images" size={15} color={colors.accent} />
          <Text style={styles.photosBtnText}>Photos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Prompts for week {week}</Text>
      {prompts.map((p) => (
        <TouchableOpacity
          key={p}
          style={styles.promptCard}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/journal-entry', params: { prompt: p, week: String(week) } })}
        >
          <Icon name="star" size={17} color={colors.accent} />
          <Text style={styles.promptText}>{p}</Text>
          <Icon name="chevron-right" size={16} color={colors.accent} strokeWidth={2.2} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.blankBtn}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/journal-entry', params: { week: String(week) } })}
      >
        <Icon name="plus" size={18} color={colors.accentDeep} strokeWidth={2.4} />
        <Text style={styles.blankText}>Write your own</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Your entries</Text>
      {loading && <Text style={styles.empty}>Loading…</Text>}
      {!loading && entries.length === 0 && (
        <Text style={styles.empty}>No entries yet — tap a prompt above to start.</Text>
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <ScreenGlow />
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item: e }) => (
          <TouchableOpacity
            style={styles.entryCard}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/journal-entry', params: { id: e.id } })}
          >
            <View style={styles.entryHead}>
              {e.week_number != null && (
                <View style={styles.weekPill}><Text style={styles.weekPillText}>Week {e.week_number}</Text></View>
              )}
              <Text style={styles.entryDate}>
                {new Date(e.entry_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => confirmDelete(e)} hitSlop={8}>
                <Icon name="trash" size={15} color={colors.faint} />
              </TouchableOpacity>
            </View>
            {e.prompt ? <Text style={styles.entryPrompt}>{e.prompt}</Text> : null}
            <Text style={styles.entryBody} numberOfLines={3}>{e.body}</Text>
            {e.moods && e.moods.length > 0 && (
              <View style={styles.moodRow}>
                {e.moods.map((m) => (
                  <View key={m} style={styles.moodTag}><Text style={styles.moodTagText}>{m}</Text></View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.canvas },
  scroll: { padding: 20, paddingTop: 14, paddingBottom: 140 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 },
  title: { fontFamily: fonts.display, fontSize: 30, color: c.ink },
  photosBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder,
    borderRadius: 100, paddingVertical: 9, paddingHorizontal: 14,
  },
  photosBtnText: { fontFamily: fonts.body6, fontSize: 12, color: c.accentDeep },

  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: c.muted, marginTop: 24, marginBottom: 12, marginHorizontal: 2 },
  promptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: c.accentSoft, borderRadius: radius.tile, padding: 15, marginBottom: 9,
  },
  promptText: { flex: 1, fontFamily: fonts.body5, fontSize: 14, lineHeight: 19, color: c.accentDeep },
  blankBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderWidth: 1.5, borderColor: c.outline, borderStyle: 'dashed', borderRadius: radius.tile, padding: 14, marginTop: 3,
  },
  blankText: { fontFamily: fonts.displaySemi, fontSize: 13, color: c.accentDeep },
  empty: { fontFamily: fonts.body5, fontSize: 14, color: c.muted, marginTop: 4 },

  entryCard: { ...makeCardStyle(c), padding: 15, marginBottom: 10 },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  weekPill: { backgroundColor: c.accentFill, borderRadius: 100, paddingVertical: 4, paddingHorizontal: 10 },
  weekPillText: { fontFamily: fonts.body6, fontSize: 10, color: c.onAccent },
  entryDate: { fontFamily: fonts.body5, fontSize: 11, color: c.muted },
  entryPrompt: { fontFamily: fonts.display, fontSize: 13, lineHeight: 18, color: c.ink, marginTop: 10 },
  entryBody: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: c.subtleText, marginTop: 6 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  moodTag: { backgroundColor: c.subtleBg, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 10 },
  moodTagText: { fontFamily: fonts.body5, fontSize: 10, color: c.subtleText },
});
