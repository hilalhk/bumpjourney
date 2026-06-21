// ─────────────────────────────────────────────────────────────────────────
// "Lumi" design system — BumpJourney redesign
// Display: Fredoka · Interface/body: Quicksand
// Accent: Rosy (#E5588A / #B83E66) on a cool canvas (#F5F4F8)
// ─────────────────────────────────────────────────────────────────────────

export const colors = {
  // Accent — Lumi "Rosy"
  accent: '#E5588A',       // rings, active, primary actions
  accentDeep: '#B83E66',   // gradient end, emphasis
  accentSoft: '#FAE3EA',   // icon circles, soft cards
  accentRgb: '229,88,138',
  petal: '#F2E2E9',        // hairline borders / progress tracks
  chipBg: '#FBF7F9',       // chip / very-light surface

  // Neutrals
  white: '#FFFFFF',
  surface: '#FFFFFF',
  canvas: '#F5F4F8',
  ink: '#3A1626',          // headings
  body: '#8A7680',         // body grey (dock inactive, captions)
  muted: '#9A8390',        // muted labels / subtitles
  faint: '#B7A7AE',        // faint / disclaimer text
  border: '#F2E2E9',
  cardBorder: '#F2E2E9',

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
  body: { fontFamily: fonts.body5, fontSize: 14, color: colors.body },
  small: { fontFamily: fonts.body5, fontSize: 12, color: colors.muted },
  label: { fontFamily: fonts.body6, fontSize: 11, color: colors.muted, letterSpacing: 0.8 },
};
