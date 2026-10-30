import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useSceneStore } from '../sceneStore';

/**
 * Bloom-led night grade. At crashLevel > 0 the bloom dims and eases back
 * when the level returns to 0.
 */
export function PostFX() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bloomRef = useRef<any>(null);

  useFrame(() => {
    const crash = useSceneStore.getState().crashLevel;
    if (bloomRef.current) {
      bloomRef.current.intensity = 0.95 * (1 - crash * 0.6);
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloomRef}
        intensity={0.95}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.24} darkness={0.75} />
    </EffectComposer>
  );
}
