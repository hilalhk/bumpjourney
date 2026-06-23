import { LinearGradient } from 'expo-linear-gradient';
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

/** Branded replacement for native confirm Alerts. Returns true if confirmed. */
export function useConfirm() {
  return useContext(ConfirmContext);
}

// Destructive palette taken from the "Modals & Dialogs" comp.
const DANGER = { iconBg: '#F7DEE2', iconColor: '#C0344D', grad: ['#D24B63', '#9E2740'] as const };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  }, []);

  const isDanger = (opts?.tone ?? 'danger') === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal visible={!!opts} transparent animationType="fade" statusBarTranslucent onRequestClose={() => close(false)}>
        <View style={styles.scrim}>
          {opts && (
            <View style={styles.dialog}>
              <View style={[styles.iconCircle, { backgroundColor: isDanger ? DANGER.iconBg : colors.accentSoft }]}>
                <Icon name={opts.icon ?? (isDanger ? 'trash' : 'info')} size={26} color={isDanger ? DANGER.iconColor : colors.accent} />
              </View>
              <Text style={styles.title}>{opts.title}</Text>
              {opts.message ? <Text style={styles.message}>{opts.message}</Text> : null}
              <View style={styles.row}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => close(false)} activeOpacity={0.85}>
                  <Text style={styles.cancelText}>{opts.cancelLabel ?? 'Cancel'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, isDanger ? styles.dangerShadow : styles.accentShadow]}
                  onPress={() => close(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient colors={isDanger ? DANGER.grad : gradient.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmGrad}>
                    <Text style={styles.confirmText}>{opts.confirmLabel ?? 'Confirm'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ConfirmContext.Provider>
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
  cancelText: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#6E5560' },
  confirmBtn: { flex: 1, borderRadius: 15 },
  confirmGrad: { alignItems: 'center', justifyContent: 'center', borderRadius: 15, padding: 14 },
  confirmText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.white },
  dangerShadow: { shadowColor: '#9E2740', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 22, elevation: 6 },
  accentShadow: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 6 },
});
