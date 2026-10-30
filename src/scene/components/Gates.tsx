import { useEffect, useMemo } from 'react';
import { SphereGeometry, TorusGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { GATES_Z, riverX } from '../worldLayout';

const dummy = new Object3D();

/**
 * Rock-arch gates between scenes. The opening is centered on the river so
 * the camera physically flies through them — scenes connect through
 * geometry, never through gradient fades.
 */
export function Gates() {
  const built = useMemo(() => {
    const archGeometry = new TorusGeometry(52, 13, 7, 20, Math.PI * 2);
    const archMaterial = new MeshStandardMaterial({
      color: '#1b1430',
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
    const rimGeometry = new TorusGeometry(40, 0.9, 6, 48);
    const rimMaterial = new MeshStandardMaterial({
      color: '#0c0a22',
      emissive: '#38e8ff',
      emissiveIntensity: 1.7,
      roughness: 0.4,
    });
    const arches = GATES_Z.map((z) => ({ z, x: riverX(z) }));
    const archMesh = new InstancedMesh(archGeometry, archMaterial, arches.length);
    const rimMesh = new InstancedMesh(rimGeometry, rimMaterial, arches.length);
    arches.forEach((a, i) => {
      dummy.position.set(a.x, 30, a.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      archMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(a.x, 30, a.z + 1.5);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      rimMesh.setMatrixAt(i, dummy.matrix);
    });
    archMesh.instanceMatrix.needsUpdate = true;
    rimMesh.instanceMatrix.needsUpdate = true;

    /* boulder clusters accenting each arch */
    const boulderGeometry = new SphereGeometry(1, 6, 5);
    const boulderMaterial = new MeshStandardMaterial({
      color: '#241b3e',
      roughness: 1,
      flatShading: true,
    });
    const perGate = 9;
    const boulders = new InstancedMesh(boulderGeometry, boulderMaterial, arches.length * perGate);
    let n = 0;
    for (const a of arches) {
      for (let i = 0; i < perGate; i++) {
        const ang = -0.6 + (i / (perGate - 1)) * (Math.PI + 1.2); // upper arc only
        const rr = 50 + Math.random() * 16;
        const s = 5 + Math.random() * 9;
        dummy.position.set(
          a.x + Math.cos(ang) * rr,
          30 + Math.sin(ang) * rr + s * 0.4,
          a.z + (Math.random() - 0.5) * 14,
        );
        dummy.scale.set(s, s * 0.8, s);
        dummy.rotation.set(Math.random(), Math.random(), Math.random());
        dummy.updateMatrix();
        boulders.setMatrixAt(n++, dummy.matrix);
      }
    }
    boulders.instanceMatrix.needsUpdate = true;

    return {
      archMesh,
      rimMesh,
      boulders,
      disposables: [archGeometry, archMaterial, rimGeometry, rimMaterial, boulderGeometry, boulderMaterial],
    };
  }, []);

  useEffect(() => {
    return () => {
      built.archMesh.dispose();
      built.rimMesh.dispose();
      built.boulders.dispose();
      built.disposables.forEach((d) => d.dispose());
    };
  }, [built]);

  return (
    <>
      <primitive object={built.archMesh} />
      <primitive object={built.rimMesh} />
      <primitive object={built.boulders} />
    </>
  );
}
