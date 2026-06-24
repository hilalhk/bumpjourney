import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cardStyle } from '../components/Card';
import { useConfirm } from '../components/ConfirmDialog';
import { Icon } from '../components/Icons';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { usePregnancy, weekSubtitle } from '../hooks/usePregnancy';
import { supabase } from '../lib/supabase';
import { colors, fonts, gradient, radius, shadow } from '../lib/theme';
import { fullName } from '../lib/user';

export default function Settings() {
  const router = useRouter();
  const info = usePregnancy();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [babySex, setBabySex] = useState<string | null>(null);

  const loadDue = useCallback(async () => {
    const [{ data: preg }, { data: details }] = await Promise.all([
      supabase.from('pregnancies').select('due_date').eq('is_active', true).order('created_at', { ascending: false }).limit(1),
      supabase.from('prep_data').select('payload').eq('kind', 'pregnancy_details').maybeSingle(),
    ]);
    if (preg && preg.length > 0) {
      setDueDate(new Date(preg[0].due_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }
    setBabySex(details?.payload?.sex ?? null);
  }, []);

  const sexLabel = babySex === 'girl' ? 'Girl' : babySex === 'boy' ? 'Boy' : babySex === 'surprise' ? 'Team surprise' : 'Not set';

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
      if (user) setName(fullName(user));
    })();
  }, []);

  useFocusEffect(useCallback(() => { loadDue(); }, [loadDue]));

  function startEditName() {
    setNameDraft(name);
    setEditingName(true);
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    setSavingName(true);
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
    setSavingName(false);
    if (error) { Alert.alert("Couldn't save", error.message); return; }
    setName(fullName(data.user));
    setEditingName(false);
  }

  const confirm = useConfirm();

  async function confirmSignOut() {
    const ok = await confirm({
      tone: 'accent', icon: 'logout', title: 'Sign out',
      message: 'Are you sure you want to sign out?', confirmLabel: 'Sign out',
    });
    if (ok) supabase.auth.signOut();
  }

  async function confirmDelete() {
    const ok = await confirm({
      tone: 'danger', icon: 'alert', title: 'Delete account',
      message: 'This permanently deletes your account and all your data — pregnancy details, symptoms, kick and contraction history, and journal entries. This cannot be undone.',
      confirmLabel: 'Delete account',
    });
    if (!ok) return;
    const sure = await confirm({
      tone: 'danger', icon: 'alert', title: 'Are you absolutely sure?',
      message: 'There is no way to recover your data after this.',
      confirmLabel: 'Delete forever', cancelLabel: 'Keep account',
    });
    if (sure) doDelete();
  }

  async function doDelete() {
    const { error } = await supabase.rpc('delete_my_account');
    if (error) { Alert.alert('Error', 'Could not delete your account: ' + error.message); return; }
    await supabase.auth.signOut();
  }

  const EditPill = () => (
    <View style={styles.editPill}>
      <Icon name="pencil" size={13} color={colors.accentDeep} strokeWidth={2.2} />
      <Text style={styles.editText}>Edit</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenGlow />
      <TopBar title="Settings" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* profile header */}
        <View style={styles.profile}>
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{(name || '?').charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.profileName} numberOfLines={1}>{name || 'Your account'}</Text>
            <Text style={styles.profileSub}>{weekSubtitle(info)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Pregnancy</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/edit-due-date')} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Due date</Text>
              <Text style={styles.rowValue}>{dueDate ?? 'Not set'}</Text>
            </View>
            <EditPill />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, styles.rowBorder]} onPress={() => router.push('/edit-baby-sex')} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Baby&apos;s sex</Text>
              <Text style={styles.rowValue}>{sexLabel}</Text>
            </View>
            <EditPill />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Emergency</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/emergency-info')} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>Emergency information</Text>
            <Icon name="chevron-right" size={16} color={colors.faint} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          {editingName ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name</Text>
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  placeholder="Your name"
                  placeholderTextColor={colors.faint}
                  autoFocus
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  editable={!savingName}
                />
                {!savingName && (
                  <TouchableOpacity onPress={() => setEditingName(false)} hitSlop={6}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={saveName} disabled={savingName} hitSlop={6}>
                  <Text style={styles.saveText}>{savingName ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.linkRow} onPress={startEditName} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Name</Text>
                <Text style={styles.rowValue}>{name || 'Not set'}</Text>
              </View>
              <EditPill />
            </TouchableOpacity>
          )}
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{email}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://bumpjourney.app/legal-desktop.html#privacy')} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <Icon name="external" size={15} color={colors.faint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, styles.rowBorder]} onPress={() => Linking.openURL('https://bumpjourney.app/legal-desktop.html#terms')} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>Terms of service</Text>
            <Icon name="external" size={15} color={colors.faint} />
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>BumpJourney provides general information for tracking purposes and is not a substitute for professional medical advice. Always consult your healthcare provider.</Text>

        <TouchableOpacity style={styles.signOutBtn} onPress={confirmSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.85}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>BumpJourney v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  profile: { ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', ...shadow.accent },
  avatarText: { fontFamily: fonts.displaySemi, fontSize: 22, color: colors.white },
  profileName: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  profileSub: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 4 },

  sectionLabel: { fontFamily: fonts.body6, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted, marginTop: 22, marginBottom: 11, marginHorizontal: 2 },
  card: { ...cardStyle, paddingHorizontal: 14 },
  row: { paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.cardBorder },
  rowLabel: { fontFamily: fonts.body6, fontSize: 14, color: colors.ink },
  rowValue: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted, marginTop: 3 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  nameInput: { flex: 1, fontFamily: fonts.body5, fontSize: 14, color: colors.ink, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, backgroundColor: colors.chipBg },
  saveText: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accentDeep },
  cancelText: { fontFamily: fonts.body6, fontSize: 13, color: colors.muted },
  editPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentSoft, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 11 },
  editText: { fontFamily: fonts.body6, fontSize: 12, color: colors.accentDeep },
  disclaimer: { fontFamily: fonts.body5, fontSize: 11, lineHeight: 16, color: colors.faint, marginTop: 16 },
  signOutBtn: { backgroundColor: colors.accentSoft, borderRadius: radius.card, padding: 16, alignItems: 'center', marginTop: 24 },
  signOutText: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.accentDeep },
  deleteBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  deleteText: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#C0504A' },
  version: { fontFamily: fonts.body5, fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 24 },
});
