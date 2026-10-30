import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';
import { IPO_ISLAND } from '../worldLayout';
import { textLabelTexture } from '../materials';
import { uniforms } from '../sceneStore';

/**
 * Scene 4 — IPO Island: platform with a building, a gold bell, and an
 * "IPO" sign drifting beside the river.
 */
export function IPOIsland() {
  const bell = useRef<Mesh>(null);

  const built = useMemo(() => {
    const rockGeometry = new CylinderGeometry(IPO_ISLAND.r, IPO_ISLAND.r * 0.82, 22, 9);
    const rockMaterial = new MeshStandardMaterial({
      color: '#191233',
      roughness: 0.95,
      flatShading: true,
    });
    const rock = new Mesh(rockGeometry, rockMaterial);
    rock.position.set(IPO_ISLAND.x, IPO_ISLAND.y - 11, IPO_ISLAND.z);

    const platformGeometry = new CylinderGeometry(IPO_ISLAND.r * 0.92, IPO_ISLAND.r * 0.92, 3, 9);
    const platformMaterial = new MeshStandardMaterial({
      color: '#0c1030',
      emissive: '#38e8ff',
      emissiveIntensity: 0.22,
      roughness: 0.35,
      metalness: 0.6,
    });
    const platform = new Mesh(platformGeometry, platformMaterial);
    platform.position.set(IPO_ISLAND.x, IPO_ISLAND.y, IPO_ISLAND.z);

    const buildingGeometry = new BoxGeometry(34, 44, 30);
    const buildingMaterial = new MeshStandardMaterial({
      color: '#131033',
      emissive: '#9b5cff',
      emissiveIntensity: 0.35,
      roughness: 0.7,
      metalness: 0.3,
    });
    const building = new Mesh(buildingGeometry, buildingMaterial);
    building.position.set(IPO_ISLAND.x - 16, IPO_ISLAND.y + 25, IPO_ISLAND.z);

    /* the bell */
    const bellGeometry = new SphereGeometry(3.4, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const bellMaterial = new MeshStandardMaterial({
      color: '#161233',
      emissive: '#ffc65c',
      emissiveIntensity: 1.6,
      roughness: 0.3,
      metalness: 0.8,
    });
    const bellMesh = new Mesh(bellGeometry, bellMaterial);
    bellMesh.position.set(IPO_ISLAND.x + 30, IPO_ISLAND.y + 18, IPO_ISLAND.z + 12);
    const standGeometry = new CylinderGeometry(1.4, 1.4, 20, 8);
    const standMaterial = new MeshStandardMaterial({ color: '#161233', roughness: 0.6 });
    const stand = new Mesh(standGeometry, standMaterial);
    stand.position.set(IPO_ISLAND.x + 30, IPO_ISLAND.y + 10, IPO_ISLAND.z + 12);

    /* "IPO" sign */
    const signCanvas = new CanvasTexture(textLabelTexture('IPO', '#38e8ff'));
    const signGeometry = new BoxGeometry(26, 9, 0.8);
    const signMaterial = new MeshStandardMaterial({
      color: '#0c0a22',
      emissive: '#ffffff',
      emissiveIntensity: 1.3,
      emissiveMap: signCanvas,
      roughness: 0.5,
    });
    const sign = new Mesh(signGeometry, signMaterial);
    sign.position.set(IPO_ISLAND.x + 22, IPO_ISLAND.y + 42, IPO_ISLAND.z - 8);

    return {
      rock,
      platform,
      building,
      bellMesh,
      stand,
      sign,
      signCanvas,
      signMaterial,
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const m of [built.rock, built.platform, built.building, built.bellMesh, built.stand, built.sign]) {
        m.geometry.dispose();
        (m.material as MeshStandardMaterial).dispose();
      }
      built.signCanvas.dispose();
    };
  }, [built]);

  useFrame((state) => {
    // the AI guide rings the bell softly, over and over
    const pulse = Math.pow(Math.max(0, Math.sin(state.clock.elapsedTime * 1.4)), 6);
    if (bell.current) bell.current.rotation.z = pulse * 0.5;
    (built.bellMesh.material as MeshStandardMaterial).emissiveIntensity =
      0.6 + pulse * 1.3 + uniforms.city.uReveal.value * 0.4;
  });

  return (
    <>
      <primitive object={built.rock} />
      <primitive object={built.platform} />
      <primitive object={built.building} />
      <mesh
        ref={bell}
        geometry={built.bellMesh.geometry}
        material={built.bellMesh.material}
        position={built.bellMesh.position}
      />
      <primitive object={built.stand} />
      <primitive object={built.sign} />
    </>
  );
}
