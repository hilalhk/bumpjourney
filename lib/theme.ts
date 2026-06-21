// ─────────────────────────────────────────────────────────────────────────
// "Lumi" design system — BumpJourney redesign
// Display: Fredoka · Interface/body: Quicksand
// Accent: Rosy (#E5588A / #B83E66) on a cool canvas (#F5F4F8)
//
// Existing export NAMES are preserved so screens keep compiling while they are
// migrated; their VALUES now point at the Lumi palette. New explicit tokens
// (accent*, ink, surface, …) are the ones to prefer in fresh code.
// ─────────────────────────────────────────────────────────────────────────

export const colors = {
  // Brand / accent — Lumi "Rosy"
  primary: '#E5588A',      // accent (rings, active, primary actions)
  primaryDeep: '#B83E66',  // accent deep (gradient end, emphasis)
  deepRose: '#B83E66',     // secondary accent → maps to accent deep
  wine: '#3A1626',         // headings / big numbers (ink)
  blush: '#FAE3EA',        // accent-soft (icon circles, soft cards)
  blushLight: '#FBF7F9',   // chip / very-light surface
  petal: '#F2E2E9',        // hairline borders / progress tracks

  // Explicit Lumi accent handles (prefer these)
  accent: '#E5588A',
  accentDeep: '#B83E66',
  accentSoft: '#FAE3EA',
  accentRgb: '229,88,138',
  chipBg: '#FBF7F9',

  // Neutrals
  white: '#FFFFFF',
  surface: '#FFFFFF',
  appBg: '#F5F4F8',        // canvas
  canvas: '#F5F4F8',
  mist: '#F5F4F8',
  ink: '#3A1626',          // headings
  body: '#8A7680',         // body grey (dock inactive, captions)
  bodyGrey: '#8A7680',
  muted: '#9A8390',        // muted labels / subtitles
  faint: '#B7A7AE',        // faint / disclaimer text
  border: '#F2E2E9',
  cardBorder: '#F2E2E9',
  borderInput: '#F2E2E9',

  // Status (safe / caution / avoid)
  safeBg: '#EAF3E4', safeText: '#4F7D4F',
  cautionBg: '#FAF0DA', cautionText: '#B0791E',
  avoidBg: '#FBE9E7', avoidText: '#B5544E',

  // Water accent (kept for the water tracker)
  water: '#378ADD', waterBg: '#E6F1FB', waterDeep: '#185FA5',
};

export const gradient = {
  // 135° accent gradient used on hero ring, dock active, CTAs, gradient cards.
  hero: ['#E5588A', '#B83E66'] as const,
  accent: ['#E5588A', '#B83E66'] as const,
};

export const fonts = {
  // Display — Fredoka (headings, big numbers, buttons)
  serif: 'Fredoka_500Medium',
  serifBold: 'Fredoka_600SemiBold',
  sansBold: 'Fredoka_600SemiBold',
  sansExtra: 'Fredoka_700Bold',
  // Interface / body — Quicksand
  sans: 'Quicksand_400Regular',
  sansMed: 'Quicksand_500Medium',
  nunitoMed: 'Quicksand_500Medium',
  nunitoSemi: 'Quicksand_600SemiBold',
  rubik: 'Quicksand_400Regular',
  rubikMed: 'Quicksand_500Medium',

  // Explicit Lumi handles (prefer these)
  display: 'Fredoka_500Medium',
  displaySemi: 'Fredoka_600SemiBold',
  displayBold: 'Fredoka_700Bold',
  displayReg: 'Fredoka_400Regular',
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

export const shadow = {
  // Soft card shadow — rgba(58,22,38,0.05)
  card: {
    shadowColor: '#3A1626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  // Accent shadow for gradient buttons / active dock segment.
  accent: {
    shadowColor: '#E5588A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 6,
  },
};

// Reusable text styles
export const text = {
  h1: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  h3: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  body: { fontFamily: fonts.body5, fontSize: 14, color: colors.bodyGrey },
  small: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },
  label: { fontFamily: fonts.body6, fontSize: 11, color: colors.muted, letterSpacing: 0.8 },
};
