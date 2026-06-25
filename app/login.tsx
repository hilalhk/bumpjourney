import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { showAlert } from '../components/ConfirmDialog';
import GradientButton from '../components/GradientButton';
import ScreenGlow from '../components/ScreenGlow';
import { signInWithGoogle } from '../lib/googleAuth';
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
function GoogleG() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onGoogle() {
    setGoogleLoading(true);
    const { ok, error } = await signInWithGoogle();
    setGoogleLoading(false);
    // On success the root layout routes into the app via the new session.
    if (!ok && error) showAlert({ title: 'Google sign-in', message: error, tone: 'error' });
  }

  // The form scrolls; on Android (edge-to-edge) the window doesn't resize for the
  // keyboard, so we pad the content by the keyboard height and scroll the focused
  // field into view instead of letting the keyboard cover it.
  const scrollRef = useRef<ScrollView>(null);
  const [kbHeight, setKbHeight] = useState(0);

  const scrollToFocused = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => {
      setKbHeight(e.endCoordinates.height);
      scrollToFocused();
    });
    const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  async function submit() {
    if (!email.trim() || !password) {
      showAlert({ title: 'Missing details', message: 'Please enter your email and password.', tone: 'info' });
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      showAlert({ title: 'Add your name', message: 'Tell us your name so we can personalize your journey.', tone: 'info' });
      return;
    }
    setLoading(true);
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (error) showAlert({ title: 'Could not sign in', message: error.message, tone: 'error' });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      setLoading(false);
      if (error) { showAlert({ title: 'Could not sign up', message: error.message, tone: 'error' }); return; }
      // Supabase returns a user with no identities when the email already exists
      // (it hides this to prevent account enumeration) — steer them to sign in.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showAlert({ title: 'Already registered', message: 'This email already has an account. Try signing in instead.', tone: 'info' });
        return;
      }
      // With email confirmation on, no session exists until the code is verified.
      if (!data.session) {
        router.push({ pathname: '/verify-email', params: { email: email.trim() } });
      }
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      showAlert({ title: 'Enter your email', message: 'Type your email above first, then tap "Forgot password?" again.', tone: 'info' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) { showAlert({ title: 'Could not send code', message: error.message, tone: 'error' }); return; }
    router.push({ pathname: '/reset-password', params: { email: email.trim() } });
  }

  return (
    <View style={styles.root}>
      <ScreenGlow intensity={0.22} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: 48 + kbHeight }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          {/* brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Image source={require('../assets/images/bumpjourney-logo.png')} style={styles.logoImg} contentFit="cover" />
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
                    onFocus={scrollToFocused}
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
                onFocus={scrollToFocused}
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
                onFocus={scrollToFocused}
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={onGoogle} disabled={googleLoading} activeOpacity={0.85}>
              <GoogleG />
              <Text style={styles.googleText}>{googleLoading ? 'Signing in…' : 'Continue with Google'}</Text>
            </TouchableOpacity>
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
            By continuing you agree to our{' '}
            <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('https://bumpjourney.app/legal-desktop.html#terms')}>Terms</Text> and{' '}
            <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('https://bumpjourney.app/legal-desktop.html#privacy')}>Privacy Policy</Text>.
          </Text>
      </ScrollView>
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

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  dividerText: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 52, marginTop: 16, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
  },
  googleText: { fontFamily: fonts.body6, fontSize: 15, color: colors.ink },

  switch: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  switchText: { fontSize: 13, color: colors.muted, fontFamily: fonts.body5 },
  switchLink: { fontSize: 13, color: colors.accentDeep, fontFamily: fonts.body6 },
  disclaimer: { fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 18, lineHeight: 17, fontFamily: fonts.body5, paddingHorizontal: 30 },
  disclaimerLink: { textDecorationLine: 'underline', color: colors.muted },
});
