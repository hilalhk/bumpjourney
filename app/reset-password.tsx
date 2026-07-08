import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showAlert } from '../components/ConfirmDialog';
import GradientButton from '../components/GradientButton';
import ScreenGlow from '../components/ScreenGlow';
import TopBar from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

export default function ResetPassword() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = String(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit() {
    if (code.length < 6) {
      showAlert({ title: 'Enter the 6-digit code', message: 'Check your email for the code we just sent.', tone: 'info' });
      return;
    }
    if (password.length < 6) {
      showAlert({ title: 'Choose a password', message: 'Your new password must be at least 6 characters.', tone: 'info' });
      return;
    }
    setLoading(true);
    // The recovery code signs the user in for a moment so we can set a new password.
    const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (verifyErr) {
      setLoading(false);
      showAlert({ title: 'Incorrect or expired code', message: verifyErr.message, tone: 'error' });
      return;
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateErr) {
      showAlert({ title: 'Could not update password', message: updateErr.message, tone: 'error' });
      return;
    }
    // A session now exists; the root layout routes into the app automatically.
    showAlert({ title: 'Password updated', message: "You're signed in with your new password.", tone: 'success' });
  }

  async function resend() {
    if (cooldown > 0) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
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
      <TopBar title="Reset password" onBack={() => router.back()} />

      <View style={styles.body}>
        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.sub}>
          Enter the 6-digit code we sent to{'\n'}
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
        />

        <View style={styles.pwWrap}>
          <TextInput
            style={styles.pwInput}
            value={password}
            onChangeText={setPassword}
            placeholder="New password"
            placeholderTextColor={colors.faint}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
            <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <GradientButton
          label={loading ? 'Updating…' : 'Reset password'}
          onPress={submit}
          disabled={loading || code.length < 6 || password.length < 6}
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

const makeStyles = (c: Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.canvas, paddingTop: 8 },
  body: { paddingHorizontal: 28, paddingTop: 28, alignItems: 'center' },
  title: { fontFamily: fonts.display, fontSize: 26, color: c.ink },
  sub: { fontFamily: fonts.body5, fontSize: 14, lineHeight: 21, color: c.muted, textAlign: 'center', marginTop: 12 },
  email: { fontFamily: fonts.body6, color: c.accentDeep },
  codeInput: {
    width: '100%', marginTop: 28, height: 60, borderRadius: radius.tile,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder,
    fontFamily: fonts.display, fontSize: 28, letterSpacing: 8, color: c.ink,
  },
  pwWrap: {
    width: '100%', marginTop: 12, height: 54, borderRadius: radius.tile,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10,
  },
  pwInput: { flex: 1, fontFamily: fonts.body5, fontSize: 15, color: c.ink },
  showText: { fontFamily: fonts.body6, fontSize: 13, color: c.accentDeep },
  resend: { fontFamily: fonts.body6, fontSize: 13, color: c.accentDeep, textAlign: 'center' },
  resendOff: { color: c.faint },
});
