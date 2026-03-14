import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="space-y-2 rounded border border-slate-800 bg-slate-900/60 p-3">
      <h3 className="text-xs uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

export default DetailSection;

