import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Cpu, Building2, Coins } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Initializing Financial Simulation Engine...', icon: Cpu },
  { text: 'Constructing Stock Market City District...', icon: Building2 },
  { text: 'Streaming Real-Time Candlestick Feeds...', icon: TrendingUp },
  { text: 'Minting ₹10,000 Virtual Trader Capital...', icon: Coins },
  { text: 'Opening TechNova Exchange Trading Floor...', icon: Sparkles },
];

export default function LoadingScreen({ onLoaded }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoaded(), 400);
          return 100;
        }
        const next = prev + 18;
        const stepIdx = Math.min(
          Math.floor((next / 100) * LOADING_STEPS.length),
          LOADING_STEPS.length - 1
        );
        setCurrentStepIndex(stepIdx);
        return next;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [onLoaded]);

  const CurrentIcon = LOADING_STEPS[currentStepIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white transition-opacity duration-700">
      {/* Background Radiance */}
      <div className="absolute w-96 h-96 bg-sky-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-8 text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl glass-panel-glow flex items-center justify-center border border-sky-400/50 shadow-2xl shadow-sky-500/30">
            <TrendingUp className="w-10 h-10 text-sky-400 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-sky-500/30 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold tracking-tight font-heading mb-1">
          STOCK MARKET CITY
        </h2>
        <div className="text-xs text-sky-400 font-semibold tracking-widest uppercase mb-6">
          InvestQuest Virtual World
        </div>

        {/* Status Message */}
        <div className="flex items-center gap-2 h-7 text-xs sm:text-sm text-slate-300 font-medium mb-4">
          <CurrentIcon className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{LOADING_STEPS[currentStepIndex].text}</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-sm shadow-sky-400"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Progress % */}
        <div className="mt-3 text-[11px] font-mono-numbers text-slate-500 font-bold">
          {Math.min(progress, 100)}% LOADED
        </div>
      </div>
    </div>
  );
}
