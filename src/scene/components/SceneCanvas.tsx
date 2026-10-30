import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { City } from './City';
import { Forest } from './Forest';
import { IPOIsland } from './IPOIsland';
import { LakeScene } from './LakeScene';
import { River } from './River';
import { Gates } from './Gates';
import { AtmosphereParticles, Starfield } from './Atmosphere';
import { CursorLight } from './CursorLight';
import { PostFX } from './PostFX';
import { usePerformanceProfile, usePageVisible } from '../hooks/usePerformanceProfile';
import { introTiming, useSceneStore } from '../sceneStore';

export function SceneCanvas() {
  const profile = usePerformanceProfile();
  const visible = usePageVisible();
  const gamePhase = useSceneStore((s) => s.gamePhase);

  return (
    <div className="fixed inset-0" aria-hidden="true">
      {/* pausing: rendering stops when the intro phase hands over to the world */}
      <Canvas
        dpr={[1, 1.5]}
        frameloop={gamePhase === 'world' || !visible ? 'never' : 'always'}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#0a0820' }}
        onCreated={() => {
          window.setTimeout(() => {
            introTiming.start = performance.now() / 1000;
            useSceneStore.getState().setGamePhase('intro');
          }, 500);
        }}
      >
        <color attach="background" args={['#0a0820']} />
        <fogExp2 attach="fog" args={['#0a0820', 0.00085]} />

        {/* moon backlight from behind the city + gentle purple fill */}
        <ambientLight color="#2a2452" intensity={0.6} />
        <hemisphereLight color="#1d1478" groundColor="#05040f" intensity={0.5} />
        <directionalLight color="#b9c4ff" intensity={0.6} position={[0, 420, -1900]} />
        <directionalLight color="#9b5cff" intensity={0.35} position={[220, 260, 300]} />

        <SceneContent reducedMotion={profile.reducedMotion} particleCount={profile.particles} />
        <PostFX />
      </Canvas>
    </div>
  );
}

function SceneContent({
  reducedMotion,
  particleCount,
}: {
  reducedMotion: boolean;
  particleCount: number;
}) {
  return (
    <Suspense fallback={null}>
      <City />
      <Forest />
      <IPOIsland />
      <LakeScene reducedMotion={reducedMotion} />
      <River sprayCount={reducedMotion ? 60 : 200} />
      <Gates />
      <AtmosphereParticles count={reducedMotion ? 120 : particleCount} />
      <Starfield count={reducedMotion ? 200 : 500} />
      <CameraRig />
      <CursorLight />
    </Suspense>
  );
}
