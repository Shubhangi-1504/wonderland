import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

// Single stylized cloud cluster
function CloudCluster({ initialPos, speed = 1.0, scale = 1.0 }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);
    // Smooth horizontal wind drift
    groupRef.current.position.x += dt * speed * 1.8;
    // Gentle floating atmospheric bobbing on Y axis
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = initialPos[1] + Math.sin(t * 0.5 + initialPos[0]) * 0.45;
    // Subtle organic wind rotation
    groupRef.current.rotation.y = Math.sin(t * 0.15 + initialPos[0]) * 0.08;

    // Wrap around boundaries
    if (groupRef.current.position.x > 75) {
      groupRef.current.position.x = -75;
    }
  });

  return (
    <group ref={groupRef} position={initialPos} scale={scale}>
      {/* Central Cloud Body */}
      <mesh castShadow={false}>
        <sphereGeometry args={[2.4, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.88} />
      </mesh>
      {/* Flanking Puffs */}
      <mesh position={[-1.8, -0.4, 0.4]}>
        <sphereGeometry args={[1.8, 7, 7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.9, -0.3, -0.3]}>
        <sphereGeometry args={[1.7, 7, 7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.2, 0.8, -0.4]}>
        <sphereGeometry args={[1.6, 7, 7]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

export default function Clouds() {
  const clouds = useMemo(
    () => [
      { pos: [-40, 24, -20], speed: 0.9, scale: 1.2 },
      { pos: [-10, 28, -35], speed: 1.1, scale: 1.4 },
      { pos: [25, 26, -15], speed: 0.8, scale: 1.1 },
      { pos: [-35, 25, 10], speed: 1.0, scale: 1.3 },
      { pos: [5, 29, 20], speed: 0.7, scale: 1.5 },
      { pos: [40, 26, 25], speed: 1.2, scale: 1.0 },
      { pos: [-20, 31, 35], speed: 0.9, scale: 1.2 },
    ],
    []
  );

  return (
    <group>
      {clouds.map((c, i) => (
        <CloudCluster
          key={i}
          initialPos={c.pos}
          speed={c.speed}
          scale={c.scale}
        />
      ))}
    </group>
  );
}
