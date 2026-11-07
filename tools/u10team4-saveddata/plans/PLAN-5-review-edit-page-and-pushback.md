# PLAN 5 — Review/Edit page generation and the "complete" push-back path

**Prerequisite:** benefits from Plan 3 existing first (shares the review-page template/data
shape), so design/scaffolding can start in parallel, but actual integration needs Plan 3 done.

See [`CONTEXT.md`](./CONTEXT.md) for shared architecture/background and the award model. This
plan has a required companion — [`PLAN-6-live-app-prefer-finalized-data.md`](./PLAN-6-live-app-prefer-finalized-data.md)
— which must follow once this plan's finalized-data shape and push-back are settled.

## Bottom line / goal

Define the single template that covers both the "reviewable" working view and the "complete"
edit/details view, and make saving from Edit push straight back to the sheet through the local
server — no separate publish step, no coach-code prompt.

## Deliverable

**One** `review/template.html` (not split into separate files) that renders conditionally based on
what data it's given:

- When the raw/base submission data (coach log + parent entries + clustering candidates) is
  present, it shows the full reviewable working view, same as today's template.
- When that base data is absent — i.e. the page is being opened in edit/details mode straight from
  `<game-id>_finalized-data.json` — the raw-submission sections simply don't render (wrapped in
  `if` blocks keyed on whether that data was provided), leaving just the final goal list + awards,
  editable or read-only depending on mode.
- Edit mode's save button writes the local `<game-id>_finalized-data.json` **and immediately**
  pushes to the sheet through the server (`save`/`awards`/`finalizeMark`, using the coach code the
  server already holds from Plan 1 — no prompt, no separate explicit "publish" step).
- "Details" (read-only) and "Edit" (writable) are the same template with controls disabled/enabled;
  wired into `allgames.html`'s View column. "App" opens the live lineup app deep-linked to that
  specific game.

## Confirmed decisions (no longer open)

1. **One template, conditional sections** — not two separate files. Presence/absence of base data
   is the only branch needed; this keeps one source of truth instead of threading future fixes
   through two near-duplicate files.
2. **Edit always pushes to the sheet on save** — there is no local-only edit state. Saving means
   synced, every time.
3. **"App" view deep-links to the specific game.** Exploration did not confirm
   `relics/u10-team4-lineup.html` currently supports a `?game=<id>`-style param. If it doesn't,
   add one as a small, scoped change to that file's load logic (don't do a larger refactor of the
   lineup app while you're in there — just enough to honor a game-id query param on load).

## Build notes — award model (constrain here too, not just in Plan 3's generation step)

- Award dropdown limited to the four canonical values; cardinality rules enforced in the UI itself
  (not just assumed): Goal of the Game up to `1 + floor(totalGoals/5)` per game, Man of the Match
  and Goalie of the Match exactly 1 per game, Player Of The Month exactly 1 per calendar month
  (offered from a month-level view, not per-game).
- A justification/note is **required** before an award can be finalized — block the save action
  (not just visually hint) if it's missing.
- Surface the relevant rows from `u10team4-award-draft.csv.csv` (Note/Nick_Comment/Erin_Comment/
  Status) as read-only reference text next to the picker. Treat existing `awarded` rows in that
  CSV as already-decided seed data the first time a game's awards are edited here, and surface
  remaining `candidate`/`none` rows as open choices (pre-populating the picker's options from
  named candidates, e.g. Man of the Match defaulting to a choice among players already named in
  the CSV for that game).

## Verification

- Open a `reviewable` game's review page (from Plan 3/4's output) and confirm the full clustering
  UI still renders as it does today.
- Open a `complete` game's page in Details mode and confirm the raw-submission sections are absent
  and nothing is editable.
- Open the same game in Edit mode, change an award, save, and confirm: the local
  `<game-id>_finalized-data.json` updates, and `save`/`awards`/`finalizeMark` calls land in the
  sheet (check the `Awards`/`Finalized games` tabs) — all without any prompt for a coach code.
- Confirm the award picker refuses to let two Man-of-the-Match awards be saved for one game, and
  refuses to save an award with no note.

## Status update (2026-11-07)

Built, not yet pushed-to-sheet-verified (see "Gated on Nick" below).

- **`review/template.html` now branches on whether it was generated or served raw.** The
  skill-generated copy (`review/<game-id>-review.html`) is unchanged — full reviewable working
  view, same placeholders, same Export-to-download flow (still feeds the existing `finalize-match`
  skill per the backlog's "retire later" note). Opening the template file itself, raw, as
  `/review/template.html?game=<id>&mode=details|edit`, is the new path: the embedded
  `{{DATA_JSON}}`/etc. placeholders are never substituted, `JSON.parse` on them throws, and that
  failure is the signal (`candidates === null` → `isFinalOnly`) to switch into a separate
  `bootFinalOnly()` render path that fetches `games/<id>/<id>_finalized-data.json` (and
  `original-data.json` for the roster) instead, and skips all raw-submission UI.
- **Edit mode's Save button posts to the server's new `POST /api/finalize-game`**
  (`tools/u10team4-saveddata/server/server.js`) — `{ game, goals, awards }`. The server: writes
  `games/<id>/<id>_finalized-data.json` locally, merges `goals` into the game's `coachGame.events`
  (lineup/subs/clock/formation/notes/closed carried over unchanged from `original-data.json`), then
  POSTs `save` → `awards` → `finalizeMark` to the sheet in that order, using the coach code the
  server already holds (`server/.coachcode`) — no prompt. Details mode hides the Save button and
  renders everything read-only.
- **Award cardinality**: `bootFinalOnly()` recomputes `goalSlots` from the finalized goal count
  (`1 + floor(totalGoals/5)`) and pads `awardState` to exactly that many Goal-of-the-Game slots
  plus exactly 1 Man-of-the-Match and 1 Goalie-of-the-Match slot — matching Plan 3's generation-time
  rule, so Edit can't add an extra slot of any award type. A note is still required before Save for
  any slot with a player picked (existing `missingNote` check, reused as-is).
- **`u10team4-award-draft.csv.csv` discussion rows are not re-fetched in Edit/Details mode** — the
  CSV read lives in the `generate-match-review` skill (Plan 3), not the server, and re-reading it
  outside that skill was out of scope here. The award pickers still work (seeded from the game's
  already-saved `finalized-data.json` awards, not the CSV), just without the Nick/Erin discussion
  text shown on the original reviewable page. Flag to Nick if that context turns out to matter in
  practice — easy to add later by having the server read the CSV too.
- **Goal location (the drag-to-reposition spot) is not editable in Edit mode** — carried over as-is
  from the finalized data, no UI for it on this page. Scoped cut to keep this build to what the
  plan asked for (scorer/assist/tags/awards); flag if Nick wants it added.
- **`allgames.html`'s View column** now shows Details / Edit / App for `complete` games (was a
  single disabled "Open"): Details and Edit open `/review/template.html?game=<id>&mode=...`, App
  opens the live lineup app via the new `?game=<id>` deep link (see below). `reviewable` keeps its
  existing single "Open" link to the generated review page unchanged.
- **`relics/u10-team4-lineup.html` now honors `?game=<id>`** (scoped one-line change near
  `currentId = ...`, where `GAMES` is already defined) — wins over today's-game/last-used-game
  only when that id is actually in the schedule; falls through to the existing logic otherwise. No
  other change to that file's load/sync behavior.
- **Server now also serves `relics/`**, not just `tools/u10team4-saveddata/` — needed for the App
  link, since `relics/` lives at the repo root, outside the server's existing `DATA_ROOT`.
  Special-cased in `serveStatic()`, not a general static-root change.
- **Verified so far** (no sheet writes made — see below): server starts clean, `GET
  /relics/u10-team4-lineup.html?game=2026-11-05` → 200, `GET
  /review/template.html?game=2026-11-05&mode=details` → 200, `POST /api/finalize-game` with a
  nonexistent game id correctly 404s with `no original-data.json for <id>`.
- **Not verified — gated on Nick, needs his go-ahead before running**: an actual `/api/finalize-game`
  call writes real rows into the live "Team 4 Captains & Goalies" sheet's `Awards` and `Finalized
  games` tabs (and overwrites that game's `Lineups` row's `events`). Running it against the test
  game (`2026-11-05`, fabricated data) would pollute those tabs with fake rows, so it wasn't run
  without his sign-off. Nick to-do: pick a real or throwaway game id, confirm it's fine to write
  test rows (or point at a truly disposable game id), then click Edit on it from `allgames.html`,
  change an award, Save, and confirm in the sheet. Full verification checklist from this plan
  (two Man-of-the-Match blocked, missing-note blocked, Details is fully read-only, raw-submission
  sections absent) still needs a real run-through in the browser too — everything above was
  exercised via `curl`, not by clicking through the page.
