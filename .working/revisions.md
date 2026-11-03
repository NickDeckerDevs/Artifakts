# U10 Team 4 Lineup App — Revision Backlog

Merged from the root `revision.md` (duplicate, now deleted) and
`.working/revisions.md`. Status below is current as of 2026-11-02, checked
against the actual commit history of `.working/lineup-refactor.html` — see
`.working/decisions.md` for what resolved each item and `.working/backlog.md`
for what's still open before Thursday's game (11/5).

**Note:** everything marked done below is done in `.working/lineup-refactor.html`
only. It has not yet been cut over to the live file (`relics/u10-team4-lineup.html`)
— that cutover is itself tracked in `backlog.md`.

## 1. Data fixes

- [x] **Field codes** — 2A/2B/2C corrected. (`decisions.md` #1)
- [x] **10/10 game was cancelled** — now reads "Cancelled". (`decisions.md` #1)
- [x] **Opponent team colors** — color mapping added. (`decisions.md` #1)
- [x] **Snacks hardcoded** — real snack schedule hardcoded in, corrected from
  latest CSV. (`decisions.md` #1)
- [x] **0-0 showing blank** — now shows "T 0–0". (`decisions.md` #1)

## 2. Game header / captains / snacks display

- [x] **Date / time / team spread out** on one line. (`decisions.md` #2)
- [x] **Captain armbands** — purple/black + black/purple styles, per the
  verbatim CSS given. (`decisions.md` #2)
- [x] **Snack row** — single row, no duplication. (`decisions.md` #2)
- [x] **Random snack icon per entry.** (`decisions.md` #2)

## 3. Game picker (replaces the native `<select>`)

- [x] Custom dropdown with jersey SVG icons, result icon, shared row layout.
  (`decisions.md` #3)
- [x] Schedule & Snacks menu view uses the same shared row renderer.
  (`decisions.md` #3)

## 4. Formation / field slots

- [x] Abbreviated position labels, higher-contrast labels, bigger
  names/numbers, label+number overlay layout, filled-slot background color,
  empty-slot simplification, LM/RM same color, more vertical space, one
  shared board renderer for field/pickField/move-sheet. (`decisions.md` #4)
- [ ] Border + lighter-opacity green background on the formation board —
  **declined by Nick, not needed** ("we don't need this"). Leaving unchecked
  but closed, not open work. (`decisions.md` #4)

## 5. Goal flow

- [x] Who-scored / Register Assist sheets open most of the way up the screen.
  (`decisions.md` #5)
- [x] Q1–Q4 buttons square and spread out. (`decisions.md` #5)
- [x] Goal details (shot tagging) screen replaced with the final category
  set. (`decisions.md` #5)
- [x] **Assist Details** — built as its own tagging screen (`ASSIST_TAGS`),
  styled to match the shot screen. (`decisions.md` #5)

## 6. Player stats

- [x] Position columns added, player name column narrowed. (`decisions.md` #6)
- [x] **Stats shared across everyone, not per-phone** — `syncAllGames()`
  pulls every game from the sheet instead of only the current one.
  (`decisions.md` #6)

## 7. Clock

- [x] 4 quarters kept in the data model; UI labels Q1+Q2 "1st Half" and
  Q3+Q4 "2nd Half". (`decisions.md` #7)
- [x] Goals tracked by real clock time, not by selected tab (pre-existing,
  confirmed still intact). (`decisions.md` #7)

## 8. Other / already working — preserved

- [x] Goal quarter can be changed after the fact.
- [x] Tapping a game in the schedule opens that game.
- [x] Team name per game changes via the sheet, not in-game.

## 9. Goalie rotation trust (raised separately by Nick, not in the original list)

- [x] Algorithm explained and verified against Nick's stated rule (captains
  goalie one quarter each, two more players brought in by fewest season
  quarters). (`decisions.md` #8)
- [x] "Recalculate goalie plan" menu item added, pulls every game first.
  (`decisions.md` #8)

## 10. Awards (new ask, not in the original list)

- [x] Sheet-driven Awards system built: in-game award block, Awards menu
  (by player / by award), Awards column in Player Stats. (`decisions.md` #9)
- [ ] **Blocked on Nick**: Awards tab doesn't exist in the real sheet yet;
  `AWARDS_CSV` is an empty stub. See `backlog.md`.

## 11. Explicitly deferred (not for Thursday)

- Single source-of-truth spreadsheet (merge snack sheet into Captains &
  Goalies sheet).
- Live snack-sheet sync via Apps Script.
- Possible Supabase migration.

These are documented in `HANDOFF.md` → "Deferred" and are not tracked as
open backlog items for this week.
