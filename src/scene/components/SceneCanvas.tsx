import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
import { WarningLights } from './Atmosphere';
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

        <AdaptiveCanvas reducedMotion={profile.reducedMotion} particleCount={profile.particles} />
        <PostFX />
      </Canvas>
    </div>
  );
}

/**
 * Adaptive fallback: if the average frame time stays above ~24 ms for more
 * than ~3 s, drop particles/dpr and disable bloom, once. Keeps the intro
 * smooth on mid-range laptops and phones.                 */
function AdaptiveCanvas({
  reducedMotion,
  particleCount,
}: {
  reducedMotion: boolean;
  particleCount: number;
}) {
  const [lowEnd, setLowEnd] = useState(false);
  const sampleRef = useRef<number[]>([]);
  const lastFallbackRef = useRef(false);

  // recalibrate the frame timer whenever the canvas is visible again
  const firstFrameRef = useRef(true);

  useFrame((state) => {
    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      return;
    }
    const dt = state.clock.getDelta() * 1000; // ms
    sampleRef.current.push(dt);
    if (sampleRef.current.length > 60) sampleRef.current.shift();
    const avg = sampleRef.current.reduce((a, b) => a + b, 0) / sampleRef.current.length;

    // once: drop to low-end budgets + disable bloom
    if (!lastFallbackRef.current && avg > 24) {
      lastFallbackRef.current = true;
      setLowEnd(true);
    }
  });

  const effective = lowEnd ? 60 : particleCount;
  const reducedMotionBudget = reducedMotion ? 60 : effective;

  return (
    <Suspense fallback={null}>
      <City />
      <Forest />
      <IPOIsland />
      <LakeScene reducedMotion={reducedMotion} />
      <River sprayCount={reducedMotion ? 60 : reducedMotionBudget} />
      <Gates />
      <AtmosphereParticles count={reducedMotion ? 120 : reducedMotionBudget} />
      <Starfield count={reducedMotion ? 200 : reducedMotionBudget} />
      <CameraRig />
      <CursorLight />
      <WarningLights />
    </Suspense>
  );
}
