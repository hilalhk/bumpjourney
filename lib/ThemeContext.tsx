import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import {
  Colors,
  Gradients,
  Scheme,
  Shadows,
  gradientFor,
  palettes,
  shadowFor,
} from './theme';

/** What the user picked. 'system' defers to the OS appearance. */
export type ThemePref = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme_pref';

function isPref(v: string | null): v is ThemePref {
  return v === 'system' || v === 'light' || v === 'dark';
}

type ThemeValue = {
  /** The scheme actually being rendered, after resolving 'system'. */
  scheme: Scheme;
  colors: Colors;
  gradient: Gradients;
  shadow: Shadows;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function useTheme(): ThemeValue {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}

/**
 * Builds a StyleSheet from the active palette. Pass a factory defined at module
 * scope so its identity is stable and styles are rebuilt only when the scheme
 * flips:
 *
 *   const makeStyles = (c: Colors) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T>(factory: (c: Colors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}

/** Reads the persisted preference before first paint. Returns null until loaded. */
export function useThemePrefBootstrap(): ThemePref | null {
  const [pref, setPref] = useState<ThemePref | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => setPref(isPref(v) ? v : 'system'))
      .catch(() => setPref('system'));
  }, []);
  return pref;
}

export function ThemeProvider({ initialPref, children }: { initialPref: ThemePref; children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(initialPref);

  // Appearance.setColorScheme is an app-level override: it makes useColorScheme()
  // — and native elements like pickers and alerts — report the forced scheme, so
  // nothing else has to know about `pref`. Passing 'unspecified' clears the
  // override (RN 0.86 dropped the old `null` form in favor of 'unspecified').
  useEffect(() => {
    Appearance.setColorScheme(pref === 'system' ? 'unspecified' : pref);
  }, [pref]);

  // Reading the hook (rather than pref) means an OS-level change while on
  // 'system' re-renders us for free.
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = palettes[scheme];

  // Paints the native root view so orientation changes and overscroll don't
  // flash white behind the JS canvas.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.canvas).catch(() => {});
  }, [colors.canvas]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ scheme, colors, gradient: gradientFor(scheme), shadow: shadowFor(scheme), pref, setPref }),
    [scheme, colors, pref, setPref]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
