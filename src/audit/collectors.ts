/**
 * audit.sys data collectors — every number here is measured live against
 * this real pageload / this real deployed origin, or baked at build time
 * from a real `npm audit` run. Nothing is a fabricated or hardcoded score.
 */

export interface WebVitalMetric {
  name: 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP';
  value: number | null;
  rating: 'good' | 'needs-improvement' | 'poor' | 'pending';
  unit: 'ms' | 'score';
}

const VITAL_THRESHOLDS: Record<WebVitalMetric['name'], { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

function rate(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  const t = VITAL_THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

type VitalsListener = (metrics: Record<string, WebVitalMetric>) => void;

/**
 * Subscribes to real Core Web Vitals for THIS pageload via the `web-vitals`
 * library (the same lib backing Chrome UX Report / PageSpeed Insights).
 * Calls back incrementally as each metric becomes available — some (LCP,
 * CLS) only finalize on page hide/visibility change, so late values are
 * normal and expected, not a bug.
 */
export function subscribeToWebVitals(onUpdate: VitalsListener): () => void {
  let cancelled = false;
  const collected: Record<string, WebVitalMetric> = {};

  const emit = () => {
    if (!cancelled) onUpdate({ ...collected });
  };

  import('web-vitals')
    .then(({ onLCP, onCLS, onINP, onTTFB, onFCP }) => {
      if (cancelled) return;

      onLCP((metric) => {
        collected.LCP = { name: 'LCP', value: metric.value, rating: rate('LCP', metric.value), unit: 'ms' };
        emit();
      });
      onCLS((metric) => {
        collected.CLS = { name: 'CLS', value: metric.value, rating: rate('CLS', metric.value), unit: 'score' };
        emit();
      });
      onINP((metric) => {
        collected.INP = { name: 'INP', value: metric.value, rating: rate('INP', metric.value), unit: 'ms' };
        emit();
      });
      onTTFB((metric) => {
        collected.TTFB = { name: 'TTFB', value: metric.value, rating: rate('TTFB', metric.value), unit: 'ms' };
        emit();
      });
      onFCP((metric) => {
        collected.FCP = { name: 'FCP', value: metric.value, rating: rate('FCP', metric.value), unit: 'ms' };
        emit();
      });
    })
    .catch(() => {
      /* web-vitals failed to load — the UI just shows "pending" indefinitely */
    });

  return () => {
    cancelled = true;
  };
}

export interface DeviceSnapshot {
  cores: number;
  memoryGb: number | null;
  webglRenderer: string | null;
  webglVersion: 'webgl2' | 'webgl' | 'none';
  connection: string | null;
}

/** Real navigator/WebGL introspection of the visitor's own machine. */
export function collectDeviceSnapshot(): DeviceSnapshot {
  const cores = navigator.hardwareConcurrency ?? 0;
  const memoryGb = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;

  let webglRenderer: string | null = null;
  let webglVersion: DeviceSnapshot['webglVersion'] = 'none';

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    const gl = gl2 ?? canvas.getContext('webgl');
    if (gl) {
      webglVersion = gl2 ? 'webgl2' : 'webgl';
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        webglRenderer = (gl as WebGLRenderingContext).getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL,
        ) as string;
      }
    }
    canvas.remove();
  } catch {
    /* ignore */
  }

  return {
    cores,
    memoryGb,
    webglRenderer,
    webglVersion,
    connection: conn?.effectiveType ?? null,
  };
}

export interface SecurityHeaderCheck {
  header: string;
  present: boolean;
  value: string | null;
  description: string;
}

const CHECKED_HEADERS: { header: string; description: string }[] = [
  { header: 'strict-transport-security', description: 'Forces HTTPS on every future visit' },
  { header: 'content-security-policy', description: 'Restricts what scripts/styles/frames can load' },
  { header: 'x-content-type-options', description: 'Blocks MIME-sniffing attacks' },
  { header: 'x-frame-options', description: 'Blocks clickjacking via iframes' },
  { header: 'referrer-policy', description: 'Limits what leaks via the Referer header' },
  { header: 'permissions-policy', description: 'Disables unused browser APIs (camera, mic, geo)' },
];

/**
 * Fetches this site's OWN live response headers (same-origin, no CORS
 * issue) and reports which security headers are actually present right
 * now on the deployed origin — not a static claim, a live check.
 */
export async function checkSecurityHeaders(): Promise<{ checks: SecurityHeaderCheck[]; origin: string }> {
  const origin = window.location.origin;
  const res = await fetch(window.location.href, { method: 'GET', cache: 'no-store' });

  const checks = CHECKED_HEADERS.map(({ header, description }) => {
    const value = res.headers.get(header);
    return { header, present: value !== null, value, description };
  });

  return { checks, origin };
}

export interface BundleChunkInfo {
  name: string;
  approxKb: number;
}

/**
 * Best-effort read of what actually loaded for THIS session via the
 * Resource Timing API — real transferred bytes for real fetched chunks,
 * not a hardcoded build-time number that could drift from production.
 */
export function collectLoadedChunks(): BundleChunkInfo[] {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return [];

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  return entries
    .filter((entry) => entry.name.endsWith('.js') && entry.name.includes('/assets/'))
    .map((entry) => {
      const fileName = entry.name.split('/').pop() ?? entry.name;
      const bytes = entry.transferSize || entry.encodedBodySize || 0;
      return { name: fileName, approxKb: Math.round((bytes / 1024) * 10) / 10 };
    })
    .filter((chunk) => chunk.approxKb > 0)
    .sort((a, b) => b.approxKb - a.approxKb);
}

export interface AccessibilityResult {
  violations: { id: string; impact: string | null; description: string; nodeCount: number }[];
  passCount: number;
  scannedAt: string;
}

/**
 * Runs a real axe-core WCAG scan against the live DOM. Lazy-loaded on
 * demand only — axe-core is ~500KB, never fetched unless this tab opens.
 */
export async function runAccessibilityScan(): Promise<AccessibilityResult> {
  const mod = await import('axe-core');
  const axe = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const results = await (axe as unknown as { run: typeof import('axe-core').run }).run(document, {
    resultTypes: ['violations', 'passes'],
  });

  return {
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      nodeCount: v.nodes.length,
    })),
    passCount: results.passes.length,
    scannedAt: new Date().toISOString(),
  };
}
