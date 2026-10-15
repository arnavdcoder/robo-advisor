import { useEffect, useState } from "react";
import { getQuestions, submitProfile } from "../api";
import "./RiskProfile.css";

const LABELS = {
  horizon: {
    under_1yr: "Less than 1 year", "1_3yrs": "1–3 years", "3_7yrs": "3–7 years",
    "7_15yrs": "7–15 years", "15yrs_plus": "15+ years",
  },
  reaction_to_drop: {
    sell_everything: "Sell everything, immediately", sell_some: "Sell some of it",
    do_nothing: "Do nothing, wait it out", hold_and_wait: "Hold, I'm playing the long game",
    buy_more: "Buy more while it's cheap",
  },
  experience: {
    none: "None", a_little: "A little", some: "Some", a_lot: "A lot", professional: "Professional",
  },
  goal: {
    preserve_capital: "Preserve what I have", steady_income: "Steady income",
    balanced_growth: "Balanced growth", growth: "Growth", aggressive_growth: "Aggressive growth",
  },
};

export default function RiskProfile() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getQuestions().then(setQuestions).catch((e) => setError(e.message));
  }, []);

  function pick(qid, optionKey) {
    setAnswers((prev) => ({ ...prev, [qid]: optionKey }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const res = await submitProfile(answers);

      setResult(res);

      localStorage.setItem(
        "riskProfile",
        JSON.stringify(res)
      );

      // Save risk profile so other pages can use it
      localStorage.setItem(
        "riskProfile",
        JSON.stringify(res)
      );

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  if (result) {
    return (
      <div className="profile-page">
        <div className="result-summary">
          <span className="result-eyebrow">Risk score {result.risk_score}/5</span>
          <h1>{result.allocation.label}</h1>
          <div className="allocation-bar">
            <div className="alloc-stocks" style={{ width: `${result.allocation.stocks}%` }}>
              {result.allocation.stocks}% stocks
            </div>
            <div className="alloc-bonds" style={{ width: `${result.allocation.bonds}%` }}>
              {result.allocation.bonds}% bonds
            </div>
          </div>
          <p className="etf-label">Suggested ETFs</p>
          <div className="etf-chips">
            {result.allocation.etfs.map((e) => <span className="etf-chip" key={e}>{e}</span>)}
          </div>
          <button className="secondary" onClick={() => { setResult(null); setAnswers({}); }}>
            Retake questionnaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Let's figure out your risk profile</h1>
      <p className="sub">Four quick questions. No wrong answers — just honest ones.</p>

      {error && <div className="error-box">{error}</div>}

      {questions.map((q) => (
        <div className="question-block" key={q.id}>
          <h3>{q.question}</h3>
          <div className="option-grid">
            {Object.keys(q.options).map((optKey) => (
              <button
                key={optKey}
                className={`option-btn ${answers[q.id] === optKey ? "selected" : ""}`}
                onClick={() => pick(q.id, optKey)}
              >
                {LABELS[q.id]?.[optKey] || optKey}
              </button>
            ))}
          </div>
        </div>
      ))}

      {questions.length > 0 && (
        <button className="cta" disabled={!allAnswered || loading} onClick={handleSubmit}>
          {loading ? "Calculating…" : "See my allocation →"}
        </button>
      )}
    </div>
  );
}
