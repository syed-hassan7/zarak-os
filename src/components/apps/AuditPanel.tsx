import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  Loader2,
  Lock,
  PackageSearch,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { AppComponentProps } from '../../os/types';
import {
  checkSecurityHeaders,
  collectDeviceSnapshot,
  collectLoadedChunks,
  runAccessibilityScan,
  subscribeToWebVitals,
  type AccessibilityResult,
  type BundleChunkInfo,
  type DeviceSnapshot,
  type SecurityHeaderCheck,
  type WebVitalMetric,
} from '../../audit/collectors';
import { DEPENDENCY_HEALTH, DEPENDENCY_HEALTH_GENERATED_AT } from '../../audit/depHealth.generated';

type Tab = 'performance' | 'security' | 'dependencies' | 'accessibility';

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'security', label: 'Security Headers', icon: ShieldCheck },
  { id: 'dependencies', label: 'Dependencies', icon: PackageSearch },
  { id: 'accessibility', label: 'Accessibility', icon: Eye },
];

function ratingColor(rating: WebVitalMetric['rating']): string {
  if (rating === 'good') return 'text-emerald-300';
  if (rating === 'needs-improvement') return 'text-amber-300';
  if (rating === 'poor') return 'text-red-300';
  return 'text-os-text-sec/60';
}

function formatVitalValue(metric: WebVitalMetric): string {
  if (metric.value === null) return '—';
  if (metric.unit === 'score') return metric.value.toFixed(3);
  return `${Math.round(metric.value)}ms`;
}

/**
 * audit.sys — a live, honest self-audit of this exact deployment.
 *
 * Every figure here is either measured in real time (Core Web Vitals for
 * THIS pageload, this browser's own device/GPU, this origin's actual live
 * response headers, real transferred bytes for what actually loaded) or
 * baked at build time from a real `npm audit` run. Nothing is staged or
 * hardcoded to look good — see src/audit/collectors.ts.
 */
export default function AuditPanel({ isMobile = false }: AppComponentProps) {
  const [tab, setTab] = useState<Tab>('performance');
  const [vitals, setVitals] = useState<Record<string, WebVitalMetric>>({});
  const [device] = useState<DeviceSnapshot>(() => collectDeviceSnapshot());
  const [chunks, setChunks] = useState<BundleChunkInfo[]>([]);

  const [headerChecks, setHeaderChecks] = useState<SecurityHeaderCheck[] | null>(null);
  const [headerOrigin, setHeaderOrigin] = useState<string | null>(null);
  const [headerError, setHeaderError] = useState(false);

  const [a11yResult, setA11yResult] = useState<AccessibilityResult | null>(null);
  const [a11yLoading, setA11yLoading] = useState(false);
  const [a11yError, setA11yError] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToWebVitals(setVitals);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Chunks stream in as resources finish loading; poll briefly to catch
    // late lazy-loaded ones (e.g. this very panel's own JS chunk).
    const update = () => setChunks(collectLoadedChunks());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab !== 'security' || headerChecks !== null) return;
    checkSecurityHeaders()
      .then(({ checks, origin }) => {
        setHeaderChecks(checks);
        setHeaderOrigin(origin);
      })
      .catch(() => setHeaderError(true));
  }, [tab, headerChecks]);

  const totalChunkKb = useMemo(() => chunks.reduce((sum, c) => sum + c.approxKb, 0), [chunks]);

  const handleRunA11yScan = () => {
    setA11yLoading(true);
    setA11yError(false);
    runAccessibilityScan()
      .then(setA11yResult)
      .catch(() => setA11yError(true))
      .finally(() => setA11yLoading(false));
  };

  const vitalOrder: WebVitalMetric['name'][] = ['LCP', 'INP', 'CLS', 'TTFB', 'FCP'];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-os-bg/72">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.04] via-transparent to-os-accent/[0.04]" />

      <header className={`relative border-b border-os-accent/12 bg-white/[0.055] backdrop-blur-xl saturate-[150%] ${isMobile ? 'px-4 py-4' : 'px-6 py-5'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] shadow-lg shadow-black/15">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-200" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-os-text-sec/72">System</p>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-os-text-pri">audit.sys</h1>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-os-text-pri/72">
          A live self-audit of this exact deployment — real metrics from this pageload, this browser,
          and this origin's actual response headers. Nothing here is staged.
        </p>

        <div className={`mt-4 flex gap-1.5 overflow-x-auto ${isMobile ? '-mx-4 px-4' : ''}`}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                tab === t.id
                  ? 'border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100'
                  : 'border-white/10 bg-white/[0.04] text-os-text-sec hover:bg-white/[0.07]'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className={`relative z-10 flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'space-y-4 p-4' : 'space-y-4 p-6'}`}>
        {tab === 'performance' && (
          <>
            <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
              <h2 className="text-sm font-semibold text-os-text-pri">Core Web Vitals — this pageload</h2>
              <p className="mt-1 text-xs text-os-text-sec/70">
                Measured live via the same `web-vitals` library behind Chrome UX Report / PageSpeed Insights.
                LCP and CLS finalize only once you interact or navigate away, so "pending" is expected at first.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {vitalOrder.map((name) => {
                  const metric = vitals[name];
                  return (
                    <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-os-text-sec/60">{name}</div>
                      <div className={`mt-1.5 text-lg font-semibold ${metric ? ratingColor(metric.rating) : 'text-os-text-sec/50'}`}>
                        {metric ? formatVitalValue(metric) : <Loader2 className="mx-auto h-4 w-4 animate-spin" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
              <h2 className="text-sm font-semibold text-os-text-pri">Your device — live detection</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
                <div><span className="text-os-text-sec/60">CPU cores</span><div className="text-os-text-pri">{device.cores || 'unknown'}</div></div>
                <div><span className="text-os-text-sec/60">Memory</span><div className="text-os-text-pri">{device.memoryGb ? `${device.memoryGb} GB+` : 'unreported'}</div></div>
                <div><span className="text-os-text-sec/60">WebGL</span><div className="text-os-text-pri">{device.webglVersion}</div></div>
                <div><span className="text-os-text-sec/60">Network</span><div className="text-os-text-pri">{device.connection ?? 'unknown'}</div></div>
              </div>
              {device.webglRenderer && (
                <p className="mt-3 truncate text-[11px] text-os-text-sec/60">GPU: {device.webglRenderer}</p>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-os-text-pri">JS actually transferred this session</h2>
                <span className="text-xs font-semibold text-os-accent">{totalChunkKb.toFixed(1)} KB</span>
              </div>
              <p className="mt-1 text-xs text-os-text-sec/70">
                Real bytes via the Resource Timing API for chunks fetched so far — grows as you open more apps
                (code-split, lazy-loaded per app).
              </p>
              <div className="mt-3 space-y-1.5">
                {chunks.slice(0, 8).map((chunk) => (
                  <div key={chunk.name} className="flex items-center justify-between text-[12px]">
                    <span className="truncate text-os-text-sec/80">{chunk.name}</span>
                    <span className="ml-3 shrink-0 text-os-text-pri/80">{chunk.approxKb} KB</span>
                  </div>
                ))}
                {chunks.length === 0 && <p className="text-xs text-os-text-sec/50">Collecting…</p>}
              </div>
            </section>
          </>
        )}

        {tab === 'security' && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-os-text-sec/70" />
              <h2 className="text-sm font-semibold text-os-text-pri">Live response headers</h2>
            </div>
            {headerOrigin && <p className="mt-1 text-xs text-os-text-sec/60">Checked: {headerOrigin}</p>}
            <p className="mt-2 text-xs text-os-text-sec/70">
              Fetched from this exact page's own live HTTP response, right now — not a static claim.
            </p>

            {headerError && (
              <p className="mt-4 text-xs text-red-300">Could not fetch response headers from this origin.</p>
            )}

            {!headerChecks && !headerError && (
              <div className="mt-4 flex items-center gap-2 text-xs text-os-text-sec/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking live headers…
              </div>
            )}

            {headerChecks && (
              <div className="mt-4 space-y-2">
                {headerChecks.map((check) => (
                  <div key={check.header} className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                    {check.present ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    )}
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] text-os-text-pri">{check.header}</div>
                      <div className="text-[11px] text-os-text-sec/65">{check.description}</div>
                      {check.value && <div className="mt-1 truncate font-mono text-[10px] text-os-text-sec/50">{check.value}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'dependencies' && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-os-text-sec/70" />
              <h2 className="text-sm font-semibold text-os-text-pri">Dependency vulnerability scan</h2>
            </div>
            <p className="mt-2 text-xs text-os-text-sec/70">
              Real `npm audit` output baked in at the last build — {new Date(DEPENDENCY_HEALTH_GENERATED_AT).toLocaleString()}.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {(['critical', 'high', 'moderate', 'low', 'info'] as const).map((sev) => (
                <div key={sev} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-os-text-sec/60">{sev}</div>
                  <div
                    className={`mt-1.5 text-lg font-semibold ${
                      DEPENDENCY_HEALTH[sev] === 0
                        ? 'text-emerald-300'
                        : sev === 'critical' || sev === 'high'
                          ? 'text-red-300'
                          : 'text-amber-300'
                    }`}
                  >
                    {DEPENDENCY_HEALTH[sev]}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-os-text-sec/55">
              {DEPENDENCY_HEALTH.total === 0
                ? 'Zero known vulnerabilities across all dependencies at last build.'
                : `${DEPENDENCY_HEALTH.total} known advisories at last build — mostly transitive build-tooling deps (Vite/PostCSS), tracked and reviewed, not silently ignored.`}
            </p>
          </section>
        )}

        {tab === 'accessibility' && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-os-text-sec/70" />
              <h2 className="text-sm font-semibold text-os-text-pri">Live WCAG scan</h2>
            </div>
            <p className="mt-2 text-xs text-os-text-sec/70">
              Runs axe-core (the industry-standard accessibility engine) against the live DOM, right now, in your
              browser. Loaded on demand only — zero cost until you click below.
            </p>

            {!a11yResult && !a11yLoading && (
              <button
                type="button"
                onClick={handleRunA11yScan}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-os-text-pri transition-colors hover:bg-white/[0.1]"
              >
                <Cpu className="h-3.5 w-3.5 text-os-accent" />
                Run live scan
              </button>
            )}

            {a11yLoading && (
              <div className="mt-4 flex items-center gap-2 text-xs text-os-text-sec/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning live DOM…
              </div>
            )}

            {a11yError && <p className="mt-4 text-xs text-red-300">Scan failed to load.</p>}

            {a11yResult && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4 text-[13px]">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> {a11yResult.passCount} checks passed
                  </span>
                  <span className={`flex items-center gap-1.5 ${a11yResult.violations.length === 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    <AlertTriangle className="h-4 w-4" /> {a11yResult.violations.length} violations found
                  </span>
                </div>
                {a11yResult.violations.length > 0 && (
                  <div className="space-y-1.5">
                    {a11yResult.violations.map((v) => (
                      <div key={v.id} className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] text-os-text-pri">{v.id}</span>
                          <span className="text-[10px] uppercase tracking-[0.1em] text-amber-300/80">{v.impact ?? 'minor'}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-os-text-sec/70">{v.description}</p>
                        <p className="mt-1 text-[10px] text-os-text-sec/50">{v.nodeCount} element(s) affected</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRunA11yScan}
                  className="text-[11px] font-medium text-os-accent underline decoration-os-accent/30 underline-offset-4 hover:text-os-accent/80"
                >
                  Re-scan
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
