# Whiskr

Cozy, premium cat-feeding companion built with Expo, React Native, TypeScript, SQLite, and local-first data.

## Current Status

This is a work-in-progress MVP. The core local app loop is now usable:

- Onboarding collects cat profile details, estimates daily calories, lets the user pick food, builds a starting meal schedule, and optionally schedules reminders.
- Today shows the active cat, calorie progress, next meal, and one-tap meal logging.
- Feeding plans support 2, 3, 4, or Grazer mode, up to 2 foods, editable meal times, and notification rescheduling.
- Foods includes search/filter, detail screens, and custom food creation from label data.
- History shows recent events and a 7-day average chart.
- Settings includes units, theme, notification toggle, Pro placeholder, disclaimer, and PDF vet summary export.
- Data is stored on-device in SQLite. There is no backend in the MVP.

## Prerequisites

- Node.js `>=20.19.4` is recommended. The installed React Native, Metro, Vite, and Vitest toolchain warns or fails on older Node 20 builds.
- npm
- Expo Go for fastest device testing, or a development build if native module behavior diverges.
- Maestro CLI for E2E tests: https://maestro.mobile.dev

## Install

```bash
npm install
```

If Vitest fails on Windows with a missing `@rolldown/binding-win32-x64-msvc` package, use Node `>=20.19.4`, reinstall dependencies, then rerun tests. In this Codex session, unit tests passed with the bundled Node `24.14.0` runtime.

## Run The App

```bash
npm start          # Expo Metro
npm run ios        # iOS Simulator, requires Xcode/macOS
npm run android    # Android Emulator
npm run web        # Expo web
```

For real-device iteration, run `npm start` and scan the QR code in Expo Go.

## Validation

```bash
npm run typecheck
npm test
npm run e2e:maestro
```

Notes:

- `npm test` runs Vitest unit tests for the pure domain layer.
- `npm run e2e:maestro` expects a built/running app with app id `com.whiskr.app` and the Maestro CLI installed.
- Maestro is not installed in this workspace by default, so E2E flows are committed but were not executed here.

## Architecture

```text
app/                      Expo Router routes
  (onboarding)/           profile, calorie reveal, food pick, schedule, reminder opt-in
  (tabs)/                 today, foods, history, settings
  cat/[id]/plan.tsx       feeding plan editor
  food/[id].tsx           food detail
  food/new.tsx            custom food form
src/
  domain/                 pure TS: calories, portions, schedule, plan drafts, history
  db/                     SQLite schema, repositories, food seed
  state/                  Zustand stores
  services/               notifications, haptics, plan persistence, vet PDF export
  theme/                  colors, typography, motion, spacing
  components/             primitives and feature components
tests/unit/               Vitest domain tests
.maestro/                 Maestro E2E smoke flow
```

## Important Product Rules

- Metric units are canonical in storage and domain logic.
- Display units are resolved in the UI layer from locale or the Settings override.
- Calorie estimates are guidance, not veterinary advice. Keep the disclaimer visible anywhere calorie targets are explained or exported.
- Feeding math should stay pure and heavily tested. UI and persistence should call domain helpers rather than duplicating formulas.
- Local notifications must be tested on real devices before beta.

## Remaining Launch Work

- Expand curated foods from 30 seed SKUs toward the 150-250 SKU target, with source verification dates.
- Build cat profile view/edit/delete, including safe handling when deleting the only cat.
- Add a more polished split-slider/draggable timeline experience for feeding plans.
- Add edit/delete history actions.
- Finish notification action handling for Fed, Snooze, and Skip from notification responses.
- Add component/integration tests around picker, timeline, notification scheduling, and repository flows.
- Run Maestro on iOS and Android in CI or EAS workflow.
- Complete privacy policy, terms, store screenshots/copy, TestFlight/Play beta setup, and manual device QA.
