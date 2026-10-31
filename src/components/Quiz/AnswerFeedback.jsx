import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

export default function AnswerFeedback({ isCorrect, explanation }) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        isCorrect
          ? 'bg-emerald-950/40 border-emerald-400/50 text-emerald-200'
          : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5 font-heading font-extrabold text-sm sm:text-base">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300">Correct! Excellent Analysis</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-rose-300">Not Quite Right</span>
          </>
        )}
      </div>

      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed mt-2 pl-0.5">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="flex-1">{explanation}</p>
      </div>
    </div>
  );
}
