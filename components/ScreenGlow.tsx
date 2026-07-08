// Soft radial accent glow anchored to the top of every screen.
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../lib/ThemeContext';

export default function ScreenGlow({ intensity = 0.16 }: { intensity?: number }) {
  const { colors, scheme } = useTheme();
  // The glow reads as a wash of light bleeding into the canvas. On the dark
  // canvas that wash loses most of its contrast, so it needs more presence to
  // stay visible at all.
  const strength = scheme === 'dark' ? intensity * 1.5 : intensity;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -40, left: 0, right: 0, alignItems: 'center' }}>
      <Svg width={460} height={400}>
        <Defs>
          <RadialGradient id="screenGlow" cx="50%" cy="30%" rx="60%" ry="60%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={strength} />
            <Stop offset="0.62" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="460" height="400" fill="url(#screenGlow)" />
      </Svg>
    </View>
  );
}
