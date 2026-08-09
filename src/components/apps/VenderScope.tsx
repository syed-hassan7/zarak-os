import { ArrowLeft, ArrowRight, ExternalLink, Lock, RotateCw } from 'lucide-react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { AppComponentProps } from '../../os/types';

const VENDERSCOPE_URL = 'https://venderscope.vercel.app';

const MOCK_RISK_CATEGORIES = [
  { name: 'Breach History', score: 91 },
  { name: 'Data Exposure', score: 82 },
  { name: 'Compliance Posture', score: 76 },
  { name: 'Patch Cadence', score: 64 },
] as const;

export default function VenderScope({ isMobile = false }: AppComponentProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-os-bg/65">
      <div
        className={`shrink-0 border-b border-os-accent/12 bg-white/[0.055] backdrop-blur-xl saturate-[150%] ${
          isMobile ? 'px-3 py-3' : 'flex h-12 items-center gap-3 px-4'
        }`}
      >
        <div className={`${isMobile ? 'flex items-center gap-2' : 'contents'}`}>
          <div className="flex items-center gap-2 text-os-text-sec/70">
            <button
              type="button"
              aria-label="Back"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035]"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              aria-label="Forward"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035]"
            >
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-os-bg/55 px-3 py-1.5 shadow-inner shadow-black/10">
            <Lock size={12} className="shrink-0 text-os-accent" />
            <span className="truncate text-[11px] text-os-text-pri/82">venderscope.vercel.app</span>
          </div>

          <RotateCw size={14} className="shrink-0 text-os-text-sec/70" />
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'p-4' : 'p-7'}`}>
        <div className={`mx-auto flex min-h-full max-w-4xl flex-col ${isMobile ? 'justify-start gap-4' : 'justify-center gap-5'}`}>
          {isMobile && (
            <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">
                    External product preview
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-os-text-pri">
                    venderscope.browser
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-os-text-sec">
                    Mobile keeps this as a fast launch surface: review the flagship project summary,
                    then open the live site cleanly in the browser.
                  </p>
                </div>
                <a
                  href={VENDERSCOPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-os-accent/20 bg-os-accent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-os-bg shadow-lg shadow-os-accent/10"
                >
                  <span>Launch</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-os-surface/45 shadow-2xl shadow-black/20">
            <div className={`border-b border-white/10 bg-white/[0.035] ${isMobile ? 'px-4 py-3.5' : 'px-5 py-4'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-os-text-sec/55">Web preview</p>
                  <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-os-text-pri">
                    venderscope - continuous vendor risk intelligence
                  </h2>
                </div>
                <a
                  href={VENDERSCOPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-os-accent/20 bg-os-accent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-os-bg shadow-lg shadow-os-accent/10 transition-[filter,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg motion-reduce:transition-none"
                >
                  <span>Launch</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <a
              href={VENDERSCOPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block outline-none focus-visible:ring-2 focus-visible:ring-os-accent/70 focus-visible:ring-inset ${isMobile ? 'p-4' : 'p-6'}`}
            >
              <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] transition-colors group-hover:border-white/18 ${isMobile ? 'p-5' : 'p-7'}`}>
                <div className="absolute inset-x-0 top-0 h-9 border-b border-white/8 bg-white/[0.035]" />
                <div className="relative mb-9 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F5BF4F]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#62C554]/80" />
                </div>

                <div className="relative">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-os-text-pri/90">
                      Sample vendor: acme-payments-ltd
                    </span>
                    <span className="rounded-full border border-os-accent/15 bg-os-accent/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-os-accent/85">
                      Illustrative data
                    </span>
                  </div>
                  <p className="mb-5 text-xs text-os-text-sec/65">
                    Mock risk score preview — the live tool scores real vendors continuously.
                  </p>
                  <div className={isMobile ? 'h-40' : 'h-48'}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[...MOCK_RISK_CATEGORIES]}
                        margin={{ top: 4, right: 28, bottom: 4, left: 4 }}
                        barCategoryGap={isMobile ? 10 : 14}
                      >
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={isMobile ? 96 : 130}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'rgba(226,232,240,0.65)', fontSize: isMobile ? 10 : 11 }}
                        />
                        <Bar dataKey="score" radius={6} fill="#2dd4bf" fillOpacity={0.8} barSize={isMobile ? 12 : 14}>
                          <LabelList
                            dataKey="score"
                            position="right"
                            fill="rgba(226,232,240,0.85)"
                            fontSize={isMobile ? 10 : 11}
                            formatter={(value: number) => `${value}/100`}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="relative mt-7 flex items-center justify-between border-t border-white/8 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-os-text-sec/55">
                    external link detected
                  </span>
                  <span className="text-xs font-semibold text-os-accent transition-colors group-hover:text-os-text-pri">
                    Open live site
                  </span>
                </div>
              </div>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
