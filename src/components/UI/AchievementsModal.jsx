import { Award, Trophy, Sparkles, X } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/missions';
import { soundFX } from '../../utils/audio';

export default function AchievementsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-glow p-6 sm:p-7 shadow-2xl border border-slate-700/80 text-white">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 w-9 h-9 rounded-full glass-panel border border-slate-700 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Trader Milestones
            </div>
            <h2 className="text-2xl font-black font-heading text-white tracking-wide">
              Achievements
            </h2>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/30'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  ach.unlocked
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-heading">
                    {ach.title}
                  </h4>
                  <span className="text-xs font-mono-numbers text-amber-400 font-bold">
                    {ach.progress}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-snug">
                  {ach.description}
                </p>
                <div className="mt-2 text-[11px] font-semibold text-sky-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{ach.reward}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
