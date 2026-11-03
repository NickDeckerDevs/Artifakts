# U10 Team 4 Lineup App — Decisions Log

Maps each completed group of items in `revisions.md` to what was actually
built and which commit(s) did it. All commits are on `.working/lineup-refactor.html`
unless noted; nothing here is live on `relics/u10-team4-lineup.html` yet.

### 1. Data fixes — `66367f1`, `b927a10`, `c81cfb4`
Field codes corrected to 2A/2B/2C, 10/10 marked "Cancelled", opponent color
mapping added, 0-0 games now show "T 0–0" (fixed by also treating a game as
played if `clock.starts` has any entry, not just `events.length`). Snack
schedule hardcoded and later corrected against the latest CSV Nick sent.

### 2. Game header / captains / snacks — `64bb16d`
Date/time/team spread across one line. Captain armbands built to the exact
verbatim CSS Nick gave (purple armband/black C/white outline for captain 1,
reversed for captain 2). Snack row consolidated to one location with varied
emoji per entry.

### 3. Game picker — `c81cfb4`
`gameCardHTML()` is now the single shared renderer for the game picker, the
schedule view, and the main page — jersey SVG icons (not colored text/dots)
and a result icon (win/tie/live-pulsing-ball/plain-ball) replace the old
native `<select>` and the separate `.sched-row` layout.

### 4. Formation / field slots — `9ed8ac3`, `b927a10`
One shared formation-board renderer now backs the live field view, the
who-scored/assist picker, and the sub/move sheet — previously three
independent implementations (`.slot`/`.pf`/`renderMoveSheet`'s inline
`spot()`). Labels abbreviated (ST/CM/LM/RM/LB/RB/GK), high-contrast white
text, bigger names/numbers, label+number overlaid at the top of a slot whose
entire background fills with the position color once occupied, LM/RM
unified to one color, more vertical breathing room throughout.

**Declined, no action taken**: border + lighter-opacity green background —
Nick confirmed when reviewing `export-asks.txt` that this isn't needed
anymore ("we don't need this").

### 5. Goal flow — `b927a10`, `e67baa3`, `086ef75`, `48e3ceb`
Who-scored/Register Assist sheets now open most of the way up the screen
(direct result of the bigger formation board). Q1–Q4 quarter-assignment
buttons are square and spread out. Shot-tagging screen rebuilt with the
final category set (Set piece / Free play / The setup / Contact / The shot /
Where it went).

**Assist Details** — this was flagged mid-session as *not* actually
resolved by the shot-tag system (Nick: "We still need the assist detail. It
was not implemented."). Built as its own screen: `ASSIST_TAGS` (flat list:
Short pass, Pass, Long pass, Through ball, Big air, Multiple passes),
`openGoalAssistTags()`, mirrors the shot-tag data model (`e.assistTags`).
Initially rendered with the wrong pill styling (generic green instead of
the shot screen's purple/white-border look) — fixed in `48e3ceb` by wrapping
the pills in `.shot-tags`.

### 6. Player stats — `1615672`, `74a7f52`, `086ef75`
Position columns (GK/LB/RB/LM/CM/RM/ST) added, player name column narrowed.

**Stats sync** — root cause confirmed by reading the code directly: each
device's `localStorage` only had full data for games *that device* had
opened; `seasonStats()` only aggregated `local.games` on that one device.
Fixed by adding `syncAllGames()`, which loops every id in `GAMES` and pulls
it from the existing `SYNC_URL` Apps Script endpoint (same one `saveToSheet()`
already used — no new backend needed). Called from Player Stats, from app
startup for the coach, and from the new Recalculate Goalie Plan action (#8).
Also added `.working/import-stats.html`, a standalone local tool (Parse →
Review → Import) so a one-time backfill of previously-exported game data can
be pushed into the sheet without adding an in-app import button Nick didn't
want.

### 7. Clock — `36bc37a`
4-quarter data model (`PERIODS`, `QTR_SECS`) left untouched — an earlier
attempt had mistakenly collapsed this to 2 halves and was reverted
(`ae15ea1`, `1ae9718`). Display-only fix: clock UI now labels Q1+Q2 "1st
Half" and Q3+Q4 "2nd Half" via `halfOf()`, with `q-end` buttons reading "End
1st Half (break)" / "End 2nd Half (final whistle)" etc. Real-time-based goal
quarter assignment (`quarterAt()`, kickoff-time `qStartEst`) was already
working and is unchanged.

### 8. Goalie rotation trust — `086ef75`
Nick doubted the rotation algorithm's picks (specifically Ethan/Jaxon's
recorded history) and gave his own rule: every captain plays goalie for the
quarter they're captain (captains serve two games in a row), plus two more
players brought in by fewest season goalie-quarters for the other two
quarters. Traced `goaliePlan()` directly: it ranks present non-captain
players by `gkSeason()` (fewest total quarters) → `captainSoon()` → `gkLast()`
→ last-name alphabetical, takes the top `need` as `upNext`, and assembles
`[Captain 1, upNext[0], Captain 2, upNext[1]]` — this **matches** Nick's
stated rule structurally. The actual problem was its input data
(`gkSeason()`/`gkLast()` reading from `local.games`), which has the exact
same per-device gap as the stats-sync issue in #6 — same fix (`syncAllGames()`)
resolves both. Added a coach-only "Recalculate goalie plan" menu item
(`openRecalcGoalies()`) that re-pulls every game from the sheet on demand and
shows the resulting plan with each pick's season goalie-quarter count, so
Nick can verify the numbers himself before a game.

### 9. Awards — `ce1b756`, `df7895e`, `c1216f5`
New sheet-backed feature (not in the original `revisions.md`/`revision.md`
list — came from a separate conversation about per-game awards). One new
"Awards" tab planned in the Captains & Goalies spreadsheet: `Date | Award |
Player | Note`, published as its own CSV, read the same way the roster tab
already is (`SHEET_CSV`/`applySheet()`/`syncSheet()` pattern — no new Apps
Script, no new auth). `Date` is either a game id or a `YYYY-MM` month, which
is how Player of the Month shares the same table as per-game awards without
a second tab or a code change for new award names.

Three display surfaces built: an in-game award block (only shown when that
game has awards), an "Awards" menu item with By-player/By-award tabs, and an
"Awards" column in Player Stats (icon+count per award type, tap a row to
open the full by-player breakdown). Player matching uses `cleanName()` —
the same first-name-as-key validation used everywhere else in the app
(captains, goalie overrides, snacks); see the live conversation for the
caveat that this breaks if two players ever share a first name, which isn't
currently a problem (12 unique first names on the roster).

**Correction mid-build**: an early version seeded 23 placeholder award rows
directly into the JS as a hardcoded fallback array (`065f978`), mirroring
the existing `TEAM_NAMES`/`CAPTAINS` fallback pattern. Nick explicitly
rejected this — he wanted the seed data as a CSV to import into the real
sheet, not hardcoded into the app. Reverted (`df7895e`) and replaced with
`.working/awards-seed.csv`.

**Still blocked on Nick**: the Awards tab doesn't exist in the real
spreadsheet yet, so `AWARDS_CSV` is an empty stub and the feature is inert
in production. Tracked in `backlog.md`.
