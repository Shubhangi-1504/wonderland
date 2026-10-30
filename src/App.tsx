import { Link, Route, Routes } from "react-router-dom";
import { IntroPage } from "./scene/IntroPage";
import { WorldPage } from "./world/WorldPage";
import { PortfolioPage } from "./portfolio/PortfolioPage";

/** Minimal temporary nav so everyone can move between areas while building. */
function NavBar() {
  const link = "rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-purple/20 hover:text-white";
  return (
    <nav className="flex items-center gap-2 border-b border-white/10 bg-midnight px-4 py-2">
      <span className="mr-4 font-bold tracking-widest text-gold">MONEYVERSE</span>
      <Link className={link} to="/">
        Intro
      </Link>
      <Link className={link} to="/world">
        World
      </Link>
      <Link className={link} to="/portfolio">
        Portfolio
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <NavBar />
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Routes>
    </div>
  );
}
