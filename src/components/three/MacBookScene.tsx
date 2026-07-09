import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';
import nyanGifSrc from '../../assets/nyan-nyan.gif';

interface MacBookSceneProps {
  onCornersReady: (tl: THREE.Vector3, br: THREE.Vector3) => void;
}

// Rounded-rect path helper for canvas 2D
function rrPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export default function MacBookScene({ onCornersReady }: MacBookSceneProps) {
  const lidRef = useRef<THREE.Group>(null);

  const mats = useMemo(() => ({
    body:     new THREE.MeshStandardMaterial({ color: '#b0b4bc', roughness: 0.25, metalness: 0.8 }),
    deck:     new THREE.MeshStandardMaterial({ color: '#1e2124', roughness: 0.4,  metalness: 0.7 }),
    key:      new THREE.MeshStandardMaterial({ color: '#1c1e22', roughness: 0.5,  metalness: 0.4,  emissive: new THREE.Color('#2DD4BF'), emissiveIntensity: 0.06 }),
    keyFn:    new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.48, metalness: 0.45 }),
    // ESC: coral/red — stands out immediately
    keyEsc:   new THREE.MeshStandardMaterial({ color: '#221010', roughness: 0.4,  metalness: 0.5, emissive: new THREE.Color('#FF5050'), emissiveIntensity: 0.08 }),
    touchpad: new THREE.MeshStandardMaterial({ color: '#252830', roughness: 0.3,  metalness: 0.8 }),
    hinge:    new THREE.MeshStandardMaterial({ color: '#808590', roughness: 0.15, metalness: 0.9 }),
    lidBack:  new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.25, metalness: 0.7 }),
    screen:   new THREE.MeshBasicMaterial({ color: '#040408' }),
    notch:    new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.3,  metalness: 0.6 }),
    rubber:   new THREE.MeshStandardMaterial({ color: '#111113', roughness: 0.9,  metalness: 0.0 }),
  }), []);

  const { touchpadTex, deckZoneTex, fnIconTex, hingeBandTex } = useMemo(() => {
    // ── Touchpad branding ──
    const tpC = document.createElement('canvas');
    tpC.width = 512; tpC.height = 256;
    const tp = tpC.getContext('2d')!;
    tp.clearRect(0, 0, 512, 256);
    tp.font = 'bold 22px "Courier New", monospace';
    tp.fillStyle = 'rgba(45,212,191,0.30)';
    tp.textAlign = 'center'; tp.textBaseline = 'middle';
    tp.fillText('ZARAK_OS', 256, 115);
    tp.beginPath(); tp.moveTo(156, 133); tp.lineTo(356, 133);
    tp.strokeStyle = 'rgba(45,212,191,0.12)'; tp.lineWidth = 1; tp.stroke();
    tp.font = '11px "Courier New", monospace';
    tp.fillStyle = 'rgba(45,212,191,0.15)';
    tp.fillText('AES-256 · GCM', 256, 152);
    const tpCo: [number, number, number, number][] = [[28,22,1,1],[484,22,-1,1],[28,234,1,-1],[484,234,-1,-1]];
    tp.strokeStyle = 'rgba(45,212,191,0.10)';
    tpCo.forEach(([cx,cy,dx,dy]) => { tp.beginPath(); tp.moveTo(cx+dx*16,cy); tp.lineTo(cx,cy); tp.lineTo(cx,cy+dy*16); tp.stroke(); });

    // ── Keyboard zone skin — circuit grid background ──
    const dzC = document.createElement('canvas');
    dzC.width = 1024; dzC.height = 512;
    const dz = dzC.getContext('2d')!;

    // Base fill
    dz.fillStyle = '#060c0b';
    dz.fillRect(0, 0, 1024, 512);

    // Dot grid — 32px spacing, tiny cyan dots
    dz.fillStyle = 'rgba(45,212,191,0.10)';
    for (let gx = 16; gx < 1024; gx += 32) {
      for (let gy = 16; gy < 512; gy += 32) {
        dz.beginPath(); dz.arc(gx, gy, 1.5, 0, Math.PI * 2); dz.fill();
      }
    }

    // Key row wells — fn:y≈0-72, R1:y≈147-219, R2:y≈294-366, R3:y≈440-512
    const wells: [number, number][] = [[0, 72], [147, 219], [294, 366], [440, 512]];
    wells.forEach(([y0, y1]) => {
      dz.fillStyle = 'rgba(45,212,191,0.045)';
      dz.fillRect(0, y0, 1024, y1 - y0);
      // shadow top edge
      const st = dz.createLinearGradient(0, y0, 0, y0 + 20);
      st.addColorStop(0, 'rgba(0,0,0,0.24)'); st.addColorStop(1, 'rgba(0,0,0,0)');
      dz.fillStyle = st; dz.fillRect(0, y0, 1024, 20);
      // shadow bottom edge
      const sb = dz.createLinearGradient(0, y1 - 20, 0, y1);
      sb.addColorStop(0, 'rgba(0,0,0,0)'); sb.addColorStop(1, 'rgba(0,0,0,0.24)');
      dz.fillStyle = sb; dz.fillRect(0, y1 - 20, 1024, 20);
    });

    // Center dashed circuit trace
    dz.save();
    dz.setLineDash([18, 12]);
    dz.strokeStyle = 'rgba(45,212,191,0.06)'; dz.lineWidth = 1;
    dz.beginPath(); dz.moveTo(0, 256); dz.lineTo(1024, 256); dz.stroke();
    dz.restore();

    // Edge vignette
    const _vigT = dz.createLinearGradient(0, 0, 0, 80);
    _vigT.addColorStop(0, 'rgba(0,0,0,0.20)'); _vigT.addColorStop(1, 'rgba(0,0,0,0)');
    dz.fillStyle = _vigT; dz.fillRect(0, 0, 1024, 80);
    const _vigB = dz.createLinearGradient(0, 432, 0, 512);
    _vigB.addColorStop(0, 'rgba(0,0,0,0)'); _vigB.addColorStop(1, 'rgba(0,0,0,0.20)');
    dz.fillStyle = _vigB; dz.fillRect(0, 432, 1024, 80);
    const _vigL = dz.createLinearGradient(0, 0, 80, 0);
    _vigL.addColorStop(0, 'rgba(0,0,0,0.20)'); _vigL.addColorStop(1, 'rgba(0,0,0,0)');
    dz.fillStyle = _vigL; dz.fillRect(0, 0, 80, 512);
    const _vigR = dz.createLinearGradient(944, 0, 1024, 0);
    _vigR.addColorStop(0, 'rgba(0,0,0,0)'); _vigR.addColorStop(1, 'rgba(0,0,0,0.20)');
    dz.fillStyle = _vigR; dz.fillRect(944, 0, 80, 512);

    // ── Fn row icon keycaps ──
    // Plane: args=[1.82, 0.10], center z=-0.30 → covers fn key depth
    // Canvas 2048×256. Slot width = 2048/14 = ~146px
    // Key area in canvas: y≈46–210 (v 0.18–0.82 matching key edges)
    // Canvas 4096×450 → 9.1:1 aspect; plane 1.82×0.200 → 9.1:1
    // Design principle: ONE large symbol per key, centered. Camera angle compresses
    // the plane ~12:1 vertically so only centre-of-key text survives. No secondary text.
    const fnC = document.createElement('canvas');
    fnC.width = 4096; fnC.height = 450;
    const fi = fnC.getContext('2d')!;
    fi.clearRect(0, 0, 4096, 450);

    type Icon = { sym: string; color: string };
    const C = '#2DD4BF';
    const icons: Icon[] = [
      { sym: '✕',  color: '#FF4444' },  // ESC
      { sym: '$',  color: C         },  // Terminal
      { sym: '◉',  color: C         },  // About
      { sym: '◇',  color: C         },  // Skills
      { sym: '◆',  color: C         },  // Experience
      { sym: '@',  color: C         },  // Contact
      { sym: '↓',  color: C         },  // CV
      { sym: '↗',  color: C         },  // LinkedIn
      { sym: 'λ',  color: C         },  // Ask Zarak
      { sym: '◎',  color: C         },  // VenderScope
      { sym: '◑',  color: C         },  // Background Studio
      { sym: '⊞',  color: C         },  // Mission Control
      { sym: '⌘',  color: C         },  // Spotlight
      { sym: '⏻',  color: '#F59E0B' },  // Lock
    ];

    // cx derived from physical key formula: (col - 6.5) * 0.090 world → canvas
    // cx_canvas = ((col - 6.5) * 0.090 + 0.65) / 1.30 * 4096 = (i - 6.5) * kPx + 2048
    const kPx = (0.090 / 1.30) * 4096; // 283.6px per key

    icons.forEach(({ sym, color }, i) => {
      const cx   = (i - 6.5) * kPx + 2048;
      const sLen = [...sym].length;
      const sz   = sLen <= 1 ? 160 : 112;
      const cy   = 225;
      const font = `${sz}px "Segoe UI Symbol", "Courier New", monospace`;

      // Pass 1 — wide ambient aura
      fi.save();
      fi.font = font;
      fi.textAlign = 'center'; fi.textBaseline = 'middle';
      fi.shadowColor = color; fi.shadowBlur = 65;
      fi.globalAlpha = 0.38;
      fi.fillStyle = color;
      fi.fillText(sym, cx, cy);
      fi.restore();

      // Pass 2 — crisp sharp glyph
      fi.save();
      fi.font = font;
      fi.textAlign = 'center'; fi.textBaseline = 'middle';
      fi.shadowColor = color; fi.shadowBlur = 12;
      fi.fillStyle = color;
      fi.fillText(sym, cx, cy);
      fi.restore();
    });

    // ── Hinge brand band ──
    // Visible strip between fn row back edge (z=−0.332) and hinge LED (z=−0.544)
    // Plane: center z=−0.435, depth 0.200
    const hbC = document.createElement('canvas');
    hbC.width = 2048; hbC.height = 256;
    const hb = hbC.getContext('2d')!;

    // Background
    hb.fillStyle = '#07100f';
    hb.fillRect(0, 0, 2048, 256);

    // Top + bottom border
    hb.strokeStyle = 'rgba(45,212,191,0.28)'; hb.lineWidth = 1.5;
    hb.beginPath(); hb.moveTo(0, 2);   hb.lineTo(2048, 2);   hb.stroke();
    hb.beginPath(); hb.moveTo(0, 253); hb.lineTo(2048, 253); hb.stroke();

    // Horizontal circuit trace (dashed)
    hb.save();
    hb.setLineDash([14, 9]);
    hb.strokeStyle = 'rgba(45,212,191,0.14)'; hb.lineWidth = 1;
    hb.beginPath(); hb.moveTo(0, 128); hb.lineTo(2048, 128); hb.stroke();
    hb.restore();

    // Circuit dots + vertical ticks every 140px
    for (let dx = 70; dx < 2048; dx += 140) {
      hb.beginPath(); hb.arc(dx, 128, 2.5, 0, Math.PI * 2);
      hb.fillStyle = 'rgba(45,212,191,0.45)'; hb.fill();
      hb.beginPath(); hb.moveTo(dx, 112); hb.lineTo(dx, 144);
      hb.strokeStyle = 'rgba(45,212,191,0.18)'; hb.lineWidth = 1; hb.stroke();
    }

    // Left label: AES-256-GCM
    hb.font = 'bold 26px "Courier New", monospace';
    hb.fillStyle = 'rgba(45,212,191,0.72)';
    hb.textAlign = 'left'; hb.textBaseline = 'middle';
    hb.fillText('AES-256-GCM', 44, 128);

    // Center slot reserved for Nyan Cat mesh sticker (ZARAK_OS removed)

    // Right label: INFOSEC // GRC
    hb.font = 'bold 26px "Courier New", monospace';
    hb.fillStyle = 'rgba(192,132,252,0.68)';
    hb.textAlign = 'right'; hb.textBaseline = 'middle';
    hb.fillText('INFOSEC  //  GRC', 2004, 128);

    // Corner L-marks
    hb.strokeStyle = 'rgba(45,212,191,0.32)'; hb.lineWidth = 1.5;
    const bL = 14;
    ([[ 10,  8,  1,  1],
      [2038,  8, -1,  1],
      [ 10, 247,  1, -1],
      [2038, 247, -1, -1]] as [number,number,number,number][]).forEach(([cx,cy,dx,dy]) => {
      hb.beginPath(); hb.moveTo(cx+dx*bL, cy); hb.lineTo(cx, cy); hb.lineTo(cx, cy+dy*bL); hb.stroke();
    });

    // Helper: crisp CanvasTexture — no mipmaps = no blur at distance
    const mkTex = (c: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(c);
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    };

    return {
      touchpadTex:  mkTex(tpC),
      deckZoneTex:  mkTex(dzC),
      fnIconTex:    mkTex(fnC),
      hingeBandTex: mkTex(hbC),
    };
  }, []);

  // ── Nyan Cat — manual GIF decode (gifuct-js) ──
  // Browser-based GIF animation (TextureLoader img, off-screen DOM img) is throttled by
  // Chromium for elements outside the viewport. Instead: parse frames ourselves,
  // advance by elapsed time in useFrame — deterministic, browser-independent.
  const gifFramesRef = useRef<ParsedFrame[]>([]);
  const gifFrameIdx = useRef(0);
  const gifElapsedMs = useRef(0);

  const { nyanCanvas, nyanTex } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 400; c.height = 280;
    const tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { nyanCanvas: c, nyanTex: tex };
  }, []);

  useEffect(() => {
    fetch(nyanGifSrc)
      .then(r => r.arrayBuffer())
      .then(buf => {
        gifFramesRef.current = decompressFrames(parseGIF(buf), true);
      });
    return () => { nyanTex.dispose(); };
  }, [nyanTex]);

  useFrame((_, delta) => {
    const frames = gifFramesRef.current;
    if (!frames.length) return;

    const frame = frames[gifFrameIdx.current];
    // gifuct-js returns delay already in ms (70 = 70ms = ~14fps)
    const delayMs = frame.delay || 70;
    // Cap delta to one frame duration — prevents catch-up burst after minimize/tab-switch
    gifElapsedMs.current += Math.min(delta * 1000, delayMs);
    if (gifElapsedMs.current < delayMs) return;

    gifElapsedMs.current -= delayMs;
    gifFrameIdx.current = (gifFrameIdx.current + 1) % frames.length;

    const f = frames[gifFrameIdx.current];
    const ctx = nyanCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, nyanCanvas.width, nyanCanvas.height);
    ctx.putImageData(
      new ImageData(f.patch, f.dims.width, f.dims.height),
      f.dims.left,
      f.dims.top,
    );
    nyanTex.needsUpdate = true;
  });

  // Screen corners — thin-bezel 16": screen [1.95, 1.05], half-w=0.975, half-h=0.525
  useEffect(() => {
    if (!lidRef.current) return;
    lidRef.current.updateWorldMatrix(true, false);
    const tl = new THREE.Vector3(-0.975, 0, 1.065);
    const br = new THREE.Vector3(+0.975, 0, 0.015);
    lidRef.current.localToWorld(tl);
    lidRef.current.localToWorld(br);
    onCornersReady(tl, br);
  }, [onCornersReady]);

  // 14-column key grid (16" proportions)
  const keyPositions = useMemo<[number, number, number][]>(() => {
    const positions: [number, number, number][] = [];
    const rowZ = [-0.30, -0.17, -0.04, 0.09];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 14; col++) {
        positions.push([(col - 6.5) * 0.090, 0.056, rowZ[row]]);
      }
    }
    return positions;
  }, []);

  const feetPositions = useMemo<[number, number, number][]>(() => [
    [-0.88, 0.0, -0.44], [+0.88, 0.0, -0.44],
    [-0.88, 0.0, +0.44], [+0.88, 0.0, +0.44],
  ], []);

  return (
    <group>
      {/* ─── BODY (16" width = 2.0) ─── */}
      <mesh material={mats.body} position={[0, 0.025, 0]}>
        <boxGeometry args={[2.0, 0.05, 1.1]} />
      </mesh>

      {/* Bottom chamfer strip */}
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[1.98, 0.004, 1.08]} />
        <meshStandardMaterial color="#a0a4ac" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* ─── RUBBER FEET ─── */}
      {feetPositions.map((pos, i) => (
        <mesh key={`foot-${i}`} material={mats.rubber} position={pos}>
          <cylinderGeometry args={[0.025, 0.025, 0.004, 12]} />
        </mesh>
      ))}

      {/* ─── KEYBOARD DECK ─── */}
      <mesh material={mats.deck} position={[0, 0.053, 0.02]}>
        <boxGeometry args={[1.82, 0.005, 0.95]} />
      </mesh>

      {/* Keyboard zone skin overlay
          Width 1.30 matches physical key span (14 cols × 0.090 + margins = 1.242) with small padding.
          Was 1.80 wide → fully-opaque dark canvas fills bled out 0.28 units beyond edge keys. */}
      <mesh position={[0, 0.0561, -0.105]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.30, 0.454]} />
        <meshBasicMaterial map={deckZoneTex} transparent depthWrite={false} />
      </mesh>

      {/* ── ICON KEYCAPS — fn row overlay ──
          Width 1.30: slot width = 1.30/14 = 0.0929 ≈ key spacing 0.090 → near-perfect icon alignment.
          Was 1.82 wide → transparent canvas edges revealed deckZone dark fills as black boxes. */}
      <mesh position={[0, 0.059, -0.30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.30, 0.200]} />
        <meshBasicMaterial map={fnIconTex} transparent depthWrite={false} />
      </mesh>

      {/* ── HINGE BRAND BAND ──
          Strip between fn row back (z=−0.332) and hinge LED (z=−0.544)
          Center z=−0.435, depth 0.200 */}
      <mesh position={[0, 0.0562, -0.435]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.82, 0.200]} />
        <meshBasicMaterial map={hingeBandTex} transparent depthWrite={false} />
      </mesh>

      {/* ── NYAN CAT animated GIF — replaces ZARAK_OS center slot in hinge band ──
          400×280 native → plane 0.28×0.196 (1.429:1), fits within band depth 0.200 */}
      <mesh position={[0, 0.0635, -0.437]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, 0.196]} />
        <meshBasicMaterial map={nyanTex} transparent alphaTest={0.1} />
      </mesh>

      {/* Touchpad */}
      <mesh material={mats.touchpad} position={[0, 0.053, 0.30]}>
        <boxGeometry args={[0.52, 0.003, 0.29]} />
      </mesh>

      {/* Touchpad border — cyan emissive accent */}
      <mesh position={[0, 0.054, 0.30]}>
        <boxGeometry args={[0.522, 0.001, 0.292]} />
        <meshStandardMaterial color="#1a2420" emissive="#2DD4BF" emissiveIntensity={0.75} roughness={0.1} metalness={0} />
      </mesh>

      {/* Touchpad branding overlay */}
      <mesh position={[0, 0.0549, 0.30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.48, 0.25]} />
        <meshBasicMaterial map={touchpadTex} transparent depthWrite={false} />
      </mesh>

      {/* ─── KEYS ─── */}

      {/* ESC key — coral/red emissive (col 0, fn row) */}
      <mesh material={mats.keyEsc} position={keyPositions[0]}>
        <boxGeometry args={[0.072, 0.004, 0.064]} />
      </mesh>

      {/* Fn row cols 1–13 — cyan screen-lit */}
      {keyPositions.slice(1, 14).map((pos, i) => (
        <mesh key={`key-fn-${i}`} material={mats.keyFn} position={pos}>
          <boxGeometry args={[0.072, 0.004, 0.064]} />
        </mesh>
      ))}

      {/* Main rows (indices 14–55) */}
      {keyPositions.slice(14).map((pos, i) => (
        <mesh key={`key-${i}`} material={mats.key} position={pos}>
          <boxGeometry args={[0.072, 0.004, 0.064]} />
        </mesh>
      ))}

      {/* Spacebar */}
      <mesh material={mats.key} position={[0, 0.056, 0.195]}>
        <boxGeometry args={[0.60, 0.004, 0.064]} />
      </mesh>

      {/* Backlight bleed — thin emissive strips between key rows */}
      {([-0.235, -0.105, 0.025] as number[]).map((z, i) => (
        <mesh key={`bleed-${i}`} position={[0, 0.0555, z]}>
          <boxGeometry args={[1.26, 0.001, 0.003]} />
          <meshStandardMaterial color="#041412" emissive="#2DD4BF" emissiveIntensity={0.35} roughness={0.05} metalness={0} />
        </mesh>
      ))}

      {/* ─── HINGE ─── */}
      <mesh material={mats.hinge} position={[0, 0.05, -0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 1.98, 14]} />
      </mesh>

      {/* Illuminated hinge accent — thin cyan LED strip */}
      <mesh position={[0, 0.062, -0.544]}>
        <boxGeometry args={[1.94, 0.004, 0.003]} />
        <meshStandardMaterial color="#0a1a18" emissive="#2DD4BF" emissiveIntensity={1.2} roughness={0.05} metalness={0} />
      </mesh>

      {/* ─── LID GROUP (pivot = hinge) ─── */}
      <group ref={lidRef} position={[0, 0.05, -0.55]} rotation={[-(Math.PI * 0.6), 0, 0]}>

        <mesh material={mats.lidBack} position={[0, 0.018, 0.54]}>
          <boxGeometry args={[2.0, 0.035, 1.08]} />
        </mesh>

        {/* Silver edge trim */}
        <mesh position={[0, 0.036, 0.54]}>
          <boxGeometry args={[2.002, 0.002, 1.082]} />
          <meshStandardMaterial color="#b0b4bc" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Screen — thin-bezel 1.95 × 1.05 */}
        <mesh position={[0, 0.002, 0.54]} rotation={[Math.PI / 2, 0, 0]} material={mats.screen}>
          <planeGeometry args={[1.95, 1.05]} />
        </mesh>

        {/* Bezel border — hair-thin frame */}
        <mesh position={[0, 0.001, 0.54]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.96, 1.056]} />
          <meshStandardMaterial color="#101012" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Camera notch */}
        <mesh material={mats.notch} position={[0, 0.005, 1.038]}>
          <boxGeometry args={[0.08, 0.007, 0.008]} />
        </mesh>

        {/* Screen glow bounce */}
        <pointLight position={[0, 0.15, 0.54]} intensity={0.5} color="#2DD4BF" distance={3.5} decay={2} />
      </group>
    </group>
  );
}
