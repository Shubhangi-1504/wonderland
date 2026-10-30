import { Clock, Award, Target, Lock, Play, CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function MissionCard({
  mission,
  onStartMission,
  onStartQuiz,
  isCompleted,
  quizResult,
}) {
  const isAvailable = mission.status === 'AVAILABLE';

  const handleStart = () => {
    if (!isAvailable) return;
    soundFX.playMissionStart();
    onStartMission(mission);
  };

  const handleQuiz = () => {
    if (!onStartQuiz) return;
    soundFX.playClick();
    onStartQuiz(mission.id);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isAvailable
          ? 'glass-panel-glow border-sky-400/40 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10'
          : 'glass-panel border-slate-800/80 opacity-70'
      }`}
    >
      {/* Top Bar: Code, Status & Reward */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700 font-mono-numbers">
            {mission.code}
          </span>
          {isAvailable ? (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              AVAILABLE
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>COMING SOON</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-amber-400 font-bold">
          <Award className="w-3.5 h-3.5" />
          <span>+{mission.rewardXp} XP</span>
        </div>
      </div>

      {/* Mission Title */}
      <h4 className="text-base font-extrabold text-white font-heading mb-1 flex items-center gap-2">
        <span>{mission.title}</span>
        {isCompleted && (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Learning Completed" />
        )}
      </h4>

      {/* Mission Summary */}
      <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
        {mission.summary}
      </p>

      {/* Learning Objectives Preview */}
      {mission.learningObjectives && (
        <div className="space-y-1 mb-4 pl-0.5">
          {mission.learningObjectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
              <span className="text-sky-400 font-bold">•</span>
              <span>{obj}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Status Badge if present */}
      {quizResult && (
        <div className="mb-3 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mastery Quiz Score:</span>
          </span>
          <span className="font-mono-numbers font-black text-emerald-400">
            {quizResult.score}/{quizResult.total} ({quizResult.percentage}%)
          </span>
        </div>
      )}

      {/* Metadata & Button Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono-numbers">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 text-sky-400" />
            <span>{mission.difficulty}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{mission.estimatedTime}</span>
          </span>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-2">
            {/* If completed, also allow Taking or Retaking Quiz */}
            {isCompleted && onStartQuiz && (
              <button
                onClick={handleQuiz}
                title={quizResult ? 'Retake Quiz' : 'Take Mission Quiz'}
                className="btn-tactile px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {quizResult ? <RotateCcw className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                <span>{quizResult ? 'Retake Quiz' : 'Quiz'}</span>
              </button>
            )}

            <button
              onClick={handleStart}
              className="btn-tactile px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/30"
              style={{
                background: isCompleted
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              }}
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>{isCompleted ? 'Review' : 'Start'}</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] font-semibold text-slate-500 italic">
            Unlock in Next Phase
          </div>
        )}
      </div>
    </div>
  );
}
