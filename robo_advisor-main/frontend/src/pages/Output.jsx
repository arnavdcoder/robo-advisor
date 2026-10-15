import { useLocation, useNavigate } from "react-router-dom";
import QandA from "../components/QandA";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./Output.css";


function generateAdvice(result, riskProfile) {
  if (!riskProfile) return null;

  let score = 50;
  let positives = [];
  let warnings = [];

  const {
    confidence,
    prediction,
    indicators
  } = result;

  const risk = riskProfile.risk_score;


  // Model confidence
  if (confidence >= 70) {

    score += 15;

    positives.push(
      "The model shows strong confidence based on indicator agreement."
    );

  } 
  else if (confidence >= 50) {

    positives.push(
      "The model shows moderate confidence with several supporting signals."
    );

  }
  else {

    score -= 10;

    warnings.push(
      "The model confidence is low, so this prediction should be treated cautiously."
    );

  }



  // Risk profile compatibility

  if (prediction === "UP") {

    if (risk >= 4) {

      score += 10;

      positives.push(
        "Your growth-oriented profile matches the upside opportunity."
      );

    }


    if (risk === 3) {

      positives.push(
        "This prediction fits a balanced investment approach."
      );

    }


    if (risk <= 2) {

      score -= 5;

      warnings.push(
        "This opportunity may involve more volatility than your profile prefers."
      );

    }

  }



  if (prediction === "DOWN") {

    score -= 10;

    warnings.push(
      "The model detects downside pressure in current market conditions."
    );


    if (risk <= 2) {

      positives.push(
        "Your defensive profile aligns with caution during weaker signals."
      );

    }

  }



  // Momentum

  if (indicators.MACD > 0) {

    score += 5;

    positives.push(
      "MACD indicates positive momentum."
    );

  } 
  else {

    score -= 5;

    warnings.push(
      "MACD suggests weaker momentum."
    );

  }



  // Trend

  if (indicators.SMA_20 > indicators.SMA_50) {

    score += 5;

    positives.push(
      "Short-term trend is stronger than the long-term trend."
    );

  } 
  else {

    score -= 5;

    warnings.push(
      "Short-term trend is weaker than the long-term trend."
    );

  }



  // RSI

  if (
    indicators.RSI >= 40 &&
    indicators.RSI <= 70
  ) {

    positives.push(
      "RSI is in a healthy momentum range."
    );

  }


  if (indicators.RSI > 70) {

    score -= 10;

    warnings.push(
      "RSI suggests the stock may be overextended after recent gains."
    );

  }


  if (indicators.RSI < 30) {

    warnings.push(
      "RSI suggests the stock may be oversold, but weakness remains."
    );

  }



  // Recent movement

  if (indicators.Daily_Return > 0) {

    positives.push(
      "Recent price movement has been positive."
    );

  } 
  else {

    warnings.push(
      "Recent price movement has been negative."
    );

  }



  score = Math.max(
    0,
    Math.min(100, score)
  );


  let rating =
    score >= 75
      ? "STRONG MATCH"
      : score >= 55
      ? "WATCHLIST"
      : "CAUTION";


  return {
    score,
    rating,
    positives,
    warnings
  };
}



export default function Output() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const result = state?.result;
  const riskProfile = state?.riskProfile;


  if (!result) {
    return (
      <div className="output-page empty">
        <p>No prediction loaded yet.</p>

        <button
          className="cta"
          onClick={() => navigate("/ticker")}
        >
          Analyze a ticker →
        </button>

      </div>
    );
  }


  const isUp = result.prediction === "UP";


  const advice = generateAdvice(
    result,
    riskProfile
  );


  const confidenceLevel =
    result.confidence >= 70
      ? "High"
      : result.confidence >= 50
      ? "Moderate"
      : "Low";


  return (
    <div className="output-page">

      <div className={`hero-card ${isUp ? "up" : "down"}`}>

        <div className="ticker-header">

          <span>{result.ticker}</span>

          <span className={`badge ${isUp ? "up" : "down"}`}>
            {isUp ? "▲ UP" : "▼ DOWN"}
          </span>

        </div>


        <h1>
          {isUp ? "Bullish Outlook" : "Bearish Outlook"}
        </h1>


        <p className="subtitle">
          {isUp
            ? "Model sees upward potential based on technical market signals, with possible short-term volatility."
            : "Model sees downside pressure based on current technical market signals."}
        </p>


        <p className="subtitle">
          Random Forest AI prediction based on technical market signals
        </p>


        <div className="confidence-box">

          <div>
            <span>Model Confidence</span>

            <strong>
              {result.confidence}%
            </strong>
          </div>


          <div className="confidence-bar">

            <div
              className="confidence-fill"
              style={{
                width: `${result.confidence}%`
              }}
            />

          </div>


          <small>
            {confidenceLevel} confidence
          </small>

        </div>

      </div>



      <div className="analysis-card">

        <h2>
          Why this prediction?
        </h2>


        <p>
          {result.reasoning}
        </p>

      </div>




      {advice && (

        <div className="risk-match-card">

          <h2>
            Portfolio Compatibility
          </h2>


          <div className="compatibility-score">
            {advice.score}%
          </div>


          <h3>
            {advice.rating}
          </h3>


          <p>
            Based on your {riskProfile.allocation.label} profile
          </p>



          <h3>
            Positive Factors
          </h3>


          {advice.positives.map((item, i) => (
            <p key={i}>
              ✓ {item}
            </p>
          ))}



          <h3>
            Things to Watch
          </h3>


          {advice.warnings.map((item, i) => (
            <p key={i}>
              ⚠ {item}
            </p>
          ))}


        </div>

      )}



      <div className="section-title">
        Technical Indicators
      </div>



      <div className="indicators-grid">

        {Object.entries(result.indicators).map(([key, val]) => (

          <div className="indicator" key={key}>

            <span className="indicator-label">
              {key.replace(/_/g, " ")}
            </span>


            <span className="indicator-val">
              {typeof val === "number"
                ? val.toFixed(2)
                : val}
            </span>

          </div>

        ))}

      </div>




      {result.accuracy && (

        <div className="accuracy-card">

          <span>
            Historical prediction tracking
          </span>


          <strong>
            {result.accuracy.total > 0
              ? `${result.accuracy.correct}/${result.accuracy.total} correct (${result.accuracy.pct}%)`
              : "No verified predictions yet"}
          </strong>

        </div>

      )}




      <div className="chart-card">

        <h3>
          {result.ticker} Price History (30 Days)
        </h3>


        <ResponsiveContainer width="100%" height={260}>

          <LineChart data={result.history}>

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11 }}
            />

            <Tooltip
              formatter={(value) => [
                `$${value}`,
                "Close Price"
              ]}
              labelFormatter={(date) => `Date: ${date}`}
            />


            <Line
              type="monotone"
              dataKey="close"
              stroke={isUp ? "#34d399" : "#f87171"}
              strokeWidth={3}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>



      <button
        className="secondary"
        onClick={() =>
          navigate("/graphs", { state: { result } })
        }
      >
        View full price history →
      </button>



      <QandA result={result} />

    </div>
  );
}