# Musafir — Design Spec
*Your halal travel companion*
*Created: 2026-04-02 | Author: Ikhmal + Aina*

---

## 1. Project Overview

**Name:** Musafir (Arabic/Urdu: "traveler")
**Tagline:** Your halal travel companion
**Type:** Progressive Web App (SPA, v1 static — v2 adds PWA service worker)
**Repo:** New GitHub repo `musafir` (fresh — not forked from travel_halal)
**Deployment:** Cloudflare Pages via GitHub Actions CI/CD

### Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Vue 3.5 (Composition API, `<script setup>`) | New stack — learning investment |
| Build | Vite 8 | Fast HMR, native ESM |
| Styling | Tailwind CSS 3 + custom theme tokens | Midnight Blue design system |
| Routing | Vue Router 4 | History mode + Cloudflare `_redirects` for clean URLs |
| State | Pinia | location, prayer, settings, zikir, food stores |
| Maps | Leaflet + Vue-Leaflet | Free, no API key, proven for mosque finding |
| Prayer Calc | Adhan JS (npm: `adhan`) | Offline library — no API calls, no CORS |
| Hijri Date | dayjs + `dayjs-hijri` plugin | Pairs with Adhan JS |
| Icons | Lucide Vue Next | Lightweight, consistent |
| Testing | Vitest + Vue Test Utils | Unit + composable tests |
| Linting | ESLint + `eslint-plugin-vue` | Enforced in CI |

### Theme Tokens (Tailwind custom colours)

```js
// tailwind.config.js
colors: {
  midnight: {
    950: '#0f172a',  // primary background
    900: '#0f1629',  // slightly lighter bg
    800: '#1e1b4b',  // card background
    700: '#312e81',  // card border / subtle
  },
  accent:  '#6366f1',  // indigo — interactive elements, active states
  emerald: '#059669',  // Islamic green — mosque/prayer indicators
  gold:    '#f59e0b',  // next prayer highlight, Dua of the Day
}
```

---

## 2. Pages & Navigation

### Routes

```
/          → Home (dashboard — not a tab)
/mosque    → Mosque Finder
/food      → Halal Food
/prayer    → Prayer Times
/zikir     → Zikir & Dua
```

### Navigation Structure

- **Bottom tab bar** (always visible, 4 tabs): Mosque · Food · Prayer · Zikir
- **Home** is the app landing page — accessed via the Musafir logo/header, not a tab
- **Back navigation** inside Zikir category reader via `‹` icon in header

### Bottom Tab Bar

```
🕌 Mosque  |  🍽 Food  |  🕐 Prayer  |  📿 Zikir
```

Active tab uses `accent` (indigo) colour. Inactive tabs use `midnight-700`.

---

## 3. Home Dashboard

The glanceable landing screen — most useful info visible without tapping anything.

### Layout (top → bottom)

| Element | Description |
|---------|-------------|
| **Header bar** | Musafir logo (left) · Hijri date chip (right) · Settings icon |
| **Greeting card** | "Assalamualaikum, Ikhmal 🌙" + time-aware sub-text (e.g. "Time for Fajr" / "Good afternoon") |
| **Next prayer hero card** | Prayer name + time + live countdown + thin gold progress bar |
| **Nearest mosque card** | Mosque name + distance + "View on Map" button → navigates to `/mosque` |
| **Dua of the Day card** | Arabic text + transliteration + source (gold border) → navigates to `/zikir` |
| **Quick nav grid** | 2×2 visual cards — Mosque / Food / Prayer / Zikir |

### Data Sources

- Prayer data from `usePrayerStore` — computed once via Adhan JS, shared across Home + Prayer page
- Nearest mosque from `useLocationStore` — cached Overpass result (session-scoped)
- Dua of the Day from `useZikirStore` — seeded by `dayjs().dayOfYear()`, same dua all day, rotates daily
- Greeting time-awareness from `dayjs().hour()` — Morning / Afternoon / Evening / Night modes

---

## 4. Mosque Finder

### Layout — Option C (Nearest Hero + Mini Map + List)

- **Nearest mosque hero card** at top — name, distance, "View on Map" button (prominent, gradient card)
- **Mini map** (Leaflet, 120px height) — contextual view, tappable to full-screen
- **Radius toggle pills** — 1km / 3km / 5km (default: 3km)
- **Full sorted list** below — tap any item to fly map to that marker

### Overpass Fix — 3-Mirror Fallback

```
Mirror 1: https://overpass-api.de/api/interpreter
Mirror 2: https://overpass.kumi.systems/api/interpreter
Mirror 3: https://overpass.private.coffee/api/interpreter
```

All three support `Access-Control-Allow-Origin: *`. Tried sequentially — first success wins.

**Unified timeout:** 25s in both the `AbortSignal` and the Overpass `[timeout:25]` query — no racing.

**On all-mirrors-fail:** Show a retry button — never a dead error state.

### Mosque Query

```
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon});
  node["amenity"="place_of_worship"]["religion"="Islam"](around:{radius},{lat},{lon});
  way["amenity"="place_of_worship"]["religion"="Islam"](around:{radius},{lat},{lon});
);
out center;
```

Both `religion` tag variants included — covers OSM tagging inconsistency.

### Composable

`useOverpass(coords, queryFn, cacheKey)` — same pattern as travel_halal but rewritten in Vue Composition API with 3-mirror retry and matching timeouts.

---

## 5. Halal Food

### v1 — Curated Static List

- Data lives in `src/data/food.js` — structured array, bundled into app
- Each entry has a `halalStatus` field: `"certified"` | `"muslim-friendly"` | `"pork-free"`

### Entry Schema

```js
{
  id: "nasi-lemak-antarabangsa",
  name: "Nasi Lemak Antarabangsa",
  country: "Malaysia",
  city: "Kuala Lumpur",
  cuisine: "Malay",
  halalStatus: "certified",       // "certified" | "muslim-friendly" | "pork-free"
  rating: 4.7,
  description: "Famous nasi lemak since 1973",
  lat: 3.1478,
  lon: 101.6953,
  tags: ["popular", "local"]
}
```

### Badge + Disclaimer System (Option A — Always Visible)

| Status | Badge | Disclaimer |
|--------|-------|-----------|
| `certified` | ✅ green `Halal Certified` | None |
| `muslim-friendly` | ⚠️ amber `Muslim-Friendly` | *"This restaurant is Muslim-friendly but may not be halal-certified. Verify locally."* |
| `pork-free` | ⚠️ amber `Pork-Free` | *"This restaurant does not serve pork but halal certification is not confirmed."* |

Disclaimer always visible below card — never hidden behind a tap.

### Filters

- Country filter pills (horizontal scroll)
- Cuisine filter pills
- Map toggle — list view ↔ map view (Leaflet markers)

### v2 — API Integration (Future)

Data layer abstracted behind `useFoodSource` composable. v1 returns static array. v2 swaps to API call — no UI changes needed. Research notes saved to `Notes/musafir-halal-food-api-research.md`.

---

## 6. Prayer Times

### Data Source — Adhan JS (Offline)

```
npm: adhan
```

No network calls, no CORS, no rate limits. Works offline. Used by Muslim Pro and Athan.
Paired with `dayjs-hijri` for Hijri date display.

**Why not Aladhan API:** Timezone detection inconsistency, method selection sometimes ignored, URL workaround required. Adhan JS solves all of these permanently.

### Calculation Methods Supported

JAKIM (Malaysia, method 17 equivalent) · MUIS (Singapore) · Muslim World League · ISNA · Egypt · Karachi · Tehran · Gulf. Stored in `useSettingsStore`, persisted to localStorage.

### Layout — Option B (Gold Banner + Full List)

- **Hijri date chip** + location name at top
- **Gold next prayer banner** — bold, full-width, prayer name + countdown
- **Full vertical list** — 6 prayers (Fajr/Sunrise/Dhuhr/Asr/Maghrib/Isha), current prayer highlighted with left gold border
- **Method selector** — collapsible at bottom, saves preference

### Prayers Displayed

| Prayer | Icon |
|--------|------|
| Fajr | 🌙 |
| Sunrise | 🌅 |
| Dhuhr | ☀️ |
| Asr | 🌤️ |
| Maghrib | 🌇 |
| Isha | ⭐ |

Sunrise is displayed but excluded from countdown (not a fard prayer).

### Composable

`usePrayer(coords)` — wraps Adhan JS. Returns `{ times, nextPrayer, countdown, hijriDate }`. Countdown updates every second via `setInterval`. Shared via `usePrayerStore`.

---

## 7. Zikir & Dua

### Layout — Option C (Category Grid) + Option B (Swipe Cards inside)

**Screen 1 — Zikir Home:**
- Header: "📿 Zikir & Dua"
- 2×2 category grid — each tile shows icon, name, count, daily progress bar
- Dua of the Day card (gold border) at bottom — Arabic + transliteration + source

**Screen 2 — Category Reader (on tap):**
- Header: category name + `X / total` badge + back arrow
- Progress bar (fills as you advance)
- B-style swipe cards — gradient midnight background, large Arabic text, transliteration, translation
- Prev / Next navigation + dot indicators
- Zikir counter for applicable entries (see below)

### Content Structure

```
src/data/zikir/
  morning.json      → 12 adhkar (Ayatul Kursi, 3 Quls, morning duas)
  evening.json      → 12 adhkar
  travel.json       → 8 duas (entering city, boarding, journey safety)
  after-prayer.json → 6 adhkar (post-salah tasbih)
  general.json      → 15 common daily duas
```

### Entry Schema

```json
{
  "id": "subhanallah",
  "title": "Tasbih",
  "arabic": "سُبْحَانَ اللَّهِ",
  "transliteration": "Subhanallah",
  "translation": "Glory be to Allah",
  "source": "After Salah",
  "count": 33
}
```

`count: 1` = dua (read once). `count > 1` = zikir (requires counter).

### Zikir Counter Behaviour

| Entry type | Counter shown | Interaction | Auto-advance |
|------------|--------------|-------------|-------------|
| `count > 1` | ✅ Gold counter + progress bar | Tap card/button to increment, long-press to reset | Yes — on completion |
| `count = 1` | ❌ No counter | "Mark as Read" button | Yes — on mark |

- Counter state in `useZikirStore` (localStorage-backed, persists across sessions)
- Mobile vibration feedback on each tap (`navigator.vibrate(10)`)
- Category grid shows progress bar per category — resets daily at midnight

### Category Progress Reset

Daily reset via `dayjs().format('YYYY-MM-DD')` stored alongside counters. On app open, if stored date ≠ today → reset completion flags, keep counter values (user may want to continue).

---

## 8. Data Layer & Storage

### v1 — localStorage via `useStorage` Composable

All persistent state goes through `useStorage(key, defaultValue)` — nothing touches `localStorage` directly. This is the Supabase swap boundary.

```js
// composables/useStorage.js
export function useStorage(key, defaultValue) {
  const data = ref(JSON.parse(localStorage.getItem(key)) ?? defaultValue)
  watch(data, val => localStorage.setItem(key, JSON.stringify(val)), { deep: true })
  return data
}
```

### Storage Map

| Data | Store | localStorage Key |
|------|-------|-----------------|
| Prayer method | `useSettingsStore` | `musafir:settings` |
| Zikir counter progress | `useZikirStore` | `musafir:zikir` |
| Zikir daily completion | `useZikirStore` | `musafir:zikir-log` |
| Favourite mosques | `useMosqueStore` | `musafir:fav-mosques` |
| Favourite food | `useFoodStore` | `musafir:fav-food` |
| Last known location | `useLocationStore` | `musafir:location` |
| App theme / language | `useSettingsStore` | `musafir:settings` |

### v2 — Supabase (Future, Cross-Device Sync)

- Auth: Supabase Magic Link (email, no password)
- Tables: `user_settings`, `zikir_progress`, `favourites`
- Migration: only `useStorage` composable changes — all stores and UI stay identical

### What Does NOT Need Storage

- Prayer times — computed offline by Adhan JS, no persistence needed
- Mosque/food live data — cached in `sessionStorage` per session via `useOverpass`
- Dua of the Day — derived from `dayjs().dayOfYear()`, deterministic

---

## 9. Project Structure

```
musafir/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-04-02-musafir-design.md
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── BottomNav.vue
│   │   ├── ErrorBanner.vue
│   │   ├── LoadingSpinner.vue
│   │   └── SkeletonCard.vue
│   ├── composables/
│   │   ├── useGeolocation.js
│   │   ├── useOverpass.js
│   │   ├── usePrayer.js
│   │   ├── useFoodSource.js
│   │   └── useStorage.js
│   ├── data/
│   │   ├── food.js
│   │   └── zikir/
│   │       ├── morning.json
│   │       ├── evening.json
│   │       ├── travel.json
│   │       ├── after-prayer.json
│   │       └── general.json
│   ├── pages/
│   │   ├── Home/
│   │   │   └── index.vue
│   │   ├── MosqueFinder/
│   │   │   ├── index.vue
│   │   │   ├── MosqueMap.vue
│   │   │   ├── MosqueCard.vue
│   │   │   └── MosqueList.vue
│   │   ├── HalalFood/
│   │   │   ├── index.vue
│   │   │   ├── FoodCard.vue
│   │   │   ├── FoodList.vue
│   │   │   └── FoodMap.vue
│   │   ├── PrayerTimes/
│   │   │   ├── index.vue
│   │   │   ├── PrayerBanner.vue
│   │   │   └── PrayerGrid.vue
│   │   └── Zikir/
│   │       ├── index.vue
│   │       ├── CategoryGrid.vue
│   │       ├── ZikirReader.vue
│   │       └── ZikirCounter.vue
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   ├── useLocationStore.js
│   │   ├── usePrayerStore.js
│   │   ├── useSettingsStore.js
│   │   ├── useZikirStore.js
│   │   ├── useMosqueStore.js
│   │   └── useFoodStore.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 10. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD — Musafir

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build

  deploy:
    name: Deploy to Cloudflare Pages
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=musafir
```

### Branch Strategy

```
main     → production (auto-deploys to Cloudflare Pages)
dev      → integration branch (PRs merged here first)
feat/*   → feature branches → PR into dev → merge to main
```

### GitHub Secrets Required

| Secret | Where to get it |
|--------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → Account: Cloudflare Pages: Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Overview → Account ID (right sidebar) |

### Cloudflare Pages Setup

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Select `musafir` GitHub repo
3. Build settings: Framework: `Vue`, Build command: `npm run build`, Output: `dist`
4. Save — Cloudflare assigns `musafir.pages.dev` subdomain automatically
5. Add `public/_redirects` file with `/* /index.html 200` for Vue Router history mode
6. PR previews deploy to unique URLs automatically

---

## 11. Future Roadmap (Out of Scope for v1)

| Feature | Notes |
|---------|-------|
| PWA / Service Worker | Offline support, install to homescreen, push notifications for prayer |
| Supabase auth + sync | Cross-device favourites, zikir progress sync |
| Halal food API | Replace static list — see `Notes/musafir-halal-food-api-research.md` |
| Qiblat compass | Device orientation API, already proven in claude_test |
| Custom domain | `musafir.app` on Cloudflare Pages |
| i18n | Malay + English toggle |

---

## 12. Key Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Vue 3 | Learning investment, clean Composition API, good ecosystem |
| Prayer API | Adhan JS (offline) | No CORS, no downtime, used by Muslim Pro — solves travel_halal inconsistency |
| Maps | Leaflet + Overpass | Free forever, no API key, 3-mirror fallback fixes travel_halal failures |
| Deployment | Cloudflare Pages | Fastest global CDN, free tier, PR previews, best for travel app |
| Storage | localStorage → Supabase | Ship v1 fast, `useStorage` composable is the only swap point |
| Food halal system | Always-visible disclaimer | Transparency first — users must never miss a halal warning |
| Zikir layout | Category grid + swipe reader | Overview + focused reading, category progress tracking |
| Mosque layout | Nearest hero + mini map + list | Most useful info first — traveler needs nearest mosque immediately |

---

*Spec status: Approved · Ready for implementation planning*
