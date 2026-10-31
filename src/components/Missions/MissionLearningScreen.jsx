import { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Award,
  Trophy,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import LearningSection from './LearningSection';
import CompanyExplorationCard from './CompanyExplorationCard';
import { soundFX } from '../../utils/audio';

const SECTIONS = [
  {
    index: 0,
    title: 'SECTION 1 — WHAT IS A COMPANY?',
    subtitle: 'Understanding the fundamentals of business organizations',
  },
  {
    index: 1,
    title: 'SECTION 2 — WHAT IS A SHARE?',
    subtitle: 'Units of ownership and the role of shareholders',
  },
  {
    index: 2,
    title: 'SECTION 3 — WHY DO COMPANIES ISSUE SHARES?',
    subtitle: 'Raising capital to fund ambitious expansion',
  },
];

export default function MissionLearningScreen({
  mission,
  onComplete,
  onExit,
  onStartQuiz,
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSections = SECTIONS.length;
  const progressPercent = ((currentSection + 1) / totalSections) * 100;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      soundFX.playClick();
      setCurrentSection((prev) => prev + 1);
    } else {
      // Finished all 3 sections!
      soundFX.playSuccess();
      setIsCompleted(true);
      if (onComplete) onComplete(mission);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      soundFX.playClick();
      setCurrentSection((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel-glow p-5 sm:p-8 shadow-2xl border border-sky-400/40 text-white max-h-[94vh] flex flex-col justify-between overflow-hidden animate-spring-pop">
        {/* ======================================================== */}
        {/* HEADER                                                   */}
        {/* ======================================================== */}
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                  {mission?.code || 'MISSION 01'} • INVESTQUEST ACADEMY
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white font-heading">
                  {mission?.title || 'Become a Shareholder'}
                </h3>
              </div>
            </div>

            {/* Exit Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onExit();
              }}
              className="w-8 h-8 rounded-full glass-panel border border-slate-700 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Step Indicators & Progress Bar */}
          {!isCompleted && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-mono-numbers text-slate-400 mb-1.5">
                <span className="text-sky-300 font-bold">
                  Step {currentSection + 1} of {totalSections}
                </span>
                <span>{SECTIONS[currentSection].title}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-300 rounded-full transition-all duration-300 ease-out shadow-sm shadow-sky-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY                                                */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          {!isCompleted ? (
            <div className="space-y-4">
              <div className="mb-2">
                <h4 className="text-lg sm:text-xl font-extrabold text-white font-heading tracking-wide">
                  {SECTIONS[currentSection].title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  {SECTIONS[currentSection].subtitle}
                </p>
              </div>

              {/* Learning Section Component */}
              <LearningSection sectionIndex={currentSection} />
            </div>
          ) : (
            /* ==================================================== */
            /* MISSION COMPLETED CELEBRATION SCREEN                */
            /* ==================================================== */
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-2">
              <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-2xl shadow-amber-500/30 animate-bounce">
                <Trophy className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1 block">
                  Mission Accomplished
                </span>
                <h3 className="text-2xl sm:text-4xl font-black font-heading text-white">
                  Congratulations, Shareholder!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  You now understand what companies are, how shares represent genuine ownership, and why markets exist to help businesses grow.
                </p>
              </div>

              {/* XP Award Pill */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass-panel-glow border border-amber-400/50 shadow-xl">
                <Award className="w-6 h-6 text-amber-400 animate-pulse" />
                <div className="text-left font-mono-numbers">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Mission Reward</div>
                  <div className="text-lg font-black text-amber-300">+50 XP Earned</div>
                </div>
              </div>

              {/* Virtual Company Directory (Section 6 Requirement) */}
              <div className="pt-4 border-t border-slate-800 text-left">
                <CompanyExplorationCard />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER ACTIONS                                           */}
        {/* ======================================================== */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {!isCompleted ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentSection === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  currentSection === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-600'
                    : 'glass-panel border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase text-slate-950 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/30 active:translate-y-0 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                }}
              >
                <span>{currentSection === totalSections - 1 ? 'Finish Learning' : 'Next Section'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onExit();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl glass-panel border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all"
              >
                Return to City
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  if (onStartQuiz) {
                    onStartQuiz(mission?.id || 'technova-m1');
                  }
                }}
                className="w-full sm:flex-1 py-3 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase text-slate-950 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 active:translate-y-0 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                }}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take Mission Quiz (+50 XP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
