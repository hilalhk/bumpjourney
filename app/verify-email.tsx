import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showAlert } from '../components/ConfirmDialog';
import GradientButton from '../components/GradientButton';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius } from '../lib/theme';

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = String(params.email ?? '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown that gates the "resend" link so we don't spam the mail server.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function verify() {
    if (code.length < 6) {
      showAlert({ title: 'Enter the 6-digit code', message: 'Check your email for the code we just sent.', tone: 'info' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    setLoading(false);
    if (error) {
      showAlert({ title: 'Incorrect or expired code', message: error.message, tone: 'error' });
      return;
    }
    // A session now exists; the root layout routes into the app automatically.
  }

  async function resend() {
    if (cooldown > 0) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      showAlert({ title: 'Could not resend', message: error.message, tone: 'error' });
      return;
    }
    setCooldown(30);
    showAlert({ title: 'Code sent', message: 'We sent a fresh code to your email.', tone: 'success' });
  }

  return (
    <View style={styles.root}>
      <ScreenGlow intensity={0.22} />
      <TopBar title="Verify email" onBack={() => router.back()} />

      <View style={styles.body}>
        <Text style={styles.title}>Enter your code</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor={colors.faint}
          maxLength={6}
          autoFocus
          textAlign="center"
          returnKeyType="done"
          onSubmitEditing={verify}
        />

        <GradientButton
          label={loading ? 'Verifying…' : 'Verify & continue'}
          onPress={verify}
          disabled={loading || code.length < 6}
          style={{ marginTop: 22 }}
        />

        <TouchableOpacity onPress={resend} disabled={cooldown > 0} style={{ marginTop: 20 }} hitSlop={8}>
          <Text style={[styles.resend, cooldown > 0 && styles.resendOff]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get it? Resend code"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas, paddingTop: 8 },
  body: { paddingHorizontal: 28, paddingTop: 28, alignItems: 'center' },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  sub: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 12 },
  email: { fontFamily: fonts.body6, color: colors.accentDeep },
  codeInput: {
    width: '100%', marginTop: 32, height: 64, borderRadius: radius.tile,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
    fontFamily: fonts.display, fontSize: 30, letterSpacing: 8, color: colors.ink,
  },
  resend: { fontFamily: fonts.body6, fontSize: 13, color: colors.accentDeep, textAlign: 'center' },
  resendOff: { color: colors.faint },
});
