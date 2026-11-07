# PLAN 6 — Live app must prefer finalized data over raw coach data

**Prerequisite: Plan 5** (needs the finalized-data shape/push-back settled first).

See [`CONTEXT.md`](./CONTEXT.md) for shared architecture/background.

## Bottom line / goal

`relics/u10-team4-lineup.html` currently has no concept of "this game's data has been finalized"
— it always shows the coach's raw `Lineups` blob. Once Plan 5 starts pushing finalized goals/
awards back to the sheet, the phone app needs to detect that and show the finalized version
instead of the pre-review raw log. This does not exist in the app today and must be added.

## Deliverable

A scoped change to `relics/u10-team4-lineup.html`'s load path: when pulling a game, check whether
finalized data exists for it (e.g. via the `Finalized games` tab, or whatever read Plan 5's
push-back already supports) and, if so, render from the finalized goals/awards instead of the raw
`Lineups` blob — falling back to the raw data exactly as today for any game that hasn't been
finalized yet.

## Scope

Read/display path only. This plan does **not** change how coaches log games live (the active
in-game logging UI is untouched) — only how an already-finalized game is *displayed* afterward
(e.g. in a post-game summary view, or whenever that game is reopened after the fact).

## Build notes

- Check at implementation time exactly what signal is cheapest to read for "is this finalized" —
  `listGames_()` already exposes `finalizedAt` per game; `pullGame()` (`relics/u10-team4-
  lineup.html` ~line 816) may need a small addition to also fetch/check this, or a second request
  against the `Finalized games` tab.
- If Plan 5 added a `?game=<id>` deep-link param to this same file, coordinate with that change
  rather than duplicating load-path logic — both plans touch `pullGame()`/the initial load
  sequence.
- Keep the fallback explicit: any game without finalized data must render exactly as it does
  today. Don't change the rendering path for `open`/`closed`/`reviewable` games.

## Verification

- Load the live app for a game that has finalized data pushed back (from Plan 5's testing) and
  confirm it shows the finalized goals/awards, not the raw coach log.
- Load the live app for a game with no finalized data and confirm nothing changed from current
  behavior.
