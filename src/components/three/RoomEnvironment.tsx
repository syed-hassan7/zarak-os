import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Sets up the atmospheric lighting, ground plane, fog,
 * and floating ambient particles for the 3D scene.
 */
export default function RoomEnvironment() {
  const particlesRef = useRef<THREE.Points>(null);

  // Slowly rotate dust particles for atmosphere
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.015;
      particlesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.05;
    }
  });

  // Create floating dust particle positions
  const particlePositions = useMemo(() => {
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return { positions, count: particleCount };
  }, []);

  return (
    <>
      {/* High ambient fill — ensures nothing is pitch black */}
      <ambientLight intensity={0.9} color="#8ab8b1" />

      {/* Directional key light — reliable, consistent illumination from above-front */}
      <directionalLight
        position={[2, 5, 4]}
        intensity={1.5}
        color="#e0d8cc"
      />

      {/* Secondary directional fill from the left */}
      <directionalLight
        position={[-3, 3, 2]}
        intensity={0.5}
        color="#c8d0e0"
      />

      {/* Monitor teal accent light — forward-facing onto desk */}
      <pointLight
        position={[0, 2.2, 0.8]}
        intensity={0.8}
        color="#2DD4BF"
        distance={6}
        decay={2}
      />

      {/* Background accent — soft teal mood fill from left */}
      <directionalLight
        position={[-3, 3, -2]}
        intensity={0.4}
        color="#2DD4BF"
      />

      {/* Warm rim from right side */}
      <pointLight
        position={[3, 2, 0]}
        intensity={0.3}
        color="#F5BF4F"
        distance={8}
        decay={2}
      />

      {/* ─── GROUND PLANE ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#08090e"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* ─── BACK WALL ─── */}
      <mesh position={[0, 3, -3]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          color="#161b1a"
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>

      {/* ─── FLOATING DUST PARTICLES ─── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.count}
            array={particlePositions.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#2DD4BF"
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Depth fog for atmosphere — pushed back a bit */}
      <fog attach="fog" args={['#05070A', 8, 20]} />
    </>
  );
}
