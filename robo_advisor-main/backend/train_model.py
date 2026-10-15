import yfinance as yf
import pandas as pd
import numpy as np
import ta

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

import joblib


# -----------------------------
# Stocks to train on
# -----------------------------

stocks = [

    # Mega cap tech
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
    "META", "TSLA", "AVGO", "ORCL", "ADBE",

    # Semiconductors
    "AMD", "INTC", "QCOM", "MU",
    "TXN", "AMAT", "LRCX", "ASML",

    # Finance
    "JPM", "BAC", "GS", "MS",
    "V", "MA", "AXP", "BLK",

    # Healthcare
    "JNJ", "PFE", "MRK", "LLY", "UNH",

    # Consumer
    "WMT", "COST", "HD",
    "MCD", "NKE", "KO", "PEP",

    # Energy
    "XOM", "CVX",

    # Industrials
    "CAT", "GE", "BA",

    # Communication
    "NFLX", "DIS", "CMCSA",

    # ETFs
    "SPY", "QQQ", "IWM"

]


# -----------------------------
# Create features
# -----------------------------

def create_features(ticker):

    print(f"Downloading {ticker}...")

    df = yf.download(
        ticker,
        start="2010-01-01",
        end="2026-01-01",
        progress=False
    )


    if df.empty:
        return None


    # Fix yfinance multi-index
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)



    # -------------------------
    # Technical indicators
    # -------------------------

    df["RSI"] = ta.momentum.RSIIndicator(
        df["Close"]
    ).rsi()


    df["MACD"] = ta.trend.MACD(
        df["Close"]
    ).macd()


    df["SMA_20"] = ta.trend.SMAIndicator(
        df["Close"],
        window=20
    ).sma_indicator()


    df["SMA_50"] = ta.trend.SMAIndicator(
        df["Close"],
        window=50
    ).sma_indicator()



    bb = ta.volatility.BollingerBands(
        df["Close"]
    )


    df["Bollinger_High"] = (
        bb.bollinger_hband()
    )


    df["Bollinger_Low"] = (
        bb.bollinger_lband()
    )



    # -------------------------
    # Price behavior features
    # -------------------------

    df["Daily_Return"] = (
        df["Close"].pct_change()
    )


    df["Return_5D"] = (
        df["Close"].pct_change(5)
    )


    df["Return_20D"] = (
        df["Close"].pct_change(20)
    )


    df["Volatility"] = (
        df["Daily_Return"]
        .rolling(20)
        .std()
    )


    df["SMA_Distance"] = (
        (df["Close"] - df["SMA_50"])
        /
        df["SMA_50"]
    )



    # -------------------------
    # Prediction target
    # -------------------------
    # Predict whether stock gains
    # >2% over next 5 trading days

    future_return = (
        df["Close"].shift(-5)
        -
        df["Close"]
    ) / df["Close"]


    df["Target"] = (
        future_return > 0.02
    ).astype(int)



    df.dropna(inplace=True)


    return df



# -----------------------------
# Build dataset
# -----------------------------

all_data = []


for stock in stocks:

    data = create_features(stock)

    if data is not None:
        all_data.append(data)



dataset = pd.concat(all_data)


# Sort chronologically
dataset = dataset.sort_index()



print("\nDataset size:")
print(dataset.shape)



# -----------------------------
# Features
# -----------------------------

features = [

    "RSI",
    "MACD",

    "SMA_20",
    "SMA_50",

    "Bollinger_High",
    "Bollinger_Low",

    "Daily_Return",
    "Volume",

    "Return_5D",
    "Return_20D",

    "Volatility",
    "SMA_Distance"

]



X = dataset[features]

y = dataset["Target"]



# -----------------------------
# Time based train/test split
# -----------------------------

split = int(
    len(dataset) * 0.8
)


X_train = X.iloc[:split]
X_test = X.iloc[split:]


y_train = y.iloc[:split]
y_test = y.iloc[split:]



print("\nTraining samples:")
print(len(X_train))

print("\nTesting samples:")
print(len(X_test))



# -----------------------------
# Random Forest
# -----------------------------

model = RandomForestClassifier(

    n_estimators=500,

    max_depth=12,

    min_samples_split=20,

    random_state=42,

    class_weight="balanced"

)



print("\nTraining model...")


model.fit(
    X_train,
    y_train
)



# -----------------------------
# Evaluation
# -----------------------------

predictions = model.predict(
    X_test
)



accuracy = accuracy_score(
    y_test,
    predictions
)



print("\nAccuracy:")
print(
    round(
        accuracy * 100,
        2
    ),
    "%"
)



print("\nReport:")

print(
    classification_report(
        y_test,
        predictions
    )
)



# -----------------------------
# Save model
# -----------------------------

joblib.dump(
    model,
    "model.pkl"
)


print(
    "\nSaved model.pkl successfully!"
)