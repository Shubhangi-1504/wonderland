import { useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import IntroScene from './IntroScene';
import { resetIntro, useSceneStore } from './sceneStore';
import { useGameStore } from '../store/useGameStore';

export function IntroPage() {
  const navigate = useNavigate();
  const gamePhase = useSceneStore((s) => s.gamePhase);
  const setHasEntered = useGameStore((s) => s.setHasEntered);
  const isReady = useRef(false);

  // Reset intro state when navigating back to /
  useLayoutEffect(() => {
    resetIntro();
    const timer = setTimeout(() => {
      isReady.current = true;
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady.current && gamePhase === 'world') {
      setHasEntered(true);
      navigate('/world');
    }
  }, [gamePhase, navigate, setHasEntered]);

  return <IntroScene />;
}

export default IntroPage;
