import { useEffect } from 'react';
import {
  Footprints,
  HelpCircle,
  Crown,
  GraduationCap,
  Compass,
  Trophy,
  Sparkles,
  X,
} from 'lucide-react';
import { soundFX } from '../../utils/audio';

const ICON_MAP = {
  Footprints,
  HelpCircle,
  Crown,
  GraduationCap,
  Compass,
  Trophy,
};

export default function BadgeUnlockNotification({ badge, bonusXp = 0, onDismiss }) {
  useEffect(() => {
    soundFX.playSuccess();
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!badge) return null;

  const IconComponent = ICON_MAP[badge.iconName] || Trophy;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className="relative p-4 rounded-3xl glass-panel-glow border shadow-2xl flex items-start gap-3.5 bg-slate-900/95"
        style={{
          borderColor: badge.borderGlow || '#38bdf8',
          boxShadow: `0 10px 30px -10px ${badge.borderGlow || 'rgba(56, 189, 248, 0.4)'}`,
        }}
      >
        {/* Animated Badge Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border animate-bounce shadow-lg"
          style={{
            backgroundColor: badge.accentBg || 'rgba(56, 189, 248, 0.2)',
            borderColor: badge.borderGlow || '#38bdf8',
            color: badge.color || '#38bdf8',
          }}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
            <Sparkles className="w-3 h-3" />
            <span>Badge Unlocked!</span>
          </div>

          <h4 className="text-sm font-black font-heading text-white truncate mt-0.5">
            {badge.title}
          </h4>

          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-snug">
            {badge.description}
          </p>

          {bonusXp > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 font-mono-numbers bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
              <span>+{bonusXp} XP Bonus</span>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onDismiss();
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
