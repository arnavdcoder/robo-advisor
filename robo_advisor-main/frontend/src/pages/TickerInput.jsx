import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrediction } from "../api";
import "./TickerInput.css";

const EXAMPLES = ["AAPL", "TSLA", "MSFT", "NVDA"];

export default function TickerInput() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getPrediction(ticker.trim());

      const riskProfile = JSON.parse(
        localStorage.getItem("riskProfile")
      );

      navigate("/output", {
        state: {
          result,
          riskProfile,
        },
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ticker-page">
      <h1>What are we looking at?</h1>
      <p className="sub">Enter a stock ticker symbol to run the prediction engine.</p>

      <form onSubmit={handleSubmit} className="ticker-form">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="e.g. AAPL"
          maxLength={8}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Pulling 30-day history and running the model…</span>
        </div>
      )}

      {error && <div className="error-box">Couldn't analyze "{ticker}": {error}</div>}

      <div className="examples">
        <span className="examples-label">Try:</span>
        {EXAMPLES.map((t) => (
          <button key={t} className="example-chip" onClick={() => setTicker(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
