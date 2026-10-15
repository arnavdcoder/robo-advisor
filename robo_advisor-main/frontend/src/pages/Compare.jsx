import { useState } from "react";
import "./Compare.css";

const API = "http://localhost:5000";

export default function Compare() {
  const [tickers, setTickers] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function compareStocks() {
    const symbols = tickers
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    setLoading(true);

    const predictions = await Promise.all(
      symbols.map(async (ticker) => {
        const res = await fetch(
          `${API}/api/predict?ticker=${ticker}`
        );

        return await res.json();
      })
    );

    setResults(predictions);
    setLoading(false);
  }


  function getSignal(stock) {
    const signals = [];

    if (stock.indicators.MACD > 0) {
      signals.push("✓ MACD shows positive momentum");
    }

    if (stock.indicators.SMA_20 > stock.indicators.SMA_50) {
      signals.push("✓ Short-term trend is positive");
    } else {
      signals.push("⚠ Short-term trend is weaker");
    }

    if (
      stock.indicators.RSI > 30 &&
      stock.indicators.RSI < 70
    ) {
      signals.push("✓ RSI is in neutral range");
    }

    if (stock.indicators.Daily_Return > 0) {
      signals.push("✓ Recent movement is positive");
    } else {
      signals.push("⚠ Recent movement is negative");
    }

    return signals;
  }


  const topPick =
    results.length > 0
      ? [...results].sort(
          (a, b) => b.confidence - a.confidence
        )[0]
      : null;


  return (
    <div className="compare-page">

      <h1>Compare Stocks</h1>

      <p>
        Compare Random Forest predictions across multiple companies.
      </p>


      <div className="compare-input-row">

        <input
          placeholder="Example: NVDA, AAPL, MSFT"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
        />

        <button onClick={compareStocks}>
          {loading ? "Analyzing..." : "Compare"}
        </button>

      </div>


      {topPick && (
        <div className="top-pick-card">

          <div className="top-pick-header">
            🏆 Top Model Pick
          </div>


          <div className="top-pick-main">

            <span className="top-pick-stock">
              {topPick.ticker}
            </span>


            <span
              className={
                topPick.prediction === "UP"
                  ? "compare-direction up"
                  : "compare-direction down"
              }
            >
              {topPick.prediction === "UP"
                ? "▲ UP"
                : "▼ DOWN"}
            </span>

          </div>


          <div className="top-pick-confidence">

            Model confidence:

            <strong>
              {topPick.confidence}%
            </strong>

          </div>


          <p>
            Highest confidence prediction among compared stocks
            based on Random Forest technical analysis.
          </p>

        </div>
      )}



      <div className="comparison-grid">

        {results.map((stock) => {

          const isUp = stock.prediction === "UP";

          return (

            <div
              className={`compare-card ${
                isUp ? "up" : "down"
              }`}
              key={stock.ticker}
            >

              <div className="compare-top">

                <h2>
                  {stock.ticker}
                </h2>

                <span
                  className={
                    isUp
                      ? "compare-direction up"
                      : "compare-direction down"
                  }
                >
                  {isUp ? "▲ UP" : "▼ DOWN"}
                </span>

              </div>


              <div className="compare-confidence">

                <span>
                  Confidence
                </span>

                <strong>
                  {stock.confidence}%
                </strong>

              </div>


              <div className="compare-progress">

                <div
                  className="compare-progress-fill"
                  style={{
                    width: `${stock.confidence}%`
                  }}
                />

              </div>


              <h3>
                Technical Signals
              </h3>


              <div className="compare-signals">

                {getSignal(stock).map((signal, i) => (
                  <p key={i}>
                    {signal}
                  </p>
                ))}

              </div>



              <div className="compare-indicators">

                <div className="compare-indicator">
                  <span>RSI</span>
                  <strong>
                    {stock.indicators.RSI}
                  </strong>
                </div>


                <div className="compare-indicator">
                  <span>MACD</span>
                  <strong>
                    {stock.indicators.MACD}
                  </strong>
                </div>


                <div className="compare-indicator">
                  <span>SMA Trend</span>
                  <strong>
                    {
                      stock.indicators.SMA_20 >
                      stock.indicators.SMA_50
                        ? "Bullish"
                        : "Bearish"
                    }
                  </strong>
                </div>

              </div>


            </div>

          );

        })}

      </div>

    </div>
  );
}