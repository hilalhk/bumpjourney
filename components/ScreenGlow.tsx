// Soft radial accent glow anchored to the top of every screen.
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../lib/theme';

export default function ScreenGlow({ intensity = 0.16 }: { intensity?: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -40, left: 0, right: 0, alignItems: 'center' }}>
      <Svg width={460} height={400}>
        <Defs>
          <RadialGradient id="screenGlow" cx="50%" cy="30%" rx="60%" ry="60%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={intensity} />
            <Stop offset="0.62" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="460" height="400" fill="url(#screenGlow)" />
      </Svg>
    </View>
  );
}
