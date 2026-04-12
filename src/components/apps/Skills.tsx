import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, Award } from 'lucide-react';

const data = [
  { subject: 'GRC Frameworks', A: 95, evidence: "ISO 27001, ISO 9001, Cyber Essentials" },
  { subject: 'Third-Party Risk', A: 92, evidence: "Vanta, 50+ audits, DPA Tracking" },
  { subject: 'Endpoint Security', A: 88, evidence: "Kandji (MDM migration), Pulseway" },
  { subject: 'Security Ops', A: 80, evidence: "IAM, IR, Vulnerability Mgmt" },
  { subject: 'Data Privacy', A: 85, evidence: "GDPR, Stakeholder Management" },
  { subject: 'SIEM & Network', A: 75, evidence: "Splunk, Chronicle, Suricata, Wireshark" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-os-surface border border-os-accent p-3 shadow-xl">
        <p className="text-os-accent text-[12px] font-bold mb-1">{payload[0].payload.subject}</p>
        <p className="text-os-text-pri text-[11px] font-mono">{payload[0].payload.evidence}</p>
      </div>
    );
  }
  return null;
};

export default function Skills() {
  return (
    <div className="h-full flex flex-col p-6 items-center justify-center">
      <div className="text-os-text-sec text-[11px] font-mono mb-4">
        competency_scan.exe
      </div>
      
      <div className="w-full h-[310px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#21273A" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#4B9EBF', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
            />
            <Radar
              name="Syed Zarak Hassan"
              dataKey="A"
              stroke="#00D9C0"
              fill="#00D9C0"
              fillOpacity={0.12}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 w-full bg-os-surface/30 border border-os-border/50 rounded-lg p-4">
        <div className="text-[10px] text-os-text-sec uppercase tracking-widest mb-3 flex items-center justify-between border-b border-os-border/50 pb-2">
           <div className="flex items-center gap-2">
             <Shield className="w-3 h-3 text-os-accent" />
             <span>Verified Credentials</span>
           </div>
           <Award className="w-3 h-3 text-[#F5BF4F]" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-[10px] text-os-text-pri font-mono">
          <div className="flex flex-col gap-1 border-l border-os-accent/30 pl-2">
            <span className="text-os-accent font-bold">MSc Cyber Security</span>
            <span className="text-os-text-sec/80 leading-tight">Currently completing at Nottingham Trent Uni</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-[#F5BF4F]/30 pl-2">
            <span className="text-[#F5BF4F] font-bold">Prof. Cyber Security</span>
            <span className="text-os-text-sec/80 leading-tight">Google Certified & Active SOC Member</span>
          </div>
        </div>
      </div>
    </div>
  );
}
