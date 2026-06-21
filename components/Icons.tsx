// Exact stroke-icon set extracted from the redesign comps (Feather-style, 24×24).
// Data-driven so every screen renders pixel-identical glyphs.
import { ReactElement } from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

// Element tuples: p=path, c=circle, l=line, pl=polyline, pg=polygon, r=rect, e=ellipse, pr=rotated-rect
type El =
  | ['p', string]
  | ['c', number, number, number]
  | ['l', number, number, number, number]
  | ['pl', string]
  | ['pg', string]
  | ['r', number, number, number, number, number?]
  | ['e', number, number, number, number]
  | ['pr', number, number, number, number, number, number, number];

export type IconName =
  | 'home' | 'activity' | 'book' | 'clipboard' | 'bell' | 'gear'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'chevron-up'
  | 'plus' | 'minus' | 'pencil' | 'close' | 'search' | 'x-circle'
  | 'info' | 'info-top' | 'help' | 'funnel' | 'trash' | 'calendar'
  | 'clock' | 'timer' | 'water' | 'footprint' | 'pill' | 'celery'
  | 'medkit' | 'sync' | 'pin' | 'navigate' | 'phone' | 'hospital'
  | 'blood' | 'alert' | 'bandage' | 'person' | 'heart' | 'bag' | 'medical'
  | 'document' | 'star' | 'bulb' | 'ear' | 'eye' | 'eye-off' | 'check'
  | 'images' | 'mail' | 'lock' | 'download' | 'arrow-right' | 'globe'
  | 'gift' | 'sliders' | 'external'
  | 'gender-girl' | 'gender-boy' | 'gender-unisex'
  | 'verdict-safe' | 'verdict-caution' | 'verdict-avoid';

const G: Record<IconName, El[]> = {
  home: [['p', 'M3 10.5 12 3l9 7.5'], ['p', 'M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5']],
  activity: [['p', 'M3 12h4l2 5 4-12 2 7h6']],
  book: [['p', 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z'], ['l', 8, 9, 14, 9]],
  clipboard: [['r', 5, 3, 14, 18, 2], ['p', 'M9 8h6'], ['p', 'M9 12l1.5 1.5L13 11']],
  bell: [['p', 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'], ['p', 'M13.7 21a2 2 0 0 1-3.4 0']],
  gear: [['c', 12, 12, 3], ['p', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z']],
  'chevron-left': [['pl', '15 6 9 12 15 18']],
  'chevron-right': [['pl', '9 6 15 12 9 18']],
  'chevron-down': [['pl', '6 9 12 15 18 9']],
  'chevron-up': [['pl', '18 15 12 9 6 15']],
  plus: [['l', 12, 5, 12, 19], ['l', 5, 12, 19, 12]],
  minus: [['l', 5, 12, 19, 12]],
  pencil: [['p', 'M12 20h9'], ['p', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z']],
  close: [['l', 18, 6, 6, 18], ['l', 6, 6, 18, 18]],
  search: [['c', 11, 11, 7], ['l', 21, 21, 16.5, 16.5]],
  'x-circle': [['c', 12, 12, 10], ['l', 15, 9, 9, 15], ['l', 9, 9, 15, 15]],
  info: [['c', 12, 12, 10], ['l', 12, 16, 12, 12], ['l', 12, 8, 12.01, 8]],
  'info-top': [['c', 12, 12, 10], ['l', 12, 8, 12, 12], ['l', 12, 16, 12.01, 16]],
  help: [['c', 12, 12, 10], ['p', 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 2.5'], ['l', 12, 17, 12.01, 17]],
  funnel: [['pg', '22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3']],
  trash: [['pl', '3 6 5 6 21 6'], ['p', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'], ['p', 'M10 11v6M14 11v6'], ['p', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2']],
  calendar: [['r', 3, 5, 18, 16, 2], ['l', 3, 9, 21, 9], ['l', 8, 2, 8, 6], ['l', 16, 2, 16, 6]],
  clock: [['c', 12, 12, 9], ['p', 'M12 7v5l3 2']],
  timer: [['c', 12, 13, 8], ['p', 'M12 13V9'], ['p', 'M9 2h6']],
  water: [['p', 'M6 3h12l-1.1 16.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6 3z'], ['p', 'M6.7 9.5h10.6']],
  footprint: [['e', 7, 13.5, 3.1, 4.4], ['e', 7, 20.4, 2.1, 1.8], ['e', 17, 7.6, 3.1, 4.4], ['e', 17, 14.5, 2.1, 1.8]],
  pill: [['pr', 3, 8, 18, 11, 5.5, -45, 12], ['l', 8.5, 8.5, 15.5, 15.5]],
  celery: [['p', 'M6 2v8a3 3 0 0 0 6 0V2'], ['p', 'M9 2v20'], ['p', 'M18 2c-1.7 0-3 2-3 5s1.3 5 3 5'], ['p', 'M18 12v10']],
  medkit: [['r', 3, 7, 18, 13, 2], ['p', 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2'], ['l', 12, 11, 12, 16], ['l', 9.5, 13.5, 14.5, 13.5]],
  sync: [['p', 'M20 12a8 8 0 1 0-2.3 5.6'], ['pl', '20 4 20 9 15 9']],
  pin: [['p', 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z'], ['c', 12, 10, 3]],
  navigate: [['p', 'M3 11l19-9-9 19-2-8-8-2z']],
  phone: [['p', 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z']],
  hospital: [['p', 'M3 21h18M5 21V7l7-4 7 4v14M10 9h4M10 13h4M10 17h4']],
  blood: [['p', 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z']],
  alert: [['p', 'M12 9v4M12 17h0.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z']],
  bandage: [['p', 'M14.5 3.5 20.5 9.5 9.5 20.5 3.5 14.5z'], ['p', 'M9 9l6 6']],
  person: [['p', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'], ['c', 12, 7, 4]],
  heart: [['p', 'M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 5a5 5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9z']],
  bag: [['p', 'M6 8h12a1 1 0 0 1 1 1l.7 10a1 1 0 0 1-1 1.1H5.3a1 1 0 0 1-1-1.1L5 9a1 1 0 0 1 1-1z'], ['p', 'M9 8V6a3 3 0 0 1 6 0v2']],
  document: [['p', 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'], ['pl', '14 3 14 8 19 8'], ['l', 9, 13, 15, 13], ['l', 9, 17, 13, 17]],
  star: [['p', 'M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1L12 3z']],
  bulb: [['p', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z']],
  ear: [['p', 'M12 2a7 7 0 0 0-4 12.7V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.3A7 7 0 0 0 12 2z'], ['l', 9, 22, 15, 22]],
  medical: [['p', 'M12 2a7 7 0 0 0-4 12.7V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.3A7 7 0 0 0 12 2z']],
  eye: [['p', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z'], ['c', 12, 12, 3]],
  'eye-off': [['p', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z'], ['c', 12, 12, 3], ['l', 3, 3, 21, 21]],
  check: [['pl', '20 6 9 17 4 12']],
  images: [['r', 3, 3, 18, 18, 2], ['c', 8.5, 8.5, 1.5], ['p', 'M21 15l-5-5L5 21']],
  mail: [['r', 3, 5, 18, 14, 2], ['pl', '3 7 12 13 21 7']],
  lock: [['r', 4, 11, 16, 10, 2], ['p', 'M8 11V7a4 4 0 0 1 8 0v4']],
  download: [['p', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'], ['pl', '7 10 12 15 17 10'], ['l', 12, 15, 12, 3]],
  'arrow-right': [['l', 5, 12, 19, 12], ['pl', '13 6 19 12 13 18']],
  globe: [['c', 12, 12, 10], ['l', 2, 12, 22, 12], ['p', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z']],
  gift: [['p', 'M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z']],
  sliders: [['l', 4, 7, 13, 7], ['l', 17, 7, 20, 7], ['c', 15, 7, 2], ['l', 4, 17, 9, 17], ['l', 13, 17, 20, 17], ['c', 11, 17, 2]],
  external: [['p', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'], ['pl', '15 3 21 3 21 9'], ['l', 10, 14, 21, 3]],
  'gender-girl': [['p', 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 13v8M9 18h6']],
  'gender-boy': [['p', 'M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM10 14l8-8M14 4h4v4']],
  'gender-unisex': [['p', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 16v6M9 19h6M12 8 17 3M14 3h3v3']],
  'verdict-safe': [['c', 12, 12, 10], ['p', 'M8 12.5l2.5 2.5 5-5']],
  'verdict-caution': [['c', 12, 12, 10], ['p', 'M12 7.5v5'], ['l', 12, 16, 12.01, 16]],
  'verdict-avoid': [['c', 12, 12, 10], ['p', 'M15 9l-6 6'], ['p', 'M9 9l6 6']],
};

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number; fill?: boolean };

export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 2, fill = false }: Props) {
  const els = G[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {els.map((el, i) => {
        switch (el[0]) {
          case 'p': return <Path key={i} d={el[1]} />;
          case 'c': return <Circle key={i} cx={el[1]} cy={el[2]} r={el[3]} />;
          case 'l': return <Line key={i} x1={el[1]} y1={el[2]} x2={el[3]} y2={el[4]} />;
          case 'pl': return <Polyline key={i} points={el[1]} />;
          case 'pg': return <Polygon key={i} points={el[1]} />;
          case 'r': return <Rect key={i} x={el[1]} y={el[2]} width={el[3]} height={el[4]} rx={el[5] ?? 0} />;
          case 'e': return <Ellipse key={i} cx={el[1]} cy={el[2]} rx={el[3]} ry={el[4]} />;
          case 'pr': return <Rect key={i} x={el[1]} y={el[2]} width={el[3]} height={el[4]} rx={el[5]} rotation={el[6]} origin={`${el[7]}, 13.5`} />;
          default: return null;
        }
      })}
    </Svg>
  );
}

// ── Backwards-compatible named exports (dock + shared headers) ──
type IP = { size?: number; color?: string; strokeWidth?: number; filled?: boolean };
const make = (name: IconName) => {
  const Glyph = ({ size, color, strokeWidth, filled }: IP): ReactElement =>
    <Icon name={name} size={size} color={color} strokeWidth={strokeWidth} fill={filled} />;
  Glyph.displayName = `Icon(${name})`;
  return Glyph;
};

export const HomeIcon = make('home');
export const HealthIcon = make('activity');
export const JournalIcon = make('book');
export const PrepareIcon = make('clipboard');
export const BellIcon = make('bell');
export const GearIcon = make('gear');
export const ChevronLeftIcon = make('chevron-left');
export const ChevronRightIcon = make('chevron-right');
export const PlusIcon = make('plus');
export const PencilIcon = make('pencil');
