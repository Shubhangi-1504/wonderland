import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { COMPANIES } from '../../data/companies';
import { soundFX } from '../../utils/audio';

// Animated Delivery Drone hovering over the delivery pad
function DeliveryDrone({ position }) {
  const droneRef = useRef();

  useFrame((state) => {
    if (!droneRef.current) return;
    const t = state.clock.getElapsedTime() * 2.5;
    droneRef.current.position.y = position[1] + Math.sin(t) * 0.25;
    droneRef.current.rotation.y = t * 0.5;
  });

  return (
    <group ref={droneRef} position={position} scale={0.7}>
      {/* Central Chassis */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 4 Rotor Arms */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.06]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0.65, 0.05, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 8]} />
            <meshBasicMaterial color="#fdba74" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
      {/* Cargo Pod */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.28, 0.22, 0.28]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
    </group>
  );
}

// Café Terrace Table with Parasol Umbrella
function CafeTable({ position }) {
  return (
    <group position={position} scale={0.8}>
      {/* Table Pole & Base */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.15, 0.7, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>
      {/* Table Top */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 12]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Umbrella Pole */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
      {/* Umbrella Canopy */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.9, 0.45, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function FoodSphere({ onSelect, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const data = COMPANIES.foodsphere;
  const beaconRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.3 + Math.sin(t * 3.5) * 0.6;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.4;
      ringRef.current.rotation.x = Math.sin(t * 0.8) * 0.2;
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

  const sphereColor = hovered || isSelected ? '#fb923c' : '#f97316';
  const emissiveColor = hovered || isSelected ? '#fdba74' : '#ea580c';
  const emissiveIntensity = hovered || isSelected ? 0.6 : 0.2;

  return (
    <group
      position={data.position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Plaza Foundation Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[10.5, 11, 0.4, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Warm Paver Terrace */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[9.8, 10, 0.2, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Modern White & Orange Base Podium */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 3.8, 7.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.15} />
      </mesh>

      {/* Orange Accent Base Trim */}
      <mesh position={[0, 4.15, 0]}>
        <boxGeometry args={[9.0, 0.15, 8.0]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.5} />
      </mesh>

      {/* Main Corporate Tower (Sleek Curvilinear Building) */}
      <mesh position={[1.4, 7.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.8, 3.4, 7, 16]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>

      {/* Distinctive Orange & Champagne Glass Sphere / Atrium */}
      <group position={[-1.8, 6.5, 1.2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2.5, 24, 24]} />
          <meshStandardMaterial
            color={sphereColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.7}
            roughness={0.15}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* Architectural Meridian Rings */}
        <mesh>
          <sphereGeometry args={[2.54, 16, 16]} />
          <meshStandardMaterial color="#ffffff" wireframe={true} transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Orbiting Tech Ring around the Sphere */}
      <group ref={ringRef} position={[-1.8, 6.5, 1.2]}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[3.2, 0.08, 8, 36]} />
          <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Upper Architectural Crown */}
      <mesh position={[1.4, 11.5, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.6, 2.2, 16]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Spire with Warm Glow Orb */}
      <mesh position={[1.4, 13.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.2, 2.5, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
      </mesh>
      <mesh position={[1.4, 14.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#fb923c" />
      </mesh>
      <pointLight ref={beaconRef} position={[1.4, 14.8, 0]} color="#fb923c" distance={12} intensity={2} />

      {/* Automated Delivery Drone Pad on West Terrace */}
      <group position={[-2.8, 4.3, -1.8]}>
        {/* Helipad Base */}
        <mesh receiveShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.1, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Pad Ring */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.35, 24]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        {/* Delivery Drone Hovering */}
        <DeliveryDrone position={[0, 1.4, 0]} />
      </group>

      {/* Outdoor Café Terrace with Tables & Umbrellas on East Side */}
      <CafeTable position={[3.2, 0.45, 2.8]} />
      <CafeTable position={[3.5, 0.45, 1.0]} />

      {/* ======================================================== */}
      {/* SIGN: FOODSPHERE                                         */}
      {/* ======================================================== */}
      <group position={[0, 4.4, 3.95]}>
        <mesh castShadow>
          <boxGeometry args={[5.6, 0.65, 0.18]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[5.3, 0.45]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
      </group>

      {/* Animated Glowing Entrance */}
      <group position={[0, 1.6, 3.95]}>
        {/* Warm Orange Entrance Arch */}
        <mesh position={[0, 1.3, 0.5]} castShadow>
          <boxGeometry args={[4.2, 0.22, 1.8]} />
          <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.7} />
        </mesh>
        {/* Pillars */}
        {[-1.6, 1.6].map((x, i) => (
          <mesh key={`p-${i}`} position={[x, 0.6, 1.1]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 1.3, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.3} />
          </mesh>
        ))}
        {/* Illuminated Portal */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.8, 1.3, 0.2]} />
          <meshBasicMaterial color="#fdba74" />
        </mesh>
        <pointLight position={[0, 1.0, 0.8]} color="#fb923c" distance={6} intensity={2.5} />
      </group>

      {/* ======================================================== */}
      {/* FLOATING MISSION BEACON (Top of FoodSphere)              */}
      {/* ======================================================== */}
      <group position={[1.4, 16.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color="#fb923c"
            emissive="#f97316"
            emissiveIntensity={1.5}
            roughness={0.1}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.3, 0.04, 8, 32]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 3D FLOATING HTML OVERLAY (Only when hovered and not selected) */}
      {/* ======================================================== */}
      {hovered && !isSelected && (
        <Html
          position={[0, 18, 0]}
          center
          distanceFactor={55}
          style={{
            pointerEvents: 'none',
          }}
        >
          <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-150">
            <div className="px-3.5 py-2 rounded-2xl glass-panel-glow border border-orange-400/60 bg-slate-950/90 text-center shadow-2xl min-w-[180px]">
              <div className="text-[10px] tracking-wider uppercase font-extrabold text-orange-400">
                {data.name}
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5 font-mono-numbers text-xs">
                <span className="font-bold text-white">{data.price}</span>
                <span className="text-emerald-400 font-bold text-[11px]">▲ {data.change}</span>
              </div>
              <div className="text-[9px] text-orange-200/90 font-semibold mt-1">
                Click to Open Missions
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>

  );
}
