import { useState } from "react";
import "./QandA.css";

const EXAMPLE_QUESTIONS = [
  "Why this call?",
  "What does RSI mean?",
  "How confident are you?",
  "What's the moving average?",
];

function answerFor(question, result) {
  const q = question.toLowerCase();
  const { ticker, confidence, indicators, reasoning } = result;

  if (q.includes("rsi")) {
    return `RSI (Relative Strength Index) measures recent price momentum on a scale from 0–100. ${ticker}'s current RSI is ${indicators.RSI}. Values above 70 may suggest the stock is overbought, while values below 30 may suggest it is oversold.`;
  }

  if (q.includes("confiden")) {
    return `The Random Forest model confidence is ${confidence}%. This confidence comes from the model's probability estimate using multiple technical indicators including RSI, MACD, moving averages, Bollinger Bands, and trading volume. Higher confidence means the model found stronger patterns, but it does not guarantee future performance.`;
  }

  if (
    q.includes("moving average") ||
    q.includes("sma") ||
    q.includes("ma ")
  ) {
    const trend =
      indicators.SMA_20 > indicators.SMA_50
        ? "above"
        : "below";

    return `${ticker}'s 20-day moving average is $${indicators.SMA_20} and its 50-day moving average is $${indicators.SMA_50}. The 20-day average is currently ${trend} the 50-day average, which the model interprets as a ${trend === "above" ? "positive" : "weaker"} trend signal.`;
  }

  if (q.includes("macd")) {
    return `MACD measures momentum by comparing short-term and long-term price trends. ${ticker}'s MACD value is ${indicators.MACD}. A positive MACD value generally indicates upward momentum.`;
  }

  if (q.includes("why") || q.includes("call") || q.includes("reason")) {
    return reasoning;
  }

  if (q.includes("accura") || q.includes("track record")) {
    return `The app tracks predictions by comparing previous model predictions with the following day's price movement. This helps measure how the Random Forest model performs on new market data.`;
  }

  if (
    q.includes("buy") ||
    q.includes("sell") ||
    q.includes("invest")
  ) {
    return `This model predicts possible price direction using historical market patterns and technical indicators. It is not financial advice, and investment decisions should consider your own goals, risk tolerance, and research.`;
  }

  return `I can explain this prediction using the model's technical indicators. Try asking about RSI, MACD, moving averages, confidence, or why this prediction was made.`;
}

export default function QandA({ result }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function ask(question) {
    if (!question.trim()) return;

    const answer = answerFor(question, result);

    setMessages((prev) => [
      ...prev,
      { question, answer }
    ]);

    setInput("");
  }

  return (
    <div className="qa-box">
      <h3>Ask about this call</h3>

      <p className="qa-sub">
        AI assistant — explanations are generated from the Random Forest model prediction and technical indicators.
      </p>

      <div className="qa-chips">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            className="qa-chip"
            onClick={() => ask(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="qa-thread">
          {messages.map((m, i) => (
            <div className="qa-turn" key={i}>
              <div className="qa-question">
                {m.question}
              </div>

              <div className="qa-answer">
                {m.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        className="qa-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question…"
        />

        <button type="submit">
          Ask
        </button>
      </form>
    </div>
  );
}