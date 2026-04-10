import type { WizardStep } from "../../models/wizardModel";

type WizardStepBarProps = {
  step: WizardStep;
};

export function WizardStepBar({ step }: WizardStepBarProps) {
  const items = [
    { id: 1, label: "1. Seleccion" },
    { id: 2, label: "2. Informacion" },
    { id: 3, label: "3. Confirmacion" }
  ] as const;

  return (
    <div className="space-y-2">
      <p className="text-center text-2xl font-black tracking-tight text-[var(--heading)]">Como radicar tu solicitud?</p>
      <div className="mx-auto w-full max-w-4xl overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1">
        <div className="flex min-w-[640px] items-center gap-1">
          {items.map((item) => {
            const isCurrent = item.id === step;
            const isDone = item.id < step;

            return (
              <div
                key={item.id}
                className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                  isCurrent
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : isDone
                      ? "bg-[var(--surface)] text-[var(--heading)]"
                      : "text-[var(--muted)]"
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
