import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Points,
  PointsMaterial,
  ShaderMaterial,
} from 'three';
import { softGlowTexture } from '../materials';

/**
 * Rising cyan motes in additive blending + a soft starfield.
 * Particle motion is driven by uTime so reduced-motion can freeze the drift.
 */
export function AtmosphereParticles({ count = 600 }: { count: number }) {
  const points = useMemo(() => {
    const geometry = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 520;
      pos[i * 3 + 1] = Math.random() * 220 - 10;
      pos[i * 3 + 2] = 200 - Math.random() * 2100;
      rand[i * 4] = Math.random();
      rand[i * 4 + 1] = Math.random() * Math.PI * 2;
      rand[i * 4 + 2] = 0.9 + Math.random() * 3.4; // size
      rand[i * 4 + 3] = Math.random();
    }
    geometry.setAttribute('position', new BufferAttribute(pos, 3));
    geometry.setAttribute('aRand', new BufferAttribute(rand, 4));

    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute vec4 aRand;
        uniform float uTime;
        varying float vTint;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float rise = mod(uTime * (1.4 + aRand.x * 2.4) + aRand.x * 240.0, 240.0);
          p.y += rise - 10.0;
          p.x += sin(uTime * 0.22 + aRand.y) * 3.5;
          float life = rise / 240.0;
          vAlpha = smoothstep(0.0, 0.12, life) * smoothstep(1.0, 0.85, life);
          vTint = aRand.w;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aRand.z * (260.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying float vTint;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float disc = smoothstep(0.5, 0.1, d);
          vec3 cyan = vec3(0.22, 0.91, 1.0);
          vec3 purple = vec3(0.61, 0.36, 1.0);
          vec3 gold = vec3(1.0, 0.78, 0.36);
          vec3 col = mix(cyan, purple, step(0.7, vTint));
          col = mix(col, gold, step(0.93, vTint));
          float sparkle = 0.55 + 0.45 * sin(vTint * 70.0);
          gl_FragColor = vec4(col, disc * vAlpha * 0.42 * sparkle);
        }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const pts = new Points(geometry, material);
    pts.frustumCulled = false;
    return { pts, material, geometry };
  }, [count]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      points.material.dispose();
    },
    [points],
  );

  useFrame((state) => {
    points.material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <primitive object={points.pts} />;
}

/** Distant stars — few, cheap, soft sprites. */
export function Starfield({ count = 500 }: { count: number }) {
  const built = useMemo(() => {
    const geometry = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const color = new Float32Array(count * 3);
    const tintA = new Color('#c9d6ff');
    const tintB = new Color('#8f7fff');
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random() * 0.9 + 0.05;
      const theta = u * Math.PI * 2;
      const phi = Math.acos(1 - 2 * v);
      const r = 2000 * (0.7 + Math.random() * 0.3);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.85 + 40;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const tint = Math.random() > 0.8 ? tintB : tintA;
      color.set([tint.r, tint.g, tint.b], i * 3);
    }
    geometry.setAttribute('position', new BufferAttribute(pos, 3));
    geometry.setAttribute('color', new BufferAttribute(color, 3));
    const material = new PointsMaterial({
      size: 7,
      map: new CanvasTexture(softGlowTexture()),
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const pts = new Points(geometry, material);
    pts.frustumCulled = false;
    return { geometry, material, pts };
  }, [count]);

  useEffect(
    () => () => {
      built.geometry.dispose();
      built.material.dispose();
    },
    [built],
  );

  return <primitive object={built.pts} />;
}
