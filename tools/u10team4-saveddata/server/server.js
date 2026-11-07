'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

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
  const filePath = path.join(DATA_ROOT, relPath);

  // Guard against escaping DATA_ROOT.
  if (!filePath.startsWith(DATA_ROOT)) {
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

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`[server] run-skill ${id} (/${skill}) finished`);
      writeDoneMarker(id, 'done', {});
    } else {
      console.error(`[server] run-skill ${id} (/${skill}) exited ${code}: ${stderr}`);
      writeDoneMarker(id, 'error', { exitCode: code, stderr: stderr.slice(-2000) });
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

const server = http.createServer(async (req, res) => {
  const urlPath = req.url || '/';

  if (req.method === 'POST' && urlPath === '/api/sync-game') {
    handleSyncGame(req, res).catch((err) => {
      console.error('[server] /api/sync-game error:', err);
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
