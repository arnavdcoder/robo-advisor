import os
import sqlite3
from unittest.mock import patch
from advisor import tracker


def _fresh_db(tmp_path_str):
    tracker.DB_PATH = tmp_path_str
    tracker.init_db()


def test_log_and_pending_count(tmp_path):
    _fresh_db(str(tmp_path / "test.db"))
    tracker.log_prediction("AAPL", "UP", 80, 200.0)
    acc = tracker.get_accuracy()
    assert acc["total"] == 0        # not checked yet
    assert acc["pending"] == 1


def test_check_and_update_marks_correct(tmp_path):
    _fresh_db(str(tmp_path / "test2.db"))
    # log a prediction "yesterday" by inserting directly with an old date
    tracker.log_prediction("AAPL", "UP", 80, 200.0)
    conn = sqlite3.connect(tracker.DB_PATH)
    conn.execute("UPDATE predictions SET predicted_at = '2000-01-01'")
    conn.commit()
    conn.close()

    import pandas as pd
    fake_hist = pd.DataFrame({"Close": [210.0]})

    with patch("advisor.tracker.yf.Ticker") as MockTicker:
        MockTicker.return_value.history.return_value = fake_hist
        updated = tracker.check_and_update()

    assert updated == 1
    acc = tracker.get_accuracy()
    assert acc["total"] == 1
    assert acc["correct"] == 1  # price went up, prediction was UP -> correct
    assert acc["pending"] == 0
