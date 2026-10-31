import { useState } from 'react';
import {
  Wallet,
  Sparkles,
  Award,
  Compass,
  Target,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  TrendingUp,
  Zap,
  ShoppingBag,
  Trophy,
  Music,
} from 'lucide-react';
import { soundFX } from '../../utils/audio';

export default function GameHUD({
  selectedBuilding,
  onSelectBuilding,
  onResetCamera,
  onOpenMissions,
  onOpenAchievements,
  onOpenSettings,
  onOpenPlayerProgress,
  onOpenBadges,
  playerXP = 0,
  levelInfo = { level: 1, title: 'Rookie Trader', progressPercent: 0 },
  walletBalance = 10000,
  badgeCount = { unlocked: 0, total: 5 },
  completedMissionsCount = 0,
}) {
  const [soundEnabled, setSoundEnabled] = useState(soundFX.soundEnabled);
  const [musicEnabled, setMusicEnabled] = useState(soundFX.musicEnabled);
  const [activeTab, setActiveTab] = useState('explore');

  const playerLevel = levelInfo.level || 1;

  const toggleSound = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFX.playClick();
  };

  const toggleMusic = () => {
    const newState = soundFX.toggleMusic();
    setMusicEnabled(newState);
    if (soundEnabled) soundFX.playClick();
  };

  const handleTabClick = (tab) => {
    soundFX.playClick();
    setActiveTab(tab);
    if (tab === 'missions') onOpenMissions();
    if (tab === 'achievements') {
      if (onOpenBadges) onOpenBadges();
      else if (onOpenAchievements) onOpenAchievements();
    }
  };

  const handleLandmarkSelect = (id) => {
    soundFX.playBuildingSelect();
    onSelectBuilding(id);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* ======================================================== */}
      {/* TOP BAR                                                  */}
      {/* ======================================================== */}
      <header className="flex items-start justify-between gap-4 w-full">
        {/* TOP LEFT: Logo + Player Profile + Level Indicator (Clickable to open PlayerProgressPanel) */}
        <div
          onClick={() => {
            soundFX.playClick();
            if (onOpenPlayerProgress) onOpenPlayerProgress();
          }}
          className="flex items-center gap-3 pointer-events-auto cursor-pointer group"
          title="Click to view detailed Player Profile & Level Progress"
        >
          {/* Avatar Frame */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl glass-panel-glow flex items-center justify-center border border-sky-400/40 shadow-xl shadow-sky-500/20 group-hover:scale-105 group-hover:border-sky-300 transition-all">
              <User className="w-6 h-6 text-sky-400 group-hover:text-sky-300 transition-colors" />
            </div>
            {/* Level Tag Pill */}
            <div className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-[10px] font-black text-slate-950 font-heading tracking-wider shadow">
              LV.{playerLevel < 10 ? `0${playerLevel}` : playerLevel}
            </div>
          </div>

          {/* User & Game Title Info */}
          <div className="glass-panel px-4 py-2 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col justify-center group-hover:border-sky-500/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold font-heading text-white tracking-wide">
                INVEST<span className="text-sky-400">QUEST</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                HACKATHON DEMO
              </span>
            </div>
            {/* Player Title & Level Progress */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-amber-300 font-medium">
                {levelInfo.title || 'Rookie Trader'}
              </span>
              <span className="text-slate-600 text-[10px]">•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(levelInfo.progressPercent, 8)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono-numbers text-slate-400">
                  {playerXP} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Virtual Wallet + XP + Badges + Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Virtual Wallet */}
          <div className="glass-panel px-3.5 py-2 rounded-2xl border border-amber-500/30 shadow-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
                Portfolio Cash
              </div>
              <div className="text-sm font-extrabold text-white font-mono-numbers">
                ₹{walletBalance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Badges Quick Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              if (onOpenBadges) onOpenBadges();
            }}
            title="Open Badge Collection"
            className="glass-panel px-3 py-2 rounded-2xl border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/80 shadow-lg flex items-center gap-2 transition-all active:scale-95 group cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-left font-mono-numbers">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Badges
              </div>
              <div className="text-xs font-bold text-amber-300">
                {badgeCount.unlocked}/{badgeCount.total}
              </div>
            </div>
          </button>

          {/* XP Pill (Clickable) */}
          <button
            onClick={() => {
              soundFX.playClick();
              if (onOpenPlayerProgress) onOpenPlayerProgress();
            }}
            title="Open Player Progress"
            className="hidden sm:flex glass-panel px-3 py-2 rounded-2xl border border-sky-500/30 hover:border-sky-400 shadow-lg items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <div className="text-left font-mono-numbers">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Experience
              </div>
              <div className="text-xs font-bold text-sky-300">
                {playerXP} XP
              </div>
            </div>
          </button>

          {/* Quick Camera Reset Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              onResetCamera();
            }}
            title="Reset Camera to City Overview"
            className="w-10 h-10 rounded-2xl glass-panel border border-slate-700/70 hover:border-sky-400/60 hover:bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-sky-300 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
            className="w-10 h-10 rounded-2xl glass-panel border border-slate-700/70 hover:border-sky-400/60 hover:bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-sky-300 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Background Music Toggle */}
          <button
            onClick={toggleMusic}
            title={musicEnabled ? 'Pause Background Music' : 'Play Background Music'}
            className={`w-10 h-10 rounded-2xl glass-panel border flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              musicEnabled
                ? 'border-amber-400/60 bg-amber-500/15 text-amber-300 shadow-amber-500/20'
                : 'border-slate-700/70 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <Music className={`w-4 h-4 ${musicEnabled ? 'animate-pulse' : ''}`} />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenSettings();
            }}
            title="Game Settings"
            className="w-10 h-10 rounded-2xl glass-panel border border-slate-700/70 hover:border-sky-400/60 hover:bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-sky-300 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* BOTTOM SECTION                                           */}
      {/* ======================================================== */}
      <footer className="flex flex-col items-center gap-3 w-full">
        {/* Landmark Quick-Nav Chips (Floating above dock) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* TechNova */}
          <button
            onClick={() => handleLandmarkSelect('technova')}
            className={`px-3 py-1.5 rounded-xl glass-panel text-xs font-bold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
              selectedBuilding === 'technova'
                ? 'bg-sky-500/30 border-sky-400 text-sky-200 shadow-lg shadow-sky-500/30 scale-105'
                : 'border-slate-700/60 text-slate-300 hover:border-sky-400/50 hover:bg-slate-800/80'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>TechNova Exchange</span>
          </button>

          {/* GreenEnergy */}
          <button
            onClick={() => handleLandmarkSelect('greenenergy')}
            className={`px-3 py-1.5 rounded-xl glass-panel text-xs font-bold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
              selectedBuilding === 'greenenergy'
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/30 scale-105'
                : 'border-slate-700/60 text-slate-300 hover:border-emerald-400/50 hover:bg-slate-800/80'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>GreenEnergy</span>
          </button>

          {/* FoodSphere */}
          <button
            onClick={() => handleLandmarkSelect('foodsphere')}
            className={`px-3 py-1.5 rounded-xl glass-panel text-xs font-bold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
              selectedBuilding === 'foodsphere'
                ? 'bg-orange-500/30 border-orange-400 text-orange-200 shadow-lg shadow-orange-500/30 scale-105'
                : 'border-slate-700/60 text-slate-300 hover:border-orange-400/50 hover:bg-slate-800/80'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
            <span>FoodSphere</span>
          </button>
        </div>

        {/* Primary Bottom HUD Dock */}
        <div className="glass-panel px-3 py-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2 pointer-events-auto">
          {/* Explore City (Active) */}
          <button
            onClick={() => handleTabClick('explore')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore City</span>
          </button>

          {/* Missions Tab */}
          <button
            onClick={() => handleTabClick('missions')}
            className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Missions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[10px] font-black text-slate-950 font-mono-numbers">
              {completedMissionsCount > 0 ? `${completedMissionsCount}/3` : '3'}
            </span>
          </button>

          {/* Badges / Achievements Tab */}
          <button
            onClick={() => handleTabClick('achievements')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badges</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 text-[10px] font-bold border border-slate-700 font-mono-numbers">
              {badgeCount.unlocked}/{badgeCount.total}
            </span>
          </button>
        </div>

          {/* Real-time Simulated Market Ticker Banner */}
        <div className="w-full max-w-4xl glass-panel py-1.5 px-4 rounded-xl border border-slate-800/80 overflow-hidden flex items-center pointer-events-auto shadow-xl">
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-700/60 shrink-0 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
            <span>LIVE TICKER</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap pl-3 w-full text-xs font-mono-numbers text-slate-300">
            <div className="inline-flex gap-8 animate-[marquee_24s_linear_infinite]">
              <span><span className="text-white font-bold">TECHNOVA (TNSE):</span> ₹1,420.50 <span className="text-emerald-400 font-bold">▲ +4.25%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">GREENENERGY (GNRG):</span> ₹845.20 <span className="text-emerald-400 font-bold">▲ +6.80%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">FOODSPHERE (FDSP):</span> ₹620.10 <span className="text-emerald-400 font-bold">▲ +2.15%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">NIFTY 50:</span> 24,180.20 <span className="text-emerald-400 font-bold">▲ +0.72%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">SENSEX:</span> 79,450.15 <span className="text-emerald-400 font-bold">▲ +0.65%</span></span>
              <span className="text-slate-600">•</span>
              {/* Duplicate for seamless continuous looping */}
              <span><span className="text-white font-bold">TECHNOVA (TNSE):</span> ₹1,420.50 <span className="text-emerald-400 font-bold">▲ +4.25%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">GREENENERGY (GNRG):</span> ₹845.20 <span className="text-emerald-400 font-bold">▲ +6.80%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">FOODSPHERE (FDSP):</span> ₹620.10 <span className="text-emerald-400 font-bold">▲ +2.15%</span></span>
              <span className="text-slate-600">•</span>
              <span><span className="text-white font-bold">NIFTY 50:</span> 24,180.20 <span className="text-emerald-400 font-bold">▲ +0.72%</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
