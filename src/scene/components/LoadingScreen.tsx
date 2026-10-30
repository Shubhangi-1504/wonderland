import { useEffect, useState } from 'react';
import { useSceneStore } from '../sceneStore';

/**
 * Loading indicator. Everything is procedural (no GLB assets) so this holds
 * the veil until the canvas is alive, then hands off to the intro reveal.
 */
export function LoadingScreen() {
  const gamePhase = useSceneStore((s) => s.gamePhase);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (gamePhase !== 'loading') {
      const id = window.setTimeout(() => setGone(true), 900);
      return () => window.clearTimeout(id);
    }
  }, [gamePhase]);

  if (gamePhase !== 'loading' && !gone) {
    return (
      <div className="mv-veil-out pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#05040f]">
        <Transfer />
      </div>
    );
  }
  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05040f] text-center select-none"
      role="status"
      aria-label="Loading MONEYVERSE"
    >
      <LoadingBody />
    </div>
  );
}

function LoadingBody() {
  return (
    <>
      <div className="font-oswald text-[11px] tracking-[0.5em] text-[#38e8ff]">PREPARING YOUR DIVE</div>
      <div className="font-oswald mt-6 text-4xl tracking-[0.34em] text-[#e9ecff] sm:text-5xl">MONEYVERSE</div>
      <div className="mv-bar mt-9 h-0.5 w-56 overflow-hidden bg-white/10">
        <div className="mv-bar-fill h-full w-full bg-gradient-to-r from-[#38e8ff] to-[#ffc65c]" />
      </div>
    </>
  );
}

function Transfer() {
  return <LoadingBody />;
}
