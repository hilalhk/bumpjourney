import { LinearGradient } from 'expo-linear-gradient';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, gradient } from '../lib/theme';
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

// Palettes taken from the "Modals & Dialogs" comp.
const DANGER = { iconBg: '#F7DEE2', iconColor: '#C0344D', grad: ['#D24B63', '#9E2740'] as const };

const ALERT_TONE: Record<AlertTone, { iconBg: string; iconColor: string; grad: readonly [string, string]; icon: IconName; shadow: string }> = {
  info: { iconBg: colors.accentSoft, iconColor: colors.accent, grad: gradient.accent, icon: 'circle-info', shadow: colors.accent },
  success: { iconBg: '#E3F1E9', iconColor: '#4F7D66', grad: ['#5C9E7A', '#3E7D5A'], icon: 'circle-check', shadow: '#3E7D5A' },
  error: { iconBg: DANGER.iconBg, iconColor: DANGER.iconColor, grad: DANGER.grad, icon: 'circle-alert', shadow: '#9E2740' },
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
        <View style={styles.scrim}>
          {active?.kind === 'confirm' && <ConfirmBody opts={active} close={close} />}
          {active?.kind === 'alert' && <AlertBody opts={active} close={close} />}
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

function ConfirmBody({ opts, close }: { opts: ConfirmOptions; close: (v: boolean) => void }) {
  const isDanger = (opts.tone ?? 'danger') === 'danger';
  return (
    <View style={styles.dialog}>
      <View style={[styles.iconCircle, { backgroundColor: isDanger ? DANGER.iconBg : colors.accentSoft }]}>
        <Icon name={opts.icon ?? (isDanger ? 'trash' : 'circle-info')} size={26} color={isDanger ? DANGER.iconColor : colors.accent} />
      </View>
      <Text style={styles.title}>{opts.title}</Text>
      {opts.message ? <Text style={styles.message}>{opts.message}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => close(false)} activeOpacity={0.85}>
          <Text style={styles.cancelText} numberOfLines={1} adjustsFontSizeToFit>{opts.cancelLabel ?? 'Cancel'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmBtn, isDanger ? styles.dangerShadow : styles.accentShadow]} onPress={() => close(true)} activeOpacity={0.9}>
          <LinearGradient colors={isDanger ? DANGER.grad : gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmGrad}>
            <Text style={styles.confirmText} numberOfLines={1} adjustsFontSizeToFit>{opts.confirmLabel ?? 'Confirm'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AlertBody({ opts, close }: { opts: AlertOptions; close: (v: boolean) => void }) {
  const t = ALERT_TONE[opts.tone ?? 'info'];
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

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(40,18,30,0.5)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  dialog: {
    width: '100%', backgroundColor: colors.white, borderRadius: 26, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.32, shadowRadius: 60, elevation: 14,
  },
  iconCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 16, textAlign: 'center' },
  message: { fontFamily: fonts.body5, fontSize: 13, lineHeight: 20, color: colors.muted, textAlign: 'center', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4ECEF', borderRadius: 15, padding: 14 },
  cancelText: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#6E5560', textAlign: 'center' },
  confirmBtn: { flex: 1, borderRadius: 15 },
  okBtn: { alignSelf: 'stretch', borderRadius: 15, marginTop: 22, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 6 },
  confirmGrad: { alignItems: 'center', justifyContent: 'center', borderRadius: 15, padding: 14 },
  confirmText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.white, textAlign: 'center' },
  dangerShadow: { shadowColor: '#9E2740', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 22, elevation: 6 },
  accentShadow: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 6 },
});
