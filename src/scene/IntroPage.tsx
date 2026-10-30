import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IntroScene from './IntroScene';
import { useSceneStore } from './sceneStore';
import { useGameStore } from '../store/useGameStore';

export function IntroPage() {
  const navigate = useNavigate();
  const gamePhase = useSceneStore((s) => s.gamePhase);
  const setHasEntered = useGameStore((s) => s.setHasEntered);

  useEffect(() => {
    if (gamePhase === 'world') {
      setHasEntered(true);
      navigate('/world');
    }
  }, [gamePhase, navigate, setHasEntered]);

  return <IntroScene />;
}

export default IntroPage;
