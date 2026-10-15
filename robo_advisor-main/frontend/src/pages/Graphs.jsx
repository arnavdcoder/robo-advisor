import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import "./Graphs.css";

export default function Graphs() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div className="graphs-page empty">
        <p>No ticker loaded yet.</p>
        <button className="cta" onClick={() => navigate("/ticker")}>Analyze a ticker →</button>
      </div>
    );
  }

  const isUp = result.prediction === "UP";

  return (
    <div className="graphs-page">
      <div className="graphs-header">
        <h1>{result.ticker} — 30 day history</h1>
        <span className={`badge ${isUp ? "up" : "down"}`}>{isUp ? "▲ UP" : "▼ DOWN"}</span>
      </div>

      <div className="chart-card">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={result.history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e8b44c" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#e8b44c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2c313c" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8a8f98", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickFormatter={(d) => d.slice(5)}
              minTickGap={30}
              axisLine={{ stroke: "#2c313c" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8a8f98", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{ background: "#1c2027", border: "1px solid #2c313c", borderRadius: 6 }}
              labelStyle={{ color: "#8a8f98", fontFamily: "IBM Plex Mono", fontSize: 12 }}
              itemStyle={{ color: "#e9e7e1", fontFamily: "IBM Plex Mono" }}
            />
            <Area type="monotone" dataKey="close" stroke="#e8b44c" strokeWidth={2} fill="url(#fillGold)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="indicators-strip">
        {Object.entries(result.indicators).map(([key, val]) => (
          <div className="mini-indicator" key={key}>
            <span>{key.replace(/_/g, " ")}</span>
            <strong>{val}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
