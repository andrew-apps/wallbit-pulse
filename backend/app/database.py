from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from app.config import get_settings

DB_PATH = Path("wallbit_pulse.db")
_initialized = False


def _resolve_db_path() -> Path:
    url = get_settings().database_url
    if url.startswith("sqlite:///"):
        raw = url.removeprefix("sqlite:///")
        path = Path(raw)
        path.parent.mkdir(parents=True, exist_ok=True)
        return path
    return DB_PATH


SCHEMA = """
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    snapshot_url TEXT,
    screenshot_path TEXT,
    sent_to_telegram INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_confirmations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    confirmation_text TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telegram_links (
    user_id TEXT PRIMARY KEY,
    telegram_chat_id TEXT NOT NULL,
    telegram_username TEXT,
    linked_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telegram_link_codes (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallbit_connections (
    user_id TEXT PRIMARY KEY,
    encrypted_api_key TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'read_only',
    permissions TEXT NOT NULL DEFAULT 'read',
    connected_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    portfolio_value REAL NOT NULL,
    checking_balance REAL NOT NULL,
    snapshot_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forecasts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    amount REAL NOT NULL,
    horizon_days INTEGER NOT NULL,
    entry_price REAL NOT NULL,
    predicted_price REAL NOT NULL,
    bearish_pnl REAL NOT NULL,
    base_pnl REAL NOT NULL,
    bullish_pnl REAL NOT NULL,
    risk TEXT NOT NULL,
    recommendation TEXT,
    status TEXT NOT NULL DEFAULT 'en curso',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


def get_connection() -> sqlite3.Connection:
    global _initialized
    conn = sqlite3.connect(_resolve_db_path())
    conn.row_factory = sqlite3.Row
    if not _initialized:
        conn.executescript(SCHEMA)
        _initialized = True
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA)


def audit_log(event_type: str, payload: dict[str, Any], user_id: str = "demo-user") -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO audit_logs (user_id, event_type, payload_json) VALUES (?, ?, ?)",
            (user_id, event_type, json.dumps(payload, default=str)),
        )
