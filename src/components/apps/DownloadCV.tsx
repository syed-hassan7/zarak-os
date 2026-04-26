import { Download, FileDown, FileText, ShieldCheck } from 'lucide-react';

const CV_FILENAME = 'Syed_Zarak_Hassan_CV_2026.pdf';

export default function DownloadCV() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/${CV_FILENAME}`;
    link.download = CV_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-os-bg/65 p-7 custom-scrollbar">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5">
        <header className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-os-warn/20 bg-os-warn/[0.08] text-os-warn">
                <FileDown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/70">
                  Document retrieval
                </p>
                <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-os-text-pri">
                  Download CV
                </h2>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-os-accent/15 bg-os-accent/[0.055] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-os-accent/85 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>verified</span>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-os-surface/45 p-6 text-center shadow-xl shadow-black/10">
            <div className="relative mb-6">
              <div className="flex h-28 w-24 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.055] shadow-xl shadow-black/15">
                <FileText className="h-10 w-10 text-os-text-pri/85" />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-xl border border-os-accent/20 bg-os-bg p-2 text-os-accent shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-3 rounded-xl border border-os-warn/20 bg-os-warn px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-os-bg shadow-lg shadow-os-warn/10 transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-warn/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
            <div className="border-b border-white/10 pb-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">File details</p>
              <h3 className="mt-2 break-all text-lg font-semibold text-os-text-pri">{CV_FILENAME}</h3>
              <p className="mt-3 max-w-md text-xs leading-6 text-os-text-sec">
                Clicking the button will download the most up-to-date version of my professional CV.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Size</div>
                <div className="mt-2 font-mono text-sm text-os-text-pri">116 KB</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-os-text-sec/55">Format</div>
                <div className="mt-2 font-mono text-sm text-os-text-pri">PDF / A4</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-os-warn/15 bg-os-warn/[0.055] p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-os-warn/75">Verification status</div>
              <div className="mt-2 font-mono text-xs text-os-warn">SIGNED_AND_ENCRYPTED</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
