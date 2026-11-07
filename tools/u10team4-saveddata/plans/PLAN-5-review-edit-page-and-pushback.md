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
