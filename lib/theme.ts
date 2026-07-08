// ─────────────────────────────────────────────────────────────────────────
// "Lumi" design system — BumpJourney
// Display: Fredoka · Interface/body: Quicksand
// Accent: Rosy (#E5588A / #B83E66) on a cool canvas.
//
// Colors are scheme-dependent: read them through `useTheme()` /
// `useThemedStyles()` from lib/ThemeContext, never by importing a palette
// directly. Fonts, radii, and spacing are scheme-independent.
// ─────────────────────────────────────────────────────────────────────────

export type Scheme = 'light' | 'dark';

const light = {
  // Lets a StyleSheet factory reach scheme-dependent non-color tokens, e.g.
  // `...shadowFor(c.scheme).card`, without threading a second argument.
  scheme: 'light' as Scheme,

  // Accent — Lumi "Rosy"
  accent: '#E5588A',       // accent as FOREGROUND: text, icons, rings on the canvas
  accentFill: '#E5588A',   // accent as BACKGROUND: solid fills carrying `onAccent` text
  accentDeep: '#B83E66',   // gradient end, emphasis
  accentSoft: '#FAE3EA',   // icon circles, soft cards
  accentRgb: '229,88,138',
  petal: '#F2E2E9',        // hairline borders / progress tracks
  chipBg: '#FBF7F9',       // chip / very-light surface

  // Neutrals
  onAccent: '#FFFFFF',     // text/icons sitting ON the accent gradient — always white
  surface: '#FFFFFF',      // cards, sheets, dialogs
  canvas: '#F5F4F8',       // screen background
  ink: '#3A1626',          // headings
  body: '#8A7680',         // body grey (dock inactive, captions)
  muted: '#9A8390',        // muted labels / subtitles
  faint: '#B7A7AE',        // faint / disclaimer text
  border: '#F2E2E9',
  cardBorder: '#F2E2E9',

  // Neutral (non-accent) button / muted body copy on a card
  subtleBg: '#F4ECEF',
  subtleText: '#6E5560',

  // Structural hairlines: radio + checkbox borders, dashed borders, orbit rings,
  // pagination dots. Stronger than `cardBorder`, not a text color.
  outline: '#E3D2DA',
  // Unfilled indicator glyphs — empty heart, empty water glass. Non-text UI,
  // held at >=3:1 against the canvas.
  inactive: '#D8CDD4',
  // Destructive text — "Remove", "Delete account", the food-safety Avoid verdict.
  danger: '#C0504A',

  // Chrome
  scrim: 'rgba(58,22,38,0.45)',      // modal backdrops
  dock: 'rgba(255,255,255,0.92)',    // floating tab dock

  // Status (safe / caution / avoid)
  safeBg: '#EAF3E4', safeText: '#4F7D4F',
  cautionBg: '#FAF0DA', cautionText: '#B0791E',
  avoidBg: '#FBE9E7', avoidText: '#B5544E',

  // Water accent (kept for the water tracker)
  water: '#378ADD', waterBg: '#E6F1FB', waterDeep: '#185FA5',
};

// Dark is a re-derivation, not an inversion. The canvas carries the same cool
// purple cast as the light ink (#3A1626), the accent is lifted ~10% so it still
// clears 4.5:1 as text on the dark canvas, and `accentSoft` becomes a dark rose
// tint rather than a pale one. `onAccent` stays white in both schemes because
// the accent gradient itself does not change.
const dark: typeof light = {
  scheme: 'dark',

  // `accent` is lifted so it clears 4.5:1 as text on the dark canvas. That lift
  // would *reduce* contrast for white text sitting on top of it, so solid accent
  // fills keep the light-scheme value — same as the gradient, which never changes.
  accent: '#EF6E99',
  accentFill: '#E5588A',
  accentDeep: '#C4547E',
  accentSoft: '#332030',
  accentRgb: '239,110,153',
  petal: '#332B38',
  chipBg: '#241F2B',

  onAccent: '#FFFFFF',
  surface: '#1C1823',
  canvas: '#14111A',
  ink: '#F4EEF1',
  body: '#B6A7B1',
  muted: '#9C8C97',
  faint: '#907F8D',   // clears 4.5:1 on both canvas and surface; #877784 did not
  border: '#332B38',
  cardBorder: '#2C2532',

  subtleBg: '#2A2431',
  subtleText: '#C9BAC3',

  outline: '#453C50',
  inactive: '#736579',   // 3.21:1 on surface — the 3:1 floor for non-text UI
  danger: '#E8897F',     // #C0504A only reaches 3.73:1 on the dark surface

  scrim: 'rgba(0,0,0,0.62)',
  dock: 'rgba(28,24,35,0.92)',

  safeBg: '#1E2C1E', safeText: '#8FCE8F',
  cautionBg: '#332A16', cautionText: '#E0B457',
  avoidBg: '#33211F', avoidText: '#E88C84',

  water: '#5AA3EE', waterBg: '#17273A', waterDeep: '#8FC4F5',
};

export type Colors = typeof light;

// The accent gradient is deliberately identical in both schemes: it is its own
// surface, and `onAccent` white text keeps the same contrast against it either
// way. Deepening it for dark would only make that white text harder to read.
const HERO = ['#E5588A', '#B83E66'] as const;

export type Gradients = { hero: readonly [string, string]; accent: readonly [string, string] };

const gradients: Record<Scheme, Gradients> = {
  light: { hero: HERO, accent: HERO },
  dark: { hero: HERO, accent: HERO },
};

export type Shadows = {
  card: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
  accent: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
};

// On dark, a soft ink shadow is invisible — cards separate via `cardBorder`
// instead, so the shadow only has to sink the card slightly rather than lift it.
const shadows: Record<Scheme, Shadows> = {
  light: {
    card: { shadowColor: '#3A1626', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 3 },
    accent: { shadowColor: '#E5588A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 22, elevation: 6 },
  },
  dark: {
    card: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 3 },
    accent: { shadowColor: '#E5588A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.38, shadowRadius: 22, elevation: 6 },
  },
};

export const palettes: Record<Scheme, Colors> = { light, dark };
export const gradientFor = (s: Scheme): Gradients => gradients[s];
export const shadowFor = (s: Scheme): Shadows => shadows[s];

// ── Scheme-independent tokens ────────────────────────────────────────────

export const fonts = {
  // Display — Fredoka (headings, big numbers, buttons)
  display: 'Fredoka_500Medium',
  displaySemi: 'Fredoka_600SemiBold',
  displayBold: 'Fredoka_700Bold',
  displayReg: 'Fredoka_400Regular',
  // Interface / body — Quicksand
  body4: 'Quicksand_400Regular',
  body5: 'Quicksand_500Medium',
  body6: 'Quicksand_600SemiBold',
  body7: 'Quicksand_700Bold',
};

export const radius = {
  tile: 18,      // cards / tiles ("Soft")
  card: 18,
  cta: 16,       // primary buttons
  dock: 24,      // floating dock
  button: 100,   // pill
  pill: 100,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Note: there is deliberately no module-scope `colors` export. Colors are only
// reachable through `useTheme()` / `useThemedStyles()`, so a style can never
// capture one scheme's palette at import time.
