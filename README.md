# Whiskr

Cozy, premium cat-feeding companion — Expo + React Native + TypeScript.

## Run it

```bash
npm start          # metro
npm run ios        # iOS Simulator (Xcode required)
npm run android    # Android Emulator
```

For best results, run on a real device via the **Expo Go** app or a custom dev build (Expo Go won't work if native modules diverge — most here are Expo-supported, but Skia + MMKV are best on a dev build).

Build a dev client:

```bash
npx expo prebuild --clean
npx expo run:ios       # or run:android
```

## What's in the MVP (this session)

**Runnable vertical slice:**
- Onboarding (9 steps): name → photo → age → weight → sex/neutered → body condition → activity → calorie reveal w/ vet disclaimer → done.
- Today screen: progress ring (Skia), cat carousel, next-meal card with **Fed!** button, today's meal timeline.
- Feeding plan editor: meal style (2/3/4/Grazer) + food pick + schedule preview → saves plan + schedules local notifications.
- Foods: list with search & filter, food detail screen (nutrition, dry-matter protein).
- History: 14-day grouped list + 7-day sparkbar.
- Settings: units (auto/metric/imperial), theme (system/light/dark), reminders toggle, vet disclaimer.
- Multi-cat: carousel on Today + add-new flow (up to 3 in MVP).
- Local SQLite via Drizzle; 30 seeded food SKUs (Fancy Feast, Purina, Hill's, Royal Canin, Wellness, Tiki Cat, Orijen, etc.).

## What's not in yet (planned)

- Plan editor with dual-food split slider and draggable meal timeline.
- Custom food creation UI.
- Edit cat / delete cat screens.
- Export to vet (PDF) — domain logic exists; UI pending.
- Pro unlock (RevenueCat) — scaffolded in Settings; disabled.
- More illustrations; current UI uses typographic placeholders.
- i18n strings externalization.

## Scripts

```bash
npm test           # vitest run (pure domain logic)
npm run typecheck  # tsc --noEmit
```

## Architecture

```
app/                      # Expo Router routes
  (onboarding)/           # 9 screens
  (tabs)/                 # today / foods / history / settings
  cat/[id]/plan.tsx       # feeding plan editor
  food/[id].tsx           # food detail
src/
  domain/                 # pure TS: calories, portions, schedule, history
  db/                     # Drizzle schema, repositories, seed
  state/                  # zustand: settings, cats, onboarding
  theme/                  # tokens + ThemeProvider
  components/             # primitives + feature components
  services/               # notifications, haptics
  utils/                  # units conversion
tests/unit/               # 38 passing tests for the domain layer
```

All data is stored **on-device** (SQLite). No backend in MVP — matches the blueprint's local-first stance.

## The math

- **RER** = 70 × kg^0.75
- **MER** = RER × life-stage factor × activity/BCS adjustments
- Kitten <4mo: 2.5 · Kitten <12mo: 2.0 · Neutered adult: 1.2 · Intact adult: 1.4 · Senior: 1.1
- BCS 1–3: +0.2 · BCS 7–9: −0.2 (for weight loss targets)
- Activity low: −0.1 · high: +0.2 (adults only)

See `src/domain/calories.ts` for the full logic with rationale strings users see in the app.
