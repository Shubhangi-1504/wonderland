import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Realistic Multi-tiered Droplet Particle Spray
function WaterSpray() {
  const count = 64;
  const meshRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const isOuterJet = i >= 32;
      const angle = (i / 32) * Math.PI * 2;
      const r1 = Math.abs(Math.sin(i * 12.9898 + 78.233)) % 1;
      const r2 = Math.abs(Math.cos(i * 43.123 + 23.456)) % 1;
      const r3 = Math.abs(Math.sin(i * 93.321 + 11.111)) % 1;
      const speed = isOuterJet ? 1.6 + r1 * 0.4 : 2.5 + r1 * 0.6;
      const spread = isOuterJet ? 2.2 + r2 * 0.6 : 0.7 + r2 * 0.5;
      const phase = r3 * Math.PI * 2;
      temp.push({ angle, speed, spread, phase, isOuterJet });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * 2.4;

    particles.forEach((p, i) => {
      // Realistic ballistic gravity trajectory
      const t = (time + p.phase) % 1;
      const radius = t * p.spread;
      const x = Math.cos(p.angle) * radius;
      const z = Math.sin(p.angle) * radius;
      
      // Ballistic arc: y = y0 + v*t - 0.5*g*t^2
      const startY = p.isOuterJet ? 1.6 : 2.1;
      const y = startY + p.speed * t - 3.4 * t * t;

      dummy.position.set(x, Math.max(0.7, y), z);
      // Particles spray small, expand, then atomize at peak
      const scale = (1 - t * 0.7) * (p.isOuterJet ? 0.12 : 0.15);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
    </instancedMesh>
  );
}

// Single expanding concentric water ripple on the pool surface
function SingleRipple({ offset = 0 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = (t * 0.9 + offset) % 1.8;
    const progress = phase / 1.8;
    const scale = 0.8 + progress * 2.8;
    meshRef.current.scale.set(scale, 1, scale);
    meshRef.current.material.opacity = (1 - progress) * 0.45;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 0.88, 32]} />
      <meshBasicMaterial color="#7dd3fc" transparent opacity={0.3} />
    </mesh>
  );
}

function WaterRipples() {
  return (
    <group position={[0, 0.87, 0]}>
      <SingleRipple offset={0} />
      <SingleRipple offset={0.6} />
      <SingleRipple offset={1.2} />
    </group>
  );
}

// Stylized Park Bench
function ParkBench({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation} scale={0.7}>
      {/* Bench Legs */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, 0.25, 0]}>
          <boxGeometry args={[0.08, 0.5, 0.5]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      ))}
      {/* Wooden Seat Slats */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.8, 0.08, 0.45]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
      {/* Wooden Backrest */}
      <mesh position={[0, 0.75, -0.2]}>
        <boxGeometry args={[1.8, 0.4, 0.08]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Stylized Plaza Lamppost
function Lamppost({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 0.4, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 3.2, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Curved Arm */}
      <mesh position={[0, 3.4, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Glowing Lamp Luminaire */}
      <mesh position={[0, 3.25, 0]}>
        <cylinderGeometry args={[0.2, 0.12, 0.25, 8]} />
        <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 3.1, 0]} color="#fef08a" distance={7} intensity={1.5} />
    </group>
  );
}

export default function PlazaFountain({ position = [0, 0, 5] }) {
  const waterRef = useRef();

  useFrame((state) => {
    if (waterRef.current) {
      const t = state.clock.getElapsedTime();
      waterRef.current.rotation.y = t * 0.1;
      const s = 1 + Math.sin(t * 3) * 0.02;
      waterRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group position={position}>
      {/* Central Plaza Circular Paver Foundation */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[8.5, 9, 0.25, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Decorative Outer Stone Curb */}
      <mesh position={[0, 0.26, 0]} receiveShadow>
        <torusGeometry args={[8.3, 0.15, 8, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>

      {/* Outer Basin Stone Wall */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.2, 4.4, 0.8, 24]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>

      {/* Water Pool Surface */}
      <mesh ref={waterRef} position={[0, 0.85, 0]} receiveShadow>
        <cylinderGeometry args={[3.8, 3.8, 0.1, 24]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#38bdf8"
          emissiveIntensity={0.4}
          roughness={0.05}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Center Pedestal Tier 1 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2.0, 0.8, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} />
      </mesh>

      {/* Center Basin Tier 2 */}
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 1.6, 0.4, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} />
      </mesh>

      {/* Top Jet Spout */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.6, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
      </mesh>

      {/* Animated Water Jet Column */}
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.15, 0.35, 1.5, 8]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#7dd3fc"
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Expanding Concentric Water Ripples */}
      <WaterRipples />

      {/* Procedural Water Droplet Spray */}
      <group position={[0, 1.8, 0]}>
        <WaterSpray />
      </group>

      {/* Surrounding Park Benches */}
      <ParkBench position={[0, 0.25, 6.2]} rotation={[0, Math.PI, 0]} />
      <ParkBench position={[0, 0.25, -6.2]} rotation={[0, 0, 0]} />
      <ParkBench position={[-6.2, 0.25, 0]} rotation={[0, Math.PI / 2, 0]} />
      <ParkBench position={[6.2, 0.25, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Surrounding Lampposts */}
      <Lamppost position={[-5.2, 0.25, 5.2]} />
      <Lamppost position={[5.2, 0.25, 5.2]} />
      <Lamppost position={[-5.2, 0.25, -5.2]} />
      <Lamppost position={[5.2, 0.25, -5.2]} />

      {/* Fountain Accent Point Light */}
      <pointLight position={[0, 2.2, 0]} color="#38bdf8" distance={8} intensity={2} />
    </group>
  );
}
