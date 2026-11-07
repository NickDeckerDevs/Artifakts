/**
 * Team 4 lineup sync — paste into the "Team 4 Captains & Goalies" sheet
 * (Extensions → Apps Script), save, then Deploy → New deployment → Web app:
 *   Execute as: Me    Who has access: Anyone
 *
 * Reading a lineup is open to anyone with the lineup page.
 * Saving a lineup or writing results needs the coach code below.
 */
const COACH_CODE = 'IN ENV'
const MAIN_TAB = 'Untitled';   // the captains & goalies tab
const LINEUPS_TAB = 'Lineups'; // created on first save
const NOTES_TAB = 'Coach notes'; // created on first save that has notes
const PARENT_NOTES_ID = '18v8YXz459MQU_XTwpR3M6YQVfMAaSpWULhqP0r1HNfA'; // "Team 4 Parent Notes" spreadsheet
const ENTRIES_TAB = 'Parent entries'; // goals logged by sideline parents, waiting for the coach (created on first entry)
const AUDIO_FOLDER_NAME = 'Team 4 voice captures'; // Drive folder for voice-capture clips, created on first upload
const AWARDS_TAB = 'Awards'; // one row per award given, created on first award save
const FINALIZED_TAB = 'Finalized games'; // one row per game the finalize-match skill has saved, created on first finalize

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'get' && p.game) return json_(getLineup_(p.game));
  if (p.action === 'check') return json_({ ok: true, coach: p.code === COACH_CODE });
  if (p.action === 'entries' && p.game) return json_(getEntries_(p.game));
  // Streams a voice-capture clip's raw bytes back, so the finalize-match skill (running on Nick's
  // machine) can download and transcribe it without needing its own Drive API auth.
  if (p.action === 'audio' && p.id) return audioFile_(p.id);
  // Every known game id (from the Lineups tab) plus its closed/finalized status, so the
  // finalize-match skill can show Nick which games still need review without him naming one.
  if (p.action === 'listGames') return json_(listGames_());
  // Full schedule (every scheduled date, played or not) from the main tab — listGames_() only
  // knows about games that already have a Lineups row, so a never-touched future game wouldn't
  // show up there. Used by allgames.html to list "not started" games.
  if (p.action === 'schedule') return json_(schedule_());
  return json_({ ok: true });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }
  // Parent / visitor notes: no coach code, append-only, to the separate Parent Notes sheet.
  if (body.action === 'parentNote') return json_(parentNote_(body));
  if (body.action === 'parentEvent') {
    const lk = LockService.getScriptLock(); lk.waitLock(10000);
    try { return json_(parentEvent_(body)); } finally { lk.releaseLock(); }
  }
  // Voice-capture upload: same open/no-coach-code trust model as parentEvent (anyone with the
  // page can call it) — it's just moving a clip this same device already recorded into Drive.
  if (body.action === 'captureAudio') {
    const lk = LockService.getScriptLock(); lk.waitLock(10000);
    try { return json_(captureAudio_(body)); } finally { lk.releaseLock(); }
  }
  if (body.code !== COACH_CODE) return json_({ ok: false, error: 'wrong coach code' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (body.action === 'save') return json_(saveLineup_(body.game, body.data));
    if (body.action === 'result') return json_(writeResult_(body.game, body.goalies, body.note));
    if (body.action === 'awards') return json_(saveAwards_(body.game, body.awards));
    // Records that the finalize-match skill has finished a pass on this game, separately from
    // Lineups (which the live app overwrites wholesale on every coach save and would otherwise
    // drop a flag stored inside the game's own JSON).
    if (body.action === 'finalizeMark') return json_(markFinalized_(body.game, body.goalsCount, body.awardsCount));
    return json_({ ok: false, error: 'unknown action' });
  } finally {
    lock.releaseLock();
  }
}

function lineupsSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(LINEUPS_TAB);
  if (!sh) {
    sh = ss.insertSheet(LINEUPS_TAB);
    sh.appendRow(['Game', 'Updated', 'Lineup data (written by the lineup page)']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow_(sh, game) {
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getDisplayValues();
  for (let i = 1; i < ids.length; i++) if (ids[i][0] === game) return i + 1;
  return 0;
}

function getLineup_(game) {
  const sh = lineupsSheet_();
  const row = findRow_(sh, game);
  if (!row) return { ok: true, game: game, data: null };
  const v = sh.getRange(row, 1, 1, 3).getDisplayValues()[0];
  let data = null;
  try { data = JSON.parse(v[2]); } catch (err) {}
  return { ok: true, game: game, updatedAt: v[1], data: data };
}

function saveLineup_(game, data) {
  if (!game || !data) return { ok: false, error: 'missing game or data' };
  const sh = lineupsSheet_();
  const updatedAt = new Date().toISOString();
  const values = [[game, updatedAt, JSON.stringify(data)]];
  const row = findRow_(sh, game);
  const range = row ? sh.getRange(row, 1, 1, 3) : sh.getRange(sh.getLastRow() + 1, 1, 1, 3);
  range.setNumberFormat('@').setValues(values);
  if (Array.isArray(data.notes) && data.notes.length) saveNotes_(game, data.notes);
  return { ok: true, game: game, updatedAt: updatedAt };
}

// One row per coach note, keyed by note id (re-saving updates instead of duplicating).
function saveNotes_(game, notes) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(NOTES_TAB);
  if (!sh) {
    sh = ss.insertSheet(NOTES_TAB);
    sh.appendRow(['Note id', 'Game', 'Quarter', 'Time', 'Note']);
    sh.setFrozenRows(1);
  }
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getDisplayValues().map(r => r[0]);
  notes.forEach(n => {
    if (!n || !n.id || !n.text) return;
    const row = [String(n.id), game, String(n.q || ''), String(n.at || ''), String(n.text).slice(0, 5000)];
    const i = ids.indexOf(String(n.id));
    const target = i > 0 ? sh.getRange(i + 1, 1, 1, 5) : sh.getRange(sh.getLastRow() + 1, 1, 1, 5);
    target.setNumberFormat('@').setValues([row]);
    if (i <= 0) ids.push(String(n.id));
  });
}

function parentNote_(b) {
  const text = String(b.text || '').trim().slice(0, 3000);
  if (!text) return { ok: false, error: 'empty note' };
  const sh = SpreadsheetApp.openById(PARENT_NOTES_ID).getSheets()[0];
  sh.appendRow([new Date().toISOString(), String(b.game || '').slice(0, 20), String(b.q || '').slice(0, 4),
    String(b.at || '').slice(0, 40), String(b.name || '').slice(0, 60), String(b.player || '').slice(0, 30), text]);
  return { ok: true };
}

// A sideline parent's goal: one row per entry id; sending the same id again updates it (they added details).
function entriesSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(ENTRIES_TAB);
  if (!sh) {
    sh = ss.insertSheet(ENTRIES_TAB);
    sh.appendRow(['Entry id', 'Game', 'Sent at', 'Parent', 'Player', 'Kind', 'Details (written by the lineup page)']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function parentEvent_(b) {
  const id = String(b.id || '').slice(0, 40), game = String(b.game || '').slice(0, 20);
  if (!id || !/^\d{4}-\d{2}-\d{2}(-\d+)?$/.test(game) || !b.data) return { ok: false, error: 'bad entry' };
  const sh = entriesSheet_();
  const row = [id, game, new Date().toISOString(), String(b.name || '').slice(0, 60), String(b.player || '').slice(0, 30),
    String(b.kind || 'goal').slice(0, 20), JSON.stringify(b.data).slice(0, 4000)];
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getDisplayValues().map(r => r[0]);
  const i = ids.indexOf(id);
  const target = i > 0 ? sh.getRange(i + 1, 1, 1, 7) : sh.getRange(sh.getLastRow() + 1, 1, 1, 7);
  target.setNumberFormat('@').setValues([row]);
  return { ok: true };
}
// Voice clips go to their own Drive folder, named `<game>_<entry id>.<ext>` so re-sending the
// same id (a retried upload) replaces the old file instead of piling up duplicates.
function audioFolder_() {
  const it = DriveApp.getFoldersByName(AUDIO_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(AUDIO_FOLDER_NAME);
}
function captureAudio_(b) {
  const id = String(b.id || '').slice(0, 40), game = String(b.game || '').slice(0, 20);
  if (!id || !/^\d{4}-\d{2}-\d{2}(-\d+)?$/.test(game) || !b.audioB64) return { ok: false, error: 'bad request' };
  const mime = String(b.mime || 'audio/webm').slice(0, 40);
  const ext = mime.indexOf('mp4') >= 0 ? 'm4a' : mime.indexOf('aac') >= 0 ? 'aac' : 'webm';
  try {
    const bytes = Utilities.base64Decode(b.audioB64);
    const blob = Utilities.newBlob(bytes, mime, `${game}_${id}.${ext}`);
    const folder = audioFolder_();
    const existing = folder.getFilesByName(blob.getName());
    while (existing.hasNext()) existing.next().setTrashed(true);
    const file = folder.createFile(blob);
    return { ok: true, url: file.getUrl(), fileId: file.getId() };
  } catch (err) { return { ok: false, error: String(err) }; }
}
function awardsSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(AWARDS_TAB);
  if (!sh) {
    sh = ss.insertSheet(AWARDS_TAB);
    sh.appendRow(['Date', 'Award', 'Player', 'Note']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function saveAwards_(game, awards) {
  game = String(game || '').slice(0, 20);
  if (!/^\d{4}-\d{2}-\d{2}(-\d+)?$/.test(game) || !Array.isArray(awards)) return { ok: false, error: 'bad request' };
  const sh = awardsSheet_();
  const rows = awards
    .filter(a => a && a.player && a.award)
    .map(a => [game, String(a.award).slice(0, 60), String(a.player).slice(0, 30), String(a.note || '').slice(0, 500)]);
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setNumberFormat('@').setValues(rows);
  return { ok: true, added: rows.length };
}
function finalizedSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(FINALIZED_TAB);
  if (!sh) {
    sh = ss.insertSheet(FINALIZED_TAB);
    sh.appendRow(['Game', 'Finalized at', 'Goals count', 'Awards count']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function markFinalized_(game, goalsCount, awardsCount) {
  game = String(game || '').slice(0, 20);
  if (!/^\d{4}-\d{2}-\d{2}(-\d+)?$/.test(game)) return { ok: false, error: 'bad game id' };
  const sh = finalizedSheet_();
  const finalizedAt = new Date().toISOString();
  const row = [game, finalizedAt, Number(goalsCount) || 0, Number(awardsCount) || 0];
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getDisplayValues().map(r => r[0]);
  const i = ids.indexOf(game);
  const target = i > 0 ? sh.getRange(i + 1, 1, 1, 4) : sh.getRange(sh.getLastRow() + 1, 1, 1, 4);
  target.setNumberFormat('@').setValues([row]);
  return { ok: true, game: game, finalizedAt: finalizedAt };
}
function listGames_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LINEUPS_TAB);
  const games = {};
  if (sh && sh.getLastRow() > 1) {
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getDisplayValues();
    rows.forEach(r => {
      if (!r[0]) return;
      let data = null; try { data = JSON.parse(r[2]); } catch (err) {}
      games[r[0]] = { game: r[0], updatedAt: r[1], closed: !!(data && data.closed), finalizedAt: null };
    });
  }
  const fsh = SpreadsheetApp.getActive().getSheetByName(FINALIZED_TAB);
  if (fsh && fsh.getLastRow() > 1) {
    const frows = fsh.getRange(2, 1, fsh.getLastRow() - 1, 2).getDisplayValues();
    frows.forEach(r => {
      if (!r[0]) return;
      if (!games[r[0]]) games[r[0]] = { game: r[0], updatedAt: null, closed: false, finalizedAt: null };
      games[r[0]].finalizedAt = r[1] || null;
    });
  }
  const list = Object.keys(games).map(k => games[k]).sort((a, b) => b.game.localeCompare(a.game));
  return { ok: true, games: list };
}
// Every scheduled date on the main tab, played or not, with the same game-id convention
// (date, or date-2/-3/... for a same-day second/third game) as writeResult_ uses.
function schedule_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(MAIN_TAB);
  if (!sh || sh.getLastRow() < 2) return { ok: true, games: [] };
  const dates = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues();
  const seen = {};
  const games = [];
  dates.forEach(r => {
    const iso = toIso_(r[0]);
    if (!iso) return;
    seen[iso] = (seen[iso] || 0) + 1;
    const n = seen[iso];
    games.push({ game: n === 1 ? iso : `${iso}-${n}`, date: iso });
  });
  return { ok: true, games: games };
}
function audioFile_(fileId) {
  try { return DriveApp.getFileById(fileId).getBlob(); } catch (err) { return json_({ ok: false, error: 'not found' }); }
}
function getEntries_(game) {
  const sh = SpreadsheetApp.getActive().getSheetByName(ENTRIES_TAB);
  if (!sh || sh.getLastRow() < 2) return { ok: true, entries: [] };
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getDisplayValues();
  const entries = [];
  rows.forEach(r => {
    if (r[1] !== game) return;
    let data = null; try { data = JSON.parse(r[6]); } catch (err) {}
    if (data) entries.push({ id: r[0], game: r[1], sentAt: r[2], name: r[3], player: r[4], kind: r[5], data: data });
  });
  return { ok: true, entries: entries };
}

// Game ids are the date (2026-10-17); a second game on the same date is 2026-12-13-2.
function writeResult_(game, goalies, note) {
  const sh = SpreadsheetApp.getActive().getSheetByName(MAIN_TAB);
  const m = String(game).match(/^(\d{4}-\d{2}-\d{2})(?:-(\d+))?$/);
  if (!sh || !m) return { ok: false, error: 'game not found' };
  const date = m[1], nth = Number(m[2] || 1);
  const dates = sh.getRange(1, 1, sh.getLastRow(), 1).getDisplayValues();
  let seen = 0, row = 0;
  for (let i = 1; i < dates.length; i++) {
    if (toIso_(dates[i][0]) === date && ++seen === nth) { row = i + 1; break; }
  }
  if (!row) return { ok: false, error: 'game row not found' };
  const g = (goalies || []).slice(0, 4);
  while (g.length < 4) g.push('');
  sh.getRange(row, 7, 1, 4).setValues([g.map(n => n || '')]);
  if (note) sh.getRange(row, 11).setValue(note);
  return { ok: true, row: row };
}

function toIso_(v) {
  v = String(v || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2) : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}