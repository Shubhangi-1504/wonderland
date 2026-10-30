import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointLight, Raycaster, Vector3 } from 'three';
import { useSceneStore } from '../sceneStore';

/** Soft warm light following the cursor on fine pointers. calming, subtle. */
export function CursorLight() {
  const lightRef = useRef<PointLight>(null);
  const raycaster = useMemo(() => new Raycaster(), []);
  const target = useMemo(() => new Vector3(), []);
  const current = useMemo(() => new Vector3(), []);
  const { camera } = useThree();

  useEffect(() => {
    const pointerFine = window.matchMedia('(pointer: fine)').matches;
    const light = lightRef.current;
    if (light) light.visible = pointerFine;
    return () => undefined;
  }, []);

  useFrame((state, dt) => {
    const light = lightRef.current;
    if (!light || !light.visible) return;
    if (useSceneStore.getState().gamePhase === 'world') return;
    raycaster.setFromCamera(state.pointer, camera);
    target.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 80);
    current.lerp(target, 1 - Math.exp(-5.5 * Math.min(dt, 0.1)));
    light.position.copy(current);
    light.intensity = 38;
  });

  return (
    <pointLight
      ref={lightRef}
      color="#ffc65c"
      intensity={0}
      distance={200}
      decay={1.7}
      visible={false}
    />
  );
}
