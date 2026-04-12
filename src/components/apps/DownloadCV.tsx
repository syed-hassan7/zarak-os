import { FileDown, ShieldCheck, Download } from 'lucide-react';

export default function DownloadCV() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/Syed_Zarak_Hassan_CV_2026.pdf';
    link.download = 'Syed_Zarak_Hassan_CV_2026.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-8 bg-os-bg/50">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-os-warn/10 border border-os-warn/30 flex items-center justify-center">
          <FileDown className="text-os-warn w-12 h-12" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-os-bg border border-os-border p-1.5 rounded-lg">
          <ShieldCheck className="text-os-accent w-5 h-5" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-sm">
        <h2 className="text-os-text-pri text-lg font-bold uppercase tracking-widest">Document Retrieval</h2>
        <p className="text-os-text-sec text-xs leading-relaxed font-mono">
          Clicking the button below will download the most up-to-date version of my professional CV.
          <br />
          <span className="text-os-warn/70 text-[10px] mt-2 block">VERIFICATION_STATUS: SIGNED_AND_ENCRYPTED</span>
        </p>
      </div>

      <button 
        onClick={handleDownload}
        className="flex items-center gap-3 px-8 py-4 bg-os-warn text-os-bg font-black rounded-sm hover:brightness-110 transition-all group uppercase tracking-tighter"
      >
        <Download size={20} />
        <span>DOWNLOAD_CV.PDF</span>
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs pt-4">
        <div className="border border-os-border/50 p-2 rounded bg-os-surface/30">
          <div className="text-[9px] text-os-text-sec/50 uppercase">Size</div>
          <div className="text-[11px] text-os-text-pri font-mono">116 KB</div>
        </div>
        <div className="border border-os-border/50 p-2 rounded bg-os-surface/30">
          <div className="text-[9px] text-os-text-sec/50 uppercase">Format</div>
          <div className="text-[11px] text-os-text-pri font-mono">PDF / A4</div>
        </div>
      </div>
    </div>
  );
}
