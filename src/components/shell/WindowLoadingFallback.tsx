export default function WindowLoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-os-bg/70 font-mono">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-os-text-sec">
        <div className="h-2 w-2 rounded-full bg-os-accent shadow-[0_0_18px_rgba(45,212,191,0.45)] motion-safe:animate-pulse" />
        <span>Loading module</span>
      </div>
    </div>
  );
}
