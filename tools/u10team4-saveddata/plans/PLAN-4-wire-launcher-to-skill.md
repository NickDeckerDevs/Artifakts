# PLAN 4 — Wire Plan 1's server to Plan 3's skill, surface in Plan 2's page

**Prerequisite: Plan 1 AND Plan 3 must be done first** (and ideally Plan 2, since the trigger
buttons live on its page).

See [`CONTEXT.md`](./CONTEXT.md) for shared architecture/background.

## Bottom line / goal

Replace the throwaway test skill from Plan 1 with the real `/generate-match-review`, and add
working "Start Review" / "Secondary Review" buttons to `allgames.html` that launch it via the
server.

## Deliverable

`allgames.html`'s Action column buttons call the server's `/run-skill` endpoint (built in Plan 1)
with the selected game's per-game folder path (`tools/u10team4-saveddata/games/<game-id>/`, from
Plan 2) and `generate-match-review` as the target skill. On completion (via the same
done-marker/poll mechanism Plan 1 built), the page refreshes that row's status from
`closed`/`open` to `reviewable` and surfaces a link to the newly opened review page.

## Confirmed decisions (no longer open)

1. **"Start Review" vs. "Secondary Review" are the same skill invocation, with different
   preconditions on when they're offered.** "Start Review" fires with the first-time-synced
   folder, offered once a game is `closed`. "Secondary Review" is only offered once a game is
   already `complete`, and does **not** touch the existing finalized data — it just re-runs the
   gather+build step to produce a fresh review pass, leaving the completed data alone until Nick
   re-saves via Edit (Plan 5).

2. **"Edit" (for `complete` games) is pure client-side — no server skill launch.** It only loads
   and modifies already-finalized data; there is no re-gathering step, so it never calls
   `/run-skill`. Full Edit behavior is defined in Plan 5 — this plan must not wire an Action button
   for Edit into the launcher.

3. **Payload is a folder path**, matching Plan 2/3's organization — no inlined JSON, no list of
   individual URLs.

## Build notes

- The status transition this plan is responsible for driving in the UI: `closed` → (Start Review
  clicked) → "running" (disable the button, show progress via the poll) → `reviewable` (show the
  review-page link). Same transition shape for `complete` → (Secondary Review clicked) → "running"
  → `reviewable` again (a fresh review pass, not overwriting the prior finalized data).
- Don't duplicate the polling logic Plan 1/2 already built — this plan should be mostly wiring,
  not new infrastructure.

## Verification

- From `allgames.html`, click "Start Review" on a `closed` game, confirm the server launches
  `/generate-match-review` with the correct folder path, and confirm the page transitions that
  row's status to `reviewable` once the run finishes, with a working link to the generated review
  page.
- Click "Secondary Review" on a `complete` game and confirm the existing
  `<game-id>_finalized-data.json` is untouched afterward (diff it before/after).

## Status update (2026-11-07)

- Launcher wiring is in place in `review/allgames.html` (Start Review / Secondary Review buttons,
  `/run-skill` POST, 3s poll).
- Server-side commit added to `/run-skill` (see PLAN-1 status update). The Start Review run for
  `2026-11-05` finished `done` with `committed: true`.
- Not yet verified: clicking the buttons in the browser (the run was triggered via curl), the
  `reviewable` status transition in the page, and Secondary Review on a `complete` game.
