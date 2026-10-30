import { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Music,
  MousePointer,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { soundFX } from '../../utils/audio';
import { clearPlayerProgress } from '../../utils/progressStorage';

export default function SettingsModal({ onClose, onResetCamera }) {
  const [soundEnabled, setSoundEnabled] = useState(soundFX.soundEnabled);
  const [musicEnabled, setMusicEnabled] = useState(soundFX.musicEnabled);
  const [musicVolume, setMusicVolume] = useState(soundFX.musicVolume);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSoundToggle = () => {
    const next = soundFX.toggleSound();
    setSoundEnabled(next);
    if (next) soundFX.playClick();
  };

  const handleMusicToggle = () => {
    const next = soundFX.toggleMusic();
    setMusicEnabled(next);
    if (soundEnabled) soundFX.playClick();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    soundFX.setMusicVolume(val);
  };

  const handleResetProgress = () => {
    if (soundEnabled) soundFX.playClick();
    clearPlayerProgress();
    setShowConfirmReset(false);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel-glow p-6 sm:p-7 shadow-2xl border border-slate-700/80 text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            if (soundEnabled) soundFX.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 w-9 h-9 rounded-full glass-panel border border-slate-700 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close Settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Audio & Gameplay Preferences
            </div>
            <h2 className="text-2xl font-black font-heading text-white tracking-wide">
              Settings & Controls
            </h2>
          </div>
        </div>

        {/* Audio Options Card */}
        <div className="space-y-3 mb-5">
          {/* Sound FX Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-sky-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="text-sm font-bold text-white">Sound Effects (SFX)</div>
                <div className="text-xs text-slate-400">Interactive chimes & audio feedback</div>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                soundEnabled ? 'bg-sky-500 shadow-md shadow-sky-500/40' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className={`w-5 h-5 ${musicEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Background Music (BGM)</span>
                    {musicEnabled && (
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.2 rounded-full">
                        Lo-Fi Ambient
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Relaxing generative educational soundtrack</div>
                </div>
              </div>
              <button
                onClick={handleMusicToggle}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  musicEnabled ? 'bg-amber-400 shadow-md shadow-amber-400/40' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    musicEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Volume Slider if Music Enabled */}
            {musicEnabled && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 shrink-0 font-medium">BGM Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="font-mono-numbers text-amber-300 text-xs w-8 text-right">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3D Navigation Controls Guide */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MousePointer className="w-4 h-4 text-sky-400" />
            <span>3D Camera Navigation Guide</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="font-semibold text-white">Rotate Orbit:</span>
              <span className="text-slate-400">Left-Click + Drag / 1 Finger</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="font-semibold text-white">Zoom In / Out:</span>
              <span className="text-slate-400">Mouse Wheel / Pinch gesture</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="font-semibold text-white">Pan City:</span>
              <span className="text-slate-400">Right-Click + Drag / 2 Fingers</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-white">Inspect Building:</span>
              <span className="text-slate-400">Click or Hover any Landmark</span>
            </div>
          </div>
        </div>

        {/* Actions Row: Reset Camera & Reset Progress */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (soundEnabled) soundFX.playClick();
              onResetCamera();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Camera to City Overview</span>
          </button>

          {!showConfirmReset ? (
            <button
              onClick={() => {
                if (soundEnabled) soundFX.playClick();
                setShowConfirmReset(true);
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Progress (Testing)</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/50 space-y-2 text-center animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Reset all XP, badges, and quizzes?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetProgress}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
