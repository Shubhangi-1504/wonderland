import React from 'react';
import { Html } from '@react-three/drei';

function DistrictTotem({ position, title, subtitle, color = '#38bdf8' }) {
  return (
    <group position={position}>
      {/* Stone / Metal Pedestal */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.8, 2.4, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glowing Neon Edge Trim */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.45]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Floating 3D HTML Label */}
      <Html position={[0, 2.8, 0]} center distanceFactor={28}>
        <div
          className="px-2.5 py-1 rounded-xl glass-panel text-center pointer-events-none whitespace-nowrap shadow-xl border"
          style={{ borderColor: color }}
        >
          <div className="text-[9px] font-black uppercase tracking-widest text-white font-heading">
            {title}
          </div>
          <div className="text-[8px] font-bold uppercase tracking-wider text-slate-300 font-mono-numbers">
            {subtitle}
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function CitySignage() {
  return (
    <group>
      {/* South Entrance Grand Welcome Monument */}
      <group position={[0, 0, 33]}>
        {/* Left and Right Arch Pillars */}
        {[-3.5, 3.5].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 2.5, 0]} castShadow>
              <boxGeometry args={[0.9, 5.0, 0.9]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 5.1, 0]}>
              <boxGeometry args={[1.1, 0.2, 1.1]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}

        {/* Overhead Connecting Arch Crossbeam */}
        <mesh position={[0, 4.8, 0]} castShadow>
          <boxGeometry args={[7.8, 0.6, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 5.15, 0]}>
          <boxGeometry args={[6.5, 0.1, 0.85]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Archway Banner Label */}
        <Html position={[0, 4.8, 0.5]} center distanceFactor={25}>
          <div className="px-3.5 py-1.5 rounded-xl glass-panel-glow text-center pointer-events-none whitespace-nowrap border border-sky-400 shadow-2xl">
            <div className="text-[11px] font-black tracking-widest text-white font-heading uppercase">
              STOCK MARKET CITY
            </div>
            <div className="text-[8px] font-extrabold tracking-wider text-sky-300 font-mono-numbers">
              INVESTQUEST ACADEMY
            </div>
          </div>
        </Html>
      </group>

      {/* District Totem Signs */}
      {/* North Financial District Totem */}
      <DistrictTotem
        position={[-4.5, 0, -4.5]}
        title="FINANCIAL DISTRICT"
        subtitle="TECHNOVA STOCK EXCHANGE"
        color="#38bdf8"
      />

      {/* West Clean Energy District Totem */}
      <DistrictTotem
        position={[-15.5, 0, 8.5]}
        title="CLEAN TECH HUB"
        subtitle="GREENENERGY RENEWABLES"
        color="#34d399"
      />

      {/* East Consumer & Retail District Totem */}
      <DistrictTotem
        position={[15.5, 0, 8.5]}
        title="CONSUMER COMMERCE"
        subtitle="FOODSPHERE ECOSYSTEM"
        color="#fb923c"
      />
    </group>
  );
}
