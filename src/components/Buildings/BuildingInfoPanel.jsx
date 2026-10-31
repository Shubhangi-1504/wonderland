import { X, TrendingUp, Zap, ShoppingBag, ArrowLeft, Target, ShieldCheck } from 'lucide-react';
import MissionCard from './MissionCard';
import { soundFX } from '../../utils/audio';

export default function BuildingInfoPanel({
  building,
  onClose,
  onStartMission,
  onStartQuiz,
  completedMissionIds = [],
  completedQuizzes = {},
}) {
  if (!building) return null;

  const getBuildingIcon = () => {
    if (building.id === 'technova') return <TrendingUp className="w-6 h-6 text-sky-400" />;
    if (building.id === 'greenenergy') return <Zap className="w-6 h-6 text-emerald-400" />;
    return <ShoppingBag className="w-6 h-6 text-orange-400" />;
  };

  const availableCount = building.missions.filter((m) => m.status === 'AVAILABLE').length;

  return (
    <aside
      className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] md:w-[520px] z-50 flex flex-col justify-between glass-panel-glow border-l border-slate-700/80 shadow-2xl p-5 sm:p-7 text-white overflow-hidden pointer-events-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in slide-in-from-right"
      style={{
        background: 'rgba(11, 17, 32, 0.92)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
      }}
    >
      {/* Top Header Controls: Back to City & Close */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="btn-tactile inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel border border-slate-700 hover:border-sky-400/60 text-xs font-bold text-slate-300 hover:text-white group shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to City</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="btn-tactile w-8 h-8 rounded-full glass-panel border border-slate-700 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer shadow-md"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6">
        {/* Building Identity & Sector */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
              {getBuildingIcon()}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 font-mono-numbers">
                {building.ticker} • {building.sector}
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
                {building.name}
              </h2>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
            {building.description}
          </div>
        </div>

        {/* Fictional Valuation & Stats Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono-numbers">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Share Price</div>
            <div className="text-base font-black text-white">{building.price}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Today's Move</div>
            <div className="text-xs font-bold text-emerald-400">▲ {building.change}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Missions</div>
            <div className="text-xs font-bold text-sky-300">
              {availableCount} Active / {building.missions.length} Total
            </div>
          </div>
        </div>

        {/* Learning Missions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-sky-400" />
              <span>Available Missions</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
              {availableCount} Available
            </span>
          </div>

          <div className="space-y-3.5">
            {building.missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStartMission={onStartMission}
                onStartQuiz={onStartQuiz}
                isCompleted={completedMissionIds.includes(mission.id)}
                quizResult={completedQuizzes[mission.id]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Educational Simulation</span>
        </div>
        <span className="text-slate-500">InvestQuest Academy • Interactive Missions</span>
      </div>
    </aside>
  );
}
