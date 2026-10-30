import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshStandardMaterial,
  ShaderMaterial,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { CYAN, GOLD } from './worldLayout';
import type { uniforms as UniformRegistry } from './sceneStore';

/* ------------------------------------------------------------------ */
/* Instanced building material: emissive window grid; whole towers     */
/* light up (tower-by-tower reveal) via a per-instance aSeed < uReveal */
/* test; crash tints windows crimson and cuts some lights.             */
/* ------------------------------------------------------------------ */
export type CityUniforms = (typeof UniformRegistry)['city'];

export function makeBuildingMaterial(u: CityUniforms): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: '#131033',
    roughness: 0.85,
    metalness: 0.2,
  });

  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = u.uTime;
    shader.uniforms.uReveal = u.uReveal;
    shader.uniforms.uCrash = u.uCrash;
    shader.uniforms.uCool = { value: new Color(CYAN) };
    shader.uniforms.uWarm = { value: new Color(GOLD) };
    shader.uniforms.uCrashTint = { value: new Color('#ff526a') };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec3 aDim;
        attribute float aSeed;
        varying vec3 vObjPos;
        varying vec3 vObjNrm;
        varying float vSeed;
        varying vec3 vDim;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vObjPos = position;
        vObjNrm = normal;
        vSeed = aSeed;
        vDim = aDim;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uReveal;
        uniform float uCrash;
        uniform vec3 uCool;
        uniform vec3 uWarm;
        uniform vec3 uCrashTint;
        varying vec3 vObjPos;
        varying vec3 vObjNrm;
        varying float vSeed;
        varying vec3 vDim;

        float hash12(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          vec3 onrm = normalize(vObjNrm);
          vec2 wuv; vec2 wdims; float isSide = 0.0;
          if (abs(onrm.x) > 0.5) {
            wuv = vec2(vObjPos.z, vObjPos.y) + 0.5;
            wdims = vec2(vDim.z, vDim.y); isSide = 1.0;
          } else if (abs(onrm.z) > 0.5) {
            wuv = vec2(vObjPos.x, vObjPos.y) + 0.5;
            wdims = vec2(vDim.x, vDim.y); isSide = 1.0;
          }
          if (isSide > 0.5) {
            vec2 counts = max(floor(wdims / vec2(1.4, 2.4)), vec2(1.0));
            vec2 scaled = wuv * counts;
            vec2 cell = floor(scaled);
            vec2 fr = fract(scaled);
            float h1 = hash12(cell + vSeed * 137.0);
            float h2 = hash12(cell + 91.7 + vSeed * 61.0);
            vec2 inset = vec2(0.18, 0.3);
            float win = step(inset.x, fr.x) * step(fr.x, 1.0 - inset.x)
                      * step(inset.y, fr.y) * step(fr.y, 1.0 - inset.y);
            float towerOn = step(vSeed, uReveal);
            float lit = step(h1, 0.6);
            float flick = 0.7 + 0.3 * sin(uTime * (0.5 + h2) + h1 * 40.0);
            float flickOut = 1.0 - uCrash * step(0.88, fract(uTime * 3.0 + h1 * 9.0)) * 0.7;
            vec3 wcol = mix(uCool, uWarm, step(0.85, h2));
            wcol = mix(wcol, uCrashTint, uCrash * step(0.35, h2));
            totalEmissiveRadiance += wcol * win * towerOn * lit * flick * flickOut * 2.2;
            totalEmissiveRadiance += uCool * 0.04 * (0.4 + 0.6 * wuv.y);
          }
        }`,
      );
  };
  mat.customProgramCacheKey = () => 'moneyverse-building';
  return mat;
}

/* ------------------------------------------------------------------ */
/* Ticker bars: green/red emissive strips with per-instance blink.     */
/* ------------------------------------------------------------------ */
export function makeTickerMaterial(
  colorHex: string,
  u: CityUniforms,
  cacheKey: string,
): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: '#0c0a22',
    roughness: 0.6,
    metalness: 0.3,
    emissive: colorHex,
  });
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = u.uTime;
    shader.uniforms.uReveal = u.uReveal;
    shader.uniforms.uCrash = u.uCrash;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nattribute float aSeed;\nvarying float vSeed;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvSeed = aSeed;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uTime;\nuniform float uReveal;\nuniform float uCrash;\nvarying float vSeed;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float towerOn = step(vSeed, uReveal);
          float blink = 0.55 + 0.45 * sin(uTime * (1.5 + vSeed * 5.0) + vSeed * 70.0);
          float crashFade = 1.0 - uCrash * 0.55;
          totalEmissiveRadiance = mix(totalEmissiveRadiance, emissive * blink * crashFade, towerOn);
        }`,
      );
  };
  mat.customProgramCacheKey = () => cacheKey;
  return mat;
}

/* ------------------------------------------------------------------ */
/* Tiny red warning lights on each tower, driven by crashLevel.        */
/* Additive blend, so they flash without extra draw cost.              */
/* ------------------------------------------------------------------ */
export function makeWarningLights(u: CityUniforms): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: '#161233',
    emissive: '#ff3b3b',
    emissiveIntensity: 0.1,
  });
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = u.uTime;
    shader.uniforms.uCrash = u.uCrash;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aSeed;\nvarying float vSeed;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uTime;\nuniform float uCrash;\nvarying float vSeed;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `        {
          float flicker = 0.6 + 0.4 * sin(uTime * (0.8 + vSeed * 3.0) + vSeed * 11.0);
          float flash = uCrash * (0.45 + 0.55 * sin(uTime * 3.7 + vSeed * 5.0));
          totalEmissiveRadiance *= (1.0 - uCrash) + uCrash * (0.5 + 0.5 * flicker);
          totalEmissiveRadiance = mix(totalEmissiveRadiance, emissive * (0.9 + flash), uCrash);
        }`,
      );
  };
  mat.customProgramCacheKey = () => 'moneyverse-warning-lights';
  return mat;
}

/* ------------------------------------------------------------------ */
/* River ribbon shader: cyan streaks scrolling along the length.       */
/* ------------------------------------------------------------------ */
export function makeRiverMaterial(r: (typeof UniformRegistry)['river']): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTime: r.uTime,
      uFlow: r.uFlow,
      uBurst: r.uBurst,
      uCrash: r.uCrash,
    },
    vertexShader: `      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `      uniform float uTime;
      uniform float uFlow;
      uniform float uBurst;
      uniform float uCrash;
      varying vec2 vUv;

      void main() {
        // vUv.x = along the river (0 at the source), vUv.y = across
        float edge = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
        float t = vUv.x * 80.0 - uTime * 1.4;

        float streak = 0.0;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          float s = fract(t * (0.55 + fi * 0.4) + fi * 0.37);
          streak += pow(1.0 - abs(s * 2.0 - 1.0), 6.0) * (1.0 - fi * 0.24);
        }
        float shimmer = 0.8 + 0.2 * sin(vUv.y * 30.0 + uTime * 2.0);

        vec3 cyan = vec3(0.22, 0.91, 1.0);
        vec3 white = vec3(0.9, 0.98, 1.0);
        vec3 gold = vec3(1.0, 0.78, 0.36);
        vec3 col = cyan * (0.5 + streak * 1.45 * shimmer);
        col = mix(col, white, streak * 0.4);
        col += gold * pow(streak, 2.6) * 0.5;
        col = mix(col, vec3(1.0, 0.32, 0.42), uCrash * 0.85);

        float alpha = edge * (0.55 + streak * 0.5) * uFlow;
        gl_FragColor = vec4(col * (uFlow + uBurst * 2.2), alpha + uBurst * 0.3);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });
}

/* ------------------------------------------------------------------ */
/* Canvas textures (all procedural, no external assets)                */
/* ------------------------------------------------------------------ */
export function textLabelTexture(text: string, color = '#ffc65c', sub = ''): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = sub ? 256 : 160;
  const g = c.getContext('2d')!;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '800 96px Arial, sans-serif';
  g.shadowColor = color;
  g.shadowBlur = 26;
  g.fillStyle = color;
  g.fillText(text, c.width / 2, sub ? c.height / 2 - 34 : c.height / 2);
  if (sub) {
    g.font = '600 40px Arial, sans-serif';
    g.shadowBlur = 12;
    g.fillStyle = '#9ecbff';
    g.fillText(sub, c.width / 2, c.height / 2 + 52);
  }
  return c;
}

export function softGlowTexture(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return c;
}
