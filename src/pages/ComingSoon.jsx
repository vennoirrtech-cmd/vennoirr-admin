import { Hammer } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] p-10 text-center flex flex-col items-center max-w-sm w-full">
        <div className="h-12 w-12 bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center justify-center mb-5 shrink-0">
          <Hammer size={20} strokeWidth={1.5} />
        </div>
        <h2 className="text-[14px] font-semibold text-[var(--ink)] uppercase tracking-[0.04em] mb-3">
          Coming Soon
        </h2>
        <div className="w-8 h-px bg-[var(--border)] mb-3"></div>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed font-medium">
          This section of the operations console is currently being built. Check back in a future update.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
