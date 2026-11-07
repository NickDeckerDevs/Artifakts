# PLAN 2 — `allgames.html` listing page + sheet↔local sync

## Status — built 2026-11-07 (commits `a85ac94`, `71730f9`)

Built as specced: `tools/u10team4-saveddata/review/allgames.html`, a new `action=schedule` Apps
Script endpoint in `.working/apps-script-sync.gs` (full main-tab schedule, since `listGames_()`
alone can't see never-touched future games), and a `POST /api/sync-game` endpoint on Plan 1's
server that writes `games/<game-id>/{original-data.json,audio/}` — the only thing that writes
under `games/`.

- **Local data shape chosen**: `{game, pulledAt, coachGame, parentEntries}` — matches what
  `generate-match-review` (Plan 3, built separately) expects for its `original-data.json` input.
  `coachGame` is the raw lineup `data` object from `action=get`; `parentEntries` is `action=entries`'s
  array as-is.
- **Diffing**: plain `JSON.stringify` equality between local and the freshly-pulled sheet data
  (`pulledAt` excluded from the comparison so a no-op check doesn't always look "changed"). No
  hash/timestamp scheme — deliberately kept simple per the plan's own guidance.
- **Voice-capture audio**: `checkFromSource()` also pulls the Drive file id out of each
  voice-captured parent entry's `audioUrl` (`/d/<id>/` or `?id=`), re-downloads the clip via
  `action=audio&id=<id>` (same mechanism `finalize-match` uses), and ships it to the server as
  base64 alongside the JSON payload so `games/<id>/audio/` is populated without the server needing
  any Drive credentials of its own.
- **Verified**: started the server, confirmed `/review/allgames.html` is served, and exercised
  `POST /api/sync-game` directly (valid write + bad-game-id rejection). **Not** verified against
  the live sheet end-to-end — the new `schedule` action isn't deployed yet. See
  [`nick-to-do.md`](./nick-to-do.md) item 1: Nick needs to redeploy
  `.working/apps-script-sync.gs` (edit the existing deployment, not a new one) before this page
  will show real data.
- Plan 4 has since (separately) started wiring this page's Action/View columns to `/run-skill` —
  found and fixed one bug in that work in passing: `actionCell()`/`viewCell()` were defined but
  `render()` was still emitting the old disabled placeholder buttons instead of calling them.

Can be run anytime in parallel with any other plan that can be run in parallel.

See [`CONTEXT.md`](./CONTEXT.md) for the shared architecture/background this plan assumes,
including the 5-state status model and the award-model requirements (not needed to build this
plan, but the folder layout chosen here feeds Plan 3 directly).

## Bottom line / goal

One page, `tools/u10team4-saveddata/review/allgames.html`, served by Plan 1's server, that shows
every game's derived status and keeps local data in sync with the sheet.

## Deliverable

A page that, on load or on a "Check from source" button click:

1. Fetches the current game list/data from the Google Sheet (direct `fetch` to `SYNC_URL`,
   CORS-open, same pattern the live app at `relics/u10-team4-lineup.html` already uses).
2. Compares it against what's saved locally, via the server (only the server persists to disk —
   the page itself never writes files directly).
3. Whenever the sheet's copy differs from the local copy for a game, pulls the new data down and
   updates the local JSON through the server.

There are exactly two data sources to reconcile: the Google Sheet (remote, source of truth for
in-progress/live games) and the local saved JSON (what's already been pulled for review/finalize
work). However the comparison is implemented (hash, timestamp, length, full-object diff) is an
implementation detail — pick whichever is simplest to build correctly, don't over-engineer it.

The page then derives and shows each game's status using this 5-state model:

| Status | Signal |
|---|---|
| not started | game date not yet reached / no `Lineups` row for it |
| open | `Lineups` row exists, `data.closed` is `null` (coach still playing/editing) |
| closed | `data.closed` is `{at:...}` but no local per-game folder/review page exists yet |
| reviewable | the gather-and-build step has run: local per-game folder + review page exist |
| complete | a `Finalized games` row exists for the game (`finalizedAt` non-null) |

Each row also gets Action/View columns (buttons only — this plan does **not** wire them to the
skill launcher; that's Plan 4).

## Decisions needed

1. ~~Local server or `file://`~~ — resolved by Plan 1: this page is served by the local server, no
   separate decision needed here.

2. **Where does the authoritative game schedule come from?**
   Resolved direction: from the Google Sheet, synced down by the server into local JSON — not
   scraped from `relics/u10-team4-lineup.html`'s hardcoded `GAMES` array. Implementation detail
   to settle during build: which sheet source counts as "the schedule" —
   - `listGames_()`'s output (today only includes games that already have a `Lineups` row, so it
     won't show *future, never-touched* games), vs.
   - the main "Captains & Goalies" tab (has every scheduled date, played or not).

   Recommendation: read the main tab for the full schedule, then overlay `listGames_()`/local data
   on top to derive status per game — "not started" games by definition have no `Lineups` row yet,
   so they'd be invisible if you relied on `listGames_()` alone.

## Build notes

- **Per-game local folder layout** (this plan owns creating/populating it; Plan 3 consumes it):
  recommend `tools/u10team4-saveddata/games/<game-id>/`, containing at minimum the pulled
  original-data JSON and a subfolder for any downloaded voice-capture audio. This is the folder
  path that Plan 4 will later hand to `/generate-match-review` — get the shape right here so Plan 3
  doesn't need to renegotiate it.
- Reuse the server's done-marker/poll mechanism from Plan 1 for "sync in progress" state, rather
  than inventing a second polling scheme.
- Game id format is `YYYY-MM-DD`, optionally with a `-<n>` suffix for a same-day second game
  (regex `^\d{4}-\d{2}-\d{2}(-\d+)?$`) — reuse this as-is, it's already enforced server-side in
  `.working/apps-script-sync.gs`.

## Verification

- With the server running, open `allgames.html` and confirm it lists every scheduled game (past
  and future) with a status that matches what's actually in the sheet/local folders at the time.
- Modify a game's data from the live app (or directly via a `save` call), click "Check from
  source," and confirm the page detects the change and the local folder is updated.
- Confirm no write ever happens directly from the browser — only through the server.
