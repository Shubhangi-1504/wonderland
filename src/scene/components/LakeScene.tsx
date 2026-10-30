import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Raycaster,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { generateCoins, LAKE_CENTER } from '../worldLayout';
import { uniforms } from '../sceneStore';


/**
 * Scene 5 — Finale: moonlit lake spread with floating gold coins,
 * a moon light-pillar on the water, and coins that glide away from
 * the cursor like ghosts dodging a hand.
 */
export function LakeScene({ reducedMotion }: { reducedMotion: boolean }) {
  const setup = useMemo(() => {
    /* lake surface */
    const lakeGeometry = new CylinderGeometry(320, 320, 0.8, 48);
    const lakeMaterial = new MeshStandardMaterial({
      color: '#0d0b26',
      emissive: '#122052',
      emissiveIntensity: 0.3,
      roughness: 0.18,
      metalness: 0.85,
    });
    const lake = new Mesh(lakeGeometry, lakeMaterial);
    lake.position.set(LAKE_CENTER.x, -6, LAKE_CENTER.z);

    /* moon behind the lake, low and close */
    const moonGeometry = new SphereGeometry(40, 20, 20);
    const moonMaterial = new MeshStandardMaterial({
      color: '#e9e9f4',
      emissive: '#dcdcec',
      emissiveIntensity: 0.9,
      roughness: 0.9,
    });
    const moon = new Mesh(moonGeometry, moonMaterial);
    moon.position.set(0, 120, LAKE_CENTER.z - 420);

    /* soft halo around the moon */
    const haloGeometry = new SphereGeometry(56, 14, 14);
    const haloMaterial = new MeshBasicMaterial({
      color: '#b9c8ff',
      transparent: true,
      opacity: 0.07,
    });
    const halo = new Mesh(haloGeometry, haloMaterial);
    halo.position.copy(moon.position);

    /* light pillar rising off the water */
    const pillarGeometry = new CylinderGeometry(5, 3, 130, 12, 1, true);
    const pillarMaterial = new ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float alpha = smoothstep(0.0, 0.55, vUv.y) * (0.55 + 0.25 * sin(uTime * 1.8 + vUv.y * 9.0));
          gl_FragColor = vec4(0.86, 0.9, 1.0, alpha * 0.4);
        }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const pillar = new Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(0, 60, LAKE_CENTER.z - 130);

    /* gold coins */
    const coinGeometry = new CylinderGeometry(2.1, 2.1, 0.55, 18);
    const coinMaterial = new MeshStandardMaterial({
      color: '#171131',
      emissive: '#ffc65c',
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.85,
    });

    return {
      lake,
      lakeGeometry,
      lakeMaterial,
      moon,
      moonGeometry,
      moonMaterial,
      halo,
      haloGeometry,
      haloMaterial,
      pillar,
      pillarGeometry,
      pillarMaterial,
      coinGeometry,
      coinMaterial,
    };
  }, []);

  /* coin meshes with home + velocity, dodging the cursor */
  const coins = useMemo(() => {
    return generateCoins(36).map((spec) => ({
      home: new Vector3(spec.x, spec.y, spec.z),
      pos: new Vector3(spec.x, spec.y, spec.z),
      vel: new Vector3(),
      phase: spec.phase,
      mesh: null as Mesh | null,
    }));
  }, []);
  const coinStates = useRef(coins);

  const raycaster = useMemo(() => new Raycaster(), []);
  const pointerVec = useMemo(() => new Vector2(), []);
  const cursorWorld = useMemo(() => new Vector3(), []);
  const dir = useMemo(() => new Vector3(), []);
  const { camera } = useThree();

  useEffect(() => {
    return () => {
      setup.lakeGeometry.dispose();
      setup.lakeMaterial.dispose();
      setup.moonGeometry.dispose();
      setup.moonMaterial.dispose();
      setup.haloGeometry.dispose();
      setup.haloMaterial.dispose();
      setup.pillarGeometry.dispose();
      setup.pillarMaterial.dispose();
      setup.coinGeometry.dispose();
      setup.coinMaterial.dispose();
      void uniforms; // shared singleton, not owned here
    };
  }, [setup]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 24);
    const t = state.clock.elapsedTime;
    setup.pillarMaterial.uniforms.uTime.value = t;

    /* cursor position on the lake plane */
    if (!reducedMotion) {
      pointerVec.set(state.pointer.x, state.pointer.y);
      raycaster.setFromCamera(pointerVec, camera);
      const o = raycaster.ray.origin;
      const d = raycaster.ray.direction;
      if (Math.abs(d.y) > 1e-4) {
        const s = (-5.5 - o.y) / d.y;
        if (s > 0) cursorWorld.set(o.x + d.x * s, 0, o.z + d.z * s);
      }
    }
    dir.set(0, 0, 0);

    for (const c of coinStates.current) {
      const mesh = c.mesh;
      if (reducedMotion || !mesh) {
        continue;
      }
      const dx = c.pos.x - cursorWorld.x;
      const dz = c.pos.z - cursorWorld.z;
      const dist2 = dx * dx + dz * dz;
      if (dist2 < 3600) {
        // within 60 units of the cursor hand: glide away
        const dist = Math.sqrt(dist2) + 1e-3;
        const force = ((60 - dist) / 60) * 46;
        c.vel.x += (dx / dist) * force * dt;
        c.vel.z += (dz / dist) * force * dt;
      }
      /* spring home + damping + bob */
      c.vel.x -= (c.pos.x - c.home.x) * 1.6 * dt;
      c.vel.z -= (c.pos.z - c.home.z) * 1.6 * dt;
      c.vel.multiplyScalar(Math.exp(-2.2 * dt));
      c.pos.x += c.vel.x * dt;
      c.pos.z += c.vel.z * dt;
      const speed = c.vel.length();
      const roll = Math.min(speed * 0.06, 0.5);
      mesh.position.set(c.pos.x, c.home.y + Math.sin(t * 1.1 + c.phase) * 0.5, c.pos.z);
      mesh.rotation.x = -Math.PI / 2 + Math.sin(t * 0.9 + c.phase) * 0.22 + roll;
      mesh.rotation.z = Math.cos(t * 0.8 + c.phase) * 0.18;
    }
  });

  return (
    <>
      <mesh geometry={setup.lake.geometry} material={setup.lake.material} position={setup.lake.position} />
      <mesh geometry={setup.moon.geometry} material={setup.moon.material} position={setup.moon.position} />
      <mesh geometry={setup.halo.geometry} material={setup.halo.material} position={setup.halo.position} />
      <mesh geometry={setup.pillar.geometry} material={setup.pillarMaterial} position={setup.pillar.position} />
      {coinStates.current.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) c.mesh = el;
          }}
          geometry={setup.coinGeometry}
          material={setup.coinMaterial}
          position={c.home}
        />
      ))}
    </>
  );
}
