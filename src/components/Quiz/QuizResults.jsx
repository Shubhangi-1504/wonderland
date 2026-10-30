import { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function QuizResults({
  quiz,
  score,
  totalQuestions,
  answers,
  onContinue,
  onRetry,
}) {
  const [showReview, setShowReview] = useState(false);

  const percentage = Math.round((score / totalQuestions) * 100);

  // XP breakdown calculations
  const baseCompletionXp = 50;
  const highScoreBonus = percentage >= 80 ? 25 : 0;
  const perfectBonus = percentage === 100 ? 25 : 0;
  const totalXpEarned = baseCompletionXp + highScoreBonus + perfectBonus;

  const getPerformanceMessage = () => {
    if (percentage === 100) {
      return {
        title: 'Flawless Investor!',
        subtitle: 'You mastered every single question! Your financial literacy is extraordinary.',
        color: 'text-amber-300',
      };
    }
    if (percentage >= 80) {
      return {
        title: 'Outstanding Performance!',
        subtitle: 'You have a solid, practical understanding of companies and share ownership.',
        color: 'text-emerald-300',
      };
    }
    if (percentage >= 60) {
      return {
        title: 'Good Effort!',
        subtitle: 'You passed the quiz! A quick review of the explanations will make you unbeatable.',
        color: 'text-sky-300',
      };
    }
    return {
      title: 'Learning in Progress',
      subtitle: 'Investing takes practice! Review the answer explanations and try again to unlock full XP.',
      color: 'text-orange-300',
    };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-2">
      {/* Trophy / Emblem */}
      <div className="inline-flex p-4 sm:p-5 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-2xl shadow-amber-500/30 animate-bounce">
        <Trophy className="w-12 h-12" />
      </div>

      {/* Title & Performance Message */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
          Quiz Results
        </div>
        <h3 className={`text-2xl sm:text-4xl font-black font-heading ${performance.color}`}>
          {performance.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
          {performance.subtitle}
        </p>
      </div>

      {/* Score Grid Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-lg mx-auto font-mono-numbers">
        <div className="p-3.5 rounded-2xl glass-panel border border-slate-700">
          <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
            {score}/{totalQuestions}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel border border-slate-700">
          <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
            {percentage}%
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-panel-glow border border-amber-400/50">
          <div className="text-[10px] uppercase font-bold text-amber-300">XP Earned</div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
            +{totalXpEarned}
          </div>
        </div>
      </div>

      {/* XP Breakdown Pill */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto text-left text-xs text-slate-300">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Reward Breakdown</span>
        </div>
        <div className="space-y-1.5 font-mono-numbers">
          <div className="flex justify-between">
            <span className="text-slate-400">Quiz Completion:</span>
            <span className="text-white font-bold">+{baseCompletionXp} XP</span>
          </div>
          {highScoreBonus > 0 && (
            <div className="flex justify-between text-emerald-300 font-semibold">
              <span>High Score Bonus (≥ 80%):</span>
              <span>+{highScoreBonus} XP</span>
            </div>
          )}
          {perfectBonus > 0 && (
            <div className="flex justify-between text-amber-300 font-bold">
              <span>Perfect 100% Mastery Bonus:</span>
              <span>+{perfectBonus} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Answers Toggle Button */}
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => {
            soundFX.playClick();
            setShowReview(!showReview);
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors py-2 px-3 rounded-xl hover:bg-slate-900/60"
        >
          <span>{showReview ? 'Hide Answers Review' : 'Review Answers & Explanations'}</span>
          {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Detailed Review List */}
        {showReview && (
          <div className="mt-4 space-y-3 text-left animate-in fade-in duration-200">
            {quiz.questions.map((q, idx) => {
              const answerRec = answers.find((a) => a.questionId === q.id);
              const isCorrect = answerRec?.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border ${
                    isCorrect
                      ? 'bg-slate-900/80 border-emerald-500/40'
                      : 'bg-slate-900/80 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white font-heading">
                      Q{idx + 1}. {q.question}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 mb-1">
                    <strong className="text-emerald-400">Correct Answer:</strong>{' '}
                    {q.options[q.correctIndex]}
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Continue Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-lg mx-auto">
        {percentage < 100 && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl glass-panel border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Quiz</span>
          </button>
        )}

        <button
          onClick={onContinue}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase text-slate-950 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 active:translate-y-0 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
          }}
        >
          <span>Continue to City</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
