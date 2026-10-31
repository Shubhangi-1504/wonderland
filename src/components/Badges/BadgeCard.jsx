import {
  Footprints,
  HelpCircle,
  Crown,
  GraduationCap,
  Compass,
  Lock,
  CheckCircle2,
  Sparkles,
  Trophy,
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

export default function BadgeCard({ badge, isUnlocked, unlockedDate }) {
  const IconComponent = ICON_MAP[badge.iconName] || Trophy;

  const formattedDate = unlockedDate
    ? new Date(unlockedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      onMouseEnter={() => {
        if (isUnlocked) soundFX.playHover();
      }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group btn-tactile ${
        isUnlocked
          ? 'glass-panel-glow hover:-translate-y-1 hover:shadow-xl shadow-sky-950/40 shimmer-wrapper'
          : 'bg-slate-900/60 border-slate-800/80 opacity-75 grayscale-[40%]'
      }`}
      style={{
        borderColor: isUnlocked ? badge.borderGlow : undefined,
      }}
    >
      {/* Top row: Rarity & Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
          style={{
            color: isUnlocked ? badge.color : '#94a3b8',
            backgroundColor: isUnlocked ? badge.accentBg : 'rgba(148, 163, 184, 0.1)',
            borderColor: isUnlocked ? badge.borderGlow : 'rgba(148, 163, 184, 0.2)',
          }}
        >
          {badge.rarity}
        </span>

        {isUnlocked ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Unlocked</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            <span>Locked</span>
          </span>
        )}
      </div>

      {/* Middle: Icon & Badge Title */}
      <div className="flex items-start gap-3.5 my-1">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 ${
            isUnlocked
              ? 'shadow-lg'
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}
          style={{
            backgroundColor: isUnlocked ? badge.accentBg : undefined,
            borderColor: isUnlocked ? badge.borderGlow : undefined,
            color: isUnlocked ? badge.color : undefined,
          }}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black font-heading text-white truncate">
            {badge.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Bottom: Unlock Condition & Reward XP */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="text-slate-400 flex items-center gap-1 truncate max-w-[65%]">
          <span className="text-slate-500">Goal:</span>
          <span className="truncate">{badge.unlockCondition}</span>
        </div>

        <div className="flex items-center gap-1 text-amber-300 font-bold shrink-0 font-mono-numbers">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>+{badge.rewardXp} XP</span>
        </div>
      </div>

      {/* Unlocked date badge watermark if unlocked */}
      {isUnlocked && formattedDate && (
        <div className="text-[10px] text-slate-500 text-right mt-1">
          Unlocked {formattedDate}
        </div>
      )}
    </div>
  );
}
