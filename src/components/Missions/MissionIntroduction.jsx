import { Target, Clock, Award, Sparkles, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function MissionIntroduction({ mission, onStartLearning, onBack }) {
  if (!mission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel-glow p-6 sm:p-8 shadow-2xl border border-sky-400/40 text-white max-h-[92vh] overflow-y-auto">
        {/* Top Badges: Code & Difficulty */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black tracking-wider uppercase border border-sky-400/30">
              {mission.code || 'MISSION 01'}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider uppercase border border-emerald-400/30">
              {mission.difficulty || 'Beginner'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-numbers text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{mission.estimatedTime || '3 minutes'}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>+{mission.rewardXp || 100} XP</span>
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-wide text-white uppercase mb-1">
          {mission.title || 'BECOME A SHAREHOLDER'}
        </h2>
        <p className="text-sm sm:text-base text-sky-300 font-medium mb-6">
          {mission.subtitle || 'Your first step into the world of stocks.'}
        </p>

        {/* Story Narration Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 mb-6 shadow-inner relative overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Mission Briefing</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
            "{mission.story || 'Welcome, young investor! Imagine owning a small part of a company. Today, you will discover what shares are and how shareholders become part-owners of businesses.'}"
          </p>
        </div>

        {/* Three Learning Objectives */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Learning Objectives</span>
          </div>
          <div className="space-y-2.5">
            {(mission.learningObjectives || [
              'Understand what a company is.',
              'Understand what a share represents.',
              'Understand why companies issue shares.',
            ]).map((obj, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl glass-panel border border-slate-700/60 flex items-center gap-3 text-xs sm:text-sm text-slate-200"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 font-bold text-xs">
                  {i + 1}
                </div>
                <span className="font-medium">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              soundFX.playClick();
              onBack();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl glass-panel border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Headquarters</span>
          </button>

          <button
            onClick={() => {
              soundFX.playMissionStart();
              onStartLearning();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase text-slate-950 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/40 active:translate-y-0 flex items-center justify-center gap-2.5"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            }}
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
