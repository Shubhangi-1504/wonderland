import { X, Target, Compass, CheckCircle2, Lock } from 'lucide-react';
import { MISSIONS } from '../../data/missions';
import { soundFX } from '../../utils/audio';

export default function MissionsModal({ onClose, onSelectBuilding }) {
  const handleLocate = (companyId) => {
    soundFX.playBuildingSelect();
    onSelectBuilding(companyId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel-glow p-6 sm:p-8 shadow-2xl border border-slate-700/80 text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 w-9 h-9 rounded-full glass-panel border border-slate-700 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Curriculum Roadmap • Phase 2 Ready
            </div>
            <h2 className="text-2xl font-black font-heading text-white tracking-wide">
              Stock Market City Missions
            </h2>
          </div>
        </div>

        {/* Mission List */}
        <div className="space-y-4">
          {MISSIONS.map((m) => {
            const isLocked = m.status === 'LOCKED';
            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLocked
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/80 border-slate-700 hover:border-sky-400/60 shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {m.level}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {m.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-numbers text-xs">
                    <span className="text-amber-400 font-bold">Reward: {m.reward}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sky-400 font-bold">+{m.xp} XP</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white font-heading mb-1.5 flex items-center gap-2">
                  {m.title}
                  {isLocked && <Lock className="w-4 h-4 text-slate-500" />}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mb-3.5 leading-relaxed">
                  {m.summary}
                </p>

                {/* Objectives Checklist Preview */}
                <div className="space-y-1.5 mb-4 pl-1">
                  {m.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>

                {/* Action button: Fly to landmark */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sector: {m.type}
                  </span>
                  <button
                    onClick={() => handleLocate(m.companyId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-bold transition-all hover:scale-105"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Locate Headquarters in 3D</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
