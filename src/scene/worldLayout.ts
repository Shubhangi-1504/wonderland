import { CatmullRomCurve3, Vector3 } from 'three';

/* ------------------------------------------------------------------ */
/* MONEYVERSE intro world layout (Person A).                           */
/* Five scenes laid out along -z, a glowing cyan river down the middle, */
/* rock-arch gates between scenes, one forward-flying camera path.     */
/* ------------------------------------------------------------------ */

// palette
export const NIGHT = '#0a0820';
export const PURPLE_DEEP = '#1d1478';
export const PURPLE = '#9b5cff';
export const CYAN = '#38e8ff';
export const GOLD = '#ffc65c';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* gentle river meander in x as a function of z */
export function riverX(z: number) {
  return 9 * Math.sin(z / 150) + 4 * Math.sin(z / 61);
}

/** z of each gate mouth (between scene i and i+1). Opening centered on river. */
export const GATES_Z = [-200, -600, -1000, -1400];
export const LAKE_CENTER = { x: 0, z: -1560 };

/* Camera & look keyframes (P = 0..4). */
export const CAM_POSES: { pos: [number, number, number]; look: [number, number, number] }[] = [
  { pos: [0, 30, 140], look: [0, 46, -140] },      // Hero
  { pos: [riverX(-360), 26, -340], look: [riverX(-470), 36, -560] }, // Stock Market City
  { pos: [riverX(-760), 24, -740], look: [riverX(-900), 34, -1000] }, // Forest
  { pos: [riverX(-1160), 24, -1140], look: [riverX(-1300), 32, -1420] }, // IPO Island
  { pos: [riverX(-1380), 17, -1370], look: [riverX(-1600), 26, -1650] }, // Lake finale
];

export function buildCurves() {
  const riverPts: Vector3[] = [];
  for (let z = 180; z >= -1850; z -= 50) {
    riverPts.push(new Vector3(riverX(z), 0, z));
  }
  const river = new CatmullRomCurve3(riverPts, false, 'catmullrom', 0.3);

  const cam = new CatmullRomCurve3(
    CAM_POSES.map((k) => new Vector3(...k.pos)),
    false,
    'catmullrom',
    0.35,
  );
  const look = new CatmullRomCurve3(
    CAM_POSES.map((k) => new Vector3(...k.look)),
    false,
    'catmullrom',
    0.35,
  );
  return { river, cam, look };
}

/** Sample a 5-point curve at P in [0..4]. */
export function sampleP(curve: CatmullRomCurve3, p: number, out: Vector3) {
  const u = Math.min(Math.max(p, 0), 4) / 4;
  curve.getPoint(u, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Scene generators                                                    */
/* ------------------------------------------------------------------ */

export interface TowerSpec {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  seed: number;
}

/** Hero city: two rows flanking the river start. */
export function generateHeroCity(): TowerSpec[] {
  const rnd = mulberry32(101);
  const out: TowerSpec[] = [];
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -30 - rnd() * 150;
    const x = side * (34 + rnd() * 150);
    if (Math.abs(x) < 26) continue;
    const h = 18 + Math.pow(rnd(), 2.2) * 80;
    const w = 8 + rnd() * 12;
    out.push({ x, z, w, d: w * (0.7 + rnd() * 0.6), h, seed: rnd() });
  }
  return out;
}

/** Stock Market City: denser band with room cleared for the three HQs. */
export function generateMarketCity(): TowerSpec[] {
  const rnd = mulberry32(202);
  const out: TowerSpec[] = [];
  let guard = 0;
  while (out.length < 64 && guard < 2000) {
    guard++;
    const z = -250 - rnd() * 300;
    const x = (rnd() * 2 - 1) * 180;
    if (Math.abs(x) < 30) continue; // river corridor
    let clear = true;
    for (const c of COMPANY_BUILDINGS) {
      if (Math.abs(x - c.x) < c.w / 2 + 22 && Math.abs(z - c.z) < c.d / 2 + 22) clear = false;
    }
    if (!clear) continue;
    const h = 14 + Math.pow(rnd(), 2.0) * 90;
    const w = 7 + rnd() * 13;
    out.push({ x, z, w, d: w * (0.75 + rnd() * 0.55), h, seed: rnd() });
  }
  return out;
}

/**
 * The three fictional companies (gold-rimmed HQs) — positions exported so
 * Person B can later make them clickable inside the world.
 */
export interface CompanyBuilding {
  id: 'NOVA' | 'AURA' | 'ZENO';
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
}

export const COMPANY_BUILDINGS: CompanyBuilding[] = [
  { id: 'NOVA', x: -64, z: -420, w: 30, h: 130, d: 30 },
  { id: 'AURA', x: 66, z: -408, w: 27, h: 104, d: 26 },
  { id: 'ZENO', x: 2, z: -540, w: 25, h: 82, d: 24 },
];

export function companyCenter(c: CompanyBuilding): [number, number, number] {
  return [c.x, c.h / 2, c.z];
}

/** Small green/red ticker bars mounted on the facade of picking towers. */
export interface TickerSpec {
  x: number;
  y: number;
  z: number;
  len: number;
  rotY: number;
  seed: number;
  red: boolean;
}

export function generateTickers(towers: TowerSpec[], perTower = 2): TickerSpec[] {
  const rnd = mulberry32(303);
  const out: TickerSpec[] = [];
  for (const t of towers) {
    if (t.h < 20) continue;
    for (let i = 0; i < perTower; i++) {
      const onXSide = rnd() > 0.5;
      const y = t.h * (0.25 + rnd() * 0.55);
      const len = Math.min(t.w, t.d) * 0.8;
      if (onXSide) {
        out.push({
          x: t.x + (rnd() > 0.5 ? 1 : -1) * (t.d / 2 + 0.3),
          y,
          z: t.z,
          len,
          rotY: Math.PI / 2,
          seed: rnd(),
          red: rnd() > 0.5,
        });
      } else {
        out.push({
          x: t.x,
          y,
          z: t.z + (rnd() > 0.5 ? 1 : -1) * (t.d / 2 + 0.3),
          len,
          rotY: 0,
          seed: rnd(),
          red: rnd() > 0.5,
        });
      }
    }
  }
  return out;
}

/* Investment Forest ------------------------------------------------- */

export interface TreeSpec {
  x: number;
  z: number;
  h: number;
  seed: number;
  gold: boolean;
}

export function generateForest(count = 130): TreeSpec[] {
  const rnd = mulberry32(404);
  const out: TreeSpec[] = [];
  let guard = 0;
  while (out.length < count && guard < 3000) {
    guard++;
    const side = rnd() > 0.5 ? -1 : 1;
    const z = -640 - rnd() * 320;
    const x = side * (26 + Math.pow(rnd(), 0.9) * 170);
    const h = 14 + rnd() * 26;
    out.push({ x, z, h, seed: rnd(), gold: rnd() > 0.62 });
  }
  return out;
}

/* IPO Island -------------------------------------------------------- */

export const IPO_ISLAND = { x: riverX(-1200), z: -1200, r: 66, y: -4 };

/* Lake finale ------------------------------------------------------- */

export interface CoinSpec {
  x: number;
  y: number;
  z: number;
  phase: number;
}

export function generateCoins(count = 36): CoinSpec[] {
  const rnd = mulberry32(505);
  const out: CoinSpec[] = [];
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 34 + rnd() * 170;
    const x = LAKE_CENTER.x + Math.cos(a) * r;
    const z = LAKE_CENTER.z + Math.sin(a) * r * 0.75;
    out.push({ x, y: -3.2 + rnd() * 1.2, z, phase: rnd() * Math.PI * 2 });
  }
  return out;
}
