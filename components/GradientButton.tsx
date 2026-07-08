// Primary gradient CTA used across the redesign.
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'lg' | 'md';
};

export default function GradientButton({ label, onPress, icon, disabled, style, size = 'lg' }: Props) {
  const { gradient, shadow } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      style={[shadow.accent, { borderRadius: radius.cta, opacity: disabled ? 0.6 : 1 }, style]}
    >
      <LinearGradient
        colors={gradient.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, size === 'md' && styles.btnMd]}
      >
        {icon}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.cta,
  },
  btnMd: { paddingVertical: 13 },
  label: { fontFamily: fonts.displaySemi, fontSize: 16, color: c.onAccent },
});
