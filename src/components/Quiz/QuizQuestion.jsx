import { CheckCircle2, XCircle } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizQuestion({
  question,
  selectedOption,
  isSubmitted,
  onSelectOption,
}) {
  if (!question) return null;

  return (
    <div className="space-y-4">
      {/* Topic Pill */}
      {question.topic && (
        <div className="inline-block px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px] font-bold tracking-wider uppercase">
          {question.topic}
        </div>
      )}

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-black font-heading text-white leading-snug">
        {question.question}
      </h3>

      {/* 4 Options Grid */}
      <div className="space-y-2.5 pt-2">
        {question.options.map((optText, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = isSubmitted && index === question.correctIndex;
          const isWrong = isSubmitted && isSelected && !isCorrect;

          let cardStyle = 'glass-panel border-slate-700/80 hover:border-sky-400/50 hover:bg-slate-900/80 text-slate-200';
          let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

          if (isSelected && !isSubmitted) {
            cardStyle = 'glass-panel-glow border-sky-400 bg-sky-950/50 text-white shadow-lg shadow-sky-500/20 scale-[1.01]';
            badgeStyle = 'bg-sky-500 text-slate-950 font-black border-sky-400';
          } else if (isCorrect) {
            cardStyle = 'bg-emerald-950/60 border-emerald-400 text-emerald-100 shadow-lg shadow-emerald-500/20';
            badgeStyle = 'bg-emerald-500 text-slate-950 font-black border-emerald-400';
          } else if (isWrong) {
            cardStyle = 'bg-rose-950/60 border-rose-500 text-rose-100 shadow-lg shadow-rose-500/20';
            badgeStyle = 'bg-rose-500 text-white font-black border-rose-400';
          } else if (isSubmitted) {
            cardStyle = 'glass-panel border-slate-800/80 opacity-50 text-slate-400';
          }

          return (
            <button
              key={index}
              disabled={isSubmitted}
              onClick={() => onSelectOption(index)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3.5 transition-all duration-200 ${cardStyle} ${
                !isSubmitted ? 'btn-tactile cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs border font-mono-numbers shrink-0 ${badgeStyle}`}
                >
                  {OPTION_LABELS[index]}
                </span>
                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                  {optText}
                </span>
              </div>

              {/* Status Icons upon submission */}
              {isSubmitted && (
                <div className="shrink-0">
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isWrong && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
