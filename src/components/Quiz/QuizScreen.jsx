import { X, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { QUIZZES_DATA } from '../../data/quizzes';
import QuizQuestion from './QuizQuestion';
import AnswerFeedback from './AnswerFeedback';
import QuizResults from './QuizResults';
import { soundFX } from '../../utils/audio';

export default function QuizScreen({
  quizId = 'technova-m1',
  onClose,
  onCompleteQuiz,
}) {
  const quiz = QUIZZES_DATA[quizId] || QUIZZES_DATA['technova-m1'];

  const handleQuizFinish = (score, total) => {
    if (onCompleteQuiz) {
      onCompleteQuiz(score, total);
    }
  };

  const {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    selectedOption,
    isSubmitted,
    answers,
    isCompleted,
    score,
    selectOption,
    submitAnswer,
    nextQuestion,
    restartQuiz,
  } = useQuiz(quiz, handleQuizFinish);

  // Progress percentage (0 to 100)
  const currentProgressPercent = Math.round(
    ((currentQuestionIndex + (isSubmitted ? 1 : 0)) / totalQuestions) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl glass-panel-glow border border-slate-700/80 shadow-2xl shadow-sky-950/50 overflow-hidden bg-slate-900/95 animate-spring-pop">
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black font-heading text-white">
                {quiz.title}
              </h2>
              <div className="text-[11px] text-slate-400">
                {!isCompleted ? (
                  <span>
                    Question <strong className="text-sky-300">{currentQuestionIndex + 1}</strong> of{' '}
                    <strong>{totalQuestions}</strong>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">Quiz Completed!</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Visible during active quiz) */}
        {!isCompleted && (
          <div className="w-full bg-slate-800 h-1.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
        )}

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!isCompleted ? (
            <>
              {/* Question Component */}
              <QuizQuestion
                question={currentQuestion}
                selectedOption={selectedOption}
                isSubmitted={isSubmitted}
                onSelectOption={selectOption}
              />

              {/* Immediate Feedback Card after Submission */}
              {isSubmitted && (
                <AnswerFeedback
                  isCorrect={selectedOption === currentQuestion.correctIndex}
                  explanation={currentQuestion.explanation}
                />
              )}
            </>
          ) : (
            /* Results Screen Component */
            <QuizResults
              quiz={quiz}
              score={score}
              totalQuestions={totalQuestions}
              answers={answers}
              onContinue={() => {
                soundFX.playClick();
                onClose();
              }}
              onRetry={restartQuiz}
            />
          )}
        </div>

        {/* Bottom Actions Footer (Only during active quiz) */}
        {!isCompleted && (
          <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400 hidden sm:block">
              {!isSubmitted ? 'Select one answer to continue' : 'Review explanation above'}
            </div>

            <div className="flex items-center gap-2.5 ml-auto w-full sm:w-auto">
              {!isSubmitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={submitAnswer}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedOption !== null
                      ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Answer</span>
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
