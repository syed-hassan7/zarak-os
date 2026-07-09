import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PI = Math.PI;
const CYAN_COUNT = 120;
const VIOLET_COUNT = 60;

export default function GroundEnvironment() {
  const cyanRef = useRef<THREE.Points>(null);
  const violetRef = useRef<THREE.Points>(null);

  const { cyanPos, violetPos, speeds, baseY } = useMemo(() => {
    const cPos = new Float32Array(CYAN_COUNT * 3);
    const vPos = new Float32Array(VIOLET_COUNT * 3);
    const spd = new Float32Array(CYAN_COUNT + VIOLET_COUNT);
    const by = new Float32Array(CYAN_COUNT + VIOLET_COUNT);

    for (let i = 0; i < CYAN_COUNT; i++) {
      cPos[i * 3]     = (Math.random() - 0.5) * 14;
      cPos[i * 3 + 1] = Math.random() * 3.2 + 0.4;
      cPos[i * 3 + 2] = -5 + Math.random() * 9;
      spd[i] = 0.04 + Math.random() * 0.06;
      by[i]  = cPos[i * 3 + 1];
    }
    for (let i = 0; i < VIOLET_COUNT; i++) {
      vPos[i * 3]     = (Math.random() - 0.5) * 16;
      vPos[i * 3 + 1] = Math.random() * 3.8 + 0.5;
      vPos[i * 3 + 2] = -6 + Math.random() * 11;
      spd[CYAN_COUNT + i] = 0.03 + Math.random() * 0.05;
      by[CYAN_COUNT + i]  = vPos[i * 3 + 1];
    }
    return { cyanPos: cPos, violetPos: vPos, speeds: spd, baseY: by };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (cyanRef.current) {
      const attr = cyanRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < CYAN_COUNT; i++) {
        arr[i * 3 + 1] = baseY[i] + Math.sin(t * speeds[i] + i) * 0.12;
      }
      attr.needsUpdate = true;
    }

    if (violetRef.current) {
      const attr = violetRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < VIOLET_COUNT; i++) {
        arr[i * 3 + 1] = baseY[CYAN_COUNT + i] + Math.sin(t * speeds[CYAN_COUNT + i] + i + 50) * 0.10;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      {/* ─── LIGHTING ─── */}
      <ambientLight intensity={0.45} color="#9aa8b8" />
      <directionalLight position={[3, 8, 5]} intensity={1.6} color="#ddd8cc" />
      <directionalLight position={[-4, 4, 2]} intensity={0.45} color="#c0ccd8" />

      {/* Screen bounce — soft teal from lid */}
      <pointLight position={[0, 0.8, -0.4]} intensity={0.5} color="#2DD4BF" distance={3.5} decay={2} />

      {/* Violet left accent */}
      <pointLight position={[-4, 1.8, 0]} intensity={0.5} color="#C084FC" distance={8} decay={2} />

      {/* Warm rim from front-right */}
      <pointLight position={[2, 2, 3]} intensity={0.3} color="#F5BF4F" distance={7} decay={2} />

      {/* Background depth haze */}
      <pointLight position={[0, 3, -6]} intensity={0.3} color="#C084FC" distance={10} decay={2} />

      {/* ─── FLOOR ─── */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Fine 1-unit grid */}
      <gridHelper args={[40, 40, '#12121a', '#12121a']} />

      {/* Coarse 4-unit section grid */}
      <gridHelper args={[40, 10, '#1a1a2a', '#1a1a2a']} position={[0, 0.001, 0]} />

      {/* Glow pool beneath laptop */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.002, -0.3]}>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color="#2DD4BF" transparent opacity={0.028} depthWrite={false} />
      </mesh>

      {/* ─── ACCENT PILLARS ─── */}

      {/* Near left — violet */}
      <mesh position={[-3.2, 0.9, -0.8]}>
        <cylinderGeometry args={[0.014, 0.014, 1.8, 6]} />
        <meshStandardMaterial
          color="#C084FC" emissive="#C084FC" emissiveIntensity={1.4}
          transparent opacity={0.65} roughness={0} metalness={0}
        />
      </mesh>

      {/* Near right — cyan */}
      <mesh position={[3.2, 0.9, -0.8]}>
        <cylinderGeometry args={[0.014, 0.014, 1.8, 6]} />
        <meshStandardMaterial
          color="#2DD4BF" emissive="#2DD4BF" emissiveIntensity={1.4}
          transparent opacity={0.65} roughness={0} metalness={0}
        />
      </mesh>

      {/* Far left */}
      <mesh position={[-5.5, 0.65, -3.5]}>
        <cylinderGeometry args={[0.009, 0.009, 1.3, 6]} />
        <meshStandardMaterial
          color="#C084FC" emissive="#C084FC" emissiveIntensity={0.9}
          transparent opacity={0.38} roughness={0} metalness={0}
        />
      </mesh>

      {/* Far right */}
      <mesh position={[5.5, 0.65, -3.5]}>
        <cylinderGeometry args={[0.009, 0.009, 1.3, 6]} />
        <meshStandardMaterial
          color="#2DD4BF" emissive="#2DD4BF" emissiveIntensity={0.9}
          transparent opacity={0.38} roughness={0} metalness={0}
        />
      </mesh>

      {/* ─── FLOATING PANELS ─── */}

      {/* Left panel — cyan tint */}
      <mesh position={[-4.5, 1.1, -3.5]} rotation={[0, PI / 5, PI / 16]}>
        <planeGeometry args={[2.0, 1.0]} />
        <meshStandardMaterial
          color="#2DD4BF" emissive="#2DD4BF" emissiveIntensity={0.06}
          transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>

      {/* Right panel — violet tint */}
      <mesh position={[4.5, 0.9, -3.0]} rotation={[0, -PI / 5, -PI / 14]}>
        <planeGeometry args={[1.8, 0.85]} />
        <meshStandardMaterial
          color="#C084FC" emissive="#C084FC" emissiveIntensity={0.06}
          transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>

      {/* Small far panel */}
      <mesh position={[2.5, 1.8, -5.5]} rotation={[PI / 10, -PI / 8, 0]}>
        <planeGeometry args={[1.4, 0.6]} />
        <meshStandardMaterial
          color="#2DD4BF" emissive="#2DD4BF" emissiveIntensity={0.04}
          transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>

      {/* ─── PARTICLES ─── */}

      <points ref={cyanRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={CYAN_COUNT}
            array={cyanPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          color="#2DD4BF"
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <points ref={violetRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={VIOLET_COUNT}
            array={violetPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.016}
          color="#C084FC"
          transparent
          opacity={0.30}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ─── FOG ─── */}
      <fog attach="fog" args={['#06060a', 5, 16]} />
    </>
  );
}
