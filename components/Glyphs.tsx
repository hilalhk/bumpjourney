import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, type ReactElement } from 'react';
import { useTheme } from '../lib/ThemeContext';
import {
    BackPainIcon,
    CalendarSlashIcon,
    CravingsIcon,
    FatigueIcon,
    HeartRateIcon,
    NauseaIcon,
    SearchIcon,
} from './AppIcons';

type GlyphProps = { size?: number; color?: string };

const MILESTONE_MAP: Record<string, (p: GlyphProps) => ReactElement> = {
  'heart-rate': HeartRateIcon,
  'search': SearchIcon,
  'calendar-slash': CalendarSlashIcon,
};

export const MilestoneGlyph = memo(function MilestoneGlyph(
  { icon, size = 22, color }: { icon: string; size?: number; color?: string }
) {
  // Defaults resolve at render so they follow the active scheme.
  const { colors } = useTheme();
  const tint = color ?? colors.accent;
  const Custom = MILESTONE_MAP[icon];
  if (Custom) return <Custom size={size} color={tint} />;
  return <Ionicons name={icon as any} size={size} color={tint} />;
});

const SYMPTOM_MAP: Record<string, (p: GlyphProps) => ReactElement> = {
  nausea: NauseaIcon,
  fatigue: FatigueIcon,
  back_pain: BackPainIcon,
  cravings: CravingsIcon,
};

export const SymptomGlyph = memo(function SymptomGlyph(
  { id, fallback, size = 24, color }: { id: string; fallback: string; size?: number; color?: string }
) {
  const { colors } = useTheme();
  const tint = color ?? colors.ink;
  const Custom = SYMPTOM_MAP[id];
  if (Custom) return <Custom size={size} color={tint} />;
  return <Ionicons name={fallback as any} size={size} color={tint} />;
});