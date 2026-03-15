# Country Name Battle — Build Plan & Progress

## Game Summary
2-player pass-the-phone game: race to name as many countries as you can, then see a dramatic map reveal. Same-device MVP — no accounts, no online multiplayer, no persistence between sessions.

## Overall Progress

- [x] Next.js scaffold with TypeScript + Tailwind v4
- [x] Dependencies installed (fuse.js, react-simple-maps, lucide-react, clsx, tailwind-merge)
- [x] Project structure created
- [x] Types defined
- [x] Country data with aliases (~245 countries + territories)
- [x] Fuzzy matching engine (Fuse.js)
- [x] Session-based game state (sessionStorage)
- [x] Start screen
- [x] Player Turn screen (input + fuzzy match + running list)
- [x] Handoff screen
- [x] Reveal screen (winner banner + world map + breakdown)
- [x] WorldMap component (react-simple-maps, color-coded)
- [x] Fuzzy match tuning (threshold 0.1, removed suggestion tier, beefed up alias list)
- [x] New countries prepended to top of list
- [x] Color scheme — "Both" = green (#22c55e)
- [x] Map coverage — territory→parent mapping (Greenland→Denmark, French territories→France, etc.)
- [x] Reveal map — two-column desktop layout (map left, breakdown + buttons right; max-w-5xl)
- [x] Dark mode (prefers-color-scheme + dark: Tailwind variants on all screens)
- [x] Reveal screen — "Neither named" collapsible expander (continent-aware, collapsed by default)
- [x] Game modes: Timed (adjustable timer) and Continent Sprint
- [ ] Polish: animations, mobile keyboard handling
- [x] Map Mode

---

## 7. Map Mode

### Goal
Add a **map toggle** that can be combined with any existing mode (Classic, Timed, Continent Sprint). When on, the world map is visible during each player's turn and countries fill in as they're named. Designed for younger players or learning — removes the memory challenge.

### What changes

**`types/index.ts`**
- Add `mapMode?: boolean` to `GameState` (no change to `GameMode` — stays `'classic' | 'timed' | 'continent'`)

**`lib/gameState.ts`**
- Add `mapMode: false` to `DEFAULT_STATE`

**`app/page.tsx`** (Start screen)
- Add a map toggle (checkbox or pill toggle) below the mode selector
- Label: "Show map during play"

**`components/features/WorldMap.tsx`**
- Add optional `variant?: 'reveal' | 'play'` prop (default `'reveal'`)
- Add optional `continent?: Continent` prop (already exists; reuse for play variant)
- In `'play'` variant:
  - Simplified legend: "Named" / "Not yet" (no p1/p2/both distinction)
  - Color logic: named countries → player color (`#3b82f6`), everything else → neither/outOfScope
  - If `continent` is provided: zoom into that continent only (filtered geographies + per-continent projection config); otherwise full world
- Per-continent projection configs (center + scale — will need visual tuning):

| Continent | Center | Scale |
|-----------|--------|-------|
| Africa | [20, 0] | 250 |
| Asia | [90, 30] | 180 |
| Europe | [15, 55] | 400 |
| North America | [-95, 40] | 250 |
| South America | [-60, -15] | 280 |
| Oceania | [145, -25] | 350 |

**`app/play/page.tsx`**
- When `state.mapMode`, render a compact WorldMap between the header and the input area
- Pass `p1Countries={countries}`, `p2Countries={[]}`, `variant="play"`
- Pass `continent={state.continent}` when in Continent Sprint so the map zooms in
- Country list stays visible below input

### Layout (map toggle on, play screen)
```
[Header — name + count (+ timer if timed)]
[WorldMap — compact; full world or zoomed continent]
[Input area]
[Country list — scrollable]
[Done button — sticky bottom]
```

### Decisions
| Area | Decision | Alternatives | Reasoning |
|------|----------|-------------|-----------|
| Implementation | Toggle (boolean) not a 4th mode | 4th standalone mode | Can combine with Timed, Continent Sprint naturally |
| Continent + Map | Zoom to continent only | Show full world with dimming | Better UX — focus is on the countries in play |
| Full world + Map | Show full world map | n/a | Classic/Timed have no scope restriction |
| P2 mystery | Map shows only current player's countries | Show all named so far | Maintains hidden-score principle between turns |
| Legend | Simplified ("Named" / "Not yet") | Full p1/p2/both legend | During a single-player turn, multi-player legend is confusing |
| Country list | Keep it visible | Hide list (map only) | List gives precise text confirmation; map gives spatial context |
| Island nations | Accept some won't render at 110m res | Higher-res topojson | Scope creep; already a known backlog item |

### Known risks
- **Timed + Map on mobile**: timer + map + input + on-screen keyboard = cramped. Mitigate by capping map height (`max-h-48` or similar on small screens).
- **Continent projection configs**: scale/center values need visual tuning per continent — build order should include a tuning pass.
- **Oceania small islands**: many won't be visible at 110m resolution regardless of zoom.

### Open Questions
- None — scope is clear enough to build

---

## 1. Architecture

### 1.1 Routing (Next.js App Router)
| Route | Screen |
|-------|--------|
| `/` | Start screen — enter player names |
| `/play` | Player Turn — text input + validated list |
| `/handoff` | Handoff — full-screen cover between turns |
| `/reveal` | Reveal — winner + color-coded world map |

### 1.2 State Management
- `sessionStorage` key: `country-game-state`
- Read/write via `lib/gameState.ts`
- No React context needed (read on mount per page)

### 1.3 Game State Shape
```typescript
{
  player1Name: string;
  player2Name: string;
  player1Countries: string[];   // canonical names
  player2Countries: string[];   // canonical names
  currentPlayer: 1 | 2;        // whose turn is it now
  round: 1 | 2;                 // 1st or 2nd player this game
  firstPlayer: 1 | 2;          // who went first (for rematch swap)
}
```

### 1.4 Turn Flow
- Default: P1 goes first (round=1, currentPlayer=1)
- After P1 done → navigate to `/handoff`
- Handoff: shows "pass to P2" → sets currentPlayer=2, round=2 → `/play`
- After P2 done → navigate to `/reveal`
- Rematch: clear countries, swap firstPlayer, set currentPlayer=newFirstPlayer, round=1 → `/play`

---

## 2. Country Data

### 2.1 Scope
- All 193 UN member states
- UN observer states: Palestine, Vatican
- Widely recognized non-members: Kosovo, Taiwan
- Selected territories per spec: Western Sahara, Puerto Rico

### 2.2 Data Shape
```typescript
{ name: string, iso3: string, isoN: number, aliases: string[] }
```

- `isoN`: ISO 3166-1 numeric code (used to color world-atlas map)
- `aliases`: alternate names, common misspellings, language variants, abbreviations

### 2.3 Map Coloring
- Uses `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`
- `geo.id` (numeric) matched against `isoN` in country list
- Colors: Player 1 = blue (#3b82f6), Player 2 = orange (#f97316), Both = green (#22c55e), Neither = #e5e7eb (light) / #374151 (dark)
- Dark mode: neither/outOfScope fills adapt reactively via matchMedia listener in WorldMap

---

## 3. Fuzzy Matching

### 3.1 Library: Fuse.js
- Search across `name` + `aliases` fields
- threshold: 0.4 (0 = exact, 1 = match anything)
- ignoreLocation: true

### 3.2 Match Tiers
| Score | Action |
|-------|--------|
| < 0.1 | Near-exact → add to list immediately (green) |
| > 0.1 | No match → shake input, show "Not recognized" |

### 3.3 Duplicate Detection
- Before fuzzy match, check if canonical name already in player's list
- If duplicate: highlight existing entry, clear input

---

## 4. Screens

### 4.1 Start Screen (/)
- [x] Two name inputs (P1, P2)
- [x] Start button disabled until both names entered
- [x] Auto-focus P1 input

### 4.2 Player Turn (/play)
- [x] Header: "[Player Name]'s Turn"
- [x] Auto-focused text input
- [x] Enter key submits
- [x] Fuzzy match validation with inline feedback
- [x] Running list (green, scrollable, newest at top)
- [x] "I'm Done" button always visible
- [x] Duplicate highlighting

### 4.3 Handoff (/handoff)
- [x] Full-screen cover
- [x] "Great job [P1]! Pass the phone to [P2]"
- [x] "No peeking!" subtext
- [x] "I'm Ready" button
- [x] P1's score NOT shown

### 4.4 Reveal (/reveal)
- [x] Winner banner ("X wins! 47 vs 31" or "It's a tie!")
- [x] Color-coded world map (react-simple-maps)
- [x] Legend with player names
- [x] Breakdown lists (both / only P1 / only P2 / neither) — all collapsible, "neither" collapsed by default
- [x] Rematch button (pre-fills names, swaps turn order)
- [x] New Game button (clears everything)

---

## 5. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Map library | react-simple-maps v3 | React-friendly, declarative, adequate for country coloring |
| Fuzzy match | Fuse.js | Simple API, good defaults for short country names |
| State | sessionStorage | No backend needed, survives page refresh, clears on tab close |
| Styling | Tailwind v4 | Already in scaffold, CSS-variable-based config |
| No Firebase | Intentional | No persistence between sessions per spec |
| Map data | world-atlas 110m topojson | Standard, hosted on CDN, works with react-simple-maps |

---

## 6. Immediate Next Steps
1. Verify dev server runs: `npm run dev`
2. Manual test full game flow: Start → P1 Turn → Handoff → P2 Turn → Reveal
3. Test fuzzy matching edge cases
4. Mobile viewport testing
