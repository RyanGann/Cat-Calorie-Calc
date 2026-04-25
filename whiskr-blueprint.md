# Whiskr — App Blueprint

A cozy, premium cat-feeding companion built with Expo + React Native + TypeScript.

---

## Confirmed decisions (from kickoff)

- **Monetization:** free base app + one-time **Pro unlock** (in-app purchase). Pro gates cross-device sync, unlimited cats, advanced insights, custom themes. No subscription.
- **Geography:** worldwide launch.
- **Units:** **metric is canonical** on disk and in domain logic (kg, g, kcal, ml). Display units are **locale-derived** (default imperial for en-US; metric elsewhere) with a user override in Settings. All conversion happens in a single display layer, never in domain code.
- **Team:** solo developer. Timeline below assumes solo, realistic pace (roughly double a small-team estimate): **~18–24 calendar weeks** to App Store MVP.
- **Illustrations:** AI-assisted + hand-refined for MVP; plan to commission an illustrator post-launch for a cohesive v2 set.
- **Name:** Whiskr (working).
- **Vet trust from day one:** medical disclaimer surfaced at onboarding and on every calorie-target screen; "Export to vet" (PDF summary of cat + plan + recent history) ships in MVP.

---

## 1. Product Summary

**Concept.** Whiskr is a cozy, premium cat-feeding companion. You tell it about your cat — age, weight, body condition, activity, spay/neuter status — and it tells you exactly how many calories and grams of *your specific food* to serve, splits that into a feeding schedule, and nudges you when it's time. A searchable database of canned and dry foods (Fancy Feast, Purina ONE, Tiki Cat, Hill's, Royal Canin, etc.) does the calorie math for you. Multi-cat households get per-cat plans and reminders. Everything works offline, on-device.

**Why it's useful & compelling.**
- Cat obesity sits near ~60% in the US (Association for Pet Obesity Prevention). Most owners free-feed dry food and guess portions. The gap between *"I love my cat"* and *"I know how much to feed"* is enormous.
- Existing apps are either clinical veterinary portals (ugly) or generic pet trackers (shallow). Nobody has shipped a *delightful* feeding-specific app.
- The math is genuinely non-trivial (RER/MER, kcal density varies 3× between wet and dry). Real utility, not a glorified timer.
- Cat owners respond strongly to charm and personality. Design becomes a differentiator, not a skin.

---

## 2. MVP Definition

### In v1 (ship this; nothing more)

1. Cat profile: name, photo, DOB, weight, sex, neutered, body condition (1–9), activity level; life stage auto-derived.
2. Calorie target: auto-calculated (RER × life-stage × BCS adjustment), editable with "why this number" explainer and medical disclaimer.
3. Food database: ~200 curated SKUs with kcal/kg, kcal/can, protein/fat/moisture. Search + filter (wet/dry, brand).
4. Feeding plan: pick 1–2 foods, app computes grams-per-meal split across N meals/day; supports "grazer mode" for free-feeders.
5. Local reminders: on-device notifications at scheduled meal times, with Fed/Snooze/Skip actions.
6. Log a meal: one-tap "Fed!" on Today, logs to history.
7. Today view (home): next meal, progress ring (kcal fed / target), pet photo.
8. Multi-cat: up to 3 cats (switcher, not separate accounts).
9. History: last 14 days of meals.
10. Settings: units (auto/metric/imperial), notifications, theme, data export.
11. **Export to vet**: PDF or plain-text summary (cat profile, current plan, last 30 days of feedings).
12. Locale-aware unit display (kg/g vs lb/oz; ml vs fl oz).

### Deferred

- Cloud accounts, cross-device sync, household sharing → **Pro, Phase 3**.
- Weight tracking chart with trendlines → v2 (easy win; add the table now).
- Barcode scanning for foods → v2.
- Apple Watch / home-screen widgets → v3.
- Treat tracker / daily treat budget → v2.
- Water intake, litter tracking, medication → **never** (wrong app).
- Social / sharing / community → never.
- AI label OCR from photos → v3 (interesting, high failure rate).

---

## 3. Core User Flows

### a. First-time onboarding (target: under 90s, conversational, not formy)

1. Warm welcome screen with animated cat illustration.
2. *"What should we call your cat?"* → text input.
3. Photo: camera / library / skip (skip → cute default avatar).
4. Birthday or approximate age (month granularity; "don't know" → assume adult).
5. Weight (with coaching illustration: weigh yourself → weigh holding cat → subtract). Units follow locale.
6. Sex + neutered toggle.
7. **Body condition score** — visual 1–9 illustrated cats, tap to select. Signature moment.
8. Activity level, plain language: *"Couch loaf" / "Plays a few times a day" / "Zoomies champion"*.
9. App computes calorie target → celebratory reveal (*"Mochi needs **212 kcal/day**"*) with "how we calculated this" drawer and a one-line vet disclaimer.
10. Pick food(s) → search or "I'll do this later".
11. Feeding schedule: meals/day (2/3/4 or Grazer). Draggable times on a timeline.
12. **Notification permission prompt** — framed as *"Want us to remind you?"*, asked **after** they've invested in setup (much better conversion).
13. Land on Today with a gentle confetti microinteraction.

### b. Daily use

- Open app → Today → see next meal + progress ring.
- Notification fires → tap → opens Today with **Fed!** primed → one tap logs → ring fills → haptic + spring animation.
- Pull down on Today → log an off-schedule snack/treat.

### c. Food lookup

- Foods tab → search (*"fancy feast classic"*) → result cards with brand, wet/dry chip, kcal.
- Tap a food → detail screen with nutrition grid, ingredients summary, *"Add to [cat]'s plan"*.
- Not found → *"Add a custom food"* prefilled with the search term.

### d. Feeding schedule setup

- Cat profile → **Edit feeding plan**.
- Step 1: pick foods (max 2 in MVP).
- Step 2: split % (slider) if two foods chosen.
- Step 3: meals/day pill selector (2 / 3 / 4 / Grazer).
- Step 4: meal times as draggable chips on a 24h timeline with sunrise/sunset gradient.
- App shows per-meal grams plus a visual portion cue (*"about ½ of a 3 oz can"*).
- Save → local notifications scheduled.

### e. Reminder flow

- Local notifications fire at meal times: *"Time to feed Mochi: 28g of Orijen Cat & Kitten."*
- Tap → deep-link to Today with Fed! primed.
- Notification actions: **Fed / Snooze 15m / Skip**.

### f. Multi-cat flow

- Top of Today: horizontal avatar carousel; tap to switch active cat.
- **All cats** view: combined next-meal list sorted by time.
- Each cat has an independent plan, schedule, and history. No shared state by design.

---

## 4. Screen-by-Screen App Map

### 4.1 Splash / Launch
- **Purpose:** first-run routing (onboarding vs. Today).
- **UI:** animated logo (cat silhouette with subtle breathing).
- **Actions:** none (auto-transitions).
- **Design:** ≤400ms, Reanimated spring. No spinner.
- **Edge cases:** cold start with no cats → onboarding; DB migration pending → brief "getting ready" state.

### 4.2 Onboarding (multi-step)
- **Purpose:** collect cat info, compute plan, set schedule.
- **UI:** single question per screen, progress dots on top, back/next, oversized thumb-reachable inputs, illustration per step.
- **Actions:** continue, back, skip (where allowed).
- **Design:** horizontal slide transitions; BCS screen is a horizontally snapped card stack of illustrated cats.
- **Edge cases:** camera/photo permission denied → skip gracefully; implausible weight (>15 kg or <0.5 kg) → soft warning, don't block.

### 4.3 Today (home)
- **Purpose:** the screen users open 3× a day.
- **UI:**
  - Top: cat avatar carousel + greeting (*"Good morning, Mochi"*).
  - Center: large circular progress ring (kcal fed / target) with cat photo inside.
  - Next-meal card: time, food, portion, **Fed!** primary button.
  - Below: timeline of today's meals (dots, filled as fed).
  - Pull-down: log a treat or off-schedule meal.
- **Actions:** log meal, switch cat, open meal detail.
- **Design:** ring fills with a springy Reanimated animation; haptic on log; confetti dots on finishing the day.
- **Edge cases:** past-due meal → *"Was 30 min ago — still feed?"*; zero meals planned → empty state pointing to plan setup; no food picked → guided CTA.

### 4.4 Cat Profile
- **Purpose:** manage a cat's info + plan.
- **UI:** hero photo, stats row (weight, age, BCS), feeding plan summary card, "Edit plan" CTA, weight history preview (stub in v1).
- **Actions:** edit info, edit plan, **Export to vet**, delete cat (confirm modal).
- **Design:** hero has parallax scroll; stats animate in on mount.
- **Edge cases:** deleting the only cat → route back to onboarding, not a broken empty Today.

### 4.5 Foods (library)
- **Purpose:** browse + search foods.
- **UI:** sticky search, filter chips (Wet / Dry / Treat / Brand), list of food cards (brand logo, name, wet/dry tag, kcal).
- **Actions:** search, filter, tap → detail, **+ custom food**.
- **Design:** FlashList for perf; brand logos cached locally; gentle skeletons on first mount.
- **Edge cases:** no results → *"Don't see it? Add a custom food"* with search term prefilled.

### 4.6 Food Detail
- **Purpose:** inspect a food, add it to a cat's plan.
- **UI:** hero (brand-color gradient + product image), nutrition grid (kcal, protein, fat, moisture, carbs derived), serving size, *"Add to [cat]'s plan"* CTA.
- **Actions:** add to plan, favorite, **report incorrect data**.
- **Design:** animated number counters; brand color drives gradient.
- **Edge cases:** stale/missing data → *"Data last verified [date]"* footer; user-added custom food → badge + edit.

### 4.7 Feeding Plan Editor
- **Purpose:** define what and when a cat eats.
- **UI:**
  - Step 1: pick foods (max 2 in MVP).
  - Step 2: split % slider (if 2 foods).
  - Step 3: meals/day pill selector (2/3/4/Grazer).
  - Step 4: meal times as draggable chips on a 24h timeline with sunrise/sunset gradient background.
- **Actions:** save, cancel.
- **Design:** the timeline is the distinctive flourish; chips haptic-snap to 15-minute grid.
- **Edge cases:** two meals <2h apart → soft warn; midnight-crossing schedule → handled in domain; food missing kcal/g → block save with helpful message.

### 4.8 History
- **Purpose:** see what/when the cat ate.
- **UI:** grouped list by day; each row: time + food + portion + ✓/⚠ icon. Top: 7-day kcal average vs target (mini bar chart).
- **Actions:** edit entry, delete entry.
- **Design:** Skia/Victory bar chart; swipe-to-delete; "on track" vs "over" coloring.
- **Edge cases:** empty history → illustrated empty state.

### 4.9 Settings
- **Purpose:** preferences + housekeeping.
- **UI:** grouped list — units (Auto/Metric/Imperial), notifications, theme (System/Light/Dark/Seasonal), data export, vet disclaimer, about, **Unlock Pro**.
- **Actions:** standard; purchase / restore Pro.
- **Design:** bespoke grouped list; theme picker shows live preview swatches.
- **Edge cases:** notifications disabled at OS → inline banner with deep-link to OS settings; unit change instantly re-renders all portion displays.

### 4.10 Add Custom Food
- **Purpose:** user-entered food.
- **UI:** form — name, brand, type (wet/dry/treat), kcal/can or kcal/kg, can size, ingredients (optional).
- **Actions:** save, cancel.
- **Design:** helper text on kcal input (*"Look for 'calorie content' on the label, usually in kcal/kg or kcal/can"*).
- **Edge cases:** duplicate of curated food → soft suggestion; incomplete nutrition → save with warning.

### 4.11 Export to Vet
- **Purpose:** shareable summary for vet visits.
- **UI:** preview of the PDF (cat info, current plan, last 30 days of feedings with kcal totals).
- **Actions:** share via system share sheet (save PDF / email / AirDrop).
- **Design:** clean typographic PDF; no gimmicks; Whiskr wordmark footer.
- **Edge cases:** brand-new cat with no history → PDF still generates with plan only and a note explaining the gap.

### 4.12 Paywall (Pro)
- **Purpose:** one-time Pro unlock.
- **UI:** short value list (cross-device sync, unlimited cats, custom themes, advanced insights), single price, **Restore Purchase**.
- **Actions:** purchase, restore, close.
- **Design:** warm, not high-pressure. No countdowns, no FOMO patterns.
- **Edge cases:** offline / StoreKit unavailable → friendly retry; already-purchased → auto-restore on launch.

---

## 5. Data Model

SQLite via **Drizzle ORM** (type-safe, lightweight, works cleanly with expo-sqlite). All measurements stored in metric. Display-layer converts.

```ts
// cats
id            TEXT PK          // uuid
name          TEXT NOT NULL
photoUri      TEXT
sex           TEXT             // 'male' | 'female' | 'unknown'
neutered      INTEGER          // 0/1
birthDate     TEXT             // ISO date
weightKg      REAL NOT NULL
bodyCondition INTEGER          // 1-9, 5 = ideal
activityLevel TEXT             // 'low' | 'moderate' | 'high'
lifeStage     TEXT             // derived, cached: 'kitten'|'adult'|'senior'
mealGoalKcal  REAL             // computed and cached
createdAt     INTEGER
updatedAt     INTEGER
deletedAt     INTEGER          // soft delete

// foods (curated + user-added)
id             TEXT PK
source         TEXT             // 'curated' | 'custom'
brand          TEXT
name           TEXT NOT NULL
type           TEXT             // 'wet' | 'dry' | 'treat'
kcalPerKg      REAL             // canonical
kcalPerCan     REAL             // nullable (wet only)
canSizeG       REAL             // nullable
proteinPct     REAL
fatPct         REAL
moisturePct    REAL
fiberPct       REAL
ingredients    TEXT
barcode        TEXT
region         TEXT             // 'US'|'EU'|'UK'|'CA'|... (for locale filtering later)
lastVerifiedAt INTEGER
createdAt      INTEGER
updatedAt      INTEGER

// feeding_plans (one active per cat; older archived)
id             TEXT PK
catId          TEXT FK
isActive       INTEGER
mode           TEXT             // 'scheduled' | 'grazer'
mealsPerDay    INTEGER          // 2/3/4 when scheduled; null when grazer
createdAt      INTEGER

// feeding_plan_foods (join)
id             TEXT PK
planId         TEXT FK
foodId         TEXT FK
kcalSharePct   REAL             // e.g. 70 = 70%

// scheduled_meals (per-plan fixed times)
id             TEXT PK
planId         TEXT FK
timeOfDayMin   INTEGER          // 0-1439, local time
kcalTarget     REAL
notificationId TEXT             // expo-notifications id

// feeding_events (history / log)
id              TEXT PK
catId           TEXT FK
scheduledMealId TEXT             // nullable for off-schedule
foodId          TEXT FK
amountG         REAL
kcal            REAL
fedAt           INTEGER          // epoch ms UTC
status          TEXT             // 'fed' | 'skipped' | 'partial'
note            TEXT
createdAt       INTEGER

// weight_history (table exists in v1 for later chart)
id           TEXT PK
catId        TEXT FK
weightKg     REAL
measuredAt   INTEGER

// app_settings (single row, id always 1)
id             INTEGER PK
unitPref       TEXT              // 'auto' | 'metric' | 'imperial'
theme          TEXT              // 'system' | 'light' | 'dark' | 'seasonal'
remindersOn    INTEGER
hasOnboarded   INTEGER
proUnlocked    INTEGER
locale         TEXT              // cached BCP-47 tag for unit auto logic
schemaVersion  INTEGER
```

Indexes: `feeding_events(catId, fedAt)`, `foods(brand, name)`, `scheduled_meals(planId)`.

---

## 6. Domain Logic

Pure-TS modules in `src/domain/` — zero React, zero DB, zero units conversion. Easy to unit test.

### a. Calorie estimation (`domain/calories.ts`)

- `RER(kg) = 70 * (kg ** 0.75)` — standard resting energy requirement (WSAVA / NRC 2006).
- `MER = RER * factor`, where factor is:
  - Kitten 0–4 mo: 2.5
  - Kitten 4–12 mo: 2.0
  - Intact adult: 1.4–1.6
  - Neutered adult: 1.2–1.4
  - Indoor / low-activity neutered: 1.0–1.2
  - Senior (>11 y): 1.1
  - BCS 7–9 (overweight, weight loss target): 0.8 × RER of **target** weight
  - BCS 1–3 (underweight): 1.2–1.4 × RER of target weight
- Returns `{ kcal, confidence, rationale[] }`. The rationale drives the "why this number" drawer.
- Every output is flagged with a disclaimer: *"Not veterinary advice. Consult your vet."*

### b. Food portion conversion (`domain/portions.ts`)

- `kcalToGrams(kcal, food) = kcal / (food.kcalPerKg / 1000)`
- `kcalToCans(kcal, food) = kcal / food.kcalPerCan`
- Rounding: grams → nearest 1 g; cans → nearest ¼ can; cups → nearest ⅛ cup.
- `visualPortion(food, grams)` helper picks the most useful display: wet → fraction of can; dry → grams + *"≈ ⅓ cup"* secondary.
- Domain outputs grams; the display layer converts to ounces if the user's unit pref resolves to imperial.

### c. Feeding schedule generation (`domain/schedule.ts`)

- Input: `dailyKcal`, `mealsPerDay`, optional `foodSplit`. Output: `[{ timeOfDayMin, foodId, grams, kcal }]`.
- Default times:
  - 2 meals: 07:00, 18:00
  - 3 meals: 07:00, 13:00, 19:00
  - 4 meals: 07:00, 12:00, 17:00, 21:00
- Kcal distributed evenly by default; per-meal override in v2.
- Multi-food: per meal, split grams proportionally to `kcalSharePct`.
- Grazer mode: one "end-of-day" check-in notification; no fixed meals.

### d. Notification scheduling (`services/notifications.ts`)

- Wraps `expo-notifications` with `CalendarTrigger` for recurring local notifications (best DST/timezone behavior).
- On plan save: cancel prior scheduled notifications by id, schedule new daily repeating triggers per meal.
- Body template: *"Time to feed {catName}: {portionText} of {foodName}"* — portionText uses user's unit pref.
- Actionable categories: **Fed** / **Snooze 15m** / **Skip**.
- Subscribes to timezone-change events; reschedules on change.
- Self-diagnostic: if the app observes that a scheduled local notification didn't yield an open or a fed event within 4 hours, surface a gentle diagnostic card on Today (*"Didn't get a reminder at 7:00? Tap to check settings"*).

### e. History (`domain/history.ts`)

- `kcalFedToday(catId)` → sum of events since local midnight.
- `adherence7d(catId)` → % of scheduled meals fed in the last 7 days.
- `averageDailyKcal(catId, days)` → rolling average.
- `vetExportSummary(catId, days=30)` → structured object the PDF renderer consumes.

---

## 7. Food Data

**Recommendation: curated, not scraped.**

- Seed the app with a hand-curated JSON of ~150–250 top SKUs: Fancy Feast, Purina ONE, Purina Pro Plan, Friskies, Tiki Cat, Wellness, Blue Buffalo, Hill's Science Diet, Royal Canin, Iams, Meow Mix, Orijen, Stella & Chewy's, Weruva. Source from manufacturer spec sheets (kcal/kg and kcal/can are nearly always published).
- Since launch is worldwide, tag each SKU with a `region` (US, UK/EU, CA, AU). Show all by default; let users filter by region in Foods (v1.1).
- Bundle the JSON as a seed → copied into the SQLite foods table on first launch.
- Allow top user-added foods to surface back into the curated list by manual triage (Pro users can opt-in to contribute, optional post-launch).

**Normalization rules:**
- `kcalPerKg` is canonical — convert kcal/cup or kcal/can → kcal/kg using the product's stated serving size.
- Store macros **as-fed %** (not dry-matter). Compute dry-matter on the fly for display.
- Normalize brand names (*"Purina ONE"*, not *"PURINA ONE"* or *"Purina One"*).
- Store SKU variants as separate rows (Fancy Feast Classic Pâté Chicken vs Turkey — different products with different macros).

**Updates:**
- Ship the JSON inside each app release initially (simplest, safest).
- Phase 3: host versioned food DB on a CDN (Cloudflare R2 / S3) and hot-update on app start with `If-None-Match` + local version check. Still no backend server required.
- Do **not** scrape Chewy/Amazon/manufacturer sites — ToS issues, fragile, low quality. Open Pet Food Facts has limited cat coverage; OK as supplementary reference, not a source of truth.
- Custom user foods are first-class with `source = 'custom'` in the same table.

---

## 8. Tech Stack

### a. Frontend
- **Expo SDK 52+** with the New Architecture (Fabric + TurboModules) enabled from day 1.
- **Expo Router v4** (file-based, typed routes).
- **React Native Reanimated 3** + **Gesture Handler** — non-negotiable for the animation bar.
- **Moti** on top of Reanimated for declarative small animations.
- **React Native Skia** for the progress ring, custom charts, signature visuals.
- **expo-image** (not RN's Image — better caching and perf).
- **Shopify FlashList** for the foods list.
- **Custom design system** — no UI kit (NativeBase/Tamagui/Gluestack will fight the bespoke target). Build ~15 primitives yourself.

### b. State
- **Zustand** for global UI state (current cat, theme, Pro status) — 3 KB, no boilerplate.
- **Drizzle ORM + expo-sqlite** for persisted domain data, with a thin selectors layer.
- No TanStack Query for MVP (no network). Add it when the backend lands.

### c. Local persistence
- SQLite via `expo-sqlite` + Drizzle (cats, foods, plans, events, weight, settings).
- **MMKV** (`react-native-mmkv`) for tiny hot settings (theme, last-active catId) — faster than AsyncStorage.
- Curated food DB, illustrations, brand logos bundled in the app binary.

### d. Backend
- **No backend for MVP.** Everything runs on-device. A real product decision: fast, private, offline-first, ships sooner.
- Phase 3 (Pro cross-device sync): **Supabase** is the right call for a solo dev — Postgres + auth + storage with minimal ops. Row-level security keyed to `userId`; sync is straightforward because the local schema is authoritative.
- **RevenueCat** for IAP/Pro (Apple + Google combined, edge cases handled, restore flows built in). Integrate from MVP even though Pro ships later — cheap insurance.

### e. Notifications
- **expo-notifications**, local only. No push server, no APNs/FCM keys to manage in MVP.
- `CalendarTrigger` for recurring local notifications (DST + timezone safe).
- Actionable categories: Fed / Snooze 15m / Skip.
- Real-device QA across iOS + Android, DST transitions, timezone changes, low-power mode. This is the single flakiest part of cross-platform RN.

### f. Other
- **i18n-ready but English-only at launch.** Wire up `i18n-js` or `lingui` from day 1 with English strings so future localization is a translation job, not a rewrite. Worldwide launch in English is reasonable; it buys time to decide which locales actually warrant translation.
- **Sentry** (or Expo's built-in error reporting) for crash + error telemetry.
- **PostHog** (or similar) for product analytics — cheap to self-host, privacy-friendly.

### g. Folder structure

```
app/                        # Expo Router routes
  (onboarding)/
  (tabs)/
    today.tsx
    cats.tsx
    foods.tsx
    history.tsx
    settings.tsx
  cat/[id].tsx
  food/[id].tsx
  paywall.tsx
  _layout.tsx
src/
  components/
    primitives/             # Button, Card, Chip, Input, Sheet, Tabs…
    cats/                   # CatCarousel, BodyConditionPicker
    feeding/                # ProgressRing, MealTimeline, PortionDisplay
    foods/                  # FoodCard, NutritionGrid
  domain/                   # PURE TS — no React, no DB
    calories.ts
    portions.ts
    schedule.ts
    history.ts
    types.ts
  db/
    schema.ts
    client.ts
    migrations/
    seeds/
      foods.json
    repositories/           # cats.ts, foods.ts, events.ts
  services/
    notifications.ts
    haptics.ts
    analytics.ts
    iap.ts                  # RevenueCat wrapper
    pdf.ts                  # vet export
  state/                    # zustand stores
  theme/                    # colors, typography, spacing, motion tokens
  i18n/
  utils/
    units.ts                # metric ↔ imperial display conversions
  assets/
    illustrations/
    brand-logos/
    lottie/
tests/
  unit/
  components/
  e2e/                      # Maestro
```

---

## 9. UI/UX Direction

This is the section worth obsessing over. The differentiator is *feel*, not feature count.

### a. Visual direction

**"Cozy modern"** — think Arc Browser meets a bakery. Warm off-white canvas, rich but muted accent colors, generous whitespace, oversized rounded typography, one signature illustration style, tactile microinteractions. **Not** skeuomorphic, **not** brutalist, **not** glassmorphism. Specifically not a generic "cute pet app" (pastels + Comic Sans adjacent) — we want premium warmth.

Reference bar for polish: **Flighty** (density + polish), **Bear** (typography + calm), **Reflect Notes** (motion restraint), **Duolingo** (character without childishness).

Avoid: Zola pink, dashboardy iconography, generic Material cards.

### b. Style keywords

Warm. Tactile. Considered. Playful-but-grown-up. Confident whitespace. Rounded. Tucked-in. Illustrated.

### c. Component ideas

- **Progress ring** around the cat's photo on Today (kcal fed / target). Skia-drawn, springs in on update, gradient stroke.
- **Body condition picker** — horizontal snap-scroll of illustrated cats; the selected one breathes subtly.
- **Meal timeline** — 24 h band with a sunrise/sunset gradient; meal chips draggable with haptic snap.
- **Cat carousel** — large circular avatars with parallax on swipe; selected cat *"wakes up"* (eye-open animation).
- **"Fed!" button** — oversized, bouncy Reanimated press, small confetti-sprite burst on success.
- **Portion visualization** — small illustrated *"½ can"* or *"28 g"* icon, not just text.
- **Skeleton screens** — shaped like the final content, warm tone, never generic gray bars.

### d. Animation

Motion is purposeful, never decorative.

- Screen transitions: custom shared-element transition for the cat photo between Today → Cat profile.
- Progress ring: fills on meal log with a small overshoot spring.
- Numbers interpolate, don't snap.
- Onboarding: gentle slide + fade, **not** the Expo Router default.
- Notification tap: Today opens with Fed! subtly glowing.
- Idle: cat illustration blinks every 8–12 s with random jitter.
- **Motion tokens:** fast 150 ms, base 250 ms, slow 400 ms; custom bezier easings (not defaults); springs damping 18, stiffness 220 for most UI.
- Respect `prefers-reduced-motion` — disable non-essential animation entirely.

### e. Color palette

Ship with this — don't re-litigate.

| Token | Hex | Use |
| --- | --- | --- |
| Canvas | `#FAF6F0` | warm ivory background |
| Surface | `#FFFFFF` | cards, sheets |
| Ink | `#1C1916` | primary text (warm near-black) |
| Ink-2 | `#6B625A` | secondary text |
| Biscuit | `#E89B5A` | primary accent (warm amber, cat-food-can evocative) |
| Sage | `#8DA588` | success, healthy states |
| Blush | `#E8A4A4` | wet food / treats |
| Honey | `#E6B84D` | warnings |
| Brick | `#C25A4F` | errors |

**Dark mode:** canvas `#17130F`, surface `#221D18`; accents shift slightly warmer. Don't invert.

Gradients only on hero surfaces. No gradient buttons.

### f. Typography

- **Display / headers:** **Fraunces** (variable, warm serif) — premium feel, stands apart from every other RN app. 28–48 pt.
- **Body / UI:** **Inter** (safe, crisp, dense when needed).
- **Numeric:** Inter with tabular-nums on portion and calorie values.
- Line heights generous (1.3–1.5). Tight letter-spacing on display, default on body.
- Ship fonts via `expo-font`; splash blocks until loaded — no font flash.

### g. Tone / voice

Warm and knowledgeable friend. Not marketing. Not a vet textbook. Not cutesy.

- ✅ *"Mochi's set for the day. Nicely done."*
- ❌ *"🎉 GREAT JOB FEEDING YOUR KITTY!!! 🐱"*
- ❌ *"Feeding event logged successfully."*

Use the cat's name relentlessly — it's why the app got opened. Always pair numbers with plain-language context (*"about half a can"*).

### h. Accessibility

- WCAG AA on all text (verify ivory + biscuit combo).
- ≥ 44 pt hit targets on every interactive element.
- `accessibilityLabel` + `accessibilityRole` on every custom component.
- Respect Dynamic Type (iOS) and font scale (Android) — no hard-coded text sizes.
- `prefers-reduced-motion` disables springs and the progress-ring animation.
- VoiceOver on progress ring reads *"Mochi has eaten 145 of 212 calories, 68%."*
- Color is never the sole signal (wet/dry has icons; fed/skipped has icons, not just green/red).
- Colorblind check (Deuteranopia) on sage/biscuit/brick.

---

## 10. Testing Strategy

### a. Unit — Vitest
- Domain modules (`calories`, `portions`, `schedule`, `history`) get extensive coverage. Wrong portions → fat cat. Table-driven tests across kitten/adult/senior, BCS 1–9, wet/dry/mixed plans, DST boundaries.
- **Target ≥ 95 % coverage on `src/domain/`.** Do not chase coverage on UI.

### b. Component — React Native Testing Library + Jest
- Focus on stateful components: `BodyConditionPicker`, `MealTimeline`, `FoodSearch`, `ProgressRing` — behavior, not pixels.
- Snapshot only small pure presentational primitives; never entire screens.

### c. Integration
- Repository + domain layer on an in-memory SQLite: seed → create cat → create plan → log meal → assert today's kcal and schedule.
- Notification service with mocked `expo-notifications`: assert schedule/cancel calls on plan changes.

### d. E2E — Maestro
Preferred over Detox in 2026 — simpler YAML flows, faster, better Expo support.
- Fresh install → full onboarding → reach Today.
- Log a meal → progress ring updates.
- Create a second cat → switch → independent plan.
- Add custom food → use in plan.
- Edit schedule → notifications rescheduled (stubbed).
- Run in CI against iOS Simulator + Android Emulator matrix via EAS.

### e. Device matrix manual QA (non-negotiable)
- Local notifications must be verified on real iOS + Android devices across DST transitions, timezone changes, and low-power/Doze modes. RN apps quietly break here.
- Perf QA on a mid-tier Android (Pixel 6a as a reasonable floor).

Optional: visual regression (Loki or Percy) against Storybook for RN.

---

## 11. Roadmap (solo dev, realistic)

### Phase 0 — Foundation (Week 0–1)
- Expo SDK 52 project, TS strict, ESLint, Prettier, Drizzle, folder structure, theme tokens.
- CI via EAS Build + lint/test on every PR.
- Ship a *"hello cat"* build through TestFlight + internal Play track on **day 1**. Do not save pipeline work for the end.

### Phase 1 — Design system + primitives (Week 2–4)
- Color, typography, motion tokens.
- ~15 primitives (Button, Card, Chip, Input, Sheet, Tabs, ProgressRing, Avatar, Toast) with Storybook.
- AI-assisted illustration set; hand-refined.
- Light + dark theme.

### Phase 2 — Domain + data (Week 4–6)
- Drizzle schemas + migrations; weight_history table present even though v1 doesn't chart it.
- Curate seed food DB (~200 SKUs, tagged by region). This is a spreadsheet exercise — start **now** in parallel.
- Domain modules (calories, portions, schedule, history) with full unit tests.
- Repository layer; unit conversion utility.

### Phase 3 — Onboarding + Today (Week 6–9)
- Full onboarding flow, including BCS picker and vet disclaimer.
- Today screen with progress ring, cat carousel, log-a-meal.
- Notifications service + wiring.

### Phase 4 — Foods + plan editor (Week 9–12)
- Foods list, search, filters, detail.
- Feeding plan editor with timeline + grazer mode.
- Custom food creation.

### Phase 5 — Multi-cat, history, settings, vet export (Week 12–14)
- Cat switching + All-cats view.
- History view with 7-day chart.
- Settings (units, theme, notifications, export).
- Vet-export PDF generation.

### Phase 6 — Polish + beta (Week 14–17)
- Animation polish pass — dedicated sprint, do not skip.
- Maestro E2E suite.
- TestFlight + Play beta with ~30 real cat owners.
- Bug bash; notification reliability testing across timezones/DST.
- i18n plumbing in place (strings extracted), English-only strings at launch.

### Phase 7 — Launch (Week 17–20)
- App Store + Play submission.
- Landing page + App Store screenshots.
- Beta user email follow-up.

### Post-launch
- **v1.1 (~Week 22):** weight tracking chart, food DB refresh, bug fixes, first paid translations if demand warrants.
- **v2 (~Month 6):** Pro unlock via RevenueCat (unlimited cats, custom themes, advanced insights), barcode scanning, iPad support, widgets.
- **v3 (~Month 9+):** Pro cross-device sync via Supabase, household sharing, AI label OCR.

---

## 12. Risks & Pitfalls

### Product
- **Portion math that's subtly wrong.** A miscalculation here literally harms cats. Extensive unit tests + show the formula + disclaimer + round conservatively.
- **Ignoring BCS in favor of weight alone.** A 7 kg cat could be a lean Maine Coon or an obese DSH. BCS must be first-class, not optional.
- **Scope creep into "pet super-app"** (water, litter, vet records, social). Each addition dilutes the core. Be the best feeding app, period.
- **Free-feeding users.** Most cat owners leave dry food out all day. Without grazer mode, the app alienates them. Already in MVP.
- **Multi-cat households sharing food.** Common and messy. Don't try to solve in MVP — acknowledge in copy, plan per cat as if fed separately.
- **Curated food DB going stale.** Manufacturers reformulate. Show `lastVerifiedAt`; let users report issues; triage quarterly.
- **Notification fatigue.** 3 alerts/day × months → muted app. Offer quiet hours, gentle sounds, "just track, don't remind" mode.
- **Weight changes silently making the kcal target wrong.** Prompt a monthly re-weigh and auto-recalculate the target.
- **Day-boundary bugs.** *"Today's kcal"* at 23:58 → 00:02 — use device local midnight, store events in UTC epoch ms, display in local tz. Explicit DST tests.
- **Over-relying on illustrations.** Cute art ≠ great UX. Nail typography, hit rects, and motion before adding more art.

### Technical
- **Local notifications silently failing.** Low-power mode, Android Doze, permission revocation, iOS force-quit. Build a health check: *"Expected 7:00 reminder didn't fire — tap to diagnose."*
- **New architecture library lag.** Some RN libs still trail. Pin versions; test upgrades deliberately.
- **Drizzle migrations in production.** Test every migration on a real device upgrade path. Soft-delete; don't drop columns.
- **Fonts not loading on first launch.** SplashScreen blocks until Fraunces + Inter ready — no font flash.
- **FlashList misconfigured** (missing `estimatedItemSize`) → jank on foods list. Benchmark on mid-tier Android.
- **Over-animating.** Reanimated makes excess easy. An over-animated scroll is exhausting. Audit at the end of each phase.
- **Not QA'ing on low-end Android.** Always test on a ~$200 device (Pixel 6a floor).
- **Not enabling Hermes + new arch from day 1.** Adding later is painful.
- **Worldwide launch + locale units.** Subtle bugs: serving shown in oz for en-US but stored portions in grams — double-conversion bugs are easy. Single conversion boundary, tested hard.
- **RevenueCat not integrated early.** Adding IAP right before launch invites review rejections. Integrate in Phase 2 even though Pro ships post-MVP.

---

## 13. Final Summary

### a. Prioritized build order

1. Project + CI + TestFlight/Play pipeline end-to-end (day 1).
2. Design tokens + typography + ProgressRing (proves the visual bar).
3. Domain layer with full unit tests (calories, portions, schedule, history).
4. Drizzle schemas + seed food DB.
5. Onboarding flow (this sells the app — real attention).
6. Today screen + log meal + notifications.
7. Foods list + detail + custom food.
8. Feeding plan editor.
9. Multi-cat + history + settings + vet export.
10. Dark mode + a11y + animation polish pass.
11. Maestro E2E + beta + store submission.

### b. Recommended stack (concise)

- Expo SDK 52 (New Architecture) + React Native + TypeScript strict
- Expo Router v4
- Reanimated 3 + Gesture Handler + Moti + Skia
- Zustand + MMKV
- expo-sqlite + Drizzle ORM; bundled food JSON seed
- expo-notifications (local only, CalendarTrigger)
- Custom design system (Fraunces + Inter, no UI kit)
- RevenueCat (integrated in Phase 2, Pro activates post-launch)
- Vitest + RTL + Maestro
- EAS Build + Submit (CI/CD)
- i18n-ready (English only at launch)
- **No backend for MVP.** Supabase added in Phase 3 for Pro cross-device sync.

### c. Recommended MVP (concise)

Up to 3 cats. Conversational onboarding that computes a kcal target (with vet disclaimer). Today screen with progress ring + one-tap Fed! button. Curated food DB (~200 SKUs, region-tagged) + custom food entry. Feeding plan editor (1–2 foods, 2–4 meals/day or Grazer). Local notifications with Fed/Snooze/Skip actions. 14-day history + 7-day kcal chart. Locale-aware units with override. Export to vet (PDF). Dark mode + accessibility.

### d. Task checklist

**Foundation**
- [ ] Expo SDK 52 project, TS strict, ESLint, Prettier
- [ ] Expo Router v4 scaffolding
- [ ] EAS Build + Submit configured; TestFlight + Play internal tracks live
- [ ] Hermes + New Architecture enabled and verified
- [ ] Storybook for RN
- [ ] Sentry + PostHog wired up
- [ ] i18n scaffolding (strings extracted from day 1)

**Design system**
- [ ] Theme tokens (color, typography, spacing, motion, radii, shadows)
- [ ] Fonts (Fraunces, Inter) via expo-font, loaded in splash
- [ ] Dark mode tokens
- [ ] Primitives: Button, Card, Chip, Input, Sheet, Tabs, ProgressRing, Avatar, Toast
- [ ] Illustration set (AI-assisted, hand-refined) for cats, onboarding, empty states
- [ ] Reduced-motion and font-scale support baked in

**Data & domain**
- [ ] Drizzle schemas + initial migration (including weight_history)
- [ ] Seed food DB JSON (~200 SKUs, region-tagged, verified from manufacturer sources)
- [ ] Repositories (cats, foods, plans, events, settings)
- [ ] Domain: calories.ts (RER/MER, life-stage factors, BCS adjustments)
- [ ] Domain: portions.ts (kcal ↔ grams ↔ cans with rounding)
- [ ] Domain: schedule.ts (meals/day defaults, multi-food split, grazer mode)
- [ ] Domain: history.ts (today kcal, 7-day adherence, averages, vet export)
- [ ] utils/units.ts (metric ↔ imperial display conversion, single boundary)
- [ ] Unit tests on all domain modules (≥ 95 % coverage)

**Features**
- [ ] Onboarding (name, photo, DOB, weight, sex/neutered, BCS picker, activity, reveal w/ disclaimer, food pick, schedule, notifications)
- [ ] Today (progress ring, next meal, Fed! button, timeline, cat carousel)
- [ ] Cat profile (view, edit, delete with confirmation, Export to vet)
- [ ] Foods list + search + filters + FlashList
- [ ] Food detail + add-to-plan + report incorrect
- [ ] Custom food creation
- [ ] Feeding plan editor (food picker, split slider, meals-per-day incl. Grazer, draggable timeline)
- [ ] History (grouped by day, 7-day bar chart)
- [ ] Settings (units auto/metric/imperial, theme, notifications, export, disclaimer, about)
- [ ] Multi-cat switching + All-cats combined next-meal view
- [ ] Vet-export PDF generation (via expo-print or react-native-pdf)
- [ ] RevenueCat integration plumbing (inactive Pro in v1)

**Notifications**
- [ ] expo-notifications wrapper with CalendarTrigger
- [ ] Actionable categories (Fed / Snooze 15m / Skip)
- [ ] Reschedule on plan change + timezone/DST change
- [ ] Permission prompt placement (post-onboarding)
- [ ] Missed-notification self-diagnostic

**Quality**
- [ ] Component tests on BodyConditionPicker, MealTimeline, ProgressRing
- [ ] Integration tests: plan → schedule → notifications
- [ ] Maestro E2E: onboarding, log-meal, multi-cat, custom food, edit-schedule
- [ ] Accessibility audit (WCAG AA, VoiceOver/TalkBack, Dynamic Type)
- [ ] Low-end Android + older iPhone perf pass
- [ ] Notification reliability across timezones/DST/low-power

**Launch**
- [ ] Privacy policy + terms (local-only data disclosure)
- [ ] App Store screenshots + copy
- [ ] Play Store listing
- [ ] Landing page
- [ ] TestFlight + Play beta with 20–30 real cat owners
- [ ] Bug bash + polish sprint
- [ ] Submit to both stores

---

## 14. Implementation Update — 2026-04-23

This section records the current codebase state after the latest continuation pass, so the blueprint stays connected to the repo rather than remaining only aspirational.

### Completed in this pass

- Onboarding now continues past calorie reveal into food selection and meal-style setup before the reminder prompt.
- Finishing onboarding can create a real active feeding plan, so a new user can land on Today with a usable next meal instead of an empty setup card.
- Feeding-plan persistence is centralized in `src/services/feedingPlans.ts`, including cancellation of stale notification IDs before replacement plans are scheduled.
- Custom food creation is now available at `app/food/new.tsx` and is linked from Foods, empty search states, Food Detail, and the plan editor.
- Settings now exposes a PDF vet summary export with cat profile, current plan, recent feeding events, and the medical disclaimer.
- A Maestro smoke flow was added for onboarding, logging a meal, and adding a custom food.
- A pure domain helper for feeding-plan meal draft generation was added and covered by Vitest.

### Still open from the MVP checklist

- The food seed remains small at 30 SKUs and still needs source verification metadata expansion.
- Cat profile view/edit/delete is still missing.
- The plan editor has editable times and 1-2 foods, but not the final split slider or draggable timeline.
- Notification action responses for Fed / Snooze / Skip still need app-side handling.
- Maestro is configured, but it still needs to be run on real simulator/device targets and added to CI.
- Store-readiness work remains: privacy policy, terms, screenshots, TestFlight/Play beta, manual notification reliability QA, and app listing copy.
