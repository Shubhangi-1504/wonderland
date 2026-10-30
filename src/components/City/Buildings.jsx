import React, { useMemo } from 'react';

// Procedural Skyscraper with window grids and crown
function Skyscraper({
  position,
  width = 5,
  height = 14,
  depth = 5,
  baseColor = '#1e293b',
  windowColor = '#38bdf8',
  roofFeature = 'spire',
}) {
  return (
    <group position={position}>
      {/* Main High-Rise Body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Lit Window Grids (Front & Back) */}
      <mesh position={[0, height / 2, depth / 2 + 0.05]}>
        <planeGeometry args={[width * 0.85, height * 0.85]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={windowColor}
          emissiveIntensity={0.2}
          wireframe={true}
        />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width * 0.85, height * 0.85]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={windowColor}
          emissiveIntensity={0.2}
          wireframe={true}
        />
      </mesh>

      {/* Stepped Roof Setback */}
      <mesh position={[0, height + 0.5, 0]} castShadow>
        <boxGeometry args={[width * 0.75, 1.0, depth * 0.75]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>

      {/* Roof Feature */}
      {roofFeature === 'spire' && (
        <group position={[0, height + 1.0, 0]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.18, 3.6, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          <mesh position={[0, 3.6, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        </group>
      )}

      {roofFeature === 'helipad' && (
        <group position={[0, height + 1.05, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[width * 0.3, width * 0.3, 0.1, 16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[width * 0.2, width * 0.25, 16]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>
      )}

      {roofFeature === 'dome' && (
        <mesh position={[0, height + 1.4, 0]}>
          <sphereGeometry args={[width * 0.32, 12, 12]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  );
}

// Low-rise commercial office block
function CommercialBlock({ position, width = 6, height = 4.5, depth = 6, color = '#334155' }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Storefront / Entrance glass band */}
      <mesh position={[0, 1.0, depth / 2 + 0.05]}>
        <planeGeometry args={[width * 0.9, 1.8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      {/* Roof AC unit */}
      <mesh position={[width * 0.2, height + 0.3, 0]}>
        <boxGeometry args={[1.2, 0.6, 1.4]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
    </group>
  );
}

export default function Buildings() {
  const citySkyline = useMemo(
    () => [
      // Far North Skyline (Behind TechNova Exchange)
      { pos: [-12, 0, -22], w: 6, h: 22, d: 6, base: '#0f172a', win: '#38bdf8', roof: 'spire' },
      { pos: [0, 0, -26], w: 8, h: 26, d: 7, base: '#090d16', win: '#60a5fa', roof: 'spire' },
      { pos: [12, 0, -22], w: 6.5, h: 20, d: 6.5, base: '#0f172a', win: '#38bdf8', roof: 'dome' },
      { pos: [-24, 0, -22], w: 6, h: 18, d: 6, base: '#1e293b', win: '#818cf8', roof: 'helipad' },
      { pos: [24, 0, -22], w: 6, h: 19, d: 6, base: '#1e293b', win: '#818cf8', roof: 'spire' },

      // West District (Flanking GreenEnergy)
      { pos: [-38, 0, -12], w: 7, h: 16, d: 6.5, base: '#0f172a', win: '#34d399', roof: 'dome' },
      { pos: [-38, 0, 8], w: 7, h: 15, d: 7, base: '#1e293b', win: '#10b981', roof: 'helipad' },
      { pos: [-38, 0, 22], w: 6.5, h: 14, d: 6, base: '#0f172a', win: '#38bdf8', roof: 'spire' },

      // East District (Flanking FoodSphere)
      { pos: [38, 0, -12], w: 7, h: 17, d: 6.5, base: '#0f172a', win: '#fb923c', roof: 'spire' },
      { pos: [38, 0, 8], w: 7, h: 15, d: 7, base: '#1e293b', win: '#f97316', roof: 'dome' },
      { pos: [38, 0, 22], w: 6.5, h: 13, d: 6, base: '#0f172a', win: '#fbbf24', roof: 'helipad' },

      // South District Towers (Southern Gateway)
      { pos: [-12, 0, 36], w: 6.5, h: 16, d: 6, base: '#1e293b', win: '#60a5fa', roof: 'helipad' },
      { pos: [12, 0, 36], w: 6.5, h: 16, d: 6, base: '#1e293b', win: '#60a5fa', roof: 'dome' },
      { pos: [-32, 0, 36], w: 6, h: 12, d: 6, base: '#0f172a', win: '#38bdf8', roof: 'spire' },
      { pos: [32, 0, 36], w: 6, h: 12, d: 6, base: '#0f172a', win: '#38bdf8', roof: 'spire' },
    ],
    []
  );

  return (
    <group>
      {/* Background Skyline Skyscraper Collection */}
      {citySkyline.map((b, i) => (
        <Skyscraper
          key={i}
          position={b.pos}
          width={b.w}
          height={b.h}
          depth={b.d}
          baseColor={b.base}
          windowColor={b.win}
          roofFeature={b.roof}
        />
      ))}

      {/* Mid-rise Commercial & Bank Pavilions */}
      <CommercialBlock position={[-14, 0, -2]} width={6.5} height={4.5} depth={5.5} color="#1e293b" />
      <CommercialBlock position={[14, 0, -2]} width={6.5} height={4.5} depth={5.5} color="#1e293b" />
      <CommercialBlock position={[-14, 0, 18]} width={6.0} height={4.2} depth={5.0} color="#334155" />
      <CommercialBlock position={[14, 0, 18]} width={6.0} height={4.2} depth={5.0} color="#334155" />
    </group>
  );
}
