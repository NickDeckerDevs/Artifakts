# U10 Team 4 Lineup App — Revision Backlog

Status is checked against what's **actually live right now** at
`relics/u10-team4-lineup.html` (commit `b33cdcb`, Oct 29 — the file was reset
back to this point on 10/31 after an in-progress rewrite went sideways).
Nothing below is implemented unless marked ✅.

## 1. Data fixes

- [ ] **Field codes**: 6 games have the wrong field. `GAMES` currently has
  `4A`/`4B`/`4C` for 10/22, 11/05, 11/12, 11/19, 12/03, 12/10 — these should
  be `2A`/`2B`/`2C`.
- [ ] **10/10 game was cancelled**, not played. Currently has no score (no
  events logged), which is already the correct *effective* state, but
  nothing marks it as "Cancelled" anywhere it's listed (game picker,
  schedule) — it should read "Cancelled" instead of being blank or (once
  other fixes land) instead of showing as a tie.
- [ ] **Opponent team colors**: no color mapping exists yet. Needed:
  1=Green, 2=Light Blue, 3=Gray, 4=Purple, 5=White, 6=Dark Blue, 7=Yellow,
  8=Red, shown next to the opponent number everywhere the opponent appears.
- [ ] **Snacks hardcoded**: `SNACKS` is currently an empty object (`{}`).
  Needs the snack schedule (family + player per game date) hardcoded in as
  a JS constant — read once from the snack Google Sheet and pasted in, not
  live-synced (that's Part 2).
- [ ] **0-0 showing blank**: `finalLabel()` only shows a result if
  `x.events.length` is truthy, so a scoreless-but-played game (clock
  started, no goals) shows nothing instead of "T 0–0". Fix: also treat the
  game as "played" if `x.clock.starts` has any truthy entry.

## 2. Game header / captains / snacks display

- [ ] **Date / time / team spread out** on one line, e.g.
  `Saturday 10/31 12pm` · `White Team #5` · `Field 2B`.
- [ ] **Captain armbands**: two armband styles —
  - Captain 1: purple armband, black "C", white outline on the C.
  - Captain 2: black armband, purple "C", white outline.
  - Row: `<armband> Captain1 #X` on the left, `Captain2 #X <armband>` on
    the right.
  - **Shape correction from the user, verbatim CSS to use** (not circles):
    ```css
    .armband { border-radius: 4px; border-width: 1px; border-color: #9b4dca; color: #9b4dca; background: #000; }
    .armband-2 { border-color: #9b4dca; color: #9b4dca; }
    .cap-badges { padding: 9px 0; }
    ```
- [ ] **Snack row**: `<random snack emoji> FirstName LastName` on the
  left, second snack-family name on the right, for horizontal spacing.
  Only ONE snack row should exist per game — do not duplicate a
  "snack-row" div inside a game header block *and* keep the separate
  `snackLine` button; pick one location.
- [ ] **Random snack icon per entry** — not always 🍎. Vary the emoji per
  game/family.

## 3. Game picker (replaces the native `<select>`)

- [ ] Build a **custom-designed dropdown**, not the native `<select
  class="game-select">`. Needs:
  - A **jersey icon (SVG)** for our team and the opponent, colored by team
    color — not plain colored text or a colored pill.
  - A **result icon** before the score: win icon, tie icon, a glowing/
    pulsing ball icon for today's/live game, a plain (non-glowing) ball
    icon for a future game. (User attached reference photos of the actual
    game ball — yellow Select ball with red/purple accents — and a plain
    white practice ball, as the visual basis for the glow vs. plain
    versions.)
  - Layout per row, e.g.:
    ```
    <win icon> <purple jersey> 12–3 <dark blue jersey> #6
    Thursday            10/22 7:30p            2A
    ```
  - Must correctly show `T 0–0` (see 0-0 fix above), not blank.
- [ ] **Schedule & Snacks menu view** should use the exact same row design
  as the dropdown (currently it uses a different `.sched-row` layout) —
  one shared row renderer for both places.

## 4. Formation / field slots

Current slot is small (`min-height: 78px`), label is a faint 9px caption,
position names are spelled out ("Left Mid", "Center Mid" — not
abbreviated), and LF/RF currently use **different** colors
(`--lf-fg: #92d44e` green vs `--rf-fg: #f093be` pink).

- [ ] **Abbreviate position labels**: ST, CM, LM, RM, LB, RB, GK.
- [ ] **Much higher contrast label** — bright white, not the current faint
  gray.
- [ ] **Bigger player names and numbers.**
- [ ] **Layout**: position label and jersey number overlaid at the *top*
  of the slot (label top-left, number top-right per the user's later
  clarification), player name large in the middle. When a player is
  placed, the **entire slot background** becomes the position color
  (not just a small inner chip/button on a gray background).
- [ ] **Empty slot**: just the large position label, nothing else — no
  dash, no inner box/button chip.
- [ ] **LM and RM must be the same color** (currently different).
- [ ] **More vertical space** between rows and within each slot — this
  whole board needs to be legible without glasses.
- [ ] **One shared template**: the field view, the "who scored" picker,
  "register assist" picker, and the sub/move picker are currently **three
  separate, independently-coded** implementations of "a board of 7
  position slots, filled or empty" (`render()`'s field block uses
  `.slot`/`.chip`/`.empty`; `pickField()` — used for goal scorer and
  assist — uses a totally different `.pf`/`.pf-btn`/green-background
  treatment; `renderMoveSheet()` has a third variant of the same idea).
  These need to be **merged into one function** so they're guaranteed to
  look identical and stop drifting apart. This is a structural fix, not
  just a visual one — see the Architecture note in `HANDOFF.md`.

## 5. Goal flow

- [ ] When picking "who scored," the picker sheet should come up **most of
  the way up the screen**, not stop halfway — a direct consequence of the
  formation board actually being made bigger (item 4).
- [ ] Same requirement for **Register Assist** — same template, same size.
- [ ] Q1–Q4 buttons (for assigning/reassigning which quarter a goal
  belongs to) should be **square and spread out**, not a cramped row.
  (Goal-quarter editing itself — `data-goalq`, `data-editgoal`, the "✎
  Edit" button on a logged goal — already exists and works; this is a
  layout request on top of it, not new functionality.)
- [ ] **Goal details (shot tagging) screen** — replace the category list
  with:
  - **Set piece**: penalty, free kick, from corner, from throw-in, from
    goal kick
  - **Free play**: open play, counter attack, stole ball, breakaway,
    scramble, rebound, long pass, chaos
  - **The setup**: one-on-one, dribbled the keeper, fought for it, skill
    move, fake shot, nutmeg, rainbow flick
  - **Contact**: left foot, right foot, left leg, right leg, crotch, body,
    header
  - **The shot**: short shot, power shot, blake shot (sic), volley,
    half-volley, chip, long shot, dribbled in
  - **Where it went**: top bin, high, mid, low, near post, far post,
    deflected, off the post/bar, between legs, off defender, chaos in goal
  - Bigger text throughout this screen; OK for it to scroll — keep the
    Done button reachable at the bottom.
  - (Assist-detail categories were also revised at one point to: Assist
    type / Set piece-Free play / The setup / Contact / The shot / Where it
    went — confirm with the user which category set is final before
    building, since two slightly different versions were discussed across
    messages.)

## 6. Player stats

- [ ] Add **position columns** to the stats table (currently: Player, GP,
  Min, G, A, GK only) — one column per position (GK, LB, RB, LM, CM, RM,
  ST) so the coach can see every position a kid has played, not just
  goalie.
- [ ] Make the Player name column narrower so stat columns aren't
  squeezed.
- [ ] **Stats must be shared across everyone, not per-phone.** This is the
  big one — see `HANDOFF.md` → "Why stats look wrong" for the root cause
  (stats are computed from whatever games happen to be cached in
  `localStorage` on the one device that's open, and there's no "pull every
  past game" step — only the currently-selected game gets pulled from the
  sync backend). This needs an actual sync-model change, not a UI tweak;
  scope it as part of the refactor, not a quick patch.

## 7. Clock

- [x]/[ ] **Keep 4 quarters in the data model** (`PERIODS = ['Q1','Q2',
  'Q3','Q4']`, `QTR_SECS = 15*60`) — do **not** collapse this to 2 halves.
  An earlier attempt at "the clock should be by the half" mis-read this as
  a structural change to 2 periods, which broke things and was reverted.
  The actual ask, confirmed: **display only**. Q1+Q2 should be labeled
  "1st Half" and Q3+Q4 "2nd Half" in the clock UI; the underlying 4-quarter
  data, goalie-rotation-by-quarter, and playtime-by-quarter tracking all
  stay exactly as they are.
- [ ] Clock controls simplified to: **Start → End first half → Start
  second half → Change time → Undo** (the user described a 25-min /
  halftime / 25-min referee pattern as the real-world mental model, even
  though the data keeps 4 quarters under the hood).
- [x] **Goals are tracked by real clock time, not by which tab is
  selected** — this already works (`quarterAt()`, `goalQ()`, kickoff-time
  based `advanceTo`/`qStartEst`), confirmed present in the current live
  file (commit `a4982cc`, "clock runs off kickoff time, goals follow real
  time").

## 8. Other / already working — do not re-break

These exist in the current live file and should be preserved as-is
through any refactor:
- [x] Goal quarter can already be changed after the fact (`data-editgoal`
  → `goal-edit` action → per-event quarter pills).
- [x] Clicking a game in the schedule can show its score/players (via the
  sched-row → opening that game). Confirm this still works after the
  custom dropdown replaces the schedule row renderer.
- [x] Team name per game can be changed via the sheet (`TEAM_NAMES`), not
  from the live game view — keep it that way, don't add in-game editing.

## 9. Explicitly deferred to Part 2 (not for tomorrow's game)

- Single source-of-truth spreadsheet (merging the snack sheet and the
  captains/goalies sheet so there's one sheet to manage).
- An Apps Script (or similar) that live-updates the app when the snack
  sheet changes, instead of hardcoding snacks as a JS constant.
- Possibly moving the whole app's backend onto the Supabase instance
  already used for the "sideline app" project, instead of
  Google-Sheets-as-database.
- Full stats-sync fix (see item 6) may end up living here depending on
  scope, but the user wants it scoped as part of the refactor — confirm
  before deferring it further.
