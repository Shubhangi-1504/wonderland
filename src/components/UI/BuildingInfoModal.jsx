import { X, TrendingUp, Zap, ShoppingBag, Award, ShieldCheck } from 'lucide-react';
import { COMPANIES } from '../../data/companies';
import { soundFX } from '../../utils/audio';

export default function BuildingInfoModal({ buildingId, onClose }) {
  if (!buildingId || !COMPANIES[buildingId]) return null;
  const company = COMPANIES[buildingId];

  const getSectorIcon = () => {
    if (buildingId === 'technova') return <TrendingUp className="w-5 h-5 text-sky-400" />;
    if (buildingId === 'greenenergy') return <Zap className="w-5 h-5 text-emerald-400" />;
    return <ShoppingBag className="w-5 h-5 text-orange-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl glass-panel-glow p-6 sm:p-7 shadow-2xl border border-slate-700/80 text-white animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: `0 0 40px ${company.glowColor}, 0 20px 40px rgba(0, 0, 0, 0.7)`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-9 h-9 rounded-full glass-panel border border-slate-700 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Sector badge & Company Name */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            {getSectorIcon()}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {company.sector}
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
              {company.name}
            </h2>
          </div>
        </div>

        {/* Stock Price & Change Strip */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono-numbers">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Stock Ticker</div>
            <div className="text-sm font-extrabold text-sky-300">{company.ticker}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Live Quote</div>
            <div className="text-base font-extrabold text-white">{company.price}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Today's Move</div>
            <div className="text-sm font-extrabold text-emerald-400">▲ {company.change}</div>
          </div>
        </div>

        {/* Company Overview Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          {company.description}
        </p>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[10px] text-slate-400">Market Cap</div>
            <div className="text-xs font-bold text-white mt-0.5">{company.marketCap}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[10px] text-slate-400">P/E Ratio</div>
            <div className="text-xs font-bold text-white mt-0.5">{company.peRatio}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[10px] text-slate-400">Dividend Yield</div>
            <div className="text-xs font-bold text-white mt-0.5">{company.dividendYield}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[10px] text-slate-400">CEO</div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">{company.ceo}</div>
          </div>
        </div>

        {/* Phase 2 Mission Teaser Banner */}
        <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-950/40 relative overflow-hidden mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              {company.mission.title}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Reward: {company.mission.reward}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            {company.mission.summary}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Interactive Landmark • Phase 1 Verified</span>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition-colors shadow-lg shadow-sky-500/30"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
