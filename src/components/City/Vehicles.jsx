import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Single spinning wheel
function SpinningWheel({ position }) {
  const wheelRef = useRef();
  useFrame((state) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x = -state.clock.getElapsedTime() * 14;
    }
  });

  return (
    <group position={position}>
      <group ref={wheelRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Rim Spokes */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.19, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Procedural stylized low-poly Car Model with spinning wheels and headlight beams
function LowPolyCar({ color = '#38bdf8', isTaxi = false, isVan = false }) {
  return (
    <group>
      {/* Car Body / Chassis */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, isVan ? 3.0 : 2.5]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Cabin Roof */}
      <mesh position={[0, isVan ? 0.95 : 0.85, isVan ? -0.2 : -0.1]} castShadow>
        <boxGeometry args={[1.2, isVan ? 0.7 : 0.45, isVan ? 2.0 : 1.4]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Taxi Roof Sign */}
      {isTaxi && (
        <mesh position={[0, 1.15, -0.1]}>
          <boxGeometry args={[0.5, 0.16, 0.25]} />
          <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.8} />
        </mesh>
      )}

      {/* 4 Animated Spinning Wheels */}
      {[-0.8, 0.8].map((x, i) =>
        [-0.8, 0.8].map((z, j) => (
          <SpinningWheel key={`w-${i}-${j}`} position={[x, 0.25, z]} />
        ))
      )}

      {/* Headlights (Front is +Z) */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, 0.45, isVan ? 1.52 : 1.27]}>
          <boxGeometry args={[0.22, 0.14, 0.05]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      ))}

      {/* Soft Forward Headlight Beam Projected on Pavement */}
      <mesh
        position={[0, 0.02, isVan ? 3.6 : 3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.8, 3.8]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Taillights (Rear is -Z) */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, 0.45, isVan ? -1.52 : -1.27]}>
          <boxGeometry args={[0.22, 0.12, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}
    </group>
  );
}

// Moving vehicle along a 2D waypoint loop with realistic cornering physics
function AnimatedCar({ waypoints, speed = 10, offset = 0, color, isTaxi, isVan }) {
  const carRef = useRef();
  const currentAngle = useRef(0);
  const currentRoll = useRef(0);

  // Pre-calculate cumulative lengths of waypoints for constant-speed interpolation
  const pathData = useMemo(() => {
    let totalLength = 0;
    const distances = [];
    for (let i = 0; i < waypoints.length; i++) {
      const nextIdx = (i + 1) % waypoints.length;
      const dx = waypoints[nextIdx][0] - waypoints[i][0];
      const dz = waypoints[nextIdx][1] - waypoints[i][1];
      const dist = Math.hypot(dx, dz);
      distances.push(dist);
      totalLength += dist;
    }
    return { distances, totalLength };
  }, [waypoints]);

  useFrame((state, delta) => {
    if (!carRef.current) return;
    const dt = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();
    // Distance traveled
    const currentDist = ((time * speed + offset) % pathData.totalLength + pathData.totalLength) % pathData.totalLength;

    // Find which segment we are on
    let accumulated = 0;
    let segIdx = 0;
    let segProgress = 0;

    for (let i = 0; i < pathData.distances.length; i++) {
      const d = pathData.distances[i];
      if (accumulated + d >= currentDist) {
        segIdx = i;
        segProgress = (currentDist - accumulated) / d;
        break;
      }
      accumulated += d;
    }

    const nextIdx = (segIdx + 1) % waypoints.length;
    const p1 = waypoints[segIdx];
    const p2 = waypoints[nextIdx];

    const curX = p1[0] + (p2[0] - p1[0]) * segProgress;
    const curZ = p1[1] + (p2[1] - p1[1]) * segProgress;

    // Subtle engine & road vibration
    const bounce = Math.sin(time * speed * 2.5) * 0.012;
    carRef.current.position.set(curX, 0.1 + bounce, curZ);

    // Target heading angle
    const targetAngle = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]);

    // Shortest angular distance interpolation for realistic steering
    let diff = targetAngle - currentAngle.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    currentAngle.current += diff * Math.min(1, dt * 8);
    carRef.current.rotation.y = currentAngle.current;

    // Centrifugal chassis roll into corners
    const targetRoll = -diff * 0.4;
    currentRoll.current = THREE.MathUtils.damp(currentRoll.current, targetRoll, 7.0, dt);
    carRef.current.rotation.z = currentRoll.current;
  });

  return (
    <group ref={carRef} scale={0.75}>
      <LowPolyCar
        color={color}
        isTaxi={isTaxi}
        isVan={isVan}
      />
    </group>
  );
}

export default function Vehicles() {
  // Loop 1: Inner South Avenue to Plaza to TechNova circuit
  const innerLoop = useMemo(
    () => [
      [1.4, 28],
      [1.4, -8],
      [18, -8],
      [18, -12],
      [-1.4, -12],
      [-1.4, 28],
      [18, 28],
      [1.4, 28],
    ],
    []
  );

  // Loop 2: East-West Grand Boulevard circuit
  const eastWestLoop = useMemo(
    () => [
      [-36, 6.4],
      [36, 6.4],
      [36, 3.6],
      [-36, 3.6],
    ],
    []
  );

  // Loop 3: Outer ring connecting TechNova, GreenEnergy, and FoodSphere
  const outerRingLoop = useMemo(
    () => [
      [-22.6, -8],
      [-22.6, 28],
      [22.6, 28],
      [22.6, -8],
    ],
    []
  );

  // Loop 4: Counter-clockwise outer loop
  const counterOuterLoop = useMemo(
    () => [
      [25.4, -8],
      [-25.4, -8],
      [-25.4, 31],
      [25.4, 31],
    ],
    []
  );

  return (
    <group>
      {/* Yellow City Taxi on East-West Boulevard */}
      <AnimatedCar
        waypoints={eastWestLoop}
        speed={11}
        offset={0}
        color="#eab308"
        isTaxi={true}
      />
      {/* Cyan Electric Sedan on East-West Boulevard */}
      <AnimatedCar
        waypoints={eastWestLoop}
        speed={10}
        offset={40}
        color="#06b6d4"
      />
      {/* GreenTech Eco Car on East-West Boulevard */}
      <AnimatedCar
        waypoints={eastWestLoop}
        speed={9}
        offset={85}
        color="#10b981"
      />

      {/* TechNova Financial Courier Van on Inner Loop */}
      <AnimatedCar
        waypoints={innerLoop}
        speed={8.5}
        offset={5}
        color="#0284c7"
        isVan={true}
      />
      {/* Sleek Orange FoodSphere Delivery Van on Inner Loop */}
      <AnimatedCar
        waypoints={innerLoop}
        speed={9.5}
        offset={45}
        color="#f97316"
        isVan={true}
      />

      {/* Outer Ring Electric Cruiser */}
      <AnimatedCar
        waypoints={outerRingLoop}
        speed={11.5}
        offset={10}
        color="#f43f5e"
      />
      {/* Luxury Navy Blue Executive Sedan */}
      <AnimatedCar
        waypoints={outerRingLoop}
        speed={10.5}
        offset={65}
        color="#1e3a8a"
      />

      {/* Counter Outer Loop Taxi */}
      <AnimatedCar
        waypoints={counterOuterLoop}
        speed={9.0}
        offset={20}
        color="#fbbf24"
        isTaxi={true}
      />
      {/* Pure White EV Sedan */}
      <AnimatedCar
        waypoints={counterOuterLoop}
        speed={10.0}
        offset={75}
        color="#f8fafc"
      />
    </group>
  );
}
