import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function XPRewardAnimation({ amount = 50, source = 'Reward Earned', onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/95 border border-amber-400/50 shadow-2xl shadow-amber-500/20 backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        <span className="text-sm font-black text-amber-300 font-mono-numbers">
          +{amount} XP
        </span>
        <span className="text-xs text-slate-300 font-medium border-l border-slate-700 pl-2.5">
          {source}
        </span>
        <button
          onClick={() => {
            soundFX.playClick();
            onDismiss();
          }}
          className="ml-1 text-slate-500 hover:text-white p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
