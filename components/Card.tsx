// Surface card — the default container in the Lumi system.
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemedStyles } from '../lib/ThemeContext';
import { Colors, radius, shadowFor } from '../lib/theme';

/**
 * Spread into a themed StyleSheet factory:
 *   const makeStyles = (c: Colors) => StyleSheet.create({
 *     tile: { ...makeCardStyle(c), padding: 16 },
 *   });
 */
export const makeCardStyle = (c: Colors) =>
  ({
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.cardBorder,
    borderRadius: radius.tile,
    ...shadowFor(c.scheme).card,
  }) as const;

const makeStyles = (c: Colors) => StyleSheet.create({ card: makeCardStyle(c) });

export default function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}
