import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import DeskScene from './components/three/DeskScene';
import RoomEnvironment from './components/three/RoomEnvironment';
import SceneLoader from './components/three/SceneLoader';
import App from './App';

// ── Constants ──
const CAM_START = new THREE.Vector3(0, 5.5, 8);
const CAM_FLY_END = new THREE.Vector3(0, 2.08, 2.2);
const CAM_FLY_TARGET = new THREE.Vector3(0, 1.9, -0.5);
const CAM_STABLE = new THREE.Vector3(0, 2.12, 2.18);
const CAM_STABLE_TARGET = new THREE.Vector3(0, 1.94, -0.5);
const FINAL_FRAME_BLEND_START = 0.9;

// Monitor corners in world-space (exact inner bezel edges from DeskScene geometry)
const MON_TL = new THREE.Vector3(-1.48, 2.87, -0.48);
const MON_BR = new THREE.Vector3( 1.48, 1.23, -0.48);

/**
 * Projects the 3D monitor corners onto the screen and returns:
 * - left, top, width, height: pixel position of the overlay
 * - scaleX, scaleY: how much to shrink full-viewport content to fit
 * - vpWidth, vpHeight: viewport size for the inner content wrapper
 */
function computeMonitorRect(
  vpW: number,
  vpH: number,
  cameraPosition = CAM_STABLE,
  cameraTarget = CAM_STABLE_TARGET,
) {
  const cam = new THREE.PerspectiveCamera(42, vpW / vpH, 0.1, 50);
  cam.position.copy(cameraPosition);
  cam.lookAt(cameraTarget);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();

  const tl = MON_TL.clone().project(cam);
  const br = MON_BR.clone().project(cam);

  const x1 = (tl.x * 0.5 + 0.5) * vpW;
  const y1 = (-tl.y * 0.5 + 0.5) * vpH;
  const x2 = (br.x * 0.5 + 0.5) * vpW;
  const y2 = (-br.y * 0.5 + 0.5) * vpH;

  const w = x2 - x1;
  const h = y2 - y1;

  return {
    left: x1,
    top: y1,
    width: w,
    height: h,
    // Scale factors: the App renders at full viewport size but is scaled to fit the monitor
    scaleX: w / vpW,
    scaleY: h / vpH,
    vpWidth: vpW,
    vpHeight: vpH,
  };
}

/**
 * Camera fly-in animation. Calls onComplete when done.
 */
function CameraAnimator({
  isReady,
  onComplete,
}: {
  isReady: boolean;
  onComplete: () => void;
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const startTime = useRef<number | null>(null);
  const fired = useRef(false);
  const currentTarget = useRef(CAM_FLY_TARGET.clone());
  const workingPosition = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    if (!cameraRef.current) return;

    if (!isReady) return;

    if (startTime.current === null) {
      startTime.current = clock.getElapsedTime();
      cameraRef.current.position.copy(CAM_START);
      currentTarget.current.copy(CAM_FLY_TARGET);
    }

    if (!fired.current) {
      const t = Math.min((clock.getElapsedTime() - startTime.current) / 1.55, 1);
      const easedT = 1 - Math.pow(1 - t, 3);
      workingPosition.current.lerpVectors(CAM_START, CAM_FLY_END, easedT);
      currentTarget.current.copy(CAM_FLY_TARGET);

      if (t >= FINAL_FRAME_BLEND_START) {
        const blendT = (t - FINAL_FRAME_BLEND_START) / (1 - FINAL_FRAME_BLEND_START);
        const easedBlendT = blendT * blendT * (3 - 2 * blendT);
        workingPosition.current.lerp(CAM_STABLE, easedBlendT);
        currentTarget.current.lerp(CAM_STABLE_TARGET, easedBlendT);
      }

      cameraRef.current.position.copy(workingPosition.current);
      cameraRef.current.lookAt(currentTarget.current);

      if (t >= 1) {
        fired.current = true;
        onComplete();
      }
      return;
    }
    cameraRef.current.lookAt(currentTarget.current);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 5.5, 8]}
      fov={42}
      near={0.1}
      far={50}
    />
  );
}

/**
 * Root 3D scene.
 *
 * The OS app renders at FULL VIEWPORT size internally (so all layouts,
 * fonts, and padding work exactly as originally designed), then is
 * visually scaled down with CSS transform: scale() to fit inside
 * the 3D monitor overlay. This means zero layout changes are needed
 * in any of the app components.
 */
export default function Scene3D() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [showApp, setShowApp] = useState(false);

  const [rect, setRect] = useState(() =>
    computeMonitorRect(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const onResize = () =>
      setRect(computeMonitorRect(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
    setTimeout(() => setSceneReady(true), 180);
  }, []);

  const handleCameraComplete = useCallback(() => {
    setTimeout(() => setShowApp(true), 180);
  }, []);

  return (
    <div className="fixed inset-0 bg-os-bg">
      {/* Stage 1: Loader */}
      <AnimatePresence>
        {!isLoaded && <SceneLoader key="loader" onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {/* 3D Canvas */}
      <Canvas
        shadows={false}
        dpr={[1, 1.25]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{
          background: '#05070A',
          opacity: 1,
        }}
      >
        <CameraAnimator isReady={sceneReady} onComplete={handleCameraComplete} />
        <Suspense fallback={null}>
          <RoomEnvironment />
          <DeskScene />
        </Suspense>
      </Canvas>

      {/* OS App overlay — positioned to match the 3D monitor */}
      <div
        style={{
          position: 'absolute',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          overflow: 'hidden',
          borderRadius: '2px',
          opacity: showApp ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out',
          pointerEvents: showApp ? 'auto' : 'none',
          boxShadow: showApp
            ? '0 0 60px rgba(45, 212, 191, 0.08), 0 0 120px rgba(45, 212, 191, 0.03)'
            : 'none',
        }}
      >
        {/*
          Inner wrapper: renders App at full viewport dimensions,
          then scales it down to fit the monitor overlay.
          This preserves all original layout, fonts, and spacing.
        */}
        {showApp && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${rect.vpWidth}px`,
              height: `${rect.vpHeight}px`,
              transform: `scale(${rect.scaleX}, ${rect.scaleY})`,
              transformOrigin: 'top left',
            }}
          >
            <App />
          </div>
        )}
      </div>
    </div>
  );
}
