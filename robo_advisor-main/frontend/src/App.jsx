import { HashRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import TickerInput from "./pages/TickerInput";
import Output from "./pages/Output";
import Graphs from "./pages/Graphs";
import RiskProfile from "./pages/RiskProfile";
import Compare from "./pages/Compare";
import Watchlist from "./pages/Watchlist";

export default function App() {
  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ticker" element={<TickerInput />} />
        <Route path="/output" element={<Output />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/profile" element={<RiskProfile />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </HashRouter>
  );
}
