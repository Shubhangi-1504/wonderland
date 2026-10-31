import React, { useMemo } from 'react';

function LampPost({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Metal Post */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 3.6, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Decorative Base Collar */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.4, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Curved Arm */}
      <mesh position={[0.3, 3.55, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>

      {/* Lamp Fixture Hood */}
      <mesh position={[0.65, 3.75, 0]}>
        <coneGeometry args={[0.28, 0.25, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Glowing Warm Light Bulb */}
      <mesh position={[0.65, 3.62, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Soft Ground Warm Glow Indicator */}
      <mesh position={[0.65, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function StreetLights() {
  const lampPositions = useMemo(
    () => [
      // Central Avenue West Side
      { pos: [-3.8, 0, -1], rot: [0, Math.PI / 2, 0] },
      { pos: [-3.8, 0, 8], rot: [0, Math.PI / 2, 0] },
      { pos: [-3.8, 0, 18], rot: [0, Math.PI / 2, 0] },
      { pos: [-3.8, 0, 26], rot: [0, Math.PI / 2, 0] },

      // Central Avenue East Side
      { pos: [3.8, 0, -1], rot: [0, -Math.PI / 2, 0] },
      { pos: [3.8, 0, 8], rot: [0, -Math.PI / 2, 0] },
      { pos: [3.8, 0, 18], rot: [0, -Math.PI / 2, 0] },
      { pos: [3.8, 0, 26], rot: [0, -Math.PI / 2, 0] },

      // Boulevard near TechNova
      { pos: [-12, 0, -7.2], rot: [0, Math.PI, 0] },
      { pos: [12, 0, -7.2], rot: [0, Math.PI, 0] },
      { pos: [-20, 0, -7.2], rot: [0, Math.PI, 0] },
      { pos: [20, 0, -7.2], rot: [0, Math.PI, 0] },

      // Boulevard near GreenEnergy (West)
      { pos: [-18, 0, 2.2], rot: [0, 0, 0] },
      { pos: [-28, 0, 2.2], rot: [0, 0, 0] },

      // Boulevard near FoodSphere (East)
      { pos: [18, 0, 2.2], rot: [0, 0, 0] },
      { pos: [28, 0, 2.2], rot: [0, 0, 0] },
    ],
    []
  );

  return (
    <group>
      {lampPositions.map((l, i) => (
        <LampPost key={i} position={l.pos} rotation={l.rot} />
      ))}
    </group>
  );
}
