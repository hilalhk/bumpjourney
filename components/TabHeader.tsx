// Shared header for the four main tab screens:
// gradient avatar + name/subtitle, and SOS / notifications / settings circle buttons.
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dayKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, shadowFor } from '../lib/theme';
import { firstName } from '../lib/user';
import { BellIcon } from './Icons';

type Props = { subtitle: string; name?: string };

export default function TabHeader({ subtitle, name: nameProp }: Props) {
  const router = useRouter();
  const { colors, gradient } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [hasNotifications, setHasNotifications] = useState(false);
  const [loadedName, setLoadedName] = useState('');
  const name = nameProp || loadedName;
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setLoadedName(firstName(user));
        const today = dayKey(new Date());
        const [{ count: apptCount }, { data: medRows }, { data: logRows }] = await Promise.all([
          supabase.from('appointments').select('id', { count: 'exact', head: true })
            .gte('appt_at', new Date().toISOString()),
          supabase.from('medications').select('id, times, start_date').eq('is_active', true),
          supabase.from('medication_logs').select('medication_id, scheduled_time').eq('log_date', today),
        ]);
        const taken = new Set((logRows ?? []).map((l) => `${l.medication_id}|${l.scheduled_time}`));
        const pendingMed = (medRows ?? []).some(
          (m) => (m.times ?? []).length > 0 && (!m.start_date || m.start_date <= today)
            && (m.times ?? []).some((t: string) => !taken.has(`${m.id}|${t}`))
        );
        setHasNotifications((apptCount ?? 0) > 0 || pendingMed);
      })();
    }, [])
  );

  async function handleSOS() {
    const { data } = await supabase.from('emergency_info').select('emergency_phone').maybeSingle();
    const phone = data?.emergency_phone?.replace(/[^0-9+]/g, '');
    if (phone) Linking.openURL(`tel:${phone}`);
    else router.push('/emergency-info');
  }

  return (
    <View style={[styles.row, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.profile} onPress={() => router.push('/settings')} activeOpacity={0.7}>
        <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleSOS} activeOpacity={0.85}>
          <LinearGradient colors={gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sos}>
            <Text style={styles.sosText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circle} onPress={() => router.push('/notifications')} activeOpacity={0.85}>
          <BellIcon size={17} color={colors.ink} />
          {hasNotifications && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  profile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, minWidth: 0 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', ...shadowFor(c.scheme).accent },
  avatarText: { fontFamily: fonts.displaySemi, fontSize: 17, color: c.onAccent },
  name: { fontFamily: fonts.displaySemi, fontSize: 16, color: c.ink },
  subtitle: { fontFamily: fonts.body5, fontSize: 11, color: c.muted, marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sos: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...shadowFor(c.scheme).accent },
  sosText: { fontFamily: fonts.body6, fontSize: 11, color: c.onAccent, letterSpacing: 0.5 },
  circle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    position: 'absolute', top: 9, right: 11, width: 7, height: 7, borderRadius: 4,
    backgroundColor: c.accent, borderWidth: 1.5, borderColor: c.canvas,
  },
});
