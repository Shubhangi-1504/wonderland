import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { ChatLauncher } from "./ai/ChatLauncher";
import { AuthModal } from "./auth/AuthModal";
import { UserBadge } from "./auth/UserBadge";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { IntroPage } from "./scene/IntroPage";
import { WorldPage } from "./world/WorldPage";
import { PortfolioPage } from "./portfolio/PortfolioPage";

/** Minimal temporary nav so everyone can move between areas while building. */
function NavBar() {
  const location = useLocation();
  // Hide top navigation on the cinematic intro route to preserve full-screen immersion
  if (location.pathname === "/") return null;

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
      <UserBadge />
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <NavBar />
      <ErrorBoundary label="MONEYVERSE" fullScreen>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<div className="min-h-screen bg-navy text-white" />}>
                <IntroPage />
              </Suspense>
            }
          />
          <Route path="/world" element={<WorldPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </ErrorBoundary>
      <AuthModal />
      {/* Global AI guide: mounted once so it survives route changes. */}
      <ChatLauncher />
    </div>
  );
}
