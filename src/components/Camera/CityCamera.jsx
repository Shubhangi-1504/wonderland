import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { COMPANIES } from '../../data/companies';

const DEFAULT_CAMERA_POS = new THREE.Vector3(38, 40, 52);
const DEFAULT_TARGET = new THREE.Vector3(0, 3, 5);

export default function CityCamera({ selectedBuilding }) {
  const controlsRef = useRef();

  const targetPos = useRef(DEFAULT_CAMERA_POS.clone());
  const targetLookAt = useRef(DEFAULT_TARGET.clone());
  const isTransitioning = useRef(false);
  const transitionProgress = useRef(1);

  // When selected building changes, calculate target camera position & look-at
  useEffect(() => {
    transitionProgress.current = 0;
    isTransitioning.current = true;

    if (selectedBuilding && COMPANIES[selectedBuilding]) {
      const b = COMPANIES[selectedBuilding];
      // Offset look-at slightly to the right so the building is framed gracefully
      targetLookAt.current.set(b.cameraTarget[0] + 3.5, b.cameraTarget[1], b.cameraTarget[2]);
      targetPos.current.set(
        b.cameraPosition[0] + 3.5,
        b.cameraPosition[1],
        b.cameraPosition[2]
      );
    } else {
      targetPos.current.copy(DEFAULT_CAMERA_POS);
      targetLookAt.current.copy(DEFAULT_TARGET);
    }
  }, [selectedBuilding]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const dt = Math.min(delta, 0.1);
    const cam = state.camera;

    if (isTransitioning.current) {
      transitionProgress.current = Math.min(1, transitionProgress.current + dt * 1.5);
      
      // Calculate parabolic elevation boost mid-flight for cinematic crane swoop
      const p = transitionProgress.current;
      const arcHeight = Math.sin(p * Math.PI) * 4.0;

      // Smooth exponential damping towards target
      cam.position.x = THREE.MathUtils.damp(cam.position.x, targetPos.current.x, 3.8, dt);
      // Add subtle mid-flight arc in Y
      const desiredY = targetPos.current.y + arcHeight * (1 - p);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, desiredY, 3.8, dt);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, targetPos.current.z, 3.8, dt);

      // Smooth damping for look-at target
      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetLookAt.current.x, 4.2, dt);
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetLookAt.current.y, 4.2, dt);
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, targetLookAt.current.z, 4.2, dt);

      controlsRef.current.update();

      // Check if close enough to finish transition
      if (
        cam.position.distanceTo(targetPos.current) < 0.08 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.08 &&
        p >= 0.95
      ) {
        cam.position.copy(targetPos.current);
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
        isTransitioning.current = false;
      }
    } else if (!selectedBuilding) {
      // Subtle, organic cinematic camera breathing when idle at overview
      const t = state.clock.getElapsedTime();
      const subtleX = Math.sin(t * 0.25) * 0.006;
      const subtleZ = Math.cos(t * 0.3) * 0.006;
      cam.position.x += subtleX;
      cam.position.z += subtleZ;
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={16}
      maxDistance={90}
      minPolarAngle={Math.PI / 12} // Prevent top-down extreme
      maxPolarAngle={Math.PI / 2.25} // Prevent going below ground
      maxAzimuthAngle={Infinity}
      minAzimuthAngle={-Infinity}
      rotateSpeed={0.75}
      zoomSpeed={0.85}
      panSpeed={0.7}
      enablePan={true}
      target={[0, 3, 5]}
    />
  );
}

