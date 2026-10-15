import pandas as pd
from unittest.mock import patch
from advisor import predictor


def _fake_history(trend="up"):
    """Build 40 days of fake OHLCV data trending up or down."""
    dates = pd.date_range(end=pd.Timestamp.today(), periods=40)
    if trend == "up":
        closes = [100 + i * 0.8 for i in range(40)]
    else:
        closes = [140 - i * 0.8 for i in range(40)]
    return pd.DataFrame({"Close": closes}, index=dates)


def test_predict_up_trend():
    with patch("advisor.predictor.fetch_history", return_value=_fake_history("up")):
        result = predictor.predict("FAKE")
    assert result["prediction"] == "UP"
    assert 0 <= result["confidence"] <= 100
    assert "reasoning" in result
    assert len(result["history"]) <= 30


def test_predict_down_trend():
    with patch("advisor.predictor.fetch_history", return_value=_fake_history("down")):
        result = predictor.predict("FAKE")
    assert result["prediction"] == "DOWN"


def test_invalid_ticker_raises():
    with patch("advisor.predictor.fetch_history", side_effect=predictor.InvalidTickerError("bad")):
        try:
            predictor.predict("ZZZZZZ")
            assert False, "should have raised"
        except predictor.InvalidTickerError:
            pass
