import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts } from '../lib/theme';
import { Icon, IconName } from './Icons';

type Props = {
  title: string;
  /** Custom back handler. Defaults to router.back(). */
  onBack?: () => void;
  /** Optional right-side action icon (exact redesign glyph) rendered in a circle button. */
  rightGlyph?: IconName;
  onRightPress?: () => void;
  /** Custom right-side element; overrides rightGlyph when provided. */
  right?: ReactNode;
};

/** Stack-screen header: circular back button + title + optional right action. */
export default function TopBar({ title, onBack, rightGlyph, onRightPress, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.circle} onPress={onBack ?? (() => router.back())} activeOpacity={0.85}>
        <Icon name="chevron-left" size={18} color={colors.ink} strokeWidth={2.2} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {right !== undefined ? right : rightGlyph ? (
        <TouchableOpacity style={styles.circle} onPress={onRightPress} activeOpacity={0.85}>
          <Icon name={rightGlyph} size={18} color={colors.accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14 },
  circle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 19, color: colors.ink },
});
