import { useEffect, Suspense, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSceneStore } from './sceneStore';
import { useGameStore } from '../store/useGameStore';
import IntroScene from './IntroScene';

export function IntroPage() {
  const navigate = useNavigate();
  const gamePhase = useSceneStore((s) => s.gamePhase);
  const setHasEntered = useGameStore((s) => s.setHasEntered);
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    if (gamePhase === 'world') {
      setHasEntered(true);
      navigate('/world');
    }
  }, [gamePhase, navigate, setHasEntered]);

  /* ?debug flag: echoes the URL media-query helper so it never shows in
   * normal use and is easy to reset. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDebug(params.has('debug'));
  }, []);

  const toggleDebug = useCallback(() => setIsDebug((v) => !v), []);

  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05040f]"><div className="font-oswald text-2xl tracking-[0.3em] text-[#e9ecff]">LOADING</div></div>}>
      <IntroScene isDebug={isDebug} toggleDebug={toggleDebug} />
    </Suspense>
  );
}

export default IntroPage;
