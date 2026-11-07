# Context — finalize-match overhaul

Shared background for [PLAN-1](./PLAN-1-local-server-bootstrap.md) through
[PLAN-6](./PLAN-6-live-app-prefer-finalized-data.md). Read this before picking up any of them.

## Why this exists

`finalize-match` (`.claude/skills/finalize-match/SKILL.md`) is a single, no-argument, fully
interactive skill: it lists games from the sheet, asks Nick to pick one, pulls coach/parent/voice
data, clusters it with a Haiku subagent, generates a static review HTML from
`tools/u10team4-saveddata/review/template.html`, waits for Nick to review in-browser and export a
JSON, then writes back to the sheet (`save`/`awards`/`finalizeMark`). This is clunky to drive by
hand every time and conflates "which game needs attention" (a listing/status problem) with "do the
data-gathering work" (the skill's real job).

**`finalize-match` is left alone and untouched.** Removing/retiring it is out of scope for this
round — see [`backlog.md`](./backlog.md).

## Architecture: one local Node server is the backbone

All of this is built around **one small, self-contained local server** (plain Node, no Docker, no
persistent-daemon requirement beyond "it's running while you use it") that Nick starts with a
single terminal command. It does four jobs at once:

1. Serves the static tooling pages (`allgames.html`, review/edit pages) over `localhost`.
2. Owns syncing between the Google Sheet and local JSON — it is the only thing that writes to
   `tools/u10team4-saveddata/`'s data files. Pages can read sheet data directly via `fetch`
   (Apps Script responses are CORS-open, same pattern the live app already uses), but
   **persisting** anything locally always goes through the server.
3. Is the HTTP listener that launches Claude Code skill runs headlessly: `POST` an endpoint with a
   skill name + args/folder path; the server shells out to `claude -p ...`, waits, commits the
   result. This replaces any "generate a script for Nick to double-click" approach entirely — one
   deployable, self-contained mini-server handles it all, no Windows registry/URI-scheme tricks,
   no container to manage.
4. **Holds the coach code locally** (read once from a local, gitignored config file on Nick's
   machine) and uses it directly for every `save`/`awards`/`finalizeMark` call it makes on Nick's
   behalf. Because the server only ever runs on Nick's own machine as something he starts, there's
   no one else to prompt and no reason to ask for the code per run.

**"No feedback" / headless, defined precisely:** when the server triggers a skill run, the Claude
Code window that runs does not ask the user anything — the server sends it every piece of data the
skill needs up front (arguments / a folder path), so the run completes end-to-end unattended.

## Game status model (derived, not an explicit field)

| Status | Signal |
|---|---|
| not started | game date not yet reached / no `Lineups` row for it |
| open | `Lineups` row exists, `data.closed` is `null` (coach still playing/editing) |
| closed | `data.closed` is `{at:...}` but no local per-game folder/review page exists yet |
| reviewable | the gather-and-build step has run: local per-game folder + review page exist |
| complete | a `Finalized games` row exists for the game (`finalizedAt` non-null) |

## Known facts from exploration (paths relative to `c:\Users\nickd\repos\artifakts`)

- `tools/u10team4-saveddata/` already has `plans/` and `testarea/` (both were empty before this
  planning pass), one real `2026-11-05_original-data.json`,
  `review/2026-11-05-review.html` + `review/template.html`, `transcribe/transcribe.py`.
- The game **schedule** (which dates are real games) should be sourced from the Google Sheet, not
  scraped out of `relics/u10-team4-lineup.html`'s hardcoded `GAMES` array — the server syncs it
  down into local JSON like everything else. Exploration found `GAMES` hardcoded client-side in
  the lineup app today; reconcile at implementation time which sheet source — `listGames_()`'s
  output, or the main "Captains & Goalies" tab — is treated as the schedule of record.
- `SYNC_URL` changes on Apps Script redeploys; the server is the one place that needs to resolve it
  (scraping it out of `relics/u10-team4-lineup.html` is an acceptable mechanism for the server's
  own sync job — individual skills should never need to know about it, see Plan 3).
- The Apps Script backend is `.working/apps-script-sync.gs` (canonical per
  `c:\Users\nickd\repos\artifakts\CLAUDE.md`). Its legacy mirror
  `sideline/legacy/artifakts/team4-sync.gs` does **not currently exist** in the sideline repo —
  nothing to keep in sync right now; flag it to Nick if it reappears before patching it blind.
- Deploying any Apps Script change requires the manual steps in `artifakts/CLAUDE.md` (open the
  "Team 4 Captains & Goalies" sheet → Extensions → Apps Script → paste → Deploy → **edit the
  existing deployment**, not a new one, to keep `SYNC_URL` stable).
- Game id format: `YYYY-MM-DD`, optionally with a `-<n>` suffix for a same-day second game
  (regex `^\d{4}-\d{2}-\d{2}(-\d+)?$`), already enforced server-side in `.working/apps-script-
  sync.gs`.

## Award model (affects Plan 3 and Plan 5)

`tools/u10team4-saveddata/u10team4-award-draft.csv.csv` is Nick's raw, unedited, incomplete
award-discussion log — columns `Date, Award, Player, Note, Status, Nick_Comment, Erin_Comment,
Source`. `Status` is one of `awarded`/`candidate`/`none`. `Award` values seen in the file today are
free text (`Goal of the Game`, `Goalie of the Day`, `Man of the Match`) — **"Goalie of the Day" in
this file vs. "Goalie of the Match" in the canonical list below is a naming drift to normalize,
not two different awards.** `Nick_Comment`/`Erin_Comment` hold the actual back-and-forth text that
led to each decision; `Source` is just timestamps, not message content.

- Exactly four selectable awards, no free text: **Goal of the Game, Man of the Match, Goalie of
  the Match, Player Of The Month**. This is a change from the current Apps Script `Awards` tab,
  where `Award` is unconstrained free text — the review/edit UI must constrain its award dropdown
  to these four, and `saveAwards_` in `apps-script-sync.gs` should validate against the same four.
- **Cadence/cardinality rules:**
  - *Goal of the Game* — per game, not fixed at 1: the CSV shows 2 awarded in a 6-goal game.
    Compute the allowed count as `1 + floor(totalGoals / 5)` per game (6 goals → 2, matching the
    CSV example).
  - *Man of the Match* — exactly 1 per game.
  - *Goalie of the Match* — exactly 1 per game.
  - *Player Of The Month* — exactly 1 per **calendar month** (keyed by `YYYY-MM`, matching the
    existing `Awards` tab's support for a month-string `Date` value) — offered from a month-level
    view, not inline on every single game's award section.
- The award section must **surface the CSV's existing discussion** for the relevant game/month —
  `Note`, `Nick_Comment`, `Erin_Comment`, `Status` — as read-only reference text next to the award
  picker. Pre-existing `candidate`-status rows should pre-populate the award picker's options
  (e.g. Man of the Match defaulting to a choice among named candidates).
- **Finalizing an award requires a required justification/note**, matching the CSV's own `Note`
  column — not optional, unlike today's `{player, award, note}` shape.
- The CSV is raw/incomplete and lives only as a local file today, not in the sheet's `Awards` tab.
  Treat it as the seed/import source for already-`awarded` rows the first time a game's awards are
  edited; surface remaining `candidate`/`none` rows as open items.

## New requirement surfaced during planning

The live app (`relics/u10-team4-lineup.html`) does not yet know finalized data exists — once a
game is `complete`, the phone app should show the **finalized** goal/award data instead of the raw
coach log, and it doesn't do that today. This is [PLAN 6](./PLAN-6-live-app-prefer-finalized-data.md).
