import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfirmProvider } from '../components/ConfirmDialog';
import { ThemeProvider, useTheme, useThemePrefBootstrap } from '../lib/ThemeContext';
import { supabase } from '../lib/supabase';

// Keep the native splash up until fonts, session, and the intro flag are all
// resolved, so the first frame the user sees is the routed app — not a blank
// canvas while async init finishes.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    AsyncStorage.getItem('intro_seen').then((v) => setIntroSeen(v === '1'));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || !fontsLoaded || introSeen === null) return;
    const onLogin = segments[0] === 'login';
    const onIntro = segments[0] === 'intro';
    // verify-email is reached while still signed out (a session only exists once
    // the code is confirmed), so it must be allowed alongside login/intro.
    const onVerify = segments[0] === 'verify-email';
    const onReset = segments[0] === 'reset-password';
    if (session) {
      if (onLogin || onIntro || onVerify || onReset) router.replace('/');
    } else if (!onLogin && !onIntro && !onVerify && !onReset) {
      // Not signed in and not already on an auth screen: route to intro (first
      // run) or login. Once on intro/login we don't bounce, so finishing the
      // intro can navigate to /login without the stale introSeen flag fighting it.
      router.replace(introSeen ? '/login' : '/intro');
    }
  }, [session, loading, segments, fontsLoaded, introSeen, router]);

  // Held alongside fonts/session so the splash covers the first paint — otherwise
  // a dark-mode user sees one light frame before the stored preference resolves.
  const themePref = useThemePrefBootstrap();

  const ready = fontsLoaded && !loading && introSeen !== null && themePref !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!fontsLoaded || themePref === null) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider initialPref={themePref}>
        <ConfirmProvider>
          <AppShell />
        </ConfirmProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Split out so it can read the theme it is being rendered inside of.
//
// Edge-to-edge: the root deliberately does NOT inset for the status bar. Each
// screen spans the full window so its ScreenGlow bleeds up behind the system
// bars; the top inset is applied by the headers (TopBar / StackHeader /
// TabHeader) instead. Setting StatusBar backgroundColor here would paint an
// opaque strip on Android and undo that.
function AppShell() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* "auto" resolves to light text on dark and vice versa. */}
      <StatusBar style="auto" translucent />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
    </View>
  );
}