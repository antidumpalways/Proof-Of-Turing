"""SQLite database layer for Tripwire Oracle with persistent storage."""

import sqlite3
import json
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "tripwire_data.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS agents (
            wallet TEXT PRIMARY KEY,
            token_id INTEGER DEFAULT 0,
            registered_at INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            source TEXT DEFAULT 'direct'
        );

        CREATE TABLE IF NOT EXISTS heartbeats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            action TEXT,
            tx_hash TEXT,
            gas_used REAL,
            block_number INTEGER,
            market_event TEXT,
            strategy_type TEXT,
            asset TEXT,
            amount REAL,
            received_at INTEGER NOT NULL,
            signature TEXT,
            signer TEXT,
            source TEXT DEFAULT 'direct'
        );

        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL,
            overall_score INTEGER NOT NULL,
            status TEXT NOT NULL,
            components TEXT,
            timestamp INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS threat_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL,
            threat_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            details TEXT,
            timestamp INTEGER NOT NULL,
            acknowledged INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS quarantine_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL,
            reason TEXT NOT NULL,
            quarantined_at INTEGER NOT NULL,
            released_at INTEGER,
            status TEXT DEFAULT 'active'
        );

        CREATE TABLE IF NOT EXISTS risk_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL,
            risk_score REAL NOT NULL,
            threat_level TEXT NOT NULL,
            risk_factors TEXT,
            timestamp INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS guard_policies (
            wallet TEXT PRIMARY KEY,
            max_risk_score REAL DEFAULT 70.0,
            auto_quarantine INTEGER DEFAULT 1,
            alert_threshold REAL DEFAULT 60.0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_heartbeats_wallet ON heartbeats(wallet);
        CREATE INDEX IF NOT EXISTS idx_heartbeats_received ON heartbeats(received_at);
        CREATE INDEX IF NOT EXISTS idx_scores_wallet ON scores(wallet);
        CREATE INDEX IF NOT EXISTS idx_scores_timestamp ON scores(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_heartbeats_source ON heartbeats(source);
        CREATE INDEX IF NOT EXISTS idx_threats_wallet ON threat_events(wallet);
        CREATE INDEX IF NOT EXISTS idx_threats_timestamp ON threat_events(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_quarantine_wallet ON quarantine_log(wallet);
        CREATE INDEX IF NOT EXISTS idx_risk_wallet ON risk_scores(wallet);
        CREATE INDEX IF NOT EXISTS idx_risk_timestamp ON risk_scores(timestamp DESC);
    """)

    # Migration: add source columns if missing (existing databases)
    for col, table, default in [
        ("source", "heartbeats", "'direct'"),
        ("source", "agents", "'direct'"),
    ]:
        try:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} TEXT DEFAULT {default}")
        except sqlite3.OperationalError:
            pass

    conn.commit()
    conn.close()


def save_heartbeat(wallet: str, data: dict) -> int:
    conn = get_conn()
    received = int(time.time())
    conn.execute(
        """INSERT INTO heartbeats
        (wallet, timestamp, action, tx_hash, gas_used, block_number,
         market_event, strategy_type, asset, amount, received_at, signature, signer, source)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            wallet.lower(),
            data.get("timestamp", received),
            data.get("action"),
            data.get("tx_hash"),
            data.get("gas_used"),
            data.get("block_number"),
            data.get("market_event"),
            data.get("strategy_type"),
            data.get("asset"),
            data.get("amount"),
            received,
            data.get("signature"),
            data.get("signer"),
            data.get("source", "direct"),
        ),
    )
    conn.commit()
    row_id = conn.lastrowid
    conn.close()
    return row_id


def get_heartbeats(wallet: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM heartbeats WHERE wallet = ? ORDER BY timestamp ASC",
        (wallet.lower(),),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def count_heartbeats(wallet: str) -> int:
    conn = get_conn()
    row = conn.execute(
        "SELECT COUNT(*) as cnt FROM heartbeats WHERE wallet = ?",
        (wallet.lower(),),
    ).fetchone()
    conn.close()
    return row["cnt"] if row else 0


def register_agent(wallet: str, token_id: int = 0, source: str = "direct") -> bool:
    conn = get_conn()
    now = int(time.time())
    try:
        conn.execute(
            "INSERT OR IGNORE INTO agents (wallet, token_id, registered_at, source) VALUES (?, ?, ?, ?)",
            (wallet.lower(), token_id, now, source),
        )
        conn.commit()
        conn.close()
        return True
    except Exception:
        conn.close()
        return False


def get_agent(wallet: str):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM agents WHERE wallet = ?", (wallet.lower(),)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_wallets() -> list:
    conn = get_conn()
    rows = conn.execute(
        """SELECT DISTINCT wallet FROM (
            SELECT wallet FROM heartbeats
            UNION
            SELECT wallet FROM agents
        ) ORDER BY wallet"""
    ).fetchall()
    conn.close()
    return [r["wallet"] for r in rows]


def save_score(wallet: str, overall_score: int, status: str, components: dict):
    conn = get_conn()
    now = int(time.time())
    conn.execute(
        "INSERT INTO scores (wallet, overall_score, status, components, timestamp) VALUES (?, ?, ?, ?, ?)",
        (wallet.lower(), overall_score, status, json.dumps(components), now),
    )
    conn.execute(
        "INSERT OR REPLACE INTO agents (wallet, token_id, registered_at, status) VALUES (?, COALESCE((SELECT token_id FROM agents WHERE wallet = ?), 0), COALESCE((SELECT registered_at FROM agents WHERE wallet = ?), ?), ?)",
        (wallet.lower(), wallet.lower(), wallet.lower(), now, status),
    )
    conn.commit()
    conn.close()


def get_latest_score(wallet: str):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM scores WHERE wallet = ? ORDER BY timestamp DESC LIMIT 1",
        (wallet.lower(),),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_score_history(wallet: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT overall_score as score, timestamp FROM scores WHERE wallet = ? ORDER BY timestamp ASC",
        (wallet.lower(),),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_agent_list(page: int = 1, limit: int = 20) -> tuple:
    conn = get_conn()
    offset = (page - 1) * limit

    rows = conn.execute(
        """SELECT
            COALESCE(hb.wallet, a.wallet) as wallet,
            s.overall_score,
            s.status,
            hb.beat_count,
            hb.last_seen,
            COALESCE(a.source, 'direct') as source,
            rs.risk_score,
            rs.threat_level,
            EXISTS(
                SELECT 1 FROM quarantine_log ql
                WHERE ql.wallet = all_wallets.wallet AND ql.status = 'active'
            ) as is_quarantined
        FROM (
            SELECT wallet FROM heartbeats
            UNION
            SELECT wallet FROM agents
        ) all_wallets
        LEFT JOIN (
            SELECT wallet, COUNT(*) as beat_count, MAX(timestamp) as last_seen
            FROM heartbeats GROUP BY wallet
        ) hb ON hb.wallet = all_wallets.wallet
        LEFT JOIN agents a ON a.wallet = all_wallets.wallet
        LEFT JOIN (
            SELECT wallet, overall_score, status
            FROM scores
            WHERE id IN (SELECT MAX(id) FROM scores GROUP BY wallet)
        ) s ON s.wallet = all_wallets.wallet
        LEFT JOIN (
            SELECT wallet, risk_score, threat_level
            FROM risk_scores
            WHERE id IN (SELECT MAX(id) FROM risk_scores GROUP BY wallet)
        ) rs ON rs.wallet = all_wallets.wallet
        ORDER BY all_wallets.wallet
        LIMIT ? OFFSET ?""",
        (limit, offset),
    ).fetchall()

    count_row = conn.execute(
        """SELECT COUNT(*) as cnt FROM (
            SELECT wallet FROM heartbeats
            UNION
            SELECT wallet FROM agents
        )""",
    ).fetchone()
    total = count_row["cnt"] if count_row else 0

    agents = []
    for r in rows:
        score = r["overall_score"] or 0
        st = r["status"] or "no_data"
        agents.append(
            {
                "wallet": r["wallet"],
                "agentic_score": score,
                "status": st,
                "is_verified": (score >= 70 and st == "verified_agent"),
                "heartbeats_count": r["beat_count"] or 0,
                "last_seen": r["last_seen"] or 0,
                "source": r["source"] or "direct",
                "risk_score": int(r["risk_score"] or 0),
                "threat_level": r["threat_level"] or "None",
                "is_quarantined": bool(r["is_quarantined"]),
            }
        )

    conn.close()
    return agents, total


# ─── Threat Events ───

def save_threat_event(wallet: str, threat_type: str, severity: str, details: str = "") -> int:
    conn = get_conn()
    now = int(time.time())
    conn.execute(
        "INSERT INTO threat_events (wallet, threat_type, severity, details, timestamp) VALUES (?, ?, ?, ?, ?)",
        (wallet.lower(), threat_type, severity, details, now),
    )
    conn.commit()
    row_id = conn.lastrowid
    conn.close()
    return row_id


def get_threat_events(limit: int = 50) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM threat_events ORDER BY timestamp DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_threat_history(wallet: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM threat_events WHERE wallet = ? ORDER BY timestamp DESC",
        (wallet.lower(),),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── Quarantine Log ───

def quarantine_agent(wallet: str, reason: str) -> int:
    conn = get_conn()
    now = int(time.time())
    conn.execute(
        "INSERT INTO quarantine_log (wallet, reason, quarantined_at, status) VALUES (?, ?, ?, 'active')",
        (wallet.lower(), reason, now),
    )
    conn.commit()
    row_id = conn.lastrowid
    conn.close()
    return row_id


def unquarantine_agent(wallet: str) -> bool:
    conn = get_conn()
    now = int(time.time())
    conn.execute(
        "UPDATE quarantine_log SET status = 'released', released_at = ? WHERE wallet = ? AND status = 'active'",
        (now, wallet.lower()),
    )
    conn.commit()
    conn.close()
    return True


def get_quarantine_log(wallet: str = None) -> list:
    conn = get_conn()
    if wallet:
        rows = conn.execute(
            "SELECT * FROM quarantine_log WHERE wallet = ? ORDER BY quarantined_at DESC",
            (wallet.lower(),),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM quarantine_log ORDER BY quarantined_at DESC LIMIT 50",
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── Risk Scores ───

def save_risk_score(wallet: str, risk_score: float, threat_level: str, risk_factors: dict = None) -> int:
    conn = get_conn()
    now = int(time.time())
    conn.execute(
        "INSERT INTO risk_scores (wallet, risk_score, threat_level, risk_factors, timestamp) VALUES (?, ?, ?, ?, ?)",
        (wallet.lower(), risk_score, threat_level, json.dumps(risk_factors or {}), now),
    )
    conn.commit()
    row_id = conn.lastrowid
    conn.close()
    return row_id


def get_latest_risk_score(wallet: str):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM risk_scores WHERE wallet = ? ORDER BY timestamp DESC LIMIT 1",
        (wallet.lower(),),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_risk_score_history(wallet: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM risk_scores WHERE wallet = ? ORDER BY timestamp ASC",
        (wallet.lower(),),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── Guard Policies ───

def get_guard_policy(wallet: str):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM guard_policies WHERE wallet = ?",
        (wallet.lower(),),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def save_guard_policy(wallet: str, max_risk_score: float = 70.0,
                      auto_quarantine: bool = True, alert_threshold: float = 60.0):
    conn = get_conn()
    now = int(time.time())
    conn.execute(
        """INSERT OR REPLACE INTO guard_policies
        (wallet, max_risk_score, auto_quarantine, alert_threshold, created_at, updated_at)
        VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM guard_policies WHERE wallet = ?), ?), ?)""",
        (wallet.lower(), max_risk_score, int(auto_quarantine), alert_threshold,
         wallet.lower(), now, now),
    )
    conn.commit()
    conn.close()
