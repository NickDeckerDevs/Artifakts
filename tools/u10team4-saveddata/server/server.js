'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

// Same Apps Script deployment the live app (relics/u10-team4-lineup.html) and allgames.html talk to.
const SYNC_URL = 'https://script.google.com/macros/s/AKfycbwjmRIGNnJgvOPjXpnPR3f5pDC6sm6ctchkVfhKvLbtNaEaFJyRwV_q_xx4v2p3NWyDdg/exec';

const SERVER_DIR = __dirname;
const DATA_ROOT = path.resolve(SERVER_DIR, '..'); // tools/u10team4-saveddata/
const REPO_ROOT = path.resolve(DATA_ROOT, '..', '..'); // artifakts/
const TESTAREA_DIR = path.join(DATA_ROOT, 'testarea');
const GAMES_DIR = path.join(DATA_ROOT, 'games');
const COACHCODE_PATH = path.join(SERVER_DIR, '.coachcode');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// Read once at startup so later write-back calls never need to ask for it.
let coachCode = null;
try {
  coachCode = fs.readFileSync(COACHCODE_PATH, 'utf8').trim();
  console.log(`[server] loaded coach code from ${COACHCODE_PATH}`);
} catch (err) {
  console.warn(
    `[server] no coach code file at ${COACHCODE_PATH} (${err.code}) — ` +
      'write-back calls that need it will fail until it is created.'
  );
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function serveStatic(req, res, urlPath) {
  let relPath = decodeURIComponent(urlPath.split('?')[0]);
  if (relPath === '/') relPath = '/testarea/trigger.html';

  // The "App" link (Plan 5) deep-links to the live lineup app, which lives at the repo root's
  // relics/, outside DATA_ROOT — special-cased here rather than moving/copying that file.
  const root = relPath.startsWith('/relics/') ? REPO_ROOT : DATA_ROOT;
  const filePath = path.join(root, relPath);

  // Guard against escaping the chosen root.
  if (!filePath.startsWith(root)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'not found', path: relPath });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function writeDoneMarker(id, status, extra) {
  const marker = { id, status, finishedAt: new Date().toISOString(), ...extra };
  fs.mkdirSync(TESTAREA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(TESTAREA_DIR, `${id}.done.json`),
    JSON.stringify(marker, null, 2)
  );
}

function runGit(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: REPO_ROOT }, (err, stdout, stderr) => {
      if (err) reject(new Error(`git ${args[0]} failed: ${stderr || err.message}`));
      else resolve(stdout);
    });
  });
}

// The server commits outputs itself rather than trusting the headless skill run to do it.
async function commitRunOutputs(skill, folderPath) {
  const folderRel = path.relative(REPO_ROOT, path.resolve(REPO_ROOT, folderPath)).split(path.sep).join('/');
  const gameId = path.posix.basename(folderRel);
  const reviewRel = `tools/u10team4-saveddata/review/${gameId}-review.html`;
  const paths = [folderRel];
  if (fs.existsSync(path.join(REPO_ROOT, reviewRel))) paths.push(reviewRel);

  await runGit(['add', '--', ...paths]);
  const staged = await runGit(['status', '--porcelain', '--', ...paths]);
  if (!staged.trim()) return { committed: false };
  await runGit(['commit', '-m', `Generate ${gameId} review via /${skill}`, '--', ...paths]);
  return { committed: true, paths };
}

// POST /run-skill — body: { skill: string, args?: string, folderPath?: string }
// Shells out to `claude -p "/<skill> <args>"` headlessly, then writes a done-marker.
async function handleRunSkill(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    sendJson(res, 400, { error: 'invalid JSON body' });
    return;
  }

  const { skill, args, folderPath } = body || {};
  if (!skill || typeof skill !== 'string') {
    sendJson(res, 400, { error: 'skill (string) is required' });
    return;
  }

  const id = crypto.randomUUID();
  const prompt = args ? `/${skill} ${args}` : `/${skill}`;
  const cwd = folderPath ? path.resolve(REPO_ROOT, folderPath) : REPO_ROOT;

  sendJson(res, 202, { id, status: 'pending' });

  const child = spawn(
    'claude',
    ['-p', prompt, '--permission-mode', 'acceptEdits'],
    { cwd, shell: true }
  );

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  child.on('error', (err) => {
    console.error(`[server] run-skill ${id} failed to spawn:`, err);
    writeDoneMarker(id, 'error', { error: err.message });
  });

  child.on('close', async (code) => {
    if (code !== 0) {
      console.error(`[server] run-skill ${id} (/${skill}) exited ${code}: ${stderr}`);
      writeDoneMarker(id, 'error', { exitCode: code, stderr: stderr.slice(-2000) });
      return;
    }
    console.log(`[server] run-skill ${id} (/${skill}) finished`);
    try {
      const commit = folderPath ? await commitRunOutputs(skill, folderPath) : { committed: false };
      writeDoneMarker(id, 'done', commit);
    } catch (err) {
      console.error(`[server] run-skill ${id} commit failed:`, err);
      writeDoneMarker(id, 'error', { error: err.message });
    }
  });
}

// GET /run-skill/<id> — polls the done-marker.
function handleRunSkillStatus(req, res, id) {
  const markerPath = path.join(TESTAREA_DIR, `${id}.done.json`);
  fs.readFile(markerPath, 'utf8', (err, data) => {
    if (err) {
      sendJson(res, 200, { id, status: 'pending' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(data);
  });
}

function postToSheet(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      SYNC_URL,
      { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`sheet returned non-JSON: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end(payload);
  });
}

const GAME_ID_RE = /^\d{4}-\d{2}-\d{2}(-\d+)?$/;

// POST /api/sync-game — body: { game: string, data: object }
// Writes the sheet's current data for a game into its local per-game folder — the only place
// anything under games/ gets written from. Synchronous: this is just an fs write, not a
// long-running job, so it doesn't need the done-marker/poll mechanism /run-skill uses.
async function handleSyncGame(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    sendJson(res, 400, { error: 'invalid JSON body' });
    return;
  }

  const { game, data, files } = body || {};
  if (!game || typeof game !== 'string' || !GAME_ID_RE.test(game) || !data || typeof data !== 'object') {
    sendJson(res, 400, { error: 'game (matching YYYY-MM-DD[-n]) and data (object) are required' });
    return;
  }

  const gameDir = path.join(GAMES_DIR, game);
  const audioDir = path.join(gameDir, 'audio');
  try {
    fs.mkdirSync(audioDir, { recursive: true });
    fs.writeFileSync(path.join(gameDir, 'original-data.json'), JSON.stringify(data, null, 2));
    let filesWritten = 0;
    if (Array.isArray(files)) {
      files.forEach((f) => {
        if (!f || typeof f.name !== 'string' || typeof f.base64 !== 'string') return;
        const safeName = path.basename(f.name); // no directory traversal via the clip name
        fs.writeFileSync(path.join(audioDir, safeName), Buffer.from(f.base64, 'base64'));
        filesWritten++;
      });
    }
    sendJson(res, 200, { ok: true, game, filesWritten });
  } catch (err) {
    console.error(`[server] /api/sync-game failed for ${game}:`, err);
    sendJson(res, 500, { ok: false, error: err.message });
  }
}

// POST /api/finalize-game — body: { game: string, goals: [...], awards: [...] }
// Edit mode's save button (review/template.html). Merges the finalized goal list into the
// game's coachGame (lineup/subs/clock/etc. carried over unchanged, only `events` replaced),
// writes it local-first, then pushes save/awards/finalizeMark to the sheet immediately — no
// separate publish step, no coach-code prompt (the server already holds the coach code).
async function handleFinalizeGame(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    sendJson(res, 400, { error: 'invalid JSON body' });
    return;
  }

  const { game, goals, awards } = body || {};
  if (!game || typeof game !== 'string' || !GAME_ID_RE.test(game) || !Array.isArray(goals) || !Array.isArray(awards)) {
    sendJson(res, 400, { error: 'game (matching YYYY-MM-DD[-n]), goals (array) and awards (array) are required' });
    return;
  }
  if (!coachCode) {
    sendJson(res, 500, { ok: false, error: 'server has no coach code configured — see server/.coachcode' });
    return;
  }

  const gameDir = path.join(GAMES_DIR, game);
  let original;
  try {
    original = JSON.parse(fs.readFileSync(path.join(gameDir, 'original-data.json'), 'utf8'));
  } catch (err) {
    sendJson(res, 404, { ok: false, error: `no original-data.json for ${game}` });
    return;
  }

  const events = goals.map((g) => ({
    id: crypto.randomUUID(),
    side: g.side,
    q: g.q,
    clock: null,
    scorer: g.scorer || null,
    assist: g.assist || null,
    at: g.at,
    spot: g.spot || null,
    shot: g.shot || [],
  }));
  const coachGame = { ...original.coachGame, events, savedAt: new Date().toISOString() };

  const finalizedAt = new Date().toISOString();
  try {
    fs.writeFileSync(
      path.join(gameDir, `${game}_finalized-data.json`),
      JSON.stringify({ game, finalizedAt, goals, awards }, null, 2)
    );

    const saveRes = await postToSheet({ code: coachCode, action: 'save', game, data: coachGame });
    if (!saveRes.ok) throw new Error(saveRes.error || 'sheet save failed');

    const awardsRes = await postToSheet({ code: coachCode, action: 'awards', game, awards });
    if (!awardsRes.ok) throw new Error(awardsRes.error || 'sheet awards failed');

    const finalizeRes = await postToSheet({
      code: coachCode,
      action: 'finalizeMark',
      game,
      goalsCount: goals.length,
      awardsCount: awardsRes.added,
    });
    if (!finalizeRes.ok) throw new Error(finalizeRes.error || 'sheet finalizeMark failed');

    sendJson(res, 200, { ok: true, game, finalizedAt: finalizeRes.finalizedAt });
  } catch (err) {
    console.error(`[server] /api/finalize-game failed for ${game}:`, err);
    sendJson(res, 500, { ok: false, error: err.message });
  }
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url || '/';

  if (req.method === 'POST' && urlPath === '/api/sync-game') {
    handleSyncGame(req, res).catch((err) => {
      console.error('[server] /api/sync-game error:', err);
      sendJson(res, 500, { error: 'internal error' });
    });
    return;
  }

  if (req.method === 'POST' && urlPath === '/api/finalize-game') {
    handleFinalizeGame(req, res).catch((err) => {
      console.error('[server] /api/finalize-game error:', err);
      sendJson(res, 500, { error: 'internal error' });
    });
    return;
  }

  if (req.method === 'POST' && urlPath === '/run-skill') {
    handleRunSkill(req, res).catch((err) => {
      console.error('[server] /run-skill error:', err);
      sendJson(res, 500, { error: 'internal error' });
    });
    return;
  }

  const statusMatch = urlPath.match(/^\/run-skill\/([^/?]+)/);
  if (req.method === 'GET' && statusMatch) {
    handleRunSkillStatus(req, res, statusMatch[1]);
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res, urlPath);
    return;
  }

  sendJson(res, 405, { error: 'method not allowed' });
});

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] serving static files from ${DATA_ROOT}`);
});
