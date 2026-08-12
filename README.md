# BumpJourney

A pregnancy companion app for Android, built with React Native and Expo. BumpJourney tracks your pregnancy week by week and bundles the practical tools — kick counter, contraction timer, medications, appointments, journal, birth plan — into one app instead of five.

**Current version:** 1.2.0 · Expo SDK 57 · React Native 0.86 · package `com.bumpjourney.app`

---

## Features

### Home

- **Progress ring** showing the current week and day, driven by standard obstetric math (280 days from LMP).
- **Baby size** comparison and **week-by-week content** — what's developing, what movement to expect, and what's happening to your body — written for every week from 4 to 42.
- **Day strip** for jumping between recent days, with that day's logged symptoms and medications.
- **Milestones** for the notable weeks, plus tailored tips when you're carrying multiples.
- Inline **symptom tracker** and **today's medications** checklist.

### Health

| Tool | What it does |
| --- | --- |
| Kick counter | Times a session and counts baby's movements |
| Contraction timer | Records length and frequency, with running averages |
| Appointments | Visits, scans and tests, with reminder notifications |
| Medications | Supplements and prescriptions, with per-dose logging and reminders |
| Food safety | Searchable list of what's safe to eat during pregnancy |
| Water tracker | Daily hydration goal |

There's also an **emergency info** screen for the details you'd want on hand quickly.

Kick and contraction sessions are written through an **offline queue** — if a session is logged without a connection it's held in `AsyncStorage` and uploaded on the next app focus. The queue serializes its mutations onto a single promise chain, because concurrent read-modify-write cycles would otherwise duplicate or silently drop sessions.

### Journal

Free-form entries tagged with the pregnancy week and your mood, with **week-appropriate writing prompts** suggested for each entry.

### Prepare

- **Baby names** — browse a built-in list and build a shortlist.
- **Hospital bag** — checklist for the big day.
- **Birth plan** — record your preferences and **export to PDF** to share with your care team or print.

### Throughout

- **Photos** — a bump photo timeline, stored in Supabase Storage.
- **Multiples support** — up to 4 babies, each with its own name and sex, throughout the app.
- **Light / dark / system theming**, drawn edge-to-edge.
- **Local notifications** for appointment and medication reminders, on dedicated Android channels.
- **Over-the-air updates** via `expo-updates`, with `runtimeVersion` pinned to the app version so a JS update can never land on an incompatible native build.

---

## Tech stack

- **[Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)** / React Native 0.86 / React 19.2
- **expo-router** for file-based routing, with typed routes and the React Compiler enabled
- **Supabase** for auth, Postgres, and Storage
- **TypeScript**, ESLint (`eslint-config-expo`), Prettier
- `react-native-svg` and `expo-linear-gradient` for the visual system; Fredoka + Quicksand via `@expo-google-fonts`

---

## Project structure

```
app/                   # expo-router routes — every screen is a file
  _layout.tsx          # fonts, session bootstrap, auth gating, theme provider
  (tabs)/              # Home · Health · Journal · Prepare
  *.tsx                # stack screens (kick-counter, medications, settings, …)
components/            # shared UI (Card, TabHeader, ConfirmDialog, Icons, …)
hooks/usePregnancy.ts  # loads the active pregnancy, derives week/trimester
lib/
  supabase.ts          # client
  pregnancy.ts         # due-date math for all four entry methods
  dates.ts             # day-boundary helpers
  healthSync.ts        # offline queue for kick/contraction sessions
  notifications.ts     # permissions + Android channels
  theme.ts             # palette, typography, shadows
  ThemeContext.tsx     # light/dark/system preference
  weeklyContent.ts     # week 4–42 editorial content
  babySizes.ts  babyNames.ts  foodSafety.ts  milestones.ts  symptoms.ts
```

Routing and auth are gated in `app/_layout.tsx`: the native splash is held until fonts, the Supabase session, and the first-run flag have all resolved, so the first painted frame is the correct screen at the correct theme.

---

## Backend

Supabase Postgres, one project per environment. Tables in use:

`pregnancies` · `journal_entries` · `kick_sessions` · `contraction_sessions` · `appointments` · `medications` · `medication_logs` · `symptom_logs` · `water_logs` · `photos` · `name_favorites` · `emergency_info` · `prep_data`

Plus a `photos` Storage bucket for bump photos.

`prep_data` is a general key/value table holding jsonb payloads (hospital bag, birth plan, pregnancy details), which lets those features evolve without a migration — `lib/babies.ts`, for example, transparently upgrades the legacy single-baby shape to the multiples shape on read.

> **Note:** the schema, RLS policies, and migrations are **not** in this repo — they live only in the Supabase project. Cloning this repo alone is not enough to stand up a working backend. The Supabase URL and publishable key are committed in `lib/supabase.ts`; that key is designed to be shipped in clients and is safe to expose, but it means **row-level security is the only thing protecting user data**.

---

## Getting started

Requires Node 20+ and an Android device or emulator.

```bash
npm install
```

```bash
npx expo start
```

`.npmrc` sets `legacy-peer-deps=true`. This is required: `@react-native-community/datetimepicker` declares an optional `react-native-windows` peer that npm's strict resolver rejects. EAS Build needs it too.

**Expo Go is not sufficient for the full app.** Google Sign-In is a native module and is loaded lazily so the login screen still renders under Expo Go, but the sign-in itself will fail with a clear message. Use a development build to exercise auth, notifications, and updates.

### Scripts

| Command | |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run android` | Dev server, opening on Android |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npx tsc --noEmit` | Type check |

---

## Building and releasing

EAS profiles are defined in `eas.json`: `development` (dev client), `preview` (internal APK), and `production` (store AAB, auto-incrementing, `production` channel).

```bash
eas build --platform android --profile production
```

Shipping a JS-only change over the air:

```bash
eas update --branch production --environment production
```

`--environment` became mandatory in SDK 55. Because `runtimeVersion` follows `appVersion`, an update published for 1.2.0 will never be delivered to a device running 1.1.0 — bump the app version whenever the native runtime changes.

Native `android/` and `ios/` directories are gitignored and regenerated by `npx expo prebuild`. Note that `app.json` has no iOS bundle identifier — iOS is not configured for building; Android is the shipping target.

---

## Status

In closed testing on Google Play. SDK 57 (1.2.0) is built and validated — expo-doctor clean, type-check clean, signed AAB produced — but has not yet been device-tested against the SDK 54 build testers are currently running.

Known rough edges:

- `expo lint` reports 8 pre-existing `react-hooks/set-state-in-effect` errors, newly enforced by `eslint-config-expo` 57.
- No automated tests.
- The Android upload keystore is managed remotely by EAS and is not stored in this repo — losing access to the Expo account means losing the ability to update the Play listing.
