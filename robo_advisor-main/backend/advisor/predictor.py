"""
predictor.py
Uses trained Random Forest ML model to predict stock movement.
"""

import os
import yfinance as yf
import pandas as pd
import ta
import joblib


class InvalidTickerError(Exception):
    pass


# Load trained model
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "model.pkl"
)

model = joblib.load(MODEL_PATH)


def fetch_history(ticker: str, period: str = "3mo") -> pd.DataFrame:
    data = yf.Ticker(ticker).history(period=period)

    if data.empty:
        raise InvalidTickerError(
            f"No data found for ticker '{ticker}'"
        )

    return data


def create_features(data):

    close = data["Close"]

    features = {}

    features["RSI"] = ta.momentum.RSIIndicator(
        close
    ).rsi().iloc[-1]

    features["MACD"] = ta.trend.MACD(
        close
    ).macd().iloc[-1]

    features["SMA_20"] = ta.trend.SMAIndicator(
        close,
        window=20
    ).sma_indicator().iloc[-1]

    features["SMA_50"] = ta.trend.SMAIndicator(
        close,
        window=50
    ).sma_indicator().iloc[-1]

    bb = ta.volatility.BollingerBands(
        close
    )

    features["Bollinger_High"] = (
        bb.bollinger_hband().iloc[-1]
    )

    features["Bollinger_Low"] = (
        bb.bollinger_lband().iloc[-1]
    )

    features["Daily_Return"] = (
        close.pct_change().iloc[-1]
    )

    features["Volume"] = data["Volume"].iloc[-1]

    return pd.DataFrame([features])


def generate_reasoning(prediction, indicators):

    reasons = []

    if prediction == "UP":
        reasons.append("📈 Bullish Signals")
    else:
        reasons.append("📉 Bearish Signals")


    if indicators["MACD"] > 0:
        reasons.append(
            "✓ MACD shows positive momentum"
        )
    else:
        reasons.append(
            "✓ MACD shows weakening momentum"
        )


    if indicators["SMA_20"] > indicators["SMA_50"]:
        reasons.append(
            "✓ Short-term trend is above the long-term trend"
        )
    else:
        reasons.append(
            "✓ Short-term trend is below the long-term trend"
        )


    if indicators["RSI"] > 70:
        reasons.append(
            "⚠ RSI suggests the stock may be overbought"
        )
    elif indicators["RSI"] < 30:
        reasons.append(
            "✓ RSI suggests possible recovery potential"
        )
    else:
        reasons.append(
            "✓ RSI is in a neutral range"
        )


    if indicators["Daily_Return"] > 0:
        reasons.append(
            "✓ Recent price movement has been positive"
        )
    else:
        reasons.append(
            "⚠ Recent price movement has been negative"
        )


    return "\n".join(reasons)



def predict(ticker: str):

    ticker = ticker.strip().upper()

    data = fetch_history(ticker)

    ml_features = create_features(data)

    prediction_value = model.predict(
        ml_features
    )[0]

    probability = model.predict_proba(
        ml_features
    )[0]

    confidence = round(
        max(probability) * 100,
        2
    )


    prediction = (
        "UP"
        if prediction_value == 1
        else "DOWN"
    )


    indicators = {
        k: round(float(v), 2)
        for k, v in ml_features.iloc[0].items()
    }


    history_data = data.tail(30)

    history = [
        {
            "date": idx.strftime("%Y-%m-%d"),
            "close": round(float(row["Close"]), 2)
        }
        for idx, row in history_data.iterrows()
    ]


    return {
        "ticker": ticker,
        "prediction": prediction,
        "confidence": confidence,
        "reasoning": generate_reasoning(
            prediction,
            indicators
        ),
        "indicators": indicators,
        "history": history,
    }