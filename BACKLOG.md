# Country Name Battle — Backlog

## 💡 Game Mode Ideas
- **Head-to-Head Live** — Both players simultaneously; first to name a country claims it. (v2, requires online multiplayer)
- **Capital Cities** — Name capitals instead of countries.
- **Streak Mode** — Players alternate one at a time; wrong answer ends the streak.

## 🔧 Improvements
- **Reveal animation** — Dramatic pop-in of countries on the map instead of instant color fill. (v2)
- **Small island nation visibility** — Tiny Pacific islands may not render at 110m resolution; investigate higher-res map or tooltip fallback.
- **Mobile keyboard handling** — Ensure the running list stays visible when the on-screen keyboard is open.
- **Device-neutral UI copy** — Audit all game text for phone-specific language ("pass the phone", etc.) and replace with device-neutral phrasing (e.g. "pass the device" or just player-name-based prompts).
- **Country list audit** — Review inclusion criteria using passport-issuing authority as the definition of "country". Puerto Rico, Guam, Hong Kong, etc. issue their own travel documents in some form — determine which should be accepted. Document the final ruleset.

## 🔢 Multiplayer Expansion
- **More than 2 players** — Support 3+ players taking turns on the same device; reveal screen would need per-player color coding and a multi-column breakdown.

## 🗃️ Parked for Later
- **Online multiplayer** — No persistence between sessions is intentional for MVP. Online play is a v2 concern.
