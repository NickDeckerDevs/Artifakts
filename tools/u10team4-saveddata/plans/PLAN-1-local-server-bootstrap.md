# PLAN 1 — Local server: skill launcher + commit (bootstrap)

Can be run anytime in parallel with any other plan that can be run in parallel.

See [`CONTEXT.md`](./CONTEXT.md) for the shared architecture/background this plan assumes.

## Bottom line / goal

Build the one small Node server that will become the backbone for all of this tooling, and prove
it end-to-end with a throwaway skill before Plan 4 points it at the real
`/generate-match-review`.

## Deliverable

A self-contained Node app under `tools/u10team4-saveddata/server/` (name TBD), started with one
command (e.g. `node server.js` from that folder, or an `npm start`), that:

- Serves static files from `tools/u10team4-saveddata/` (so `review/allgames.html` etc. are
  reachable over `http://localhost:PORT/...` instead of `file://`).
- Exposes an endpoint (e.g. `POST /run-skill`) that takes a skill name + argument payload, shells
  out to `claude -p "/<skill> <args>" --permission-mode acceptEdits` non-interactively, waits for
  it to finish, and writes a done-marker (e.g. `testarea/<id>.done.json`) the calling page can
  poll.
- For this bootstrap plan specifically: wires that endpoint to one throwaway test skill (e.g.
  `/testarea-stamp <arg>`) that writes a basic HTML file (argument rendered in an `<h1>`) to
  `tools/u10team4-saveddata/testarea/`, opens it in the default browser, and `git commit`s it — no
  sheet access, no review logic. A minimal trigger HTML page (also under `testarea/`) exercises
  this via the server.
- Reads a local, gitignored coach-code config file once at startup (path TBD, e.g.
  `tools/u10team4-saveddata/server/.coachcode`) so later plans' write-back calls never need to ask
  for it.
- Commits the file it produces — **does not auto-push**; pushing stays a separate, explicit
  action.

## Confirmed decisions (no longer open)

- **Local Node server, not a `.ps1`/URI-scheme/Docker approach.** One deployable, self-contained
  mini-server, started from the terminal, that acts as the HTTP listener for everything
  (sync, skill launching, and holding the coach code). No background daemon requirement beyond
  "it's running while you use it," no Windows registry/URI-scheme tricks, no container to manage.
- **"No feedback" defined precisely**: the triggered Claude Code run receives every piece of data
  it needs up front (arguments / a folder path) and does not prompt. The server is responsible for
  assembling that data before launching the run — not the skill, not the user.
- Generated/produced files for this bootstrap plan land under `tools/u10team4-saveddata/testarea/`.
  Commit-only, no auto-push.

## Build notes

- Keep this plan's scope to the launcher mechanism itself. Do not build sheet-sync or review-page
  logic here — that's Plans 2 and 3. The throwaway `/testarea-stamp` skill exists purely to prove
  the server → `claude -p` → commit round trip works headlessly.
- `/run-skill`'s payload shape should already anticipate Plan 4's real use (skill name + a folder
  path), even though this plan's own test skill only needs a single string argument — don't design
  the endpoint so narrowly that Plan 4 has to redo it.
- The done-marker/poll mechanism built here is reused as-is by Plan 2 (polling for sheet-sync
  completion) and Plan 4 (polling for a review-generation run to finish) — keep it generic (e.g.
  `{ id, status: 'done'|'error', finishedAt }`) rather than testarea-specific.

## Verification

- Start the server with its documented single command.
- Open the trigger page served by the server, submit an argument, and confirm: a new HTML file
  appears under `testarea/` with that argument in its `<h1>`, a browser tab opens showing it, and
  `git log`/`git status` shows it was committed (not pushed).
- Confirm the server reads `.coachcode` (or equivalent) once at startup without prompting, and that
  file is listed in `.gitignore`.
