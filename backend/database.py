"""SQLite database layer for PoT Oracle with persistent storage."""

import sqlite3
import json
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "pot_data.db")


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
            status TEXT DEFAULT 'pending'
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
            signer TEXT
        );

        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL,
            overall_score INTEGER NOT NULL,
            status TEXT NOT NULL,
            components TEXT,
            timestamp INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_heartbeats_wallet ON heartbeats(wallet);
        CREATE INDEX IF NOT EXISTS idx_heartbeats_received ON heartbeats(received_at);
        CREATE INDEX IF NOT EXISTS idx_scores_wallet ON scores(wallet);
        CREATE INDEX IF NOT EXISTS idx_scores_timestamp ON scores(timestamp DESC);
    """)
    conn.commit()
    conn.close()


def save_heartbeat(wallet: str, data: dict) -> int:
    conn = get_conn()
    received = int(time.time())
    conn.execute(
        """INSERT INTO heartbeats
        (wallet, timestamp, action, tx_hash, gas_used, block_number,
         market_event, strategy_type, asset, amount, received_at, signature, signer)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
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


def register_agent(wallet: str, token_id: int = 0) -> bool:
    conn = get_conn()
    now = int(time.time())
    try:
        conn.execute(
            "INSERT OR IGNORE INTO agents (wallet, token_id, registered_at) VALUES (?, ?, ?)",
            (wallet.lower(), token_id, now),
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
        "SELECT DISTINCT wallet FROM heartbeats ORDER BY wallet"
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
    # Update agent status
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

    wallets = get_all_wallets()
    total = len(wallets)
    page_wallets = wallets[offset : offset + limit]

    agents = []
    for w in page_wallets:
        score = get_latest_score(w)
        beat_count = count_heartbeats(w)
        beats = get_heartbeats(w)
        last_seen = beats[-1].get("timestamp", 0) if beats else 0
        agents.append(
            {
                "wallet": w,
                "agentic_score": score["overall_score"] if score else 0,
                "status": score["status"] if score else "no_data",
                "is_verified": (score["overall_score"] >= 70 and score["status"] == "verified_agent") if score else False,
                "heartbeats_count": beat_count,
                "last_seen": last_seen,
            }
        )

    conn.close()
    return agents, total
