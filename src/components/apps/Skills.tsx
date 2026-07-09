import { Award, Shield } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { certifications, educationHistory, recruiterProfile, skillsRadarMetrics } from '../../data/recruiterProfile';
import type { AppComponentProps } from '../../os/types';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/12 bg-os-bg/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="mb-1 text-xs font-semibold text-os-text-pri">{payload[0].payload.subject}</p>
        <p className="text-[11px] text-os-text-sec">{payload[0].payload.evidence}</p>
      </div>
    );
  }
  return null;
};

export default function Skills({ isMobile = false }: AppComponentProps) {
  const chartHeight = isMobile ? 228 : 330;

  return (
    <div className={`flex h-full flex-col overflow-y-auto bg-os-bg/65 custom-scrollbar ${isMobile ? 'p-4' : 'p-7'}`}>
      <header className={`mb-4 rounded-3xl border border-os-accent/12 bg-white/[0.055] shadow-xl shadow-black/10 backdrop-blur-xl saturate-[150%] ${isMobile ? 'p-4' : 'p-5'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-os-text-sec/70">Capability map</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-os-text-pri">Skills</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-os-accent/20 bg-os-accent/[0.08]">
            <Shield className="h-5 w-5 text-os-accent" />
          </div>
        </div>
      </header>

      <div className={`grid flex-1 ${isMobile ? 'gap-4' : 'min-h-[360px] gap-5 lg:grid-cols-[1.35fr_0.9fr]'}`}>
        {isMobile && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-os-accent" />
                <span className="text-sm font-semibold text-os-text-pri">Verified credentials</span>
              </div>
              <Award className="h-4 w-4 text-[#F5BF4F]" />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-os-accent/15 bg-os-accent/[0.055] p-4">
                <span className="text-sm font-semibold text-os-accent">{educationHistory[0].course}</span>
                <p className="mt-2 text-xs leading-relaxed text-os-text-sec">
                  Currently completing at {educationHistory[0].schoolShort}
                </p>
              </div>
              <div className="rounded-2xl border border-[#F5BF4F]/15 bg-[#F5BF4F]/[0.055] p-4">
                <span className="text-sm font-semibold text-[#F5BF4F]">Prof. Cyber Security</span>
                <p className="mt-2 text-xs leading-relaxed text-os-text-sec">
                  {certifications[1].issuer.split(' ')[0]} Certified & Active {certifications[0].title}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {skillsRadarMetrics.map((skill) => (
                <div key={skill.subject} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2.5">
                  <span className="text-xs text-os-text-pri/82">{skill.subject}</span>
                  <span className="font-mono text-[11px] text-os-text-sec">{skill.score}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-os-surface/45 p-4 shadow-xl shadow-black/10">
          <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-os-text-sec/55">
            competency scan
          </div>
          <div className="w-full" style={{ height: `${chartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="76%" data={skillsRadarMetrics}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'rgba(224,231,255,0.72)', fontSize: 10, fontFamily: 'Inter, system-ui, sans-serif' }}
                />
                <Radar
                  name={recruiterProfile.name}
                  dataKey="score"
                  stroke="#00D9C0"
                  fill="#00D9C0"
                  fillOpacity={0.14}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {!isMobile && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-os-accent" />
              <span className="text-sm font-semibold text-os-text-pri">Verified credentials</span>
            </div>
            <Award className="h-4 w-4 text-[#F5BF4F]" />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-os-accent/15 bg-os-accent/[0.055] p-4">
              <span className="text-sm font-semibold text-os-accent">{educationHistory[0].course}</span>
              <p className="mt-2 text-xs leading-relaxed text-os-text-sec">Currently completing at {educationHistory[0].schoolShort}</p>
            </div>
            <div className="rounded-2xl border border-[#F5BF4F]/15 bg-[#F5BF4F]/[0.055] p-4">
              <span className="text-sm font-semibold text-[#F5BF4F]">Prof. Cyber Security</span>
              <p className="mt-2 text-xs leading-relaxed text-os-text-sec">{certifications[1].issuer.split(' ')[0]} Certified & Active {certifications[0].title}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {skillsRadarMetrics.map((skill) => (
              <div key={skill.subject} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2.5">
                <span className="text-xs text-os-text-pri/82">{skill.subject}</span>
                <span className="font-mono text-[11px] text-os-text-sec">{skill.score}</span>
              </div>
            ))}
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
