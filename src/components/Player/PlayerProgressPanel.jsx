import { useState } from 'react';
import {
  User,
  Award,
  TrendingUp,
  Briefcase,
  Crown,
  X,
  Zap,
  CheckCircle2,
  Building2,
  HelpCircle,
  RotateCcw,
  Trophy,
  ShieldAlert,
} from 'lucide-react';
import { LEVEL_TIERS, clearPlayerProgress } from '../../utils/progressStorage';
import { soundFX } from '../../utils/audio';

const LEVEL_ICONS = {
  User,
  Award,
  TrendingUp,
  Briefcase,
  Crown,
};

export default function PlayerProgressPanel({
  progress,
  levelInfo,
  onClose,
  onOpenBadges,
  onResetProgress,
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const CurrentIcon = LEVEL_ICONS[levelInfo.icon] || Award;
  const quizzesCount = Object.keys(progress.completedQuizzes || {}).length;
  const missionsCount = progress.completedMissions?.length || 0;
  const badgesCount = progress.unlockedBadges?.length || 0;
  const buildingsCount = progress.visitedBuildings?.length || 0;

  // Calculate average quiz percentage if any quizzes completed
  const quizScores = Object.values(progress.completedQuizzes || {});
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(
          quizScores.reduce((acc, q) => acc + (q.percentage || 0), 0) /
            quizScores.length
        )
      : null;

  const handleReset = () => {
    soundFX.playClick();
    clearPlayerProgress();
    if (onResetProgress) {
      onResetProgress();
    }
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl glass-panel-glow border border-slate-700/80 shadow-2xl shadow-sky-950/50 overflow-hidden bg-slate-900/95 animate-spring-pop">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading text-white">
                Player Profile & Progress
              </h2>
              <p className="text-xs text-slate-400">
                Track your financial literacy journey, XP tiers, and unlocks.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Level & XP Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-sky-950/40 to-slate-900/90 border border-sky-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 shrink-0">
                <CurrentIcon className="w-9 h-9" />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1 font-mono-numbers">
                      Level {levelInfo.level}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
                      {levelInfo.title}
                    </h3>
                  </div>

                  <div className="text-center sm:text-right font-mono-numbers">
                    <div className="text-xs text-slate-400">Total Experience</div>
                    <div className="text-2xl font-black text-amber-300">
                      {progress.totalXP} <span className="text-sm font-semibold text-amber-400/80">XP</span>
                    </div>
                  </div>
                </div>

                {/* Progress to Next Level Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-numbers text-slate-300">
                    <span>
                      {levelInfo.nextTierMinXp ? (
                        <>
                          <strong className="text-white">{progress.totalXP - levelInfo.minXp}</strong> /{' '}
                          {levelInfo.nextTierMinXp - levelInfo.minXp} XP to Level {levelInfo.level + 1}
                        </>
                      ) : (
                        <span className="text-amber-300 font-bold">Max Level Reached!</span>
                      )}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {levelInfo.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/80">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-numbers">
            <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 text-center">
              <div className="flex justify-center text-sky-400 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">{missionsCount}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                Missions Done
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 text-center">
              <div className="flex justify-center text-emerald-400 mb-1">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">
                {quizzesCount}
                {avgQuizScore !== null && (
                  <span className="text-xs text-emerald-400 font-bold ml-1">
                    ({avgQuizScore}%)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                Quizzes Taken
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 text-center">
              <div className="flex justify-center text-amber-400 mb-1">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">{badgesCount}/5</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                Badges Won
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel border border-slate-700/80 text-center">
              <div className="flex justify-center text-indigo-400 mb-1">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white">{buildingsCount}/3</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                Sites Visited
              </div>
            </div>
          </div>

          {/* All Level Tiers Progression Map */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Investor Level RoadMap</span>
            </div>

            <div className="space-y-2">
              {LEVEL_TIERS.map((tier) => {
                const isCurrent = tier.level === levelInfo.level;
                const isUnlocked = progress.totalXP >= tier.minXp;
                return (
                  <div
                    key={tier.level}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-400/50 text-white font-bold'
                        : isUnlocked
                        ? 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono-numbers font-black ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950'
                            : isUnlocked
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {tier.level}
                      </span>
                      <span>{tier.title}</span>
                    </div>

                    <div className="font-mono-numbers text-[11px] text-slate-400">
                      {tier.maxXp === Infinity ? '700+ XP' : `${tier.minXp}–${tier.maxXp} XP`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Row: View Badges & Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
                if (onOpenBadges) onOpenBadges();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>View Badge Collection</span>
            </button>

            {/* Reset progress toggle */}
            {!showConfirmReset ? (
              <button
                onClick={() => {
                  soundFX.playClick();
                  setShowConfirmReset(true);
                }}
                className="text-xs text-rose-400/80 hover:text-rose-300 transition-colors flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-rose-500/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Test Progress</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 p-2 rounded-xl text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-200">Reset all XP and badges?</span>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px]"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
