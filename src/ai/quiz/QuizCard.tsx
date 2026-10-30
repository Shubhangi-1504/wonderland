import { useEffect, useState } from "react";
import { addXPRemote } from "../../lib/persistence";
import { track } from "../../lib/track";
import { useGameStore } from "../../store/useGameStore";
import { fetchQuizQuestion } from "./fetchQuizQuestion";
import { pickQuestions, type QuizQuestion, type QuizTopic } from "./questionBank";

/**
 * Five-question quiz session. Works fully offline: the bank is local, and the
 * optional LLM question is only used if the server returns a validated shape.
 */

const SESSION_SIZE = 5;
const XP_PER_CORRECT = 10;
const LETTERS = ["A", "B", "C", "D"];

const resultMessage = (score: number, total: number) => {
  if (score === total) return "Perfect score — you understand these ideas well. Try the crash simulator next.";
  if (score >= Math.ceil(total / 2)) return "Nice work. Re-read the explanations you missed and try again for a perfect run.";
  return "Good start — every wrong answer came with an explanation. Play again to lock it in.";
};

export function QuizCard() {
  // After a crash, prefer crash + diversification questions.
  const [preferredTopics] = useState<QuizTopic[]>(() =>
    useGameStore.getState().lastScenarioResult ? ["crash", "diversification"] : ["diversification"],
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    pickQuestions(SESSION_SIZE, preferredTopics),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const addXP = useGameStore((s) => s.addXP);

  // Optional personalised question: silently ignored if the server/LLM fails.
  useEffect(() => {
    track("quiz_started", { source: preferredTopics[0] ?? "stocks" });
    let active = true;
    void fetchQuizQuestion(preferredTopics[0] ?? "stocks").then((aiQuestion) => {
      if (!active || !aiQuestion) return;
      setQuestions((prev) => [aiQuestion, ...prev.slice(1)]);
    });
    return () => {
      active = false;
    };
  }, [preferredTopics]);

  const current = questions[index];

  const answer = (choice: number) => {
    if (selected !== null || !current) return;
    setSelected(choice);
    if (choice === current.correctIndex) {
      setScore((s) => s + 1);
      addXP(XP_PER_CORRECT);
      // Persist the absolute total for logged-in users; guests are a no-op.
      void addXPRemote(useGameStore.getState().xp);
    }
  };

  const next = () => {
    if (selected === null) return;
    if (index === questions.length - 1) {
      setFinished(true);
      track("quiz_completed", { score, total: questions.length });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const restart = () => {
    setQuestions(pickQuestions(SESSION_SIZE, preferredTopics));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    track("quiz_started", { source: "retry" });
  };

  if (finished) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-[11px] uppercase tracking-widest text-cyan">Quiz complete</p>
        <p className="font-display text-2xl font-bold text-white">
          {score} / {questions.length}
        </p>
        <p className="text-xs text-slate-400">+{score * XP_PER_CORRECT} XP earned</p>
        <p className="max-w-[280px] text-sm text-slate-300">{resultMessage(score, questions.length)}</p>
        <button
          type="button"
          onClick={restart}
          className="mt-1 rounded-xl bg-gradient-to-br from-purple to-cyan px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          Play again
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span className="tabular-nums text-cyan">Score {score}</span>
      </div>

      <p className="text-sm font-semibold leading-snug text-white">{current.question}</p>

      <div className="space-y-1.5" role="group" aria-label="Answer options">
        {current.options.map((option, choice) => {
          const isCorrect = choice === current.correctIndex;
          const isPicked = selected === choice;
          const revealed = selected !== null;
          const tone = !revealed
            ? "border-white/10 bg-white/5 text-slate-200 hover:border-cyan/40 hover:bg-cyan/10"
            : isCorrect
              ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
              : isPicked
                ? "border-rose-400/60 bg-rose-400/10 text-rose-200"
                : "border-white/10 bg-white/5 text-slate-400";
          return (
            <button
              key={option}
              type="button"
              onClick={() => answer(choice)}
              disabled={revealed}
              aria-label={`Answer ${LETTERS[choice]}: ${option}`}
              className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:cursor-default ${tone}`}
            >
              <span className="font-semibold">{LETTERS[choice]}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div role="status" className="space-y-2">
          <p
            className={`text-xs font-semibold ${
              selected === current.correctIndex ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {selected === current.correctIndex ? "Correct! +10 XP" : "Not quite."}
          </p>
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-slate-300">
            {current.explanation}
          </p>
          <button
            type="button"
            onClick={next}
            className="w-full rounded-xl bg-gradient-to-br from-purple to-cyan px-3 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            {index === questions.length - 1 ? "See results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizCard;
