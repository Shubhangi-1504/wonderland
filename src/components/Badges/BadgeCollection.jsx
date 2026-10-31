import { useState } from 'react';
import { Trophy, X, Award } from 'lucide-react';
import { BADGES_DATA } from '../../data/badges';
import BadgeCard from './BadgeCard';
import { soundFX } from '../../utils/audio';

export default function BadgeCollection({
  unlockedBadges = [],
  badgeUnlockDates = {},
  onClose,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'

  const totalBadges = BADGES_DATA.length;
  const unlockedCount = unlockedBadges.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = BADGES_DATA.filter((badge) => {
    const isUnlocked = unlockedBadges.includes(badge.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl glass-panel-glow border border-slate-700/80 shadow-2xl shadow-sky-950/50 overflow-hidden bg-slate-900/95 animate-spring-pop">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading text-white">
                Investor Badges & Achievements
              </h2>
              <p className="text-xs text-slate-400">
                Unlock badges across Stock Market City by exploring, learning, and scoring high on quizzes.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Badges"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 font-mono-numbers">
              {unlockedCount} of {totalBadges} Badges Unlocked
            </span>
            <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono-numbers">
              {progressPercent}%
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => {
                soundFX.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All ({totalBadges})
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setFilter('unlocked');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === 'unlocked'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setFilter('locked');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === 'locked'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Locked ({totalBadges - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              const unlockedDate = badgeUnlockDates[badge.id];
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={isUnlocked}
                  unlockedDate={unlockedDate}
                />
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No badges found matching this filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Badges grant instant bonus XP to speed up your player level progression.</span>
          </span>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
