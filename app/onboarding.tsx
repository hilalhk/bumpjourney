import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { showAlert } from '../components/ConfirmDialog';
import DateTimeModal from '../components/DateTimeModal';
import GradientButton from '../components/GradientButton';
import { Icon, IconName } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import StackHeader from '../components/StackHeader';
import { babiesPayload, countLabel } from '../lib/babies';
import { dayKey } from '../lib/dates';
import { DUE_METHODS, DueMethod, dueDateFromDate, dueDateFromTerm } from '../lib/pregnancy';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient, radius } from '../lib/theme';
import { firstName } from '../lib/user';

const DATE_LABEL: Record<string, string> = {
  due: 'Your due date',
  lmp: 'First day of your last period',
  conception: 'Date of conception',
};

const METHOD_ICON: Record<DueMethod, IconName> = { due: 'calendar', lmp: 'water', conception: 'heart', term: 'clock' };

function Dots({ step }: { step: number }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.dot, i === step ? styles.dotOn : i < step ? styles.dotDone : undefined]} />
      ))}
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<'method' | 'date' | 'babies' | 'done'>('method');
  const [method, setMethod] = useState<DueMethod>('due');
  const [babyChoice, setBabyChoice] = useState<number | 'unsure'>(1);
  const [date, setDate] = useState(new Date());
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  function computeDue(): Date {
    return method === 'term'
      ? dueDateFromTerm(parseInt(weeks, 10) || 0, parseInt(days, 10) || 0)
      : dueDateFromDate(method as Exclude<DueMethod, 'term'>, date);
  }

  const previewDue = computeDue();
  const daysToGo = Math.max(0, Math.round((previewDue.getTime() - Date.now()) / 86400000));
  const weeksAlong = Math.max(0, Math.floor((280 - daysToGo) / 7));
  const trimester = weeksAlong <= 13 ? 1 : weeksAlong <= 27 ? 2 : 3;

  async function save() {
    setSaving(true);
    const dueDate = computeDue();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setName(firstName(user));
    const { error } = await supabase.from('pregnancies').insert({
      user_id: user!.id, due_date: dayKey(dueDate), is_active: true,
    });
    if (error) { setSaving(false); showAlert({ title: 'Error', message: error.message, tone: 'error' }); return; }
    // Save how many babies; per-baby gender/name can be set later in Settings.
    // "Not sure yet" defaults to one baby — they can change it in Settings.
    const count = babyChoice === 'unsure' ? 1 : babyChoice;
    const payload = babiesPayload({ count, babies: Array.from({ length: count }, () => ({ sex: null, name: '' })) });
    await supabase.from('prep_data').upsert(
      { user_id: user!.id, kind: 'pregnancy_details', payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,kind' }
    );
    setSaving(false);
    setStep('done');
  }

  // ── Step 3: all set ──
  if (step === 'done') {
    return (
      <View style={styles.root}>
        <ScreenGlow intensity={0.24} />
        <View style={styles.doneWrap}>
          <Dots step={3} />
          <View style={styles.doneCenter}>
            <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.celebrate}>
              <Icon name="check" size={56} color={colors.white} strokeWidth={2.4} />
            </LinearGradient>
            <Text style={styles.doneTitle}>{name ? `You're all set, ${name}` : "You're all set"}</Text>
            <Text style={styles.doneSub}>
              Your journey is personalized to week {weeksAlong}. We{"'"}ll guide you with weekly updates, gentle
              reminders, and tools for every step.
            </Text>
            <View style={styles.chipRow}>
              <SummaryChip v={String(weeksAlong)} k="Weeks" />
              <SummaryChip v={String(daysToGo)} k="Days to go" />
              <SummaryChip v={`T${trimester}`} k="Trimester" />
            </View>
          </View>
          <GradientButton label="Enter BumpJourney" onPress={() => router.replace('/')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenGlow intensity={0.18} />
      {(step === 'date' || step === 'babies') && <StackHeader onBack={() => setStep(step === 'babies' ? 'date' : 'method')} style={styles.header} />}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Dots step={step === 'method' ? 0 : step === 'date' ? 1 : 2} />

        {step === 'method' && (
          <>
            <Text style={styles.title}>{"Let's get started"}</Text>
            <Text style={styles.subtitle}>
              To personalize your week-by-week journey, tell us how you{"'"}d like to set your due date.
            </Text>
            <View style={styles.choices}>
              {DUE_METHODS.map((m) => {
                const on = method === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.choice, on && styles.choiceOn]}
                    onPress={() => setMethod(m.key)}
                    activeOpacity={0.85}
                  >
                    {on ? (
                      <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.choiceIcon}>
                        <Icon name={METHOD_ICON[m.key]} size={22} color={colors.white} />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.choiceIcon, styles.choiceIconOff]}>
                        <Icon name={METHOD_ICON[m.key]} size={22} color={colors.accent} />
                      </View>
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.choiceTitle}>{m.title}</Text>
                      <Text style={styles.choiceSub}>{m.sub}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]}>
                      {on && <Icon name="check" size={13} color={colors.white} strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <GradientButton label="Continue" onPress={() => setStep('date')} style={{ marginTop: 24 }} />
          </>
        )}

        {step === 'date' && (
          <>
            <Text style={styles.title}>Your due date</Text>
            <Text style={styles.subtitle}>When is your baby expected? You can always adjust this later.</Text>

            {method !== 'term' && (
              <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dueDisplay}>
                <Text style={styles.dueDisplayLabel}>Estimated due date</Text>
                <Text style={styles.dueDisplayDate}>
                  {previewDue.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={styles.dueDisplayMeta}>{`That's about ${weeksAlong} weeks along · Trimester ${trimester}`}</Text>
              </LinearGradient>
            )}

            {method === 'term' ? (
              <>
                <Text style={styles.fieldLabel}>How far along are you?</Text>
                <View style={styles.termRow}>
                  <View style={styles.termField}>
                    <TextInput
                      style={styles.termInput}
                      value={weeks}
                      onChangeText={(t) => setWeeks(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.faint} maxLength={2}
                    />
                    <Text style={styles.termUnit}>weeks</Text>
                  </View>
                  <View style={styles.termField}>
                    <TextInput
                      style={styles.termInput}
                      value={days}
                      onChangeText={(t) => setDays(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.faint} maxLength={1}
                    />
                    <Text style={styles.termUnit}>days</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>{DATE_LABEL[method]}</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
                  <Icon name="calendar" size={18} color={colors.accent} />
                  <Text style={styles.dateText}>
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                <DateTimeModal
                  visible={showPicker}
                  value={date}
                  mode="date"
                  onConfirm={(selected) => { setShowPicker(false); setDate(selected); }}
                  onCancel={() => setShowPicker(false)}
                />
              </>
            )}

            <GradientButton label="Continue" onPress={() => setStep('babies')} style={{ marginTop: 22 }} />
            <TouchableOpacity onPress={() => setStep('method')} style={{ marginTop: 16 }}>
              <Text style={styles.altLink}>← Choose a different method</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'babies' && (
          <>
            <Text style={styles.title}>How many babies?</Text>
            <Text style={styles.subtitle}>Expecting more than one? We{"'"}ll tailor your week-by-week journey for multiples.</Text>
            <View style={styles.choices}>
              {([1, 2, 3, 'unsure'] as const).map((n) => {
                const on = babyChoice === n;
                return (
                  <TouchableOpacity key={String(n)} style={[styles.choice, on && styles.choiceOn]} onPress={() => setBabyChoice(n)} activeOpacity={0.85}>
                    {on ? (
                      <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.choiceIcon}>
                        <Text style={styles.countNum}>{n === 'unsure' ? '?' : n}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.choiceIcon, styles.choiceIconOff]}>
                        <Text style={[styles.countNum, { color: colors.accent }]}>{n === 'unsure' ? '?' : n}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.choiceTitle}>{n === 'unsure' ? 'Not sure yet' : countLabel(n)}</Text>
                      <Text style={styles.choiceSub}>{n === 'unsure' ? 'You can set this later' : n === 1 ? 'A single baby' : `${n} babies`}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]}>
                      {on && <Icon name="check" size={13} color={colors.white} strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.babyNote}>You can add each baby{"'"}s name and gender anytime in Settings.</Text>
            <GradientButton label={saving ? 'Saving…' : 'Finish setup'} onPress={save} disabled={saving} style={{ marginTop: 22 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryChip({ v, k }: { v: string; k: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryV}>{v}</Text>
      <Text style={styles.summaryK}>{k}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  scroll: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 26 },
  dot: { width: 10, height: 5, borderRadius: 100, backgroundColor: '#EAD9E0' },
  dotOn: { width: 26, backgroundColor: colors.accent },
  dotDone: { backgroundColor: colors.accent },

  title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  subtitle: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 10, maxWidth: 300 },

  choices: { gap: 11, marginTop: 26 },
  choice: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  choiceOn: { borderWidth: 2, borderColor: colors.accent },
  choiceIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  choiceIconOff: { backgroundColor: colors.accentSoft },
  choiceTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  choiceSub: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 3 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#E0CDD6', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderWidth: 0, backgroundColor: colors.accent },

  dueDisplay: { borderRadius: radius.tile, padding: 22, marginTop: 24, alignItems: 'center', ...{ shadowColor: colors.accent, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.26, shadowRadius: 30, elevation: 6 } },
  dueDisplayLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' },
  dueDisplayDate: { fontFamily: fonts.display, fontSize: 30, color: colors.white, marginTop: 10 },
  dueDisplayMeta: { fontFamily: fonts.body5, fontSize: 12, color: 'rgba(255,255,255,0.88)', marginTop: 8 },

  fieldLabel: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, marginTop: 22, marginBottom: 12 },
  dateBtn: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  dateText: { fontFamily: fonts.body5, fontSize: 15, color: colors.ink },
  termRow: { flexDirection: 'row', gap: 12 },
  termField: { ...cardStyle, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  termInput: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, minWidth: 36 },
  termUnit: { fontFamily: fonts.body5, fontSize: 14, color: colors.muted },
  altLink: { textAlign: 'center', fontFamily: fonts.body5, fontSize: 13, color: colors.muted },
  countNum: { fontFamily: fonts.display, fontSize: 20, color: colors.white },
  babyNote: { fontFamily: fonts.body5, fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: 16 },

  doneWrap: { flex: 1, padding: 26, paddingTop: 20, paddingBottom: 40 },
  doneCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  celebrate: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center', ...{ shadowColor: colors.accent, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.34, shadowRadius: 40, elevation: 8 } },
  doneTitle: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginTop: 28, textAlign: 'center' },
  doneSub: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 21, color: colors.muted, marginTop: 12, textAlign: 'center', maxWidth: 280 },
  chipRow: { flexDirection: 'row', gap: 10, marginTop: 26 },
  summaryChip: { ...cardStyle, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  summaryV: { fontFamily: fonts.display, fontSize: 22, color: colors.accentDeep },
  summaryK: { fontFamily: fonts.body6, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, marginTop: 6 },
});
