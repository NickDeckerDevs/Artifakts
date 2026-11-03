# U10 Team 4 Lineup App — Backlog Before Thursday (11/5)

Everything in `revisions.md` is done in `.working/lineup-refactor.html` (see
`decisions.md`). What's left before the next game:

## 1. Cut `.working/lineup-refactor.html` over to the live file
`relics/u10-team4-lineup.html` on `main` still reflects the 10/29 state —
none of the work in `decisions.md` is live yet. GitHub Pages serves `main`
instantly, so this is a real production deploy, not a minor push. Needs:
- A final read-through / diff against `revisions.md` to confirm nothing
  regressed (the "already working — don't re-break" list in `revisions.md` #8).
- Your explicit go-ahead before merging to `main`, per standing instructions.

## 2. Awards — needs the real sheet
The feature is fully built but inert (`AWARDS_CSV` is an empty stub). To
turn it on:
- Create an "Awards" tab in the "Team 4 Captains & Goalies" spreadsheet,
  columns `Date | Award | Player | Note` (optionally import
  `.working/awards-seed.csv` to backfill October).
- Publish that tab to the web as CSV (Sheet → that tab → File → Share →
  Publish to web → CSV) and send the link so `AWARDS_CSV` can be wired up.
- Once wired: add one test award row for a past game, confirm it shows in
  that game's view, "By player," "By award," and the Player Stats column,
  then remove the test row.

## 3. Verification pass (on-device, before game day)
None of this has been checked in a real browser yet this session:
- **Assist Details** flow end to end (pick assist → tag screen → styling
  matches the shot screen).
- **Goalie sync fix** — confirm `syncAllGames()` actually pulls every game
  on a fresh device/`localStorage`, and that the Player Stats totals match
  across two different phones.
- **Recalculate Goalie Plan** menu item — confirm it shows the right four
  names with correct season goalie-quarter counts for an upcoming game.
- **Awards**, once the sheet is published (see #2).

## 4. Declined / no action needed (listed so they don't get re-opened)
- Captain armband colors — fine as-is, no further changes wanted.
- One-line date/time/field mockup — already covered by the spread-out
  header, no further changes wanted.
- Formation-slot border / green-opacity separation — not needed.

## 5. Explicitly deferred past this week
Single source-of-truth spreadsheet, live snack-sheet Apps Script sync,
possible Supabase migration — see `HANDOFF.md` → "Deferred". Not scoped for
Thursday.
