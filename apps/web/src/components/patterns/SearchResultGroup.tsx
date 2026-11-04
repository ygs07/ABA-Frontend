import { ReactNode } from 'react';

export function SearchResultGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-text-muted">{title}</p>
      {children}
    </div>
  );
}
