import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../lib/theme';
import { firstName } from '../lib/user';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

type Question = { id: string; question: string; options: string[] };

const QUESTIONS: Question[] = [
  { id: 'place', question: 'Where would you like to give birth?', options: ['Hospital', 'Birth centre', 'Home', 'Not sure yet'] },
  { id: 'support', question: 'Who do you want with you?', options: ['Partner', 'Family member', 'Doula', 'Partner + doula'] },
  { id: 'pain', question: 'Pain relief preferences?', options: ['Open to all options', 'Prefer natural / minimal', 'Want an epidural', 'Decide on the day'] },
  { id: 'environment', question: 'Birth environment?', options: ['Dim lights & quiet', 'Music playing', 'No strong preference'] },
  { id: 'monitoring', question: 'Monitoring preference?', options: ['Intermittent if possible', 'Continuous is fine', 'Follow medical advice'] },
  { id: 'feeding', question: 'Feeding plan after birth?', options: ['Breastfeed', 'Bottle feed', 'Combination', 'Decide later'] },
  { id: 'cord', question: 'Cord clamping?', options: ['Delayed clamping', 'Partner to cut cord', 'No preference'] },
];

export default function BirthPlan() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('prep_data').select('payload').eq('kind', 'birth_plan').maybeSingle();
      if (data?.payload) {
        setAnswers(data.payload.answers ?? {});
        setNotes(data.payload.notes ?? '');
        setSaved(true);
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (nextAnswers: Record<string, string>, nextNotes: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('prep_data').upsert(
      { user_id: user!.id, kind: 'birth_plan', payload: { answers: nextAnswers, notes: nextNotes }, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,kind' }
    );
    setSaved(true);
  }, []);

  function choose(qId: string, option: string) {
    const next = { ...answers, [qId]: option };
    setAnswers(next);
    persist(next, notes);
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const planName = firstName(user);
      const title = planName ? `${escapeHtml(planName)}'s Birth Plan` : 'My Birth Plan';
      const rows = QUESTIONS
        .filter((q) => answers[q.id])
        .map((q) => `<div class="row"><div class="q">${escapeHtml(q.question)}</div><div class="a">${escapeHtml(answers[q.id])}</div></div>`)
        .join('');
      const notesBlock = notes.trim()
        ? `<div class="notes"><div class="q">Anything else for the team</div><p>${escapeHtml(notes.trim())}</p></div>`
        : '';
      const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <style>
          * { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
          body { margin: 40px; color: #3A1626; }
          h1 { font-size: 32px; margin: 0 0 4px; color: #3A1626; }
          .sub { color: #9A8390; font-size: 15px; margin-bottom: 30px; }
          .row { border-bottom: 1px solid #F2E2E9; padding: 16px 0; }
          .q { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #B83E66; }
          .a { font-size: 19px; color: #3A1626; margin-top: 7px; }
          .notes { margin-top: 26px; }
          .notes p { font-size: 17px; line-height: 1.6; color: #3A1626; margin-top: 8px; }
          .foot { color: #9A8390; font-size: 13px; margin-top: 40px; }
        </style></head>
        <body>
          <h1>${title}</h1>
          <div class="sub">BumpJourney · ${today}</div>
          ${rows || '<div class="sub">No preferences selected yet.</div>'}
          ${notesBlock}
          <div class="foot">A guide for your care team, not a contract. Bring it to your appointments to discuss with your midwife or doctor.</div>
        </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share your birth plan', UTI: 'com.adobe.pdf' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert('Could not create PDF', 'Something went wrong generating your birth plan. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar
        title="Birth plan"
        right={saved ? (
          <View style={styles.savedPill}>
            <Icon name="check" size={13} color="#5E9E78" strokeWidth={2.6} />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        ) : <View style={{ width: 40 }} />}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={{ marginTop: 1 }}><Icon name="info" size={17} color={colors.accentDeep} /></View>
          <Text style={styles.introText}>
            A birth plan shares your preferences with your care team. It{"'"}s a guide, not a contract — your team
            will adapt with you.
          </Text>
        </View>

        {loading && <Text style={styles.muted}>Loading…</Text>}
        {!loading && QUESTIONS.map((q) => (
          <View key={q.id} style={styles.qBlock}>
            <Text style={styles.question}>{q.question}</Text>
            <View style={styles.options}>
              {q.options.map((opt) => {
                const on = answers[q.id] === opt;
                return (
                  <TouchableOpacity key={opt} style={[styles.option, on && styles.optionOn]} onPress={() => choose(q.id, opt)} activeOpacity={0.85}>
                    <Text style={[styles.optionText, on && styles.optionTextOn]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={[styles.question, { marginTop: 24 }]}>Anything else for your team?</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Other wishes, needs, or things to know…"
          placeholderTextColor={colors.faint}
          value={notes}
          onChangeText={setNotes}
          onBlur={() => persist(answers, notes)}
          multiline
          textAlignVertical="top"
        />

        <GradientButton
          label={downloading ? 'Preparing…' : 'Download as PDF'}
          onPress={downloadPdf}
          disabled={downloading}
          icon={<Icon name="download" size={18} color={colors.white} strokeWidth={2.2} />}
          style={{ marginTop: 22 }}
        />

        <Text style={styles.note}>Bring your birth plan to appointments to discuss it with your midwife or doctor.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  savedPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  savedText: { fontFamily: fonts.body5, fontSize: 12, color: '#5E9E78' },
  intro: { flexDirection: 'row', gap: 10, backgroundColor: colors.accentSoft, borderRadius: 18, padding: 14 },
  introText: { flex: 1, fontFamily: fonts.body5, fontSize: 12, lineHeight: 18, color: colors.accentDeep },
  muted: { fontFamily: fonts.body5, color: colors.muted, textAlign: 'center', marginTop: 16 },
  qBlock: { marginTop: 22 },
  question: { fontFamily: fonts.display, fontSize: 15, lineHeight: 20, color: colors.ink, marginBottom: 11 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  optionOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { fontFamily: fonts.body6, fontSize: 12, color: '#6E5560' },
  optionTextOn: { color: colors.white },
  notesInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 14, fontFamily: fonts.body5, fontSize: 14, lineHeight: 20, color: colors.ink, minHeight: 96 },
  note: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, textAlign: 'center', marginTop: 16, paddingHorizontal: 14 },
});
