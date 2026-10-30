import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  ConeGeometry,
  CylinderGeometry,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TorusGeometry,
} from 'three';
import { generateForest } from '../worldLayout';
import { uniforms } from '../sceneStore';

const dummy = new Object3D();

/**
 * Scene 3 — Investment Forest: glowing cyan and gold trees lining the
 * river, plus a slowly turning growth wheel.
 */
export function Forest() {
  const treeRefs = useRef<{ cyan: InstancedMesh; gold: InstancedMesh } | null>(null);
  const built = useMemo(() => {
    const trees = generateForest(130);
    const cyanTrees = trees.filter((t) => !t.gold);
    const goldTrees = trees.filter((t) => t.gold);

    const leafGeo = new ConeGeometry(1, 1, 7);
    const cyanLeafMat = new MeshStandardMaterial({
      color: '#0c1030',
      emissive: '#38e8ff',
      emissiveIntensity: 0.75,
      roughness: 0.8,
    });
    const goldLeafMat = new MeshStandardMaterial({
      color: '#161233',
      emissive: '#ffc65c',
      emissiveIntensity: 0.8,
      roughness: 0.8,
    });
    const trunkGeo = new CylinderGeometry(1, 1, 1, 5);
    const trunkMat = new MeshStandardMaterial({ color: '#0c0a22', roughness: 1 });

    const placeLeaves = (mesh: InstancedMesh, subset: typeof trees) => {
      subset.forEach((t, i) => {
        dummy.position.set(t.x, t.h * 0.55 + 4, t.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(t.h * 0.32, t.h * 0.85, t.h * 0.32);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
    };
    const placeTrunks = (subset: typeof trees) => {
      const mesh = new InstancedMesh(trunkGeo, trunkMat, subset.length);
      subset.forEach((t, i) => {
        dummy.position.set(t.x, t.h * 0.16, t.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(t.h * 0.05, t.h * 0.42, t.h * 0.05);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      return mesh;
    };

    const cyanMesh = new InstancedMesh(leafGeo, cyanLeafMat, Math.max(cyanTrees.length, 1));
    cyanMesh.count = cyanTrees.length;
    const goldMesh = new InstancedMesh(leafGeo, goldLeafMat, Math.max(goldTrees.length, 1));
    goldMesh.count = goldTrees.length;
    placeLeaves(cyanMesh, cyanTrees);
    placeLeaves(goldMesh, goldTrees);
    const trunks = placeTrunks(trees);

    /* the wheel — a slowly turning grow-wheel standing beside the river */
    const wheel = new Mesh(
      new TorusGeometry(26, 1.7, 8, 40),
      new MeshStandardMaterial({
        color: '#161233',
        emissive: '#ffc65c',
        emissiveIntensity: 1.4,
        roughness: 0.4,
        metalness: 0.5,
      }),
    );
    wheel.position.set(-44, 30, -860);

    const spokes: Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const spoke = new Mesh(
        new CylinderGeometry(0.7, 0.7, 52, 6),
        wheel.material as MeshStandardMaterial,
      );
      spoke.rotation.z = (i / 8) * Math.PI;
      wheel.add(spoke);
      spokes.push(spoke);
    }
    void spokes;

    return { cyanMesh, goldMesh, trunks, wheel };
  }, []);

  useEffect(() => {
    treeRefs.current = { cyan: built.cyanMesh, gold: built.goldMesh };
    return () => {
      built.cyanMesh.geometry.dispose();
      built.cyanMesh.material.dispose();
      built.goldMesh.geometry.dispose();
      built.goldMesh.material.dispose();
      built.trunks.geometry.dispose();
      built.trunks.material.dispose();
      built.wheel.geometry.dispose();
      built.wheel.material.dispose();
    };
  }, [built, treeRefs]);

  useFrame((_state, dt) => {
    built.wheel.rotation.z += dt * 0.12;
    // leaves glow pulse tied to the city reveal
    const reveal = uniforms.city.uReveal.value;
    (built.cyanMesh.material as MeshStandardMaterial).emissiveIntensity = 0.3 + reveal * 0.55;
    (built.goldMesh.material as MeshStandardMaterial).emissiveIntensity = 0.35 + reveal * 0.5;
  });

  return (
    <>
      <primitive object={built.cyanMesh} />
      <primitive object={built.goldMesh} />
      <primitive object={built.trunks} />
      <primitive object={built.wheel} />
    </>
  );
}
