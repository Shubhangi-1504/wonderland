import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { startEnterWorld, useSceneStore } from '../sceneStore';
import { scrollToScene } from './ScrollStage';

/** @see src/scene/sceneStore.ts — used by ?debug Replay. */
declare global {
  interface Window {
    __mvReplay?: () => void;
  }
}

/**
 * HTML story layer: scene copy rises out of masks on first arrival and
 * resets when you leave, so every visit replays the reveal.
 * All copy is real DOM text. Nav links and the button keyboard-focus visibly.
 */

const SCENES = [
  {
    id: 'mv-s0',
    nav: 'The Pool',
    lines: ['MONEYVERSE'],
    tagline: 'Understand Money. Explore Markets. Build Your Future.',
    p: 0 as const,
  },
  {
    id: 'mv-s1',
    nav: 'Stock Market City',
    lines: ['Stock Market City'],
    tagline:
      'Build your first portfolio with 10,000 virtual coins and paper trade with zero risk.',
    p: 1 as const,
  },
  {
    id: 'mv-s2',
    nav: 'Investment Forest',
    lines: ['Investment Forest'],
    tagline: 'Mutual funds, SIPs and the slow, steady magic of diversification.',
    p: 2 as const,
  },
  {
    id: 'mv-s3',
    nav: 'IPO Island',
    lines: ['IPO Island'],
    tagline: 'Ring the bell with your AI guide and learn how companies go public.',
    p: 3 as const,
  },
  {
    id: 'mv-s4',
    nav: 'The Moonlit Lake',
    lines: ['The Moonlit Lake'],
    tagline: 'Every journey needs a beginning. Step past the coins and enter your future.',
    p: 4 as const,
  },
];

export function Overlay({ isDebug, toggleDebug }: {
  isDebug: boolean;
  toggleDebug: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const enterHandled = useRef(false);

  /* ?debug gate: must be on the URL, or the Replay button has no handler */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('debug')) toggleDebug();
  }, [toggleDebug]);

  /* Replay the intro without touching gamePhase/crashLevel (leaves them
   * untouched so the user can jump straight back into the dive). */
  const handleReplay = () => {
    if (!isDebug) return;
    if (window.__mvReplay) window.__mvReplay();
  };

  /* --- per-scene mask reveals driven by the live scroll value --- */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panels = SCENES.map((s) => ({
      id: s.id,
      el: el.querySelector<HTMLElement>(`#${s.id}`),
      reached: false,
    }));
    const setVisibility = (
      panel: (typeof panels)[number],
      visible: boolean,
      animate: boolean,
    ) => {
      if (!panel.el) return;
      const lines = panel.el.querySelectorAll<HTMLElement>('[data-line]');
      const tagline = panel.el.querySelector<HTMLElement>('[data-tagline]');
      if (visible) {
        if (animate && !reduced) {
          const tl = gsap.timeline();
          tl.fromTo(
            lines,
            { yPercent: 130, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
          );
          if (tagline) {
            tl.fromTo(
              tagline,
              { yPercent: 60, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
              0.25,
            );
          }
        } else {
          gsap.set(lines, { yPercent: 0, opacity: 1 });
          if (tagline) gsap.set(tagline, { yPercent: 0, opacity: 1 });
        }
        gsap.set(panel.el, { opacity: 1 });
      } else {
        // reset so the next arrival replays the rise
        gsap.set(panel.el, { opacity: 0 });
        gsap.set(lines, { yPercent: 130, opacity: 0, delay: 0.05 });
        if (tagline) gsap.set(tagline, { yPercent: 60, opacity: 0, delay: 0.05 });
        panel.reached = false;
      }
    };
    let current = -1;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = useSceneStore.getState().progress; // quantized 0..4 in 0.5 steps
      const idx = Math.round(p);
      if (idx === current) return;
      const prev = panels[current];
      if (prev && current >= 0) {
        setVisibility(prev, false, true);
      }
      const next = panels[idx];
      if (idx >= 0 && next) {
        next.reached = true;
        setVisibility(next, true, true);
      }
      current = idx;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* --- hint fades once the dive starts --- */
  useEffect(() => {
    const el = hint.current;
    if (!el) return;
    let shown = true;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = useSceneStore.getState().progress;
      const wantShown = p < 0.25;
      if (wantShown !== shown) {
        shown = wantShown;
        gsap.to(el, { opacity: shown ? 1 : 0, duration: 0.5, overwrite: 'auto' });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const crashLevel = useSceneStore((s) => s.crashLevel);
  const setCrash = useSceneStore((s) => s.setCrash);
  const gamePhase = useSceneStore((s) => s.gamePhase);

  /* Trigger flash when the dive reaches the portal and enterState activates */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (useSceneStore.getState().gamePhase === 'world') return;
      if (enterState.active && !enterHandled.current) {
        enterHandled.current = true;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduced && flash.current) {
          gsap.fromTo(
            flash.current,
            { opacity: 0 },
            { opacity: 0.7, duration: 0.4, ease: 'power2.in', yoyo: true, repeat: 1 },
          );
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={root}
      id="mv-overlay"
      className="pointer-events-none fixed inset-0 z-10"
      data-debug={isDebug ? '' : undefined}
    >
      {/* top nav */}
      <nav className="fixed inset-x-0 top-0 z-20 flex justify-center gap-1.5 px-4 py-4 sm:gap-3">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToScene(i as 0 | 1 | 2 | 3 | 4)}
            className={`mv-focus font-oswald pointer-events-auto rounded-full px-3 py-1.5 text-[9px] tracking-[0.28em] transition-colors sm:text-[11px] ${
              gamePhase === 'intro' && i === 0
                ? 'border border-[#38e8ff]/50 text-[#38e8ff]'
                : 'border border-white/10 bg-[#0a0820]/55 text-[#b9bfe0] hover:text-[#38e8ff]'
            }`}
          >
            {s.nav}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => setCrash(crashLevel > 0 ? 0 : 1)}
        className="mv-focus font-oswald pointer-events-auto fixed right-4 top-14 z-20 rounded-full border border-[#ff526a]/40 px-3 py-1.5 text-[9px] tracking-[0.25em] text-[#ff526a]/90 hover:bg-[#ff526a]/10 sm:top-[60px] sm:text-[10px]"
      >
        {crashLevel > 0 ? 'RESTORE MARKETS' : 'SIMULATE MARKET SHOCK'}
      </button>

      {/* DEBUG PANEL (?debug): slider + replay — never visible in normal use */}
      {isDebug && (
        <>
          <div id="mv-debug-toggles">
            <button
              type="button"
              id="mv-debug-btn"
              onClick={toggleDebug}
              aria-label="Close debug panel"
            >
              ✕
            </button>
          </div>
          <div id="mv-debug-panel">
            <div id="mv-debug-label">Market shock</div>
            <input
              id="mv-debug-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={crashLevel}
              onChange={(e) => setCrash(Number(e.target.value))}
              className="mt-1"
            />
            <div id="mv-debug-value">{Math.round(crashLevel * 100)}%</div>
            <button
              type="button"
              id="mv-debug-replay"
              onClick={handleReplay}
              className="mv-focus mt-1"
            >
              Replay intro
            </button>
          </div>
        </>
      )}

      {/* scene panel */}
      {SCENES.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`mv-panel fixed inset-0 z-10 opacity-0 ${
            i === 4
              ? 'flex flex-col items-center justify-end px-6 pb-[15vh] text-center'
              : 'flex items-center px-7 sm:px-20'
          }`}
        >
          <div className="mv-copy">
            {i === 0 ? (
              <h1
                aria-label="MONEYVERSE"
                className="font-oswald text-[clamp(3rem,11vw,8rem)] leading-none tracking-[0.24em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#cfe4ff] to-[#9b5cff]"
              >
                {'MONEYVERSE'.split('').map((ch, j) => (
                  <span key={j} data-line className="inline-block overflow-hidden align-bottom">
                    {ch}
                  </span>
                ))}
              </h1>
            ) : (
              <h2 className="font-oswald text-[clamp(1.9rem,4.6vw,3.5rem)] leading-tight tracking-[0.14em] text-[#e9ecff]">
                <span className="block overflow-hidden">
                  <span data-line className="inline-block">
                    {s.lines[0]}
                  </span>
                </span>
              </h2>
            )}
            <p
              data-tagline
              className={`mt-5 max-w-md text-sm leading-relaxed text-[#aab2d8] sm:max-w-lg sm:text-base ${
                i === 0 ? 'sm:mx-auto text-center' : ''
              }`}
            >
              {s.tagline}
            </p>
          </div>
        </section>
      ))}

      {/* scroll hint */}
      <div
        ref={hint}
        className="font-oswald fixed inset-x-0 bottom-7 z-20 text-center text-[10px] tracking-[0.45em] text-white/45 sm:text-[11px]"
      >
        SCROLL TO DIVE
      </div>

      {/* entry flash */}
      <div ref={flash} className="pointer-events-none fixed inset-0 z-40 bg-[#d8f6ff] opacity-0" />

      {/* mobile translucent panel styling + fonts live in scene.css */}
      <SceneCss />
    </div>
  );
}

function SceneCss() {
  return <style>{`
    #mv-overlay, #mv-overlay button, #mv-overlay h1, #mv-overlay h2 { font-family: 'Oswald', sans-serif; }
    #mv-overlay p { font-family: 'Inter', system-ui, sans-serif; }
    .mv-panel { transition: none; }
    .mv-enter-btn { box-shadow: 0 0 28px rgba(255,198,92,0.35); animation: mvPulse 2.6s ease-in-out infinite; }
    @keyframes mvPulse { 0%,100% { box-shadow: 0 0 28px rgba(255,198,92,0.35); } 50% { box-shadow: 0 0 55px rgba(56,232,255,0.55); } }
    .mv-focus:focus-visible { outline: 2px solid #38e8ff; outline-offset: 3px; }
    .mv-bar-fill { animation: mvBar 1.5s ease-in-out infinite; }
    @keyframes mvBar { 0% { transform: translateX(-100%);} 50% { transform: translateX(0);} 100% { transform: translateX(100%);} }
    .mv-veil-out { transition: opacity 0.85s ease; animation: mvFade 0.85s ease forwards; }
    @keyframes mvFade { from { opacity: 1; } to { opacity: 0; } }

    /* mobile: copy in a full-width dark translucent panel */
    @media (max-width: 640px) {
      .mv-panel { background: rgba(7, 6, 24, 0.62); backdrop-filter: blur(2px); align-items: stretch; }
      .mv-copy { width: 100%; padding: 3.5rem 1.25rem; background: rgba(7, 6, 24, 0.35); border-radius: 0; margin-top: 22vh; max-width: 100%; }
      .mv-panel.flex.items-center { align-items: flex-start; }
    }
    @media (prefers-reduced-motion: reduce) {
      .mv-enter-btn, .mv-bar-fill { animation: none; }
    }
  `}</style>
}
