import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

// Conical Pine / Fir Tree
function PineTree({ position, scale = 1, swayOffset = 0 }) {
  const treeRef = useRef();

  useFrame((state) => {
    if (!treeRef.current) return;
    const t = state.clock.getElapsedTime() * 1.2 + swayOffset;
    // Multi-harmonic natural wind gusting
    const gust = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.8) * 0.3 + Math.sin(t * 3.1) * 0.15;
    treeRef.current.rotation.z = gust * 0.04;
    treeRef.current.rotation.x = Math.cos(t * 0.6) * 0.025;
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Wood Trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, 1.4, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Foliage Tier 1 (Bottom) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[1.3, 1.5, 6]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      {/* Foliage Tier 2 (Middle) */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <coneGeometry args={[1.0, 1.4, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      {/* Foliage Tier 3 (Top) */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[0.7, 1.2, 6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Spherical Deciduous Tree (Oak / Maple)
function DeciduousTree({ position, scale = 1, color = '#22c55e', swayOffset = 0 }) {
  const treeRef = useRef();

  useFrame((state) => {
    if (!treeRef.current) return;
    const t = state.clock.getElapsedTime() * 1.1 + swayOffset;
    // Multi-harmonic natural wind gusting
    const gust = Math.sin(t * 0.8) * 0.5 + Math.sin(t * 1.6) * 0.3 + Math.sin(t * 2.9) * 0.15;
    treeRef.current.rotation.z = gust * 0.045;
    treeRef.current.rotation.x = Math.cos(t * 0.7) * 0.03;
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, 1.8, 6]} />
        <meshStandardMaterial color="#573010" roughness={0.9} />
      </mesh>
      {/* Clustered Foliage Spheres */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0.4, 2.8, 0.3]} castShadow>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-0.4, 2.6, -0.3]} castShadow>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Low-poly Flowering Cherry / Accent Tree
function BlossomTree({ position, scale = 1, swayOffset = 0 }) {
  const treeRef = useRef();

  useFrame((state) => {
    if (!treeRef.current) return;
    const t = state.clock.getElapsedTime() * 1.2 + swayOffset;
    treeRef.current.rotation.z = Math.sin(t) * 0.045;
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 1.6, 6]} />
        <meshStandardMaterial color="#442610" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#f472b6" roughness={0.7} />
      </mesh>
      <mesh position={[0.3, 2.6, 0.2]} castShadow>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#fb7185" roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function Trees() {
  // Tree placement coordinates across parks and sidewalks
  const treeList = useMemo(
    () => [
      // Southwest Park (near GreenEnergy)
      { type: 'pine', pos: [-16, 0, 12], scale: 1.1, offset: 0.2 },
      { type: 'deciduous', pos: [-14, 0, 15], scale: 1.2, color: '#16a34a', offset: 0.8 },
      { type: 'pine', pos: [-17, 0, 18], scale: 0.95, offset: 1.4 },
      { type: 'deciduous', pos: [-13, 0, 20], scale: 1.05, color: '#22c55e', offset: 2.1 },
      { type: 'blossom', pos: [-15, 0, 23], scale: 1.0, offset: 2.7 },
      { type: 'pine', pos: [-18, 0, 25], scale: 1.2, offset: 3.3 },

      // Southeast Park (near FoodSphere)
      { type: 'deciduous', pos: [14, 0, 12], scale: 1.15, color: '#16a34a', offset: 0.5 },
      { type: 'pine', pos: [17, 0, 14], scale: 1.2, offset: 1.1 },
      { type: 'blossom', pos: [15, 0, 18], scale: 1.1, offset: 1.8 },
      { type: 'deciduous', pos: [18, 0, 21], scale: 1.0, color: '#22c55e', offset: 2.4 },
      { type: 'pine', pos: [14, 0, 24], scale: 1.05, offset: 3.0 },
      { type: 'deciduous', pos: [17, 0, 27], scale: 1.25, color: '#15803d', offset: 3.6 },

      // Northwest Perimeter (behind GreenEnergy)
      { type: 'pine', pos: [-34, 0, -4], scale: 1.3, offset: 0.4 },
      { type: 'pine', pos: [-32, 0, 0], scale: 1.1, offset: 1.0 },
      { type: 'deciduous', pos: [-30, 0, -8], scale: 1.2, color: '#16a34a', offset: 1.6 },
      { type: 'pine', pos: [-28, 0, -18], scale: 1.3, offset: 2.2 },
      { type: 'blossom', pos: [-24, 0, -18], scale: 1.1, offset: 2.9 },

      // Northeast Perimeter (behind FoodSphere)
      { type: 'pine', pos: [34, 0, -4], scale: 1.3, offset: 0.7 },
      { type: 'deciduous', pos: [32, 0, 0], scale: 1.15, color: '#16a34a', offset: 1.3 },
      { type: 'pine', pos: [30, 0, -8], scale: 1.2, offset: 1.9 },
      { type: 'blossom', pos: [28, 0, -18], scale: 1.1, offset: 2.6 },
      { type: 'pine', pos: [24, 0, -18], scale: 1.3, offset: 3.2 },

      // Central Promenade Tree Boulevard
      { type: 'blossom', pos: [-4.2, 0, 18], scale: 0.95, offset: 0.1 },
      { type: 'blossom', pos: [4.2, 0, 18], scale: 0.95, offset: 0.7 },
      { type: 'deciduous', pos: [-4.2, 0, 24], scale: 1.0, color: '#22c55e', offset: 1.3 },
      { type: 'deciduous', pos: [4.2, 0, 24], scale: 1.0, color: '#22c55e', offset: 1.9 },

      // TechNova Plaza Flanking Trees
      { type: 'pine', pos: [-8.5, 0, -6], scale: 1.1, offset: 0.3 },
      { type: 'pine', pos: [8.5, 0, -6], scale: 1.1, offset: 0.9 },
      { type: 'deciduous', pos: [-10, 0, -14], scale: 1.2, color: '#15803d', offset: 1.5 },
      { type: 'deciduous', pos: [10, 0, -14], scale: 1.2, color: '#15803d', offset: 2.1 },
    ],
    []
  );

  return (
    <group>
      {treeList.map((t, i) => {
        if (t.type === 'pine') {
          return (
            <PineTree
              key={i}
              position={t.pos}
              scale={t.scale}
              swayOffset={t.offset}
            />
          );
        }
        if (t.type === 'blossom') {
          return (
            <BlossomTree
              key={i}
              position={t.pos}
              scale={t.scale}
              swayOffset={t.offset}
            />
          );
        }
        return (
          <DeciduousTree
            key={i}
            position={t.pos}
            scale={t.scale}
            color={t.color}
            swayOffset={t.offset}
          />
        );
      })}
    </group>
  );
}
