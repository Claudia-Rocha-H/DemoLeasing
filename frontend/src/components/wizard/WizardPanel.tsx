import type { ReactNode } from "react";

type WizardPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function WizardPanel({ title, description, children }: WizardPanelProps) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black tracking-tight text-[var(--heading)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}
