import { Mail, ExternalLink } from 'lucide-react';

export default function ContactInfo() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-6 bg-os-bg/50">
      <div className="w-20 h-20 rounded-2xl bg-os-accent/10 border border-os-accent/30 flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.1)]">
        <Mail className="text-os-accent w-10 h-10" />
      </div>
      
      <div className="space-y-4 max-w-md">
        <h2 className="text-os-text-pri text-xl font-bold tracking-tight">Initiate Connection</h2>
        <p className="text-os-text-sec text-sm leading-relaxed">
          Thanks for being interested! My official email is <span className="text-os-accent font-mono">syedzrk1000@gmail.com</span>. 
          Looking forward to getting in touch!
        </p>
      </div>

      <a 
        href="mailto:syedzrk1000@gmail.com"
        className="flex items-center gap-2 px-6 py-3 bg-os-accent text-os-bg font-bold rounded-lg hover:brightness-110 transition-all group"
      >
        <span>SEND_EMAIL</span>
        <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      <div className="pt-8 text-[10px] text-os-text-sec/40 font-mono tracking-widest uppercase">
        // secure_channel_established //
      </div>
    </div>
  );
}
