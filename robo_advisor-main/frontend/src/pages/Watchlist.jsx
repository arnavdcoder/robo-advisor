import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Watchlist.css";

const API = "http://localhost:5000";


export default function Watchlist() {

  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);

  const [riskProfile, setRiskProfile] = useState(null);



  useEffect(() => {

    const saved =
      JSON.parse(localStorage.getItem("watchlist")) || [];

    setStocks(saved);


    const profile =
      JSON.parse(localStorage.getItem("riskProfile"));

    setRiskProfile(profile);

  }, []);




  useEffect(() => {

    if (stocks.length === 0) {
      setPredictions([]);
      return;
    }

    loadPredictions();

  }, [stocks]);




  async function loadPredictions() {

    setLoading(true);

    try {

      const results = await Promise.all(
        stocks.map(async (symbol) => {

          const res = await fetch(
            `${API}/api/predict?ticker=${symbol}`
          );

          return await res.json();

        })
      );


      setPredictions(results);

    } catch (err) {

      console.error(
        "Watchlist prediction error:",
        err
      );

    } finally {

      setLoading(false);

    }

  }





  function calculateCompatibility(stock) {

    if (!riskProfile) return null;


    let score = 50;

    const positives = [];
    const warnings = [];

    const risk = riskProfile.risk_score;



    if (stock.confidence >= 70) {

      score += 15;

      positives.push(
        "High model confidence"
      );

    }



    if (
      stock.prediction === "UP" &&
      risk >= 4
    ) {

      score += 15;

      positives.push(
        "Growth profile matches upside opportunity"
      );

    }



    if (
      stock.prediction === "UP" &&
      risk <= 2
    ) {

      score -= 10;

      warnings.push(
        "Stock may be more aggressive than your profile"
      );

    }



    if (stock.indicators.MACD > 0) {

      score += 10;

      positives.push(
        "Positive momentum"
      );

    }



    if (
      stock.indicators.SMA_20 >
      stock.indicators.SMA_50
    ) {

      score += 10;

      positives.push(
        "Positive short-term trend"
      );

    }



    if (stock.indicators.RSI >= 70) {

      score -= 10;

      warnings.push(
        "Stock may be overextended"
      );

    }



    if (stock.indicators.Daily_Return < 0) {

      warnings.push(
        "Recent price movement is negative"
      );

    }



    return {
      score: Math.min(
        100,
        Math.max(0, score)
      ),
      positives,
      warnings
    };

  }





  function calculateOpportunityScore(stock) {

    let score = 50;

    const indicators = stock.indicators;



    // Model confidence
    score += (stock.confidence - 50) * 0.4;



    // Prediction direction
    if (stock.prediction === "UP") {
      score += 10;
    } else {
      score -= 10;
    }



    // Momentum
    if (indicators.MACD > 0) {
      score += 10;
    }



    // Trend
    if (
      indicators.SMA_20 >
      indicators.SMA_50
    ) {
      score += 10;
    } else {
      score -= 10;
    }



    // RSI health
    if (
      indicators.RSI >= 40 &&
      indicators.RSI <= 65
    ) {
      score += 10;
    }


    if (indicators.RSI > 70) {
      score -= 10;
    }



    // Recent movement
    if (
      indicators.Daily_Return > 0
    ) {
      score += 5;
    } else {
      score -= 5;
    }



    // Risk profile adjustment
    if (riskProfile) {

      const risk =
        riskProfile.risk_score;


      if (
        risk >= 4 &&
        stock.prediction === "UP"
      ) {
        score += 10;
      }


      if (
        risk <= 2 &&
        stock.prediction === "UP"
      ) {
        score -= 5;
      }

    }



    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      )
    );

  }





  function addStock() {

    const symbol =
      ticker.trim().toUpperCase();


    if (!symbol) return;

    if (stocks.includes(symbol)) return;



    const updated = [
      ...stocks,
      symbol
    ];


    setStocks(updated);


    localStorage.setItem(
      "watchlist",
      JSON.stringify(updated)
    );


    setTicker("");

  }





  function removeStock(symbol) {

    const updated =
      stocks.filter(
        (s) => s !== symbol
      );


    setStocks(updated);


    localStorage.setItem(
      "watchlist",
      JSON.stringify(updated)
    );

  }





  function analyze(stock) {

    navigate(
      "/output",
      {
        state:{
          result: stock,
          riskProfile
        }
      }
    );

  }





  const rankedStocks =
    [...predictions].sort(
      (a,b) =>
        calculateOpportunityScore(b) -
        calculateOpportunityScore(a)
    );





  return (

    <div className="watchlist-page">


      <h1>
        My Watchlist
      </h1>


      <p className="sub">
        Ranked by Random Forest prediction strength and portfolio compatibility.
      </p>




      <div className="watchlist-input">

        <input
          placeholder="Add ticker e.g. NVDA"
          value={ticker}
          onChange={(e)=>
            setTicker(e.target.value)
          }
        />


        <button onClick={addStock}>
          Add
        </button>

      </div>





      {loading && (
        <p className="sub">
          Updating predictions...
        </p>
      )}






      <div className="watchlist-grid">


        {rankedStocks.length === 0 && !loading && (

          <p>
            No stocks saved yet.
          </p>

        )}






        {rankedStocks.map((stock,index)=>{


          const compatibility =
            calculateCompatibility(stock);


          const opportunity =
            calculateOpportunityScore(stock);



          return (

          <div
            className={
              `watch-card ${
                stock.prediction === "UP"
                ? "up"
                : "down"
              }`
            }
            key={stock.ticker}
          >


            {index === 0 && (
              <div className="top-pick-badge">
                🏆 Top Pick
              </div>
            )}



            <div className="watch-header">

              <h2>
                {stock.ticker}
              </h2>


              <span>
                {
                  stock.prediction === "UP"
                  ? "▲ UP"
                  : "▼ DOWN"
                }
              </span>

            </div>





            <div className="watch-confidence">

              Confidence:

              <strong>
                {stock.confidence}%
              </strong>

            </div>





            <div className="opportunity-score">

              Opportunity Score:

              <strong>
                {opportunity}%
              </strong>

            </div>






            {compatibility && (

              <div className="compatibility-box">

                <h3>
                  Portfolio Fit
                </h3>


                <strong>
                  {compatibility.score}%
                </strong>


                {compatibility.positives.map((p,i)=>(
                  <p key={i}>
                    ✓ {p}
                  </p>
                ))}


                {compatibility.warnings.map((w,i)=>(
                  <p key={i}>
                    ⚠ {w}
                  </p>
                ))}


              </div>

            )}






            <div className="watch-indicators">

              <div>
                RSI
                <strong>
                  {stock.indicators.RSI}
                </strong>
              </div>


              <div>
                MACD
                <strong>
                  {stock.indicators.MACD}
                </strong>
              </div>


              <div>
                Trend
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






            <button
              onClick={() =>
                analyze(stock)
              }
            >
              Analyze →
            </button>





            <button
              className="remove"
              onClick={() =>
                removeStock(stock.ticker)
              }
            >
              Remove
            </button>



          </div>

          );


        })}



      </div>


    </div>

  );

}