import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, type ReactElement } from 'react';
import { colors } from '../lib/theme';
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
  { icon, size = 22, color = colors.accent }: { icon: string; size?: number; color?: string }
) {
  const Custom = MILESTONE_MAP[icon];
  if (Custom) return <Custom size={size} color={color} />;
  return <Ionicons name={icon as any} size={size} color={color} />;
});

const SYMPTOM_MAP: Record<string, (p: GlyphProps) => ReactElement> = {
  nausea: NauseaIcon,
  fatigue: FatigueIcon,
  back_pain: BackPainIcon,
  cravings: CravingsIcon,
};

export const SymptomGlyph = memo(function SymptomGlyph(
  { id, fallback, size = 24, color = colors.ink }: { id: string; fallback: string; size?: number; color?: string }
) {
  const Custom = SYMPTOM_MAP[id];
  if (Custom) return <Custom size={size} color={color} />;
  return <Ionicons name={fallback as any} size={size} color={color} />;
});