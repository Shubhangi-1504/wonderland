import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Vector3 as V3 } from 'three';
import { buildCurves, sampleP } from '../worldLayout';
import {
  dampScroll,
  enterState,
  introTiming,
  scrollRuntime,
  uniforms,
  useSceneStore,
} from '../sceneStore';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';

/**
 * Forward-flying cinematic camera.
 * - Rides along the river: smooth Catmull-Rom position/look curves, P
 *   driven by the scroll runway (0..4), eased with the requested formula.
 * - Intro: slow forward glide while the city lights up tower by tower.
 * - Crash: light positional shake.
 * - Enter the World: 1.5 s dash down the river + light burst, then the
 *   store flips to 'world' and Person B's world takes over.
 */
export function CameraRig() {
  const { camera, gl } = useThree();
  const profile = usePerformanceProfile();
  const curves = useMemo(buildCurves, []);
  const posRef = useRef(new Vector3(0, 30, 140));
  const lookRef = useRef(new Vector3(0, 46, -140));
  const tmpPos = useMemo(() => new V3(), []);
  const tmpLook = useMemo(() => new V3(), []);
  const fwd = useMemo(() => new V3(), []);
  const quant = useRef(-1);

  useEffect(() => {
    camera.near = 1;
    camera.far = 4200;
    (camera as unknown as { fov: number }).fov = 62;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 24);
    const store = useSceneStore.getState();

    /* 1. smooth the scroll progress */
    scrollRuntime.current = dampScroll(scrollRuntime.current, scrollRuntime.target, dt);
    const p = profile.reducedMotion
      ? Math.round(scrollRuntime.current)
      : scrollRuntime.current;

    /* 2. reveal ramp during the intro (tower-by-tower city light-up) */
    if (profile.reducedMotion) {
      uniforms.city.uReveal.value = 1;
    } else if (store.gamePhase === 'intro' && introTiming.start > 0) {
      const e = Math.min((performance.now() / 1000 - introTiming.start) / 2.6, 1);
      uniforms.city.uReveal.value = 1 - Math.pow(1 - e, 2.2);
    }

    /* 3. camera pose */
    sampleP(curves.cam, p, tmpPos);
    sampleP(curves.look, p, tmpLook);

    if (store.gamePhase === 'intro' && !profile.reducedMotion && introTiming.start > 0) {
      // opening glide: camera starts further back and settles into the hero pose
      const e = Math.min((performance.now() / 1000 - introTiming.start) / 2.6, 1);
      const eased = 1 - Math.pow(1 - e, 3);
      tmpPos.z += (1 - eased) * 180;
    }

    if (!profile.reducedMotion) {
      const t = state.clock.elapsedTime;
      tmpPos.x += Math.sin(t * 0.23) * 2.2;
      tmpPos.y += Math.sin(t * 0.31) * 1.2;
    }

    /* 4. crash shake: small, damped, scaled by crashLevel */
    const crash = store.crashLevel;
    if (crash > 0 && !profile.reducedMotion) {
      const t = state.clock.elapsedTime;
      // positional shake (decays quickly so it stays subtle)
      tmpPos.x += Math.sin(t * 13.3) * 0.7 * crash;
      tmpPos.y += Math.sin(t * 17.7) * 0.5 * crash;
      // rotational shake (velocity-damped)
      tmpPos.z += Math.sin(t * 9.1) * 0.004 * crash * 3.0;
    }

    /* 5. enter-the-world dash */
    if (enterState.active) {
      const e = Math.min((performance.now() / 1000 - enterState.start) / 1.5, 1);
      const eased = e * e * (3 - 2 * e);
      fwd.copy(tmpLook).sub(tmpPos).normalize();
      tmpPos.addScaledVector(fwd, eased * 150);
      uniforms.river.uBurst.value = Math.sin(Math.PI * Math.min(e * 1.15, 1)) * 1.6;
      gl.toneMappingExposure = 1 + Math.sin(Math.PI * Math.min(e, 1)) * 0.85;
      if (e >= 1) {
        enterState.active = false;
        useSceneStore.getState().setGamePhase('world');
      }
    } else {
      uniforms.river.uBurst.value *= Math.exp(-4 * dt);
      gl.toneMappingExposure = 1;
    }

    posRef.current.lerp(tmpPos, 1 - Math.exp(-9 * dt));
    lookRef.current.lerp(tmpLook, 1 - Math.exp(-9 * dt));
    camera.position.copy(posRef.current);
    camera.lookAt(lookRef.current);

    if (crash > 0 && !profile.reducedMotion) {
      camera.rotation.z += Math.sin(state.clock.elapsedTime * 9.1) * 0.004 * crash;
    }

    /* 6. keep the store's progress at checkpoint resolution (0.5 steps) */
    const q = Math.round(scrollRuntime.current * 2) / 2;
    if (q !== quant.current) {
      quant.current = q;
      useSceneStore.getState().setProgress(q);
    }

    /* 7. crash tint for shared uniforms read elsewhere (river/bloom) */
    uniforms.city.uCrash.value = crash;
    uniforms.river.uCrash.value = crash;
  });

  return null;
}
