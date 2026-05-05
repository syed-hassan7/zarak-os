import { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, FileDown, FileText, LoaderCircle, ShieldCheck } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { recruiterProfile } from '../../data/recruiterProfile';

if (typeof window !== 'undefined' && 'Worker' in window && !GlobalWorkerOptions.workerPort) {
  GlobalWorkerOptions.workerPort = new Worker(
    new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url),
    { type: 'module' },
  );
}

function PdfLoadingState() {
  return (
    <div className="flex h-full min-h-[340px] items-center justify-center bg-os-bg/94 p-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-os-accent/15 bg-os-accent/[0.08] text-os-accent">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <h4 className="mt-5 text-xl font-semibold text-os-text-pri">Rendering document preview</h4>
        <p className="mt-3 text-sm leading-6 text-os-text-sec">
          Loading the in-app PDF renderer so the CV can be reviewed even when browser PDF plugins are blocked.
        </p>
      </div>
    </div>
  );
}

function PdfUnavailableState({
  handleDownload,
  reason,
}: {
  handleDownload: () => void;
  reason: string;
}) {
  return (
    <div className="flex h-full min-h-[340px] items-center justify-center bg-os-bg/94 p-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-os-warn/15 bg-os-warn/[0.08] text-os-warn">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="mt-5 text-xl font-semibold text-os-text-pri">Preview unavailable in this browser</h4>
        <p className="mt-3 text-sm leading-6 text-os-text-sec">{reason}</p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <a
            href={recruiterProfile.cv.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-os-bg px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-os-text-pri"
          >
            <ExternalLink size={14} />
            <span>Open in new tab</span>
          </a>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-os-warn/20 bg-os-warn px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-os-bg"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfCanvasViewer({ handleDownload }: { handleDownload: () => void }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewerWidth, setViewerWidth] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState(
    'The in-app PDF renderer could not load the document. Open the file in a new tab or download it directly.',
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => {
      const nextWidth = Math.floor(viewport.clientWidth);
      setViewerWidth((current) => (current === nextWidth ? current : nextWidth));
    };

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.floor(entries[0]?.contentRect.width ?? viewport.clientWidth ?? 0);
      setViewerWidth((current) => (current === nextWidth ? current : nextWidth));
    });

    updateWidth();
    observer.observe(viewport);
    window.addEventListener('resize', updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewerWidth <= 0) return;

    let cancelled = false;
    const render = async () => {
      setStatus('loading');
      setErrorMessage(
        'The in-app PDF renderer could not load the document. Open the file in a new tab or download it directly.',
      );
      container.innerHTML = '';

      try {
        const task = getDocument({
          url: recruiterProfile.cv.fileUrl,
          useWorkerFetch: false,
        });
        const pdf = await task.promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }

        const fragment = document.createDocumentFragment();
        const targetWidth = Math.max(320, viewerWidth - 32);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const initialViewport = page.getViewport({ scale: 1 });
          const scale = targetWidth / initialViewport.width;
          const viewport = page.getViewport({ scale });

          const pageFrame = document.createElement('section');
          pageFrame.className =
            'mx-auto w-full max-w-[920px] overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-2xl shadow-black/15';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Canvas rendering context is unavailable.');
          }

          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

          await page.render({ canvas, canvasContext: context, viewport }).promise;
          pageFrame.appendChild(canvas);
          fragment.appendChild(pageFrame);
        }

        if (cancelled) {
          await pdf.destroy();
          return;
        }

        container.replaceChildren(fragment);
        setStatus('ready');
        await pdf.destroy();
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? `${error.message} Open the file in a new tab or download it directly.`
            : 'The in-app PDF renderer could not load the document. Open the file in a new tab or download it directly.',
        );
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [viewerWidth]);

  return (
    <div ref={viewportRef} className="relative h-full min-h-[340px]">
      {status === 'error' ? <PdfUnavailableState handleDownload={handleDownload} reason={errorMessage} /> : null}
      {status !== 'error' ? (
        <div
          ref={containerRef}
          className={`h-full overflow-y-auto p-4 custom-scrollbar ${status === 'ready' ? 'grid content-start gap-5 bg-[#ccd5df]' : 'pointer-events-none absolute inset-0 opacity-0'}`}
        />
      ) : null}
      {status === 'loading' ? <PdfLoadingState /> : null}
    </div>
  );
}

export default function DownloadCV() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = recruiterProfile.cv.fileUrl;
    link.download = recruiterProfile.cv.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-os-bg/70">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.04] via-transparent to-os-warn/[0.04]" />

      <div className="relative flex h-full flex-col overflow-y-auto p-4 sm:p-7 custom-scrollbar">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5">
          <header className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-os-warn/20 bg-os-warn/[0.08] text-os-warn">
                  <FileDown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/70">
                    Document viewer
                  </p>
                  <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-os-text-pri">
                    CV.app
                  </h2>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-os-accent/15 bg-os-accent/[0.055] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-os-accent/85 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>native preview</span>
              </div>
            </div>
          </header>

          <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[1.45fr_0.85fr]">
            <div className="flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">Embedded review</p>
                  <h3 className="mt-1 truncate text-lg font-semibold text-os-text-pri">{recruiterProfile.cv.fileName}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={recruiterProfile.cv.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-os-text-pri transition-colors hover:border-white/18 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg"
                  >
                    <ExternalLink size={14} />
                    <span>Open in new tab</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-xl border border-os-warn/20 bg-os-warn px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-os-bg shadow-lg shadow-os-warn/10 transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-warn/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 p-4">
                <div className="h-full overflow-hidden rounded-[1.65rem] border border-black/10 bg-[#dbe2ea] shadow-inner shadow-black/10">
                  <PdfCanvasViewer handleDownload={handleDownload} />
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <section className="rounded-3xl border border-white/10 bg-os-surface/45 p-6 shadow-xl shadow-black/10">
                <div className="border-b border-white/10 pb-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">Document details</p>
                  <h3 className="mt-2 break-all text-lg font-semibold text-os-text-pri">{recruiterProfile.cv.fileName}</h3>
                  <p className="mt-3 text-sm leading-6 text-os-text-sec">
                    Recruiter-friendly PDF review lives directly inside the OS window, with download and full-tab fallback preserved.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Format</div>
                    <div className="mt-2 font-mono text-sm text-os-text-pri">{recruiterProfile.cv.formatLabel}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">File size</div>
                    <div className="mt-2 font-mono text-sm text-os-text-pri">{recruiterProfile.cv.fileSizeLabel}</div>
                  </div>
                  <div className="rounded-2xl border border-os-accent/15 bg-os-accent/[0.055] p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-os-accent/70">Viewer mode</div>
                    <div className="mt-2 font-mono text-xs text-os-accent">PDFJS_CANVAS_RENDER</div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
                <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">Fallback paths</p>
                <p className="mt-3 text-sm leading-6 text-os-text-pri/82">
                  If the embedded viewer is blocked by browser policy, the same local PDF is still accessible through the two direct actions below.
                </p>
                <div className="mt-5 space-y-3">
                  <a
                    href={recruiterProfile.cv.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 transition-colors hover:border-white/18 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-os-text-pri">Open original PDF in a clean browser tab</div>
                        <div className="mt-1 text-xs leading-5 text-os-text-sec">Use the browser PDF viewer when embedded rendering is unavailable.</div>
                      </div>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-os-text-sec" />
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full rounded-2xl border border-os-warn/15 bg-os-warn/[0.06] px-4 py-4 text-left transition-colors hover:border-os-warn/25 hover:bg-os-warn/[0.09]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-os-text-pri">Download the local PDF copy</div>
                        <div className="mt-1 text-xs leading-5 text-os-text-sec">Keep an offline copy of the exact CV bundled with this portfolio.</div>
                      </div>
                      <Download className="mt-0.5 h-4 w-4 shrink-0 text-os-warn" />
                    </div>
                  </button>
                </div>
              </section>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
