// Shared header for pushed (stack) screens: back-chevron circle + title + optional right slot.
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts } from '../lib/theme';
import { ChevronLeftIcon } from './Icons';

type Props = { title?: string; right?: ReactNode; onBack?: () => void; style?: StyleProp<ViewStyle> };

export default function StackHeader({ title, right, onBack, style }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // marginTop (not paddingTop) and placed after `style`, so a caller's own
  // paddingTop — e.g. onboarding's header — survives the status-bar inset.
  return (
    <View style={[styles.row, style, { marginTop: insets.top }]}>
      <TouchableOpacity
        style={styles.circle}
        onPress={onBack ?? (() => router.back())}
        activeOpacity={0.85}
        hitSlop={6}
      >
        <ChevronLeftIcon size={18} color={colors.ink} strokeWidth={2.2} />
      </TouchableOpacity>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
      {right ?? null}
    </View>
  );
}

export const CircleButton = ({ children, onPress }: { children: ReactNode; onPress?: () => void }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity style={styles.circle} onPress={onPress} activeOpacity={0.85}>
      {children}
    </TouchableOpacity>
  );
};

const makeStyles = (c: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 19, color: c.ink },
});
