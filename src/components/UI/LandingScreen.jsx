import { useState, useCallback } from 'react';
import { TrendingUp, Sparkles, ShieldCheck, Zap, Compass, ArrowRight, Award } from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function LandingScreen({ onEnterCity }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    const x = Math.round((e.clientX / window.innerWidth) * 100);
    const y = Math.round((e.clientY / window.innerHeight) * 100);
    setMousePos({ x, y });
  }, []);

  const handleEnter = () => {
    soundFX.playSuccess();
    onEnterCity();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none"
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(56, 189, 248, 0.12), transparent 70%)`,
        }}
      />

      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Cyber Grid Lines Effect */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating Ambient Live Ticker Chips in Background */}
      <div className="hidden lg:block absolute top-16 left-16 glass-panel px-3.5 py-1.5 rounded-full border border-sky-400/25 text-xs text-sky-300 font-mono-numbers shadow-lg shadow-sky-500/10 animate-float-slow">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-live-dot mr-2" />
        <span>TECHNOVA ▲ ₹245.80 (+18.4%)</span>
      </div>

      <div className="hidden lg:block absolute bottom-20 left-20 glass-panel px-3.5 py-1.5 rounded-full border border-emerald-400/25 text-xs text-emerald-300 font-mono-numbers shadow-lg shadow-emerald-500/10 animate-float-slow" style={{ animationDelay: '-1.5s' }}>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-live-dot mr-2" />
        <span>GREENENERGY ▲ ₹112.50 (+24.2%)</span>
      </div>

      <div className="hidden lg:block absolute top-20 right-20 glass-panel px-3.5 py-1.5 rounded-full border border-amber-400/25 text-xs text-amber-300 font-mono-numbers shadow-lg shadow-amber-500/10 animate-float-slow" style={{ animationDelay: '-3s' }}>
        <Award className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
        <span>5 UNLOCKABLE BADGES • 500 XP TIERS</span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-8 shadow-lg shadow-sky-500/10 animate-float-slow">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Interactive 3D Financial Literacy Game • Hackathon Edition</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight font-heading mb-4 leading-none">
          <span className="text-white drop-shadow-md">INVEST</span>
          <span className="text-gradient-cyan drop-shadow-lg">QUEST</span>
        </h1>

        {/* Primary Slogan */}
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 tracking-tight font-heading max-w-2xl mb-3">
          "Learn Money. Play Markets. Build Your Future."
        </p>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 font-normal leading-relaxed">
          Your financial learning adventure starts here. Step into an interactive 3D Stock Market City, explore landmark corporate headquarters, and master the markets risk-free.
        </p>

        {/* Landmark Preview Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl mb-10 text-left">
          <div className="p-3.5 rounded-2xl glass-panel border border-sky-500/20 hover:border-sky-400/50 transition-all duration-300 flex items-center gap-3 btn-tactile">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">TechNova Exchange</div>
              <div className="text-[11px] text-slate-400">Animated Market Floor</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 flex items-center gap-3 btn-tactile">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">GreenEnergy HQ</div>
              <div className="text-[11px] text-slate-400">Wind & Solar CleanTech</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel border border-orange-500/20 hover:border-orange-400/50 transition-all duration-300 flex items-center gap-3 btn-tactile">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">FoodSphere HQ</div>
              <div className="text-[11px] text-slate-400">Smart Supply & Logistics</div>
            </div>
          </div>
        </div>

        {/* Enter City Primary Button with Shimmer Reflection */}
        <button
          onClick={handleEnter}
          onMouseEnter={() => soundFX.playHover()}
          className="shimmer-wrapper btn-tactile group relative inline-flex items-center justify-center px-10 py-5 text-base sm:text-lg font-extrabold tracking-wide text-white uppercase rounded-2xl shadow-2xl shadow-sky-500/50"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #2563eb 100%)',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.45), 0 10px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border-2 border-sky-300/60 pointer-events-none group-hover:border-white transition-colors" />
          <span className="flex items-center gap-3 relative z-10">
            <span>ENTER CITY</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </span>
        </button>

        {/* Zero Risk Assurance Banner */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Educational • ₹10,000 Starting Virtual Capital • Zero Financial Risk</span>
        </div>
      </div>
    </div>
  );
}
