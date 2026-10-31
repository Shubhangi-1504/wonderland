import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { COMPANIES } from '../../data/companies';
import { soundFX } from '../../utils/audio';

// Candlestick bar for the animated stock display
function Candlestick({ position, isGreen, height, offset }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 2 + offset;
    const scaleY = 0.8 + Math.sin(t) * 0.35;
    meshRef.current.scale.y = scaleY;
  });

  return (
    <group position={position}>
      {/* Wick */}
      <mesh position={[0, height * 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, height * 1.5, 6]} />
        <meshBasicMaterial color={isGreen ? '#22c55e' : '#ef4444'} />
      </mesh>
      {/* Real body */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.3, height, 0.1]} />
        <meshStandardMaterial
          color={isGreen ? '#22c55e' : '#ef4444'}
          emissive={isGreen ? '#15803d' : '#b91c1c'}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Animated floating market indicator arrow
function FloatingIndicator({ position, isUp, offset }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 1.8 + offset;
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.4;
    groupRef.current.rotation.y = t * 0.8;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Glowing Cone Arrow */}
      <mesh rotation={[isUp ? 0 : Math.PI, 0, 0]}>
        <coneGeometry args={[0.45, 0.9, 5]} />
        <meshStandardMaterial
          color={isUp ? '#10b981' : '#f43f5e'}
          emissive={isUp ? '#059669' : '#e11d48'}
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>
      {/* Hologram Ring */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.03, 8, 24]} />
        <meshBasicMaterial color={isUp ? '#34d399' : '#fb7185'} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function TechNovaExchange({ onSelect, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const data = COMPANIES.technova;
  const beaconRef = useRef();

  // Procedural candlesticks data
  const candlesticks = useMemo(() => [
    { x: -2.8, isGreen: true, height: 1.4, offset: 0 },
    { x: -2.1, isGreen: true, height: 1.9, offset: 0.8 },
    { x: -1.4, isGreen: false, height: 1.2, offset: 1.6 },
    { x: -0.7, isGreen: true, height: 2.2, offset: 2.4 },
    { x: 0.0, isGreen: true, height: 1.7, offset: 3.2 },
    { x: 0.7, isGreen: false, height: 1.5, offset: 4.0 },
    { x: 1.4, isGreen: true, height: 2.5, offset: 4.8 },
    { x: 2.1, isGreen: true, height: 2.8, offset: 5.6 },
    { x: 2.8, isGreen: false, height: 1.6, offset: 6.4 },
  ], []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 1.2;
      beaconRef.current.position.y = 24.5 + Math.sin(t * 2.2) * 0.4;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setHovered(true);
    soundFX.playHover();
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
    setHovered(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    soundFX.playBuildingSelect();
    if (onSelect) onSelect(data.id);
  };

  // Glass and frame materials
  const glassColor = hovered || isSelected ? '#0284c7' : '#0369a1';
  const glassEmissive = hovered || isSelected ? '#38bdf8' : '#0284c7';
  const emissiveIntensity = hovered || isSelected ? 0.6 : 0.2;

  return (
    <group
      position={data.position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Ground Plaza Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[11, 11.5, 0.4, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Plaza Steps */}
      <mesh position={[0, 0.4, 2]} receiveShadow>
        <boxGeometry args={[10, 0.4, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.6, 3]} receiveShadow>
        <boxGeometry args={[8, 0.4, 4]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Main High-Rise Podium */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 5, 8]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.6}
          roughness={0.3}
          wireframe={false}
        />
      </mesh>

      {/* Main Glass Tower - Tier 1 */}
      <mesh position={[0, 7.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.8, 5, 6.8]} />
        <meshStandardMaterial
          color={glassColor}
          emissive={glassEmissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Architectural Corner Accent Mullions */}
      {[-3.8, 3.8].map((x, i) =>
        [-3.3, 3.3].map((z, j) => (
          <mesh key={`col-${i}-${j}`} position={[x, 7.5, z]} castShadow>
            <boxGeometry args={[0.4, 5.2, 0.4]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.4} />
          </mesh>
        ))
      )}

      {/* Main Glass Tower - Tier 2 */}
      <mesh position={[0, 12, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 5, 5.2]} />
        <meshStandardMaterial
          color={glassColor}
          emissive={glassEmissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.85}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Stepped Glass Crown - Tier 3 */}
      <mesh position={[0, 15.5, 0]} castShadow>
        <boxGeometry args={[4.8, 2.5, 4]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#38bdf8"
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Spire Base & Antenna Spire */}
      <mesh position={[0, 17.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.4, 1.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 20.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.25, 4.5, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Crown Beacon Light Sphere */}
      <mesh position={[0, 23, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <pointLight ref={beaconRef} position={[0, 23, 0]} color="#38bdf8" distance={15} intensity={2} />

      {/* ======================================================== */}
      {/* GIANT ANIMATED STOCK MARKET DISPLAY (Front Facade)       */}
      {/* ======================================================== */}
      <group position={[0, 8, 3.46]}>
        {/* LED Screen Frame */}
        <mesh receiveShadow>
          <boxGeometry args={[7.2, 4.4, 0.2]} />
          <meshStandardMaterial color="#020617" roughness={0.8} />
        </mesh>

        {/* LED Screen Display Surface */}
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[6.8, 4.0]} />
          <meshBasicMaterial color="#051329" />
        </mesh>

        {/* Dynamic Candlesticks */}
        <group position={[0, -0.4, 0.2]}>
          {candlesticks.map((candle, idx) => (
            <Candlestick
              key={idx}
              position={[candle.x, 0, 0]}
              isGreen={candle.isGreen}
              height={candle.height}
              offset={candle.offset}
            />
          ))}
        </group>

        {/* Chart Grid Lines */}
        {[-1.2, 0, 1.2].map((y, i) => (
          <mesh key={`grid-${i}`} position={[0, y, 0.15]}>
            <planeGeometry args={[6.6, 0.03]} />
            <meshBasicMaterial color="#1e3a8a" transparent opacity={0.6} />
          </mesh>
        ))}

        {/* Real-time Ticker Header on Screen */}
        <mesh position={[0, 1.6, 0.16]}>
          <planeGeometry args={[6.6, 0.5]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Floating 3D Indicators (Left and Right) */}
      <FloatingIndicator position={[-4.5, 9, 3]} isUp={true} offset={0} />
      <FloatingIndicator position={[4.5, 10, 3]} isUp={true} offset={1.5} />
      <FloatingIndicator position={[-3.8, 13, 0]} isUp={false} offset={3} />
      <FloatingIndicator position={[3.8, 14, 0]} isUp={true} offset={4.5} />

      {/* ======================================================== */}
      {/* LARGE SIGN: TECHNOVA STOCK EXCHANGE                      */}
      {/* ======================================================== */}
      <group position={[0, 10.5, 3.55]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[7.4, 0.65, 0.18]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
        {/* Sign Accent Glow Strip */}
        <mesh position={[0, -0.35, 0.05]}>
          <boxGeometry args={[7.4, 0.06, 0.12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Lower Entrance Portal Sign */}
      <group position={[0, 5.7, 4.1]}>
        <mesh>
          <boxGeometry args={[6.4, 0.5, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[6.2, 0.35]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Glowing Entrance Canopy & Columns */}
      <group position={[0, 1.8, 4.2]}>
        {/* Canopy Glass Roof */}
        <mesh position={[0, 1.8, 0.6]} castShadow>
          <boxGeometry args={[5.2, 0.25, 2.2]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Support Columns */}
        {[-2.2, -0.8, 0.8, 2.2].map((x, i) => (
          <mesh key={`col-${i}`} position={[x, 0.9, 1.4]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 1.8, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Glowing Entrance Portal Arch */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[3.2, 1.6, 0.3]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[0, 1.2, 1]} color="#38bdf8" distance={6} intensity={2.5} />
      </group>

      {/* ======================================================== */}
      {/* FLOATING MISSION BEACON (Top of the Building)            */}
      {/* ======================================================== */}
      <group ref={beaconRef} position={[0, 24.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.5}
            roughness={0.1}
            wireframe={false}
          />
        </mesh>
        {/* Surrounding Energy Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 8, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 3D FLOATING HTML OVERLAY (Only when hovered and not selected) */}
      {/* ======================================================== */}
      {hovered && !isSelected && (
        <Html
          position={[0, 26, 0]}
          center
          distanceFactor={55}
          style={{
            pointerEvents: 'none',
          }}
        >
          <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-150">
            <div className="px-3.5 py-2 rounded-2xl glass-panel-glow border border-sky-400/60 bg-slate-950/90 text-center shadow-2xl min-w-[190px]">
              <div className="text-[10px] tracking-wider uppercase font-extrabold text-sky-400">
                {data.name}
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5 font-mono-numbers text-xs">
                <span className="font-bold text-white">{data.price}</span>
                <span className="text-emerald-400 font-bold text-[11px]">▲ {data.change}</span>
              </div>
              <div className="text-[9px] text-sky-200/90 font-semibold mt-1">
                Click to Open Missions
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>

  );
}
