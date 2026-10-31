import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function WalkingPedestrian({ path, speed = 2.0, color = '#38bdf8', offset = 0, hasBriefcase = false, hasPhone = false }) {
  const meshRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const currentAngle = useRef(0);

  // 2D waypoints path length calculation
  const { totalLength, segmentLengths } = useMemo(() => {
    let len = 0;
    const segs = [];
    for (let i = 0; i < path.length; i++) {
      const nextIdx = (i + 1) % path.length;
      const dx = path[nextIdx][0] - path[i][0];
      const dz = path[nextIdx][1] - path[i][1];
      const d = Math.hypot(dx, dz);
      segs.push(d);
      len += d;
    }
    return { totalLength: len, segmentLengths: segs };
  }, [path]);

  useFrame((state, delta) => {
    if (!meshRef.current || totalLength === 0) return;
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();
    const curDist = ((t * speed + offset) % totalLength + totalLength) % totalLength;

    let accum = 0;
    let segIdx = 0;
    let segProg = 0;

    for (let i = 0; i < segmentLengths.length; i++) {
      if (accum + segmentLengths[i] >= curDist) {
        segIdx = i;
        segProg = (curDist - accum) / segmentLengths[i];
        break;
      }
      accum += segmentLengths[i];
    }

    const nextIdx = (segIdx + 1) % path.length;
    const p1 = path[segIdx];
    const p2 = path[nextIdx];

    const curX = p1[0] + (p2[0] - p1[0]) * segProg;
    const curZ = p1[1] + (p2[1] - p1[1]) * segProg;

    meshRef.current.position.x = curX;
    meshRef.current.position.z = curZ;

    // Natural walking cadence phase
    const walkPhase = t * speed * 3.8 + offset;

    // Natural human vertical bobbing & lateral hip sway
    meshRef.current.position.y = 0.04 + Math.abs(Math.sin(walkPhase)) * 0.07;
    meshRef.current.rotation.z = Math.sin(walkPhase) * 0.035;

    // Smooth heading turning at corners
    const targetAngle = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]);
    let diff = targetAngle - currentAngle.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentAngle.current += diff * Math.min(1, dt * 7);
    meshRef.current.rotation.y = currentAngle.current;

    // Kinematic leg swinging (pivoted from hip)
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(walkPhase) * 0.5;
      rightLegRef.current.rotation.x = -Math.sin(walkPhase) * 0.5;
    }

    // Kinematic arm swinging (opposing leg motion, pivoted from shoulder)
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -Math.sin(walkPhase) * 0.42;
      rightArmRef.current.rotation.x = hasPhone ? -0.7 : Math.sin(walkPhase) * 0.42;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Torso / Jacket */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.38, 0.52, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.17, 10, 10]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.5} />
      </mesh>

      {/* Hair / Cap */}
      <mesh position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Left Arm with Shoulder Pivot */}
      <group ref={leftArmRef} position={[-0.25, 1.05, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        {/* Briefcase accessory */}
        {hasBriefcase && (
          <mesh position={[-0.08, -0.46, 0.05]} castShadow>
            <boxGeometry args={[0.08, 0.24, 0.32]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} metalness={0.2} />
          </mesh>
        )}
      </group>

      {/* Right Arm with Shoulder Pivot */}
      <group ref={rightArmRef} position={[0.25, 1.05, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        {/* Glowing smartphone accessory */}
        {hasPhone && (
          <mesh position={[0, -0.38, 0.18]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[0.07, 0.14, 0.015]} />
            <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
        )}
      </group>

      {/* Left Leg with Hip Pivot */}
      <group ref={leftLegRef} position={[-0.1, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.58, 0.04]}>
          <boxGeometry args={[0.13, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Leg with Hip Pivot */}
      <group ref={rightLegRef} position={[0.1, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.58, 0.04]}>
          <boxGeometry args={[0.13, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export default function Pedestrians() {
  const pedestrians = useMemo(
    () => [
      // Promenade Stroller 1 (West sidewalk of central avenue)
      {
        path: [
          [-3.8, 2],
          [-3.8, 28],
          [-4.5, 28],
          [-4.5, 2],
        ],
        speed: 1.8,
        color: '#38bdf8',
        offset: 0,
        hasPhone: true,
      },
      // Promenade Stroller 2 (East sidewalk of central avenue)
      {
        path: [
          [3.8, 26],
          [3.8, 4],
          [4.5, 4],
          [4.5, 26],
        ],
        speed: 2.1,
        color: '#f43f5e',
        offset: 5,
        hasBriefcase: true,
      },
      // Plaza Crosser 3 (Across South crosswalk)
      {
        path: [
          [-12, 14.5],
          [12, 14.5],
          [12, 15.2],
          [-12, 15.2],
        ],
        speed: 1.6,
        color: '#10b981',
        offset: 12,
        hasPhone: true,
      },
      // TechNova Exchange Visitor 4 (North Boulevard sidewalk)
      {
        path: [
          [-14, -7.5],
          [14, -7.5],
          [14, -6.8],
          [-14, -6.8],
        ],
        speed: 2.0,
        color: '#fbbf24',
        offset: 8,
        hasBriefcase: true,
      },
      // GreenEnergy Park Walker 5
      {
        path: [
          [-14, 12],
          [-14, 24],
          [-16, 24],
          [-16, 12],
        ],
        speed: 1.5,
        color: '#a855f7',
        offset: 2,
      },
      // FoodSphere Park Walker 6
      {
        path: [
          [14, 24],
          [14, 12],
          [16, 12],
          [16, 24],
        ],
        speed: 1.7,
        color: '#fb923c',
        offset: 15,
        hasPhone: true,
      },
    ],
    []
  );

  return (
    <group>
      {pedestrians.map((p, idx) => (
        <WalkingPedestrian
          key={idx}
          path={p.path}
          speed={p.speed}
          color={p.color}
          offset={p.offset}
          hasBriefcase={p.hasBriefcase}
          hasPhone={p.hasPhone}
        />
      ))}
    </group>
  );
}
