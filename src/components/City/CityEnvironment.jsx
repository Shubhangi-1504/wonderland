import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Ambient Floating Light Motes / Sunlit Particles
function AmbientParticles({ count = 60 }) {
  const pointsRef = useRef();

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r1 = Math.abs(Math.sin(i * 12.9898 + 78.233)) % 1;
      const r2 = Math.abs(Math.cos(i * 43.123 + 23.456)) % 1;
      const r3 = Math.abs(Math.sin(i * 93.321 + 11.111)) % 1;
      const r4 = Math.abs(Math.cos(i * 67.891 + 54.321)) % 1;
      pos[i * 3 + 0] = (r1 - 0.5) * 80;
      pos[i * 3 + 1] = 2 + r2 * 22;
      pos[i * 3 + 2] = (r3 - 0.5) * 80;
      ph[i] = r4 * Math.PI * 2;
    }
    return [pos, ph];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime() * 0.8;
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const origY = posAttr.getY(i);
      const newY = origY + Math.sin(t + phases[i]) * 0.03;
      posAttr.setY(i, newY);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color="#38bdf8"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function CityEnvironment() {
  return (
    <group>
      {/* ======================================================== */}
      {/* LIGHTING SETUP                                           */}
      {/* ======================================================== */}
      {/* Ambient Light for balanced overall illumination */}
      <ambientLight intensity={0.65} color="#e0f2fe" />

      {/* Hemisphere Light: sky cyan to warm slate ground bounce */}
      <hemisphereLight
        skyColor="#38bdf8"
        groundColor="#0f172a"
        intensity={0.6}
      />

      {/* Main Directional Sun with Soft Shadows */}
      <directionalLight
        position={[35, 55, 30]}
        intensity={1.4}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={140}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0005}
      />

      {/* Warm Sun Rim Light from opposite angle */}
      <directionalLight
        position={[-30, 25, -35]}
        intensity={0.5}
        color="#fdba74"
      />

      {/* Soft Cyan Under-Fill Light */}
      <directionalLight
        position={[0, -20, 20]}
        intensity={0.2}
        color="#0284c7"
      />

      {/* ======================================================== */}
      {/* GROUND ISLAND & DISTRICT PLATFORMS                       */}
      {/* ======================================================== */}
      {/* Main City Island Base Slab */}
      <mesh position={[0, -1.0, 5]} receiveShadow>
        <boxGeometry args={[96, 2.0, 96]} />
        <meshStandardMaterial color="#0b1120" roughness={0.9} />
      </mesh>

      {/* Island Beveled Border Frame */}
      <mesh position={[0, -0.05, 5]} receiveShadow>
        <boxGeometry args={[98, 0.4, 98]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ground Pavement Deck */}
      <mesh position={[0, 0, 5]} receiveShadow>
        <boxGeometry args={[94, 0.1, 94]} />
        <meshStandardMaterial color="#111827" roughness={0.85} />
      </mesh>

      {/* ======================================================== */}
      {/* PARK LAWNS & GREEN SPACES                                */}
      {/* ======================================================== */}
      {/* Southwest Park Lawn (Near GreenEnergy) */}
      <mesh position={[-16, 0.04, 18]} receiveShadow>
        <boxGeometry args={[11, 0.12, 16]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>

      {/* Southeast Park Lawn (Near FoodSphere) */}
      <mesh position={[16, 0.04, 18]} receiveShadow>
        <boxGeometry args={[11, 0.12, 16]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>

      {/* Northwest Park Lawn (Behind GreenEnergy) */}
      <mesh position={[-30, 0.04, -10]} receiveShadow>
        <boxGeometry args={[12, 0.12, 16]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>

      {/* Northeast Park Lawn (Behind FoodSphere) */}
      <mesh position={[30, 0.04, -10]} receiveShadow>
        <boxGeometry args={[12, 0.12, 16]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>

      {/* Floating Sparkle Particles */}
      <AmbientParticles count={70} />
    </group>
  );
}
