import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import './scene.css';
import { SceneCanvas } from './components/SceneCanvas';
import { ScrollStage } from './components/ScrollStage';
import { Overlay } from './components/Overlay';
import { LoadingScreen } from './components/LoadingScreen';

/**
 * MONEYVERSE intro (Person A): a fixed full-screen R3F canvas with a scroll
 * track that drives the camera P 0..4 along the river through five scenes.
 * Exported as the default component from ./index.ts for the "/" route.
 */
export default function IntroScene({ isDebug, toggleDebug }: {
  isDebug: boolean;
  toggleDebug: () => void;
}) {
  return (
    <>
      <SceneCanvas />
      <ScrollStage />
      <Overlay isDebug={isDebug} toggleDebug={toggleDebug} />
      <LoadingScreen />
    </>
  );
}
