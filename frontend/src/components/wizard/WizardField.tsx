import type { ReactNode } from "react";

type WizardFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
};

export function WizardField({ label, htmlFor, hint, children }: WizardFieldProps) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
