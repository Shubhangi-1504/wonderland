import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '../sceneStore';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import { buildCurves, GOLD } from '../worldLayout';
import { makeRiverMaterial, softGlowTexture } from '../materials';
import { uniforms, scrollRuntime } from '../sceneStore';

/**
 * The glowing cyan river — one ribbon mesh along the whole camera path,
 * connecting all five scenes, plus a light spray of particles.
 */
export function River({ sprayCount = 200 }: { sprayCount?: number }) {
  const built = useMemo(() => {
    const { river } = buildCurves();

    /* ribbon geometry following the curve, 2 verts per sample */
    const samples = 640;
    const width = 15;
    const positions = new Float32Array(samples * 2 * 3);
    const uvs = new Float32Array(samples * 2 * 2);
    const indices: number[] = [];
    const p = new Vector3();
    const tangent = new Vector3();
    const up = new Vector3(0, 1, 0);
    const perp = new Vector3();
    for (let i = 0; i < samples; i++) {
      const u = i / (samples - 1);
      river.getPoint(u, p);
      river.getTangent(u, tangent);
      perp.crossVectors(tangent, up).normalize();
      const half = width / 2;
      // left vertex
      positions.set([p.x - perp.x * half, 0.5, p.z - perp.z * half], i * 6);
      // right vertex
      positions.set([p.x + perp.x * half, 0.5, p.z + perp.z * half], i * 6 + 3);
      uvs.set([u, 0], i * 4);
      uvs.set([u, 1], i * 4 + 2);
      if (i < samples - 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const material = makeRiverMaterial(uniforms.river);

    /* spray particles advancing along the curve */
    const sprayGeo = new BufferGeometry();
    const sprayPos = new Float32Array(sprayCount * 3);
    const sprayCol = new Float32Array(sprayCount * 3);
    const params: { t: number; speed: number; off: Vector3 }[] = [];
    const tintCyan = new Color('#8ceaff');
    const tintWhite = new Color('#eafeff');
    const tintGold = new Color(GOLD);
    for (let i = 0; i < sprayCount; i++) {
      params.push({
        t: Math.random(),
        speed: 0.015 + Math.random() * 0.04,
        off: new Vector3(
          (Math.random() - 0.5) * width * 0.7,
          (Math.random() - 0.5) * 1.6 + 1,
          (Math.random() - 0.5) * width * 0.7,
        ),
      });
      const tint =
        Math.random() < 0.12 ? tintGold : Math.random() < 0.4 ? tintWhite : tintCyan;
      sprayCol.set([tint.r, tint.g, tint.b], i * 3);
    }
    sprayGeo.setAttribute('position', new BufferAttribute(sprayPos, 3));
    sprayGeo.setAttribute('color', new BufferAttribute(sprayCol, 3));
    const sprayMat = new PointsMaterial({
      size: 1.6,
      map: new CanvasTexture(softGlowTexture()),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const spray = new Points(sprayGeo, sprayMat);
    spray.frustumCulled = false;

    return {
      geometry,
      material,
      spray,
      sprayParams: params,
      sprayPositions: sprayPos,
      curve: river,
    };
  }, [sprayCount]);

  useEffect(() => {
    return () => {
      built.geometry.dispose();
      built.material.dispose();
      built.spray.geometry.dispose();
      (built.spray.material as PointsMaterial).dispose();
    };
  }, [built]);

  const tmp = useMemo(() => new Vector3(), []);
  const uniformDriftRef = useRef(1);

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime;
    built.material.uniforms.uTime.value = time;
    // river slows while standing still in a scene so the world feels alive but calm
    const drift = 0.35 + Math.min(Math.abs(scrollRuntime.target - scrollRuntime.current) * 2.2, 1) * 0.65;
    uniformDriftRef.current = drift;
    // crash: river slows and the streaks flicker toward red
    const crash = useSceneStore.getState().crashLevel;
    uniforms.river.uFlow.value = drift * (1 - crash * 0.55);
    void dt;
    for (let i = 0; i < built.sprayParams.length; i++) {
      const s = built.sprayParams[i];
      const tt = (s.t + time * s.speed) % 1;
      built.curve.getPoint(tt, tmp);
      built.sprayPositions[i * 3] = tmp.x + s.off.x;
      built.sprayPositions[i * 3 + 1] = tmp.y + s.off.y;
      built.sprayPositions[i * 3 + 2] = tmp.z + s.off.z;
    }
    (built.spray.geometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
  });


  return (
    <>
      <mesh geometry={built.geometry} material={built.material} />
      <primitive object={built.spray} />
    </>
  );
}
