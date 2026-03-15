# Country Name Battle — Backlog

## 💡 Game Mode Ideas
- ~~**Map Mode**~~ — ✅ Shipped. Toggle on start screen; full world for Classic/Timed, zoomed continent for Continent Sprint. Countries fill in as named during play.
- **Head-to-Head Live** — Both players simultaneously; first to name a country claims it. (v2, requires online multiplayer)
- **Capital Cities** — Name capitals instead of countries.
- **Streak Mode** — Players alternate one at a time; wrong answer ends the streak.

## 🔧 Improvements
- **Continent Sprint — wrong-continent feedback** — When a player enters a real country that's not on the active continent, show a distinct error (e.g. "Japan is in Asia, not Europe") instead of the generic "not recognized" message.
- **Reveal animation** — Dramatic pop-in of countries on the map instead of instant color fill. (v2)
- **Small island nation visibility** — Tiny Pacific islands may not render at 110m resolution; investigate higher-res map or tooltip fallback.
- **Mobile keyboard handling** — Ensure the running list stays visible when the on-screen keyboard is open.
- **Device-neutral UI copy** — Replace "pass the phone" and similar wording throughout with player-name-based prompts (e.g. "Hand it to Sarah") or device-neutral phrasing ("pass the device").
- ~~**Country list audit**~~ — ✅ Resolved. Rule: passport-issuing authority = standalone entry. Hong Kong and Macau promoted to standalone countries; Puerto Rico demoted to alias for United States; Western Sahara demoted to alias for Morocco; Greenland stays alias for Denmark (no own passport).

## 🔢 Multiplayer Expansion
- **More than 2 players** — Support 3+ players taking turns on the same device; reveal screen would need per-player color coding and a multi-column breakdown.

## 🗃️ Parked for Later
- **Online multiplayer** — No persistence between sessions is intentional for MVP. Online play is a v2 concern.
