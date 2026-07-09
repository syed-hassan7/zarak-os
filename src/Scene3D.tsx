import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import MacBookScene from './components/three/MacBookScene';
import GroundEnvironment from './components/three/GroundEnvironment';
import SceneLoader from './components/three/SceneLoader';
import App from './App';

// ── Camera constants ──
const CAM_START = new THREE.Vector3(0, 4.5, 6.5);
const CAM_FINAL = new THREE.Vector3(0, 0.90, 0.82);
const CAM_FINAL_TARGET = new THREE.Vector3(0, 0.62, -0.10);
const CAM_FOV = 48;
const CAM_DURATION = 1.8;

type MonitorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  vpWidth: number;
  vpHeight: number;
};

/**
 * Projects MacBook screen corners to screen-space pixel rect.
 * Returns null if projection is degenerate (before corners are ready).
 */
function computeMonitorRect(
  vpW: number,
  vpH: number,
  monTL: THREE.Vector3,
  monBR: THREE.Vector3,
  camPos: THREE.Vector3 = CAM_FINAL,
  camTarget: THREE.Vector3 = CAM_FINAL_TARGET,
  fov: number = CAM_FOV,
): MonitorRect | null {
  const cam = new THREE.PerspectiveCamera(fov, vpW / vpH, 0.1, 50);
  cam.position.copy(camPos);
  cam.lookAt(camTarget);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();

  const tl = monTL.clone().project(cam);
  const br = monBR.clone().project(cam);

  const x1 = (tl.x * 0.5 + 0.5) * vpW;
  const y1 = (-tl.y * 0.5 + 0.5) * vpH;
  const x2 = (br.x * 0.5 + 0.5) * vpW;
  const y2 = (-br.y * 0.5 + 0.5) * vpH;

  const w = x2 - x1;
  const h = y2 - y1;

  if (w <= 0 || h <= 0) return null;

  return {
    left: x1,
    top: y1,
    width: w,
    height: h,
    scaleX: w / vpW,
    scaleY: h / vpH,
    vpWidth: vpW,
    vpHeight: vpH,
  };
}

/**
 * Camera fly-in animation.
 * With frameloop="demand", calls invalidate() each frame during animation
 * so Three.js keeps rendering. After completion, GPU idles.
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
  const currentTarget = useRef(CAM_FINAL_TARGET.clone());
  const workingPosition = useRef(new THREE.Vector3());
  const { invalidate } = useThree();

  // Kick off the first frame when scene becomes ready
  useEffect(() => {
    if (isReady) invalidate();
  }, [isReady, invalidate]);

  useFrame(({ clock }) => {
    if (!cameraRef.current || !isReady) return;

    if (startTime.current === null) {
      startTime.current = clock.getElapsedTime();
      cameraRef.current.position.copy(CAM_START);
      currentTarget.current.copy(CAM_FINAL_TARGET);
    }

    if (!fired.current) {
      const t = Math.min((clock.getElapsedTime() - startTime.current) / CAM_DURATION, 1);
      const easedT = 1 - Math.pow(1 - t, 3);
      workingPosition.current.lerpVectors(CAM_START, CAM_FINAL, easedT);
      currentTarget.current.copy(CAM_FINAL_TARGET);

      cameraRef.current.position.copy(workingPosition.current);
      cameraRef.current.lookAt(currentTarget.current);

      if (t >= 1) {
        fired.current = true;
        onComplete();
        return;
      }

      // Keep demand loop alive during fly-in
      invalidate();
      return;
    }

    cameraRef.current.lookAt(currentTarget.current);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[CAM_START.x, CAM_START.y, CAM_START.z]}
      fov={CAM_FOV}
      near={0.1}
      far={50}
    />
  );
}

export default function Scene3D() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [rect, setRect] = useState<MonitorRect | null>(null);

  // Store corners in a ref so the resize handler always has the latest values
  // without needing to be a dependency of the resize useEffect
  const monCornersRef = useRef<{ tl: THREE.Vector3; br: THREE.Vector3 } | null>(null);

  const handleCornersReady = useCallback((tl: THREE.Vector3, br: THREE.Vector3) => {
    const corners = { tl: tl.clone(), br: br.clone() };
    monCornersRef.current = corners;
    setRect(computeMonitorRect(window.innerWidth, window.innerHeight, tl, br));
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (!monCornersRef.current) return;
      const { tl, br } = monCornersRef.current;
      setRect(computeMonitorRect(window.innerWidth, window.innerHeight, tl, br));
    };
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

      {/* 3D Canvas — frameloop="demand" idles GPU after fly-in */}
      <Canvas
        frameloop="always"
        shadows={false}
        dpr={[1, 1.25]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: '#05070A' }}
      >
        <CameraAnimator isReady={sceneReady} onComplete={handleCameraComplete} />
        <Suspense fallback={null}>
          <GroundEnvironment />
          <MacBookScene onCornersReady={handleCornersReady} />
        </Suspense>
      </Canvas>

      {/* OS App overlay — CSS-projected to match MacBook screen in world space */}
      {rect && (
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
            App renders at full viewport resolution then scales to fit screen rect.
            Preserves all layout, font sizes, and spacing from original design.
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
      )}
    </div>
  );
}
