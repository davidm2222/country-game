# UX Spec: Country Name Battle

> A 2-player pass-the-phone game where each player races to name as many countries as they can, then sees a dramatic map reveal of who won.

## Problem
Two people want to settle a friendly geography challenge — no paper, no pen, no honor-system counting. A quick, fair, shareable game that makes the moment feel real.

## Users
- Casual players: families, friends, couples — anyone who gets into a spontaneous "I bet I know more countries than you" moment
- Technical comfort: low — must work with zero instructions
- Device: mobile-first (phone passed between players), but desktop works too
- Frequency: occasional, impulse-driven — probably played a few times then shared with others

## Current Alternatives
- Writing on paper (slow, hard to validate, no map payoff)
- Just arguing about it (no resolution)
- Online geography quizzes (solo, not head-to-head, not local)

## Unique Value
Turns a spontaneous challenge into a polished, satisfying experience with a dramatic visual reveal. The map payoff makes it feel worth playing.

## User Goals

### Primary Goals
- Each player types as many countries as they can think of, without seeing the other's answers
- See a clear, exciting reveal of who named more countries

### Secondary Goals
- Feel like their spelling mistakes don't unfairly cost them points
- Know at a glance which countries they got, missed, or shared

### Anti-Goals
- Not a geography learning app — no flags, capitals, or educational content
- Not a multiplayer online game (MVP is same-device only)
- No time pressure (for MVP)
- No accounts, no leaderboards, no persistence between sessions

---

## User Flows

### Core Flow
1. **Start** → Enter Player 1's name → Enter Player 2's name → Begin
2. **Player 1's Turn** → Type countries one at a time → See running list build up → Tap "I'm Done"
3. **Handoff** → Screen clears and shows "Pass to [Player 2] — no peeking!" → Player 2 taps to start their turn
4. **Player 2's Turn** → Same experience, answers fully hidden from view
5. **Reveal** → Dramatic animated map appears, color-coded by who named what → Score summary → Option to rematch

---

## Pages / Screens

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| **Start** | Collect player names | Two name inputs, Start button |
| **Player Turn** | Main gameplay | Text input, validated running list, "I'm Done" button, player name shown |
| **Handoff** | Prevent peeking between turns | Full-screen cover, player name, "Tap to Start" — no answers visible |
| **Reveal** | The payoff | Winner announcement, color-coded world map, country breakdown by category, Rematch button |

---

## Screen Details

### Start Screen
- Two text inputs: "Player 1 Name" and "Player 2 Name"
- Single "Start Game" button (disabled until both names entered)
- Minimal — no clutter

### Player Turn Screen
- Header: "[Player Name]'s Turn"
- Text input (auto-focused, keyboard open immediately)
- Fuzzy-match validation on submit:
  - **Match found** → add to list in green, clear input
  - **Close match** → show inline suggestion: "Did you mean *Brazil*?" with one-tap confirm
  - **Already entered** → highlight the duplicate in the list, don't add again
  - **No match** → shake input, show "Not recognized" — input stays for correction
- Running list below input: just country names, clean and scrollable
- "I'm Done" button always visible (not hidden at bottom of list)

### Handoff Screen
- Full-screen cover (no list visible behind it)
- Message: "Great job, [Player 1]! Pass the phone to [Player 2]."
- Subtext: "No peeking at the screen!"
- Single large "I'm Ready" button for Player 2 to tap
- Player 1's score NOT shown (preserve mystery)

### Reveal Screen
- **Winner banner** at top: "[Player 1] wins! 47 vs. 31" (or "It's a tie!")
- **World map** (color-coded):
  - Color A: Countries only [Player 1] named
  - Color B: Countries only [Player 2] named
  - Color C: Countries both named
  - Grey: Countries neither named
- **Legend** clearly labeled with player names, not generic "Player 1/2"
- **Breakdown lists** (collapsible or tabbed):
  - Both named (X countries)
  - Only [Player 1] named (X countries)
  - Only [Player 2] named (X countries)
  - Neither named (X countries)
- **Rematch** button → returns to Start screen with same names pre-filled
- **New Game** button → returns to Start screen, names cleared

---

## Key Decisions

- **Country list**: Use an inclusive list — Taiwan, Kosovo, Puerto Rico, Palestine, etc. are in. Needs a curated canonical list with many aliases per country (common misspellings, alternate names, language variants).
- **Fuzzy matching**: Immediate inline feedback on each entry — never silently reject. A missed "Brazil" due to a typo would feel deeply unfair and break trust in the game.
- **No time limit (MVP)**: Players tap "I'm Done" when finished. Can revisit adding a timer in v2.
- **Mystery preserved**: Player 2 sees zero information about Player 1's performance until the reveal — not even a count.
- **Same device only (MVP)**: Handoff screen solves the hiding problem simply. Online multiplayer is a v2 consideration.
- **Rematch**: Pre-fills names, skips start screen, swaps turn order so Player 2 goes first next time.

---

## Open Questions

- **Canonical country list source**: What list do we use as the source of truth? (e.g., UN member states + widely recognized non-members?) Needs curation before build.
- **Fuzzy match threshold**: How loose is "close enough"? "Brzil" yes, "Brezal" maybe, "Borzil" probably not. Needs tuning.
- **Territories and dependencies**: Puerto Rico is in — what about Greenland, Hong Kong, Macau, Western Sahara? Draw the line somewhere and document it.
- **Map library**: What library renders the world map? Needs to support country-level coloring. (Options: D3, Leaflet, react-simple-maps)
- **Reveal animation**: Should the map fill in dramatically (countries pop in one by one) or appear instantly? Animation would heighten the payoff moment significantly.
- **Mobile keyboard behavior**: On mobile, the keyboard covering the input + list needs careful handling so the running list stays visible.
