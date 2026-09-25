import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';
import MacBookScene from './components/three/MacBookScene';
import GroundEnvironment from './components/three/GroundEnvironment';
import SceneLoader from './components/three/SceneLoader';
import App from './App';
import { markIntroSeen } from './utils/introState';

// ── Camera constants ──
const CAM_START = new THREE.Vector3(0, 4.5, 6.5);
const CAM_FINAL = new THREE.Vector3(0, 0.90, 0.82);
const CAM_FINAL_TARGET = new THREE.Vector3(0, 0.62, -0.10);
const CAM_FOV = 48;
const CAM_DURATION = 1.8;
const POST_FLIGHT_BEAT_MS = 420; // let the user register the laptop moment before pushing in
const TRANSITION_MS = 620; // camera-push-through-the-glass duration

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

type Stage = 'boot' | 'transitioning' | 'done';

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
 * Drives the demand-mode render loop while mounted: invalidates every frame
 * so animated content (camera flight, ambient particles) keeps ticking.
 * Per design system §6/§11, nothing may run frameloop="always" indefinitely —
 * this driver only exists for the few seconds the Canvas itself is mounted,
 * and the whole Canvas unmounts once the intro hands off (see `stage`).
 */
function FrameDriver() {
  useFrame(({ invalidate }) => {
    invalidate();
  });
  return null;
}

/** Camera fly-in animation. */
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

function SkipHint({ onSkip, visible }: { onSkip: () => void; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={onSkip}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="fixed bottom-6 right-6 z-[9998] flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-os-text-sec/80 backdrop-blur-md outline-none transition-colors hover:border-white/24 hover:bg-white/[0.1] hover:text-os-text-pri focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg"
        >
          <span>Skip intro</span>
          <kbd className="rounded border border-white/16 bg-white/[0.08] px-1.5 py-0.5 text-[9px] text-os-text-sec">
            Any key
          </kbd>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Full boot sequence: loader → 3D fly-in → push-through-the-glass handoff.
 *
 * Design contract (docs/DESIGN_SYSTEM.md §8/§11): the 3D Canvas and its
 * whole scene graph unmount completely once the handoff finishes — this
 * component then renders nothing but `<App/>` at natural 1:1 scale, not a
 * scaled projection living inside a laptop-screen mesh forever. `<App/>`
 * itself is mounted exactly once across the whole sequence (no remount, no
 * lost state, no duplicated timers) — only the wrapper transform around it
 * animates from "projected onto the screen" to "fills the viewport."
 */
export default function Scene3D() {
  const [stage, setStage] = useState<Stage>('boot');
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [rect, setRect] = useState<MonitorRect | null>(null);
  const finishedRef = useRef(false);

  const monCornersRef = useRef<{ tl: THREE.Vector3; br: THREE.Vector3 } | null>(null);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroSeen();
    setStage('done');
  }, []);

  const beginTransition = useCallback(() => {
    if (finishedRef.current || stage === 'transitioning') return;
    setShowApp(true);
    setStage('transitioning');
    window.setTimeout(finish, TRANSITION_MS);
  }, [finish, stage]);

  const handleSkip = useCallback(() => {
    beginTransition();
  }, [beginTransition]);

  // Any keypress or click skips straight to the transition, from any stage.
  useEffect(() => {
    if (stage !== 'boot') return;
    const onKeyDown = () => handleSkip();
    const onPointerDown = () => handleSkip();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [handleSkip, stage]);

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
    setTimeout(() => {
      setShowApp(true);
      setTimeout(beginTransition, POST_FLIGHT_BEAT_MS);
    }, 180);
  }, [beginTransition]);

  const showCanvas = stage !== 'done';
  const isTransitioning = stage === 'transitioning' || stage === 'done';

  // App wrapper: while booting it's transform-scaled to sit inside the
  // laptop screen; once transitioning it animates to fill the real viewport.
  const wrapperInitial = rect
    ? { x: rect.left, y: rect.top, scaleX: rect.scaleX, scaleY: rect.scaleY, opacity: 0 }
    : { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 0 };
  const wrapperAnimate = isTransitioning
    ? { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }
    : { ...wrapperInitial, opacity: showApp ? 1 : 0 };

  return (
    <div className="fixed inset-0 bg-os-bg">
      {/* Stage 1: Loader */}
      <AnimatePresence>
        {!isLoaded && <SceneLoader key="loader" onComplete={handleLoadComplete} />}
      </AnimatePresence>

      <SkipHint onSkip={handleSkip} visible={isLoaded && stage === 'boot'} />

      {/* 3D Canvas — unmounts entirely once handoff completes, freeing the
          GPU context for the rest of the session (design system §11). */}
      {showCanvas && (
        <motion.div
          className="absolute inset-0"
          animate={isTransitioning ? { opacity: 0, filter: 'blur(14px)' } : { opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: TRANSITION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <Canvas
            frameloop="demand"
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
            <FrameDriver />
            <CameraAnimator isReady={sceneReady} onComplete={handleCameraComplete} />
            <Suspense fallback={null}>
              <GroundEnvironment />
              <MacBookScene onCornersReady={handleCornersReady} />
            </Suspense>
          </Canvas>
        </motion.div>
      )}

      {/* Single App instance for the whole sequence — its wrapper transform
          animates from "projected onto the laptop screen" to "fills the
          viewport," so the login screen never remounts or loses state. */}
      {showApp && (
        <motion.div
          className="absolute left-0 top-0 origin-top-left overflow-hidden"
          style={{ width: '100vw', height: '100vh' }}
          initial={wrapperInitial}
          animate={wrapperAnimate}
          transition={
            isTransitioning
              ? { duration: TRANSITION_MS / 1000, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.5, ease: 'easeOut' }
          }
        >
          <App />
        </motion.div>
      )}
    </div>
  );
}
