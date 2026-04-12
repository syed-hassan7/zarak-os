import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Low-poly cyberpunk-styled desk with procedural geometry
export default function DeskScene() {
  const deskGroupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Subtle monitor glow pulse
  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.25 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
    }
  });

  // Memoized materials to avoid re-creation
  const materials = useMemo(() => ({
    deskSurface: new THREE.MeshStandardMaterial({
      color: '#1e2028',
      roughness: 0.8,
      metalness: 0.15,
    }),
    deskEdge: new THREE.MeshStandardMaterial({
      color: '#252830',
      roughness: 0.55,
      metalness: 0.35,
    }),
    metalAccent: new THREE.MeshStandardMaterial({
      color: '#3a3f4e',
      roughness: 0.25,
      metalness: 0.85,
    }),
    monitorBody: new THREE.MeshStandardMaterial({
      color: '#161b22',
      roughness: 0.35,
      metalness: 0.55,
    }),
    monitorBezel: new THREE.MeshStandardMaterial({
      color: '#10141a',
      roughness: 0.25,
      metalness: 0.65,
    }),
    screenEmissive: new THREE.MeshStandardMaterial({
      color: '#080a10',
      emissive: '#2DD4BF',
      emissiveIntensity: 0.015,
      roughness: 0.1,
      metalness: 0.0,
    }),
    keyboard: new THREE.MeshStandardMaterial({
      color: '#1c1f28',
      roughness: 0.65,
      metalness: 0.45,
    }),
    keycap: new THREE.MeshStandardMaterial({
      color: '#282c38',
      roughness: 0.5,
      metalness: 0.35,
    }),
    mouse: new THREE.MeshStandardMaterial({
      color: '#1e2128',
      roughness: 0.45,
      metalness: 0.45,
    }),
    mugBody: new THREE.MeshStandardMaterial({
      color: '#242830',
      roughness: 0.75,
      metalness: 0.15,
    }),
    mugAccent: new THREE.MeshStandardMaterial({
      color: '#2DD4BF',
      emissive: '#2DD4BF',
      emissiveIntensity: 0.15,
      roughness: 0.5,
      metalness: 0.2,
    }),
    paper: new THREE.MeshStandardMaterial({
      color: '#d4d8e0',
      roughness: 0.95,
      metalness: 0.0,
    }),
    pen: new THREE.MeshStandardMaterial({
      color: '#C084FC',
      emissive: '#C084FC',
      emissiveIntensity: 0.08,
      roughness: 0.3,
      metalness: 0.6,
    }),
    cable: new THREE.MeshStandardMaterial({
      color: '#1a1c24',
      roughness: 0.9,
      metalness: 0.1,
    }),
  }), []);

  return (
    <group ref={deskGroupRef}>
      {/* ─── DESK SURFACE ─── */}
      <group position={[0, 1.0, 0]}>
        {/* Main desktop surface */}
        <mesh material={materials.deskSurface} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.06, 2.0]} />
        </mesh>

        {/* Front accent edge strip — teal glow */}
        <mesh position={[0, -0.01, 1.0]} material={materials.mugAccent}>
          <boxGeometry args={[4.2, 0.02, 0.008]} />
        </mesh>

        {/* Raised back edge */}
        <mesh position={[0, 0.04, -0.96]} material={materials.deskEdge}>
          <boxGeometry args={[4.2, 0.04, 0.08]} />
        </mesh>
      </group>

      {/* ─── DESK LEGS ─── */}
      {[
        [-1.95, 0.5, 0.9],
        [1.95, 0.5, 0.9],
        [-1.95, 0.5, -0.9],
        [1.95, 0.5, -0.9],
      ].map((pos, i) => (
        <group key={`leg-${i}`} position={pos as [number, number, number]}>
          <mesh material={materials.metalAccent}>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
          </mesh>
          {/* Foot pad */}
          <mesh position={[0, -0.5, 0]} material={materials.metalAccent}>
            <boxGeometry args={[0.1, 0.02, 0.1]} />
          </mesh>
        </group>
      ))}

      {/* Cross-brace under desk */}
      <mesh position={[0, 0.3, 0]} material={materials.metalAccent}>
        <boxGeometry args={[3.6, 0.02, 0.02]} />
      </mesh>

      {/* ─── MONITOR ─── */}
      <group position={[0, 2.05, -0.5]}>
        {/* Monitor back panel */}
        <mesh position={[0, 0, -0.03]} material={materials.monitorBody}>
          <boxGeometry args={[3.0, 1.72, 0.04]} />
        </mesh>

        {/* Top bezel */}
        <mesh position={[0, 0.84, 0.0]} material={materials.monitorBezel}>
          <boxGeometry args={[3.04, 0.04, 0.06]} />
        </mesh>
        {/* Bottom bezel */}
        <mesh position={[0, -0.84, 0.0]} material={materials.monitorBezel}>
          <boxGeometry args={[3.04, 0.04, 0.06]} />
        </mesh>
        {/* Left bezel */}
        <mesh position={[-1.5, 0, 0.0]} material={materials.monitorBezel}>
          <boxGeometry args={[0.04, 1.72, 0.06]} />
        </mesh>
        {/* Right bezel */}
        <mesh position={[1.5, 0, 0.0]} material={materials.monitorBezel}>
          <boxGeometry args={[0.04, 1.72, 0.06]} />
        </mesh>


        {/* HTML portal — OS app renders here (IS the screen) */}
        <mesh position={[0, -0.80, 0.031]}>
          <boxGeometry args={[0.06, 0.01, 0.005]} />
          <meshStandardMaterial
            color="#2DD4BF"
            emissive="#2DD4BF"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Dark screen panel — the actual OS app is overlaid via DOM */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[2.96, 1.64]} />
          <meshBasicMaterial color="#050709" />
        </mesh>

        {/* Monitor glow light — casts teal onto desk */}
        <pointLight
          ref={glowRef}
          position={[0, 0, 1.5]}
          intensity={0.25}
          color="#2DD4BF"
          distance={3}
          decay={2}
        />
      </group>

      {/* ─── MONITOR STAND ─── */}
      <group position={[0, 1.35, -0.55]}>
        {/* Vertical pole */}
        <mesh material={materials.metalAccent}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
        </mesh>
        {/* Base plate */}
        <mesh position={[0, -0.35, 0.15]} material={materials.metalAccent}>
          <boxGeometry args={[0.5, 0.02, 0.45]} />
        </mesh>
      </group>

      {/* ─── KEYBOARD ─── */}
      <group position={[0, 1.06, 0.2]}>
        {/* Keyboard base */}
        <mesh material={materials.keyboard}>
          <boxGeometry args={[1.35, 0.02, 0.45]} />
        </mesh>
        {/* Wrist rest area */}
        <mesh position={[0, 0, 0.25]} material={materials.keyboard}>
          <boxGeometry args={[1.35, 0.01, 0.08]} />
        </mesh>

        {/* Key rows — 4 rows of simplified key blocks */}
        {[-0.12, -0.04, 0.04, 0.12].map((z, rowIndex) => (
          <group key={`row-${rowIndex}`} position={[0, 0.015, z]}>
            {Array.from({ length: 13 }, (_, colIndex) => (
              <mesh
                key={`key-${rowIndex}-${colIndex}`}
                position={[(colIndex - 6) * 0.09, 0, 0]}
                material={materials.keycap}
              >
                <boxGeometry args={[0.07, 0.008, 0.065]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Spacebar */}
        <mesh position={[0, 0.015, 0.175]} material={materials.keycap}>
          <boxGeometry args={[0.52, 0.008, 0.065]} />
        </mesh>
      </group>

      {/* ─── MOUSE ─── */}
      <group position={[1.0, 1.05, 0.25]}>
        <mesh material={materials.mouse}>
          <boxGeometry args={[0.14, 0.03, 0.22]} />
        </mesh>
        {/* Mouse scroll wheel */}
        <mesh position={[0, 0.02, -0.03]}>
          <cylinderGeometry args={[0.01, 0.01, 0.04, 8]} />
          <meshStandardMaterial
            color="#2DD4BF"
            emissive="#2DD4BF"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Mouse click divider */}
        <mesh position={[0, 0.016, -0.04]} material={materials.metalAccent}>
          <boxGeometry args={[0.002, 0.005, 0.1]} />
        </mesh>
      </group>

      {/* Mouse cable */}
      <mesh position={[1.0, 1.04, -0.1]} material={materials.cable}>
        <cylinderGeometry args={[0.004, 0.004, 0.5, 6]} />
      </mesh>

      {/* ─── COFFEE MUG ─── */}
      <group position={[-1.5, 1.12, 0.4]}>
        {/* Mug body */}
        <mesh material={materials.mugBody}>
          <cylinderGeometry args={[0.07, 0.06, 0.18, 12]} />
        </mesh>
        {/* Accent ring near top */}
        <mesh position={[0, 0.06, 0]} material={materials.mugAccent}>
          <cylinderGeometry args={[0.072, 0.072, 0.015, 12]} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.09, 0, 0]} material={materials.mugBody} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.04, 0.01, 6, 12, Math.PI]} />
        </mesh>
      </group>

      {/* ─── NOTEPAD ─── */}
      <group position={[-1.5, 1.04, -0.1]}>
        {/* Stack of pages */}
        <mesh material={materials.paper}>
          <boxGeometry args={[0.3, 0.015, 0.42]} />
        </mesh>
        {/* Cover underneath */}
        <mesh position={[0, -0.01, 0]} material={materials.monitorBody}>
          <boxGeometry args={[0.32, 0.005, 0.44]} />
        </mesh>
        {/* Line details on paper surface */}
        {[-0.12, -0.06, 0, 0.06, 0.12].map((z, i) => (
          <mesh key={`line-${i}`} position={[0.02, 0.009, z]}>
            <boxGeometry args={[0.2, 0.001, 0.002]} />
            <meshStandardMaterial color="#b8bcc6" roughness={1} metalness={0} />
          </mesh>
        ))}
      </group>

      {/* ─── PEN ─── */}
      <group position={[-1.15, 1.05, 0.0]} rotation={[0, 0.3, Math.PI / 2]}>
        {/* Pen body */}
        <mesh material={materials.pen}>
          <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
        </mesh>
        {/* Pen tip */}
        <mesh position={[0, -0.15, 0]} material={materials.metalAccent}>
          <coneGeometry args={[0.008, 0.03, 8]} />
        </mesh>
        {/* Pen clip */}
        <mesh position={[0.01, 0.1, 0]} material={materials.metalAccent}>
          <boxGeometry args={[0.003, 0.06, 0.005]} />
        </mesh>
      </group>

      {/* ─── SMALL DESK PLANT (geometric low-poly) ─── */}
      <group position={[1.7, 1.03, -0.5]}>
        {/* Pot */}
        <mesh position={[0, 0.06, 0]} material={materials.monitorBody}>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 6]} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.01, 6]} />
          <meshStandardMaterial color="#1a1510" roughness={1} />
        </mesh>
        {/* Low-poly plant leaves */}
        {[0, 1.2, 2.4, 3.6, 5.0].map((angle, i) => (
          <mesh
            key={`leaf-${i}`}
            position={[Math.cos(angle) * 0.02, 0.17 + i * 0.015, Math.sin(angle) * 0.02]}
            rotation={[0.3 * Math.sin(angle), angle, 0.2 * Math.cos(angle)]}
          >
            <coneGeometry args={[0.015, 0.07, 4]} />
            <meshStandardMaterial
              color="#1a6b5a"
              emissive="#2DD4BF"
              emissiveIntensity={0.05}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* ─── USB HUB (small detail) ─── */}
      <group position={[1.6, 1.04, 0.1]}>
        <mesh material={materials.monitorBody}>
          <boxGeometry args={[0.12, 0.02, 0.05]} />
        </mesh>
        {/* USB port indicators */}
        {[-0.035, 0, 0.035].map((x, i) => (
          <mesh key={`usb-${i}`} position={[x, 0.011, 0]}>
            <boxGeometry args={[0.02, 0.003, 0.01]} />
            <meshStandardMaterial
              color={i === 0 ? '#2DD4BF' : '#1F2937'}
              emissive={i === 0 ? '#2DD4BF' : '#000000'}
              emissiveIntensity={i === 0 ? 0.5 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* ─── HEADPHONE STAND (left side) ─── */}
      <group position={[-1.85, 1.03, 0.4]}>
        {/* Base */}
        <mesh material={materials.metalAccent}>
          <cylinderGeometry args={[0.06, 0.07, 0.02, 8]} />
        </mesh>
        {/* Vertical pole */}
        <mesh position={[0, 0.18, 0]} material={materials.metalAccent}>
          <cylinderGeometry args={[0.012, 0.012, 0.34, 8]} />
        </mesh>
        {/* Top hook */}
        <mesh position={[0, 0.36, 0.02]} material={materials.metalAccent}>
          <boxGeometry args={[0.025, 0.02, 0.06]} />
        </mesh>
      </group>
      {/* ─── LED LIGHT PILLARS (Back corners) ─── */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={`led-pillar-${i}`} position={[x, 1.05, -0.85]}>
          {/* Base plate */}
          <mesh material={materials.monitorBody}>
            <cylinderGeometry args={[0.04, 0.05, 0.04, 8]} />
          </mesh>
          {/* Glowing tube */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
            <meshStandardMaterial
              color="#2DD4BF"
              emissive="#2DD4BF"
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>
          {/* Top cap */}
          <mesh position={[0, 0.81, 0]} material={materials.metalAccent}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
          </mesh>
          {/* The actual light source illuminating the room & back wall safely */}
          <pointLight
            position={[0, 0.5, -0.1]}
            intensity={0.6}
            color="#2DD4BF"
            distance={8}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
