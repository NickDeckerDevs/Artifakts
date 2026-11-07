# PLAN 3 — `/generate-match-review` skill (extracted + folder-driven)

Can be run anytime in parallel with any other plan that can be run in parallel — it can be built
and tested by hand-invoking it from a terminal with a manually-prepared folder before Plan 1, 2,
or 4 exist.

See [`CONTEXT.md`](./CONTEXT.md) for the shared architecture/background, the award model this
skill's generation step must apply, and read `tools/u10team4-saveddata/u10team4-award-draft.csv.csv`
before building the award section.

## Bottom line / goal

Pull the "gather data → cluster → build review HTML" portion out of `finalize-match` into a new
skill that takes **already-synced local data** as input instead of reaching out to the sheet
itself, so it can be triggered headlessly by Plan 1's server with zero network calls of its own.

## Deliverable

`.claude/skills/generate-match-review/SKILL.md` that:

- Takes a **folder path** as its argument — the per-game folder that Plan 2's sync organizes
  (`tools/u10team4-saveddata/games/<game-id>/` per Plan 2's build notes), containing the
  original-data JSON, downloaded voice-capture audio files, and anything else pulled from the
  sheet for that game. Everything the skill needs arrives as one tidy folder, not individual URLs
  or an inlined JSON blob.
- Has **zero knowledge of `SYNC_URL` or the Apps Script API** — it only ever reads from that local
  folder. Transcription + Haiku-subagent clustering run against local files exactly as in the
  current `finalize-match`, just sourced from disk instead of a live pull.
- Does the existing transcription (`tools/u10team4-saveddata/transcribe/transcribe.py`),
  clustering, and `template.html`-based review-page generation — logic carried over unchanged,
  just relocated and re-pointed at local input instead of live API calls.
- Builds the award section per the Context doc's award model: reads
  `u10team4-award-draft.csv.csv`, filters rows by the game's date (and separately surfaces the
  current month's rows for Player of the Month candidacy), and inlines that alongside the goal
  data the same way `DATA_JSON`/`ROSTER_JSON` are inlined today. Computes the allowed Goal-of-the-
  Game award count as `1 + floor(totalGoals / 5)`.
- Writes `review/<game-id>-review.html`, opens it in the browser, commits both that file and any
  derived JSON it produces (e.g. `<game-id>_original-data.json` relocated/regenerated under the
  per-game folder), and exits — no interactive prompts.

## Confirmed decisions (no longer open)

- **No `SYNC_URL` scraping in this skill at all** — sheet access is entirely Plan 2's server's job.
  If the folder handed in is missing something the skill needs, it should fail loudly rather than
  reach out to the network to fill the gap.
- **`finalize-match` stays as-is** (see `../plans/backlog.md`) — this plan does not shrink or
  modify it; it only extracts the gather+build logic into a new, parallel skill. Do not delete or
  edit `.claude/skills/finalize-match/SKILL.md` as part of this work.
- **Input is a folder, not a narrower single-field argument** — matches the requirement to hand
  the skill everything pulled from the sheet (audio, notes, everything), not just one JSON blob.

## Build notes

- Reuse the existing clustering rule from `finalize-match` as-is: same-side, timestamps within
  ~4 minutes, scorer match-or-unknown, explicitly **not** filtered by quarter (sideline clocks
  don't reliably restart per quarter).
- Reuse `template.html`'s existing placeholder-substitution mechanism (`{{GAME_ID}}`,
  `{{DATA_JSON}}`, `{{ROSTER_JSON}}`) — add new placeholders for the award/CSV data rather than
  inventing a different templating approach.
- Award dropdown must be constrained to exactly the four canonical values (`Goal of the Game`,
  `Man of the Match`, `Goalie of the Match`, `Player Of The Month`) — do not carry forward the
  free-text `Award` column behavior from the current Apps Script `Awards` tab.
- Every finalized award needs a required note/justification field — enforce this in the generated
  page's export validation, not just visually.

## Verification

- Hand-build one per-game folder manually (copy an existing `*_original-data.json` plus a couple
  of dummy audio files into `tools/u10team4-saveddata/games/<test-id>/`) and run the skill against
  it from a terminal with no other plans built yet. Confirm it produces a review HTML with no
  network calls (verify by running with network disabled/unplugged if easiest).
- Confirm the award section shows the correct CSV rows for a game date that has real entries in
  `u10team4-award-draft.csv.csv` (e.g. `2026-10-17`), including existing Nick/Erin comment text.
- Confirm a 6-goal game offers exactly 2 Goal-of-the-Game slots.
