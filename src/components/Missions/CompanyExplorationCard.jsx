import { TrendingUp, Zap, ShoppingBag, ShieldAlert } from 'lucide-react';
import { VIRTUAL_COMPANIES } from '../../data/buildings';

export default function CompanyExplorationCard() {
  const getIcon = (name) => {
    if (name === 'TechNova') return <TrendingUp className="w-5 h-5 text-sky-400" />;
    if (name === 'GreenEnergy') return <Zap className="w-5 h-5 text-emerald-400" />;
    return <ShoppingBag className="w-5 h-5 text-orange-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Virtual Company Directory • Stock Market City
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VIRTUAL_COMPANIES.map((comp) => (
          <div
            key={comp.name}
            className="p-4 rounded-2xl glass-panel border border-slate-700/80 hover:border-slate-500 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  {getIcon(comp.name)}
                </div>
                <span className="text-xs font-extrabold font-mono-numbers px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-700">
                  {comp.sharePrice}
                </span>
              </div>
              <h5 className="text-sm font-bold text-white font-heading">{comp.name}</h5>
              <div className="text-[11px] font-semibold text-slate-400 mb-2">{comp.industry}</div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {comp.description}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono-numbers">
              Ticker: {comp.ticker} • Simulation Asset
            </div>
          </div>
        ))}
      </div>

      {/* Educational Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Educational Notice:</strong> TechNova, GreenEnergy, and FoodSphere are educational fictional companies created for InvestQuest game simulations, not real-world investment opportunities or financial advice.
        </span>
      </div>
    </div>
  );
}
