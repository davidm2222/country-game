# Country Name Battle — Claude guide

Two-player pass-the-phone game: each player races to name as many countries as they can, then a world map reveals who got what. Same device only — no accounts, no backend, no saved data between sessions. Feature-complete and rarely changed — keep changes small.

## Commands

```bash
npm run dev     # local dev at :3000
npm run build   # type-check + production build — run before pushing
npm run lint
```

Uses npm (`package-lock.json`). No tests.

**Next.js 16:** APIs differ from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.

## Architecture

- Next.js 16 App Router, Tailwind v4, deployed on Vercel (project `country-game`, with `@vercel/analytics`). Pushing `master` deploys to production. Public GitHub repo — never commit secrets.
- Game flow: `/` (start) → `/play` (a player's turn) → `/handoff` (pass the phone) → `/reveal` (map + results).
- `lib/countries.ts`: ~245 countries and territories with aliases. `lib/matcher.ts`: fuzzy name matching (Fuse.js). `lib/gameState.ts`: game state in `sessionStorage`.
- `components/features/WorldMap.tsx`: the reveal map (react-simple-maps).

## Docs

`PLAN.md` (build plan and progress), `UX-SPEC.md` (screens and flow), `BACKLOG.md` (ideas). `README.md` is still the create-next-app default.
