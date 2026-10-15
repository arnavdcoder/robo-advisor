import { NavLink } from "react-router-dom";
import "./NavBar.css";

const TAPE_ITEMS = [
  { t: "AAPL", v: "+1.2%" }, { t: "TSLA", v: "-0.8%" }, { t: "MSFT", v: "+0.4%" },
  { t: "NVDA", v: "+2.1%" }, { t: "AMZN", v: "-0.3%" }, { t: "GOOGL", v: "+0.9%" },
];

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="ticker-tape">
        <div className="ticker-track">
          {[...TAPE_ITEMS, ...TAPE_ITEMS, ...TAPE_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-symbol">{item.t}</span>
              <span className={item.v.startsWith("+") ? "ticker-up" : "ticker-down"}>{item.v}</span>
            </span>
          ))}
        </div>
      </div>
      <nav className="nav-links">
        <span className="brand">GROUP1 <span className="brand-accent">ROBO</span></span>
        <div className="links">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? "active" : ""}>Risk Profile</NavLink>
          <NavLink to="/ticker" className={({isActive}) => isActive ? "active" : ""}>Predict</NavLink>
          <NavLink to="/compare" className={({isActive}) => isActive ? "active" : ""}>Compare</NavLink>
          <NavLink to="/graphs" className={({isActive}) => isActive ? "active" : ""}>Graphs</NavLink>
          <NavLink to="/watchlist" className={({isActive}) => isActive ? "active" : ""}>Watchlist</NavLink>
        </div>
      </nav>
    </header>
  );
}
