# U10 Team 4 Lineup App — Functionality Handoff

For whoever (human or Claude) picks this up next in a fresh repo/session.
Pair this with `revision.md` (the backlog of what's been asked for and
what's actually done).

## What this is

A single self-contained HTML file —
`relics/u10-team4-lineup.html` in `NickDeckerDevs/artifakts` — used
sideline, on a phone, to run lineups for a U10 boys rec soccer team
(Team 4). No build step, no framework, no bundler: one `<script>` tag,
vanilla JS, template-literal HTML strings rendered into a handful of
container divs. Deployed via GitHub Pages straight from `main`, live at:

```
https://nickdeckerdevs.github.io/Artifakts/relics/u10-team4-lineup.html
```

There's also `relics/lineup-manager-v0.html` (an earlier, separate rec
team's version — not this one) and `relics/line-refactor.html`, which is
currently just an untracked, unused clone of the live file left over from
an abandoned in-session rewrite attempt — safe to delete or repurpose.

## Who uses it, and how permissions work

- **Coach (Nick)**: full edit access. Gated by a "coach code" stored in
  `localStorage` (`lineup:coach`), set by visiting the page with
  `#coach=CODE` in the URL once.
- **Parents/viewers**: read-only by default (`isViewer()` = anyone without
  the coach code, when `SYNC_URL` is set). They *can* submit goal entries
  from the sideline (a lightweight "I saw a goal" report) which queue up
  for the coach to confirm/merge, but can't otherwise edit the lineup.
- **Follow mode**: a parent can switch to a read-only "just show me what's
  happening" view that polls the synced game state without any editing UI.
- **Test mode** (`?test` in the URL): completely separate `localStorage`
  namespace (`lineup:...:test`), `SYNC_URL` forced empty so nothing ever
  touches the real sheet/sync backend. Has its own reset button. Good for
  development — **always build/test here, never against the real game
  data.**

## Data model

Everything funnels through two kinds of "database":

### 1. Hardcoded JS constants (edit the file to change these)
- `PLAYERS` — roster, with `likes`/`avoid` position tags (from a parent
  intake form).
- `GAMES` — the season schedule: id (the game date, used as the primary
  key everywhere), day, time, opponent, field, optional note.
- `CAPTAINS` — two captain names per game id.
- `NUM` — jersey numbers by player name.
- `LAST` — last names (for alphabetical tie-breaking in the goalie
  rotation).
- `SNACKS` — currently **empty**; meant to be hardcoded family/player per
  game id (see `revision.md` item 1).
- `FORMATION` / `POS` / `FORMATIONS` — the 7 storage slots (`lf`,
  `striker`, `rf`, `cmid`, `def1`, `def2`, `goalie`) and how each named
  formation (`231`, `312`) relabels and arranges them. **Important**: the
  storage keys never change when you switch formations — only their
  display label/position/color do. Any refactor of the field-rendering
  code should keep that invariant, since saved lineups depend on it.
- `GOALIE_LOG` — manually backfilled goalie-quarter history from games
  played before the app tracked it.

### 2. Google Sheets (the actual "database")
Two separate sheets, **not currently merged** (that's the Part 2 ask):

- **"Team 4 Captains & Goalies"** — published-to-web CSV
  (`SHEET_CSV`), pulled read-only via `applySheet()` on load. This is the
  master for captains, logged goalie quarters, goalie overrides, and
  jersey numbers; the hardcoded JS constants above are the *fallback* when
  this sheet can't be reached, not the source of truth.
- **Snack schedule sheet** — a *different* spreadsheet
  (`EDIT_SHEET` links to it). Currently **not read by the app at all** —
  it's meant to be copied by hand into the `SNACKS` constant for now.

### 3. Lineup sync (Apps Script, `SYNC_URL`)
A Google Apps Script web app backed by the same spreadsheet, with a
"Lineups" tab:
- **Read**: anyone — `GET {SYNC_URL}?action=get&game={id}` returns the
  saved lineup/events/clock/subs/etc. for one game.
- **Write**: coach-only (gated client-side by `canEdit()` / the coach
  code; the Apps Script itself may or may not also check a secret —
  verify before assuming server-side enforcement).
- **This only happens for the currently selected game.** `pullGame()`
  fires on load and whenever you switch games via the picker — it pulls
  *that one game*. There is no "sync everything" call. This is the root
  cause of the stats-look-wrong complaints in `revision.md` item 6: each
  phone's `localStorage` cache (`local.games`) only has full data for
  games that phone has actually opened at some point. `seasonStats()`
  (used by the Player Stats sheet) only aggregates across
  `local.games` on *that* device. Two people's phones can show two
  different stat totals if they haven't both opened every game.
- A parent/viewer can also push lightweight "goal spotted" entries via a
  separate `entries` sync path, which the coach's device polls and offers
  to merge into the real event log (`groupedEntries()`,
  `acceptGroup()`/`dismissGroup()`/`mergeMatched()`) — a dedup heuristic
  matches side+quarter+scorer+timestamp-proximity.

**If you're fixing the stats-sync problem**, the shape of the fix is
either: (a) add a "pull every game id in `GAMES`" sync call instead of
just the current one, run on load or on-demand from the stats sheet, or
(b) change the Apps Script to serve a single "all games" aggregate
endpoint instead of one-game-at-a-time, so `seasonStats()` doesn't depend
on what's locally cached at all. (b) is almost certainly the right
long-term shape, especially if this moves to Supabase per the Part 2 deferral.

## State & persistence

- `local` = the whole `localStorage` blob for this device:
  `{ currentGame, games: { [id]: gameState } }`.
- `g` = the currently-active game's state object, kept in sync with
  `local.games[currentId]`.
- A game's state: `{ lineup, out, events, clock, subs, gkPicks,
  formation, notes, closed, reviewed, savedAt }`. `lineup` is an array of
  4 (one per quarter), each `{ [slotKey]: playerName | null }`.
  `events` is the goal log (side, scorer, assist, quarter, clock time,
  shot tags, spot coordinates). `clock` is `{ starts: [4], ends: [4] }`
  timestamps. `subs` is a time-ordered log of mid-quarter lineup changes,
  which is how "who's actually on the field right now" is derived
  (`nowLineup()`) separately from "who started the quarter"
  (`g.lineup[q]`).
- `save()` writes to `localStorage` and, if coach + sync is on, pushes to
  the Apps Script.

## Clock & goal-timing model

Already does something fairly sophisticated, worth preserving:
- `QTR_SECS = 15*60` (15-min quarters), `BREAK_SECS = 60` (1 min between).
- A quarter's clock can start from "now" or from a **typed kickoff time**
  (`qStartEst`/`setQuarterStart`), and `quarterAt(timestamp)` maps any
  real-world timestamp back to which quarter it falls in. This is what
  lets a goal be logged "by the actual time it happened" rather than by
  whichever tab happens to be selected (`goalQ()`, `reassignGoals()`).
  **Do not regress this** — an earlier edit session nearly collapsed the
  4-quarter data model into 2 halves while trying to satisfy a "clock by
  the half" request; the correct fix is display-label-only (see
  `revision.md` item 7).

## Known architecture problem (read before refactoring)

There isn't one "draw a formation board" function — there are (at least)
three independent implementations of the same idea that have drifted
apart visually and behaviorally:

1. `render()`'s field-building block — the live field view. Uses
   `.slot` / `.slot-label` / `.chip` / `.empty`.
2. `pickField()` — used by both "who scored" and "register assist."
   Uses a completely different `.pf` / `.pf-row` / `.pf-btn` treatment
   (green background box).
3. `renderMoveSheet()`'s inline `spot()` function — the sub/move-player
   sheet. A third variant, again using `.pf-btn` but with different state
   (shows who's currently in each spot, highlights source/destination).

There's a second, smaller cluster of near-duplicates: the three
"pick one bench player to fill one position" lists (`openSlot()`'s
empty-slot picker, the live sub-now picker, and the goalie picker) — these
currently all use `.chip` so they look consistent today, but they're
still three separately-coded blocks of near-identical logic and will keep
drifting if left alone.

**Recommended shape for the refactor** (this is a direction, not a
prescription — the user explicitly does not want hyper-literal function
signatures imposed from outside): write one shared function that renders
"a formation board — N slots, each filled or empty, tappable or not,
styled consistently" and have all three Family-1 call sites use it. Same
for the Family-2 bench-picker lists. The goal is that a visual change
(bigger text, new slot layout, new colors) only ever needs to happen in
one place. Verify the merge by actually rendering all call sites
(screenshot or visual diff) before and after — the three are currently
*visually* different, so "it still compiles" is not sufficient proof
nothing broke.

## Deployment / git notes

- Repo: `https://github.com/NickDeckerDevs/artifakts` (note: GitHub
  reports it as moved/renamed to `NickDeckerDevs/Artifakts` — the old
  remote URL still works via redirect, but point any new clone at the
  capital-A form).
- GitHub Pages serves straight off `main` — **any push to `main` is
  instantly live.** There is no staging branch, no PR gate, no CI. Treat
  every push to this file as a production deploy.
- Commit convention in this repo: authored as `nicholas decker
  <nickdeckerdevs@gmail.com>`, no AI co-author trailer. (This is a
  standing requirement from the repo owner, independent of whatever
  default attribution a given tool wants to add — override it.)
- Given there's no staging, the safest workflow for any nontrivial
  rewrite is exactly what was done tonight after things went wrong: do
  the work in a separate untracked/unreferenced file (not linked from
  `toc.json`, so it never deploys), get it fully verified, and only then
  replace the live file's contents in one clean commit — rather than
  iterating directly on the live file.

## Things that already work — don't re-break them

- Goal quarter reassignment (editing which quarter a logged goal belongs
  to) after the fact.
- Kickoff-time-based clock / goals-by-real-time.
- Goalie rotation planning (`goaliePlan()`), including overrides from the
  sheet and "who's up next" / "alternates" logic.
- Parent goal-spotting → coach merge/dedup flow.
- Formation switching (`231` vs `312`) without losing saved lineups,
  because storage keys are formation-independent.
- Close-out / Follow mode / viewer read-only gating.
