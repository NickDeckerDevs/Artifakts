from __future__ import annotations

import csv
import hashlib
import html
import io
import os
import sqlite3
from datetime import datetime, timezone
from email import policy
from email.parser import BytesParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse


DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
DB_PATH = DATA_DIR / "feedback.sqlite3"
ART_DIR = Path(os.environ.get("ART_DIR", "/art"))
PORT = int(os.environ.get("PORT", "8787"))
MAX_UPLOAD = 10 * 1024 * 1024

GROUPS = [
    ("Match icons", [
        ("Assist", "icon-assist.svg"), ("Goal", "icon-goal.svg"),
        ("Sub", "icon-sub.svg"), ("Whistle", "icon-whistle.svg"),
    ]),
    ("Reactions", [
        ("Ball", "react-ball.svg"), ("Clap", "react-clap.svg"), ("Fire", "react-fire.svg"),
    ]),
    ("How it started", [
        ("Open Play", "shot-open-play.svg"), ("Counter Attack", "shot-counter-attack.svg"),
        ("Penalty", "shot-penalty.svg"), ("Free Kick", "shot-free-kick.svg"),
        ("From Corner", "shot-from-corner.svg"), ("From Throw In", "shot-from-throw-in.svg"),
        ("From Goal Kick", "shot-from-goal-kick.svg"), ("Rebound", "shot-rebound.svg"),
        ("Scramble", "shot-scramble.svg"),
    ]),
    ("The shot", [
        ("Right Foot", "shot-right-foot.svg"), ("Left Foot", "shot-left-foot.svg"),
        ("Header", "shot-header.svg"), ("Volley", "shot-volley.svg"),
        ("Half Volley", "shot-half-volley.svg"), ("Chip", "shot-chip.svg"),
        ("One On One", "shot-one-on-one.svg"), ("Long Shot", "shot-long-shot.svg"),
        ("Dribbled The Keeper", "shot-dribbled-the-keeper.svg"), ("Deflected", "shot-deflected.svg"),
    ]),
    ("Where it went", [
        ("Top Bin", "shot-top-bin.svg"), ("High", "shot-high.svg"), ("Mid", "shot-mid.svg"),
        ("Low", "shot-low.svg"), ("Near Post", "shot-near-post.svg"),
        ("Far Post", "shot-far-post.svg"), ("Through The Legs", "shot-through-the-legs.svg"),
        ("Off The Post Bar", "shot-off-the-post-bar.svg"),
    ]),
]
ASSETS = {name: filename for _, badges in GROUPS for name, filename in badges}


def connect():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY,
            fingerprint TEXT NOT NULL UNIQUE,
            submitted_at TEXT NOT NULL,
            asset TEXT NOT NULL,
            suggestion TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New',
            note TEXT NOT NULL DEFAULT ''
        )
    """)
    return db


def esc(value):
    return html.escape(str(value or ""), quote=True)


def asset_href(name):
    filename = ASSETS.get(name)
    return "/art/" + quote(filename) if filename else ""


def shell(title, body):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} · Sidelines Feedback Inbox</title>
<style>
:root{{--bg:#10131d;--panel:#191e2b;--panel2:#20283a;--line:#364259;--text:#f5f7fb;--muted:#c3cada;--purple:#c6a3ff;--mint:#94e2c0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color-scheme:dark;color:var(--text);background:var(--bg)}}
*{{box-sizing:border-box}}body{{margin:0;background:radial-gradient(ellipse at 48% -20%,#392858 0,transparent 38rem),var(--bg);min-height:100vh}}a{{color:inherit}}button,input,textarea,select{{font:inherit}}
main{{width:min(1280px,calc(100% - 2rem));margin:auto;padding:2rem 0 4rem}}h1{{margin:0;font-size:clamp(1.8rem,4vw,3rem);letter-spacing:-.04em}}h2{{margin:0;font-size:1.4rem}}p{{line-height:1.55}}.muted{{color:var(--muted)}}
.top{{display:flex;justify-content:space-between;align-items:start;gap:2rem;margin-bottom:1.2rem}}.top p{{max-width:640px;margin:.45rem 0 0;color:var(--muted)}}.upload{{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;padding:.8rem;border:1px solid var(--line);border-radius:14px;background:var(--panel)}}.upload label{{font-weight:700}}input[type=file]{{max-width:220px;color:var(--muted)}}button,.button{{border:1px solid #775da0;border-radius:9px;padding:.58rem .85rem;color:#fff;background:#392b50;text-decoration:none;font-weight:700;cursor:pointer}}button:hover,.button:hover{{background:#4c386a}}.notice{{margin:1rem 0;padding:.7rem .9rem;border:1px solid #326b5b;border-radius:10px;color:#c8f5df;background:#162a28}}
.layout{{display:grid;grid-template-columns:minmax(240px,310px) minmax(0,1fr);gap:1rem;align-items:start}}.sidebar,.content,.response{{border:1px solid var(--line);border-radius:15px;background:var(--panel)}}.sidebar{{position:sticky;top:1rem;max-height:calc(100vh - 2rem);overflow:auto;padding:1rem}}.group{{margin-top:1.15rem}}.group h3{{margin:0 0 .45rem;color:var(--purple);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase}}.badge-link{{display:flex;align-items:center;gap:.65rem;padding:.48rem .55rem;border-radius:10px;text-decoration:none;color:var(--muted)}}.badge-link:hover,.badge-link.active{{color:#fff;background:var(--panel2)}}.badge-link.active{{box-shadow:inset 3px 0 var(--purple)}}.badge-link img{{width:34px;height:34px;object-fit:contain;image-rendering:pixelated}}.badge-link span{{flex:1}}.count{{min-width:1.8rem;padding:.17rem .4rem;border:1px solid var(--line);border-radius:999px;text-align:center;font-size:.78rem}}
.content{{min-height:55vh;padding:1.25rem}}.overview{{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.8rem;margin-top:1rem}}.overview a{{display:flex;align-items:center;gap:.8rem;padding:.8rem;border:1px solid var(--line);border-radius:12px;background:var(--panel2);text-decoration:none}}.overview img{{width:48px;height:48px;object-fit:contain;image-rendering:pixelated}}.hero{{display:flex;align-items:center;gap:1rem;margin-bottom:1.1rem;padding:.9rem 1rem;border:1px solid var(--line);border-radius:13px;background:var(--panel2)}}.hero img{{width:78px;height:78px;object-fit:contain;image-rendering:pixelated}}.hero p{{margin:.2rem 0 0;color:var(--muted)}}.responses{{display:grid;gap:.75rem;margin-top:1rem}}.response{{padding:1rem;background:#141925}}.response-head{{display:flex;justify-content:space-between;gap:.75rem;align-items:center;color:var(--muted);font-size:.86rem}}.response blockquote{{margin:.75rem 0 1rem;font-size:1.04rem;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}}.review-form{{display:grid;grid-template-columns:auto 1fr auto;gap:.5rem;align-items:center;padding-top:.7rem;border-top:1px solid var(--line)}}.review-form select,.review-form input{{min-width:0;border:1px solid #4b5870;border-radius:8px;padding:.55rem .65rem;color:var(--text);background:#0f1420}}.empty{{margin-top:1rem;padding:1.2rem;border:1px dashed #4b5870;border-radius:12px;color:var(--muted)}}.privacy{{margin:1.3rem 0 0;color:#aab3c4;font-size:.88rem}}
@media(max-width:760px){{main{{width:min(100% - 1rem,680px);padding-top:1rem}}.top{{display:grid;gap:1rem}}.layout{{grid-template-columns:1fr}}.sidebar{{position:static;max-height:none;display:flex;gap:1rem;overflow:auto;padding:.7rem}}.group{{flex:0 0 auto;margin:0;min-width:max-content}}.group h3{{font-size:.68rem}}.badge-link{{display:inline-flex;padding:.35rem}}.badge-link img{{width:28px;height:28px}}.badge-link span{{font-size:.86rem}}.content{{padding:.9rem}}.review-form{{grid-template-columns:1fr auto}}.review-form input{{grid-column:1 / -1;grid-row:1}}.review-form select{{grid-column:1;grid-row:2}}.review-form button{{grid-column:2;grid-row:2}}}}
</style></head><body><main>
<header class="top"><div><h1>Sidelines Feedback Inbox</h1><p>Review suggestions badge by badge. Import a Google Forms response CSV to add the latest ideas.</p></div>
<form class="upload" method="post" action="/import" enctype="multipart/form-data"><label for="responses">Import responses</label><input id="responses" name="responses" type="file" accept=".csv,text/csv" required><button type="submit">Import CSV</button></form></header>
{body}<p class="privacy">This inbox is only available on this computer. Imported responses and review notes are stored in its Docker data volume.</p>
</main></body></html>"""


def render_page(query):
    selected = query.get("badge", [""])[0]
    notice = query.get("notice", [""])[0]
    with connect() as db:
        rows = db.execute("SELECT asset, COUNT(*) AS total FROM feedback GROUP BY asset").fetchall()
        counts = {row["asset"]: row["total"] for row in rows}
        nav = []
        for group, badges in GROUPS:
            links = []
            for name, filename in badges:
                active = " active" if name == selected else ""
                links.append(
                    f'<a class="badge-link{active}" href="/?badge={quote(name)}">'
                    f'<img src="/art/{quote(filename)}" alt=""><span>{esc(name)}</span>'
                    f'<b class="count">{counts.get(name, 0)}</b></a>'
                )
            nav.append(f'<section class="group"><h3>{esc(group)}</h3>{"".join(links)}</section>')
        sidebar = '<aside class="sidebar" aria-label="Badge categories">' + "".join(nav) + "</aside>"
        if selected in ASSETS:
            feedback = db.execute(
                "SELECT * FROM feedback WHERE asset=? ORDER BY submitted_at DESC, id DESC", (selected,)
            ).fetchall()
            items = []
            for row in feedback:
                items.append(f"""<article class="response">
<div class="response-head"><span>{esc(row["submitted_at"])}</span><span>{esc(row["status"])}</span></div>
<blockquote>{esc(row["suggestion"])}</blockquote>
<form class="review-form" method="post" action="/review">
<input type="hidden" name="id" value="{row["id"]}"><input type="hidden" name="badge" value="{esc(selected)}">
<input name="note" maxlength="1000" aria-label="Local review note" placeholder="Add a private review note" value="{esc(row["note"])}">
<select name="status" aria-label="Review status">{''.join(f'<option{" selected" if row["status"] == state else ""}>{state}</option>' for state in ("New", "Reviewed", "Follow up"))}</select>
<button type="submit">Save</button></form></article>""")
            panel = f'<section class="content"><div class="hero"><img src="{asset_href(selected)}" alt=""><div><h2>{esc(selected)}</h2><p>{len(feedback)} suggestion{"s" if len(feedback) != 1 else ""} for this player-card badge</p></div></div>'
            panel += "".join(items) if items else '<p class="empty">No suggestions for this badge yet. New ideas appear here after importing a response CSV.</p>'
            panel += "</section>"
        else:
            tiles = []
            for group, badges in GROUPS:
                for name, filename in badges:
                    tiles.append(f'<a href="/?badge={quote(name)}"><img src="/art/{quote(filename)}" alt=""><strong>{esc(name)}</strong><span class="count">{counts.get(name, 0)} ideas</span></a>')
            panel = '<section class="content"><h2>Choose a badge to review</h2><p class="muted">Each image has its own suggestion list, local notes, and review status.</p><div class="overview">' + "".join(tiles) + "</div></section>"
        message = f'<p class="notice">{esc(notice)}</p>' if notice else ""
    return shell("Review feedback", f"{message}<div class=\"layout\">{sidebar}{panel}</div>")


def parse_form_csv(body, content_type):
    envelope = (
        f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8") + body
    )
    message = BytesParser(policy=policy.default).parsebytes(envelope)
    upload = next((part for part in message.iter_parts() if part.get_param("name", header="content-disposition") == "responses"), None)
    if upload is None:
        raise ValueError("Choose the Google Forms responses CSV first.")
    raw = upload.get_payload(decode=True)
    text = raw.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("The selected file does not look like a Google Forms response CSV.")
    fields = {name.strip().lower(): name for name in reader.fieldnames if name}
    timestamp_field = next((v for k, v in fields.items() if "timestamp" in k or "time submitted" in k), None)
    asset_field = next((v for k, v in fields.items() if "icon" in k and ("feedback" in k or "for" in k)), None)
    suggestion_field = next((v for k, v in fields.items() if "what would make" in k or ("suggestion" in k and "email" not in k)), None)
    if not asset_field or not suggestion_field:
        raise ValueError("Couldn't find the icon and suggestion columns. Export responses directly from the Sidelines Google Form.")
    return [
        (row.get(timestamp_field, "").strip() if timestamp_field else "", row.get(asset_field, "").strip(), row.get(suggestion_field, "").strip())
        for row in reader
        if row.get(asset_field, "").strip() and row.get(suggestion_field, "").strip()
    ]


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}")

    def send_html(self, text, status=200):
        data = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def redirect(self, location):
        self.send_response(303)
        self.send_header("Location", location)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/healthz":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"ok")
            return
        if parsed.path.startswith("/art/"):
            filename = Path(parsed.path.removeprefix("/art/")).name
            if filename not in ASSETS.values():
                self.send_error(404)
                return
            path = ART_DIR / filename
            if not path.is_file():
                self.send_error(404)
                return
            data = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(data)
            return
        if parsed.path != "/":
            self.send_error(404)
            return
        self.send_html(render_page(parse_qs(parsed.query)))

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/import":
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_UPLOAD:
                self.send_html(shell("Import error", '<p class="notice">Upload a CSV smaller than 10 MB.</p><a class="button" href="/">Back to inbox</a>'), 413)
                return
            try:
                rows = parse_form_csv(self.rfile.read(length), self.headers.get("Content-Type", ""))
                imported = 0
                skipped = 0
                with connect() as db:
                    for timestamp, asset, suggestion in rows:
                        timestamp = timestamp or datetime.now(timezone.utc).isoformat(timespec="seconds")
                        fingerprint = hashlib.sha256((timestamp + "\0" + asset + "\0" + suggestion).encode("utf-8")).hexdigest()
                        cur = db.execute(
                            "INSERT OR IGNORE INTO feedback(fingerprint,submitted_at,asset,suggestion) VALUES(?,?,?,?)",
                            (fingerprint, timestamp, asset, suggestion),
                        )
                        imported += cur.rowcount
                        skipped += 1 - cur.rowcount
                notice = f"Imported {imported} suggestion{'s' if imported != 1 else ''}; skipped {skipped} duplicate row{'s' if skipped != 1 else ''}."
                self.redirect("/?notice=" + quote(notice))
            except (ValueError, csv.Error, UnicodeError) as exc:
                self.send_html(shell("Import error", f'<p class="notice">{esc(exc)}</p><a class="button" href="/">Back to inbox</a>'), 400)
            return
        if parsed.path == "/review":
            length = min(int(self.headers.get("Content-Length", "0")), 8192)
            fields = parse_qs(self.rfile.read(length).decode("utf-8", errors="replace"))
            try:
                item_id = int(fields.get("id", [""])[0])
            except ValueError:
                self.send_error(400)
                return
            badge = fields.get("badge", [""])[0]
            status = fields.get("status", ["New"])[0]
            if status not in ("New", "Reviewed", "Follow up"):
                status = "New"
            note = fields.get("note", [""])[0][:1000]
            with connect() as db:
                db.execute("UPDATE feedback SET status=?, note=? WHERE id=?", (status, note, item_id))
            self.redirect("/?badge=" + quote(badge))
            return
        self.send_error(404)


if __name__ == "__main__":
    connect().close()
    print(f"Feedback inbox listening on 0.0.0.0:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()

