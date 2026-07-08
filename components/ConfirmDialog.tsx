import { LinearGradient } from 'expo-linear-gradient';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, gradientFor } from '../lib/theme';
import { Icon, IconName } from './Icons';

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: IconName;
  /** 'danger' = red destructive (default), 'accent' = the app's rosy accent. */
  tone?: 'danger' | 'accent';
};

export type AlertTone = 'info' | 'success' | 'error';
export type AlertOptions = { title: string; message?: string; okLabel?: string; tone?: AlertTone };

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

/** Branded replacement for native confirm Alerts. Returns true if confirmed. */
export function useConfirm() {
  return useContext(ConfirmContext);
}

// Imperative single-OK alert — no hook needed at call sites. Falls back to the
// native Alert if the provider isn't mounted (shouldn't happen inside the app).
let _alert: ((opts: AlertOptions) => Promise<void>) | null = null;
export function showAlert(opts: AlertOptions): Promise<void> {
  if (_alert) return _alert(opts);
  return new Promise((resolve) => Alert.alert(opts.title, opts.message, [{ text: 'OK', onPress: () => resolve() }]));
}

// Palettes taken from the "Modals & Dialogs" comp. The gradients are their own
// surfaces and read correctly on either scheme, so only the tinted icon circles
// and their glyph colors are re-derived for dark.
const DANGER_GRAD = ['#D24B63', '#9E2740'] as const;
const SUCCESS_GRAD = ['#5C9E7A', '#3E7D5A'] as const;

const dangerFor = (c: Colors) =>
  c.scheme === 'light'
    ? { iconBg: '#F7DEE2', iconColor: '#C0344D', grad: DANGER_GRAD }
    : { iconBg: '#3A1F26', iconColor: '#E8899A', grad: DANGER_GRAD };

const successFor = (c: Colors) =>
  c.scheme === 'light'
    ? { iconBg: '#E3F1E9', iconColor: '#4F7D66' }
    : { iconBg: '#1D2C24', iconColor: '#8FC9A9' };

type Tone = { iconBg: string; iconColor: string; grad: readonly [string, string]; icon: IconName; shadow: string };

const alertTones = (c: Colors): Record<AlertTone, Tone> => {
  const danger = dangerFor(c);
  const success = successFor(c);
  return {
    info: { iconBg: c.accentSoft, iconColor: c.accent, grad: gradientFor(c.scheme).accent, icon: 'circle-info', shadow: c.accent },
    success: { ...success, grad: SUCCESS_GRAD, icon: 'circle-check', shadow: '#3E7D5A' },
    error: { ...danger, icon: 'circle-alert', shadow: '#9E2740' },
  };
};

type Active =
  | ({ kind: 'confirm' } & ConfirmOptions)
  | ({ kind: 'alert' } & AlertOptions);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Active | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setActive({ kind: 'confirm', ...o });
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const alertFn = useCallback((o: AlertOptions) => {
    setActive({ kind: 'alert', ...o });
    return new Promise<void>((resolve) => { resolver.current = () => resolve(); });
  }, []);

  useEffect(() => {
    _alert = alertFn;
    return () => { if (_alert === alertFn) _alert = null; };
  }, [alertFn]);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setActive(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal visible={!!active} transparent animationType="fade" statusBarTranslucent onRequestClose={() => close(false)}>
        <Scrim>
          {active?.kind === 'confirm' && <ConfirmBody opts={active} close={close} />}
          {active?.kind === 'alert' && <AlertBody opts={active} close={close} />}
        </Scrim>
      </Modal>
    </ConfirmContext.Provider>
  );
}

function Scrim({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.scrim}>{children}</View>;
}

function ConfirmBody({ opts, close }: { opts: ConfirmOptions; close: (v: boolean) => void }) {
  const { colors: c, gradient } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isDanger = (opts.tone ?? 'danger') === 'danger';
  const danger = dangerFor(c);
  return (
    <View style={styles.dialog}>
      <View style={[styles.iconCircle, { backgroundColor: isDanger ? danger.iconBg : c.accentSoft }]}>
        <Icon name={opts.icon ?? (isDanger ? 'trash' : 'circle-info')} size={26} color={isDanger ? danger.iconColor : c.accent} />
      </View>
      <Text style={styles.title}>{opts.title}</Text>
      {opts.message ? <Text style={styles.message}>{opts.message}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => close(false)} activeOpacity={0.85}>
          <Text style={styles.cancelText} numberOfLines={1} adjustsFontSizeToFit>{opts.cancelLabel ?? 'Cancel'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmBtn, isDanger ? styles.dangerShadow : styles.accentShadow]} onPress={() => close(true)} activeOpacity={0.9}>
          <LinearGradient colors={isDanger ? danger.grad : gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmGrad}>
            <Text style={styles.confirmText} numberOfLines={1} adjustsFontSizeToFit>{opts.confirmLabel ?? 'Confirm'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AlertBody({ opts, close }: { opts: AlertOptions; close: (v: boolean) => void }) {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const t = alertTones(c)[opts.tone ?? 'info'];
  return (
    <View style={styles.dialog}>
      <View style={[styles.iconCircle, { backgroundColor: t.iconBg }]}>
        <Icon name={t.icon} size={26} color={t.iconColor} />
      </View>
      <Text style={styles.title}>{opts.title}</Text>
      {opts.message ? <Text style={styles.message}>{opts.message}</Text> : null}
      <TouchableOpacity style={[styles.okBtn, { shadowColor: t.shadow }]} onPress={() => close(true)} activeOpacity={0.9}>
        <LinearGradient colors={t.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmGrad}>
          <Text style={styles.confirmText} numberOfLines={1} adjustsFontSizeToFit>{opts.okLabel ?? 'OK'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  scrim: { flex: 1, backgroundColor: c.scrim, alignItems: 'center', justifyContent: 'center', padding: 26 },
  dialog: {
    width: '100%', backgroundColor: c.surface, borderRadius: 26, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.32, shadowRadius: 60, elevation: 14,
  },
  iconCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 20, color: c.ink, marginTop: 16, textAlign: 'center' },
  message: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 20, color: c.muted, textAlign: 'center', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.subtleBg, borderRadius: 15, padding: 14 },
  cancelText: { fontFamily: fonts.displaySemi, fontSize: 14, color: c.subtleText, textAlign: 'center' },
  confirmBtn: { flex: 1, borderRadius: 15 },
  okBtn: { alignSelf: 'stretch', borderRadius: 15, marginTop: 22, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 6 },
  confirmGrad: { alignItems: 'center', justifyContent: 'center', borderRadius: 15, padding: 14 },
  confirmText: { fontFamily: fonts.displaySemi, fontSize: 14, color: c.onAccent, textAlign: 'center' },
  dangerShadow: { shadowColor: '#9E2740', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 22, elevation: 6 },
  accentShadow: { shadowColor: c.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 6 },
});
