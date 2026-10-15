"""
tracker.py
Persistent accuracy tracking for logged predictions, using SQLite so it
survives server restarts (unlike the old in-memory PREDICTION_LOG).

Flow:
  1. Every /api/predict call logs a row: ticker, prediction, price at the
     moment of prediction, and the date.
  2. check_and_update() looks for rows where at least one trading day has
     passed since they were logged, pulls the actual price from yfinance
     for that later date, and marks each one correct/incorrect.
  3. get_accuracy() reports totals across all *checked* predictions.
"""

import sqlite3
import os
from datetime import datetime, date
import yfinance as yf

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "predictions.db")


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = _connect()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            prediction TEXT NOT NULL,
            confidence INTEGER,
            price_at_prediction REAL,
            predicted_at TEXT NOT NULL,
            checked INTEGER DEFAULT 0,
            actual_price REAL,
            correct INTEGER
        )
    """)
    conn.commit()
    conn.close()


def log_prediction(ticker: str, prediction: str, confidence: int, price_at_prediction: float) -> int:
    conn = _connect()
    cur = conn.execute(
        "INSERT INTO predictions (ticker, prediction, confidence, price_at_prediction, predicted_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (ticker, prediction, confidence, price_at_prediction, date.today().isoformat()),
    )
    conn.commit()
    row_id = cur.lastrowid
    conn.close()
    return row_id


def check_and_update() -> int:
    """
    Finds unchecked predictions logged on an earlier calendar date, fetches
    the actual price since then, and marks correct/incorrect.
    Returns how many rows were updated.
    """
    conn = _connect()
    today = date.today().isoformat()
    pending = conn.execute(
        "SELECT * FROM predictions WHERE checked = 0 AND predicted_at < ?", (today,)
    ).fetchall()

    updated = 0
    for row in pending:
        try:
            hist = yf.Ticker(row["ticker"]).history(period="5d")
            if hist.empty:
                continue
            actual_price = float(hist["Close"].iloc[-1])
            actual_direction = "UP" if actual_price >= row["price_at_prediction"] else "DOWN"
            correct = 1 if actual_direction == row["prediction"] else 0

            conn.execute(
                "UPDATE predictions SET checked = 1, actual_price = ?, correct = ? WHERE id = ?",
                (actual_price, correct, row["id"]),
            )
            updated += 1
        except Exception:
            # leave it unchecked, try again next time check_and_update runs
            continue

    conn.commit()
    conn.close()
    return updated


def get_accuracy() -> dict:
    conn = _connect()
    checked = conn.execute("SELECT correct FROM predictions WHERE checked = 1").fetchall()
    pending = conn.execute("SELECT COUNT(*) as c FROM predictions WHERE checked = 0").fetchone()
    conn.close()

    total = len(checked)
    correct = sum(r["correct"] for r in checked)
    pct = round((correct / total) * 100, 1) if total else 0

    return {
        "correct": correct,
        "total": total,
        "pct": pct,
        "pending": pending["c"],
    }


def get_recent(limit: int = 20) -> list:
    conn = _connect()
    rows = conn.execute(
        "SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
