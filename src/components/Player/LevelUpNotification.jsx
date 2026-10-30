import { useEffect } from 'react';
import { Award, Sparkles, ArrowRight, X } from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function LevelUpNotification({
  oldLevel,
  newLevel,
  newTitle,
  onDismiss,
}) {
  useEffect(() => {
    soundFX.playSuccess();
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-3xl p-6 glass-panel-glow border border-amber-400/50 shadow-2xl shadow-amber-500/30 text-center bg-slate-900/95 animate-in zoom-in-95 duration-300">
        {/* Glow Emblem */}
        <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/50 shadow-xl shadow-amber-500/40 mb-3 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Level Up Achieved!</span>
        </div>

        {/* Level Progression Indicator */}
        <div className="flex items-center justify-center gap-3 my-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 font-mono-numbers text-sm font-bold">
            Level {oldLevel}
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <div className="px-4 py-1.5 rounded-2xl bg-amber-500 text-slate-950 font-mono-numbers text-base font-black shadow-lg shadow-amber-500/40 animate-pulse">
            Level {newLevel}
          </div>
        </div>

        <h3 className="text-xl font-black font-heading text-white">
          {newTitle}
        </h3>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Congratulations! Your expanding market expertise has unlocked new investor status and opportunities across Stock Market City.
        </p>

        <button
          onClick={() => {
            soundFX.playClick();
            onDismiss();
          }}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-opacity"
        >
          Claim & Continue
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            onDismiss();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
