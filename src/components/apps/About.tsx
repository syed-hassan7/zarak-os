import { ExternalLink, Terminal, Mail, Github, Linkedin, AppWindow } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const links = [
    { label: 'GitHub', value: 'github.com/darkyzowo', url: 'https://github.com/darkyzowo', icon: Github },
    { label: 'LinkedIn', value: 'in/zarak-hassan7', url: 'https://linkedin.com/in/zarak-hassan7', icon: Linkedin },
    { label: 'Tool', value: 'venderscope.vercel.app', url: 'https://venderscope.vercel.app', icon: AppWindow },
    { label: 'Email', value: 'syedzrk1000@gmail.com', url: 'mailto:syedzrk1000@gmail.com', icon: Mail },
  ];

  return (
    <div className="flex flex-col h-full bg-os-surface font-mono overflow-y-auto custom-scrollbar relative">
      <div className="absolute inset-0 bg-linear-to-br from-os-accent/5 to-os-warn/5 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-3 p-8 border-b border-os-border/50 bg-os-bg/50">
        <div className="w-12 h-12 rounded bg-os-chrome border border-os-border flex items-center justify-center">
           <Terminal className="text-os-accent w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-os-text-pri tracking-widest uppercase">Operator_Profile</h1>
          <p className="text-[10px] text-os-text-sec tracking-[0.2em] uppercase mt-1">Classification: LEVEL_ZERO // READ_ONLY</p>
        </div>
      </div>

      <div className="p-8 space-y-10 flex-1 relative z-10">
        
        {/* Bio Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-os-warn rotate-45" />
            <h2 className="text-os-text-pri text-xs uppercase tracking-widest font-bold">Identity Details</h2>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-y-3 text-[13px]">
            <span className="text-os-text-sec uppercase tracking-widest text-[10px] py-0.5">Name</span>
            <span className="text-os-text-pri font-bold">Syed Zarak Hassan</span>
            
            <span className="text-os-text-sec uppercase tracking-widest text-[10px] py-0.5">Location</span>
            <span className="text-os-text-pri">Nottingham, England <span className="text-os-accent text-[10px] ml-2 px-1.5 py-0.5 bg-os-accent/10 rounded uppercase">Open to reloc.</span></span>
            
            <span className="text-os-text-sec uppercase tracking-widest text-[10px] py-0.5">Current</span>
            <span className="text-os-text-pri text-sm">
                Compliance Analyst @ Thrive Learning <br/>
                <span className="text-os-text-sec text-xs">MSc Cybersecurity, Nottingham Trent University (2026)</span>
            </span>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-os-accent rotate-45" />
            <h2 className="text-os-text-pri text-xs uppercase tracking-widest font-bold">Objective</h2>
          </div>
          <div className="text-os-text-pri/80 text-[13px] leading-relaxed max-w-2xl bg-os-chrome/30 p-5 rounded border-l-2 border-os-accent/50">
            I build things that make compliance less painful and risk more visible. <span className="text-os-text-pri font-bold">VenderScope</span> replaces annual vendor audits with 24/7 threat intelligence. My dissertation is investigating whether diagrams actually help auditors understand complex systems — spoiler: they do.
          </div>
          <div className="text-xs text-os-warn mt-2 tracking-wide uppercase">
            Available for: GRC roles · InfoSec · client-facing security · freelance
          </div>
        </div>

        {/* Links Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-os-danger rotate-45" />
            <h2 className="text-os-text-pri text-xs uppercase tracking-widest font-bold">Secure Links</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map((link, idx) => (
              <motion.a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col p-4 bg-os-chrome/30 border border-os-border/50 hover:border-os-accent hover:bg-os-accent/5 transition-all rounded-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-os-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-os-text-sec group-hover:text-os-accent transition-colors">
                     <link.icon className="w-4 h-4" />
                     <span className="text-[10px] uppercase tracking-widest">{link.label}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-os-text-sec opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all group-hover:text-os-accent" />
                </div>
                <div className="text-os-text-pri text-[13px] font-bold mt-1 group-hover:pl-1 transition-all">
                  {link.value}
                </div>
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
