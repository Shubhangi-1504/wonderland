import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { COMPANIES } from '../../data/companies';
import { soundFX } from '../../utils/audio';

// Rotating Wind Turbine
function WindTurbine({ position, scale = 1, rotationSpeed = 2.5 }) {
  const bladesRef = useRef();

  useFrame((state, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * rotationSpeed;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Tower Mast */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.22, 5, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Generator Nacelle */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.7, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[0, 5, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.35, 8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      {/* Rotating 3 Blades */}
      <group ref={bladesRef} position={[0, 5, 0.45]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <boxGeometry args={[0.12, 2.8, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Green tip */}
            <mesh position={[0, 2.7, 0]}>
              <boxGeometry args={[0.12, 0.3, 0.035]} />
              <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Rooftop Photovoltaic Solar Array Panel
function SolarPanelRow({ position, rotation = [0.35, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame Stand */}
      <mesh position={[0, -0.2, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      {/* Photovoltaic Glass Surface */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 1.2]} />
        <meshStandardMaterial
          color="#1e3a8a"
          emissive="#0369a1"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Grid line accent */}
      <mesh position={[0, 0.05, 0]}>
        <planeGeometry args={[3.1, 1.1]} />
        <meshBasicMaterial color="#38bdf8" wireframe={true} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function GreenEnergy({ onSelect, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const data = COMPANIES.greenenergy;
  const beaconRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.2 + Math.sin(t * 3.5) * 0.6;
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

  const towerColor = hovered || isSelected ? '#10b981' : '#059669';
  const emissiveColor = hovered || isSelected ? '#34d399' : '#047857';
  const emissiveIntensity = hovered || isSelected ? 0.6 : 0.2;

  return (
    <group
      position={data.position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Eco Plaza Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[10, 10.5, 0.4, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.8} />
      </mesh>

      {/* Grass Parkland Rim */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[9.5, 9.7, 0.2, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>

      {/* Modern White Curved Podium */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.5, 4.2, 7.5]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.25} metalness={0.2} />
      </mesh>

      {/* Horizontal Green Louver Bands */}
      {[-1.2, 0, 1.2].map((y, idx) => (
        <mesh key={`band-${idx}`} position={[0, 2.5 + y, 0]}>
          <boxGeometry args={[8.7, 0.15, 7.7]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Mid Tower - Stepped Glass Eco Tower */}
      <mesh position={[0, 7, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 5, 5.8]} />
        <meshStandardMaterial
          color={towerColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Cascading Garden Terraces (Green Roof Lawns) */}
      <mesh position={[0, 4.65, 2.8]} receiveShadow>
        <boxGeometry args={[7.8, 0.2, 1.6]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 9.6, 1.8]} receiveShadow>
        <boxGeometry args={[6.2, 0.2, 2.0]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>

      {/* Decorative Rooftop Trees / Bushes on Terrace */}
      {[-2, 0, 2].map((x, i) => (
        <group key={`terrace-bush-${i}`} position={[x, 5.2, 2.8]}>
          <mesh castShadow>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Upper Eco Tower Tier */}
      <mesh position={[0, 11.5, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 4.2, 4.4]} />
        <meshStandardMaterial
          color={towerColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Clean White Frame Outlines */}
      <mesh position={[0, 11.5, -0.4]}>
        <boxGeometry args={[5.35, 4.3, 4.55]} />
        <meshStandardMaterial color="#f8fafc" wireframe={true} />
      </mesh>

      {/* Solar Panel Arrays on the Terrace Wings */}
      <SolarPanelRow position={[-1.6, 9.8, 1.8]} />
      <SolarPanelRow position={[1.6, 9.8, 1.8]} />
      <SolarPanelRow position={[0, 13.8, -0.4]} rotation={[0.4, 0, 0]} />

      {/* Twin Decorative Wind Turbines */}
      <WindTurbine position={[-2.4, 13.6, -1.8]} scale={0.7} rotationSpeed={3.0} />
      <WindTurbine position={[2.4, 13.6, -1.8]} scale={0.7} rotationSpeed={2.4} />

      {/* Central Spire with Eco Glow */}
      <mesh position={[0, 14.8, -0.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.18, 3, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.9} />
      </mesh>
      <mesh position={[0, 16.4, -0.4]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <pointLight ref={beaconRef} position={[0, 16.4, -0.4]} color="#34d399" distance={12} intensity={2} />

      {/* ======================================================== */}
      {/* SIGN: GREENENERGY                                        */}
      {/* ======================================================== */}
      <group position={[0, 4.8, 3.8]}>
        <mesh castShadow>
          <boxGeometry args={[5.8, 0.65, 0.2]} />
          <meshStandardMaterial color="#064e3b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[5.5, 0.45]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Main Entrance & Eco Canopy */}
      <group position={[0, 1.6, 3.8]}>
        {/* Glass Canopy */}
        <mesh position={[0, 1.4, 0.6]} castShadow>
          <boxGeometry args={[4.4, 0.18, 1.8]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
        {/* White Architectural Pillars */}
        {[-1.8, 1.8].map((x, i) => (
          <mesh key={`p-${i}`} position={[x, 0.7, 1.2]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 1.4, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}
        {/* Glowing Green Entrance Doorway */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.6, 1.4, 0.2]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <pointLight position={[0, 1.2, 0.8]} color="#34d399" distance={5} intensity={2} />
      </group>

      {/* ======================================================== */}
      {/* FLOATING MISSION BEACON (Top of GreenEnergy)             */}
      {/* ======================================================== */}
      <group position={[0, 18, -0.4]}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={1.5}
            roughness={0.1}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.3, 0.04, 8, 32]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 3D FLOATING HTML OVERLAY (Only when hovered and not selected) */}
      {/* ======================================================== */}
      {hovered && !isSelected && (
        <Html
          position={[0, 19, 0]}
          center
          distanceFactor={55}
          style={{
            pointerEvents: 'none',
          }}
        >
          <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-150">
            <div className="px-3.5 py-2 rounded-2xl glass-panel-glow border border-emerald-400/60 bg-slate-950/90 text-center shadow-2xl min-w-[180px]">
              <div className="text-[10px] tracking-wider uppercase font-extrabold text-emerald-400">
                {data.name}
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5 font-mono-numbers text-xs">
                <span className="font-bold text-white">{data.price}</span>
                <span className="text-emerald-400 font-bold text-[11px]">▲ {data.change}</span>
              </div>
              <div className="text-[9px] text-emerald-200/90 font-semibold mt-1">
                Click to Open Missions
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>

  );
}
