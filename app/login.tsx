import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import GradientButton from '../components/GradientButton';
import ScreenGlow from '../components/ScreenGlow';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../lib/theme';

function MailIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Polyline points="3 7 12 13 21 7" />
    </Svg>
  );
}
function LockIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="4" y="11" width="16" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}
function EyeIcon({ off }: { off?: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.faint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <Circle cx="12" cy="12" r="3" />
      {off && <Path d="M3 3l18 18" />}
    </Svg>
  );
}
function PersonIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Add your name', 'Tell us your name so we can personalise your journey.');
      return;
    }
    setLoading(true);
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (error) Alert.alert('Could not sign in', error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      setLoading(false);
      if (error) Alert.alert('Could not sign up', error.message);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Type your email above first, then tap Forgot again to get a reset link.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    Alert.alert(
      error ? 'Error' : 'Check your email',
      error ? error.message : 'We sent you a link to reset your password.'
    );
  }

  return (
    <View style={styles.root}>
      <ScreenGlow intensity={0.22} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Image source={require('../assets/images/bumpjourney-logo.png')} style={styles.logoImg} resizeMode="cover" />
            </View>
            <Text style={styles.logo}>BumpJourney</Text>
            <Text style={styles.tagline}>Every week of your pregnancy, gently tracked in one calm place.</Text>
          </View>

          {/* form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <>
                <Text style={styles.label}>Your name</Text>
                <View style={[styles.inputWrap, { marginBottom: 16 }]}>
                  <PersonIcon />
                  <TextInput
                    style={styles.input}
                    placeholder="First & last name"
                    placeholderTextColor={colors.faint}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <MailIcon />
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={colors.faint}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              {mode === 'signin' && (
                <TouchableOpacity onPress={forgotPassword} hitSlop={8}>
                  <Text style={styles.forgot}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrap}>
              <LockIcon />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.faint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                <EyeIcon off={showPassword} />
              </TouchableOpacity>
            </View>

            <GradientButton
              label={loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              onPress={submit}
              disabled={loading}
              style={{ marginTop: 18 }}
            />
          </View>

          {/* switch */}
          <View style={styles.switch}>
            <Text style={styles.switchText}>
              {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')} hitSlop={8}>
              <Text style={styles.switchLink}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By continuing you agree to our <Text style={styles.disclaimerLink}>Terms</Text> and{' '}
            <Text style={styles.disclaimerLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 26, paddingVertical: 48 },
  brand: { alignItems: 'center' },
  logoBox: {
    width: 88, height: 88, borderRadius: 24, overflow: 'hidden',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.32, shadowRadius: 36, elevation: 8,
  },
  logoImg: { width: '100%', height: '100%' },
  logo: { fontSize: 30, fontFamily: fonts.display, color: colors.ink, marginTop: 20 },
  tagline: { fontSize: 13, fontFamily: fonts.body5, color: colors.muted, marginTop: 8, textAlign: 'center', maxWidth: 250, lineHeight: 19 },

  form: { marginTop: 36 },
  label: { fontSize: 10, fontFamily: fonts.body6, color: colors.muted, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  forgot: { fontSize: 12, fontFamily: fonts.body6, color: colors.accentDeep },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, fontFamily: fonts.body5, paddingVertical: 0 },

  switch: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  switchText: { fontSize: 13, color: colors.muted, fontFamily: fonts.body5 },
  switchLink: { fontSize: 13, color: colors.accentDeep, fontFamily: fonts.body6 },
  disclaimer: { fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 18, lineHeight: 17, fontFamily: fonts.body5, paddingHorizontal: 30 },
  disclaimerLink: { textDecorationLine: 'underline', color: colors.muted },
});
