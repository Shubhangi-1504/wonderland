import React from 'react';

// Single straight road segment with markings
function RoadSegment({ position, rotation = [0, 0, 0], length = 40, width = 6.0 }) {
  const dashCount = Math.floor(length / 3);

  return (
    <group position={position} rotation={rotation}>
      {/* Asphalt Bed */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, length]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>

      {/* Sidewalks (Left and Right) */}
      <mesh position={[-width / 2 - 0.7, 0.12, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.22, length]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[width / 2 + 0.7, 0.12, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.22, length]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Dashed Centerline (White) */}
      {Array.from({ length: dashCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.11, -length / 2 + (i + 0.5) * 3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.2, 1.6]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* Yellow Lane Borders */}
      <mesh position={[-width / 2 + 0.3, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, length]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[width / 2 - 0.3, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, length]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}

// Pedestrian Crosswalk (Zebra Stripes)
function Crosswalk({ position, rotation = [0, 0, 0], width = 6.0 }) {
  const stripeCount = 7;
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: stripeCount }).map((_, i) => (
        <mesh
          key={i}
          position={[-width / 2 + 0.6 + i * (width / stripeCount), 0.12, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.55, 2.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

// Road Intersection Junction
function Intersection({ position, size = 6.0 }) {
  return (
    <group position={position}>
      {/* Junction Asphalt */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[size, 0.1, size]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      {/* Corner Sidewalk Curbs */}
      {[-size / 2 - 0.7, size / 2 + 0.7].map((x, i) =>
        [-size / 2 - 0.7, size / 2 + 0.7].map((z, j) => (
          <mesh key={`curb-${i}-${j}`} position={[x, 0.12, z]} receiveShadow>
            <boxGeometry args={[1.4, 0.22, 1.4]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function Roads() {
  return (
    <group>
      {/* =================================================== */}
      {/* MAIN EAST-WEST BOULEVARD                            */}
      {/* Connects GreenEnergy (West: -24), Plaza, FoodSphere */}
      {/* =================================================== */}
      <RoadSegment position={[-14, 0, 5]} rotation={[0, Math.PI / 2, 0]} length={18} width={5.6} />
      <RoadSegment position={[14, 0, 5]} rotation={[0, Math.PI / 2, 0]} length={18} width={5.6} />

      {/* East-West outer extensions */}
      <RoadSegment position={[-36, 0, 5]} rotation={[0, Math.PI / 2, 0]} length={16} width={5.6} />
      <RoadSegment position={[36, 0, 5]} rotation={[0, Math.PI / 2, 0]} length={16} width={5.6} />

      {/* =================================================== */}
      {/* MAIN NORTH-SOUTH AVENUE                             */}
      {/* Connects TechNova (North: -10) to Plaza & South     */}
      {/* =================================================== */}
      <RoadSegment position={[0, 0, -2.5]} length={15} width={5.6} />
      <RoadSegment position={[0, 0, 19]} length={20} width={5.6} />

      {/* =================================================== */}
      {/* NORTH BOULEVARD (Runs in front of TechNova)         */}
      {/* =================================================== */}
      <RoadSegment position={[-18, 0, -10]} rotation={[0, Math.PI / 2, 0]} length={24} width={5.2} />
      <RoadSegment position={[18, 0, -10]} rotation={[0, Math.PI / 2, 0]} length={24} width={5.2} />

      {/* =================================================== */}
      {/* WEST & EAST FLANK AVENUES (North-South Outer Grid)  */}
      {/* =================================================== */}
      <RoadSegment position={[-24, 0, 20]} length={22} width={5.2} />
      <RoadSegment position={[-24, 0, -2.5]} length={15} width={5.2} />

      <RoadSegment position={[24, 0, 20]} length={22} width={5.2} />
      <RoadSegment position={[24, 0, -2.5]} length={15} width={5.2} />

      {/* =================================================== */}
      {/* SOUTH RING ROAD                                     */}
      {/* =================================================== */}
      <RoadSegment position={[0, 0, 30]} rotation={[0, Math.PI / 2, 0]} length={54} width={5.2} />

      {/* =================================================== */}
      {/* ROAD INTERSECTIONS & CROSSWALKS                     */}
      {/* =================================================== */}
      <Intersection position={[-24, 0, 5]} size={5.6} />
      <Intersection position={[24, 0, 5]} size={5.6} />
      <Intersection position={[-24, 0, 30]} size={5.2} />
      <Intersection position={[24, 0, 30]} size={5.2} />
      <Intersection position={[0, 0, 30]} size={5.2} />
      <Intersection position={[-24, 0, -10]} size={5.2} />
      <Intersection position={[24, 0, -10]} size={5.2} />

      {/* Pedestrian Crosswalks near landmarks and plaza */}
      <Crosswalk position={[0, 0, -4.5]} width={5.6} />
      <Crosswalk position={[0, 0, 14.5]} width={5.6} />
      <Crosswalk position={[-9.5, 0, 5]} rotation={[0, Math.PI / 2, 0]} width={5.6} />
      <Crosswalk position={[9.5, 0, 5]} rotation={[0, Math.PI / 2, 0]} width={5.6} />
      <Crosswalk position={[-24, 0, 1.8]} width={5.2} />
      <Crosswalk position={[24, 0, 1.8]} width={5.2} />
    </group>
  );
}
