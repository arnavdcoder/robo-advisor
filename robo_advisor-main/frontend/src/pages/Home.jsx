import { useNavigate } from "react-router-dom";
import "./Home.css";

const TEAM = [
  { role: "Team Lead / Architect", focus: "System design, AI-replacement prompting logic, architecture" },
  { role: "Developer", focus: "React frontend, Flask API, yfinance integration" },
  { role: "Scrum Master", focus: "Standups, task board, requirements, presentation" },
  { role: "Business Analyst", focus: "Risk profiling, test plans, financial domain research" },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-eyebrow">JPMC SUMMER INTERNSHIP · GROUP 1</div>
        <h1>
          Type a ticker.<br />
          <span className="accent">Get a call.</span>
        </h1>
        <p className="hero-sub">
          A robo-advisor built from scratch — yfinance pulls the price history,
          our own technical-analysis engine calls UP or DOWN, and we track
          how often we're actually right.
        </p>
        <button className="cta" onClick={() => navigate("/ticker")}>
          Get Started →
        </button>
      </section>

      <section className="how">
        <h2>How it works</h2>
        <div className="how-grid">
          <div className="how-step">
            <span className="step-num">01</span>
            <h3>Pull data</h3>
            <p>yfinance fetches 30 days of daily price history for any ticker.</p>
          </div>
          <div className="how-step">
            <span className="step-num">02</span>
            <h3>Run the model</h3>
            <p>Moving-average crossover, 5-day momentum, and RSI feed a scoring engine.</p>
          </div>
          <div className="how-step">
            <span className="step-num">03</span>
            <h3>Get a call</h3>
            <p>UP or DOWN, with plain-English reasoning and a confidence score.</p>
          </div>
          <div className="how-step">
            <span className="step-num">04</span>
            <h3>Track accuracy</h3>
            <p>Every call is logged and checked against what actually happened next.</p>
          </div>
        </div>
      </section>

      <section className="team">
        <h2>Team</h2>
        <div className="team-grid">
          {TEAM.map((m) => (
            <div className="team-card" key={m.role}>
              <h4>{m.role}</h4>
              <p>{m.focus}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
