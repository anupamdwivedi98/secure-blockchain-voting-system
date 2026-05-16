import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "votes.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS voters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            voter_id TEXT NOT NULL UNIQUE,
            voter_hash TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            registered_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            voter_hash TEXT NOT NULL UNIQUE,
            party TEXT NOT NULL,
            block_index INTEGER,
            block_hash TEXT,
            voted_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (voter_hash) REFERENCES voters(voter_hash)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS blockchain_state (
            id INTEGER PRIMARY KEY,
            chain_json TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS parties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            symbol TEXT NOT NULL,
            color TEXT NOT NULL,
            candidate TEXT NOT NULL
        )
    """)

    # Seed parties
    parties = [
        ("BJP", "🪷", "#FF6B35", "Narendra Modi"),
        ("Congress", "✋", "#19A3FF", "Rahul Gandhi"),
        ("AAP", "🧹", "#00B4D8", "Arvind Kejriwal"),
        ("SP", "🚲", "#E63946", "Akhilesh Yadav"),
        ("BSP", "🐘", "#6A0DAD", "Mayawati"),
    ]
    for p in parties:
        c.execute("""
            INSERT OR IGNORE INTO parties (name, symbol, color, candidate) VALUES (?, ?, ?, ?)
        """, p)

    conn.commit()
    conn.close()


def register_voter(voter_id: str, voter_hash: str, name: str, age: int) -> dict:
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO voters (voter_id, voter_hash, name, age) VALUES (?, ?, ?, ?)",
            (voter_id, voter_hash, name, age)
        )
        conn.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        return {"success": False, "message": "Voter already registered"}
    finally:
        conn.close()


def voter_exists(voter_id: str) -> bool:
    conn = get_connection()
    row = conn.execute("SELECT id FROM voters WHERE voter_id = ?", (voter_id,)).fetchone()
    conn.close()
    return row is not None


def has_voted(voter_hash: str) -> bool:
    conn = get_connection()
    row = conn.execute("SELECT id FROM votes WHERE voter_hash = ?", (voter_hash,)).fetchone()
    conn.close()
    return row is not None


def record_vote(voter_hash: str, party: str, block_index: int, block_hash: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO votes (voter_hash, party, block_index, block_hash) VALUES (?, ?, ?, ?)",
        (voter_hash, party, block_index, block_hash)
    )
    conn.commit()
    conn.close()


def get_all_parties() -> list:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM parties").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_vote_counts() -> dict:
    conn = get_connection()
    rows = conn.execute(
        "SELECT party, COUNT(*) as count FROM votes GROUP BY party"
    ).fetchall()
    conn.close()
    return {r["party"]: r["count"] for r in rows}


def get_total_registered() -> int:
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM voters").fetchone()[0]
    conn.close()
    return count


def get_total_voted() -> int:
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM votes").fetchone()[0]
    conn.close()
    return count


def save_chain_state(chain_json: str):
    conn = get_connection()
    conn.execute("DELETE FROM blockchain_state")
    conn.execute("INSERT INTO blockchain_state (id, chain_json) VALUES (1, ?)", (chain_json,))
    conn.commit()
    conn.close()


def load_chain_state() -> str | None:
    conn = get_connection()
    row = conn.execute("SELECT chain_json FROM blockchain_state WHERE id = 1").fetchone()
    conn.close()
    return row["chain_json"] if row else None
