import { useEffect, useMemo } from 'react';import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  EdgesGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
} from 'three';
import {
  COMPANY_BUILDINGS,
  generateHeroCity,
  generateMarketCity,
  generateTickers,
  type TowerSpec,
} from '../worldLayout';
import { makeBuildingMaterial, makeTickerMaterial, textLabelTexture } from '../materials';
import { uniforms } from '../sceneStore';

const dummy = new Object3D();

/** Instanced emissive-window towers; reveal + crash live in uniforms.city. */
function buildTowers(specs: TowerSpec[], uniformsCity = uniforms.city) {
  const geometry = new BoxGeometry(1, 1, 1);
  const seeds = new Float32Array(specs.length);
  const dims = new Float32Array(specs.length * 3);
  specs.forEach((t, i) => {
    seeds[i] = t.seed;
    dims[i * 3] = t.w;
    dims[i * 3 + 1] = t.h;
    dims[i * 3 + 2] = t.d;
  });
  geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1));
  geometry.setAttribute('aDim', new InstancedBufferAttribute(dims, 3));
  const material = makeBuildingMaterial(uniformsCity);
  const mesh = new InstancedMesh(geometry, material, specs.length);
  specs.forEach((t, i) => {
    dummy.position.set(t.x, t.h / 2, t.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(t.w, t.h, t.d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

/**
 * Scene 1 — Hero (night city, gold central tower, misty pool, pale moon).
 * Scene 2 — Stock Market City (tickers + the NOVA / AURA / ZENO HQs).
 */
export function City() {
  const built = useMemo(() => {
    const hero = buildTowers(generateHeroCity());
    const market = buildTowers(generateMarketCity());

    /* central gold tower of the hero city */
    const goldTowerGeometry = new CylinderGeometry(7, 11, 170, 8, 1, false);
    const goldTower = new Mesh(
      goldTowerGeometry,
      new MeshStandardMaterial({
        color: '#161233',
        emissive: '#ffc65c',
        emissiveIntensity: 0.85,
        roughness: 0.35,
        metalness: 0.7,
      }),
    );
    goldTower.position.set(44, 85, -110);

    /* misty pool where the river begins */
    const poolGeometry = new CylinderGeometry(85, 85, 0.6, 40);
    const poolMaterial = new MeshStandardMaterial({
      color: '#0c1030',
      emissive: '#38e8ff',
      emissiveIntensity: 0.28,
      roughness: 0.25,
      metalness: 0.5,
    });
    const pool = new Mesh(poolGeometry, poolMaterial);
    pool.position.set(0, 0.2, 110);

    const mistGeometry = new PlaneGeometry(190, 70);
    const mistMaterial = new MeshStandardMaterial({
      transparent: true,
      opacity: 0.16,
      emissive: '#8fd8ff',
      emissiveIntensity: 0.8,
      color: '#04040c',
      depthWrite: false,
    });
    const mist = new Mesh(mistGeometry, mistMaterial);
    mist.position.set(0, 3, 105);
    mist.rotation.x = -Math.PI / 2;

    /* pale moon + halo */
    const moonGeometry = new SphereGeometry(64, 24, 24);
    const moonMaterial = new MeshStandardMaterial({
      color: '#e9e9f4',
      emissive: '#dcdcec',
      emissiveIntensity: 0.85,
      roughness: 0.9,
    });
    const moon = new Mesh(moonGeometry, moonMaterial);
    moon.position.set(0, 330, -620);

    const haloGeometry = new SphereGeometry(96, 16, 16);
    const haloMaterial = new MeshBasicMaterial({
      color: '#b9c8ff',
      transparent: true,
      opacity: 0.07,
    });
    const halo = new Mesh(haloGeometry, haloMaterial);
    halo.position.copy(moon.position);

    /* ticker bars */
    const tickerSpecs = generateTickerSpecs();
    const greenGeo = new BoxGeometry(1, 1, 1);
    const redGeo = new BoxGeometry(1, 1, 1);
    const greenTickerMesh = new InstancedMesh(greenGeo, makeTickerMaterial('#22c55e', uniforms.city, 'mv-ticker-g'), 200);
    const redTickerMesh = new InstancedMesh(redGeo, makeTickerMaterial('#ef4444', uniforms.city, 'mv-ticker-r'), 200);
    const gSeeds: number[] = [];
    const rSeeds: number[] = [];
    let gi = 0;
    let ri = 0;
    tickerSpecs.forEach((tk) => {
      if (tk.red) {
        dummy.position.set(tk.x, tk.y, tk.z);
        dummy.rotation.set(0, tk.rotY, 0);
        dummy.scale.set(tk.len, 0.9, 0.5);
        dummy.updateMatrix();
        redTickerMesh.setMatrixAt(ri, dummy.matrix);
        rSeeds.push(tk.seed);
        ri++;
      } else {
        dummy.position.set(tk.x, tk.y, tk.z);
        dummy.rotation.set(0, tk.rotY, 0);
        dummy.scale.set(tk.len, 0.9, 0.5);
        dummy.updateMatrix();
        greenTickerMesh.setMatrixAt(gi, dummy.matrix);
        gSeeds.push(tk.seed);
        gi++;
      }
    });
    greenTickerMesh.count = gi;
    redTickerMesh.count = ri;
    greenTickerMesh.instanceMatrix.needsUpdate = true;
    redTickerMesh.instanceMatrix.needsUpdate = true;
    greenTickerMesh.geometry.setAttribute('aSeed', new InstancedBufferAttribute(new Float32Array(gSeeds), 1));
    redTickerMesh.geometry.setAttribute('aSeed', new InstancedBufferAttribute(new Float32Array(rSeeds), 1));
    greenTickerMesh.frustumCulled = false;
    redTickerMesh.frustumCulled = false;

    return {
      hero,
      market,
      goldTower,
      pool,
      mist,
      moon,
      halo,
      greenTickerMesh,
      redTickerMesh,
    };
  }, []);

  useEffect(() => {
    return () => {
      built.hero.geometry.dispose();
      built.hero.material.dispose();
      built.market.geometry.dispose();
      built.market.material.dispose();
      built.goldTower.geometry.dispose();
      built.goldTower.material.dispose();
      built.pool.geometry.dispose();
      built.pool.material.dispose();
      built.mist.geometry.dispose();
      built.mist.material.dispose();
      built.moon.geometry.dispose();
      built.moon.material.dispose();
      built.halo.geometry.dispose();
      built.halo.material.dispose();
      built.greenTickerMesh.geometry.dispose();
      built.greenTickerMesh.material.dispose();
      built.redTickerMesh.geometry.dispose();
      built.redTickerMesh.material.dispose();
    };
  }, [built]);

  return (
    <>
      <primitive object={built.hero} />
      <primitive object={built.market} />
      <primitive object={built.goldTower} />
      <primitive object={built.pool} />
      <primitive object={built.mist} />
      <primitive object={built.moon} />
      <primitive object={built.halo} />
      <primitive object={built.greenTickerMesh} />
      <primitive object={built.redTickerMesh} />
      {COMPANY_BUILDINGS.map((c) => (
        <CompanyHQ key={c.id} company={c} />
      ))}
    </>
  );
}

/** gold-rimmed HQ with a glowing name plate (Person B: id + position exported) */
function CompanyHQ({ company: c }: { company: (typeof COMPANY_BUILDINGS)[number] }) {
  const built = useMemo(() => {
    const geometry = new BoxGeometry(c.w, c.h, c.d);
    const body = new Mesh(
      geometry,
      makeBuildingMaterial(uniforms.city),
    );
    body.position.set(c.x, c.h / 2, c.z);

    const edgeGeometry = new EdgesGeometry(geometry);
    const rimMaterial = new LineBasicMaterial({ color: '#ffc65c' });
    const rim = new LineSegments(edgeGeometry, rimMaterial);
    rim.position.copy(body.position);
    rim.scale.setScalar(1.003);

    const labelCanvas = new CanvasTexture(textLabelTexture(c.id, '#ffc65c'));
    const labelGeometry = new CylinderGeometry(c.w * 0.42, c.w * 0.42, 7, 3, 1, true, 0, Math.PI);
    void labelGeometry;
    const label = new Mesh(
      new BoxGeometry(c.w * 0.9, 9, 1),
      new MeshStandardMaterial({
        color: '#0c0a22',
        emissive: '#ffffff',
        emissiveIntensity: 1.2,
        emissiveMap: labelCanvas,
        roughness: 0.5,
      }),
    );
    label.position.set(c.x, c.h + 6, c.z);

    return { body, rim, label, labelCanvas, geometry, edgeGeometry, rimMaterial };
  }, [c]);

  useEffect(() => {
    return () => {
      built.geometry.dispose();
      built.body.material.dispose();
      built.edgeGeometry.dispose();
      built.rimMaterial.dispose();
      built.label.geometry.dispose();
      built.label.material.dispose();
      built.labelCanvas.dispose();
    };
  }, [built]);

  return (
    <>
      <primitive object={built.body} />
      <primitive object={built.rim} />
      <primitive object={built.label} />
    </>
  );
}

function generateTickerSpecs() {
  const towers = generateMarketCity().filter((t) => t.h > 22).slice(0, 46);
  return generateTickers(towers, 2);
}
