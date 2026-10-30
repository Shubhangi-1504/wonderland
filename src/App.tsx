import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";
import { UserBadge } from "./auth/UserBadge";
import { IntroPage } from "./scene/IntroPage";
import { WorldPage } from "./world/WorldPage";
import { PortfolioPage } from "./portfolio/PortfolioPage";

/** Minimal temporary nav so everyone can move between areas while building. */
function NavBar() {
  const location = useLocation();
  // Hide top navigation on the cinematic intro route to preserve full-screen immersion
  if (location.pathname === "/") return null;

  const link = "rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-purple/20 hover:text-white transition-colors";
  const activeLink = "rounded-md px-3 py-1.5 text-sm font-semibold text-cyan bg-purple/30 border border-cyan/40 transition-colors";

  return (
    <nav className="flex items-center gap-2 border-b border-white/10 bg-midnight/90 backdrop-blur-md px-4 py-2 sticky top-0 z-50">
      <span className="mr-4 font-bold tracking-widest text-gold">MONEYVERSE</span>
      <Link className={location.pathname === "/" ? activeLink : link} to="/">
        Intro
      </Link>
      <Link className={location.pathname === "/world" ? activeLink : link} to="/world">
        🏙️ World (Stock Market City)
      </Link>
      <Link className={location.pathname === "/portfolio" ? activeLink : link} to="/portfolio">
        Portfolio
      </Link>
      <UserBadge />
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
      <AuthModal />
    </div>
  );
}
